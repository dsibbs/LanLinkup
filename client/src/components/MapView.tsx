import { GoogleMap, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import type { PartyWithHost } from "@shared/schema";

interface MapViewProps {
  parties: PartyWithHost[];
}

export default function MapView({ parties }: MapViewProps) {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // default NYC

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
            position={{
              lat: party.lat,
              lng: party.lng,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
