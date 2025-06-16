import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import type { PartyWithHost } from "@shared/schema";

interface MapViewProps {
  parties: PartyWithHost[];
}

export default function MapView({ parties }: MapViewProps) {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default NYC
  const [activeMarker, setActiveMarker] = useState<number | null>(null); // Track which marker is active

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-dark-tertiary">
      <GoogleMap
        zoom={10}
        center={center}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {parties.map((party) => (
          <Marker
            key={party.id}
            position={{ lat: party.latitude, lng: party.longitude }}
            onClick={() => setActiveMarker(party.id)}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                  <text x="0" y="30" font-size="30">🎮</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          >
            {activeMarker === party.id && (
              <InfoWindow
                onCloseClick={() => setActiveMarker(null)}
                position={{ lat: party.latitude, lng: party.longitude }}
              >
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-black">{party.title}</h3>
                  <p className="text-sm text-gray-600">{party.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Game: {party.game}
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
}
