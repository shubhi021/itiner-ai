import {GoogleGenerativeAI, Schema, SchemaType} from '@google/generative-ai';
import {GEMINI_API_KEY} from '@env';
import {TripRequest, Itinerary, Activity} from '../types/trip';

let genAI: GoogleGenerativeAI | null = null;

// Candidate models in fallback order to handle version transitions or temporary spikes
const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

// Define the JSON schema we want Gemini to return for full itineraries
const itinerarySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    destination: {type: SchemaType.STRING},
    days: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: {type: SchemaType.INTEGER},
          activities: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                time: {type: SchemaType.STRING},
                name: {type: SchemaType.STRING},
                description: {type: SchemaType.STRING},
                location: {type: SchemaType.STRING},
                coordinates: {
                  type: SchemaType.OBJECT,
                  properties: {
                    latitude: {type: SchemaType.NUMBER},
                    longitude: {type: SchemaType.NUMBER},
                  },
                },
                estimatedCost: {type: SchemaType.STRING},
                category: {
                  type: SchemaType.STRING,
                  format: 'enum',
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

// Define the JSON schema for a single swapped activity
const singleActivitySchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    time: {type: SchemaType.STRING},
    name: {type: SchemaType.STRING},
    description: {type: SchemaType.STRING},
    location: {type: SchemaType.STRING},
    coordinates: {
      type: SchemaType.OBJECT,
      properties: {
        latitude: {type: SchemaType.NUMBER},
        longitude: {type: SchemaType.NUMBER},
      },
      required: ['latitude', 'longitude'],
    },
    estimatedCost: {type: SchemaType.STRING},
    category: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['food', 'landmark', 'nature', 'nightlife', 'shopping', 'other'],
    },
  },
  required: [
    'time',
    'name',
    'description',
    'location',
    'category',
    'coordinates',
  ],
};

const executeWithFallback = async (
  prompt: string,
  schema: Schema,
): Promise<string> => {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing from .env file');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  let lastError: any = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(
        `Gemini model ${modelName} failed, trying candidate fallback...`,
      );
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
};

export const generateItinerary = async (
  request: TripRequest,
): Promise<Itinerary> => {
  try {
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

    const text = await executeWithFallback(prompt, itinerarySchema);
    const itinerary: Itinerary = JSON.parse(text);
    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary with Gemini:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
};

export interface SuggestAlternativeParams {
  destination: string;
  day: number;
  activityToReplace: Activity;
  currentDayActivities: Activity[];
  weatherCondition?: string;
  reason?: string;
  budget?: 'low' | 'mid' | 'high';
}

export const suggestAlternativeActivity = async (
  params: SuggestAlternativeParams,
): Promise<Activity> => {
  try {
    const otherActivities = params.currentDayActivities
      .filter(a => a.name !== params.activityToReplace.name)
      .map(a => `- ${a.time}: ${a.name} (${a.category}) at ${a.location}`)
      .join('\n');

    const prompt = `
      You are an expert local travel guide in ${params.destination}.
      Suggest an alternative activity to replace an existing stop on Day ${
        params.day
      } of the trip.

      ACTIVITY BEING REPLACED:
      - Name: "${params.activityToReplace.name}"
      - Scheduled Time: "${params.activityToReplace.time}"
      - Location: "${params.activityToReplace.location}"
      - Description: "${params.activityToReplace.description}"
      - Category: "${params.activityToReplace.category}"
      - Current Estimated Cost: "${
        params.activityToReplace.estimatedCost || 'Moderate'
      }"

      ${params.reason ? `USER'S REASON FOR PIVOT/SWAP: "${params.reason}"` : ''}
      ${
        params.weatherCondition
          ? `CURRENT WEATHER: "${params.weatherCondition}". If it is rainy, cold, stormy, or bad weather, prioritize high-quality indoor alternatives (museums, indoor markets, historic cafes, galleries).`
          : ''
      }
      ${params.budget ? `TRIP BUDGET LEVEL: "${params.budget}"` : ''}

      OTHER ACTIVITIES SCHEDULED FOR THIS DAY:
      ${otherActivities || 'No other stops'}

      REQUIREMENTS:
      1. Time must be "${params.activityToReplace.time}".
      2. The alternative MUST be located in ${
        params.destination
      } and geographically coherent with other stops on this day.
      3. Do NOT duplicate any of the other activities scheduled for this day.
      4. Provide precise latitude and longitude coordinates for plotting on an interactive map.
      5. Category must be one of: 'food', 'landmark', 'nature', 'nightlife', 'shopping', 'other'.
    `;

    const text = await executeWithFallback(prompt, singleActivitySchema);
    const activity: Activity = JSON.parse(text);
    if (!activity.time || activity.time.trim() === '') {
      activity.time = params.activityToReplace.time;
    }
    return activity;
  } catch (error) {
    console.error('Error suggesting alternative activity with Gemini:', error);
    throw new Error(
      'Failed to suggest alternative activity. Please try again.',
    );
  }
};
