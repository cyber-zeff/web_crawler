"use client";
import { useState } from "react";
import { searchPages } from "../lib/api";

export default function SearchBar({ jobId }: { jobId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchPages(query, jobId);
    setResults(data);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'Space Mono, monospace', fontSize: '14px', color: '#d4a017', pointerEvents: 'none', lineHeight: 1
          }}>›</span>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="search extracted content..."
            style={{
              width: '100%', paddingLeft: '30px', paddingRight: '14px',
              paddingTop: '11px', paddingBottom: '11px',
              background: '#1e1e1e', border: '1px solid #333',
              borderRadius: '8px', color: '#f0ece0',
              fontSize: '13px', fontFamily: 'Space Mono, monospace',
              outline: 'none', transition: 'border 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#d4a017'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />
        </div>
        <button type="submit" disabled={loading} style={{
          padding: '11px 18px', borderRadius: '8px',
          border: '1px solid rgba(212,160,23,0.4)',
          background: 'rgba(212,160,23,0.1)', color: '#d4a017',
          fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          transition: 'all 0.2s', whiteSpace: 'nowrap'
        }}>
          {loading ? '...' : 'QUERY'}
        </button>
      </form>

      {searched && results.length === 0 && (
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#5a5248', padding: '8px 4px' }}>
          // no results found for "{query}"
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {results.map(r => (
          <div key={r.id} style={{
            background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '14px 16px',
            transition: 'border 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,160,23,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '12px',
              color: '#c8a84a', textDecoration: 'none', marginBottom: '4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{r.title || r.url}</a>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#4a4540', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#7a7060' }}>{r.word_count} words indexed</p>
          </div>
        ))}
      </div>
    </div>
  );
}