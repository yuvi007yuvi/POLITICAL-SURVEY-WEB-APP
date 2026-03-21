import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    gpsLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    photoUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Verified", "Flagged"],
      default: "Verified"
    },
    deviceName: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ gpsLocation: "2dsphere" });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
