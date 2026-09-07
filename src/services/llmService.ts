import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { TripRequest, Itinerary } from '../types/trip';

let genAI: GoogleGenerativeAI | null = null;

// Define the JSON schema we want Gemini to return
const itinerarySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    destination: { type: SchemaType.STRING },
    days: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: { type: SchemaType.INTEGER },
          activities: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                time: { type: SchemaType.STRING },
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                location: { type: SchemaType.STRING },
                coordinates: {
                  type: SchemaType.OBJECT,
                  properties: {
                    latitude: { type: SchemaType.NUMBER },
                    longitude: { type: SchemaType.NUMBER },
                  },
                },
                estimatedCost: { type: SchemaType.STRING },
                category: {
                  type: SchemaType.STRING,
                  enum: [
                    'food',
                    'landmark',
                    'nature',
                    'nightlife',
                    'shopping',
                    'other',
                  ],
                },
              },
              required: ['time', 'name', 'description', 'location', 'category'],
            },
          },
        },
        required: ['day', 'activities'],
      },
    },
  },
  required: ['destination', 'days'],
};

export const generateItinerary = async (
  request: TripRequest,
): Promise<Itinerary> => {
  try {
    if (!genAI) {
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing from .env file');
      }
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
      },
    });

    const prompt = `
      Create a detailed ${request.days}-day itinerary for a trip to ${request.destination
      }.
      Budget level: ${request.budget}.
      Interests: ${request.interests.join(', ')}.
      ${request.advanced?.pace ? `Pace: ${request.advanced.pace}` : ''}
      ${request.advanced?.travelGroup
        ? `Group type: ${request.advanced.travelGroup}`
        : ''
      }
      ${request.advanced?.dietary
        ? `Dietary restrictions: ${request.advanced.dietary.join(', ')}`
        : ''
      }
      ${request.advanced?.stayArea
        ? `Staying in/near: ${request.advanced.stayArea}`
        : ''
      }
      ${request.advanced?.customNote
        ? `Additional notes: ${request.advanced.customNote}`
        : ''
      }
      
      For each activity, provide estimated coordinates (latitude and longitude) to be plotted on a map.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON string into our Itinerary type
    const itinerary: Itinerary = JSON.parse(text);
    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary with Gemini:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
};
