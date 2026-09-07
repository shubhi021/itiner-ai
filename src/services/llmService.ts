import {GoogleGenerativeAI, Schema, Type} from '@google/generative-ai';
import {GEMINI_API_KEY} from '@env';
import {TripRequest, Itinerary} from '../types/trip';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the JSON schema we want Gemini to return
const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    destination: {type: Type.STRING},
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: {type: Type.INTEGER},
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: {type: Type.STRING},
                name: {type: Type.STRING},
                description: {type: Type.STRING},
                location: {type: Type.STRING},
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    latitude: {type: Type.NUMBER},
                    longitude: {type: Type.NUMBER},
                  },
                },
                estimatedCost: {type: Type.STRING},
                category: {
                  type: Type.STRING,
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
      },
    });

    const prompt = `
      Create a detailed ${request.days}-day itinerary for a trip to ${
      request.destination
    }.
      Budget level: ${request.budget}.
      Interests: ${request.interests.join(', ')}.
      ${request.advanced?.pace ? `Pace: ${request.advanced.pace}` : ''}
      ${
        request.advanced?.travelGroup
          ? `Group type: ${request.advanced.travelGroup}`
          : ''
      }
      ${
        request.advanced?.dietary
          ? `Dietary restrictions: ${request.advanced.dietary.join(', ')}`
          : ''
      }
      ${
        request.advanced?.stayArea
          ? `Staying in/near: ${request.advanced.stayArea}`
          : ''
      }
      ${
        request.advanced?.customNote
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
