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

  return (
    <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '28px', boxShadow: '0 0 0 1px rgba(212,160,23,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#d4a017', boxShadow: '0 0 10px #d4a017' }} />
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#d4a017', textTransform: 'uppercase' }}>
          Initialize Crawl Job
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#7a7060', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Seed URL
          </label>
          <input
            type="text" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://quotes.toscrape.com" required
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              background: '#1e1e1e', border: '1px solid #333',
              color: '#f0ece0', fontSize: '13px', fontFamily: 'Space Mono, monospace',
              outline: 'none', transition: 'border 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#d4a017'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Max Depth', value: depth, min: 1, max: 5, step: 1, onChange: (v: number) => setDepth(v) },
            { label: 'Max Pages', value: maxPages, min: 1, max: 500, step: 1, onChange: (v: number) => setMaxPages(v) },
            { label: 'Delay (s)', value: delay, min: 0.5, max: 5, step: 0.5, onChange: (v: number) => setDelay(v) },
          ].map(({ label, value, min, max, step, onChange }) => (
            <div key={label}>
              <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#7a7060', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {label}
              </label>
              <input
                type="number" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{
                  width: '100%', padding: '11px 12px', borderRadius: '8px',
                  background: '#1e1e1e', border: '1px solid #333',
                  color: '#f0ece0', fontSize: '13px', fontFamily: 'Space Mono, monospace',
                  outline: 'none', transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#d4a017'}
                onBlur={e => e.target.style.borderColor = '#333'}
              />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(180,60,60,0.15)', border: '1px solid rgba(224,112,112,0.35)', borderRadius: '6px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#e07070' }}>{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          padding: '13px', borderRadius: '8px', border: 'none',
          background: loading ? '#2a2a2a' : '#d4a017',
          color: loading ? '#555' : '#0d0d0d',
          fontFamily: 'Space Mono, monospace', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 0 24px rgba(212,160,23,0.35)'
        }}>
          {loading ? "[ Initializing... ]" : "[ Launch Crawler ]"}
        </button>
      </form>
    </div>
  );
}