import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

export const registerFace = asyncHandler(async (req, res) => {
  const { descriptor } = req.body;

  if (!descriptor || !Array.isArray(descriptor)) {
    throw new ApiError(400, "Valid face descriptor is required");
  }

  await User.findByIdAndUpdate(req.user._id, {
    faceDescriptor: descriptor
  });

  res.json({
    success: true,
    message: "Face biometric enrolled successfully"
  });
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { type, gpsLocation, deviceName } = req.body;
  const location = typeof gpsLocation === "string" ? JSON.parse(gpsLocation) : gpsLocation;

  if (!type) {
    throw new ApiError(400, "Attendance type (IN/OUT) is required");
  }
  if (!location || (location.latitude === undefined && location.longitude === undefined)) {
    throw new ApiError(400, "Valid GPS coordinates (latitude & longitude) are required");
  }

  const lat = Number(location.latitude);
  const lng = Number(location.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    throw new ApiError(400, `Invalid coordinate numbers: lat=${location.latitude}, lng=${location.longitude}`);
  }

  const geoJson = {
    type: "Point",
    coordinates: [lng, lat]
  };

  // Daily Punch restriction: Check if user already marked this type today
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const existingPunch = await Attendance.findOne({
    userId: req.user._id,
    type,
    timestamp: { $gte: todayStart, $lte: todayEnd }
  });

  if (existingPunch) {
    throw new ApiError(400, `You have already ${type === 'IN' ? 'Checked-In' : 'Checked-Out'} for today.`);
  }

  // If checking out, must have checked in first
  if (type === 'OUT') {
    const hasIn = await Attendance.findOne({
      userId: req.user._id,
      type: 'IN',
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });
    if (!hasIn) {
      throw new ApiError(400, "You must Check-In before you can Check-Out.");
    }
  }

  let photoUrl = "";
  if (req.files && req.files.photo) {
    const uploaded = await uploadBufferToCloudinary({
      buffer: req.files.photo[0].buffer,
      folder: "political-soch/attendance"
    });
    photoUrl = uploaded.secure_url;
  }

  const attendance = await Attendance.create({
    userId: req.user._id,
    type,
    gpsLocation: geoJson,
    photoUrl,
    deviceName,
    timestamp: new Date()
  });

  res.status(201).json({
    success: true,
    message: `Attendance ${type} marked successfully`,
    data: attendance
  });
});

export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId } = req.query;
  const filter = {};
  
  // Administrators can see all, users only their own
  if (req.user.role?.key !== "super_admin" && req.user.role?.key !== "admin") {
    filter.userId = req.user._id;
  } else if (userId) {
    filter.userId = userId;
  }

  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = end;
    }
  }

  const attendance = await Attendance.find(filter)
    .populate("userId", "name email employeeId role")
    .sort({ timestamp: -1 })
    .limit(500);

  res.json({
    success: true,
    data: attendance
  });
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const now = date ? new Date(date) : new Date();
  
  const getRange = (start, end) => ({
    timestamp: { $gte: start, $lte: end }
  });

  // Target Date Range
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));
  
  // Yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  // This Month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Last Month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const totalUsers = await User.countDocuments({ status: "active" });

  const getPresentCount = async (start, end) => {
    const present = await Attendance.distinct("userId", {
      type: "IN",
      timestamp: { $gte: start, $lte: end }
    });
    return present.length;
  };

  const todayPresent = await getPresentCount(todayStart, todayEnd);
  const yesterdayPresent = await getPresentCount(yesterdayStart, yesterdayEnd);
  
  // For Monthly %
  const getMonthlyStats = async (start, end) => {
    // Basic implementation: Average daily attendance % 
    // In a real app, this would be more complex (excluding weekends/holidays)
    const records = await Attendance.aggregate([
      { $match: { type: "IN", timestamp: { $gte: start, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          presentCount: { $addToSet: "$userId" }
      }},
      { $project: { count: { $size: "$presentCount" } } }
    ]);
    
    if (records.length === 0) return 0;
    const avgPresentPerDay = records.reduce((acc, curr) => acc + curr.count, 0) / records.length;
    return Math.round((avgPresentPerDay / (totalUsers || 1)) * 100);
  };

  const thisMonthPercent = await getMonthlyStats(thisMonthStart, todayEnd);
  const lastMonthPercent = await getMonthlyStats(lastMonthStart, lastMonthEnd);

  // Get Today's Check-ins for the Map/Activity Feed
  const todayCheckins = await Attendance.find({
    timestamp: { $gte: todayStart, $lte: todayEnd }
  })
  .populate("userId", "name employeeId role profilePhoto")
  .sort({ timestamp: -1 });

  res.json({
    success: true,
    data: {
      today: { present: todayPresent, total: totalUsers },
      yesterday: { present: yesterdayPresent, total: totalUsers },
      thisMonth: { percent: thisMonthPercent },
      lastMonth: { percent: lastMonthPercent },
      todayCheckins: todayCheckins // New: Actual records for Map/UI
    }
  });
});

export const getAttendanceCalendar = asyncHandler(async (req, res) => {
  const { month, year, zone, ward, search } = req.query;
  const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
  const targetYear = year ? parseInt(year) : new Date().getFullYear();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  // Filter users if zone/ward/search provided
  const userFilter = { status: "active" };
  if (zone) userFilter.zone = zone;
  if (ward) userFilter.ward = ward;
  
  if (search) {
    userFilter.$or = [
      { name: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } }
    ];
  }

  const users = await User.find(userFilter, "name employeeId profilePhoto ward zone designation")
    .populate("role", "name");

  const attendanceRecords = await Attendance.find({
    timestamp: { $gte: startDate, $lte: endDate },
    type: "IN"
  });

  const calendarData = users.map(user => {
    const userRecords = attendanceRecords.filter(r => r.userId.toString() === user._id.toString());
    const days = {};
    
    // Initialize days
    const daysInMonth = endDate.getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const hasRecord = userRecords.some(r => new Date(r.timestamp).getDate() === d);
      days[d] = hasRecord ? "P" : "A"; // P for Present, A for Absent
    }

    return {
      _id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      photoUrl: user.profilePhoto,
      designation: user.designation || user.role?.name,
      ward: user.ward,
      zone: user.zone,
      days
    };
  });

  res.json({
    success: true,
    data: calendarData,
    daysInMonth: endDate.getDate()
  });
});

export const getTodayStatus = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const punches = await Attendance.find({
    userId: req.user._id,
    timestamp: { $gte: todayStart, $lte: todayEnd }
  });

  res.json({
    success: true,
    data: {
      hasIn: punches.some(p => p.type === "IN"),
      hasOut: punches.some(p => p.type === "OUT")
    }
  });
});
