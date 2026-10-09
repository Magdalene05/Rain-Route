import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';
import { PRESET_LOCATIONS, Language } from '../data/rainRouteData';

export interface SelectedLocation {
  address: string;
  lat?: number;
  lng?: number;
}

interface LocationAutocompleteInputProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  lang: Language;
  accentColor?: 'cyan' | 'emerald';
  onChange: (newText: string) => void;
  onSelectLocation: (loc: SelectedLocation) => void;
  onUseCurrentLocation?: () => void;
}

interface FallbackSuggestion {
  displayName: string;
  lat: number;
  lng: number;
  source: string;
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  id,
  label,
  value,
  placeholder,
  lang,
  accentColor = 'cyan',
  onChange,
  onSelectLocation,
  onUseCurrentLocation,
}) => {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [gmpSuggestions, setGmpSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [fallbackSuggestions, setFallbackSuggestions] = useState<FallbackSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextFetchRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete query
  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setGmpSuggestions([]);
      setFallbackSuggestions([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);

      // 1. Try Google Maps Places API (New) AutocompleteSuggestion
      if (placesLib && placesLib.AutocompleteSuggestion) {
        try {
          if (!sessionTokenRef.current && placesLib.AutocompleteSessionToken) {
            sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
          }

          const request: google.maps.places.AutocompleteRequest = {
            input: trimmed,
            sessionToken: sessionTokenRef.current || undefined,
          };

          const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
          if (!isCancelled && res.suggestions && res.suggestions.length > 0) {
            setGmpSuggestions(res.suggestions);
            setFallbackSuggestions([]);
            setIsLoading(false);
            return;
          }
        } catch (err: any) {
          const msg = String(err?.message || err || '');
          if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        }
      }

      // 2. Fallback to OpenStreetMap Nominatim Geocoding service + local presets if offline/quota
      try {
        const localMatches: FallbackSuggestion[] = PRESET_LOCATIONS.filter(
          (p) =>
            p.labelEn.toLowerCase().includes(trimmed.toLowerCase()) ||
            p.address.toLowerCase().includes(trimmed.toLowerCase()) ||
            p.labelTa.includes(trimmed)
        ).map((p) => ({
          displayName: p.address,
          lat: p.lat,
          lng: p.lng,
          source: 'RainRoute Verified Hub',
        }));

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': lang === 'ta' ? 'ta,en' : 'en',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const remoteMatches: FallbackSuggestion[] = (data || []).map((item: any) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: 'Geocoding Service',
          }));

          if (!isCancelled) {
            setGmpSuggestions([]);
            setFallbackSuggestions([...localMatches, ...remoteMatches].slice(0, 6));
          }
        } else if (!isCancelled) {
          setFallbackSuggestions(localMatches);
        }
      } catch {
        // Offline fallback to preset locations
        if (!isCancelled) {
          const localMatches: FallbackSuggestion[] = PRESET_LOCATIONS.filter(
            (p) =>
              p.labelEn.toLowerCase().includes(trimmed.toLowerCase()) ||
              p.address.toLowerCase().includes(trimmed.toLowerCase())
          ).map((p) => ({
            displayName: p.address,
            lat: p.lat,
            lng: p.lng,
            source: 'Offline Cached Hub',
          }));
          setFallbackSuggestions(localMatches);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 260);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [value, placesLib, lang]);

  const handleSelectGmpSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!suggestion.placePrediction) return;
      const predictionText = suggestion.placePrediction.text?.text || '';

      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        const resolvedAddress = place.formattedAddress || place.displayName || predictionText;
        const lat = place.location?.lat();
        const lng = place.location?.lng();

        skipNextFetchRef.current = true;
        onChange(resolvedAddress);
        onSelectLocation({
          address: resolvedAddress,
          lat,
          lng,
        });

        sessionTokenRef.current = null;
        setGmpSuggestions([]);
        setIsOpen(false);
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        if (msg.includes('OVER_QUERY_LIMIT') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        skipNextFetchRef.current = true;
        onChange(predictionText);
        onSelectLocation({ address: predictionText });
        setIsOpen(false);
      }
    },
    [onChange, onSelectLocation]
  );

  const handleSelectFallback = (item: FallbackSuggestion) => {
    skipNextFetchRef.current = true;
    onChange(item.displayName);
    onSelectLocation({
      address: item.displayName,
      lat: item.lat,
      lng: item.lng,
    });
    setFallbackSuggestions([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    onSelectLocation({ address: '' });
    setGmpSuggestions([]);
    setFallbackSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-xs font-medium text-slate-300 tracking-wide">
          {label}
        </label>
        {onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer min-h-[28px] px-1"
          >
            <Navigation className="w-3 h-3" />
            <span>{lang === 'ta' ? 'எனது இருப்பிடம்' : 'Use GPS'}</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <div
          className={`w-2.5 h-2.5 rounded-full absolute left-3.5 pointer-events-none ${
            accentColor === 'cyan' ? 'bg-cyan-400' : 'bg-emerald-400'
          }`}
        />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full min-h-[46px] pl-9 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
        />
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3.5" />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location"
            className="absolute right-2 p-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (gmpSuggestions.length > 0 || fallbackSuggestions.length > 0 || value.trim().length === 0) && (
        <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800/80">
          {/* Quick Presets when input is empty or user clicks to browse */}
          {value.trim().length < 2 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[11px] font-medium text-slate-400">
                {lang === 'ta'
                  ? 'விரைவு இடங்கள் (அல்லது எந்த நகரத்தையும் தட்டச்சு செய்க)'
                  : 'Quick Hubs (or type any street / city worldwide)'}
              </div>
              {PRESET_LOCATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    skipNextFetchRef.current = true;
                    onChange(preset.address);
                    onSelectLocation({
                      address: preset.address,
                      lat: preset.lat,
                      lng: preset.lng,
                    });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800/90 transition-colors flex items-start gap-2.5 cursor-pointer min-h-[44px]"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">
                      {lang === 'ta' ? preset.labelTa : preset.labelEn}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{preset.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Google Places API (New) Suggestions */}
          {gmpSuggestions.map((s, idx) => {
            const text = s.placePrediction?.text?.text || '';
            return (
              <button
                key={`gmp-${idx}`}
                type="button"
                onClick={() => handleSelectGmpSuggestion(s)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer min-h-[44px]"
              >
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-100 leading-snug">{text}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Google Places Verified</div>
                </div>
              </button>
            );
          })}

          {/* Geocoding Fallback Suggestions */}
          {fallbackSuggestions.map((item, idx) => (
            <button
              key={`fb-${idx}`}
              type="button"
              onClick={() => handleSelectFallback(item)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer min-h-[44px]"
            >
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-100 leading-snug">{item.displayName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.source}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
