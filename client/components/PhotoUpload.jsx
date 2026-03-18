import { Camera, Upload, X } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export const PhotoUpload = ({ userId, currentPhoto, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview local
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append("photo", file);

        try {
            setUploading(true);
            const res = await api.post(`/uploads/profile-photo/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                toast.success("Photo uploaded successfully");
                onUploadSuccess(res.data.data.profilePhoto);
                setPreview(null);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Upload failed");
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group w-24 h-24">
            <div className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-300">
                {preview || currentPhoto ? (
                    <img
                        src={preview || currentPhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Camera className="text-slate-300" size={24} />
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-brand-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-brand-700 transition-colors border-2 border-white">
                <Upload size={14} />
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>
        </div>
    );
};
