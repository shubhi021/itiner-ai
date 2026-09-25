import {
  GoogleGenerativeAI,
  Schema,
  SchemaType,
  Tool,
} from '@google/generative-ai';
import {apiClient} from './apiClient';
import {
  TripRequest,
  Itinerary,
  Activity,
  ChatMessage,
  PackingItem,
  DestinationInsights,
  BudgetForecast,
  DayOptimizationPreset,
  AgentAction,
} from '../types/trip';

let genAI: GoogleGenerativeAI | null = null;

// Candidate models in fallback order to handle version transitions, capacity spikes, and high demand
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
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

// Define Gemini agent tools (function calling) for Copilot autonomous actions
export const copilotTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'addActivityToSchedule',
        description:
          'Adds a new attraction, meal, stop, or activity to a specific day in the itinerary.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            dayNumber: {
              type: SchemaType.INTEGER,
              description:
                'The 1-based day number (e.g. 1 for Day 1, 2 for Day 2).',
            },
            time: {
              type: SchemaType.STRING,
              description:
                'Scheduled time of day, e.g. "03:30 PM" or "11:00 AM".',
            },
            name: {
              type: SchemaType.STRING,
              description:
                'Name of the landmark, attraction, cafe, or restaurant.',
            },
            location: {
              type: SchemaType.STRING,
              description: 'Neighborhood, street address, or area name.',
            },
            description: {
              type: SchemaType.STRING,
              description:
                'Short vivid summary of what to experience or do here.',
            },
            category: {
              type: SchemaType.STRING,
              description:
                'Category: "food", "landmark", "nature", "nightlife", "shopping", or "other".',
            },
            estimatedCost: {
              type: SchemaType.STRING,
              description: 'Estimated cost, e.g. "€5 - €10", "Free", or "$15".',
            },
            latitude: {
              type: SchemaType.NUMBER,
              description:
                'Approximate latitude coordinate for plotting on maps.',
            },
            longitude: {
              type: SchemaType.NUMBER,
              description:
                'Approximate longitude coordinate for plotting on maps.',
            },
          },
          required: [
            'dayNumber',
            'time',
            'name',
            'location',
            'description',
            'category',
          ],
        },
      },
      {
        name: 'removeActivityFromSchedule',
        description:
          'Removes or cancels a scheduled stop or activity from a specific day in the itinerary.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            dayNumber: {
              type: SchemaType.INTEGER,
              description: 'The 1-based day number (e.g. 1 for Day 1).',
            },
            activityName: {
              type: SchemaType.STRING,
              description:
                'The title or name of the activity/venue to remove (e.g. "Colosseum").',
            },
          },
          required: ['dayNumber', 'activityName'],
        },
      },
      {
        name: 'openNavigationDirections',
        description:
          'Opens external native navigation (Apple Maps or Google Maps) to a landmark or venue.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            destinationName: {
              type: SchemaType.STRING,
              description: 'Name of the venue, restaurant, or landmark.',
            },
            latitude: {
              type: SchemaType.NUMBER,
              description: 'Optional latitude coordinate.',
            },
            longitude: {
              type: SchemaType.NUMBER,
              description: 'Optional longitude coordinate.',
            },
          },
          required: ['destinationName'],
        },
      },
      {
        name: 'togglePackingItemStatus',
        description:
          'Marks a packing item as packed or unpacked in the trip packing checklist.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            itemName: {
              type: SchemaType.STRING,
              description:
                'Name of the item to mark (e.g. "Passport", "Sunglasses", "Universal Adapter").',
            },
            isPacked: {
              type: SchemaType.BOOLEAN,
              description: 'True if item is packed, false if unpacked.',
            },
          },
          required: ['itemName', 'isPacked'],
        },
      },
    ],
  },
];

