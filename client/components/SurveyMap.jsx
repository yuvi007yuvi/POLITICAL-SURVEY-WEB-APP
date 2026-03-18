import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export const SurveyMap = ({ points }) => (
  <div className="h-[560px] overflow-hidden rounded-3xl">
    <MapContainer center={[28.6139, 77.209]} zoom={5} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Marker key={point.id} position={[point.latitude, point.longitude]}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{point.project}</p>
              <p>{point.user}</p>
              <p>{point.submittedAt}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);

