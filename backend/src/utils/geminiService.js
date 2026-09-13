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
const generateItineraryPlan = async ({ 
  destination, 
  startingFrom = '', 
  days = 3, 
  startDate = null,
  budget = 'moderate', 
  preferences = '' 
}) => {
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API key found. Please set GEMINI_API_KEY in your backend .env file.');
  }

  const baseDate = startDate ? new Date(startDate) : new Date();
  const formattedStartDate = baseDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const prompt = `
You are an expert, highly meticulous travel planner. Create an exact, structured, day-by-day travel itinerary for a trip to "${destination}".

Trip Parameters:
- Source / Starting From: ${startingFrom ? startingFrom : 'Detect closest hub/origin based on destination'}
- Destination: ${destination}
- Duration: exactly ${days} days
- Trip Start Date: ${formattedStartDate}
- Budget Category: ${budget} (budget / moderate / luxury)
- Preferences & Interests: ${preferences || 'Well-rounded itinerary with iconic landmarks, local food, culture, and relaxation.'}

Strict Rules:
1. Break down the plan into exactly Day 1 up to Day ${days}.
2. For Day 1, specify transportation from "${startingFrom || 'user origin'}" to "${destination}" (trains/flights options with real booking search URLs: Google Flights, Skyscanner, or IRCTC/MakeMyTrip).
3. Recommend best accommodations/hotels suitable for the "${budget}" budget with direct Booking.com search links.
4. Include authentic local restaurants, cafes, or street food hubs with specific breakfast, lunch, and dinner suggestions.
5. For activities, provide specific timings (e.g. "09:00 AM", "01:30 PM", "05:00 PM") and realistic durations.
6. Provide valid, clickable direct booking or map links:
   - Flight/Train: https://www.google.com/travel/flights?q=... or IRCTC/MakeMyTrip link
   - Hotels: https://www.booking.com/searchresults.html?ss=...
   - Food/Sightseeing: https://www.google.com/maps/search/?api=1&query=...

Return strictly a valid JSON array of objects. Do not include extra text outside the JSON. Schema:
[
  {
    "dayNumber": 1,
    "time": "09:00 AM",
    "timeSlot": "Morning",
    "location": "Specific place name, station, hotel or landmark",
    "desc": "Detailed description of what to do, what to see, or why to stay/eat here.",
    "type": "transport" | "hotel" | "food" | "activity",
    "notes": "Helpful tips, estimated cost in local currency, dress code or hours",
    "bookingLink": "https://..."
  }
]
`;

  let lastError = null;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });

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

        // Geocode items in parallel and compute exact dates
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const coords = await geocodePlace(item.location, destination);
            
            const dayOffset = Math.max(0, (parseInt(item.dayNumber) || 1) - 1);
            const itemDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

            // Ensure bookingLink has a good fallback Google Maps URL if empty
            let finalBookingLink = item.bookingLink;
            if (!finalBookingLink || !finalBookingLink.startsWith('http')) {
              finalBookingLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location + ' ' + destination)}`;
            }

            return {
              location: item.location,
              dayNumber: item.dayNumber || (dayOffset + 1),
              time: item.time || `${item.timeSlot || 'Day ' + (dayOffset + 1)}`,
              notes: item.notes || item.time || '',
              desc: item.desc || '',
              type: item.type || 'activity',
              bookingLink: finalBookingLink,
              lat: coords.lat,
              lng: coords.lng,
              date: itemDate
            };
          })
        );

        console.log(`[Gemini] Successfully generated ${enrichedItems.length} itinerary items with model ${modelName}`);
        return enrichedItems;

      } catch (err) {
        console.warn(`[Gemini] Failed with model ${modelName}:`, err.message || err);
        lastError = err;
      }
    }
  }

  throw new Error(`Failed to generate itinerary with Gemini across all models and keys. Reason: ${lastError?.message || 'Unknown error'}`);
};

module.exports = {
  generateItineraryPlan,
  geocodePlace
};
