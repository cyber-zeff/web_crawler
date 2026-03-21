"use client";
import { useState } from "react";
import { searchPages } from "@/app/lib/api";
import { Search } from "lucide-react";

export default function SearchBar({ jobId }: { jobId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const data = await searchPages(query, jobId);
    setResults(data);
    setSearched(true);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search crawled content..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Search size={16} />
        </button>
      </form>

      {searched && results.length === 0 && (
        <p className="text-sm text-gray-500">No results found.</p>
      )}

      {results.map((r) => (
        <div key={r.id} className="bg-white rounded-xl shadow p-4 space-y-1">
          <a href={r.url} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 text-sm font-medium hover:underline truncate block">
            {r.title || r.url}
          </a>
          <p className="text-xs text-gray-400 truncate">{r.url}</p>
          <p className="text-xs text-gray-500">{r.word_count} words</p>
        </div>
      ))}
    </div>
  );
}