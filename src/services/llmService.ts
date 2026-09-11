import {GoogleGenerativeAI, Schema, SchemaType} from '@google/generative-ai';
import {GEMINI_API_KEY} from '@env';
import {
  TripRequest,
  Itinerary,
  Activity,
  ChatMessage,
  PackingItem,
  DestinationInsights,
  BudgetForecast,
  DayOptimizationPreset,
} from '../types/trip';

let genAI: GoogleGenerativeAI | null = null;

// Candidate models in fallback order to handle version transitions, capacity spikes, and high demand
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-pro-latest',
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

// Define the JSON schema for full-day re-optimization (array of activities)
const dayActivitiesSchema: Schema = {
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
  },
};

// Define the JSON schema for smart packing checklist items
const packingListSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      name: {type: SchemaType.STRING},
      category: {
        type: SchemaType.STRING,
        format: 'enum',
        enum: [
          'Clothing',
          'Tech & Adapters',
          'Toiletries',
          'Documents',
          'Weather Gear',
          'Other',
        ],
      },
      tip: {type: SchemaType.STRING},
    },
    required: ['name', 'category'],
  },
};

// Define the JSON schema for destination insights & cultural guide
const destinationInsightsSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    tippingCulture: {type: SchemaType.STRING},
    transitTips: {
      type: SchemaType.ARRAY,
      items: {type: SchemaType.STRING},
    },
    culturalEtiquette: {
      type: SchemaType.OBJECT,
      properties: {
        dos: {
          type: SchemaType.ARRAY,
          items: {type: SchemaType.STRING},
        },
        donts: {
          type: SchemaType.ARRAY,
          items: {type: SchemaType.STRING},
        },
      },
      required: ['dos', 'donts'],
    },
    emergencyNumbers: {
      type: SchemaType.OBJECT,
      properties: {
        police: {type: SchemaType.STRING},
        ambulance: {type: SchemaType.STRING},
        general: {type: SchemaType.STRING},
      },
      required: ['police', 'ambulance', 'general'],
    },
    essentialPhrases: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          phrase: {type: SchemaType.STRING},
          translation: {type: SchemaType.STRING},
          pronunciation: {type: SchemaType.STRING},
        },
        required: ['phrase', 'translation'],
      },
    },
  },
  required: [
    'tippingCulture',
    'transitTips',
    'culturalEtiquette',
    'emergencyNumbers',
    'essentialPhrases',
  ],
};

// Define the JSON schema for budget breakdown & forecast
const budgetForecastSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    totalEstimated: {type: SchemaType.STRING},
    currency: {type: SchemaType.STRING},
    dailyAverage: {type: SchemaType.STRING},
    categories: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: {type: SchemaType.STRING},
          estimated: {type: SchemaType.STRING},
          percentage: {type: SchemaType.NUMBER},
          tip: {type: SchemaType.STRING},
        },
        required: ['category', 'estimated', 'percentage', 'tip'],
      },
    },
    moneySavingTips: {
      type: SchemaType.ARRAY,
      items: {type: SchemaType.STRING},
    },
  },
  required: [
    'totalEstimated',
    'currency',
    'dailyAverage',
    'categories',
    'moneySavingTips',
  ],
};

interface ExecuteOptions {
  schema?: Schema;
  systemInstruction?: string;
  temperature?: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithFallback = async (
  prompt: string,
  options?: ExecuteOptions | Schema,
): Promise<string> => {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing from .env file');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  // Handle backwards compatibility where options was just schema
  const resolvedOptions: ExecuteOptions =
    options && 'type' in options
      ? {schema: options as Schema}
      : (options as ExecuteOptions) || {};

  let lastError: any = null;

  // Perform up to 2 passes through candidate models with delay on transient 503/429 spikes
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const modelParams: any = {
          model: modelName,
        };

        if (resolvedOptions.systemInstruction) {
          modelParams.systemInstruction = resolvedOptions.systemInstruction;
        }

        const generationConfig: any = {};
        if (resolvedOptions.schema) {
          generationConfig.responseMimeType = 'application/json';
          generationConfig.responseSchema = resolvedOptions.schema;
        }
        if (typeof resolvedOptions.temperature === 'number') {
          generationConfig.temperature = resolvedOptions.temperature;
        }

        modelParams.generationConfig = generationConfig;

        const model = genAI.getGenerativeModel(modelParams);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status;
        console.warn(
          `Gemini model ${modelName} failed (status: ${
            status || 'unknown'
          }, attempt: ${attempt + 1}): ${msg.slice(0, 100)}`,
        );

        // If high demand (503) or rate limit (429), pause briefly before trying next candidate
        if (
          status === 503 ||
          status === 429 ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('high demand')
        ) {
          await delay(600);
        }
      }
    }

    // If first pass exhausted during a major spike, wait 1.2s before second pass
    if (attempt === 0) {
      await delay(1200);
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
};

/**
 * Generates a complete multi-day structured itinerary
 */
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

    const text = await executeWithFallback(prompt, {
      schema: itinerarySchema,
      temperature: 0.7,
    });
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

