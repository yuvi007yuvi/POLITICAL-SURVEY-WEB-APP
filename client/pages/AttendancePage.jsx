import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as faceapi from "face-api.js";
import { Camera, MapPin, CheckCircle2, AlertCircle, History, UserCheck, LogIn, LogOut, Loader2, ArrowRight, Navigation } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.jsx";
import { attendanceService } from "../services/attendanceService.js";

export const AttendancePage = () => {
    const { session } = useAuth();
    const videoRef = useRef();
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [matchScore, setMatchScore] = useState(0);
    const [verificationStatus, setVerificationStatus] = useState("Idle"); // Idle, Scanning, Matched, Failed
    const [lastHistory, setLastHistory] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState(null);
    const [todayStatus, setTodayStatus] = useState({ hasIn: false, hasOut: false });
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    const userDescriptor = session?.user?.faceDescriptor 
        ? new Float32Array(session.user.faceDescriptor) 
        : null;

    useEffect(() => {
        const load = async () => {
            try {
                await attendanceService.loadModels();
                setModelsLoaded(true);
                getGeoLocation();
                fetchTodayStatus();
            } catch (err) {
                toast.error("Failed to load biometric models");
                console.error(err);
            }
        };
        load();

        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        if (modelsLoaded) {
            startCamera();
        }
    }, [modelsLoaded]);

    const fetchTodayStatus = async () => {
        try {
            setIsLoadingStatus(true);
            const status = await attendanceService.getTodayStatus();
            setTodayStatus(status);
        } catch (err) {
            console.error("Failed to fetch today's status", err);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const getGeoLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setCurrentLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            }),
            (err) => toast.error("Please enable GPS for attendance")
        );
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            setStream(stream);
            setIsCapturing(true);
        } catch (err) {
            toast.error("Camera access denied");
        }
    };

    useEffect(() => {
        if (isCapturing && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCapturing, stream]);

    useEffect(() => {
        let animationFrame;
        let matchCount = 0;

        const loop = async () => {
            if (!isCapturing || !videoRef.current || verificationStatus === "Matched") {
                if (animationFrame) cancelAnimationFrame(animationFrame);
                return;
            }

            try {
                const detection = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection && canvasRef.current && verificationStatus !== "Matched") {
                    const displaySize = { 
                        width: videoRef.current.videoWidth, 
                        height: videoRef.current.videoHeight 
                    };
                    
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext("2d");
                    canvas.width = displaySize.width;
                    canvas.height = displaySize.height;

                    const resizedDetections = faceapi.resizeResults(detection, displaySize);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw landmarks with custom color
                    ctx.strokeStyle = '#14b8a6';
                    ctx.lineWidth = 2;
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                    if (userDescriptor) {
                        const distance = faceapi.euclideanDistance(detection.descriptor, userDescriptor);
                        const score = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
                        setMatchScore(score);

                        if (score > 65) {
                            matchCount++;
                            if (matchCount > 8) { // Increased for stability
                                setVerificationStatus("Matched");
                                toast.success("Identity Verified Automatically!");
                                // Stop drawing landmarks once matched
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                return; // Exit loop immediately
                            }
                        } else {
                            matchCount = 0;
                        }
                    }
                } else if (canvasRef.current && verificationStatus !== "Matched") {
                    const ctx = canvasRef.current.getContext("2d");
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    setMatchScore(0);
                }
            } catch (err) {
                console.error("Detection error:", err);
            }

            if (verificationStatus !== "Matched") {
                animationFrame = requestAnimationFrame(loop);
            }
        };

        if (isCapturing && (verificationStatus === "Idle" || verificationStatus === "Scanning")) {
            setVerificationStatus("Scanning");
            loop();
        }

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [isCapturing, verificationStatus, userDescriptor]);

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setIsCapturing(false);
            setVerificationStatus("Idle");
            setMatchScore(0);
        }
    };


    const handleAttendance = async (type) => {
        if (verificationStatus !== "Matched") {
            toast.error("Please verify your identity first");
            return;
        }

        if (!currentLocation) {
            toast.error("GPS location required");
            return;
        }

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
            
            const photoBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            const photoFile = new File([photoBlob], "attendance.jpg", { type: "image/jpeg" });

            await attendanceService.markAttendance({
                type,
                gpsLocation: currentLocation,
                photo: photoFile,
                deviceName: navigator.userAgent
            });

            toast.success(`Successfully ${type === 'IN' ? 'Checked-In' : 'Checked-Out'}`);
            setVerificationStatus("Idle");
            stopCamera();
            fetchTodayStatus();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to mark attendance";
            toast.error(errorMsg);
        }
    };

    if (!modelsLoaded) {
        return (
            <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
                <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Initializing Biometrics...</p>
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto space-y-12 pb-12 px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-brand-600 mb-1">
                        <UserCheck size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest font-outfit">Biometric Portal</p>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">Mark Attendance</h2>
                </div>
                
                <Link 
                    to="/attendance/logs"
                    className="h-12 px-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all font-outfit"
                >
                    <History size={16} className="text-brand-500" />
                    Attendance History
                </Link>
            </div>

            <div className="flex flex-col items-center gap-12">
                <div className="w-full max-w-2xl bg-white p-6 border border-slate-100 shadow-2xl rounded-[48px] overflow-hidden">
                    <div className="relative aspect-[4/3] rounded-[36px] bg-slate-900 overflow-hidden flex items-center justify-center group shadow-inner">
                        {!isCapturing ? (
                            <button 
                                onClick={startCamera}
                                className="flex flex-col items-center gap-6 p-16 text-slate-500 hover:text-brand-500 transition-all group-hover:scale-105"
                            >
                                <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center bg-slate-900/50">
                                    <Camera size={44} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activate Secure Camera</p>
                            </button>
                        ) : (
                            <>
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    muted 
                                    className="w-full h-full object-cover grayscale-0 group-hover:grayscale-[0.1] transition-all"
                                />
                                <canvas 
                                    ref={canvasRef}
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                />
                                
                                {verificationStatus === "Scanning" && (
                                    <div className="absolute inset-0 border-[6px] border-brand-500/30 pointer-events-none rounded-[36px]">
                                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-500 shadow-[0_0_20px_#14b8a6] animate-scan" />
                                        
                                        <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                                            <p className="text-[10px] font-bold text-white uppercase tracking-widest font-outfit">
                                                Matching: {matchScore}%
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                                    {verificationStatus === "Matched" && (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="bg-emerald-500/10 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-emerald-500/20 flex items-center gap-3 animate-fadeIn">
                                                <CheckCircle2 size={20} className="text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verification Active</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                {(!todayStatus.hasIn) && (
                                                    <button 
                                                        onClick={() => handleAttendance("IN")}
                                                        className="h-16 px-10 rounded-2xl bg-brand-500 text-white shadow-2xl shadow-brand-500/40 flex items-center gap-4 hover:-translate-y-1 transition-all group active:scale-95"
                                                    >
                                                        <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />
                                                        <span className="text-sm font-black uppercase tracking-widest">Check In</span>
                                                    </button>
                                                )}
                                                {(todayStatus.hasIn && !todayStatus.hasOut) && (
                                                    <button 
                                                        onClick={() => handleAttendance("OUT")}
                                                        className="h-16 px-10 rounded-2xl bg-rose-500 text-white shadow-2xl shadow-rose-500/40 flex items-center gap-4 hover:-translate-y-1 transition-all group active:scale-95"
                                                    >
                                                        <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                                                        <span className="text-sm font-black uppercase tracking-widest">Check Out</span>
                                                    </button>
                                                )}
                                                {(todayStatus.hasIn && todayStatus.hasOut) && (
                                                    <div className="h-16 px-8 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-pulse">
                                                        <CheckCircle2 size={20} />
                                                        Attendance Complete
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={stopCamera}
                                    className="absolute top-8 right-8 h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-rose-500 hover:scale-110 transition-all shadow-lg"
                                >
                                    <AlertCircle size={22} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
                    <div className={`p-6 rounded-[32px] border transition-all flex items-center gap-4 ${currentLocation ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900 shadow-lg animate-pulse'}`}>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${currentLocation ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Field Location</p>
                            <p className="text-sm font-black font-outfit">{currentLocation ? 'GPS Sync Active' : 'Waiting for GPS...'}</p>
                        </div>
                    </div>
                    <div className={`p-6 rounded-[32px] border transition-all flex items-center gap-4 ${userDescriptor ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${userDescriptor ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'}`}>
                            {userDescriptor ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Biometric ID</p>
                            <p className="text-sm font-black font-outfit">{userDescriptor ? 'Face Enrolled' : 'Setup Required'}</p>
                        </div>
                    </div>
                </div>

                {!userDescriptor && (
                    <div className="w-full max-w-2xl bg-amber-50 border border-amber-200/50 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-3xl bg-white text-amber-500 shadow-md">
                            <AlertCircle size={32} />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h4 className="text-lg font-black text-amber-900 font-outfit">Biometrics Required</h4>
                            <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
                                Your facial ID hasn't been linked yet. This is required to mark attendance in our high-security portal.
                            </p>
                        </div>
                        <Link 
                            to="/attendance/setup"
                            className="h-14 px-8 rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 flex items-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-amber-600 hover:-rotate-1 transition-all active:scale-95 font-outfit"
                        >
                            Enroll Now
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};
