// utils/reverseGeocode.js
export async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch address");
  
    const data = await res.json();
    const address = data.address || {};
  
    return {
      road: address.road || "",
      suburb: address.suburb || address.neighbourhood || "",
      city: address.city || address.town || address.village || "",
      state: address.state || "",
      postcode: address.postcode || "",
      country: address.country || "",
    };
  }
  