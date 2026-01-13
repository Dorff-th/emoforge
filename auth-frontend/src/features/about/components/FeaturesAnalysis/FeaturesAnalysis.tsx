import { useState, useMemo } from "react";
import { keywordData } from "./keywardData";
import {
  BarChart,
  Search,
  ChevronRight,
  PieChart as PieChartIcon,
} from "lucide-react";

export default function FeaturesAnalysis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(keywordData.map((d) => d.category))];

  const filteredData = useMemo(() => {
    return keywordData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.context.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const maxVal = Math.max(...keywordData.map((d) => d.value));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
              EmoForge Analysis
            </h1>
            <p className="text-slate-500 font-medium">
              마이크로서비스 아키텍처 핵심 키워드 중요도 리포트
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center min-w-[110px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                Total Keywords
              </div>
              <div className="text-2xl font-black text-blue-600">20</div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center min-w-[110px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                Max Weight
              </div>
              <div className="text-2xl font-black text-cyan-500">15%</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-10">
        {/* 핵심 차트 섹션 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-slate-200 shadow-md rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-800">
              <BarChart className="text-blue-600" size={22} />
              Top 10 Importance Ranking (%)
            </h2>
            <div className="space-y-6">
              {keywordData.slice(0, 10).map((item) => (
                <div key={item.id} className="group">
                  <div className="flex justify-between text-sm mb-2 px-1">
                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${(item.value / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-800">
              <PieChartIcon className="text-cyan-500" size={22} />
              Category Distribution
            </h2>
            <div className="space-y-5 flex-1">
              {categories
                .filter((c) => c !== "All")
                .map((cat) => {
                  const count = keywordData.filter(
                    (k) => k.category === cat
                  ).length;
                  const percentage = (count / keywordData.length) * 100;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-slate-500">{cat}</span>
                          <span className="text-slate-400">{count} Items</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full">
                          <div
                            className="h-full bg-blue-400/80 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 leading-relaxed font-medium">
              "EmoForge는 MSA 아키텍처와 보안(Auth) 및 서비스 독립성에 가장 큰
              비중을 두고 있습니다."
            </div>
          </div>
        </section>

        {/* 탐색 섹션 */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-6">
            <h2 className="text-2xl font-black text-slate-800">
              Keywords Explorer
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Icon size={64} />
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wider border border-slate-200">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-blue-100 transition-colors">
                      {item.value}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {item.context}
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-blue-600 font-bold cursor-pointer flex items-center gap-1">
                      상세 정보 보기 <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredData.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50">
              <Search className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">
                검색 조건에 맞는 키워드가 없습니다.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pb-12 border-t border-slate-200 pt-10 text-center text-slate-400 text-xs font-medium tracking-wide">
        &copy; 2024 EmoForge Project Key Keyword Analysis.{" "}
        <br className="md:hidden" />
        Visualized with Clean Light Interface.
      </footer>
    </div>
  );
}
