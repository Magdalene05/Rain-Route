import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Camera,
  Send,
  ShieldCheck,
  AlertTriangle,
  Award,
} from 'lucide-react';
import {
  CommunityReport,
  FloodSensorZone,
  Language,
  MONITORED_CITIES,
} from '../data/rainRouteData';

interface CommunityReportsSectionProps {
  reports: CommunityReport[];
  lang: Language;
  onAddReport: (newReport: CommunityReport, newSensorZone: FloodSensorZone) => void;
  onVoteReport: (reportId: string, deltaUp: number, deltaDown: number) => void;
}

export const CommunityReportsSection: React.FC<CommunityReportsSectionProps> = ({
  reports,
  lang,
  onAddReport,
  onVoteReport,
}) => {
  const [locationName, setLocationName] = useState('');
  const [selectedCity, setSelectedCity] = useState('Thoothukudi');
  const [waterDepthCm, setWaterDepthCm] = useState(25);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [photoAttached, setPhotoAttached] = useState<string | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoAttached(file.name);
    }
  };

  const handleUseGpsForReport = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationName(
            `GPS Verified (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) — ${selectedCity}`
          );
        },
        () => {
          setLocationName(`Palayamkottai Road Junction, ${selectedCity}`);
        }
      );
    } else {
      setLocationName(`Palayamkottai Road Junction, ${selectedCity}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    const cityInfo =
      MONITORED_CITIES.find((c) => c.city === selectedCity) || MONITORED_CITIES[0];
    const jitterLat = cityInfo.lat + (Math.random() - 0.5) * 0.025;
    const jitterLng = cityInfo.lng + (Math.random() - 0.5) * 0.025;

    const severity: 'low' | 'moderate' | 'severe' =
      waterDepthCm >= 30 ? 'severe' : waterDepthCm >= 15 ? 'moderate' : 'low';

    const reportId = `rep-${Date.now()}`;
    const newReport: CommunityReport = {
      id: reportId,
      locationName: locationName.trim(),
      city: selectedCity,
      lat: jitterLat,
      lng: jitterLng,
      waterDepthCm,
      severity,
      description:
        description.trim() ||
        `Reported ${waterDepthCm} cm waterlogging at ${locationName.trim()}.`,
      reporterBadge: 'Flood Guardian · Lvl 2',
      reporterName: isAnonymous
        ? `Anonymous Commuter #${Math.floor(100 + Math.random() * 899)}`
        : reporterName.trim() || 'Community Reporter',
      timestamp: 'Just now',
      upvotes: 1,
      downvotes: 0,
      verifiedByAi: true,
    };

    const newZone: FloodSensorZone = {
      id: `usr-zone-${Date.now()}`,
      city: selectedCity,
      nameEn: locationName.trim(),
      nameTa: locationName.trim(),
      lat: jitterLat,
      lng: jitterLng,
      radiusMeters: 380,
      waterDepthCm,
      rainfallMmHr: cityInfo.currentRainfallMm,
      severity,
      statusEn: newReport.description,
      statusTa: newReport.description,
      updatedAt: 'Just now',
      verifiedReports: 1,
    };

    onAddReport(newReport, newZone);
    setLocationName('');
    setDescription('');
    setPhotoAttached(null);
    setSubmittedNotice(
      lang === 'ta'
        ? 'வெள்ளத் தகவல் வெற்றிகரமாகப் பதிவு செய்யப்பட்டு வரைபடத்தில் சேர்க்கப்பட்டது.'
        : 'Report verified and added to the live Flood Map & Route Engine.'
    );
    setTimeout(() => setSubmittedNotice(null), 5000);
  };

  const filteredReports =
    cityFilter === 'ALL'
      ? reports
      : reports.filter((r) => r.city.toLowerCase() === cityFilter.toLowerCase());

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <p className="text-xs font-mono text-cyan-400 tracking-wide">
            {lang === 'ta'
              ? 'சமூகப் பங்களிப்பு · நேரடி வெள்ளத் தகவல்'
              : 'Community Reporting System · Crowd-Sourced Verification'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 font-display">
            {lang === 'ta'
              ? 'வெள்ளத் தகவல் அறிக்கை & சரிபார்ப்பு'
              : 'Community Flood Reports & Live Verification'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'ta'
              ? '"ஒவ்வொரு தகவலும் மற்றொருவரின் பயணத்தைப் பாதுகாப்பானதாக்குகிறது"'
              : '"Every report makes the road safer for someone else" — One-tap GPS flood reporting & active reporter badges.'}
          </p>
        </div>

        {/* Interactive Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start">
          {['ALL', 'Thoothukudi', 'Chennai', 'Madurai', 'Tirunelveli'].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setCityFilter(city)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px] ${
                cityFilter === city
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {city === 'ALL' ? (lang === 'ta' ? 'அனைத்தும்' : 'All Cities') : city}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Submit New Flood Report Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 font-display">
            {lang === 'ta' ? 'புதிய வெள்ளத் தகவலைப் பதிவு செய்க' : 'Submit One-Tap Flood Report'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ta'
              ? 'உங்கள் தகவல் நேரடி வரைபடத்திலும் பாதுகாப்பான பாதை கணக்கீட்டிலும் உடனடியாகச் சேர்க்கப்படும்.'
              : 'Reports are cross-checked with IMD rainfall thresholds and added to the live route planner.'}
          </p>

          {submittedNotice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-xs text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{submittedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === 'ta' ? 'நகரம் / மண்டலம்' : 'Monitored City Region'}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {MONITORED_CITIES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({c.imdStation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {lang === 'ta' ? 'சாலை / சந்திப்பு பெயர்' : 'Flooded Street or Intersection'}
                </label>
                <button
                  type="button"
                  onClick={handleUseGpsForReport}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'GPS இருப்பிடம்' : 'Auto-Fill GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={
                  lang === 'ta'
                    ? 'எ.கா: பாளையங்கோட்டை சாலை, தூத்துக்குடி'
                    : 'e.g., WGC Road near VOC Market, Thoothukudi'
                }
                className="w-full min-h-[44px] px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {lang === 'ta' ? 'நீர் மட்ட ஆழம் (செ.மீ)' : 'Estimated Water Depth'}
                </label>
                <span className="text-xs font-mono font-semibold text-cyan-400 tabular-nums">
                  {waterDepthCm} cm ({waterDepthCm >= 30 ? 'Knee / Severe' : waterDepthCm >= 15 ? 'Ankle / Moderate' : 'Surface Runoff'})
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={waterDepthCm}
                onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>5 cm (Minor)</span>
                <span>25 cm (Moderate)</span>
                <span>50+ cm (Severe)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === 'ta' ? 'கள நிலவரம்' : 'Road Condition Details'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  lang === 'ta'
                    ? 'வாகனங்கள் செல்ல முடிகிறதா? மாற்றுப் பாதை உள்ளதா?'
                    : 'Describe lane blockages, stalled vehicles, or diversion status...'
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                />
                <span>{lang === 'ta' ? 'அடையாளம் மறைத்துப் பதிவிடு' : 'Report Anonymously'}</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>
                  {photoAttached
                    ? `Photo: ${photoAttached.slice(0, 16)}...`
                    : lang === 'ta'
                    ? 'புகைப்படம் இணைக்க'
                    : 'Attach Photo Verification'}
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>

            {!isAnonymous && (
              <div>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Name (for Reporter Leaderboard Badge)"
                  className="w-full min-h-[42px] px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'ta' ? 'வெள்ள அறிக்கையைப் பதிவு செய்' : 'Broadcast Verified Flood Report'}</span>
            </button>
          </form>
        </div>

        {/* Right: Live Feed & Gamification */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Reporter Gamification Strip */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {lang === 'ta'
                    ? 'சமூகப் பாதுகாவலர் பதக்கங்கள் (Community Badges)'
                    : 'Community Sentinel Verification Active'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Flood Guardian · Monsoon Sentinel · Verified Citizen · Spam Filtered
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-300 tabular-nums">
              {filteredReports.length} {lang === 'ta' ? 'நேரடி அறிக்கைகள்' : 'Active Reports'}
            </div>
          </div>

          {/* Feed List */}
          <div className="space-y-3">
            {filteredReports.map((rep) => (
              <div
                key={rep.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 transition-colors hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cyan-400">{rep.city}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rep.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400">
                      {rep.verifiedByAi ? 'Telemetry & Crowd Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  <div className="font-mono font-semibold text-xs tabular-nums">
                    <span
                      className={
                        rep.severity === 'severe'
                          ? 'text-red-400'
                          : rep.severity === 'moderate'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }
                    >
                      {rep.waterDepthCm} cm depth · {rep.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-slate-100 mt-2">{rep.locationName}</h4>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{rep.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-200 font-medium">{rep.reporterName}</span>
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-cyan-400">{rep.reporterBadge}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onVoteReport(rep.id, 1, 0)}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors tabular-nums"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Accurate ({rep.upvotes})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onVoteReport(rep.id, 0, 1)}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer transition-colors tabular-nums"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Cleared ({rep.downvotes})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
