import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, ShieldCheck, User, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export const IDCardMaker = ({ user, onClose }) => {
    const cardRef = useRef(null);

    const qrData = JSON.stringify({
        org: "POLITICAL SOCH",
        id: user.employeeId || `PS-${user.id?.slice(-4).toUpperCase() || '001'}`,
        name: user.name,
        role: user.role?.name || "Member",
        issued: new Date().toLocaleDateString('en-GB')
    });

    const downloadPDF = async () => {
        if (!cardRef.current) return;

        const images = cardRef.current.getElementsByTagName('img');
        await Promise.all([...images].map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        }));

        const canvas = await html2canvas(cardRef.current, {
            scale: 4, 
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
        pdf.save(`${user?.name || "Member"}_ID_Card.pdf`);
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white shadow-2xl w-full max-w-sm rounded-[40px] overflow-hidden animate-slideUp border border-slate-100">
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">ID Card</p>
                        <h3 className="text-2xl font-bold text-slate-900 font-outfit tracking-tight">Print Ready</h3>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-slate-900 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 flex flex-col items-center gap-10 bg-slate-50/30">
                    {/* Portrait ID Card */}
                    <div
                        ref={cardRef}
                        className="w-[204px] h-[321px] bg-white border border-slate-100 shadow-2xl relative flex flex-col overflow-hidden origin-center scale-[0.85] sm:scale-100 rounded-[20px]"
                        style={{ width: '204px', height: '321px' }}
                    >
                        {/* Header */}
                        <div className="bg-brand-500 p-5 pt-8 pb-16 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rotate-45 translate-x-8 -translate-y-8" />
                            
                            <div className="flex flex-col items-center gap-4 relative z-50">
                                <div className="h-10 w-10 bg-white p-2 rounded-xl shadow-xl flex items-center justify-center">
                                    <img 
                                        src="/assets/logo.png" 
                                        alt="Logo" 
                                        className="h-full w-full object-contain"
                                        crossOrigin="anonymous" 
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1.5">Political Soch</div>
                                    <div className="text-[6px] font-bold text-brand-400 uppercase tracking-widest">Official Member</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex flex-col items-center -mt-10 relative z-10">
                            <div className="relative">
                                <div className="h-28 w-28 bg-white p-1 rounded-[24px] shadow-2xl relative z-10">
                                    <div className="h-full w-full bg-slate-50 overflow-hidden rounded-[20px] border border-slate-100 text-slate-200">
                                        {user.profilePhoto ? (
                                            <img
                                                src={user.profilePhoto}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-brand-500 text-white text-[7px] font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest z-20 whitespace-nowrap">
                                    Verified Member
                                </div>
                            </div>

                            <div className="mt-8 text-center w-full px-5 pb-6">
                                <h4 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight leading-none mb-2">{user.name}</h4>
                                <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-6">{user.role?.name || "Member"}</p>

                                <div className="space-y-2.5 w-full border-t border-slate-50 pt-5 text-left">
                                    <div className="flex justify-between items-center text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Employee ID</span>
                                        <span className="text-slate-900 font-bold">{user.employeeId || `PS-${user.id?.slice(-4).toUpperCase() || '001'}`}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Issue Date</span>
                                        <span className="text-slate-900 font-bold">{new Date().toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Footer */}
                        <div className="mt-auto bg-brand-600 p-4 pb-5 flex items-center justify-between z-10 border-t border-white/5">
                            <div className="space-y-1.5 text-left">
                                 <div className="text-[5px] font-bold text-slate-400 uppercase tracking-widest">POLITICAL SOCH MEMBER</div>
                                 <div className="text-[4px] font-medium text-slate-600 uppercase tracking-widest leading-tight">MEMBER PASS 2024-25</div>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg shadow-xl">
                                <QRCodeCanvas 
                                    value={qrData}
                                    size={24}
                                    level="L"
                                    includeMargin={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={downloadPDF}
                            className="button-primary w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-brand-500/10 active:scale-95 transition-all"
                        >
                            <Download size={16} />
                            Download ID Card
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 border border-slate-100 rounded-2xl text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-900 hover:bg-slate-50 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-50 flex items-start gap-4">
                    <ShieldCheck size={18} className="text-brand-500 flex-shrink-0" />
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                        Property of <span className="text-slate-900 font-bold">POLITICAL SOCH</span>. This card is official identification. If found, please return to any of our offices.
                    </p>
                </div>
            </div>
        </div>
    );
};
