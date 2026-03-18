import { useEffect, useState } from "react";

export const LoadingScreen = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? "" : prev + ".");
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white">
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_center,var(--brand-100),transparent_70%)]" />

            <div className="relative flex flex-col items-center">
                {/* Animated Rings */}
                <div className="absolute h-32 w-32 rounded-full border border-brand-200 animate-[spin_3s_linear_infinite]" />
                <div className="absolute h-40 w-40 rounded-full border border-dashed border-brand-100 animate-[spin_6s_linear_reverse_infinite]" />

                {/* Pulsing Core */}
                <div className="relative h-24 w-24 bg-white shadow-2xl flex items-center justify-center border border-brand-50 animate-pulse">
                    <img src="/assets/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
                </div>

                {/* Technical Text */}
                <div className="mt-12 text-center space-y-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-600 animate-pulse">
                        System Calibrating{dots}
                    </h3>
                    <div className="flex items-center gap-1.5 justify-center">
                        <span className="h-1 w-8 bg-brand-500 animate-slideInLeft" />
                        <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Secure Protocol v2.4</span>
                        <span className="h-1 w-8 bg-brand-500 animate-slideInRight" />
                    </div>
                </div>
            </div>

            {/* Industrial Corners */}
            <div className="absolute top-8 left-8 h-4 w-4 border-t-2 border-l-2 border-brand-400" />
            <div className="absolute top-8 right-8 h-4 w-4 border-t-2 border-r-2 border-brand-400" />
            <div className="absolute bottom-8 left-8 h-4 w-4 border-b-2 border-l-2 border-brand-400" />
            <div className="absolute bottom-8 right-8 h-4 w-4 border-b-2 border-r-2 border-brand-400" />
        </div>
    );
};
