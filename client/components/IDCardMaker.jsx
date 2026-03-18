import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, ShieldCheck, User, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export const IDCardMaker = ({ user, onClose }) => {
    const cardRef = useRef(null);

    // Protocol: High-Fidelity Data Orchestration for QR
    const qrData = JSON.stringify({
        org: "POLITICAL SOCH",
        id: user.employeeId || `ADMIN-${user.id?.slice(-4).toUpperCase() || '88X'}`,
        name: user.name,
        role: user.role?.name || "Personnel",
        issued: new Date().toLocaleDateString('en-GB')
    });

    const downloadPDF = async () => {
        if (!cardRef.current) return;

        // Protocols: Image Synchronization Lifecycle
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
        pdf.save(`${user?.name || "User"}_ID_Card.pdf`);
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white shadow-[0_0_100px_rgba(0,0,0,0.7)] w-full max-w-sm rounded-none overflow-hidden animate-slideUp border border-slate-800/10">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80">
                    <div>
                        <h3 className="text-[12px] font-black text-slate-950 uppercase tracking-[0.2em]">Credential Control</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Physical Issuance Mode</p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-rose-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 flex flex-col items-center gap-10">
                    {/* Portrait ID Card - Data Enriched Model */}
                    <div
                        ref={cardRef}
                        className="w-[204px] h-[321px] bg-white border border-slate-950/10 shadow-2xl relative flex flex-col overflow-hidden"
                        style={{ width: '204px', height: '321px' }}
                    >
                        {/* High-Fidelity Header */}
                        <div className="bg-slate-950 p-5 pt-8 pb-16 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 rotate-45 translate-x-8 -translate-y-8" />
                            
                            <div className="flex flex-col items-center gap-4 relative z-50">
                                <div className="h-12 w-12 bg-white p-2 shadow-2xl border border-white/20 flex items-center justify-center">
                                    <img 
                                        src="/assets/logo.png" 
                                        alt="Logo" 
                                        className="h-full w-full object-contain"
                                        crossOrigin="anonymous" 
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1.5">Political Soch</div>
                                    <div className="text-[6px] font-black text-brand-500 uppercase tracking-[0.4em]">Official Credential</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile & Identity Stratigraphy */}
                        <div className="flex flex-col items-center -mt-8 relative z-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-slate-950 shadow-2xl" style={{ margin: '-5px' }} />
                                <div className="h-28 w-28 bg-white p-1 relative z-10">
                                    <div className="h-full w-full bg-slate-100 overflow-hidden border border-slate-200">
                                        {user.profilePhoto ? (
                                            <img
                                                src={user.profilePhoto}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-200">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-brand-600 text-white text-[7px] font-black px-4 py-2 shadow-2xl uppercase tracking-[0.2em] z-20 whitespace-nowrap">
                                    Verified Personnel
                                </div>
                            </div>

                            <div className="mt-10 text-center w-full px-5 pb-6">
                                <h4 className="text-[14px] font-black text-slate-950 uppercase tracking-[0.05em] leading-none mb-2">{user.name}</h4>
                                <p className="text-[9px] font-bold text-brand-600 uppercase tracking-[0.2em] mb-7">{user.role?.name || "Personnel"}</p>

                                <div className="space-y-2.5 w-full border-t border-slate-100 pt-5">
                                    <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-[0.1em] text-slate-400">
                                        <span>Security ID</span>
                                        <span className="text-slate-950 font-black">{user.employeeId || `ADMIN-${user.id?.slice(-4).toUpperCase() || '88X'}`}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-[0.1em] text-slate-400">
                                        <span>Issue Date</span>
                                        <span className="text-slate-950 font-black">{new Date().toLocaleDateString('en-GB')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secure Footer Suite - Dynamic QR Induction */}
                        <div className="mt-auto bg-slate-950 p-4 pb-5 flex items-center justify-between z-10 border-t border-white/5">
                            <div className="space-y-2 text-left">
                                <div className="flex gap-[2.5px]">
                                    {[2, 1, 4, 3, 2, 5, 2, 3].map((w, i) => (
                                        <div key={i} className="h-4 bg-white/10" style={{ width: `${w}px` }} />
                                    ))}
                                </div>
                                <div className="text-[5px] font-bold text-slate-500 uppercase tracking-[0.3em]">SECURE ACCESS NODE #PS24</div>
                            </div>
                            <div className="bg-white p-1.5 shadow-2xl border border-white/20">
                                <QRCodeCanvas 
                                    value={qrData}
                                    size={24}
                                    level="L"
                                    includeMargin={false}
                                    style={{ display: 'block' }}
                                />
                            </div>
                        </div>

                        {/* Top Protocol Strip */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-600 z-[100] shadow-md" />
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={downloadPDF}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl active:scale-95 group"
                        >
                            <Download size={15} className="group-hover:translate-y-0.5 transition-transform" />
                            Finalize & Download ID
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-950 hover:border-slate-950 transition-all"
                        >
                            Return to Hub
                        </button>
                    </div>
                </div>

                <div className="bg-slate-100/50 p-8 border-t border-slate-100 flex items-start gap-4">
                    <ShieldCheck size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
                        Property of <span className="text-slate-950 font-black">POLITICAL SOCH</span>. Unauthorized reproduction is a status-alpha violation under protocol 88-X. Return if found.
                    </p>
                </div>
            </div>
        </div>
    );
};
