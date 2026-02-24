// A mock service for phase 2:
// 1. Google Maps Geocoding translation
// 2. Webhook simulation

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'dummy_key';
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://hookb.in/dummy';

export async function reverseGeocode(lat, lng) {
    if (GMAPS_KEY === 'dummy_key') {
        // Return a mock address for demo
        return "Feria Los Guindos, Intersección X";
    }

    try {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        }
    } catch (e) {
        console.error("Geocoding failed:", e);
    }
    return "Dirección desconocida";
}

export async function sendAlertWebhook(payload) {
    console.log("== WEBHOOK PAYLOAD (TO WHATSAPP) ==");
    console.log(JSON.stringify(payload, null, 2));

    try {
        // Using no-cors just to fire and forget if it's a real dummy webhook
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Webhook dispatch failed:", e);
    }
}
