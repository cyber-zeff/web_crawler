"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob, getPages, getPageDetail, exportJob, stopCrawl } from "@/app/lib/api";
import SearchBar from "@/app/components/SearchBar";
import Link from "next/link";

const statusConfig: Record<string, { color: string; bg: string }> = {
  pending:   { color: '#d4a017', bg: 'rgba(212,160,23,0.1)'  },
  running:   { color: '#e8b84b', bg: 'rgba(232,184,75,0.12)' },
  completed: { color: '#7dc99a', bg: 'rgba(125,201,154,0.1)' },
  failed:    { color: '#e07070', bg: 'rgba(224,112,112,0.1)' },
  stopped:   { color: '#5a5248', bg: 'rgba(90,82,72,0.15)'   },
};

export default function JobPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [j, p] = await Promise.all([getJob(id as string), getPages(id as string)]);
        setJob(j);
        setPages(p);
      } catch {}
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [id]);

  async function handlePageClick(page: any) {
    setLoadingDetail(true);
    setSelectedPage(null);
    try {
      const detail = await getPageDetail(page.id);
      setSelectedPage(detail);
    } catch { setSelectedPage(page); }
    setLoadingDetail(false);
  }

  async function handleExport() {
    const data = await exportJob(id as string);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `crawl-${id}.json`; a.click();
  }

  async function handleStop() {
    await stopCrawl(id as string);
    const j = await getJob(id as string);
    setJob(j);
  }

  if (!job) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--text-dim)' }}>
        // loading job data...
      </p>
    </div>
  );

  const s = statusConfig[job.status] || statusConfig.stopped;

  return (
    <main style={{ minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <Link href="/" style={{
            fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
            letterSpacing: '0.05em'
          }}>
            ← BACK
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            {job.status === 'running' && (
              <button onClick={handleStop} style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(212,160,23,0.4)',
                background: 'var(--amber-glow)', color: 'var(--amber)',
                fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
              }}>STOP JOB</button>
            )}
            <button onClick={handleExport} style={{
              padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(125,201,154,0.3)',
              background: 'rgba(125,201,154,0.08)', color: '#7dc99a',
              fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
            }}>EXPORT JSON</button>
          </div>
        </div>

        {/* Job header */}
        <div style={{
          background: 'var(--black-2)', border: '1px solid var(--amber-border)',
          borderRadius: '12px', padding: '24px', marginBottom: '20px',
          boxShadow: '0 0 30px rgba(212,160,23,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', marginBottom: '6px', letterSpacing: '0.08em' }}>SEED URL</p>
              <p style={{ fontSize: '14px', fontFamily: 'Space Mono, monospace', color: 'var(--amber-light)', wordBreak: 'break-all' }}>{job.seed_url}</p>
            </div>
            <div style={{ padding: '4px 10px', borderRadius: '4px', background: s.bg, border: `1px solid ${s.color}44`, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '10px', fontFamily: 'Space Mono, monospace', color: s.color, fontWeight: 700, letterSpacing: '0.1em' }}>
                {job.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'PAGES CRAWLED', value: job.pages_crawled },
              { label: 'MAX DEPTH',     value: job.max_depth     },
              { label: 'PAGE LIMIT',    value: job.max_pages     },
              { label: 'DELAY (S)',     value: job.delay         },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--black-3)', borderRadius: '8px', padding: '14px', border: '1px solid var(--black-4)', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Mono, monospace' }}>{value}</p>
                <p style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{
          background: 'var(--black-2)', border: '1px solid var(--black-5)',
          borderRadius: '12px', padding: '24px', marginBottom: '20px'
        }}>
          <p style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--amber)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase' }}>
            ▸ Search This Job
          </p>
          <SearchBar jobId={id as string} />
        </div>

        {/* Pages list */}
        <div style={{ background: 'var(--black-2)', border: '1px solid var(--black-5)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--amber)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
              ▸ Crawled Pages
            </p>
            <span style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)' }}>({pages.length})</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--black-4)' }} />
            <span style={{ fontSize: '10px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)' }}>click row to inspect</span>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px', gap: '12px', padding: '8px 12px', marginBottom: '4px' }}>
            {['PAGE', 'CODE', 'DEPTH', 'WORDS'].map(h => (
              <p key={h} style={{ fontSize: '9px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', letterSpacing: '0.1em', textAlign: h === 'PAGE' ? 'left' : 'center' }}>{h}</p>
            ))}
          </div>

          <div style={{ maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {pages.map((p) => (
              <div key={p.id} onClick={() => handlePageClick(p)} style={{
                display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px', gap: '12px',
                padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                border: '1px solid transparent', transition: 'all 0.15s', alignItems: 'center'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--black-3)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--black-5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--amber-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title || '(no title)'}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {p.url}
                  </p>
                </div>
                <p style={{ textAlign: 'center', fontSize: '11px', fontFamily: 'Space Mono, monospace', color: p.status_code === 200 ? '#7dc99a' : '#e07070', fontWeight: 700 }}>
                  {p.status_code}
                </p>
                <p style={{ textAlign: 'center', fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-secondary)' }}>
                  {p.depth}
                </p>
                <p style={{ textAlign: 'center', fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-secondary)' }}>
                  {p.word_count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loadingDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--black-2)', border: '1px solid var(--amber-border)', borderRadius: '10px', padding: '20px 32px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--amber)' }}>// loading page data...</p>
          </div>
        </div>
      )}

      {/* Page detail modal */}
      {selectedPage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setSelectedPage(null)}>
          <div style={{
            background: 'var(--black-2)', border: '1px solid var(--amber-border)',
            borderRadius: '14px', width: '100%', maxWidth: '680px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 60px rgba(212,160,23,0.15)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--black-4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'Syne, sans-serif' }}>
                  {selectedPage.title || '(no title)'}
                </p>
                <a href={selectedPage.url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--amber)',
                  textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  ↗ {selectedPage.url}
                </a>
              </div>
              <button onClick={() => setSelectedPage(null)} style={{
                background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', padding: '12px 24px', background: 'var(--black-3)', borderBottom: '1px solid var(--black-4)' }}>
              {[
                { label: 'STATUS', value: selectedPage.status_code, color: selectedPage.status_code === 200 ? '#7dc99a' : '#e07070' },
                { label: 'DEPTH',  value: selectedPage.depth,       color: 'var(--text-primary)' },
                { label: 'WORDS',  value: selectedPage.word_count,  color: 'var(--text-primary)' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ fontSize: '9px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</p>
                  <p style={{ fontSize: '14px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color }}>{value}</p>
                </div>
              ))}
              <div>
                <p style={{ fontSize: '9px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '2px' }}>CRAWLED AT</p>
                <p style={{ fontSize: '11px', fontFamily: 'Space Mono, monospace', color: 'var(--text-secondary)' }}>
                  {new Date(selectedPage.crawled_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {selectedPage.content ? (
                selectedPage.content.split("\n\n").map((section: string, i: number) => {
                  const label = section.match(/^\[(\w+)\]/)?.[1];
                  const text = section.replace(/^\[\w+\]\n?/, "");
                  return (
                    <div key={i} style={{ marginBottom: '20px' }}>
                      {label && (
                        <p style={{ fontSize: '9px', fontFamily: 'Space Mono, monospace', color: 'var(--amber)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                          ▸ {label}
                        </p>
                      )}
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: label === 'HEADINGS' ? 'Space Mono, monospace' : 'Syne, sans-serif' }}>
                        {text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)' }}>
                  // no content extracted
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}