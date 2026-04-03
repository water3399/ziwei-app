'use client';

export default function AnalysisLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Spinning star animation */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-4 rounded-full border-2 border-yellow-400/40 animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-pulse">✦</span>
        </div>
      </div>

      <div className="text-yellow-300 text-lg font-bold mb-2">紫微大師正在解讀命盤...</div>
      <div className="text-purple-400 text-sm animate-pulse">結合十二宮位、四化飛星、格局分析中</div>

      <div className="mt-8 flex gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-yellow-500/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
