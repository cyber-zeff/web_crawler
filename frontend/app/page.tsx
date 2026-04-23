"use client";
import { useEffect, useState, useCallback } from "react";
import CrawlForm from "@/app/components/CrawlForm";
import JobCard from "@/app/components/JobCard";
import SearchBar from "@/app/components/SearchBar";
import { getJobs } from "@/app/lib/api";

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [connError, setConnError] = useState(false);

  const fetchJobs = useCallback(async () => {
    try { const data = await getJobs(); setJobs(data); setConnError(false); }
    catch { setConnError(true); }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return (
    <main style={{ minHeight: '100vh', padding: '48px 20px', background: '#0d0d0d' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '44px', paddingBottom: '28px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#1a1500', border: '1px solid rgba(212,160,23,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
            }}>🕷</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: 800, color: '#f0ece0', letterSpacing: '-0.02em' }}>
              Web<span style={{ color: '#d4a017' }}>Crawler</span>
            </h1>
          </div>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#4a4540', paddingLeft: '54px', letterSpacing: '0.06em' }}>
            // CS3001 Computer Networks — Automated Data Extraction & Indexing System
          </p>
          {connError && (
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#e07070', paddingLeft: '54px', marginTop: '6px' }}>
              ⚠ backend unreachable — retrying...
            </p>
          )}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '36px' }}>
          <CrawlForm onJobStarted={fetchJobs} />

          <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#d4a017', boxShadow: '0 0 10px #d4a017' }} />
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#d4a017', textTransform: 'uppercase' }}>
                Search Index
              </span>
            </div>
            <SearchBar />
          </div>
        </div>

        {/* Jobs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', color: '#7a7060', textTransform: 'uppercase' }}>
              Crawl Jobs
            </span>
            <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#4a4540' }}>
              {jobs.length} total
            </span>
          </div>

          {jobs.length === 0 ? (
            <div style={{ padding: '56px', textAlign: 'center', border: '1px dashed #222', borderRadius: '12px' }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#3a3530' }}>
                // no jobs initialized yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {jobs.map(job => (
                <JobCard key={job.id} job={job} onDeleted={fetchJobs} onStopped={fetchJobs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}