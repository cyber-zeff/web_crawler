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
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--amber)', pointerEvents: 'none'
          }}>{'>'}</span>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="search extracted content..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px',
              background: 'var(--black-3)', border: '1px solid var(--black-5)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px',
              fontFamily: 'Space Mono, monospace', outline: 'none', transition: 'border 0.2s'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
            onBlur={e => (e.target.style.borderColor = 'var(--black-5)')}
          />
        </div>
        <button type="submit" disabled={loading} style={{
          padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--amber-border)',
          background: 'var(--amber-glow)', color: 'var(--amber)', fontFamily: 'Space Mono, monospace',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
          textTransform: 'uppercase', transition: 'all 0.2s'
        }}>
          {loading ? '...' : 'QUERY'}
        </button>
      </form>

      {searched && results.length === 0 && (
        <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', padding: '12px' }}>
          // no results found for "{query}"
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {results.map((r) => (
          <div key={r.id} style={{
            background: 'var(--black-3)', borderRadius: '8px', padding: '14px 16px',
            border: '1px solid var(--black-4)', transition: 'border 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--amber-border)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--black-4)')}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', fontSize: '13px', fontFamily: 'Space Mono, monospace',
              color: 'var(--amber-light)', textDecoration: 'none', marginBottom: '4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {r.title || r.url}
            </a>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'Space Mono, monospace', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.word_count} words indexed</p>
          </div>
        ))}
      </div>
    </div>
  );
}