"use client";

import { useEffect, useState } from "react";
import { useDashboardConfig } from "@/components/ui/SettingsModal";
import SettingsModal from "@/components/ui/SettingsModal";
import Clock from "@/components/ui/Clock";
import { Settings, Cloud, Train, Newspaper, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

type WeatherData = {
  area: string;
  weathers: string[];
  temps: string[];
  pops: string[];
};

type TransitData = {
  lineName: string;
  status: string;
  detail: string;
};

type NewsData = {
  title: string;
  items: { title: string; link: string; pubDate: string }[];
};

export default function Dashboard() {
  const { config, saveConfig, isLoaded } = useDashboardConfig();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data states
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [transit, setTransit] = useState<TransitData | null>(null);
  const [news, setNews] = useState<NewsData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const [weatherRes, transitRes, newsRes] = await Promise.all([
        fetch(`/api/weather?regionCode=${config.regionCode}`),
        fetch(`/api/transit?url=${encodeURIComponent(config.transitUrl)}`),
        fetch(`/api/news?genre=${config.newsGenre}`)
      ]);

      const weatherData = weatherRes.ok ? await weatherRes.json() : null;
      const transitData = transitRes.ok ? await transitRes.json() : null;
      const newsData = newsRes.ok ? await newsRes.json() : null;

      setWeather(weatherData);
      setTransit(transitData);
      setNews(newsData);

      // Fetch summary after getting basic data
      try {
        const summaryRes = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weather: weatherData, transit: transitData, news: newsData })
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData.summary);
        } else {
          setSummary("要約の取得に失敗しました。Gemini APIの設定を確認してください。");
        }
      } catch {
        setSummary("要約の取得中にエラーが発生しました。");
      }

      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error("Failed to fetch dashboard data:", err);
      setError("データの取得に失敗しました。ネットワーク接続を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchData();
      // Set up polling
      const intervalId = setInterval(fetchData, config.refreshInterval * 60 * 1000);
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, config]); // Re-fetch when config changes

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-2">
          Daily Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 flex items-center gap-1">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            {lastUpdated ? lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--'} 更新
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-gray-300 hover:text-white"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (Clock & Summary) */}
        <div className="lg:col-span-4 space-y-6">
          <Clock />

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
              今日の概要 (AI要約)
            </h2>
            {loading && !summary ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-800 rounded w-4/6"></div>
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {summary || "データがありません。"}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column (Data Widgets) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Weather Widget */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Cloud className="w-5 h-5 text-blue-400" />
              天気予報
            </h2>

            {loading && !weather ? (
              <div className="animate-pulse space-y-4 flex-1">
                <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                <div className="h-10 bg-gray-800 rounded w-full"></div>
              </div>
            ) : weather ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="text-lg font-medium text-gray-200 mb-2">{weather.area}</div>
                  <div className="text-3xl font-bold text-white mb-4">
                    {weather.weathers?.[0]?.replace('　', ' ') || "不明"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                     <span className="block text-xs text-gray-400 mb-1">降水確率</span>
                     <span className="text-lg font-semibold text-cyan-400">
                       {weather.pops && weather.pops.length > 0 ? `${weather.pops[0]}%` : '--%'}
                     </span>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                     <span className="block text-xs text-gray-400 mb-1">気温</span>
                     <span className="text-lg font-semibold text-orange-400">
                       {weather.temps && weather.temps.length >= 2 ? `${weather.temps[0]}℃ / ${weather.temps[1]}℃` : '--℃'}
                     </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">天気情報を取得できませんでした</div>
            )}
          </div>

          {/* Transit Widget */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden flex flex-col h-full">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Train className="w-5 h-5 text-emerald-400" />
              運行情報
            </h2>

            {loading && !transit ? (
               <div className="animate-pulse space-y-4 flex-1">
                 <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                 <div className="h-8 bg-gray-800 rounded w-full mt-4"></div>
               </div>
            ) : transit ? (
              <div className="flex flex-col h-full">
                <div className="text-lg font-medium text-gray-200 mb-2 truncate" title={transit.lineName}>
                  {transit.lineName}
                </div>

                <div className={`mt-2 p-4 rounded-xl border flex items-center justify-center text-center ${
                  transit.status.includes('平常')
                  ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
                }`}>
                  <span className="text-xl font-bold">{transit.status}</span>
                </div>

                <p className="mt-4 text-sm text-gray-400 leading-relaxed overflow-y-auto">
                  {transit.detail}
                </p>
              </div>
            ) : (
              <div className="text-gray-500">運行情報を取得できませんでした</div>
            )}
          </div>

          {/* News Widget - Spans 2 columns on medium screens */}
          <div className="md:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500"></div>
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                 <Newspaper className="w-5 h-5 text-orange-400" />
                 最新ニュース
               </h2>
               {news && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{news.title.replace(' - Yahoo!ニュース', '')}</span>}
             </div>

             {loading && !news ? (
               <div className="animate-pulse space-y-4">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <div key={i} className="h-5 bg-gray-800 rounded w-full"></div>
                 ))}
               </div>
             ) : news?.items ? (
               <ul className="space-y-3">
                 {news.items.map((item, idx) => (
                   <li key={idx} className="group flex flex-col border-b border-gray-800/50 pb-3 last:border-0 last:pb-0">
                     <a
                       href={item.link}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-gray-200 hover:text-blue-400 transition-colors line-clamp-1 group-hover:underline"
                     >
                       {item.title}
                     </a>
                     <span className="text-xs text-gray-500 mt-1">
                       {new Date(item.pubDate).toLocaleString('ja-JP')}
                     </span>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="text-gray-500">ニュースを取得できませんでした</div>
             )}
          </div>

        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newConfig) => {
          saveConfig(newConfig);
          // Auto fetch triggered by useEffect on config change
        }}
      />
    </div>
  );
}