/**
 * Suggests an alternative activity for a single stop
 */
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

    const text = await executeWithFallback(prompt, {
      schema: singleActivitySchema,
      temperature: 0.7,
    });
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

export interface OptimizeDayParams {
  destination: string;
  dayNumber: number;
  existingActivities: Activity[];
  preset?: DayOptimizationPreset;
  customInstruction?: string;
  weatherCondition?: string;
  budget?: string;
}

/**
 * Prompt-to-Edit: Re-optimizes an entire day's schedule based on user instructions
 */
export const optimizeDayItinerary = async (
  params: OptimizeDayParams,
): Promise<Activity[]> => {
  try {
    const currentSchedule = params.existingActivities
      .map(
        (a, i) =>
          `${i + 1}. [${a.time}] ${a.name} (${a.category}) - ${a.location} - ${
            a.description
          }`,
      )
      .join('\n');

    let instructionDetails = '';
    switch (params.preset) {
      case 'relaxed':
        instructionDetails =
          'Make this day more leisurely and relaxed. Reduce the total stops to 2 or 3 unhurried highlights with comfortable pacing, peaceful cafes, or scenic viewpoints.';
        break;
      case 'foodie':
        instructionDetails =
          'Focus heavily on culinary delights, famous local markets, iconic neighborhood bakeries, artisan coffee, and authentic local dinner spots.';
        break;
      case 'efficient_transit':
        instructionDetails =
          'Re-order and optimize all activities to be in close geographic proximity with minimal transit time. Prioritize easy walking connections between stops.';
        break;
      case 'rain_protocol':
        instructionDetails =
          'Convert all outdoor stops into world-class indoor alternatives (museums, indoor food halls, historic arcades, botanical conservatories, galleries) safe from heavy rain.';
        break;
      default:
        instructionDetails =
          params.customInstruction ||
          'Improve the flow and coherence of this day.';
        break;
    }

    if (params.customInstruction && params.preset !== 'custom') {
      instructionDetails += ` Additional user guidance: "${params.customInstruction}"`;
    }

    const prompt = `
      You are an elite travel architect in ${params.destination}.
      Re-plan Day ${params.dayNumber} of the itinerary.

      CURRENT SCHEDULE FOR DAY ${params.dayNumber}:
      ${currentSchedule}

      OPTIMIZATION GOAL:
      ${instructionDetails}

      CONTEXT:
      - Destination: ${params.destination}
      ${
        params.weatherCondition
          ? `- Live Weather: ${params.weatherCondition}`
          : ''
      }
      ${params.budget ? `- Budget Tier: ${params.budget}` : ''}

      REQUIREMENTS:
      1. Return an ordered array of 2 to 4 activities for this day.
      2. Set realistic chronological times (e.g., '09:30 AM', '01:00 PM', '04:30 PM', '07:30 PM').
      3. Provide accurate coordinates (latitude and longitude) for every stop.
      4. Categories must be one of: 'food', 'landmark', 'nature', 'nightlife', 'shopping', 'other'.
      5. Estimated cost should reflect the budget tier (${
        params.budget || 'moderate'
      }).
    `;

    const text = await executeWithFallback(prompt, {
      schema: dayActivitiesSchema,
      temperature: 0.7,
    });
    const activities: Activity[] = JSON.parse(text);
    return activities;
  } catch (error) {
    console.error('Error optimizing day itinerary with Gemini:', error);
    throw new Error('Failed to optimize day schedule. Please try again.');
  }
};

export interface CopilotChatParams {
  messages: ChatMessage[];
  destination: string;
  daysCount?: number;
  itinerarySummary?: string;
  weatherSummary?: string;
  budget?: string;
}

/**
 * Conversational multi-turn travel assistant grounded in the active itinerary context
 */
export const chatWithTravelCopilot = async (
  params: CopilotChatParams,
): Promise<string> => {
  try {
    const systemInstruction = `
      You are ItinerAI Copilot, a sophisticated, enthusiastic, and deeply knowledgeable local travel guide and concierge in ${
        params.destination
      }.
      
      TRIP CONTEXT GROUNDING:
      - Destination: ${params.destination}
      - Trip Duration: ${params.daysCount || 'Multi-day'} days
      - Budget Tier: ${params.budget || 'Medium'}
      - Current Weather: ${params.weatherSummary || 'Clear/Typical seasonal'}
      ${
        params.itinerarySummary
          ? `- Active Itinerary Overview:\n${params.itinerarySummary}`
          : ''
      }

      CONVERSATIONAL GUIDELINES:
      1. Always tailor answers specifically to ${params.destination}.
      2. Keep responses punchy, helpful, and scannable for a traveler looking at their phone on the go.
      3. Use markdown bullet points and bolding for readability.
      4. Provide actionable, insider advice (best times to avoid lines, local dishes to order, tipping customs, transit navigation).
      5. Maintain an encouraging, warm, and professional tone.
    `;

    // Format the conversation history
    const conversationHistory = params.messages
      .map(m => `${m.role === 'user' ? 'Traveler' : 'Copilot'}: ${m.text}`)
      .join('\n\n');

    const prompt = `
      CONVERSATION SO FAR:
      ${conversationHistory}

      Reply as ItinerAI Copilot to the traveler's latest message with insightful, context-grounded travel advice.
    `;

    const text = await executeWithFallback(prompt, {
      systemInstruction,
      temperature: 0.8,
    });
    return text.trim();
  } catch (error) {
    console.error('Error chatting with travel copilot:', error);
    throw new Error('Travel Copilot is temporarily unavailable. Please retry.');
  }
};

