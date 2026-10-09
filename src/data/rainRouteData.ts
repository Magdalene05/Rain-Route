export type Language = 'en' | 'ta';

export interface VehicleOption {
  id: 'two_wheeler' | 'hatchback' | 'sedan' | 'suv' | 'bus';
  nameEn: string;
  nameTa: string;
  groundClearanceMm: number;
  safeWaterDepthCm: number;
  travelMode: 'DRIVING' | 'TWO_WHEELER';
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'two_wheeler',
    nameEn: 'Two-Wheeler / Bike',
    nameTa: 'இருசக்கர வாகனம்',
    groundClearanceMm: 160,
    safeWaterDepthCm: 12,
    travelMode: 'TWO_WHEELER',
  },
  {
    id: 'hatchback',
    nameEn: 'Compact / Hatchback',
    nameTa: 'சிறிய கார் (Hatchback)',
    groundClearanceMm: 165,
    safeWaterDepthCm: 15,
    travelMode: 'DRIVING',
  },
  {
    id: 'sedan',
    nameEn: 'Sedan',
    nameTa: 'செடான் கார் (Sedan)',
    groundClearanceMm: 170,
    safeWaterDepthCm: 18,
    travelMode: 'DRIVING',
  },
  {
    id: 'suv',
    nameEn: 'SUV / Crossover',
    nameTa: 'எஸ்.யூ.வி (SUV)',
    groundClearanceMm: 210,
    safeWaterDepthCm: 30,
    travelMode: 'DRIVING',
  },
  {
    id: 'bus',
    nameEn: 'Heavy Vehicle / Bus',
    nameTa: 'பேருந்து / கனரக வாகனம்',
    groundClearanceMm: 260,
    safeWaterDepthCm: 42,
    travelMode: 'DRIVING',
  },
];

export interface FloodSensorZone {
  id: string;
  city: string;
  nameEn: string;
  nameTa: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  waterDepthCm: number;
  rainfallMmHr: number;
  severity: 'low' | 'moderate' | 'severe';
  statusEn: string;
  statusTa: string;
  updatedAt: string;
  verifiedReports: number;
}

export interface MonitoredCityRegion {
  city: string;
  nameTa: string;
  lat: number;
  lng: number;
  coverageRadiusKm: number;
  imdStation: string;
  currentRainfallMm: number;
  alertLevel: 'Normal' | 'Yellow Watch' | 'Orange Alert' | 'Red Warning';
}

export const MONITORED_CITIES: MonitoredCityRegion[] = [
  {
    city: 'Thoothukudi',
    nameTa: 'தூத்துக்குடி',
    lat: 8.7642,
    lng: 78.1348,
    coverageRadiusKm: 28,
    imdStation: 'IMD Thoothukudi Coastal AWS',
    currentRainfallMm: 64.5,
    alertLevel: 'Orange Alert',
  },
  {
    city: 'Chennai',
    nameTa: 'சென்னை',
    lat: 13.0827,
    lng: 80.2707,
    coverageRadiusKm: 35,
    imdStation: 'IMD Nungambakkam & Meenambakkam Doppler',
    currentRainfallMm: 78.2,
    alertLevel: 'Orange Alert',
  },
  {
    city: 'Madurai',
    nameTa: 'மதுரை',
    lat: 9.9252,
    lng: 78.1198,
    coverageRadiusKm: 22,
    imdStation: 'IMD Madurai South Basin Station',
    currentRainfallMm: 38.0,
    alertLevel: 'Yellow Watch',
  },
  {
    city: 'Tirunelveli',
    nameTa: 'திருநெல்வேலி',
    lat: 8.7139,
    lng: 77.7567,
    coverageRadiusKm: 22,
    imdStation: 'IMD Thamirabarani River Telemetry',
    currentRainfallMm: 52.4,
    alertLevel: 'Yellow Watch',
  },
];