interface ExecuteOptions {
  schema?: Schema;
  systemInstruction?: string;
  temperature?: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getGenAI = (): GoogleGenerativeAI => {
  const activeKey = apiClient.getEffectiveGeminiKey();
  if (!activeKey || activeKey === 'your_gemini_api_key_here') {
    throw new Error(
      'Gemini API key is missing or not configured. Please add your key in the Profile tab (BYOK) or in your .env file.',
    );
  }
  if (!genAI || (genAI as any)._keyUsed !== activeKey) {
    genAI = new GoogleGenerativeAI(activeKey);
    (genAI as any)._keyUsed = activeKey;
  }
  return genAI;
};

const executeWithFallback = async (
  prompt: string,
  options?: ExecuteOptions | Schema,
): Promise<string> => {
  const ai = getGenAI();

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

        const model = ai.getGenerativeModel(modelParams);
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

        // If key is invalid (400 / API_KEY_INVALID), fail immediately with a clear error
        if (
          msg.includes('API key not valid') ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('API key expired')
        ) {
          throw new Error(
            'Your Gemini API key is invalid or expired. Please check your key in the Profile tab.',
          );
        }

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
  // If BFF mode is selected, route through serverless edge proxy
  if (apiClient.getOperatingMode() === 'bff') {
    try {
      return await apiClient.generateItineraryViaBff(request);
    } catch (bffError) {
      console.warn(
        '[BFF] Proxy failed, falling back to direct client generation:',
        bffError,
      );
    }
  }

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
  onExecuteTool?: (action: AgentAction) => Promise<any> | any;
}

export interface CopilotChatResult {
  replyText: string;
  executedActions: AgentAction[];
}

/**
 * Autonomous conversational travel concierge powered by Gemini Agent Tools (Function Calling)
 */
export const chatWithTravelCopilot = async (
  params: CopilotChatParams,
): Promise<CopilotChatResult> => {
  const ai = getGenAI();

  const systemInstruction = `
    You are ItinerAI Copilot, a sophisticated, enthusiastic, and deeply knowledgeable local travel guide, concierge, and autonomous action agent in ${
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

    AGENTIC TOOL CAPABILITIES:
    You are equipped with real tools to modify the traveler's schedule and trigger native phone actions:
    1. 'addActivityToSchedule': Call this whenever the user asks to add, insert, or book an attraction, meal, drink, or activity to Day 1, Day 2, etc. Provide accurate category, location, and coordinates.
    2. 'removeActivityFromSchedule': Call this when the user asks to remove, cancel, or drop an activity or stop from a specific day.
    3. 'openNavigationDirections': Call this when the user asks for directions, route, or to open a map for any landmark or venue.
    4. 'togglePackingItemStatus': Call this when the user asks to mark an item as packed or unpacked in their packing checklist.

    CONVERSATIONAL GUIDELINES:
    1. Always tailor answers specifically to ${params.destination}.
    2. When a tool is executed, confirm the action warmly in your text response and share a valuable local insider tip about the spot.
    3. Keep responses punchy, helpful, and scannable for a traveler looking at their phone on the go.
    4. Use markdown bullet points and bolding for readability.
    5. Maintain an encouraging, warm, and professional tone.
  `;

  // Format previous conversation history for startChat
  // Gemini requires the first message in history to have role 'user'
  const firstUserIdx = params.messages.findIndex(m => m.role === 'user');
  const priorMessages =
    firstUserIdx >= 0 ? params.messages.slice(firstUserIdx, -1) : [];

  const chatHistory = priorMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{text: m.text}],
  }));

  const latestUserMessage =
    params.messages[params.messages.length - 1]?.text ||
    'Hello Copilot, how can you help me today?';

  let lastError: any = null;

  // 1. Attempt agentic turn with function calling across candidate models
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        tools: copilotTools,
        systemInstruction,
        generationConfig: {
          temperature: 0.7,
        },
      });

      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(latestUserMessage);
      const response = await result.response;
      const functionCalls = response.functionCalls();

      const executedActions: AgentAction[] = [];

      if (functionCalls && functionCalls.length > 0) {
        const functionResponses = [];

        for (const call of functionCalls) {
          const args = (call.args as Record<string, any>) || {};
          let action: AgentAction | null = null;

          if (call.name === 'addActivityToSchedule') {
            const rawDay = Number(args.dayNumber);
            const dayNum = isNaN(rawDay) || rawDay < 1 ? 1 : rawDay;
            action = {
              id: `act_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,
              type: 'add_activity',
              title: `Added "${args.name}" to Day ${dayNum}`,
              details: `${args.time || 'Flexible'} · ${
                args.location || params.destination
              }`,
              timestamp: Date.now(),
              metadata: {
                dayNumber: dayNum,
                activity: {
                  time: args.time || '10:00 AM',
                  name: args.name,
                  location: args.location || params.destination,
                  description: args.description || '',
                  category: args.category || 'other',
                  estimatedCost: args.estimatedCost || 'Moderate',
                  coordinates:
                    args.latitude && args.longitude
                      ? {
                          latitude: Number(args.latitude),
                          longitude: Number(args.longitude),
                        }
                      : undefined,
                },
              },
            };
          } else if (call.name === 'removeActivityFromSchedule') {
            const rawDay = Number(args.dayNumber);
            const dayNum = isNaN(rawDay) || rawDay < 1 ? 1 : rawDay;
            action = {
              id: `act_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,
              type: 'remove_activity',
              title: `Removed "${args.activityName}" from Day ${dayNum}`,
              timestamp: Date.now(),
              metadata: {
                dayNumber: dayNum,
                activityName: args.activityName,
              },
            };
          } else if (call.name === 'openNavigationDirections') {
            action = {
              id: `act_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,
              type: 'open_directions',
              title: `Directions to "${args.destinationName}"`,
              details:
                args.latitude && args.longitude
                  ? `${Number(args.latitude).toFixed(4)}, ${Number(
                      args.longitude,
                    ).toFixed(4)}`
                  : 'Opening Maps...',
              timestamp: Date.now(),
              metadata: {
                destinationName: args.destinationName,
                latitude: args.latitude ? Number(args.latitude) : undefined,
                longitude: args.longitude ? Number(args.longitude) : undefined,
              },
            };
          } else if (call.name === 'togglePackingItemStatus') {
            const isPacked = Boolean(args.isPacked);
            action = {
              id: `act_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,
              type: 'toggle_packing',
              title: `${isPacked ? 'Packed' : 'Unpacked'}: "${args.itemName}"`,
              timestamp: Date.now(),
              metadata: {
                itemName: args.itemName,
                isPacked,
              },
            };
          }

          if (action) {
            executedActions.push(action);
            if (params.onExecuteTool) {
              await params.onExecuteTool(action);
            }
          }

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: {
                status: 'success',
                message: action ? action.title : 'Action executed successfully',
              },
            },
          });
        }

        // Send function execution results back to Gemini to obtain conversational confirmation
        const followUp = await chat.sendMessage(functionResponses);
        const followUpResponse = await followUp.response;
        return {
          replyText: followUpResponse.text().trim(),
          executedActions,
        };
      }

      // No tools called; standard conversational response
      return {
        replyText: response.text().trim(),
        executedActions: [],
      };
    } catch (err: any) {
      lastError = err;
      console.warn(
        `Agentic Copilot with model ${modelName} encountered issue:`,
        err?.message || err,
      );
    }
  }

  // 2. Resilient Fallback: If all tool-calling attempts failed, fall back to standard text conversation
  try {
    const conversationHistory = params.messages
      .map(m => `${m.role === 'user' ? 'Traveler' : 'Copilot'}: ${m.text}`)
      .join('\n\n');

    const fallbackPrompt = `
      CONVERSATION SO FAR:
      ${conversationHistory}

      Reply as ItinerAI Copilot to the traveler's latest message with insightful, context-grounded travel advice.
    `;

    const text = await executeWithFallback(fallbackPrompt, {
      systemInstruction,
      temperature: 0.8,
    });

    return {
      replyText: text.trim(),
      executedActions: [],
    };
  } catch (err) {
    console.error('Final fallback Copilot chat failed:', err);
    throw lastError || err;
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

/**
 * Validates a Gemini API key against the real Gemini 1.5 Flash endpoint
 */
export const validateGeminiKey = async (
  keyToTest?: string,
): Promise<{valid: boolean; message: string}> => {
  const key = keyToTest?.trim() || apiClient.getEffectiveGeminiKey();
  if (!key || key === 'your_gemini_api_key_here') {
    return {
      valid: false,
      message: 'No API key provided. Please paste your Gemini key.',
    };
  }

  try {
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({model: 'gemini-flash-latest'});
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();
    if (text) {
      return {valid: true, message: 'Key is valid and connected to Gemini 1.5 Flash!'};
    }
    return {valid: false, message: 'Received empty response from Gemini.'};
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
      return {
        valid: false,
        message: 'Invalid API key. Please check your key on Google AI Studio.',
      };
    }
    if (msg.includes('quota') || msg.includes('429')) {
      return {
        valid: false,
        message: 'Quota exceeded or rate limited (429) on this key.',
      };
    }
    return {valid: false, message: `Validation failed: ${msg.slice(0, 100)}`};
  }
};
