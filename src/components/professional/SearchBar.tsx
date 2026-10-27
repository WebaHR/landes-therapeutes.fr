"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  /** Compact = smaller padding, used in page headers instead of the hero */
  compact?: boolean;
}

export default function SearchBar({
  initialQuery = "",
  initialLocation = "",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("city", location);
    router.push(`/annuaire?${params.toString()}`);
  };

  const fieldPad = compact ? "px-4 py-3" : "px-5 py-4";
  const btnPad = compact ? "px-6 py-3" : "px-8 py-4";

  return (
    <form
      onSubmit={handleSearch}
      className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

        {/* Keyword field */}
        <div className={`flex items-center gap-3 flex-1 ${fieldPad}`}>
          <Search className="w-5 h-5 text-landes-sage flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Quoi ?
            </p>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Métier, entreprise, service, mots-clés…"
              className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Divider visible on mobile */}
        <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

        {/* Location field */}
        <div className={`flex items-center gap-3 flex-1 ${fieldPad}`}>
          <MapPin className="w-5 h-5 text-landes-sage flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Où ?
            </p>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ville ou code postal…"
              className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className={`flex items-center justify-center gap-2 bg-landes-forest hover:bg-landes-pine text-white font-semibold text-base ${btnPad} transition-colors whitespace-nowrap`}
        >
          <Search className="w-5 h-5" />
          <span>Rechercher</span>
        </button>
      </div>
    </form>
  );
}