export interface SmartPackingListParams {
  destination: string;
  daysCount: number;
  weatherSummary?: string;
  activities?: Activity[];
}

/**
 * Generates a weather-adapted, activity-informed smart packing checklist
 */
export const generateSmartPackingList = async (
  params: SmartPackingListParams,
): Promise<PackingItem[]> => {
  try {
    const activityCategories = params.activities
      ? Array.from(new Set(params.activities.map(a => a.category))).join(', ')
      : 'sightseeing, dining, city exploration';

    const prompt = `
      You are a master travel planner. Generate an essential smart packing checklist for a ${
        params.daysCount
      }-day trip to ${params.destination}.
      
      TRIP FACTORS:
      - Forecast / Weather: ${params.weatherSummary || 'Standard temperate'}
      - Planned Activity Types: ${activityCategories}

      RULES:
      1. Generate 12 to 18 targeted, practical items.
      2. Categorize each item strictly into one of: 'Clothing', 'Tech & Adapters', 'Toiletries', 'Documents', 'Weather Gear', 'Other'.
      3. If rainy, ensure weather gear includes rain jacket or compact umbrella.
      4. If cold, include warm layers; if hot/sunny, include sun protection.
      5. Include specific electrical plug type / adapter tips if applicable for ${
        params.destination
      }.
      6. Provide a short, helpful 1-sentence tip for each item.
    `;

    const text = await executeWithFallback(prompt, {
      schema: packingListSchema,
      temperature: 0.4,
    });
    const rawItems: Array<{name: string; category: any; tip?: string}> =
      JSON.parse(text);

    return rawItems.map((item, index) => ({
      id: `pack_${Date.now()}_${index}`,
      name: item.name,
      category: item.category,
      packed: false,
      tip: item.tip,
    }));
  } catch (error) {
    console.error('Error generating smart packing list with Gemini:', error);
    throw new Error('Failed to generate packing list. Please try again.');
  }
};

/**
 * Generates destination intelligence, cultural etiquette, transit hacks, and emergency hotlines
 */
export const generateDestinationInsights = async (
  destination: string,
): Promise<DestinationInsights> => {
  try {
    const prompt = `
      You are a cultural anthropologist and seasoned travel advisor.
      Provide a comprehensive, accurate cultural etiquette and survival guide for tourists visiting ${destination}.

      MUST COVER:
      1. Tipping culture: Exact expectations for restaurants, taxis, and hotels in ${destination} (e.g., standard %, rounding up, or if tipping is offensive).
      2. Transit hacks: 3 to 4 concrete tips for getting around (best transit card/app, taxi advice, metro etiquette).
      3. Cultural etiquette:
         - Exactly 3 to 4 key 'dos' (greeting habits, dress codes, dining customs).
         - Exactly 3 to 4 key 'donts' (taboos, gestures to avoid, queueing manners).
      4. Emergency numbers: Official police, ambulance, and general emergency hotline in this country/city.
      5. Essential local phrases: 5 vital phrases in the local language (Hello, Thank you, How much?, Where is the restroom?, The bill please) with English translations and phonetic pronunciation guides.
    `;

    const text = await executeWithFallback(prompt, {
      schema: destinationInsightsSchema,
      temperature: 0.3,
    });
    const insights: DestinationInsights = JSON.parse(text);
    return insights;
  } catch (error) {
    console.error('Error generating destination insights with Gemini:', error);
    throw new Error('Failed to load destination guide. Please try again.');
  }
};

/**
 * Generates an itemized category financial forecast based on budget tier
 */
export const generateBudgetForecast = async (
  destination: string,
  daysCount: number,
  budgetTier: 'low' | 'mid' | 'high',
): Promise<BudgetForecast> => {
  try {
    const prompt = `
      You are an expert travel financial consultant.
      Create a realistic expense forecast for a ${daysCount}-day trip to ${destination} for a traveler with a "${budgetTier}" budget tier.

      REQUIREMENTS:
      1. Break expenses into 4 or 5 primary categories (Accommodation, Food & Dining, Attractions & Activities, Local Transit, Miscellaneous/Buffer).
      2. Provide estimated total cost in the local currency or USD with clean currency symbols.
      3. Specify percentage breakdown adding up to roughly 100%.
      4. Provide a practical daily average spending estimate.
      5. Include 3 actionable, high-impact money saving tips for ${destination}.
    `;

    const text = await executeWithFallback(prompt, {
      schema: budgetForecastSchema,
      temperature: 0.4,
    });
    const forecast: BudgetForecast = JSON.parse(text);
    return forecast;
  } catch (error) {
    console.error('Error generating budget forecast with Gemini:', error);
    throw new Error('Failed to load budget forecast. Please try again.');
  }
};
