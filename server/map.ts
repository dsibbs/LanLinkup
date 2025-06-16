
import axios from "axios";


export async function Geocode(address: string) {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address,
        key: apiKey,
      },
    });

    const result = response.data.results?.[0];
    if (!result) throw new Error("Geocoding failed");
  
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  }