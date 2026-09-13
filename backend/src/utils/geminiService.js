const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

// Supported Gemini models with Flash-Lite prioritized for high rate limits & speed
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
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
  return [...new Set(keys)];
};

/**
 * Fast geocode place name with quick timeout and fallback
 */
const geocodePlaceFast = async (placeName, baseLocation = '', anchorCoords = null) => {
  try {
    const query = baseLocation ? `${placeName}, ${baseLocation}` : placeName;
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: { 'User-Agent': 'TravelPlannerApp/2.0' },
        timeout: 1800
      }
    );
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
  } catch (err) {
    // Graceful fallback to anchor if available with slight offset
  }

  if (anchorCoords && anchorCoords.lat !== 0) {
    // Add slight realistic jitter so markers don't overlap completely on the map
    const jitterLat = (Math.random() - 0.5) * 0.025;
    const jitterLng = (Math.random() - 0.5) * 0.025;
    return {
      lat: anchorCoords.lat + jitterLat,
      lng: anchorCoords.lng + jitterLng
    };
  }

  return { lat: 0, lng: 0 };
};

/**
 * Geocode destination city once as anchor
 */
const getCityAnchor = async (destination) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
      {
        headers: { 'User-Agent': 'TravelPlannerApp/2.0' },
        timeout: 2500
      }
    );
    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon)
      };
    }
  } catch (e) {}
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
    throw new Error('GEMINI_API_KEY is not set on backend. Please configure GEMINI_API_KEY in your hosting environment variables (Render/Railway).');
  }

  const numDays = Math.min(Math.max(parseInt(days) || 3, 1), 10);
  const baseDate = startDate ? new Date(startDate) : new Date();
  const formattedStartDate = baseDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Prompt optimized for fast response time & compact valid JSON
  const prompt = `
You are an expert travel assistant. Create a high-quality, concise day-by-day travel plan for "${destination}".
- Origin/Starting: ${startingFrom || 'origin'}
- Duration: exactly ${numDays} days
- Start Date: ${formattedStartDate}
- Budget: ${budget}
- Notes: ${preferences || 'Must-see attractions, scenic spots, local dining, relaxation.'}

Instructions:
1. Provide exactly 3 to 4 items per day (Day 1 to Day ${numDays}).
2. On Day 1, include transit from "${startingFrom || 'origin'}" to "${destination}".
3. Recommend hand-picked accommodations for the "${budget}" style.
4. Include authentic local restaurants/food hubs and top sightseeing spots.
5. Provide realistic timing (e.g. "08:30 AM", "01:00 PM", "05:30 PM").
6. Provide actionable URLs:
   - Transit: https://www.google.com/travel/flights?q=... or IRCTC/MakeMyTrip
   - Stays: https://www.booking.com/searchresults.html?ss=...
   - Food/Sightseeing: https://www.google.com/maps/search/?api=1&query=...

Return strictly a valid JSON array of objects without markdown formatting:
[
  {
    "dayNumber": 1,
    "time": "08:30 AM",
    "location": "Place or Station Name",
    "desc": "Short, vivid description",
    "type": "transport" | "hotel" | "food" | "activity",
    "notes": "Cost estimate or tip",
    "bookingLink": "https://..."
  }
]
`;

  // Pre-fetch anchor city coordinates concurrently to speed up marker plotting
  const anchorPromise = getCityAnchor(destination);

  let lastError = null;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });

    for (const modelName of MODELS) {
      try {
        console.log(`[Gemini] Attempting generation with model: ${modelName}`);

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
          throw new Error('Empty response from model');
        }

        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const items = JSON.parse(cleanJson);
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error('Invalid or empty array from AI');
        }

        const anchorCoords = await anchorPromise;

        // Enrich items with geocoding and exact dates
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            const coords = await geocodePlaceFast(item.location, destination, anchorCoords);
            
            const dayOffset = Math.max(0, (parseInt(item.dayNumber) || 1) - 1);
            const itemDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

            let finalBookingLink = item.bookingLink;
            if (!finalBookingLink || !finalBookingLink.startsWith('http')) {
              finalBookingLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location + ' ' + destination)}`;
            }

            return {
              location: item.location || destination,
              dayNumber: parseInt(item.dayNumber) || (dayOffset + 1),
              time: item.time || 'Day ' + (dayOffset + 1),
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

        console.log(`[Gemini] Successfully generated ${enrichedItems.length} items using ${modelName}`);
        return enrichedItems;

      } catch (err) {
        console.warn(`[Gemini] Model ${modelName} error:`, err.message || err);
        lastError = err;
        // Continue to the next fallback model in the list
      }
    }
  }

  throw new Error(`AI generation error across fallback models: ${lastError?.message || 'Rate limit reached or server unavailable. Please try again in a few moments.'}`);
};

module.exports = {
  generateItineraryPlan,
  geocodePlace: geocodePlaceFast
};
