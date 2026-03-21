import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { Camera, ShieldCheck, UserCheck, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.jsx";
import { attendanceService } from "../services/attendanceService.js";
import { useNavigate } from "react-router-dom";

export const FaceEnrollmentPage = () => {
    const { session, refreshSession } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollStep, setEnrollStep] = useState(1); // 1: Info, 2: Camera, 3: Success
    const [stream, setStream] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                await attendanceService.loadModels();
                setModelsLoaded(true);
            } catch (err) {
                toast.error("Biometric initialization failed");
            }
        };
        load();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(stream);
            setIsCapturing(true);
            setEnrollStep(2);
        } catch (err) {
            toast.error("Camera access required for biometrics");
        }
    };

    useEffect(() => {
        if (enrollStep === 2 && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [enrollStep, stream]);

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                toast.error("Face not clear. Please ensure good lighting.");
                return;
            }

            await attendanceService.registerFace(detection.descriptor);
            await refreshSession();
            setEnrollStep(3);
            toast.success("Biometric Profile Created!");
            
            // Clean up camera
            if (videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        } catch (err) {
            toast.error("Enrollment failed. Try again.");
        } finally {
            setIsEnrolling(false);
        }
    };

    if (!modelsLoaded) {
        return (
            <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
                <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Loading secure biometrics...</p>
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto py-12 px-4">
            <div className="glass-panel p-12 bg-white border-slate-100 shadow-2xl rounded-[48px] overflow-hidden relative">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                
                <div className="relative space-y-12">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-500 shadow-inner">
                            <ShieldCheck size={40} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Biometric Setup</h2>
                            <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Connect your unique facial features to your identity for secure, hands-free attendance.
                            </p>
                        </div>
                    </div>

                    {enrollStep === 1 && (
                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-10">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="h-10 w-10 text-brand-500 bg-white shadow-sm flex items-center justify-center rounded-xl">
                                        <Camera size={20} />
                                    </div>
                                    <h4 className="font-bold text-slate-900">Good Lighting</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Ensure your face is evenly lit. Avoid strong shadows or bright backlights.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-10 w-10 text-brand-500 bg-white shadow-sm flex items-center justify-center rounded-xl">
                                        <UserCheck size={20} />
                                    </div>
                                    <h4 className="font-bold text-slate-900">Front View</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Keep your expression neutral and face directly at the camera.</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={startCamera}
                                className="w-full h-16 rounded-2xl bg-brand-500 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-600 hover:-translate-y-1 transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98]"
                            >
                                Start Face Capture
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {enrollStep === 2 && (
                        <div className="space-y-8">
                            <div className="relative max-w-md mx-auto aspect-square rounded-[40px] bg-slate-100 overflow-hidden border-[8px] border-white shadow-2xl">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    muted 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center">
                                    <div className="text-center text-white space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Don't move...</p>
                                        <p className="text-[10px] font-bold opacity-60">Scanning points</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleEnroll}
                                disabled={isEnrolling}
                                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-1 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                            >
                                {isEnrolling ? <Loader2 className="animate-spin" /> : <UserCheck size={20} />}
                                {isEnrolling ? "Processing Face..." : "Register Biometrics"}
                            </button>
                        </div>
                    )}

                    {enrollStep === 3 && (
                        <div className="text-center space-y-10 py-8">
                            <div className="mx-auto w-32 h-32 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-full animate-bounce">
                                <CheckCircle2 size={64} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Enrolled!</h3>
                                <p className="text-sm font-medium text-slate-400">Your face is now your ID. You can start marking attendance.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/attendance')}
                                className="h-14 px-12 rounded-2xl bg-brand-500 text-white font-bold uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
                            >
                                Go to Attendance
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-6">
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${enrollStep >= i ? 'bg-brand-500' : 'bg-slate-100'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                <ShieldCheck size={14} />
                End-to-End Encrypted Biometrics
            </div>
        </section>
    );
};
