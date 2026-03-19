"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Trip } from "@/lib/types";
import { saveTrip } from "@/lib/storage";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl glass flex items-center justify-center text-white/30 text-sm">
      地図を読み込み中...
    </div>
  ),
});

const STYLE_OPTIONS = [
  "のんびり",
  "アクティブ",
  "グルメ重視",
  "観光メイン",
  "コスパ重視",
  "ラグジュアリー",
];

const PRIORITY_OPTIONS = [
  "食事",
  "景色",
  "文化体験",
  "ショッピング",
  "自然",
  "アドベンチャー",
  "リラックス",
  "写真映え",
];

export default function CreateTrip() {
  const router = useRouter();
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelers: "1",
    style: "",
    priorities: [] as string[],
  });

  const togglePriority = (p: string) => {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter((x) => x !== p)
        : [...prev.priorities, p],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trip: Trip = {
      id: crypto.randomUUID(),
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      budget: Number(form.budget),
      travelers: Number(form.travelers),
      preferences: {
        style: form.style,
        priorities: form.priorities,
      },
      createdAt: new Date().toISOString(),
    };

    saveTrip(trip);
    router.push(`/itinerary?tripId=${trip.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gradient mb-2">
        新しい旅行を作成
      </h1>
      <p className="text-white/40 text-sm mb-8">
        行き先を選んで、あなただけの旅程を生成
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 世界地図 */}
        <WorldMap
          selected={form.destination}
          onSelect={(dest) => setForm({ ...form, destination: dest })}
        />

        {/* 行き先テキスト */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            行き先（直接入力も可）
          </label>
          <input
            type="text"
            required
            placeholder="例: バンコク、京都、パリ"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
          />
          {form.destination && (
            <p className="text-xs text-purple-400 mt-2">
              選択中: {form.destination}
            </p>
          )}
        </div>

        {/* 日程 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              出発日
            </label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              帰国日
            </label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
        </div>

        {/* 予算・人数 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              予算（円）
            </label>
            <input
              type="number"
              required
              placeholder="150000"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              人数
            </label>
            <input
              type="number"
              required
              min="1"
              value={form.travelers}
              onChange={(e) => setForm({ ...form, travelers: e.target.value })}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
        </div>

        {/* 旅行スタイル */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">
            旅行スタイル
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setForm({ ...form, style: s })}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  form.style === s
                    ? "btn-accent font-semibold"
                    : "glass text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 優先事項 */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">
            優先事項（複数選択可）
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => togglePriority(p)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  form.priorities.includes(p)
                    ? "btn-accent font-semibold"
                    : "glass text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-glow py-4 rounded-2xl font-semibold text-base tracking-wide"
        >
          旅程を生成する
        </button>
      </form>
    </div>
  );
}
