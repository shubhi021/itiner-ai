import {
  generateItinerary,
  suggestAlternativeActivity,
  optimizeDayItinerary,
  chatWithTravelCopilot,
  generateSmartPackingList,
  generateDestinationInsights,
  generateBudgetForecast,
} from '../../src/services/llmService';
import {TripRequest, Activity} from '../../src/types/trip';

const mockGenerateContent = jest.fn();
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: mockGenerateContent,
        startChat: mockStartChat,
      })),
    })),
    SchemaType: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
      INTEGER: 'INTEGER',
      NUMBER: 'NUMBER',
      BOOLEAN: 'BOOLEAN',
    },
  };
});

describe('llmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStartChat.mockReturnValue({
      sendMessage: mockSendMessage,
    });
  });

  describe('generateItinerary', () => {
    const mockRequest: TripRequest = {
      destination: 'Rome, Italy',
      days: 3,
      budget: 'mid',
      interests: ['History', 'Food'],
      advanced: {
        pace: 'balanced',
        travelGroup: 'couple',
        dietary: ['Vegetarian'],
        stayArea: 'Trastevere',
        customNote: 'Anniversary trip',
      },
    };

    const mockGeneratedItinerary = {
      destination: 'Rome, Italy',
      days: [
        {
          day: 1,
          activities: [
            {
              time: '09:30 AM',
              name: 'Colosseum Tour',
              description: 'Explore the iconic ancient amphitheater.',
              location: 'Piazza del Colosseo',
              coordinates: {latitude: 41.8902, longitude: 12.4922},
              estimatedCost: '€18',
              category: 'landmark',
            },
          ],
        },
      ],
    };

    it('successfully generates and parses structured itinerary', async () => {
      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockGeneratedItinerary),
        }),
      });

      const result = await generateItinerary(mockRequest);
      expect(result.destination).toBe('Rome, Italy');
      expect(result.days).toHaveLength(1);
      expect(result.days[0].activities[0].name).toBe('Colosseum Tour');
    });

    it('handles fallback across candidate models on transient error', async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error('503 Service Unavailable'))
        .mockResolvedValueOnce({
          response: Promise.resolve({
            text: () => JSON.stringify(mockGeneratedItinerary),
          }),
        });

      const result = await generateItinerary(mockRequest);
      expect(result.destination).toBe('Rome, Italy');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('throws user-friendly error when all candidate models fail', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(generateItinerary(mockRequest)).rejects.toThrow(
        'Failed to generate itinerary. Please try again.',
      );
    });
  });

  describe('suggestAlternativeActivity', () => {
    const activityToReplace: Activity = {
      time: '02:00 PM',
      name: 'Outdoor Park Walk',
      description: 'Stroll around park',
      location: 'City Park',
      category: 'nature',
      coordinates: {latitude: 41.9, longitude: 12.5},
    };

    const mockAlternative: Activity = {
      time: '02:00 PM',
      name: 'Vatican Museums',
      description: 'World-famous indoor museum complex.',
      location: 'Viale Vaticano',
      category: 'landmark',
      coordinates: {latitude: 41.9067, longitude: 12.4536},
      estimatedCost: '€20',
    };

    it('successfully generates alternative activity matching bad weather and budget', async () => {
      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockAlternative),
        }),
      });

      const result = await suggestAlternativeActivity({
        destination: 'Rome, Italy',
        day: 1,
        activityToReplace,
        currentDayActivities: [activityToReplace],
        weatherCondition: 'Heavy Rain',
        reason: 'Too rainy for outdoor walk',
        budget: 'mid',
      });

      expect(result.name).toBe('Vatican Museums');
      expect(result.category).toBe('landmark');
    });

    it('throws descriptive error on failure', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI generation error'));

      await expect(
        suggestAlternativeActivity({
          destination: 'Rome, Italy',
          day: 1,
          activityToReplace,
          currentDayActivities: [activityToReplace],
        }),
      ).rejects.toThrow(
        'Failed to suggest alternative activity. Please try again.',
      );
    });
  });

  describe('optimizeDayItinerary', () => {
    const mockActivities: Activity[] = [
      {
        time: '10:00 AM',
        name: 'Pantheon',
        description: 'Historic temple',
        location: 'Piazza della Rotonda',
        category: 'landmark',
      },
    ];

    it('optimizes day activities based on preset and prompt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockActivities),
        }),
      });

      const result = await optimizeDayItinerary({
        destination: 'Rome',
        dayNumber: 1,
        existingActivities: mockActivities,
        preset: 'rain_protocol',
        customInstruction: 'Focus on covered indoor sites',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pantheon');
    });
  });

  describe('chatWithTravelCopilot', () => {
    it('handles standard conversational response without tool calls', async () => {
      mockSendMessage.mockResolvedValueOnce({
        response: Promise.resolve({
          functionCalls: () => null,
          text: () => 'Rome has wonderful pizza and gelato!',
        }),
      });

      const result = await chatWithTravelCopilot({
        destination: 'Rome, Italy',
        messages: [
          {id: '1', role: 'user', text: 'Where to eat?', timestamp: 123},
        ],
      });

      expect(result.replyText).toBe('Rome has wonderful pizza and gelato!');
      expect(result.executedActions).toEqual([]);
    });

    it('executes agent tools when model triggers function calls', async () => {
      mockSendMessage
        // First turn triggers function calls
        .mockResolvedValueOnce({
          response: Promise.resolve({
            functionCalls: () => [
              {
                name: 'addActivityToSchedule',
                args: {
                  dayNumber: 1,
                  name: 'Gelato at Giolitti',
                  time: '04:00 PM',
                  location: 'Via Uffici del Vicario 40',
                  category: 'food',
                  latitude: 41.9009,
                  longitude: 12.4777,
                },
              },
              {
                name: 'removeActivityFromSchedule',
                args: {
                  dayNumber: 2,
                  activityName: 'Crowded Tour',
                },
              },
              {
                name: 'openNavigationDirections',
                args: {
                  destinationName: 'Colosseum',
                  latitude: 41.8902,
                  longitude: 12.4922,
                },
              },
              {
                name: 'togglePackingItemStatus',
                args: {
                  itemName: 'Sunscreen',
                  isPacked: true,
                },
              },
            ],
            text: () => '',
          }),
        })
        // Second turn after tool results returns confirmation text
        .mockResolvedValueOnce({
          response: Promise.resolve({
            functionCalls: () => null,
            text: () =>
              "I've added Giolitti to Day 1 and marked Sunscreen as packed!",
          }),
        });

      const onExecuteTool = jest.fn();

      const result = await chatWithTravelCopilot({
        destination: 'Rome, Italy',
        messages: [
          {
            id: '1',
            role: 'user',
            text: 'Add Giolitti gelato and mark sunscreen packed',
            timestamp: 123,
          },
        ],
        onExecuteTool,
      });

      expect(result.executedActions).toHaveLength(4);
      expect(result.executedActions[0].type).toBe('add_activity');
      expect(result.executedActions[1].type).toBe('remove_activity');
      expect(result.executedActions[2].type).toBe('open_directions');
      expect(result.executedActions[3].type).toBe('toggle_packing');
      expect(onExecuteTool).toHaveBeenCalledTimes(4);
      expect(result.replyText).toContain('Giolitti');
    });

    it('falls back gracefully to direct prompt if function calling chat throws', async () => {
      mockSendMessage.mockRejectedValue(new Error('Tool schema failure'));
      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => 'Fallback guide response for Rome',
        }),
      });

      const result = await chatWithTravelCopilot({
        destination: 'Rome, Italy',
        messages: [
          {id: '1', role: 'user', text: 'Help me plan', timestamp: 123},
        ],
      });

      expect(result.replyText).toBe('Fallback guide response for Rome');
    });
  });

  describe('generateSmartPackingList', () => {
    it('generates organized packing items', async () => {
      const mockItems = [
        {
          name: 'Power Adapter Type C',
          category: 'Tech & Adapters',
          tip: 'Essential in Europe',
        },
      ];

      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockItems),
        }),
      });

      const result = await generateSmartPackingList({
        destination: 'Rome, Italy',
        daysCount: 4,
        weatherSummary: 'Sunny & mild Spring',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Power Adapter Type C');
      expect(result[0].category).toBe('Tech & Adapters');
    });
  });

  describe('generateDestinationInsights', () => {
    it('generates culture, etiquette, and emergency information', async () => {
      const mockInsights = {
        tippingCulture: '10% at sit-down restaurants',
        transitTips: ['Validate ticket before boarding'],
        culturalEtiquette: {
          dos: ['Cover shoulders in churches'],
          donts: ['Order cappuccino after 11am'],
        },
        emergencyNumbers: {
          police: '112',
          ambulance: '118',
          general: '112',
        },
        essentialPhrases: [{phrase: 'Grazie', translation: 'Thank you'}],
      };

      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockInsights),
        }),
      });

      const result = await generateDestinationInsights('Rome, Italy');

      expect(result.tippingCulture).toBe('10% at sit-down restaurants');
      expect(result.essentialPhrases[0].phrase).toBe('Grazie');
    });
  });

  describe('generateBudgetForecast', () => {
    it('generates complete budget breakdown and money-saving tips', async () => {
      const mockBudget = {
        totalEstimated: '€900',
        currency: 'EUR',
        dailyAverage: '€180',
        categories: [
          {
            category: 'Food & Dining',
            estimated: '€350',
            percentage: 40,
            tip: 'Eat lunch at trattorias',
          },
        ],
        moneySavingTips: ['Drink espresso at the counter'],
      };

      mockGenerateContent.mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockBudget),
        }),
      });

      const result = await generateBudgetForecast('Rome, Italy', 5, 'mid');

      expect(result.totalEstimated).toBe('€900');
      expect(result.categories[0].category).toBe('Food & Dining');
      expect(result.moneySavingTips[0]).toBe('Drink espresso at the counter');
    });
  });
});
