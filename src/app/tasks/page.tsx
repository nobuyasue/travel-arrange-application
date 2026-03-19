"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Trip, BookingTask } from "@/lib/types";
import {
  getTrip,
  getBookingTasks,
  saveBookingTasks,
  updateBookingTaskStatus,
} from "@/lib/storage";

function generateMockTasks(trip: Trip): BookingTask[] {
  return [
    {
      id: crypto.randomUUID(),
      tripId: trip.id,
      type: "flight",
      name: `往路航空券（→ ${trip.destination}）`,
      date: trip.startDate,
      status: "pending",
      options: [
        { id: crypto.randomUUID(), provider: "Skyscanner", title: "最安値フライト検索", price: 45000, currency: "JPY", rating: 4.2, cancellationPolicy: "サイトにより異なる", deeplinkUrl: "https://www.skyscanner.jp/" },
        { id: crypto.randomUUID(), provider: "Google Flights", title: "フライト比較", price: 45000, currency: "JPY", rating: 4.5, cancellationPolicy: "航空会社による", deeplinkUrl: "https://www.google.com/travel/flights" },
      ],
    },
    {
      id: crypto.randomUUID(),
      tripId: trip.id,
      type: "flight",
      name: `復路航空券（${trip.destination} →）`,
      date: trip.endDate,
      status: "pending",
      options: [
        { id: crypto.randomUUID(), provider: "Skyscanner", title: "最安値フライト検索", price: 45000, currency: "JPY", rating: 4.2, cancellationPolicy: "サイトにより異なる", deeplinkUrl: "https://www.skyscanner.jp/" },
      ],
    },
    {
      id: crypto.randomUUID(),
      tripId: trip.id,
      type: "hotel",
      name: `${trip.destination}のホテル`,
      date: trip.startDate,
      status: "pending",
      options: [
        { id: crypto.randomUUID(), provider: "Booking.com", title: "ホテル検索・予約", price: 8000, currency: "JPY", rating: 4.5, cancellationPolicy: "多くが無料キャンセル可", deeplinkUrl: "https://www.booking.com/" },
        { id: crypto.randomUUID(), provider: "Agoda", title: "アジア圏に強いホテル予約", price: 7500, currency: "JPY", rating: 4.3, cancellationPolicy: "プランによる", deeplinkUrl: "https://www.agoda.com/" },
        { id: crypto.randomUUID(), provider: "Expedia", title: "ホテル+航空券セット割", price: 8500, currency: "JPY", rating: 4.1, cancellationPolicy: "プランによる", deeplinkUrl: "https://www.expedia.co.jp/" },
      ],
    },
    {
      id: crypto.randomUUID(),
      tripId: trip.id,
      type: "activity",
      name: `${trip.destination}の現地ツアー・体験`,
      date: trip.startDate,
      status: "pending",
      options: [
        { id: crypto.randomUUID(), provider: "Klook", title: "現地アクティビティ予約", price: 5000, currency: "JPY", rating: 4.4, cancellationPolicy: "24時間前まで無料", deeplinkUrl: "https://www.klook.com/ja/" },
        { id: crypto.randomUUID(), provider: "GetYourGuide", title: "ツアー・体験予約", price: 6000, currency: "JPY", rating: 4.3, cancellationPolicy: "24時間前まで無料", deeplinkUrl: "https://www.getyourguide.com/" },
      ],
    },
  ];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "未予約", color: "text-amber-300", bg: "bg-amber-500/20" },
  booked: { label: "予約済み", color: "text-emerald-300", bg: "bg-emerald-500/20" },
  on_hold: { label: "保留", color: "text-white/40", bg: "bg-white/10" },
};

const TYPE_ICONS: Record<string, string> = {
  flight: "✈",
  hotel: "🏨",
  activity: "🎯",
};

function TasksContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tasks, setTasks] = useState<BookingTask[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    const t = getTrip(tripId);
    if (!t) return;
    setTrip(t);

    let existingTasks = getBookingTasks(tripId);
    if (existingTasks.length === 0) {
      existingTasks = generateMockTasks(t);
      saveBookingTasks(tripId, existingTasks);
    }
    setTasks(existingTasks);
  }, [tripId]);

  const handleStatusChange = (taskId: string, status: BookingTask["status"]) => {
    if (!tripId) return;
    updateBookingTaskStatus(tripId, taskId, status);
    setTasks(getBookingTasks(tripId));
  };

  if (!trip) {
    return <p className="text-white/50 p-8">旅行プランが見つかりません。</p>;
  }

  const bookedCount = tasks.filter((t) => t.status === "booked").length;
  const progress = tasks.length > 0 ? (bookedCount / tasks.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">予約タスク</h1>
          <p className="text-sm text-white/30 mt-1">
            {trip.destination} ・ {bookedCount}/{tasks.length} 完了
          </p>
        </div>
        <Link
          href={`/itinerary?tripId=${trip.id}`}
          className="text-sm text-purple-300 hover:text-purple-200 transition"
        >
          旅程に戻る
        </Link>
      </div>

      {/* Progress */}
      <div className="glass rounded-2xl p-5 mb-8 glow-purple">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-white/50">予約進捗</span>
          <span className="text-gradient font-semibold">
            {bookedCount}/{tasks.length}
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const statusInfo = STATUS_LABELS[task.status];
          const isExpanded = expandedTask === task.id;
          return (
            <div key={task.id} className="glass rounded-2xl overflow-hidden glow-purple">
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition"
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{TYPE_ICONS[task.type]}</span>
                  <div>
                    <p className="font-medium text-white">{task.name}</p>
                    <p className="text-xs text-white/30">{task.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-white/20 text-sm">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/5 p-5">
                  <div className="flex gap-2 mb-5">
                    {(["pending", "booked", "on_hold"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(task.id, s)}
                        className={`text-xs px-4 py-1.5 rounded-full transition ${
                          task.status === s
                            ? "btn-accent"
                            : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {STATUS_LABELS[s].label}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-medium text-white/50 mb-3">
                    予約候補サイト
                  </h3>
                  <div className="space-y-3">
                    {task.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition"
                      >
                        <div>
                          <p className="font-medium text-white text-sm">
                            {opt.provider}
                          </p>
                          <p className="text-xs text-white/30">{opt.title}</p>
                          <p className="text-xs text-white/20 mt-1">
                            参考: {opt.price.toLocaleString()}
                            {opt.currency} ・ {opt.rating} ・{" "}
                            {opt.cancellationPolicy}
                          </p>
                        </div>
                        <a
                          href={opt.deeplinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-accent text-xs px-4 py-2 rounded-xl whitespace-nowrap"
                        >
                          予約サイトへ
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<p className="text-white/50 p-8">読み込み中...</p>}>
      <TasksContent />
    </Suspense>
  );
}
