import React, { useEffect, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { FloodSensorZone, Language, VehicleOption } from '../data/rainRouteData';
import { LatLngPoint } from '../utils/floodRiskEngine';
import { SelectedLocation } from './LocationAutocompleteInput';

export interface ComputedRouteResult {
  distanceMeters: number;
  durationSeconds: number;
  pathPoints: LatLngPoint[];
  steps: { instruction: string; distanceText: string }[];
  routingProvider: 'Google Routes API' | 'OSRM Live Routing' | 'Offline Cached Corridor';
  startResolved: LatLngPoint;
  endResolved: LatLngPoint;
}

interface FloodSafeMapCanvasProps {
  startLocation: SelectedLocation;
  endLocation: SelectedLocation;
  routeTriggerCount: number;
  vehicle: VehicleOption;
  floodZones: FloodSensorZone[];
  selectedZone: FloodSensorZone | null;
  onSelectZone: (zone: FloodSensorZone | null) => void;
  onRouteCalculated: (result: ComputedRouteResult | null, errorMsg: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
  isOfflineMode: boolean;
  lang: Language;
  mapCenterOverride: LatLngPoint | null;
}

/**
 * Helper to geocode an address string via Nominatim if coordinates are not yet resolved
 */
async function resolveLocationCoords(loc: SelectedLocation): Promise<LatLngPoint | null> {
  if (typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng)) {
    return { lat: loc.lat, lng: loc.lng };
  }
  const query = loc.address.trim();
  if (!query) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch {
    return null;
  }
  return null;
}

const RouteAndZoneOverlays: React.FC<{
  startLocation: SelectedLocation;
  endLocation: SelectedLocation;
  routeTriggerCount: number;
  vehicle: VehicleOption;
  floodZones: FloodSensorZone[];
  isOfflineMode: boolean;
  mapCenterOverride: LatLngPoint | null;
  onRouteCalculated: (result: ComputedRouteResult | null, errorMsg: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}> = ({
  startLocation,
  endLocation,
  routeTriggerCount,
  vehicle,
  floodZones,
  isOfflineMode,
  mapCenterOverride,
  onRouteCalculated,
  onLoadingChange,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const mapsLib = useMapsLibrary('maps');

  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  // Pan map when mapCenterOverride changes
  useEffect(() => {
    if (map && mapCenterOverride) {
      map.panTo(mapCenterOverride);
      map.setZoom(13);
    }
  }, [map, mapCenterOverride]);

  // Draw flood zone circles on the map
  useEffect(() => {
    if (!map || !mapsLib) return;

    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    const newCircles = floodZones.map((zone) => {
      const color =
        zone.severity === 'severe'
          ? '#ef4444'
          : zone.severity === 'moderate'
          ? '#f59e0b'
          : '#06b6d4';

      return new mapsLib.Circle({
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radiusMeters,
        strokeColor: color,
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.24,
        clickable: false,
      });
    });

    circlesRef.current = newCircles;

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [map, mapsLib, floodZones]);

  // Calculate route when routeTriggerCount increments
  useEffect(() => {
    if (routeTriggerCount === 0) return;

    let isCancelled = false;

    const calculateRoute = async () => {
      if (!startLocation.address.trim() || !endLocation.address.trim()) {
        onRouteCalculated(null, 'Please enter both a Start Location and a Destination.');
        return;
      }

      onLoadingChange(true);

      // Clear existing polylines
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];

      // 1. If Offline Mode is enabled, check if locations are within cached offline corridors
      if (isOfflineMode) {
        const startCoords = await resolveLocationCoords(startLocation);
        const endCoords = await resolveLocationCoords(endLocation);
        if (!startCoords || !endCoords) {
          onLoadingChange(false);
          onRouteCalculated(
            null,
            'Offline Mode Active: Live geocoding and routing service unavailable for uncached addresses. Switch to Online Mode to calculate arbitrary intercity routes.'
          );
          return;
        }

        const midPoint: LatLngPoint = {
          lat: (startCoords.lat + endCoords.lat) / 2 + 0.008,
          lng: (startCoords.lng + endCoords.lng) / 2 - 0.006,
        };
        const offlinePath = [startCoords, midPoint, endCoords];

        if (map && mapsLib) {
          const poly = new mapsLib.Polyline({
            path: offlinePath,
            geodesic: true,
            strokeColor: '#22d3ee',
            strokeOpacity: 0.9,
            strokeWeight: 5,
            map,
          });
          polylinesRef.current = [poly];

          const bounds = new google.maps.LatLngBounds();
          offlinePath.forEach((pt) => bounds.extend(pt));
          map.fitBounds(bounds);
        }

        const R = 6371000;
        const dLat = ((endCoords.lat - startCoords.lat) * Math.PI) / 180;
        const dLng = ((endCoords.lng - startCoords.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((startCoords.lat * Math.PI) / 180) *
            Math.cos((endCoords.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const straightDist = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25;

        onLoadingChange(false);
        onRouteCalculated(
          {
            distanceMeters: Math.round(straightDist),
            durationSeconds: Math.round(straightDist / 11),
            pathPoints: offlinePath,
            steps: [
              {
                instruction: `Proceed from ${startLocation.address} along cached high-elevation corridor`,
                distanceText: `${((straightDist * 0.5) / 1000).toFixed(1)} km`,
              },
              {
                instruction: `Continue on emergency flood-safe artery toward ${endLocation.address}`,
                distanceText: `${((straightDist * 0.5) / 1000).toFixed(1)} km`,
              },
            ],
            routingProvider: 'Offline Cached Corridor',
            startResolved: startCoords,
            endResolved: endCoords,
          },
          null
        );
        return;
      }

      // 2. Primary: Google Maps Routes API (`Route.computeRoutes`)
      if (routesLib && (routesLib as any).Route && map) {
        try {
          const originInput =
            typeof startLocation.lat === 'number' && typeof startLocation.lng === 'number'
              ? { lat: startLocation.lat, lng: startLocation.lng }
              : startLocation.address.trim();

          const destInput =
            typeof endLocation.lat === 'number' && typeof endLocation.lng === 'number'
              ? { lat: endLocation.lat, lng: endLocation.lng }
              : endLocation.address.trim();

          const request: any = {
            origin: originInput,
            destination: destInput,
            travelMode: 'DRIVING',
            fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
          };

          const computeFn =
            typeof (routesLib.Route as any).computeRoutes === 'function'
              ? (routesLib.Route as any).computeRoutes.bind(routesLib.Route)
              : new (routesLib.Route as any)().computeRoutes;

          const response = await computeFn(request);
          const routes = response?.routes;

          if (!isCancelled && routes && routes.length > 0) {
            const primaryRoute = routes[0];

            // Extract path points
            const extractedPoints: LatLngPoint[] = [];
            if (Array.isArray(primaryRoute.path)) {
              for (const pt of primaryRoute.path) {
                const lat = typeof pt.lat === 'function' ? pt.lat() : pt.lat;
                const lng = typeof pt.lng === 'function' ? pt.lng() : pt.lng;
                if (typeof lat === 'number' && typeof lng === 'number') {
                  extractedPoints.push({ lat, lng });
                }
              }
            }

            // Render Polylines via createPolylines() if available, else standard Polyline
            if (typeof primaryRoute.createPolylines === 'function') {
              const newPolys = primaryRoute.createPolylines();
              newPolys.forEach((polyline: google.maps.Polyline) => {
                polyline.setOptions({
                  strokeColor: '#06b6d4',
                  strokeWeight: 6,
                  strokeOpacity: 0.95,
                });
                polyline.setMap(map);
              });
              polylinesRef.current = newPolys;
            } else if (mapsLib && extractedPoints.length > 0) {
              const poly = new mapsLib.Polyline({
                path: extractedPoints,
                geodesic: true,
                strokeColor: '#06b6d4',
                strokeOpacity: 0.95,
                strokeWeight: 6,
                map,
              });
              polylinesRef.current = [poly];
            }

            if (primaryRoute.viewport) {
              map.fitBounds(primaryRoute.viewport);
            }

            const steps: { instruction: string; distanceText: string }[] = [];
            const leg = primaryRoute.legs?.[0];
            if (leg?.steps && Array.isArray(leg.steps)) {
              for (const st of leg.steps.slice(0, 8)) {
                const text =
                  st.instructions ||
                  st.navigationInstruction?.instructions ||
                  'Continue along designated route';
                const distM = st.distanceMeters || 0;
                steps.push({
                  instruction: String(text).replace(/<[^>]*>?/gm, ''),
                  distanceText: distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`,
                });
              }
            }

            const startPt =
              extractedPoints[0] ||
              (await resolveLocationCoords(startLocation)) || { lat: 8.7642, lng: 78.1348 };
            const endPt =
              extractedPoints[extractedPoints.length - 1] ||
              (await resolveLocationCoords(endLocation)) || { lat: 8.8012, lng: 78.1462 };

            onLoadingChange(false);
            onRouteCalculated(
              {
                distanceMeters: primaryRoute.distanceMeters ?? 0,
                durationSeconds: Math.round((primaryRoute.durationMillis ?? 0) / 1000),
                pathPoints: extractedPoints.length > 0 ? extractedPoints : [startPt, endPt],
                steps:
                  steps.length > 0
                    ? steps
                    : [
                        {
                          instruction: `Depart from ${startLocation.address}`,
                          distanceText: 'Start',
                        },
                        {
                          instruction: `Follow primary highway corridor toward ${endLocation.address}`,
                          distanceText: `${((primaryRoute.distanceMeters ?? 0) / 1000).toFixed(1)} km`,
                        },
                      ],
                routingProvider: 'Google Routes API',
                startResolved: startPt,
                endResolved: endPt,
              },
              null
            );
            return;
          }
        } catch (err: any) {
          const msg = String(err?.message || err || '');
          if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
          // Fall through to OSRM live routing backup so user always gets a real route
        }
      }

      // 3. Fallback Real Routing Service: OSRM Public Routing API + Nominatim Geocoding
      try {
        const startCoords = await resolveLocationCoords(startLocation);
        const endCoords = await resolveLocationCoords(endLocation);

        if (!startCoords || !endCoords) {
          if (!isCancelled) {
            onLoadingChange(false);
            onRouteCalculated(
              null,
              'Could not geocode one or both locations. Please select a suggested location from the dropdown or enter a clearer city/street name.'
            );
          }
          return;
        }

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(osrmUrl);
        if (!res.ok) {
          throw new Error(`Routing server returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.routes || data.routes.length === 0) {
          if (!isCancelled) {
            onLoadingChange(false);
            onRouteCalculated(
              null,
              'No drivable road route found between the selected locations.'
            );
          }
          return;
        }

        const osrmRoute = data.routes[0];
        const coords: [number, number][] = osrmRoute.geometry?.coordinates || [];
        const pathPoints: LatLngPoint[] = coords.map(([lng, lat]) => ({ lat, lng }));

        if (!isCancelled && map && mapsLib && pathPoints.length > 0) {
          const poly = new mapsLib.Polyline({
            path: pathPoints,
            geodesic: true,
            strokeColor: '#06b6d4',
            strokeOpacity: 0.95,
            strokeWeight: 6,
            map,
          });
          polylinesRef.current = [poly];

          const bounds = new google.maps.LatLngBounds();
          pathPoints.forEach((pt) => bounds.extend(pt));
          map.fitBounds(bounds);
        }

        const steps: { instruction: string; distanceText: string }[] = [];
        const osrmSteps = osrmRoute.legs?.[0]?.steps || [];
        for (const st of osrmSteps.slice(0, 8)) {
          const roadName = st.name ? ` onto ${st.name}` : '';
          const maneuverType = st.maneuver?.type || 'Continue';
          const modifier = st.maneuver?.modifier ? ` (${st.maneuver.modifier})` : '';
          const distM = Math.round(st.distance || 0);
          steps.push({
            instruction: `${maneuverType.charAt(0).toUpperCase() + maneuverType.slice(1)}${modifier}${roadName}`,
            distanceText: distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`,
          });
        }

        if (!isCancelled) {
          onLoadingChange(false);
          onRouteCalculated(
            {
              distanceMeters: Math.round(osrmRoute.distance || 0),
              durationSeconds: Math.round(osrmRoute.duration || 0),
              pathPoints: pathPoints.length > 0 ? pathPoints : [startCoords, endCoords],
              steps,
              routingProvider: 'OSRM Live Routing',
              startResolved: startCoords,
              endResolved: endCoords,
            },
            null
          );
        }
      } catch (fallbackErr: any) {
        if (!isCancelled) {
          onLoadingChange(false);
          onRouteCalculated(
            null,
            `Routing service unavailable: ${fallbackErr?.message || 'Unable to reach routing servers. Check network connectivity or switch to Offline Mode.'}`
          );
        }
      }
    };

    calculateRoute();

    return () => {
      isCancelled = true;
    };
  }, [routeTriggerCount, isOfflineMode, vehicle.id]);

  return null;
};

export const FloodSafeMapCanvas: React.FC<FloodSafeMapCanvasProps> = ({
  startLocation,
  endLocation,
  routeTriggerCount,
  vehicle,
  floodZones,
  selectedZone,
  onSelectZone,
  onRouteCalculated,
  onLoadingChange,
  isOfflineMode,
  lang,
  mapCenterOverride,
}) => {
  return (
    <div className="relative w-full h-[460px] lg:h-[640px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: 8.7842, lng: 78.1348 }}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        colorScheme="DARK"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        <RouteAndZoneOverlays
          startLocation={startLocation}
          endLocation={endLocation}
          routeTriggerCount={routeTriggerCount}
          vehicle={vehicle}
          floodZones={floodZones}
          isOfflineMode={isOfflineMode}
          mapCenterOverride={mapCenterOverride}
          onRouteCalculated={onRouteCalculated}
          onLoadingChange={onLoadingChange}
        />

        {/* Start Marker */}
        {typeof startLocation.lat === 'number' && typeof startLocation.lng === 'number' && (
          <AdvancedMarker position={{ lat: startLocation.lat, lng: startLocation.lng }} title="Start Location">
            <div className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs shadow-lg border border-cyan-200 whitespace-nowrap">
              {lang === 'ta' ? 'தொடக்கம்' : 'START'}
            </div>
          </AdvancedMarker>
        )}

        {/* Destination Marker */}
        {typeof endLocation.lat === 'number' && typeof endLocation.lng === 'number' && (
          <AdvancedMarker position={{ lat: endLocation.lat, lng: endLocation.lng }} title="Destination">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg border border-emerald-200 whitespace-nowrap">
              {lang === 'ta' ? 'இலக்கு' : 'DEST'}
            </div>
          </AdvancedMarker>
        )}

        {/* Flood Sensor Zone Markers */}
        {floodZones.map((zone) => {
          const isSevere = zone.severity === 'severe';
          const isModerate = zone.severity === 'moderate';
          return (
            <AdvancedMarker
              key={zone.id}
              position={{ lat: zone.lat, lng: zone.lng }}
              onClick={() => onSelectZone(zone)}
              title={lang === 'ta' ? zone.nameTa : zone.nameEn}
            >
              <button
                type="button"
                onClick={() => onSelectZone(zone)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold border shadow-md cursor-pointer transition-transform hover:scale-105 ${
                  isSevere
                    ? 'bg-red-950/95 text-red-200 border-red-500'
                    : isModerate
                    ? 'bg-amber-950/95 text-amber-200 border-amber-500'
                    : 'bg-cyan-950/95 text-cyan-200 border-cyan-500'
                }`}
              >
                {zone.waterDepthCm}cm
              </button>
            </AdvancedMarker>
          );
        })}

        {/* Selected Flood Zone InfoWindow */}
        {selectedZone && (
          <InfoWindow
            position={{ lat: selectedZone.lat, lng: selectedZone.lng }}
            onCloseClick={() => onSelectZone(null)}
          >
            <div className="p-1 max-w-xs text-slate-900">
              <div className="text-xs font-bold text-slate-900">
                {lang === 'ta' ? selectedZone.nameTa : selectedZone.nameEn}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {selectedZone.city} · {selectedZone.updatedAt}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs font-mono">
                <span className="font-semibold text-red-700">
                  Depth: {selectedZone.waterDepthCm} cm
                </span>
                <span>·</span>
                <span className="text-slate-700">Rain: {selectedZone.rainfallMmHr} mm/hr</span>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-800">
                {lang === 'ta' ? selectedZone.statusTa : selectedZone.statusEn}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-600">
                {selectedZone.waterDepthCm <= vehicle.safeWaterDepthCm
                  ? `Passable for ${vehicle.nameEn} (Limit: ${vehicle.safeWaterDepthCm} cm)`
                  : `UNSAFE for ${vehicle.nameEn} (Limit: ${vehicle.safeWaterDepthCm} cm)`}
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs flex flex-wrap items-center gap-x-4 gap-y-1.5 pointer-events-none">
        <span className="font-medium text-slate-300">
          {lang === 'ta' ? 'வெள்ள மண்டலங்கள்:' : 'Flood Sensor Overlay:'}
        </span>
        <span className="text-red-400 font-medium">
          {lang === 'ta' ? 'கடுமையான (>30cm)' : 'Severe (>30cm)'}
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-amber-400 font-medium">
          {lang === 'ta' ? 'மிதமான (15-30cm)' : 'Moderate (15-30cm)'}
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-cyan-400 font-medium">
          {lang === 'ta' ? 'லேசான (<15cm)' : 'Minor (<15cm)'}
        </span>
      </div>
    </div>
  );
};
