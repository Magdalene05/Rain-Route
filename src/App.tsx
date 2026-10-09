/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  ArrowUpDown,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Info,
  CloudRain,
  WifiOff,
  Loader2,
  MapPin,
  FileText,
  PhoneCall,
  Layers,
} from 'lucide-react';
import {
  VEHICLE_OPTIONS,
  VehicleOption,
  INITIAL_FLOOD_ZONES,
  FloodSensorZone,
  INITIAL_COMMUNITY_REPORTS,
  CommunityReport,
  INITIAL_OFFLINE_PACKS,
  CachedOfflineMapPack,
  MONITORED_CITIES,
  Language,
} from './data/rainRouteData';
import {
  LocationAutocompleteInput,
  SelectedLocation,
} from './components/LocationAutocompleteInput';
import {
  FloodSafeMapCanvas,
  ComputedRouteResult,
} from './components/FloodSafeMapCanvas';
import {
  evaluateRouteFloodRisk,
  LatLngPoint,
} from './utils/floodRiskEngine';
import { CommunityReportsSection } from './components/CommunityReportsSection';
import { OfflineMapsSection } from './components/OfflineMapsSection';
import { EmergencySosSection } from './components/EmergencySosSection';
import { PitchDeckSection } from './components/PitchDeckSection';