export const INITIAL_FLOOD_ZONES: FloodSensorZone[] = [
  // Thoothukudi zones
  {
    id: 'tut-1',
    city: 'Thoothukudi',
    nameEn: 'Palayamkottai Road Old Bus Stand Low-Point',
    nameTa: 'பாளையங்கோட்டை சாலை பழைய பேருந்து நிலையம்',
    lat: 8.8012,
    lng: 78.1462,
    radiusMeters: 450,
    waterDepthCm: 34,
    rainfallMmHr: 68,
    severity: 'severe',
    statusEn: 'Severe waterlogging — Avoid low-clearance vehicles',
    statusTa: 'கடுமையான நீர் தேக்கம் — தாழ்வான வாகனங்களைத் தவிர்க்கவும்',
    updatedAt: '6 mins ago',
    verifiedReports: 19,
  },
  {
    id: 'tut-2',
    city: 'Thoothukudi',
    nameEn: 'WGC Road & VOC Market Junction',
    nameTa: 'டபிள்யூ.ஜி.சி சாலை & வி.ஓ.சி மார்க்கெட் சந்திப்பு',
    lat: 8.8054,
    lng: 78.1531,
    radiusMeters: 380,
    waterDepthCm: 22,
    rainfallMmHr: 62,
    severity: 'moderate',
    statusEn: 'Moderate ankle-to-knee waterlogging on curb lanes',
    statusTa: 'சாலை ஓரங்களில் மிதமான நீர் தேக்கம்',
    updatedAt: '14 mins ago',
    verifiedReports: 11,
  },
  {
    id: 'tut-3',
    city: 'Thoothukudi',
    nameEn: 'Bryant Nagar 5th Street & Buckle Canal Crossing',
    nameTa: 'பிரையண்ட் நகர் 5வது தெரு & பக்கிள் கால்வாய்',
    lat: 8.7889,
    lng: 78.1415,
    radiusMeters: 520,
    waterDepthCm: 46,
    rainfallMmHr: 74,
    severity: 'severe',
    statusEn: 'Canal overflow reported — Road blocked for cars/bikes',
    statusTa: 'கால்வாய் நீர் வழிதல் — போக்குவரத்து தடைசெய்யப்பட்டுள்ளது',
    updatedAt: '4 mins ago',
    verifiedReports: 27,
  },
  {
    id: 'tut-4',
    city: 'Thoothukudi',
    nameEn: '3rd Mile Bypass Underpass',
    nameTa: '3வது மைல் பைபாஸ் சுரங்கப்பாதை',
    lat: 8.7955,
    lng: 78.1185,
    radiusMeters: 350,
    waterDepthCm: 14,
    rainfallMmHr: 48,
    severity: 'low',
    statusEn: 'Minor surface runoff — Passable with caution',
    statusTa: 'லேசான மழைநீர் ஓட்டம் — கவனத்துடன் செல்லலாம்',
    updatedAt: '21 mins ago',
    verifiedReports: 7,
  },
  // Chennai zones
  {
    id: 'maa-1',
    city: 'Chennai',
    nameEn: 'Velachery Vijayanagar MRTS Underpass',
    nameTa: 'வேளச்சேரி விஜயநகர் சுரங்கப்பாதை',
    lat: 12.9784,
    lng: 80.2209,
    radiusMeters: 600,
    waterDepthCm: 48,
    rainfallMmHr: 84,
    severity: 'severe',
    statusEn: 'Deep waterlogging — Submergence hazard for sedans/hatchbacks',
    statusTa: 'ஆழமான நீர் தேக்கம் — சிறிய கார்கள் செல்ல வேண்டாம்',
    updatedAt: '3 mins ago',
    verifiedReports: 42,
  },
  {
    id: 'maa-2',
    city: 'Chennai',
    nameEn: 'T. Nagar Panagal Park & Usman Road Flyover Entry',
    nameTa: 'டி. நகர் பனகல் பார்க் & உஸ்மான் சாலை',
    lat: 13.0418,
    lng: 80.2341,
    radiusMeters: 480,
    waterDepthCm: 24,
    rainfallMmHr: 71,
    severity: 'moderate',
    statusEn: 'Moderate waterlogging — Slow moving traffic',
    statusTa: 'மிதமான நீர் தேக்கம் — மெதுவான போக்குவரத்து',
    updatedAt: '11 mins ago',
    verifiedReports: 24,
  },
  {
    id: 'maa-3',
    city: 'Chennai',
    nameEn: 'Guindy Kathipara Grade Separator Slip Road',
    nameTa: 'கிண்டி கத்திப்பாரா இணைப்புச் சாலை',
    lat: 13.0067,
    lng: 80.2045,
    radiusMeters: 420,
    waterDepthCm: 16,
    rainfallMmHr: 58,
    severity: 'moderate',
    statusEn: 'Water accumulation on left lane — SUVs/Buses safe',
    statusTa: 'இடது புற சாலையில் நீர் தேக்கம்',
    updatedAt: '18 mins ago',
    verifiedReports: 15,
  },
  // Madurai & Tirunelveli zones
  {
    id: 'ixm-1',
    city: 'Madurai',
    nameTa: 'பெரியார் பேருந்து நிலையம் ரயில்வே சுரங்கப்பாதை',
    nameEn: 'Periyar Bus Stand Railway Underbridge',
    lat: 9.9159,
    lng: 78.1118,
    radiusMeters: 400,
    waterDepthCm: 29,
    rainfallMmHr: 44,
    severity: 'moderate',
    statusEn: 'Underbridge water accumulation — Two-wheelers avoid',
    statusTa: 'சுரங்கப்பாதையில் நீர் தேக்கம் — இருசக்கர வாகனங்கள் தவிர்க்கவும்',
    updatedAt: '19 mins ago',
    verifiedReports: 14,
  },
  {
    id: 'ten-1',
    city: 'Tirunelveli',
    nameEn: 'Tirunelveli Junction Two-Tier Bridge Lower Road',
    nameTa: 'திருநெல்வேலி சந்திப்பு ஈரடுக்கு மேம்பாலம் கீழ் சாலை',
    lat: 8.7285,
    lng: 77.7086,
    radiusMeters: 450,
    waterDepthCm: 32,
    rainfallMmHr: 55,
    severity: 'severe',
    statusEn: 'Heavy waterlogging — Use upper flyover deck only',
    statusTa: 'கடுமையான நீர் தேக்கம் — மேம்பாலத்தை பயன்படுத்தவும்',
    updatedAt: '9 mins ago',
    verifiedReports: 21,
  },
];

