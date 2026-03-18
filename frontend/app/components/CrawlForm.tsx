"use client";
import { useState } from "react";
import { startCrawl } from "@/app/lib/api";

export default function CrawlForm({ onJobStarted }: { onJobStarted: () => void }) {
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(50);
  const [delay, setDelay] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.startsWith("http")) {
      setError("URL must start with http:// or https://");
      return;
    }
    setLoading(true);
    try {
      await startCrawl({ seed_url: url, max_depth: depth, max_pages: maxPages, delay });
      setUrl("");
      onJobStarted();
    } catch {
      setError("Failed to start crawl. Is the backend running?");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">New Crawl Job</h2>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Seed URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Max Depth</label>
          <input type="number" min={1} max={5} value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Max Pages</label>
          <input type="number" min={1} max={500} value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Delay (s)</label>
          <input type="number" min={0.5} max={5} step={0.5} value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Starting..." : "Start Crawl"}
      </button>
    </form>
  );
}