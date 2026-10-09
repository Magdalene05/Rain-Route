import React, { useState } from 'react';
import {
  PhoneCall,
  AlertOctagon,
  MapPin,
  Copy,
  Check,
  ShieldAlert,
  LifeBuoy,
} from 'lucide-react';
import { Language } from '../data/rainRouteData';

interface EmergencySosSectionProps {
  lang: Language;
  currentStartAddress: string;
}

const HELPLINES = [
  {
    nameEn: 'State Disaster Management Control Room (TNSDMA)',
    nameTa: 'மாநில பேரிடர் மேலாண்மை கட்டுப்பாட்டு அறை',
    number: '1070',
    scope: '24/7 Toll-Free Monsoon Helpline',
  },
  {
    nameEn: 'District Flood Control Room (Thoothukudi / Collectorate)',
    nameTa: 'மாவட்ட வெள்ளக் கட்டுப்பாட்டு அறை (தூத்துக்குடி)',
    number: '1077',
    scope: 'District Collectorate Emergency Dispatch',
  },
  {
    nameEn: 'National Emergency Response & Fire / Rescue',
    nameTa: 'தேசிய அவசர உதவி & தீயணைப்பு மீட்புப் பணி',
    number: '112',
    scope: 'Unified Police, Fire & Boat Rescue',
  },
  {
    nameEn: 'Emergency Medical & Ambulance Service',
    nameTa: 'அவசர மருத்துவ ஆம்புலன்ஸ் சேவை',
    number: '108',
    scope: 'Critical Care & Flood Medical Response',
  },
  {
    nameEn: 'Thoothukudi Corporation Monsoon Helpdesk',
    nameTa: 'தூத்துக்குடி மாநகராட்சி மழைக்கால உதவி மையம்',
    number: '0461-2320455',
    scope: 'Waterlogging Pump Dispatch & Tree Fall',
  },
  {
    nameEn: 'Greater Chennai Corporation Flood Control',
    nameTa: 'சென்னை மாநகராட்சி வெள்ளக் கட்டுப்பாட்டு அறை',
    number: '1913',
    scope: 'Urban Flood Rescue & Shelter Routing',
  },
];

export const EmergencySosSection: React.FC<EmergencySosSectionProps> = ({
  lang,
  currentStartAddress,
}) => {
  const [sosActive, setSosActive] = useState(false);
  const [copiedBeacon, setCopiedBeacon] = useState(false);
  const [coordsText, setCoordsText] = useState('8.7642° N, 78.1348° E (Thoothukudi Sector)');

  const handleTriggerSos = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordsText(
            `${pos.coords.latitude.toFixed(5)}° N, ${pos.coords.longitude.toFixed(5)}° E`
          );
          setSosActive(true);
        },
        () => {
          setSosActive(true);
        }
      );
    } else {
      setSosActive(true);
    }
  };

  const handleCopyBeacon = () => {
    const msg = `EMERGENCY FLOOD SOS — Location: ${currentStartAddress || coordsText} (${coordsText}). Vehicle stranded in waterlogging. Requesting immediate assistance via RainRoute.`;
    navigator.clipboard?.writeText(msg);
    setCopiedBeacon(true);
    setTimeout(() => setCopiedBeacon(false), 3000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <p className="text-xs font-mono text-red-400 tracking-wide">
          {lang === 'ta'
            ? 'அவசர உதவி · மீட்புப் படை மற்றும் உதவி எண்கள்'
            : 'Emergency SOS · Rapid Disaster Helplines & Stranded Vehicle Protocol'}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 font-display">
          {lang === 'ta'
            ? 'அவசரகால SOS & பேரிடர் உதவி எண்கள்'
            : 'Emergency SOS & Monsoon Disaster Helplines'}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {lang === 'ta'
            ? 'வெள்ளத்தில் சிக்கியிருந்தால் உடனடியாக உங்கள் இருப்பிடத்தைப் பகிர்ந்து உதவி கோருங்கள்.'
            : 'Quick access to official disaster response helplines and GPS distress coordinates if caught in rising floodwater.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: SOS Distress Transmitter */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-red-900/60 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                {lang === 'ta' ? 'உடனடி SOS இருப்பிடப் பகிர்வு' : 'One-Tap SOS Distress Beacon'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ta'
                  ? 'உங்கள் GPS ஆயத்தொலைவுகளை அவசர மீட்புக் குழுவிற்குத் தயார் செய்கிறது.'
                  : 'Generates an emergency GPS dispatch packet with your active route location.'}
              </p>
            </div>
            <AlertOctagon className="w-6 h-6 text-red-400 shrink-0" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ta' ? 'தற்போதைய இருப்பிடம்:' : 'Active Commuter Location:'}</span>
            </div>
            <div className="text-sm font-medium text-slate-100">
              {currentStartAddress || 'St. Mother Theresa Engineering College, Thoothukudi'}
            </div>
            <div className="text-xs font-mono text-cyan-400 tabular-nums">{coordsText}</div>
          </div>

          <button
            type="button"
            onClick={handleTriggerSos}
            className="w-full min-h-[52px] px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>
              {sosActive
                ? lang === 'ta'
                  ? 'SOS சிக்னல் தயார் — கீழே நகலெடுக்கவும்'
                  : 'SOS Coordinates Locked — Ready to Share'
                : lang === 'ta'
                ? 'SOS அவசர உதவியை இயக்கு'
                : 'Activate Emergency SOS Beacon'}
            </span>
          </button>

          {sosActive && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 space-y-3">
              <div className="text-xs font-semibold text-red-200">
                {lang === 'ta'
                  ? 'அவசர செய்தி உருவாக்கப்பட்டது:'
                  : 'Emergency Dispatch Packet Generated:'}
              </div>
              <p className="text-xs font-mono text-slate-200 bg-slate-950/90 p-3 rounded-lg border border-slate-800">
                EMERGENCY FLOOD SOS — Location: {currentStartAddress} ({coordsText}). Vehicle stranded in waterlogging. Requesting immediate assistance.
              </p>
              <button
                type="button"
                onClick={handleCopyBeacon}
                className="w-full min-h-[42px] px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedBeacon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>
                  {copiedBeacon
                    ? 'Copied Emergency Coordinates to Clipboard'
                    : 'Copy Distress Message for SMS / WhatsApp'}
                </span>
              </button>
            </div>
          )}

          {/* Submerged Vehicle Survival Protocol */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === 'ta'
                  ? 'வாகனம் நீரில் சிக்கினால் செய்ய வேண்டியவை:'
                  : 'Critical Vehicle Waterlogging Safety Protocol:'}
              </span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>
                Do NOT restart a stalled engine in knee-deep water — cranking causes irreversible hydrostatic engine lock.
              </li>
              <li>
                Unlock doors and lower windows immediately if water exceeds tire height (30+ cm) before electrical systems short.
              </li>
              <li>
                Avoid walking near open roadside storm drains or submerged electrical transformers.
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Direct Dial Helplines Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HELPLINES.map((item) => (
            <div
              key={item.number}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="text-xs text-slate-400">{item.scope}</div>
                <h4 className="text-sm font-semibold text-slate-100 mt-1">
                  {lang === 'ta' ? item.nameTa : item.nameEn}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                  {item.number}
                </span>
                <a
                  href={`tel:${item.number}`}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'அழைக்க' : 'Call Now'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