export interface CommunityReport {
  id: string;
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  waterDepthCm: number;
  severity: 'low' | 'moderate' | 'severe';
  description: string;
  reporterBadge: string;
  reporterName: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  verifiedByAi: boolean;
}

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-101',
    locationName: 'Bryant Nagar 5th Street, Thoothukudi',
    city: 'Thoothukudi',
    lat: 8.7889,
    lng: 78.1415,
    waterDepthCm: 45,
    severity: 'severe',
    description: 'Buckle canal water has entered the main cross road. Knee-deep water, two cars stalled near the junction.',
    reporterBadge: 'Flood Guardian · Lvl 4',
    reporterName: 'Anonymous Commuter #409',
    timestamp: '4 mins ago',
    upvotes: 29,
    downvotes: 1,
    verifiedByAi: true,
  },
  {
    id: 'rep-102',
    locationName: 'Palayamkottai Road near Old Bus Stand, Thoothukudi',
    city: 'Thoothukudi',
    lat: 8.8012,
    lng: 78.1462,
    waterDepthCm: 34,
    severity: 'severe',
    description: 'Heavy waterlogging across both lanes. Bikes and hatchbacks are turning back toward Millerpuram.',
    reporterBadge: 'Verified Citizen · Lvl 3',
    reporterName: 'Karthik S.',
    timestamp: '8 mins ago',
    upvotes: 19,
    downvotes: 0,
    verifiedByAi: true,
  },
  {
    id: 'rep-103',
    locationName: 'Velachery MRTS Station Road, Chennai',
    city: 'Chennai',
    lat: 12.9784,
    lng: 80.2209,
    waterDepthCm: 48,
    severity: 'severe',
    description: 'Water level above 45cm under the bridge. Traffic diverted toward 100 Feet Bypass Road.',
    reporterBadge: 'Monsoon Sentinel · Lvl 5',
    reporterName: 'Priya R.',
    timestamp: '12 mins ago',
    upvotes: 44,
    downvotes: 2,
    verifiedByAi: true,
  },
  {
    id: 'rep-104',
    locationName: 'WGC Road Market Arch, Thoothukudi',
    city: 'Thoothukudi',
    lat: 8.8054,
    lng: 78.1531,
    waterDepthCm: 22,
    severity: 'moderate',
    description: 'Curb lanes have about 20cm water. Center lane is passable for sedans and SUVs at slow speed.',
    reporterBadge: 'Active Scout · Lvl 2',
    reporterName: 'Anonymous Commuter #118',
    timestamp: '16 mins ago',
    upvotes: 12,
    downvotes: 0,
    verifiedByAi: true,
  },
];

