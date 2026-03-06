"use client";

import { useState, useEffect } from 'react';
import { Settings, X, Save } from 'lucide-react';

type Config = {
  regionCode: string;
  transitUrl: string;
  newsGenre: string;
  refreshInterval: number; // minutes
};

const DEFAULT_CONFIG: Config = {
  regionCode: '130000', // Tokyo
  transitUrl: 'https://transit.yahoo.co.jp/diainfo/21/0', // Yamanote
  newsGenre: 'top',
  refreshInterval: 15, // 15 mins
};

interface SettingsModalProps {
  onSave: (config: Config) => void;
  isOpen: boolean;
  onClose: () => void;
}

const REGION_CODES = [
  { code: '010100', name: '北海道（石狩・空知・後志）' },
  { code: '040000', name: '宮城県' },
  { code: '130000', name: '東京都' },
  { code: '140000', name: '神奈川県' },
  { code: '230000', name: '愛知県' },
  { code: '270000', name: '大阪府' },
  { code: '280000', name: '兵庫県' },
  { code: '340000', name: '広島県' },
  { code: '400000', name: '福岡県' },
  { code: '470000', name: '沖縄県' },
  // 必要な分だけ追加可能。完全なリストが必要であれば拡張。
];

const NEWS_GENRES = [
  { value: 'top', label: '主要' },
  { value: 'domestic', label: '国内' },
  { value: 'world', label: '国際' },
  { value: 'business', label: '経済' },
  { value: 'entertainment', label: 'エンタメ' },
  { value: 'sports', label: 'スポーツ' },
  { value: 'it', label: 'IT' },
  { value: 'science', label: '科学' },
];

export function useDashboardConfig() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dashboard_config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        console.error('Failed to parse config');
      }
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = (newConfig: Config) => {
    setConfig(newConfig);
    localStorage.setItem('dashboard_config', JSON.stringify(newConfig));
  };

  return { config, saveConfig, isLoaded };
}

export default function SettingsModal({ onSave, isOpen, onClose }: SettingsModalProps) {
  const [draftConfig, setDraftConfig] = useState<Config>(DEFAULT_CONFIG);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('dashboard_config');
      if (stored) {
        try {
          setDraftConfig(JSON.parse(stored));
        } catch {
           setDraftConfig(DEFAULT_CONFIG);
        }
      } else {
        setDraftConfig(DEFAULT_CONFIG);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draftConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          ダッシュボード設定
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">天気予報の地域</label>
            <select
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={draftConfig.regionCode}
              onChange={(e) => setDraftConfig({ ...draftConfig, regionCode: e.target.value })}
            >
              {REGION_CODES.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">※気象庁の地域コード</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Yahoo運行情報のURL</label>
            <input
              type="url"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={draftConfig.transitUrl}
              onChange={(e) => setDraftConfig({ ...draftConfig, transitUrl: e.target.value })}
              placeholder="例: https://transit.yahoo.co.jp/diainfo/21/0"
            />
            <p className="text-xs text-gray-400 mt-1">※Yahoo路線情報の「運行情報」ページのURLを貼り付けてください</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">ニュースジャンル</label>
            <select
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={draftConfig.newsGenre}
              onChange={(e) => setDraftConfig({ ...draftConfig, newsGenre: e.target.value })}
            >
              {NEWS_GENRES.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">更新間隔 (分)</label>
            <input
              type="number"
              min="1"
              max="1440"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={draftConfig.refreshInterval}
              onChange={(e) => setDraftConfig({ ...draftConfig, refreshInterval: parseInt(e.target.value) || 15 })}
            />
            <p className="text-xs text-gray-400 mt-1">※最低1分、推奨15分以上</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
