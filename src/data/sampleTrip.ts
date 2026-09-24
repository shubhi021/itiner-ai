import {
  Itinerary,
  PackingItem,
  DestinationInsights,
  BudgetForecast,
} from '../types/trip';
import {WeatherData} from '../services/weatherService';

export interface SampleTripData {
  itinerary: Itinerary;
  weather: WeatherData;
  packingList: PackingItem[];
  insights: DestinationInsights;
  budgetForecast: BudgetForecast;
  budgetTier: 'low' | 'mid' | 'high';
}

export const KYOTO_SAMPLE_TRIP: SampleTripData = {
  budgetTier: 'mid',
  itinerary: {
    destination: 'Kyoto, Japan',
    days: [
      {
        day: 1,
        activities: [
          {
            name: 'Kiyomizu-dera Temple',
            time: '08:30 AM',
            description:
              'Iconic hillside wooden temple offering sweeping views over Kyoto and the Otowa Waterfall.',
            location: '1 Chome-294 Kiyomizu, Higashiyama Ward, Kyoto',
            coordinates: {latitude: 34.9949, longitude: 135.785},
            estimatedCost: '¥400',
            category: 'landmark',
          },
          {
            name: 'Ninenzaka & Sannenzaka Slopes',
            time: '11:00 AM',
            description:
              'Charming preserved stone-paved streets with traditional wooden machiya houses, crafts, and tea shops.',
            location: 'Higashiyama Ward, Kyoto',
            coordinates: {latitude: 34.9984, longitude: 135.782},
            estimatedCost: 'Free',
            category: 'shopping',
          },
          {
            name: 'Nishiki Market Street Food Tour',
            time: '01:00 PM',
            description:
              'Known as "Kyoto\'s Kitchen", featuring five blocks of skewers, matcha sweets, and savory seafood delicacies.',
            location: 'Nakagyo Ward, Kyoto',
            coordinates: {latitude: 35.005, longitude: 135.7649},
            estimatedCost: '¥1,800',
            category: 'food',
          },
          {
            name: 'Fushimi Inari-taisha Torii Paths',
            time: '04:30 PM',
            description:
              'Hike through thousands of vermilion torii gates winding up the sacred Mount Inari at golden hour.',
            location: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
            coordinates: {latitude: 34.9671, longitude: 135.7727},
            estimatedCost: 'Free',
            category: 'nature',
          },
          {
            name: 'Gion District Evening Walk & Kaiseki',
            time: '07:30 PM',
            description:
              'Atmospheric lantern-lit alleys along Shirakawa canal, followed by a multi-course seasonal Kyoto Kaiseki dinner.',
            location: 'Gion, Higashiyama Ward, Kyoto',
            coordinates: {latitude: 35.0037, longitude: 135.7772},
            estimatedCost: '¥5,500',
            category: 'nightlife',
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            name: 'Arashiyama Bamboo Grove',
            time: '08:00 AM',
            description:
              'Towering emerald bamboo forest pathways with early morning serenity and gentle rustling sounds.',
            location: 'Ukyo Ward, Kyoto',
            coordinates: {latitude: 35.0169, longitude: 135.6713},
            estimatedCost: 'Free',
            category: 'nature',
          },
          {
            name: 'Tenryu-ji Temple & Sogenchi Garden',
            time: '10:00 AM',
            description:
              'Celebrated 14th-century Zen temple featuring a landscape garden reflecting Arashiyama mountains.',
            location: '68 Sagatenryuji Susukinobabacho, Ukyo Ward, Kyoto',
            coordinates: {latitude: 35.0158, longitude: 135.6776},
            estimatedCost: '¥500',
            category: 'landmark',
          },
          {
            name: 'Yudofu (Simmered Tofu) Lunch',
            time: '12:45 PM',
            description:
              'Traditional Arashiyama specialty of smooth artisan tofu simmered in kelp broth with savory condiments.',
            location: 'Sagano, Ukyo Ward, Kyoto',
            coordinates: {latitude: 35.0175, longitude: 135.675},
            estimatedCost: '¥2,400',
            category: 'food',
          },
          {
            name: 'Kinkaku-ji (Golden Pavilion)',
            time: '03:15 PM',
            description:
              'Striking Zen temple whose top two floors are completely covered in brilliant gold leaf overlooking the pond.',
            location: '1 Kinkakujicho, Kita Ward, Kyoto',
            coordinates: {latitude: 35.0394, longitude: 135.7292},
            estimatedCost: '¥500',
            category: 'landmark',
          },
          {
            name: 'Pontocho Alley Riverfront Dining',
            time: '07:00 PM',
            description:
              'Narrow historic corridor along the Kamogawa River with lively yakitori, izakayas, and summer kawayuka dining.',
            location: 'Pontocho, Nakagyo Ward, Kyoto',
            coordinates: {latitude: 35.0054, longitude: 135.771},
            estimatedCost: '¥3,800',
            category: 'food',
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            name: 'Nijo Castle & Nightingale Floors',
            time: '09:00 AM',
            description:
              'Edo-era Shogun residence renowned for ornate woodcarvings and squeaking security floors that sing like birds.',
            location: '541 Nijojocho, Nakagyo Ward, Kyoto',
            coordinates: {latitude: 35.0142, longitude: 135.7481},
            estimatedCost: '¥800',
            category: 'landmark',
          },
          {
            name: 'Uji Matcha Tea Ceremony Workshop',
            time: '11:45 AM',
            description:
              'Hands-on authentic tea whisking ceremony led by a licensed tea master with artisan seasonal wagashi sweets.',
            location: 'Shimogyo Ward, Kyoto',
            coordinates: {latitude: 35.008, longitude: 135.76},
            estimatedCost: '¥2,800',
            category: 'other',
          },
          {
            name: 'Kyoto International Manga Museum',
            time: '02:30 PM',
            description:
              'Converted 1929 elementary school housing over 300,000 manga volumes, historical exhibitions, and lawn reading.',
            location: 'Nakagyo Ward, Kyoto',
            coordinates: {latitude: 35.0121, longitude: 135.7594},
            estimatedCost: '¥900',
            category: 'landmark',
          },
          {
            name: 'Kyoto Station Skyway & Ramen Street',
            time: '06:00 PM',
            description:
              'Futuristic steel-and-glass transit hub with panoramic 11th-floor observation skywalk and regional ramen tastings.',
            location: 'Higashishiokojicho, Shimogyo Ward, Kyoto',
            coordinates: {latitude: 34.9858, longitude: 135.7588},
            estimatedCost: '¥1,300',
            category: 'food',
          },
        ],
      },
    ],
  },
  weather: {
    temp: 21,
    condition: 'Clouds',
    description: 'Partly cloudy with pleasant breeze',
    humidity: 58,
    windSpeed: 3.5,
    icon: '02d',
    cityName: 'Kyoto',
  },
  packingList: [
    {
      id: 'pack-1',
      name: 'Comfortable slip-on walking shoes',
      category: 'Clothing',
      packed: true,
      tip: 'Temples require frequently removing and putting on shoes at entry.',
    },
    {
      id: 'pack-2',
      name: 'Breathable socks without holes',
      category: 'Clothing',
      packed: true,
      tip: 'You will walk barefoot/in socks across historic temple tatami and wooden floors.',
    },
    {
      id: 'pack-3',
      name: 'Pocket WiFi / eSim card',
      category: 'Tech & Adapters',
      packed: true,
      tip: 'Crucial for real-time train navigation and transit translation.',
    },
    {
      id: 'pack-4',
      name: 'Portable power bank (10,000mAh)',
      category: 'Tech & Adapters',
      packed: false,
      tip: 'Heavy camera and map navigation drains battery quickly during full-day explorations.',
    },
    {
      id: 'pack-5',
      name: 'Compact travel umbrella',
      category: 'Weather Gear',
      packed: false,
      tip: 'Kyoto weather can shift quickly near surrounding mountain hills.',
    },
    {
      id: 'pack-6',
      name: 'Passport & physical cash (JPY)',
      category: 'Documents',
      packed: true,
      tip: 'Many temple admissions, ticket vending machines, and market stalls accept cash only.',
    },
    {
      id: 'pack-7',
      name: 'Small plastic bag for trash',
      category: 'Other',
      packed: false,
      tip: 'Public trash cans are rare on Japanese streets; carry waste until returning to hotel.',
    },
  ],
  insights: {
    tippingCulture:
      'No tipping is practiced anywhere in Japan. Exceptional service is built into hospitality (Omotenashi); leaving extra cash will cause staff to chase you down to return it.',
    transitTips: [
      'Load an IC card (ICOCA, Suica, or Pasmo) on your phone or buy a card at Kyoto Station for seamless bus/subway taps.',
      'Kyoto City Buses board from the rear and exit from the front (pay the flat ¥230 fare upon exit).',
      'Local buses can get crowded during peak blossom/foliage seasons; utilize the Karasuma & Tozai subway lines where possible.',
    ],
    culturalEtiquette: {
      dos: [
        'Bow slightly when greeting, thanking, or saying goodbye.',
        'Carry trash with you as public street bins are very rare.',
        'Keep voice down on subways and buses; place phones on silent mode ("Manner Mode").',
        'Use both hands when receiving business cards or change on payment trays.',
      ],
      donts: [
        'Never stick chopsticks vertically into rice bowls (associated with Buddhist funeral rituals).',
        'Do not walk while eating street food; enjoy it stationary near the vendor stall.',
        'Avoid speaking on mobile phone calls inside trains or buses.',
        'Never wear shoes onto tatami mats or inside designated temple halls.',
      ],
    },
    emergencyNumbers: {
      police: '110',
      ambulance: '119',
      general: '050-3816-2720 (Japan National Tourism Organization Helpline)',
    },
    essentialPhrases: [
      {
        phrase: 'Arigatou gozaimasu',
        translation: 'Thank you very much',
        pronunciation: 'ah-ree-GAH-toh goh-zeye-MAHS',
      },
      {
        phrase: 'Sumimasen',
        translation: 'Excuse me / Sorry',
        pronunciation: 'soo-mee-mah-SEN',
      },
      {
        phrase: 'Kore wa ikura desu ka?',
        translation: 'How much is this?',
        pronunciation: 'KOH-reh wah ee-KOO-rah des kah',
      },
      {
        phrase: 'O-kaikei kudasai',
        translation: 'The bill / check, please',
        pronunciation: 'oh-KYE-kay koo-dah-SYE',
      },
      {
        phrase: 'Eigo ga hanasemasu ka?',
        translation: 'Do you speak English?',
        pronunciation: 'AY-goh gah hah-nah-seh-MAHS kah',
      },
    ],
  },
  budgetForecast: {
    totalEstimated: '¥54,800 (~$360 USD)',
    currency: 'JPY',
    dailyAverage: '¥18,200/day',
    categories: [
      {
        category: 'Accommodation',
        estimated: '¥26,000',
        percentage: 47,
        tip: 'Ryokans and boutique hotels around Karasuma or Kyoto Station balance transit access and price.',
      },
      {
        category: 'Dining & Street Food',
        estimated: '¥16,500',
        percentage: 30,
        tip: 'Try department store basement food halls (Depachika) after 7 PM for discounted gourmet dinner sets.',
      },
      {
        category: 'Temple Entrances & Activities',
        estimated: '¥7,500',
        percentage: 14,
        tip: 'Most shrine grounds are free; temple interior Zen rock gardens typically charge ¥400–¥800.',
      },
      {
        category: 'Local Transit (Bus & Metro)',
        estimated: '¥4,800',
        percentage: 9,
        tip: 'Kyoto Subway & Bus 1-Day Pass (¥1,100) breaks even after just three to four rides.',
      },
    ],
    moneySavingTips: [
      'Take advantage of early morning temple openings (like Fushimi Inari at dawn) for zero entry cost and zero crowds.',
      'Refill water bottles at your hotel; bottled water from convenience stores adds up quickly.',
      'Purchase lunch sets (Teishoku) rather than dinner sets; restaurants offer identical quality menus at 40% lower prices at midday.',
    ],
  },
};