export interface CachedOfflineMapPack {
  id: string;
  regionNameEn: string;
  regionNameTa: string;
  sizeMb: number;
  lastSynced: string;
  status: 'cached' | 'available' | 'downloading';
  zonesCount: number;
  safeCorridors: string[];
  emergencyShelters: string[];
  center: { lat: number; lng: number };
}

export const INITIAL_OFFLINE_PACKS: CachedOfflineMapPack[] = [
  {
    id: 'pack-tut',
    regionNameEn: 'Thoothukudi Corporation & NH-138 Corridor',
    regionNameTa: 'தூத்துக்குடி மாநகராட்சி & NH-138 வழித்தடம்',
    sizeMb: 18.4,
    lastSynced: 'Synced today, 02:45 AM',
    status: 'cached',
    zonesCount: 14,
    safeCorridors: [
      'St. Mother Theresa Engg College (Vagaikulam) -> NH-138 -> Tiruchendur High Elevation Bypass',
      'Millerpuram Elevated Flyover -> Collectorate Office -> New Harbour Port Express Road',
      'Ettayapuram Road High Ridge -> Kovilpatti NH-44 Connector',
    ],
    emergencyShelters: [
      'V.O.C. College Relief Center, Palayamkottai Road',
      'Thoothukudi Collectorate Disaster Operations Center, Korampallam',
      'St. Mother Theresa Engineering College Campus High-Ground Hub, Vagaikulam',
    ],
    center: { lat: 8.7642, lng: 78.1348 },
  },
  {
    id: 'pack-maa',
    regionNameEn: 'Chennai Metro Flood Basin (South & Central)',
    regionNameTa: 'சென்னை பெருநகர வெள்ள மண்டலம்',
    sizeMb: 34.2,
    lastSynced: 'Synced yesterday',
    status: 'cached',
    zonesCount: 28,
    safeCorridors: [
      'Anna Salai Elevated Corridor -> Kathipara Flyover -> GST Road High-Point',
      'OMR Elevated IT Expressway -> Rajiv Gandhi Salai Median Lanes',
    ],
    emergencyShelters: [
      'Greater Chennai Corporation Ripon Building Control Room',
      'Loyola College Relief Hall, Nungambakkam',
      'IIT Madras High-Ground Emergency Hub, Guindy',
    ],
    center: { lat: 13.0827, lng: 80.2707 },
  },
  {
    id: 'pack-ten-ixm',
    regionNameEn: 'Tirunelveli & Madurai Southern NH-44 Belt',
    regionNameTa: 'திருநெல்வேலி & மதுரை NH-44 நெடுஞ்சாலை',
    sizeMb: 24.8,
    lastSynced: 'Not downloaded',
    status: 'available',
    zonesCount: 19,
    safeCorridors: [
      'NH-44 Four-Lane Bypass (High Embankment) -> Virudhunagar -> Madurai Ring Road',
      'Vannarpettai High Bridge -> Palayamkottai High Ground',
    ],
    emergencyShelters: [
      'Tirunelveli Collectorate Relief Camp, Kokkirakulam',
      'Madurai Thamukkam Grounds Disaster Response Center',
    ],
    center: { lat: 9.32, lng: 77.95 },
  },
];

