"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob, getPages, getPageDetail, exportJob, stopCrawl } from "@/app/lib/api";
import SearchBar from "@/app/components/SearchBar";
import Link from "next/link";

const statusConfig: Record<string, { color: string; bg: string }> = {
  pending:   { color: '#d4a017', bg: 'rgba(212,160,23,0.12)'  },
  running:   { color: '#f0c040', bg: 'rgba(240,192,64,0.14)'  },
  completed: { color: '#6ec98a', bg: 'rgba(110,201,138,0.12)' },
  failed:    { color: '#e07070', bg: 'rgba(224,112,112,0.12)' },
  stopped:   { color: '#666',    bg: 'rgba(100,100,100,0.12)' },
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
        setJob(j); setPages(p);
      } catch {}
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [id]);

  async function handlePageClick(page: any) {
    setLoadingDetail(true);
    setSelectedPage(null);
    try { setSelectedPage(await getPageDetail(page.id)); }
    catch { setSelectedPage(page); }
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
    setJob(await getJob(id as string));
  }

  if (!job) return (
    <main style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: '#4a4540' }}>// loading job data...</p>
    </main>
  );

  const s = statusConfig[job.status] || statusConfig.stopped;

  const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', ...extra }}>
      {children}
    </div>
  );

  const sectionLabel = (text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', color: '#d4a017', textTransform: 'uppercase' }}>▸ {text}</span>
      <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#0d0d0d', padding: '40px 20px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Nav bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1e1e1e' }}>
          <Link href="/" style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#7a7060', textDecoration: 'none', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ← BACK
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            {job.status === 'running' && (
              <button onClick={handleStop} style={{
                padding: '8px 18px', borderRadius: '6px',
                border: '1px solid rgba(212,160,23,0.4)', background: 'rgba(212,160,23,0.08)',
                color: '#d4a017', fontFamily: 'Space Mono, monospace', fontSize: '11px',
                fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
              }}>■ STOP JOB</button>
            )}
            <button onClick={handleExport} style={{
              padding: '8px 18px', borderRadius: '6px',
              border: '1px solid rgba(110,201,138,0.35)', background: 'rgba(110,201,138,0.08)',
              color: '#6ec98a', fontFamily: 'Space Mono, monospace', fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
            }}>↓ EXPORT JSON</button>
          </div>
        </div>

        {/* Job overview */}
        {card(
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#4a4540', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>SEED URL</p>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: '#c8a84a', wordBreak: 'break-all' }}>{job.seed_url}</p>
              </div>
              <div style={{ padding: '4px 12px', borderRadius: '20px', background: s.bg, border: `1px solid ${s.color}44`, flexShrink: 0 }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: s.color, fontWeight: 700, letterSpacing: '0.1em' }}>
                  {job.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: 'PAGES CRAWLED', value: job.pages_crawled },
                { label: 'MAX DEPTH',     value: job.max_depth     },
                { label: 'PAGE LIMIT',    value: job.max_pages     },
                { label: 'DELAY (S)',     value: job.delay         },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '14px 10px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '22px', fontWeight: 700, color: '#f0ece0' }}>{value}</p>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#5a5248', letterSpacing: '0.1em', marginTop: '5px' }}>{label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search */}
        {card(<>{sectionLabel('Search This Job')}<SearchBar jobId={id as string} /></>)}

        {/* Pages table */}
        {card(
          <>
            {sectionLabel(`Crawled Pages (${pages.length})`)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 70px', gap: '12px', padding: '0 10px 10px', borderBottom: '1px solid #1e1e1e', marginBottom: '6px' }}>
              {['PAGE TITLE / URL', 'CODE', 'DEPTH', 'WORDS'].map(h => (
                <p key={h} style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#4a4540', letterSpacing: '0.1em', textAlign: h === 'PAGE TITLE / URL' ? 'left' : 'center' }}>{h}</p>
              ))}
            </div>
            <div style={{ maxHeight: '460px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {pages.length === 0 && (
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#3a3530', padding: '20px 10px' }}>// no pages crawled yet</p>
              )}
              {pages.map(p => (
                <div key={p.id} onClick={() => handlePageClick(p)} style={{
                  display: 'grid', gridTemplateColumns: '1fr 56px 56px 70px', gap: '12px',
                  padding: '10px 10px', borderRadius: '6px', cursor: 'pointer',
                  border: '1px solid transparent', transition: 'all 0.15s', alignItems: 'center'
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = '#1e1e1e';
                  el.style.borderColor = '#2a2a2a';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = 'transparent';
                  el.style.borderColor = 'transparent';
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#c8a84a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title || '(no title)'}
                    </p>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#4a4540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {p.url}
                    </p>
                  </div>
                  <p style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: '12px', fontWeight: 700, color: p.status_code === 200 ? '#6ec98a' : '#e07070' }}>
                    {p.status_code}
                  </p>
                  <p style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#7a7060' }}>{p.depth}</p>
                  <p style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#7a7060' }}>{p.word_count}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Loading overlay */}
      {loadingDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#161616', border: '1px solid rgba(212,160,23,0.3)', borderRadius: '10px', padding: '20px 32px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#d4a017' }}>// loading page data...</p>
          </div>
        </div>
      )}

      {/* Page detail modal */}
      {selectedPage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setSelectedPage(null)}>
          <div style={{
            background: '#161616', border: '1px solid rgba(212,160,23,0.25)', borderRadius: '14px',
            width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 60px rgba(212,160,23,0.12)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#f0ece0', marginBottom: '5px' }}>
                  {selectedPage.title || '(no title)'}
                </p>
                <a href={selectedPage.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#d4a017', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ↗ {selectedPage.url}
                </a>
              </div>
              <button onClick={() => setSelectedPage(null)} style={{ background: 'none', border: 'none', color: '#4a4540', cursor: 'pointer', fontSize: '20px', lineHeight: 1, flexShrink: 0, padding: '0 4px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '24px', padding: '12px 24px', background: '#111', borderBottom: '1px solid #222' }}>
              {[
                { label: 'STATUS', value: selectedPage.status_code, color: selectedPage.status_code === 200 ? '#6ec98a' : '#e07070' },
                { label: 'DEPTH',  value: selectedPage.depth,       color: '#f0ece0' },
                { label: 'WORDS',  value: selectedPage.word_count,  color: '#f0ece0' },
                { label: 'CRAWLED AT', value: new Date(selectedPage.crawled_at).toLocaleString(), color: '#7a7060' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#4a4540', letterSpacing: '0.1em', marginBottom: '3px' }}>{label}</p>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', fontWeight: 700, color }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {selectedPage.content ? (
                selectedPage.content.split("\n\n").map((section: string, i: number) => {
                  const label = section.match(/^\[(\w+)\]/)?.[1];
                  const text = section.replace(/^\[\w+\]\n?/, "");
                  return (
                    <div key={i} style={{ marginBottom: '20px' }}>
                      {label && (
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#d4a017', letterSpacing: '0.16em', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>
                          ▸ {label}
                        </p>
                      )}
                      <p style={{
                        fontSize: '13px', color: '#b0a898', lineHeight: 1.75,
                        whiteSpace: 'pre-wrap',
                        fontFamily: label === 'HEADINGS' ? 'Space Mono, monospace' : 'Syne, sans-serif'
                      }}>{text}</p>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: '#3a3530' }}>// no content extracted</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}