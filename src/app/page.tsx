import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl">
          <div className="text-5xl mb-4 opacity-60">✦</div>
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Noto Serif TC', serif" }}>
            紫微星鑑
          </h1>
          <p className="text-purple-300 text-lg mb-2">AI 紫微斗數命理分析系統</p>
          <p className="text-purple-500 text-sm mb-10 max-w-md mx-auto">
            結合中州派古典理論、iztro 精準排盤引擎與 AI 深度解讀，為你揭示命盤中的性格密碼、事業方向與人生運勢
          </p>

          <Link
            href="/analysis"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white font-bold text-lg hover:from-yellow-500/80 hover:to-amber-500/80 transition-all shadow-xl shadow-yellow-900/30 hover:shadow-yellow-800/40"
          >
            ✦ 開始排盤分析
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
          {[
            { icon: '🌟', title: '精準排盤', desc: 'iztro 引擎支援 14 主星、100+ 輔星雜曜、四化飛星、大限流年完整計算' },
            { icon: '📚', title: '古典知識庫', desc: '融合《紫微斗數全書》、中州派王亭之筆記、64 種格局判定' },
            { icon: '🤖', title: 'AI 深度解讀', desc: '不只是排盤，更提供 10 節完整分析報告和互動問答' },
          ].map((f, i) => (
            <div key={i} className="bg-purple-950/40 border border-purple-800/30 rounded-xl p-6 text-center hover:border-yellow-700/30 transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-yellow-300 font-bold mb-2">{f.title}</h3>
              <p className="text-purple-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-800/30 py-6 text-center">
        <p className="text-purple-600 text-xs">
          紫微星鑑 — 排盤引擎 iztro | AI 解讀 | 知識庫：紫微斗數全書 · 中州派
        </p>
      </footer>
    </div>
  );
}
