'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import type { StoredReport } from '@/lib/ziwei/types';
import ZiweiChart from '@/components/chart/ZiweiChart';
import ReportView from '@/components/analysis/ReportView';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);

  useEffect(() => {
    const r = getReport(id);
    setReport(r);
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814] flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-400 mb-4">找不到此報告</p>
          <Link href="/analysis" className="text-yellow-400 underline hover:text-yellow-300">
            重新排盤
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(report.createdAt).toLocaleDateString('zh-TW');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0814] via-[#110E20] to-[#0A0814]">
      <header className="border-b border-yellow-700/20 bg-purple-950/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-yellow-400 font-bold text-lg hover:text-yellow-300">
            ✦ 紫微星鑑
          </Link>
          <div className="flex gap-3">
            <Link
              href={`/chat/${id}`}
              className="px-4 py-1.5 rounded-lg bg-purple-700/40 text-purple-200 text-sm hover:bg-purple-600/40 transition-all"
            >
              💬 提問
            </Link>
            <Link
              href="/analysis"
              className="px-4 py-1.5 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60 transition-all"
            >
              新排盤
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Report header */}
        <div className="text-center mb-8">
          <h1 className="text-yellow-300 text-2xl font-bold mb-2">命盤分析報告</h1>
          <p className="text-purple-400 text-sm">
            {report.birthData.year}/{report.birthData.month}/{report.birthData.day} {report.birthData.gender}
            ｜ {report.chartData.fiveElementsClass}
            ｜ 分析日期：{date}
          </p>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <ZiweiChart chartData={report.chartData} compact />
        </div>

        {/* Report */}
        <ReportView markdown={report.markdown} />

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center mt-8 pb-8">
          <Link
            href={`/chat/${id}`}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white text-sm font-bold hover:from-purple-500/80 hover:to-purple-600/80 transition-all"
          >
            💬 向紫微大師提問
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-lg border border-purple-700/40 text-purple-400 text-sm hover:border-purple-500/60 transition-all"
          >
            🖨️ 列印
          </button>
        </div>
      </main>
    </div>
  );
}
