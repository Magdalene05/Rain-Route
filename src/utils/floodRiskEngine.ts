import {
  FloodSensorZone,
  MONITORED_CITIES,
  MonitoredCityRegion,
  VehicleOption,
} from '../data/rainRouteData';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface RouteHazardEncounter {
  zone: FloodSensorZone;
  minDistanceMeters: number;
  isPassableForVehicle: boolean;
  clearanceDeficitCm: number;
}

export interface FloodCoverageEvaluation {
  status: 'COVERED_WITH_RISKS' | 'COVERED_CLEAR' | 'PARTIAL_COVERAGE' | 'UNAVAILABLE';
  monitoredCitiesAlongRoute: MonitoredCityRegion[];
  unmonitoredPercentage: number;
  hazardsEncountered: RouteHazardEncounter[];
  maxWaterDepthCm: number;
  isVehicleSafeOverall: boolean;
  summaryTitleEn: string;
  summaryTitleTa: string;
  summaryDetailEn: string;
  summaryDetailTa: string;
}

/**
 * Haversine distance in meters between two LatLng coordinates
 */
export function haversineDistanceMeters(a: LatLngPoint, b: LatLngPoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Evaluates a calculated route path against actual flood sensor zones and monitored city footprints.
 * Never claims "0 Flood Risks" if the route passes outside monitored flood sensor coverage.
 */
export function evaluateRouteFloodRisk(
  pathPoints: LatLngPoint[],
  floodZones: FloodSensorZone[],
  vehicle: VehicleOption
): FloodCoverageEvaluation {
  if (!pathPoints || pathPoints.length === 0) {
    return {
      status: 'UNAVAILABLE',
      monitoredCitiesAlongRoute: [],
      unmonitoredPercentage: 100,
      hazardsEncountered: [],
      maxWaterDepthCm: 0,
      isVehicleSafeOverall: false,
      summaryTitleEn: 'Flood Telemetry Unavailable',
      summaryTitleTa: 'வெள்ளத் தரவு கிடைக்கவில்லை',
      summaryDetailEn: 'No route geometry available to cross-reference with flood sensors.',
      summaryDetailTa: 'வெள்ள உணரிகளுடன் ஒப்பிடுவதற்கு பாதை விவரங்கள் இல்லை.',
    };
  }

  // Sample up to 80 points along the route for accurate spatial checking
  const step = Math.max(1, Math.floor(pathPoints.length / 80));
  const sampledPoints: LatLngPoint[] = [];
  for (let i = 0; i < pathPoints.length; i += step) {
    sampledPoints.push(pathPoints[i]);
  }
  if (sampledPoints[sampledPoints.length - 1] !== pathPoints[pathPoints.length - 1]) {
    sampledPoints.push(pathPoints[pathPoints.length - 1]);
  }

  // 1. Check which monitored cities cover the sampled points
  let coveredPointCount = 0;
  const matchedCitiesMap = new Map<string, MonitoredCityRegion>();

  for (const pt of sampledPoints) {
    let pointCovered = false;
    for (const city of MONITORED_CITIES) {
      const distKm = haversineDistanceMeters(pt, { lat: city.lat, lng: city.lng }) / 1000;
      if (distKm <= city.coverageRadiusKm) {
        pointCovered = true;
        matchedCitiesMap.set(city.city, city);
      }
    }
    if (pointCovered) {
      coveredPointCount++;
    }
  }

  const coverageRatio = coveredPointCount / sampledPoints.length;
  const unmonitoredPercentage = Math.round((1 - coverageRatio) * 100);
  const monitoredCitiesAlongRoute = Array.from(matchedCitiesMap.values());

  // 2. If zero points along the route fall inside any monitored flood-sensor network,
  // explicitly report UNAVAILABLE — NEVER show "0 Flood Risks"!
  if (coveredPointCount === 0) {
    return {
      status: 'UNAVAILABLE',
      monitoredCitiesAlongRoute: [],
      unmonitoredPercentage: 100,
      hazardsEncountered: [],
      maxWaterDepthCm: 0,
      isVehicleSafeOverall: true,
      summaryTitleEn: 'Live Flood Sensor Data Unavailable for This Region',
      summaryTitleTa: 'இந்தப் பகுதிக்கு நேரடி வெள்ளத் தரவு கிடைக்கவில்லை',
      summaryDetailEn:
        'This route lies outside RainRoute’s active IMD & municipal flood-sensor coverage (Thoothukudi, Chennai, Madurai, Tirunelveli). Standard road navigation is shown; flood-risk counts are not displayed without verified sensor data.',
      summaryDetailTa:
        'இந்தப் பாதை RainRoute-ன் நேரடி வெள்ள உணரிப் பகுதிகளுக்கு (தூத்துக்குடி, சென்னை, மதுரை, திருநெல்வேலி) வெளியே உள்ளது. வழக்கமான வழிகாட்டுதல் மட்டும் காட்டப்படுகிறது.',
    };
  }

  // 3. Check intersection with active FloodSensorZones
  const hazardsEncountered: RouteHazardEncounter[] = [];
  let maxWaterDepthCm = 0;

  for (const zone of floodZones) {
    let minDistance = Infinity;
    for (const pt of sampledPoints) {
      const d = haversineDistanceMeters(pt, { lat: zone.lat, lng: zone.lng });
      if (d < minDistance) {
        minDistance = d;
      }
    }

    // Consider a zone intersecting/adjacent if the route passes within radiusMeters + 650m corridor
    if (minDistance <= zone.radiusMeters + 650) {
      const isPassable = zone.waterDepthCm <= vehicle.safeWaterDepthCm;
      const deficit = Math.max(0, zone.waterDepthCm - vehicle.safeWaterDepthCm);
      if (zone.waterDepthCm > maxWaterDepthCm) {
        maxWaterDepthCm = zone.waterDepthCm;
      }
      hazardsEncountered.push({
        zone,
        minDistanceMeters: Math.round(minDistance),
        isPassableForVehicle: isPassable,
        clearanceDeficitCm: deficit,
      });
    }
  }

  const isVehicleSafeOverall = hazardsEncountered.every((h) => h.isPassableForVehicle);
  const cityNames = monitoredCitiesAlongRoute.map((c) => c.city).join(', ');

  if (unmonitoredPercentage > 40) {
    // Intercity route where highway segments are unmonitored
    if (hazardsEncountered.length > 0) {
      return {
        status: 'PARTIAL_COVERAGE',
        monitoredCitiesAlongRoute,
        unmonitoredPercentage,
        hazardsEncountered,
        maxWaterDepthCm,
        isVehicleSafeOverall,
        summaryTitleEn: `${hazardsEncountered.length} Verified Flood Zone${hazardsEncountered.length > 1 ? 's' : ''} in Monitored Segments (${100 - unmonitoredPercentage}% Sensor Coverage)`,
        summaryTitleTa: `கண்காணிக்கப்படும் பகுதிகளில் ${hazardsEncountered.length} வெள்ள அபாயங்கள் (${100 - unmonitoredPercentage}% தரவு)`,
        summaryDetailEn: `Active flood telemetry verified within ${cityNames}. Note: ${unmonitoredPercentage}% of this intercity highway corridor has no live water-level sensors.`,
        summaryDetailTa: `${cityNames} பகுதிகளில் நேரடி வெள்ளத் தரவு சரிபார்க்கப்பட்டது. நெடுஞ்சாலையின் ${unmonitoredPercentage}% பகுதியில் நேரடி உணரிகள் இல்லை.`,
      };
    }

    return {
      status: 'PARTIAL_COVERAGE',
      monitoredCitiesAlongRoute,
      unmonitoredPercentage,
      hazardsEncountered: [],
      maxWaterDepthCm: 0,
      isVehicleSafeOverall: true,
      summaryTitleEn: `Partial Sensor Coverage (${100 - unmonitoredPercentage}% Monitored in ${cityNames})`,
      summaryTitleTa: `பகுதி அளவு வெள்ளத் தரவு (${cityNames} பகுதியில் ${100 - unmonitoredPercentage}% கண்காணிப்பு)`,
      summaryDetailEn: `No active waterlogging detected within monitored urban sensors in ${cityNames}, but ${unmonitoredPercentage}% of the intercity route lacks live flood telemetry.`,
      summaryDetailTa: `${cityNames} நகர்ப்புற உணரிகளில் நீர் தேக்கம் இல்லை; ஆனால் ${unmonitoredPercentage}% நெடுஞ்சாலைப் பகுதியில் நேரடி வெள்ளத் தரவு இல்லை.`,
    };
  }

  // Full coverage within monitored urban catchment
  if (hazardsEncountered.length > 0) {
    return {
      status: 'COVERED_WITH_RISKS',
      monitoredCitiesAlongRoute,
      unmonitoredPercentage,
      hazardsEncountered,
      maxWaterDepthCm,
      isVehicleSafeOverall,
      summaryTitleEn: `${hazardsEncountered.length} Active Flood Risk${hazardsEncountered.length > 1 ? 's' : ''} Detected Along Route`,
      summaryTitleTa: `பாதையில் ${hazardsEncountered.length} நேரடி வெள்ள அபாயங்கள் கண்டறியப்பட்டுள்ளன`,
      summaryDetailEn: isVehicleSafeOverall
        ? `Route passes near ${hazardsEncountered.length} waterlogged zone(s) in ${cityNames} (max ${maxWaterDepthCm} cm), which is within your ${vehicle.nameEn}'s ${vehicle.safeWaterDepthCm} cm safe wading limit.`
        : `CRITICAL: Route encounters ${maxWaterDepthCm} cm waterlogging in ${cityNames}, exceeding your ${vehicle.nameEn}'s ${vehicle.safeWaterDepthCm} cm safe clearance threshold.`,
      summaryDetailTa: isVehicleSafeOverall
        ? `உங்கள் வாகனத்தின் (${vehicle.safeWaterDepthCm} செ.மீ) பாதுகாப்பு வரம்பிற்குள் பாதை உள்ளது.`
        : `எச்சரிக்கை: உங்கள் வாகனத்தின் பாதுகாப்பு வரம்பை (${vehicle.safeWaterDepthCm} செ.மீ) தாண்டி ${maxWaterDepthCm} செ.மீ நீர் தேக்கம் உள்ளது.`,
    };
  }

  return {
    status: 'COVERED_CLEAR',
    monitoredCitiesAlongRoute,
    unmonitoredPercentage,
    hazardsEncountered: [],
    maxWaterDepthCm: 0,
    isVehicleSafeOverall: true,
    summaryTitleEn: `Verified Clear Corridor in ${cityNames} (Sensor-Backed)`,
    summaryTitleTa: `${cityNames} பகுதியில் பாதுகாப்பான பாதை (உணரி மூலம் உறுதிசெய்யப்பட்டது)`,
    summaryDetailEn: `Verified by live IMD & community telemetry across ${cityNames}: all monitored intersections along this route are below ${vehicle.safeWaterDepthCm} cm safe wading depth.`,
    summaryDetailTa: `நேரடி வானிலை மற்றும் சமூகத் தரவுகளின்படி இந்தப் பாதையில் வெள்ள அபாயம் இல்லை.`,
  };
}
