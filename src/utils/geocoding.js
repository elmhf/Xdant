export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        return data.address;
    } catch (error) {
        console.error("Error reverse geocoding:", error);
        return null;
    }
};
