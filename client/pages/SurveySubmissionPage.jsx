import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService.js";
import { reportService } from "../services/reportService.js";
import { 
  ClipboardCheck, 
  MapPin, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Camera,
  Mic
} from "lucide-react";

export const SurveySubmissionPage = () => {
  const { projectId: urlProjectId } = useParams();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || "");
  const [answers, setAnswers] = useState({});
  const [gps, setGps] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Fetch Projects for selection
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list
  });

  // Fetch Current Project Details & Form Definition
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", selectedProjectId],
    queryFn: () => projectService.get(selectedProjectId),
    enabled: !!selectedProjectId
  });

  // Geolocation Capture
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({
          coordinates: [pos.coords.longitude, pos.coords.latitude],
          accuracy: pos.coords.accuracy
        }),
        (err) => console.warn("GPS Access Denied:", err)
      );
    }
  }, []);

  const handleInputChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const formattedAnswers = project.formDefinition.map(field => ({
        fieldId: field.fieldId,
        label: field.label,
        value: answers[field.fieldId] || ""
      }));

      await reportService.submit({
        projectId: selectedProjectId,
        answers: formattedAnswers,
        gpsLocation: gps || { coordinates: [0, 0], accuracy: 0 }
      });

      setStatus({ type: "success", message: "Survey submitted successfully! High five!" });
      setAnswers({});
      setTimeout(() => navigate("/reports"), 2000);
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to submit survey. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedProjectId && projects.length > 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-10 py-10 animate-fadeIn">
        <header className="text-center space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[32px] bg-brand-50 text-brand-500 mb-2">
            <ClipboardCheck size={40} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 font-outfit tracking-tight">New Survey</h2>
          <p className="text-slate-500 font-medium">Select a project to start collecting data</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map(p => (
            <button
              key={p._id}
              onClick={() => setSelectedProjectId(p._id)}
              className="p-8 bg-white border border-slate-100 rounded-[40px] text-left hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <ClipboardCheck size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.status}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit mb-1">{p.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{p.description || "No description provided."}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10 animate-fadeIn overflow-hidden">
      <button 
        onClick={() => setSelectedProjectId("")}
        className="flex items-center gap-2 text-slate-400 hover:text-brand-500 font-bold text-[10px] uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="glass-panel p-10 border-slate-100 bg-white/80 shadow-2xl relative">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Survey Form</p>
             <h2 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">{project?.name}</h2>
          </div>
          <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-all ${gps ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            <MapPin size={16} className={gps ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {gps ? "GPS Fixed" : "Waiting for GPS..."}
            </span>
          </div>
        </header>

        {status.message && (
          <div className={`mb-10 p-6 rounded-[32px] flex items-center gap-4 animate-slideDown ${
            status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}>
            {status.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-bold tracking-tight">{status.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {project?.formDefinition?.map((field) => (
              <div key={field.fieldId} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {field.type === "text" || field.type === "number" ? (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm"
                    value={answers[field.fieldId] || ""}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    rows={4}
                    className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm resize-none"
                    value={answers[field.fieldId] || ""}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    required={field.required}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-900 shadow-sm appearance-none cursor-pointer"
                    value={answers[field.fieldId] || ""}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                  >
                    <option value="">Select option...</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === "radio" ? (
                   <div className="grid gap-3 sm:grid-cols-2">
                      {field.options?.map(opt => {
                        const active = answers[field.fieldId] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleInputChange(field.fieldId, opt.value)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                              active ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]" : "bg-white border-slate-50 text-slate-600 hover:border-brand-200"
                            }`}
                          >
                            <span className="text-[11px] font-bold tracking-tight">{opt.label}</span>
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-white' : 'border-slate-100'}`}>
                                {active && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                            </div>
                          </button>
                        );
                      })}
                   </div>
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    required={field.required}
                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-900 shadow-sm appearance-none cursor-pointer"
                    value={answers[field.fieldId] || ""}
                    onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
             <button
               type="button"
               disabled={true}
               className="flex-1 h-16 flex items-center justify-center gap-3 rounded-[28px] bg-slate-100 text-slate-400 cursor-not-allowed text-[11px] font-bold uppercase tracking-widest transition-all"
             >
               <Camera size={18} /> Add Photos (TBA)
             </button>
             <button
               type="button"
               disabled={true}
               className="flex-1 h-16 flex items-center justify-center gap-3 rounded-[28px] bg-slate-100 text-slate-400 cursor-not-allowed text-[11px] font-bold uppercase tracking-widest transition-all"
             >
               <Mic size={18} /> Add Voice (TBA)
             </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isProjectLoading}
            className="w-full h-16 flex items-center justify-center gap-4 rounded-[28px] bg-brand-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-2xl shadow-brand-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send size={18} /> Submit Survey
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Data privacy protected. Your location is being captured for verification.
      </p>
    </div>
  );
};
