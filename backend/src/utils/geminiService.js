const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

// Supported Gemini models in priority order
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview',
  'gemini-pro-latest'
];

/**
 * Extract list of API keys from environment
 */
const getApiKeys = () => {
  const keys = [];
  if (process.env.GEMINI_API_KEY) {
    keys.push(...process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (process.env.GEMINI_API_KEY_FALLBACK) {
    keys.push(...process.env.GEMINI_API_KEY_FALLBACK.split(',').map(k => k.trim()).filter(Boolean));
  }
  return [...new Set(keys)]; // unique keys
};

/**
 * Geocode a place name using OpenStreetMap Nominatim
 */
const geocodePlace = async (placeName, baseLocation = '') => {
  try {
    const query = baseLocation ? `${placeName}, ${baseLocation}` : placeName;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: { 'User-Agent': 'TravelPlannerApp/2.0' },
        timeout: 4000
      }
    );
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
  } catch (err) {
    // If specific place lookup fails, try just placeName
    try {
      const fallbackRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`,
        {
          headers: { 'User-Agent': 'TravelPlannerApp/2.0' },
          timeout: 4000
        }
      );
      if (fallbackRes.data && fallbackRes.data.length > 0) {
        return {
          lat: parseFloat(fallbackRes.data[0].lat),
          lng: parseFloat(fallbackRes.data[0].lon)
        };
      }
    } catch (fallbackErr) {
      // Ignore geocode error
    }
  }
  return { lat: 0, lng: 0 };
};

/**
 * Generates an automated itinerary using Gemini AI with fallback models and keys
 */
const generateItineraryPlan = async ({ destination, startingFrom = '', days = 3, budget = 'moderate', preferences = '' }) => {
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API key found. Please set GEMINI_API_KEY in your backend .env file.');
  }

  const prompt = `
You are an expert travel assistant. Create a detailed, actionable, day-by-day travel itinerary for a trip to "${destination}".
Trip Details:
- Starting from: ${startingFrom || 'origin'}
- Duration: ${days} days
- Budget style: ${budget}
- Preferences / Notes: ${preferences || 'Balanced mix of must-see sights, culture, relaxation, and local culinary experiences.'}

Requirements:
1. Include transportation/trains/flights options to travel to or around the destination.
2. Include recommended accommodations/hotels matching the budget.
3. Include must-try local food and restaurants/cafes.
4. Include top activities and sightseeing with realistic timings.
5. Provide actionable booking or reference URLs for each item:
   - For hotels/accommodations: use direct Booking.com search URL (e.g., https://www.booking.com/searchresults.html?ss=...)
   - For trains/transportation: use IRCTC, Trainline, Skyscanner, or Google Flights URL (e.g., https://www.google.com/travel/flights or https://www.makemytrip.com/railways/)
   - For food & activities: provide Google Maps search or TripAdvisor/booking links (e.g., https://www.google.com/maps/search/?api=1&query=...)

Return ONLY a valid, raw JSON array of objects. Do not wrap in markdown or backticks if possible, or ensure it is valid JSON. Each object must have the following schema:
[
  {
    "location": "Name of the place, hotel, restaurant, or station",
    "time": "e.g., Day 1 - Morning (09:00 AM)",
    "desc": "Detailed description of what to do, what to see, or why to stay/eat here.",
    "type": "transport" | "hotel" | "food" | "activity",
    "notes": "Helpful tips, estimated cost, opening hours, or special advice",
    "bookingLink": "https://..."
  }
]
`;

  let lastError = null;

  // Try each API key
  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });

    // Try each model fallback in priority order
    for (const modelName of MODELS) {
      try {
        console.log(`[Gemini] Attempting itinerary generation with model: ${modelName}`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        let responseText = '';
        if (typeof response.text === 'function') {
          responseText = response.text();
        } else if (response.text) {
          responseText = response.text;
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = response.candidates[0].content.parts[0].text;
        }

        if (!responseText) {
          throw new Error('Empty response received from Gemini');
        }

        // Clean any markdown formatting if present
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const items = JSON.parse(cleanJson);
        if (!Array.isArray(items)) {
          throw new Error('Gemini response is not an array');
        }

        // Geocode items in parallel (with concurrency limit/graceful fallback)
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const coords = await geocodePlace(item.location, destination);
            return {
              location: item.location,
              time: item.time || '',
              notes: item.notes || item.time || '',
              desc: item.desc || '',
              type: item.type || 'activity',
              bookingLink: item.bookingLink || '',
              lat: coords.lat,
              lng: coords.lng,
              date: new Date()
            };
          })
        );

        console.log(`[Gemini] Successfully generated ${enrichedItems.length} itinerary items with model ${modelName}`);
        return enrichedItems;

      } catch (err) {
        console.warn(`[Gemini] Failed with model ${modelName}:`, err.message || err);
        lastError = err;
        // Continue to the next fallback model
      }
    }
  }

  throw new Error(`Failed to generate itinerary with Gemini across all models and keys. Reason: ${lastError?.message || 'Unknown error'}`);
};

module.exports = {
  generateItineraryPlan,
  geocodePlace
};
