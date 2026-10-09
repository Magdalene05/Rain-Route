import React, { useState } from 'react';
import {
  WifiOff,
  Download,
  CheckCircle2,
  MapPin,
  Shield,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { CachedOfflineMapPack, Language } from '../data/rainRouteData';

interface OfflineMapsSectionProps {
  packs: CachedOfflineMapPack[];
  isOfflineMode: boolean;
  lang: Language;
  onToggleOfflineMode: () => void;
  onDownloadPack: (packId: string) => void;
  onLoadPackToPlanner: (pack: CachedOfflineMapPack) => void;
}

export const OfflineMapsSection: React.FC<OfflineMapsSectionProps> = ({
  packs,
  isOfflineMode,
  lang,
  onToggleOfflineMode,
  onDownloadPack,
  onLoadPackToPlanner,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || 'pack-tut');
  const activePack = packs.find((p) => p.id === selectedPackId) || packs[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <p className="text-xs font-mono text-cyan-400 tracking-wide">
            {lang === 'ta'
              ? 'ஆஃப்லைன் வரைபடங்கள் · இணையம் இல்லாத போதும் பாதுகாப்பு'
              : 'Offline Mode · Local Indexed Cache & Emergency Safe Corridors'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 font-display">
            {lang === 'ta'
              ? 'ஆஃப்லைன் வெள்ளப் பாதுகாப்பு வரைபடங்கள்'
              : 'Offline Flood Maps & Cached Safe Corridors'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'ta'
              ? 'கனமழையின் போது இணையத் தொடர்பு துண்டிக்கப்பட்டாலும் சேமிக்கப்பட்ட பாதுகாப்பான பாதைகளை அணுகலாம்.'
              : 'Access cached flood-prone zones, high-elevation corridors, and relief shelters when cellular towers fail during cyclones.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleOfflineMode}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
            isOfflineMode
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-cyan-400'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>
            {isOfflineMode
              ? lang === 'ta'
                ? 'ஆஃப்லைன் முறை செயல்பாட்டில் உள்ளது (ஆன்லைனுக்கு மாற்று)'
                : 'Offline Mode Active (Switch to Live Online)'
              : lang === 'ta'
              ? 'ஆஃப்லைன் முறையைச் சோதிக்கவும்'
              : 'Simulate Offline Emergency Mode'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Regional Offline Map Packages */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 font-display">
            {lang === 'ta' ? 'மண்டல வரைபடத் தொகுப்புகள்' : 'Regional Flood Telemetry Packages'}
          </h3>

          {packs.map((pack) => {
            const isSelected = pack.id === activePack.id;
            return (
              <div
                key={pack.id}
                onClick={() => setSelectedPackId(pack.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {lang === 'ta' ? pack.regionNameTa : pack.regionNameEn}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                      {pack.sizeMb} MB · {pack.zonesCount} Flood Zones · {pack.lastSynced}
                    </div>
                  </div>
                  {pack.status === 'cached' ? (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'ta' ? 'சேமிக்கப்பட்டது' : 'Cached'}</span>
                    </span>
                  ) : pack.status === 'downloading' ? (
                    <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 shrink-0">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing...</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadPack(pack.id);
                      }}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'ta' ? 'பதிவிறக்கு' : 'Download'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    {pack.safeCorridors.length} High-Elevation Corridors
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadPackToPlanner(pack);
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer min-h-[32px]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'வழித்தடத்தில் திற' : 'Open in Route Planner'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Cached Vector Preview & Emergency Corridors */}
        {activePack && (
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400">
                  OFFLINE VECTOR SNAPSHOT · {activePack.status.toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mt-0.5 font-display">
                  {lang === 'ta' ? activePack.regionNameTa : activePack.regionNameEn}
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-400 tabular-nums">
                Center: {activePack.center.lat.toFixed(4)}°N, {activePack.center.lng.toFixed(4)}°E
              </div>
            </div>

            {/* Interactive SVG Offline Schematic Map */}
            <div className="relative w-full h-56 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden p-4 flex flex-col justify-between">
              <svg
                viewBox="0 0 600 220"
                className="absolute inset-0 w-full h-full opacity-90"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                <g stroke="#1e293b" strokeWidth="1">
                  <line x1="0" y1="45" x2="600" y2="45" />
                  <line x1="0" y1="90" x2="600" y2="90" />
                  <line x1="0" y1="135" x2="600" y2="135" />
                  <line x1="0" y1="180" x2="600" y2="180" />
                  <line x1="120" y1="0" x2="120" y2="220" />
                  <line x1="240" y1="0" x2="240" y2="220" />
                  <line x1="360" y1="0" x2="360" y2="220" />
                  <line x1="480" y1="0" x2="480" y2="220" />
                </g>

                {/* Flood Hazard Zones (Red/Amber Circles) */}
                <circle cx="210" cy="115" r="38" fill="#ef4444" fillOpacity="0.22" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="370" cy="85" r="30" fill="#f59e0b" fillOpacity="0.22" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="290" cy="155" r="28" fill="#ef4444" fillOpacity="0.22" stroke="#ef4444" strokeWidth="1.5" />

                {/* Cached Safe High-Elevation Route Corridor */}
                <path
                  d="M 55 165 Q 150 55, 285 62 T 540 95"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="55" cy="165" r="6" fill="#22d3ee" />
                <circle cx="285" cy="62" r="5" fill="#10b981" />
                <circle cx="540" cy="95" r="6" fill="#10b981" />
              </svg>

              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-md text-cyan-300 font-mono">
                  Offline Elevation Mesh Ready
                </span>
                <span className="bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-md text-slate-300 font-mono">
                  Zero Cellular Data Required
                </span>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
                <span>Cyan Line: Verified High-Ground Bypass</span>
                <span>Red/Amber Circles: Cached Chronic Waterlogging Basins</span>
              </div>
            </div>

            {/* Pre-computed Safe Corridors */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                {lang === 'ta'
                  ? 'பாதுகாப்பான உயர்மட்ட வழித்தடங்கள் (Safe Corridors)'
                  : 'Verified High-Elevation Safe Corridors'}
              </h4>
              <div className="space-y-2">
                {activePack.safeCorridors.map((corridor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-start gap-2.5 text-xs text-slate-200"
                  >
                    <Navigation className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{corridor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Shelters */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                {lang === 'ta'
                  ? 'அவசரகால நிவாரண முகாம்கள்'
                  : 'Designated High-Ground Relief Shelters'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activePack.emergencyShelters.map((shelter, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-start gap-2 text-xs text-slate-300"
                  >
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{shelter}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
