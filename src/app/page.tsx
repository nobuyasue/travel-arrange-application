"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trip } from "@/lib/types";
import { getTrips, deleteTrip } from "@/lib/storage";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    setTrips(getTrips());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("この旅行プランを削除しますか？")) {
      deleteTrip(id);
      setTrips(getTrips());
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gradient">旅行プラン</h1>
          <p className="text-white/40 text-sm mt-1">
            あなたの旅を、予約完了まで導く
          </p>
        </div>
        <Link
          href="/create"
          className="btn-glow px-6 py-3 rounded-xl text-sm font-semibold"
        >
          + 新しい旅行を作成
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="glass rounded-2xl text-center py-24 glow-purple">
          <div className="text-5xl mb-4">✈</div>
          <p className="text-white/50 text-lg mb-6">
            まだ旅行プランがありません
          </p>
          <Link
            href="/create"
            className="btn-accent px-6 py-3 rounded-xl text-sm font-semibold inline-block"
          >
            最初の旅行プランを作成する
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="glass rounded-2xl p-6 flex items-center justify-between hover:bg-white/10 transition group glow-purple"
            >
              <div>
                <h2 className="text-lg font-semibold text-white group-hover:text-gradient-warm transition">
                  {trip.destination}
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  {trip.startDate} 〜 {trip.endDate} ・ {trip.travelers}名 ・
                  予算 {trip.budget.toLocaleString()}円
                </p>
                {trip.preferences.style && (
                  <p className="text-xs text-purple-400/60 mt-1">
                    {trip.preferences.style}
                    {trip.preferences.priorities.length > 0 &&
                      ` / ${trip.preferences.priorities.join("・")}`}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/itinerary?tripId=${trip.id}`}
                  className="text-sm bg-white/5 text-purple-300 border border-purple-500/20 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition"
                >
                  旅程を見る
                </Link>
                <Link
                  href={`/tasks?tripId=${trip.id}`}
                  className="text-sm bg-white/5 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition"
                >
                  予約タスク
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="text-sm text-white/20 px-3 py-2 rounded-xl hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
