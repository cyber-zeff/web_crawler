"use client";
import { useRouter } from "next/navigation";
import { deleteJob, stopCrawl } from "../lib/api";

const statusConfig: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  pending:   { color: '#d4a017', bg: 'rgba(212,160,23,0.1)',  dot: '#d4a017', label: 'PENDING'   },
  running:   { color: '#e8b84b', bg: 'rgba(232,184,75,0.12)', dot: '#e8b84b', label: 'RUNNING'   },
  completed: { color: '#7dc99a', bg: 'rgba(125,201,154,0.1)', dot: '#7dc99a', label: 'COMPLETED' },
  failed:    { color: '#e07070', bg: 'rgba(224,112,112,0.1)', dot: '#e07070', label: 'FAILED'    },
  stopped:   { color: '#5a5248', bg: 'rgba(90,82,72,0.15)',   dot: '#5a5248', label: 'STOPPED'   },
};

export default function JobCard({ job, onDeleted, onStopped }: { job: any; onDeleted: () => void; onStopped: () => void }) {
  const router = useRouter();
  const s = statusConfig[job.status] || statusConfig.stopped;

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this job and all its data?")) return;
    await deleteJob(job.id);
    onDeleted();
  }

  async function handleStop(e: React.MouseEvent) {
    e.stopPropagation();
    await stopCrawl(job.id);
    onStopped();
  }

  return (
    <div onClick={() => router.push(`/jobs/${job.id}`)} style={{
      background: 'var(--black-2)',
      border: '1px solid var(--black-5)',
      borderRadius: '12px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--amber-border)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 24px rgba(212,160,23,0.08)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--black-5)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
    }}>

      {/* Top accent line */}
      {job.status === 'running' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--amber), transparent)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'Space Mono, monospace', color: 'var(--amber-light)', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {job.seed_url}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '4px', background: s.bg, border: `1px solid ${s.color}33` }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot,
            boxShadow: job.status === 'running' ? `0 0 6px ${s.dot}` : 'none' }} />
          <span style={{ fontSize: '10px', fontFamily: 'Space Mono, monospace', color: s.color, fontWeight: 700, letterSpacing: '0.08em' }}>
            {s.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'CRAWLED', value: job.pages_crawled },
          { label: 'DEPTH',   value: job.max_depth },
          { label: 'LIMIT',   value: job.max_pages },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--black-3)', borderRadius: '6px', padding: '10px 8px', textAlign: 'center', border: '1px solid var(--black-4)' }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Mono, monospace' }}>{value}</p>
            <p style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: '2px' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)' }}>
          {new Date(job.created_at).toLocaleString()}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {job.status === 'running' && (
            <button onClick={handleStop} title="Stop crawl" style={{
              padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(212,160,23,0.4)',
              background: 'transparent', color: 'var(--amber)', fontSize: '10px',
              fontFamily: 'Space Mono, monospace', cursor: 'pointer', letterSpacing: '0.05em'
            }}>STOP</button>
          )}
          <button onClick={handleDelete} title="Delete" style={{
            padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(224,112,112,0.3)',
            background: 'transparent', color: 'var(--error-text)', fontSize: '10px',
            fontFamily: 'Space Mono, monospace', cursor: 'pointer', letterSpacing: '0.05em'
          }}>DEL</button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  );
}