export interface PitchSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  category: string;
  bullets: string[];
  highlightMetric?: { label: string; value: string; context: string }[];
  quote?: string;
}

export const PITCH_DECK_SLIDES: PitchSlide[] = [
  {
    slideNumber: 1,
    title: 'RainRoute: Smart Flood-Safe Navigation for Every Rainy Day',
    subtitle: 'Team NEXUS · St. Mother Theresa Engineering College, Thoothukudi',
    category: 'Department of Computer Science & Engineering | II Year',
    bullets: [
      'Real-time flood-aware route planner combining meteorological telemetry with community verification.',
      'Built by II Year Computer Science & Engineering students at St. Mother Theresa Engineering College, Thoothukudi.',
      'Designed to protect commuters, vehicles, and emergency responders during severe monsoon downpours.',
    ],
  },
  {
    slideNumber: 2,
    title: 'Who We Are — Team NEXUS',
    subtitle: 'Connecting Solutions for Safer Roads',
    category: 'St. Mother Theresa Engineering College, Thoothukudi | CSE Department | II Year',
    bullets: [
      'We are a team of passionate Computer Science students driven by the vision to solve real-world problems using technology.',
      'Our team name "NEXUS" represents the connection between innovation and impact — bridging the gap between weather data and commuter safety.',
      'Together, we built RainRoute to help people navigate safely during heavy rainfall and flooding.',
    ],
  },
  {
    slideNumber: 3,
    title: 'Our Team Members',
    subtitle: 'St. Mother Theresa Engineering College · II Year CSE',
    category: 'Team Roster & Roles',
    bullets: [
      'N. Magdalene Ashirvatham – Team Leader',
      'A. Srini – Developer / Team Member',
      'P. Revathi – Designer / Team Member',
      'B. Benisha – Researcher / Team Member',
    ],
    quote: '"United by purpose, driven by innovation"',
  },
  {
    slideNumber: 4,
    title: 'The Problem We Solve',
    subtitle: 'Why Standard Navigation Fails During Monsoons',
    category: 'Problem Statement',
    bullets: [
      'Heavy rainfall causes sudden waterlogging on city roads.',
      'Commuters have no real-time information about flooded routes.',
      'Vehicle damage and safety risks increase during monsoons.',
      'Existing navigation apps do not account for flood conditions.',
      'Emergency services face delays due to inaccessible routes.',
      '70% of urban commuters face route confusion during heavy rains.',
    ],
  },
  {
    slideNumber: 5,
    title: 'Real-World Impact',
    subtitle: 'Quantifying Monsoon Commuter Risk',
    category: 'Impact Metrics',
    bullets: [
      '60% of vehicles damaged during waterlogging due to hydrostatic engine lock and electrical failure.',
      '3x higher accident risk on flooded roads caused by submerged potholes and open drains.',
      '45 min average delay caused by unknown waterlogged blockages and traffic gridlocks.',
    ],
    highlightMetric: [
      { label: 'Vehicles Damaged', value: '60%', context: 'During urban waterlogging' },
      { label: 'Accident Risk', value: '3x', context: 'Higher on flooded roads' },
      { label: 'Average Delay', value: '45 min', context: 'Caused by unknown blockages' },
    ],
    quote: '"During monsoons, the biggest challenge isn\'t the rain — it\'s not knowing which road is safe."',
  },
  {
    slideNumber: 6,
    title: 'Our Solution — RainRoute',
    subtitle: 'Core Pillars: Safe Routes · Real-Time Data · Community Powered',
    category: 'Solution Overview',
    bullets: [
      'RainRoute is a smart navigation app that helps commuters find safe routes during heavy rainfall and flooding.',
      'It combines real-time weather data with crowd-sourced reports to display flooded and blocked roads, and suggests the safest alternative routes.',
      'Our mission is to ensure no commuter is caught off-guard by unexpected waterlogging.',
    ],
  },
  {
    slideNumber: 7,
    title: 'How RainRoute Works',
    subtitle: 'Real-Time Four-Stage Pipeline Providing Instant Route Updates',
    category: 'System Workflow',
    bullets: [
      '01. Detect: Weather API monitors real-time rainfall data across urban catchments.',
      '02. Report: Users report flooded roads via the app with GPS coordinates and depth.',
      '03. Analyze: System processes data and maps safe routes relative to vehicle ground clearance.',
      '04. Navigate: Users get safest route alternatives in real-time.',
    ],
  },
  {
    slideNumber: 8,
    title: 'Key Features',
    subtitle: 'Comprehensive Monsoon Navigation Suite',
    category: 'Product Capabilities',
    bullets: [
      'Flood Map: Live map showing flooded and blocked roads with severity radii.',
      'Safe Routes: Intelligent alternative route suggestions tailored to vehicle clearance.',
      'User Reports: Community-driven flood reporting system with upvote accuracy verification.',
      'Weather Alerts: Notifications for incoming heavy rain exceeding threshold levels.',
      'Offline Mode: Access cached maps and safe corridors without internet connectivity.',
      'Emergency SOS: Quick access to disaster helplines and location sharing.',
    ],
  },
  {
    slideNumber: 9,
    title: 'Technology Stack',
    subtitle: 'Full-Stack Architecture & Geospatial Intelligence',
    category: 'Engineering Architecture',
    bullets: [
      'Frontend: React / React Native, Flutter UI concepts, Google Maps Platform SDK (Maps JS, Places New, Routes API).',
      'Backend: Node.js, Express.js, REST APIs.',
      'Data & Analytics: Weather APIs, Route Optimization, Real-time Spatial Processing.',
      'Database & Caching: MongoDB, Firebase, Redis Cache & Local Offline Storage.',
    ],
  },
  {
    slideNumber: 10,
    title: 'App Interface Concept',
    subtitle: 'Intuitive Design Focused on Quick, Life-Saving Decisions During Emergencies',
    category: 'UI / UX Architecture',
    bullets: [
      'Live Flood Map: Color-coded Danger Zones (Severe, Moderate, Minor runoff).',
      'Turn-by-Turn: Safe Navigation with vehicle ground-clearance safety checks.',
      'User Flood Reports: Weather Overlay & real-time community validation.',
      'Emergency Contacts: One-tap SOS dispatch and coastal/urban flood helplines.',
    ],
  },
  {
    slideNumber: 11,
    title: 'Weather Data Integration',
    subtitle: 'Data Sources: IMD · OpenWeatherMap · ISRO Satellite Data',
    category: 'Meteorological Pipeline',
    bullets: [
      'Real-time rainfall data from IMD & OpenWeatherMap.',
      'Satellite imagery for flood prediction and catchment runoff modeling.',
      'Radar data for storm tracking and rainfall intensity.',
      'Historical data analysis for chronic flood-prone zones.',
      'Automated alerts when rain exceeds threshold levels.',
    ],
  },
  {
    slideNumber: 12,
    title: 'Community Reporting System',
    subtitle: 'RainRoute Thrives on Community Participation',
    category: 'Crowdsourced Intelligence',
    bullets: [
      'One-tap flood reporting with GPS location and water depth estimation.',
      'Photo upload support for visual verification.',
      'Upvote/downvote system for report accuracy.',
      'Gamification with badges for active reporters (Flood Guardian, Monsoon Sentinel).',
      'Automated spam filtering and crowd-sourced data verification.',
      'Anonymous reporting option for user privacy.',
    ],
    quote: '"Every report makes the road safer for someone else"',
  },
  {
    slideNumber: 13,
    title: 'Benefits & Impact',
    subtitle: 'Protecting Lives, Vehicles, and Urban Mobility',
    category: 'Civic & Social Value',
    bullets: [
      'Commuter Safety: Avoid dangerous flooded roads and reach destinations safely.',
      'Time Savings: Reduce delays by knowing blocked routes in advance.',
      'Vehicle Protection: Prevent engine damage and accidents from waterlogging.',
      'Emergency Access: Help emergency services reach those in need faster.',
      'City Resilience: Build data for better urban flood management planning.',
      'Community Bond: Foster a culture of mutual help among citizens.',
    ],
  },
  {
    slideNumber: 14,
    title: 'Future Scope',
    subtitle: 'Next-Generation Urban Flood Resilience Roadmap',
    category: 'Future Roadmap',
    bullets: [
      'IoT Sensors: Deploy ultrasonic water-level sensors at flood-prone intersections for real-time data.',
      'Drone Surveillance: Use drones to assess flood severity and update maps automatically.',
      'Government Integration: Partner with municipal corporations for official flood data sharing.',
      'Multi-language Support: Expand to regional languages (Tamil, Hindi, Telugu, Malayalam) for wider accessibility across India.',
      'Vehicle Integration: Connect with car infotainment systems for in-dashboard navigation.',
    ],
  },
  {
    slideNumber: 15,
    title: 'Thank You!',
    subtitle: 'RainRoute — Navigating Safety Through Innovation',
    category: 'Team NEXUS · St. Mother Theresa Engineering College, Thoothukudi',
    bullets: [
      'N. Magdalene Ashirvatham (Team Leader)',
      'A. Srini (Developer / Team Member)',
      'P. Revathi (Designer / Team Member)',
      'B. Benisha (Researcher / Team Member)',
      'Department of Computer Science & Engineering | II Year',
    ],
  },
];

