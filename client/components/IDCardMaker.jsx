import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Mail, MapPin, Phone, QrCode, ShieldCheck, User } from "lucide-react";

export const IDCardMaker = ({ user, onClose }) => {
    const cardRef = useRef(null);

    const downloadPDF = async () => {
        if (!cardRef.current) return;

        const canvas = await html2canvas(cardRef.current, {
            scale: 4, // Higher scale for extreme precision
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [54, 85]
        });

        pdf.addImage(imgData, "PNG", 0, 0, 54, 85);
        pdf.save(`${user?.name || "User"}_ID_Card.pdf`);
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white shadow-[0_0_60px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden animate-slideUp border border-slate-800/20">
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.2em]">Credential Control</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-0.5">Physical Issuance Mode</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-950 transition-all duration-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center gap-10">
                    {/* Portrait ID Card */}
                    <div
                        ref={cardRef}
                        className="w-[204px] h-[321px] bg-white border border-slate-950/20 shadow-2xl relative overflow-hidden flex flex-col"
                        style={{ width: '204px', height: '321px', minWidth: '204px', minHeight: '321px' }}
                    >
                        {/* High-Contrast Header */}
                        <div className="bg-slate-950 p-4 pt-6 pb-10 relative overflow-hidden">
                            {/* Simple Geometric Accents - No complex transforms */}
                            <div className="absolute top-0 right-0 w-12 h-12 bg-brand-500/10" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 bg-brand-500/10" />

                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <div className="h-14 w-14 bg-white p-2.5 shadow-xl border border-white/20">
                                    <img src="/assets/logo.png" alt="Logo" className="h-full w-full object-contain" />
                                </div>
                                <div className="text-center">
                                    <div className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1.5">Political Soch</div>
                                    <div className="text-[6px] font-black text-brand-400 uppercase tracking-[0.4em]">Official Identification</div>
                                </div>
                            </div>
                        </div>

                        {/* Background Watermark Pattern */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0"
                            style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }} />

                        {/* Graphical Accent - Bottom Third */}
                        <div className="absolute bottom-24 left-0 w-full h-[1px] bg-slate-100/50 z-0" />

                        {/* Profile Section */}
                        <div className="flex flex-col items-center -mt-8 relative z-10">
                            {/* Profile Photo with Elevated Frame */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-slate-950 shadow-2xl" style={{ margin: '-4px' }} />
                                <div className="h-28 w-28 bg-white p-1 relative z-10">
                                    <div className="h-full w-full bg-slate-50 overflow-hidden relative grayscale-[0.1]">
                                        {user.profilePhoto ? (
                                            <img
                                                src={user.profilePhoto}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-100">
                                                <User size={48} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Verified Badge - Moved slightly higher to avoid cutting */}
                                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-brand-600 text-white text-[7px] font-black px-5 py-2 shadow-2xl uppercase tracking-[0.2em] z-20 whitespace-nowrap">
                                    Verified Personnel
                                </div>
                            </div>

                            {/* Person Identity */}
                            <div className="mt-10 text-center w-full px-4 text-left">
                                <h4 className="text-[15px] font-black text-slate-950 uppercase tracking-[0.02em] leading-none mb-2 text-center">{user.name}</h4>
                                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-[0.2em] text-center">{user.role?.name || "Member"}</p>

                                {/* Info Matrix - Enhanced Contrast and Spacing */}
                                <div className="mt-8 space-y-2 w-full">
                                    <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 px-1">
                                        <span>Security ID</span>
                                        <span className="text-slate-950 font-bold">{user.employeeId || "PS-88220"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest px-1 pt-1">
                                        <span>Issue Date</span>
                                        <span className="text-slate-950 font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* High-Contrast Footer Suite */}
                        <div className="mt-auto bg-slate-50 border-t border-slate-200 flex items-center justify-between p-4 relative z-10">
                            <div className="space-y-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex gap-[1.5px]">
                                        {[3, 1, 4, 2, 5, 2, 3, 4].map((w, i) => (
                                            <div key={i} className="h-4 bg-slate-950" style={{ width: `${w}px` }} />
                                        ))}
                                    </div>
                                    <div className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Auth Registry #9A</div>
                                </div>
                                <div className="h-1.5 w-24 bg-slate-200">
                                    <div className="h-full w-2/3 bg-brand-600" />
                                </div>
                            </div>
                            <div className="bg-white p-1.5 border border-slate-200 shadow-md">
                                <QrCode size={24} className="text-slate-950" strokeWidth={2} />
                            </div>
                        </div>

                        {/* Top Security Line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600 z-50 shadow-lg" />
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col w-full gap-4">
                        <button
                            onClick={downloadPDF}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl hover:scale-[1.02] active:scale-95 duration-200 group"
                        >
                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                            Finalize & Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] hover:text-slate-950 hover:border-slate-950 transition-all duration-200"
                        >
                            Decline Preview
                        </button>
                    </div>
                </div>

                {/* Secure Disclaimer */}
                <div className="bg-slate-950 p-6 text-left">
                    <div className="flex items-start gap-4">
                        <div className="h-6 w-6 rounded-none bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-brand-900/30">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Property of <span className="text-white font-black">POLITICAL SOCH</span>. Unauthorized use or reproduction is strictly prohibited under protocol 88-X. Return to central hub if found.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const X = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="square"
        strokeLinejoin="inherit"
        className={className}
    >
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
