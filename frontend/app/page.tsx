"use client";
import { useEffect, useState, useCallback } from "react";
import CrawlForm from "./components/CrawlForm";
import JobCard from "./components/JobCard";
import SearchBar from "./components/SearchBar";
import { getJobs } from "./lib/api";

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [connError, setConnError] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await getJobs();
      setJobs(data);
      setConnError(false);
    } catch { setConnError(true); }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return (
    <main style={{ minHeight: '100vh', padding: '48px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--amber-glow)', border: '1px solid var(--amber-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>🕷</div>
            <h1 style={{
              fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)',
              fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em'
            }}>
              Web<span style={{ color: 'var(--amber)' }}>Crawler</span>
            </h1>
          </div>
          <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', paddingLeft: '52px', letterSpacing: '0.05em' }}>
            // CS3001 Computer Networks — Automated Data Extraction & Indexing System
          </p>
          {connError && (
            <p style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--error-text)', paddingLeft: '52px', marginTop: '4px' }}>
              ⚠ backend unreachable — retrying...
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ gridColumn: '1 / 2' }}>
            <CrawlForm onJobStarted={fetchJobs} />
          </div>
          <div style={{
            background: 'var(--black-2)', border: '1px solid var(--black-5)',
            borderRadius: '12px', padding: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)' }} />
              <h2 style={{ fontSize: '13px', fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--amber)', textTransform: 'uppercase' }}>
                Search Index
              </h2>
            </div>
            <SearchBar />
          </div>
        </div>

        {/* Jobs section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '13px', fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Crawl Jobs
            </h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--black-4)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)' }}>
              {jobs.length} total
            </span>
          </div>

          {jobs.length === 0 ? (
            <div style={{
              padding: '48px', textAlign: 'center',
              border: '1px dashed var(--black-5)', borderRadius: '12px'
            }}>
              <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)' }}>
                // no jobs initialized yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onDeleted={fetchJobs} onStopped={fetchJobs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}