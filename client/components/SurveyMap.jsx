import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Layers, Map as MapIcon } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const MAP_LAYERS = {
  satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
};

export const SurveyMap = ({ points }) => {
  const [mapType, setMapType] = useState("satellite");

  return (
    <div className="h-[320px] overflow-hidden rounded-[32px] sm:h-[420px] lg:h-[560px] relative border border-slate-100 shadow-xl group">
      <MapContainer center={[28.6139, 77.209]} zoom={5} className="h-full w-full z-0">
        <TileLayer
          attribution={mapType === "street" ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' : '&copy; Google Maps'}
          url={MAP_LAYERS[mapType]}
        />
        {points.map((point) => (
          <Marker key={point.id} position={[point.latitude, point.longitude]}>
            <Popup>
              <div className="p-2 space-y-1 min-w-[140px]">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">{point.project}</p>
                <p className="text-sm font-bold text-slate-900">{point.user}</p>
                <div className="h-px bg-slate-100 my-2" />
                <p className="text-[10px] text-slate-400 font-medium">{point.submittedAt}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Type Toggle */}
      <div className="absolute top-4 right-4 z-[40]">
        <button
          onClick={() => setMapType(prev => prev === "satellite" ? "street" : "satellite")}
          className="flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-100 text-slate-900 shadow-2xl hover:bg-white active:scale-95 transition-all duration-300"
        >
          {mapType === "satellite" ? (
            <>
              <MapIcon size={16} className="text-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Street View</span>
            </>
          ) : (
            <>
              <Layers size={16} className="text-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Satellite View</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
