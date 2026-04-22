"use client";
import { useState } from "react";
import { startCrawl } from "../lib/api";

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
    if (!url.startsWith("http")) { setError("URL must start with http:// or https://"); return; }
    setLoading(true);
    try {
      await startCrawl({ seed_url: url, max_depth: depth, max_pages: maxPages, delay });
      setUrl("");
      onJobStarted();
    } catch { setError("Failed to start crawl. Is the backend running?"); }
    setLoading(false);
  }

  const inputClass = `
    w-full px-4 py-2.5 rounded
    bg-[var(--black-3)] border border-[var(--black-5)]
    text-[var(--text-primary)] text-sm font-mono
    focus:outline-none focus:border-[var(--amber)] focus:bg-[var(--black-4)]
    transition-all duration-200 placeholder-[var(--text-dim)]
  `;

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--black-2)',
      border: '1px solid var(--amber-border)',
      borderRadius: '12px',
      padding: '28px',
      boxShadow: '0 0 40px rgba(212,160,23,0.05), inset 0 1px 0 rgba(212,160,23,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)'
        }} />
        <h2 style={{ fontSize: '13px', fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--amber)', textTransform: 'uppercase' }}>
          Initialize Crawl Job
        </h2>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
          Seed URL
        </label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://quotes.toscrape.com" className={inputClass} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Max Depth', value: depth, min: 1, max: 5, step: 1, set: setDepth },
          { label: 'Max Pages', value: maxPages, min: 1, max: 500, step: 1, set: setMaxPages },
          { label: 'Delay (s)', value: delay, min: 0.5, max: 5, step: 0.5, set: setDelay },
        ].map(({ label, value, min, max, step, set }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
              {label}
            </label>
            <input type="number" min={min} max={max} step={step} value={value}
              onChange={(e) => set(Number(e.target.value))} className={inputClass} />
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(124,58,58,0.2)', border: '1px solid rgba(224,112,112,0.3)', borderRadius: '6px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--error-text)' }}>{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        background: loading ? 'var(--black-5)' : 'var(--amber)',
        color: loading ? 'var(--text-dim)' : 'var(--black)',
        fontFamily: 'Space Mono, monospace',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: loading ? 'none' : '0 0 20px rgba(212,160,23,0.3)'
      }}>
        {loading ? "[ Initializing... ]" : "[ Launch Crawler ]"}
      </button>
    </form>
  );
}