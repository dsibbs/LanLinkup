// components/GoogleMapsWrapper.tsx
import { useJsApiLoader } from "@react-google-maps/api";
import { ReactNode } from "react";

const libraries: (
  "drawing" | "geometry" | "localContext" | "places" | "visualization"
)[] = ["places"]; // include all you'll need

interface GoogleMapsWrapperProps {
  children: ReactNode;
}

export default function GoogleMapsWrapper({ children }: GoogleMapsWrapperProps) {
  const { isLoaded } = useJsApiLoader({
    id: "script-loader",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries,
    language: "en",
    region: "US",
    version: "weekly",
  });

  if (!isLoaded) return <p>Loading Map...</p>;

  return <>{children}</>;
}
