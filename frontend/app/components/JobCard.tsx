"use client";
import { useRouter } from "next/navigation";
import { deleteJob, stopCrawl } from "../lib/api";

const statusConfig: Record<string, { color: string; bg: string; glow: string }> = {
  pending:   { color: '#d4a017', bg: 'rgba(212,160,23,0.12)',  glow: '#d4a017' },
  running:   { color: '#f0c040', bg: 'rgba(240,192,64,0.14)',  glow: '#f0c040' },
  completed: { color: '#6ec98a', bg: 'rgba(110,201,138,0.12)', glow: '#6ec98a' },
  failed:    { color: '#e07070', bg: 'rgba(224,112,112,0.12)', glow: '#e07070' },
  stopped:   { color: '#666',    bg: 'rgba(100,100,100,0.12)', glow: '#666'    },
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
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      style={{
        background: '#161616', border: '1px solid #2a2a2a', borderRadius: '12px',
        padding: '20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = '#3a3020';
        el.style.boxShadow = '0 0 28px rgba(212,160,23,0.1)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = '#2a2a2a';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      {job.status === 'running' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #d4a017, transparent)',
          animation: 'pulse-line 2s ease-in-out infinite'
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '10px' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#c8a84a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
          {job.seed_url}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '20px', background: s.bg, border: `1px solid ${s.color}44`, flexShrink: 0 }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color, display: 'inline-block', boxShadow: job.status === 'running' ? `0 0 6px ${s.glow}` : 'none' }} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: s.color, fontWeight: 700, letterSpacing: '0.1em' }}>
            {job.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'CRAWLED', value: job.pages_crawled },
          { label: 'DEPTH',   value: job.max_depth },
          { label: 'LIMIT',   value: job.max_pages },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '20px', fontWeight: 700, color: '#f0ece0' }}>{value}</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#5a5248', letterSpacing: '0.1em', marginTop: '3px' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#4a4540' }}>
          {new Date(job.created_at).toLocaleString()}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {job.status === 'running' && (
            <button onClick={handleStop} style={{
              padding: '4px 12px', borderRadius: '4px',
              border: '1px solid rgba(212,160,23,0.4)', background: 'transparent',
              color: '#d4a017', fontFamily: 'Space Mono, monospace', fontSize: '10px',
              fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer'
            }}>STOP</button>
          )}
          <button onClick={handleDelete} style={{
            padding: '4px 12px', borderRadius: '4px',
            border: '1px solid rgba(224,112,112,0.35)', background: 'transparent',
            color: '#e07070', fontFamily: 'Space Mono, monospace', fontSize: '10px',
            fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer'
          }}>DEL</button>
        </div>
      </div>
    </div>
  );
}