export const PRESET_LOCATIONS = [
  {
    labelEn: 'St. Mother Theresa Engg College, Thoothukudi',
    labelTa: 'செயின்ட் மதர் தெரசா பொறியியல் கல்லூரி, தூத்துக்குடி',
    address: 'St. Mother Theresa Engineering College, Vagaikulam, Thoothukudi, Tamil Nadu, India',
    lat: 8.7462,
    lng: 78.0156,
  },
  {
    labelEn: 'Thoothukudi New Bus Stand',
    labelTa: 'தூத்துக்குடி புதிய பேருந்து நிலையம்',
    address: 'New Bus Stand, Ettayapuram Road, Thoothukudi, Tamil Nadu, India',
    lat: 8.8139,
    lng: 78.1446,
  },
  {
    labelEn: 'V.O.C. Port Harbour, Thoothukudi',
    labelTa: 'வ.உ.சி துறைமுகம், தூத்துக்குடி',
    address: 'V.O.Chidambaranar Port Trust, Thoothukudi, Tamil Nadu, India',
    lat: 8.7556,
    lng: 78.1794,
  },
  {
    labelEn: 'Chennai Central Railway Station',
    labelTa: 'சென்னை சென்ட்ரல் ரயில் நிலையம்',
    address: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central Railway Station, Chennai, Tamil Nadu, India',
    lat: 13.0827,
    lng: 80.2750,
  },
  {
    labelEn: 'Velachery, Chennai',
    labelTa: 'வேளச்சேரி, சென்னை',
    address: 'Velachery, Chennai, Tamil Nadu, India',
    lat: 12.9759,
    lng: 80.2212,
  },
  {
    labelEn: 'Madurai Meenakshi Amman Temple',
    labelTa: 'மதுரை மீனாட்சி அம்மன் கோவில்',
    address: 'Meenakshi Amman Temple, Madurai, Tamil Nadu, India',
    lat: 9.9195,
    lng: 78.1193,
  },
  {
    labelEn: 'Tirunelveli Junction',
    labelTa: 'திருநெல்வேலி சந்திப்பு',
    address: 'Tirunelveli Junction Railway Station, Tirunelveli, Tamil Nadu, India',
    lat: 8.7269,
    lng: 77.7107,
  },
];
