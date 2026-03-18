import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Mail, Phone, QrCode, ShieldCheck, User } from "lucide-react";

export const IDCardMaker = ({ user, onClose }) => {
    const cardRef = useRef(null);

    const downloadPDF = async () => {
        if (!cardRef.current) return;

        const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: [85, 54] // Standard ID card size
        });

        pdf.addImage(imgData, "PNG", 0, 0, 85, 54);
        pdf.save(`${user?.name || "User"}_ID_Card.pdf`);
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">ID Card Generator</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Professional Credential Issuance</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* ID Card Display Area */}
                    <div className="flex justify-center">
                        <div
                            ref={cardRef}
                            className="w-[340px] h-[216px] bg-white border border-slate-200 shadow-xl relative overflow-hidden flex"
                        >
                            {/* Accent Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600" />

                            {/* Left Section (Profile) */}
                            <div className="w-1/2 p-6 flex flex-col items-center justify-center border-r border-slate-50 relative">
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 opacity-40">
                                    <ShieldCheck size={12} className="text-brand-600" />
                                    <span className="text-[7px] font-black uppercase tracking-tighter text-slate-800">Political Soch</span>
                                </div>

                                <div className="h-24 w-24 bg-slate-100 border-2 border-brand-50 mb-3 overflow-hidden shadow-inner">
                                    {user.profilePhoto ? (
                                        <img
                                            src={user.profilePhoto}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate w-32">{user.name}</h4>
                                    <p className="text-[8px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">{user.role?.name || "Member"}</p>
                                </div>
                            </div>

                            {/* Right Section (Details) */}
                            <div className="w-1/2 bg-slate-50/30 p-6 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Employee ID</span>
                                        <p className="text-[10px] font-black text-slate-800">{user.employeeId || "TEMP-8822"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Office Registry</span>
                                        <p className="text-[9px] font-bold text-slate-600">Central Command Hub</p>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="h-8 w-8 bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                            <QrCode size={18} />
                                        </div>
                                        <div className="text-[6px] font-medium text-slate-400 uppercase leading-[1.4]">
                                            Scan for security<br />verification protocol
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex gap-1.5 opacity-60">
                                        <Mail size={8} className="text-slate-400" />
                                        <Phone size={8} className="text-slate-400" />
                                    </div>
                                    <p className="text-[6px] font-black italic text-brand-500 opacity-40">AUTHORIZED PERSONNEL ONLY</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={downloadPDF}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-brand-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                        >
                            <Download size={14} />
                            Download ID Card (PDF)
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 py-4 border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>

                <div className="bg-amber-50 p-4 border-t border-amber-100">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed text-center">
                        This document is a functional security credential. Ensure all demographic data is visually accurate before physical issuance.
                    </p>
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
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="inherit"
        className={className}
    >
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
