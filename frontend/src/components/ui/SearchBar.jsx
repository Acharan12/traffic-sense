import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import API from '../../api/client';
import { debounce } from '../../utils';

export default function SearchBar({ placeholder, onSelect, value, onClear, icon }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 100% Dynamic Global Geocoding across all villages, towns, cities, roads
  const search = debounce(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const trimmed = q.trim();
    setLoading(true);

    try {
      // 1. Try Backend Geocoding
      const { data } = await API.get(`/routes/geocode?q=${encodeURIComponent(trimmed)}`);
      const apiResults = data.data || [];

      if (apiResults.length > 0) {
        setResults(apiResults);
        setOpen(true);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Direct Global OSM Photon Geocoding Fallback (Searches EVERY place in the world)
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8&lang=en`
      );
      const photonData = await photonRes.json();
      const features = photonData?.features || [];

      const parsedResults = features.map((f) => {
        const props = f.properties || {};
        const parts = [
          props.name,
          props.district,
          props.city,
          props.state,
          props.country,
        ].filter(Boolean);

        return {
          name: parts.join(', '),
          shortName: props.name || parts[0],
          latitude: parseFloat(f.geometry?.coordinates?.[1]),
          longitude: parseFloat(f.geometry?.coordinates?.[0]),
        };
      });

      if (parsedResults.length > 0) {
        setResults(parsedResults);
        setOpen(true);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 180);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  const handleSelect = (loc) => {
    setQuery(loc.shortName || loc.name.split(',')[0]);
    setOpen(false);
    onSelect(loc);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    if (onClear) onClear();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  return (
    <div className="relative font-sans w-full z-40" ref={ref}>
      <div className="relative flex items-center">
        <div className="absolute left-2.5 text-notion-dim pointer-events-none">
          {loading ? (
            <Loader2 size={13} className="animate-spin text-blue-500" />
          ) : (
            icon || <Search size={13} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
            else if (query.trim().length >= 2) search(query);
          }}
          placeholder={placeholder || 'Search any place, village, city, address...'}
          className="notion-input pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-[#1e1e1e] text-notion-text border border-notion-border rounded w-full"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 text-notion-dim hover:text-notion-text p-0.5 rounded transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-[9999] top-full mt-1.5 left-0 w-full bg-white dark:bg-[#202020] border border-neutral-300 dark:border-neutral-700 rounded-md shadow-2xl max-h-64 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 animate-fade-in">
          {results.map((loc, i) => (
            <div
              key={i}
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 transition-colors text-xs cursor-pointer select-none"
            >
              <MapPin size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-[12px]">
                  {loc.shortName || loc.name.split(',')[0]}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate">{loc.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