type ActiveSection = 'planner' | 'reports' | 'offline' | 'sos' | 'pitch';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('planner');
  const [lang, setLang] = useState<Language>('en');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Route Planner State — both fields are fully editable and interactive
  const [startLocation, setStartLocation] = useState<SelectedLocation>({
    address: 'St. Mother Theresa Engineering College, Vagaikulam, Thoothukudi, Tamil Nadu, India',
    lat: 8.7462,
    lng: 78.0156,
  });
  const [endLocation, setEndLocation] = useState<SelectedLocation>({
    address: 'V.O.Chidambaranar Port Trust, Thoothukudi, Tamil Nadu, India',
    lat: 8.7556,
    lng: 78.1794,
  });

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(VEHICLE_OPTIONS[2]); // Default Sedan
  const [routeTriggerCount, setRouteTriggerCount] = useState<number>(1);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<ComputedRouteResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Flood Zones & Community Reports State
  const [floodZones, setFloodZones] = useState<FloodSensorZone[]>(INITIAL_FLOOD_ZONES);
  const [selectedZone, setSelectedZone] = useState<FloodSensorZone | null>(null);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(
    INITIAL_COMMUNITY_REPORTS
  );

  // Offline Maps State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlinePacks, setOfflinePacks] = useState<CachedOfflineMapPack[]>(
    INITIAL_OFFLINE_PACKS
  );
  const [mapCenterOverride, setMapCenterOverride] = useState<LatLngPoint | null>(null);

  // Listen for Google Maps Platform Demo Key quota exceeded events
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Swap Start and Destination locations
  const handleSwapLocations = () => {
    const prevStart = { ...startLocation };
    const prevEnd = { ...endLocation };
    setStartLocation(prevEnd);
    setEndLocation(prevStart);
  };

  // Trigger Find Safe Route
  const handleFindSafeRoute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRouteError(null);
    setRouteTriggerCount((c) => c + 1);
  };

  // Use Current GPS Location for Start Field
  const handleUseCurrentGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setStartLocation({
            address: `Current GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat,
            lng,
          });
          setMapCenterOverride({ lat, lng });
        },
        () => {
          setStartLocation({
            address: 'New Bus Stand, Ettayapuram Road, Thoothukudi, Tamil Nadu, India',
            lat: 8.8139,
            lng: 78.1446,
          });
        }
      );
    }
  };

  // Evaluate flood risk ONLY when supported by actual flood sensor coverage
  const floodEvaluation = useMemo(() => {
    if (!routeResult) return null;
    return evaluateRouteFloodRisk(routeResult.pathPoints, floodZones, selectedVehicle);
  }, [routeResult, floodZones, selectedVehicle]);

  // Add community report and live sensor zone
  const handleAddReport = (newReport: CommunityReport, newZone: FloodSensorZone) => {
    setCommunityReports((prev) => [newReport, ...prev]);
    setFloodZones((prev) => [newZone, ...prev]);
  };

  // Upvote / downvote report
  const handleVoteReport = (reportId: string, deltaUp: number, deltaDown: number) => {
    setCommunityReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, upvotes: r.upvotes + deltaUp, downvotes: r.downvotes + deltaDown }
          : r
      )
    );
  };

  // Download offline map pack
  const handleDownloadOfflinePack = (packId: string) => {
    setOfflinePacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, status: 'downloading' } : p))
    );
    setTimeout(() => {
      setOfflinePacks((prev) =>
        prev.map((p) =>
          p.id === packId
            ? { ...p, status: 'cached', lastSynced: 'Synced just now' }
            : p
        )
      );
    }, 900);
  };

  // Load offline pack into Route Planner
  const handleLoadPackToPlanner = (pack: CachedOfflineMapPack) => {
    setMapCenterOverride(pack.center);
    setActiveSection('planner');
  };

  return (
    <APIProvider apiKey={MAPS_API_KEY}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
        {/* Mandatory Demo Key Quota Notice Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Strict 3-Zone Top Bar Contract */}
        <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#planner"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('planner');
            }}
            className="text-lg sm:text-xl font-bold tracking-tight text-cyan-400 font-display whitespace-nowrap shrink-0"
          >
            RainRoute
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => setActiveSection('planner')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'planner'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                  : ''
              }`}
            >
              {lang === 'ta' ? 'வழித்தடம்' : 'Route Planner'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('reports')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'reports'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                  : ''
              }`}
            >
              {lang === 'ta' ? 'வெள்ள அறிக்கைகள்' : 'Flood Reports'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('offline')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'offline'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                  : ''
              }`}
            >
              {lang === 'ta' ? 'ஆஃப்லைன் வரைபடம்' : 'Offline Maps'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sos')}
              className={`hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'sos'
                  ? 'text-red-400 border-b-2 border-red-400 font-semibold'
                  : ''
              }`}
            >
              {lang === 'ta' ? 'அவசர SOS' : 'Emergency SOS'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('pitch')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'pitch'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                  : ''
              }`}
            >
              {lang === 'ta' ? 'திட்ட விளக்கம்' : 'Pitch Deck'}
            </button>
          </nav>

          {/* Zone 3: 1 primary action (Tamil / English Language Toggle) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ta' : 'en'))}
              className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'en' ? 'தமிழ் (Tamil)' : 'English'}
            </button>
          </div>
        </header>

        {/* Sub-Header Telemetry & Context Strip (Team NEXUS & IMD Weather Integration) */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-slate-200">Team NEXUS</span>
              <span aria-hidden="true">·</span>
              <span>St. Mother Theresa Engineering College, Thoothukudi</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400">CSE Department (II Year)</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
              <span className="flex items-center gap-1 text-cyan-300">
                <CloudRain className="w-3.5 h-3.5" />
                <span>IMD Thoothukudi: 64.5 mm/hr (Orange Alert)</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Chennai: 78.2 mm/hr</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setIsOfflineMode((o) => !o)}
                className={`underline cursor-pointer ${
                  isOfflineMode ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isOfflineMode ? 'Offline Cache Active' : 'Online Live Telemetry'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1">
          {activeSection === 'planner' && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {/* Hero Title & Quick Intercity Test Presets */}
              <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-display tracking-tight">
                    {lang === 'ta'
                      ? 'மழைக்காலப் பாதுகாப்பான வழித்தடத் திட்டமிடல்'
                      : 'Smart Flood-Safe Route Planner'}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    {lang === 'ta'
                      ? 'எந்தவொரு தொடக்க இடத்தையும் இலக்கையும் தட்டச்சு செய்யவும். வாகனத்தின் தரை இடைவெளிக்கு (Ground Clearance) ஏற்ப பாதுகாப்பான வழியைக் கண்டறியவும்.'
                      : 'Type any starting point and destination across cities. Real-time routing paired with vehicle ground-clearance flood checks.'}
                  </p>
                </div>

                {/* Quick Route Scenario Presets (Intra-city Flooded, Intercity Monitored, and Unmonitored City Test) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 mr-1">
                    {lang === 'ta' ? 'விரைவு சோதனை:' : 'Quick Test Routes:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStartLocation({
                        address: 'St. Mother Theresa Engineering College, Vagaikulam, Thoothukudi, Tamil Nadu, India',
                        lat: 8.7462,
                        lng: 78.0156,
                      });
                      setEndLocation({
                        address: 'V.O.Chidambaranar Port Trust, Thoothukudi, Tamil Nadu, India',
                        lat: 8.7556,
                        lng: 78.1794,
                      });
                      setRouteTriggerCount((c) => c + 1);
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-medium cursor-pointer transition-colors"
                  >
                    Thoothukudi Local
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartLocation({
                        address: 'New Bus Stand, Ettayapuram Road, Thoothukudi, Tamil Nadu, India',
                        lat: 8.8139,
                        lng: 78.1446,
                      });
                      setEndLocation({
                        address: 'Meenakshi Amman Temple, Madurai, Tamil Nadu, India',
                        lat: 9.9195,
                        lng: 78.1193,
                      });
                      setRouteTriggerCount((c) => c + 1);
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-medium cursor-pointer transition-colors"
                  >
                    Thoothukudi → Madurai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartLocation({
                        address: 'Velachery, Chennai, Tamil Nadu, India',
                        lat: 12.9759,
                        lng: 80.2212,
                      });
                      setEndLocation({
                        address: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central Railway Station, Chennai, Tamil Nadu, India',
                        lat: 13.0827,
                        lng: 80.2750,
                      });
                      setRouteTriggerCount((c) => c + 1);
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-medium cursor-pointer transition-colors"
                  >
                    Chennai Flood Corridor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartLocation({
                        address: 'Coimbatore Junction, Coimbatore, Tamil Nadu, India',
                        lat: 11.0018,
                        lng: 76.9628,
                      });
                      setEndLocation({
                        address: 'Bengaluru Palace, Bengaluru, Karnataka, India',
                        lat: 12.9988,
                        lng: 77.5921,
                      });
                      setRouteTriggerCount((c) => c + 1);
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium cursor-pointer transition-colors"
                  >
                    Coimbatore → Bengaluru (Unmonitored Test)
                  </button>
                </div>
              </div>

              {/* Main 2-Column Planner Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (5 cols): Editable Location Inputs, Swap, Vehicle Clearance & Route Analysis */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Route Input Card */}
                  <form
                    onSubmit={handleFindSafeRoute}
                    className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                        {lang === 'ta'
                          ? '01. இடங்களைத் தேர்ந்தெடுக்கவும்'
                          : '01. Route Endpoints (Editable)'}
                      </span>
                      {isOfflineMode && (
                        <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                          <WifiOff className="w-3.5 h-3.5" />
                          <span>Offline Mode</span>
                        </span>
                      )}
                    </div>

                    {/* Editable Start Location with Autocomplete */}
                    <LocationAutocompleteInput
                      id="start-location-input"
                      label={lang === 'ta' ? 'தொடங்கும் இடம் (Start Location)' : 'Start Location'}
                      value={startLocation.address}
                      placeholder={
                        lang === 'ta'
                          ? 'தொடங்கும் இடத்தை உள்ளிடவும்...'
                          : 'Enter any starting address, landmark, or city...'
                      }
                      lang={lang}
                      accentColor="cyan"
                      onChange={(text) => setStartLocation({ address: text })}
                      onSelectLocation={(loc) => setStartLocation(loc)}
                      onUseCurrentLocation={handleUseCurrentGps}
                    />

                    {/* Swap Locations Button */}
                    <div className="flex items-center justify-center -my-1">
                      <button
                        type="button"
                        onClick={handleSwapLocations}
                        aria-label="Swap Start and Destination Locations"
                        className="min-h-[42px] px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60 text-xs font-semibold text-cyan-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {lang === 'ta' ? 'இடங்களை இடமாற்று (Swap)' : 'Swap Locations'}
                        </span>
                      </button>
                    </div>

                    {/* Editable Destination Location with Autocomplete */}
                    <LocationAutocompleteInput
                      id="destination-location-input"
                      label={lang === 'ta' ? 'சேருமிடம் (Destination)' : 'Destination'}
                      value={endLocation.address}
                      placeholder={
                        lang === 'ta'
                          ? 'சேருமிடத்தை உள்ளிடவும்...'
                          : 'Enter any destination address or city...'
                      }
                      lang={lang}
                      accentColor="emerald"
                      onChange={(text) => setEndLocation({ address: text })}
                      onSelectLocation={(loc) => setEndLocation(loc)}
                    />

                    {/* Vehicle Selection & Ground Clearance Check */}
                    <div className="pt-2 border-t border-slate-800/90">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-slate-300">
                          {lang === 'ta'
                            ? '02. வாகனம் & தரை இடைவெளி (Ground Clearance)'
                            : '02. Vehicle Type & Ground-Clearance Check'}
                        </label>
                        <span className="text-xs font-mono text-cyan-400 tabular-nums">
                          Max Safe Depth: {selectedVehicle.safeWaterDepthCm} cm
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {VEHICLE_OPTIONS.map((v) => {
                          const active = v.id === selectedVehicle.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVehicle(v)}
                              className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                active
                                  ? 'bg-cyan-500/15 border-cyan-400 text-slate-100'
                                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              <div className="text-xs font-semibold truncate">
                                {lang === 'ta' ? v.nameTa : v.nameEn}
                              </div>
                              <div className="text-[10px] font-mono text-cyan-400/90 mt-0.5 tabular-nums">
                                Clearance: {v.groundClearanceMm}mm · ≤{v.safeWaterDepthCm}cm
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Working Find Safe Route Button */}
                    <button
                      type="submit"
                      disabled={isCalculatingRoute}
                      className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-500/10"
                    >
                      {isCalculatingRoute ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {lang === 'ta'
                              ? 'பாதுகாப்பான பாதையைக் கணக்கிடுகிறது...'
                              : 'Calculating Flood-Safe Route...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          <span>
                            {lang === 'ta'
                              ? 'பாதுகாப்பான வழியைக் கண்டறி (Find Safe Route)'
                              : 'Find Safe Route'}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Route Calculation Error / Unavailable Notice */}
                  {routeError && (
                    <div className="bg-red-950/80 border border-red-500/60 rounded-2xl p-4 text-xs text-red-200 space-y-1.5">
                      <div className="font-bold text-sm flex items-center gap-2 text-red-300">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          {lang === 'ta'
                            ? 'வழித்தடத் தரவு கிடைக்கவில்லை'
                            : 'Routing Data Unavailable'}
                        </span>
                      </div>
                      <p className="leading-relaxed">{routeError}</p>
                    </div>
                  )}

                  {/* Route Summary & Honest Flood-Risk Telemetry Card */}
                  {routeResult && floodEvaluation && !routeError && (
                    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4">
                      {/* Distance, Duration & Provider Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
                        <div>
                          <div className="text-[11px] font-mono text-cyan-400">
                            {routeResult.routingProvider.toUpperCase()}
                          </div>
                          <div className="flex items-baseline gap-3 mt-0.5 font-mono tabular-nums">
                            <span className="text-2xl font-bold text-slate-100">
                              {(routeResult.distanceMeters / 1000).toFixed(1)} km
                            </span>
                            <span className="text-sm font-semibold text-cyan-400">
                              {Math.max(1, Math.round(routeResult.durationSeconds / 60))} mins
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-400 font-mono tabular-nums">
                          <div>Vehicle: {selectedVehicle.nameEn}</div>
                          <div className="text-slate-300">
                            Safe Wading Limit: ≤{selectedVehicle.safeWaterDepthCm} cm
                          </div>
                        </div>
                      </div>

                      {/* Flood Coverage Status Box — Honest Data Reporting (Requirement 6) */}
                      {floodEvaluation.status === 'UNAVAILABLE' && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <h3 className="text-xs font-bold text-amber-300">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryTitleTa
                                  : floodEvaluation.summaryTitleEn}
                              </h3>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryDetailTa
                                  : floodEvaluation.summaryDetailEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {floodEvaluation.status === 'PARTIAL_COVERAGE' && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/50 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <h3 className="text-xs font-bold text-cyan-300">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryTitleTa
                                  : floodEvaluation.summaryTitleEn}
                              </h3>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryDetailTa
                                  : floodEvaluation.summaryDetailEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {floodEvaluation.status === 'COVERED_WITH_RISKS' && (
                        <div
                          className={`p-4 rounded-xl border space-y-2 ${
                            floodEvaluation.isVehicleSafeOverall
                              ? 'bg-amber-950/40 border-amber-500/60'
                              : 'bg-red-950/50 border-red-500/70'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                floodEvaluation.isVehicleSafeOverall
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            />
                            <div>
                              <h3 className="text-xs font-bold text-slate-100">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryTitleTa
                                  : floodEvaluation.summaryTitleEn}
                              </h3>
                              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryDetailTa
                                  : floodEvaluation.summaryDetailEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {floodEvaluation.status === 'COVERED_CLEAR' && (
                        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <h3 className="text-xs font-bold text-emerald-300">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryTitleTa
                                  : floodEvaluation.summaryTitleEn}
                              </h3>
                              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                                {lang === 'ta'
                                  ? floodEvaluation.summaryDetailTa
                                  : floodEvaluation.summaryDetailEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Specific Flood Hazards Detected Along Route */}
                      {floodEvaluation.hazardsEncountered.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-300">
                            {lang === 'ta'
                              ? 'பாதைக்கு அருகிலுள்ள வெள்ள மண்டலங்கள்:'
                              : 'Verified Sensor Zones Along Corridor:'}
                          </div>
                          {floodEvaluation.hazardsEncountered.map((h) => (
                            <div
                              key={h.zone.id}
                              onClick={() => setSelectedZone(h.zone)}
                              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-200 truncate">
                                  {lang === 'ta' ? h.zone.nameTa : h.zone.nameEn}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                                  Water Depth: {h.zone.waterDepthCm} cm · Rain: {h.zone.rainfallMmHr} mm/hr
                                </div>
                              </div>
                              <span
                                className={`text-[11px] font-mono font-semibold shrink-0 ${
                                  h.isPassableForVehicle ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {h.isPassableForVehicle
                                  ? 'PASSABLE'
                                  : `EXCEEDS BY ${h.clearanceDeficitCm}cm`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Turn-by-Turn Navigation Checkpoints */}
                      {routeResult.steps.length > 0 && (
                        <div className="pt-2 border-t border-slate-800">
                          <div className="text-xs font-semibold text-slate-300 mb-2">
                            {lang === 'ta'
                              ? 'வழித்தடக் குறிப்புகள் (Turn-by-Turn)'
                              : 'Turn-by-Turn Navigation Checkpoints'}
                          </div>
                          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                            {routeResult.steps.map((st, idx) => (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-slate-800/60 last:border-none"
                              >
                                <span className="text-slate-300">
                                  <span className="font-mono text-cyan-400 mr-1.5 tabular-nums">
                                    {idx + 1}.
                                  </span>
                                  {st.instruction}
                                </span>
                                <span className="font-mono text-slate-400 shrink-0 tabular-nums">
                                  {st.distanceText}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column (7 cols): Live Flood-Safe Map & Active Sensor Stations */}
                <div className="lg:col-span-7 space-y-5">
                  <FloodSafeMapCanvas
                    startLocation={startLocation}
                    endLocation={endLocation}
                    routeTriggerCount={routeTriggerCount}
                    vehicle={selectedVehicle}
                    floodZones={floodZones}
                    selectedZone={selectedZone}
                    onSelectZone={setSelectedZone}
                    onRouteCalculated={(res, err) => {
                      setRouteResult(res);
                      setRouteError(err);
                    }}
                    onLoadingChange={setIsCalculatingRoute}
                    isOfflineMode={isOfflineMode}
                    lang={lang}
                    mapCenterOverride={mapCenterOverride}
                  />

                  {/* Live Monitored IMD Weather & Flood Sensor Regions */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-slate-200 font-display">
                        {lang === 'ta'
                          ? 'நேரடி வானிலை & வெள்ள உணரி மண்டலங்கள் (IMD / OpenWeatherMap)'
                          : 'Active IMD Rainfall & Municipal Flood-Sensor Catchments'}
                      </h3>
                      <span className="text-xs text-slate-400">
                        Click any city to inspect local sensors on map
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {MONITORED_CITIES.map((city) => (
                        <button
                          key={city.city}
                          type="button"
                          onClick={() => setMapCenterOverride({ lat: city.lat, lng: city.lng })}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-100">
                              {lang === 'ta' ? city.nameTa : city.city}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-semibold ${
                                city.alertLevel.includes('Orange')
                                  ? 'text-amber-400'
                                  : 'text-cyan-400'
                              }`}
                            >
                              {city.currentRainfallMm} mm
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 truncate">
                            {city.imdStation}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-1 tabular-nums">
                            {city.alertLevel} · {city.coverageRadiusKm}km radius
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'reports' && (
            <CommunityReportsSection
              reports={communityReports}
              lang={lang}
              onAddReport={handleAddReport}
              onVoteReport={handleVoteReport}
            />
          )}

          {activeSection === 'offline' && (
            <OfflineMapsSection
              packs={offlinePacks}
              isOfflineMode={isOfflineMode}
              lang={lang}
              onToggleOfflineMode={() => setIsOfflineMode((prev) => !prev)}
              onDownloadPack={handleDownloadOfflinePack}
              onLoadPackToPlanner={handleLoadPackToPlanner}
            />
          )}

          {activeSection === 'sos' && (
            <EmergencySosSection
              lang={lang}
              currentStartAddress={startLocation.address}
            />
          )}

          {activeSection === 'pitch' && <PitchDeckSection lang={lang} />}
        </main>

        {/* Mobile Bottom Navigation Bar (Ergonomic Thumb Zone, <15% Sticky Cap) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-14 px-1">
          <button
            type="button"
            onClick={() => setActiveSection('planner')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeSection === 'planner' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Planner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('reports')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeSection === 'reports' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('offline')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeSection === 'offline' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Offline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('sos')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeSection === 'sos' ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5 truncate">SOS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('pitch')}
            className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
              activeSection === 'pitch' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Pitch Deck</span>
          </button>
        </nav>

        {/* Quiet Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-6 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              RainRoute — Smart Flood-Safe Navigation · Built by Team NEXUS (N. Magdalene Ashirvatham, A. Srini, P. Revathi, B. Benisha)
            </div>
            <div>
              St. Mother Theresa Engineering College, Thoothukudi · Dept. of CSE (II Year)
            </div>
          </div>
        </footer>
      </div>
    </APIProvider>
  );
}
