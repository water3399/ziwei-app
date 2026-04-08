import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '紫微星鑑 — AI 紫微斗數命理分析';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0814 0%, #1A1433 40%, #2D1B69 70%, #0A0814 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: '1px solid rgba(196, 163, 90, 0.15)', borderRadius: 20, display: 'flex' }} />

        <div style={{ position: 'absolute', top: 40, left: 40, color: 'rgba(196, 163, 90, 0.25)', fontSize: 30, display: 'flex' }}>✦</div>
        <div style={{ position: 'absolute', top: 40, right: 40, color: 'rgba(196, 163, 90, 0.25)', fontSize: 30, display: 'flex' }}>✦</div>
        <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'rgba(196, 163, 90, 0.25)', fontSize: 30, display: 'flex' }}>✦</div>
        <div style={{ position: 'absolute', bottom: 40, right: 40, color: 'rgba(196, 163, 90, 0.25)', fontSize: 30, display: 'flex' }}>✦</div>

        <div style={{ fontSize: 80, marginBottom: 10, display: 'flex', color: 'rgba(196, 163, 90, 0.4)' }}>✦</div>

        <div style={{ fontSize: 72, fontWeight: 700, color: '#C4A35A', letterSpacing: 8, marginBottom: 8, display: 'flex' }}>
          紫微星鑑
        </div>

        <div style={{ fontSize: 28, color: 'rgba(196, 163, 90, 0.7)', letterSpacing: 4, marginBottom: 30, display: 'flex' }}>
          AI 紫微斗數命理分析系統
        </div>

        <div style={{ width: 120, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.4), transparent)', marginBottom: 30, display: 'flex' }} />

        <div style={{ display: 'flex', gap: 40, color: 'rgba(155, 123, 207, 0.6)', fontSize: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>🌟</span><span>精準排盤</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>📚</span><span>古典知識庫</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>🤖</span><span>AI 深度解讀</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>📅</span><span>逐月流年</span></div>
        </div>

        {/* 12 palace mini grid hint */}
        <div style={{ display: 'flex', gap: 4, marginTop: 35 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} style={{
                  width: 40, height: 30,
                  border: '1px solid rgba(155, 123, 207, 0.2)',
                  borderRadius: 4,
                  background: (i === 1 && j === 1) || (i === 2 && j === 1) ? 'rgba(196,163,90,0.1)' : 'rgba(155,123,207,0.03)',
                  display: 'flex',
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
