"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { Trip, ItineraryDay, Activity } from "@/lib/types";
import { getTrip, getItinerary, saveItinerary } from "@/lib/storage";

function generateMockItinerary(trip: Trip): ItineraryDay[] {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const days: ItineraryDay[] = [];
  const diffDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < diffDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const activities: Activity[] = [];

    if (i === 0) {
      activities.push(
        { time: "10:00", title: `${trip.destination}へ出発`, description: "空港へ移動、チェックイン", location: "出発空港", type: "transport" },
        { time: "15:00", title: `${trip.destination}到着`, description: "空港からホテルへ移動", location: trip.destination, type: "transport" },
        { time: "16:00", title: "ホテルチェックイン", description: "荷物を置いて周辺散策", location: `${trip.destination}市内`, type: "hotel" },
        { time: "18:00", title: "夕食", description: "地元の人気レストランで食事", location: `${trip.destination}市内`, type: "food" }
      );
    } else if (i === diffDays - 1) {
      activities.push(
        { time: "09:00", title: "ホテルチェックアウト", description: "荷物をまとめて出発準備", location: `${trip.destination}市内`, type: "hotel" },
        { time: "10:00", title: "お土産購入", description: "空港または市内でお土産を購入", location: trip.destination, type: "sightseeing" },
        { time: "14:00", title: "帰国便出発", description: "空港へ移動、チェックイン", location: `${trip.destination}空港`, type: "transport" }
      );
    } else {
      activities.push(
        { time: "08:00", title: "朝食", description: "ホテルまたは近くのカフェで朝食", location: `${trip.destination}市内`, type: "food" },
        { time: "09:30", title: `${trip.destination}観光スポット${i}`, description: "人気の観光地を訪問", location: trip.destination, type: "sightseeing" },
        { time: "12:00", title: "昼食", description: "ローカルフードを楽しむ", location: trip.destination, type: "food" },
        { time: "14:00", title: `アクティビティ（${i}日目）`, description: "現地体験・ツアーに参加", location: trip.destination, type: "activity" },
        { time: "18:00", title: "夕食", description: "おすすめレストランで食事", location: trip.destination, type: "food" }
      );
    }

    days.push({ dayNumber: i + 1, date: dateStr, activities });
  }
  return days;
}

const TYPE_LABELS: Record<string, { label: string; color: string; border: string; glow: string }> = {
  sightseeing: { label: "観光", color: "text-purple-300 bg-purple-500/20", border: "border-l-purple-500", glow: "shadow-purple-500/10" },
  food: { label: "食事", color: "text-amber-300 bg-amber-500/20", border: "border-l-amber-500", glow: "shadow-amber-500/10" },
  transport: { label: "移動", color: "text-blue-300 bg-blue-500/20", border: "border-l-blue-500", glow: "shadow-blue-500/10" },
  hotel: { label: "宿泊", color: "text-emerald-300 bg-emerald-500/20", border: "border-l-emerald-500", glow: "shadow-emerald-500/10" },
  activity: { label: "体験", color: "text-pink-300 bg-pink-500/20", border: "border-l-pink-500", glow: "shadow-pink-500/10" },
};

const TYPE_OPTIONS: Activity["type"][] = ["sightseeing", "food", "transport", "hotel", "activity"];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function EditActivityModal({
  activity,
  onSave,
  onDelete,
  onClose,
}: {
  activity: Activity;
  onSave: (a: Activity) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...activity });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md shadow-2xl glow-purple" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gradient mb-5">予定を編集</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">時間</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">タイトル</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">説明</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">場所</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => {
                const info = TYPE_LABELS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`text-xs px-3 py-1.5 rounded-full transition ${
                      form.type === t
                        ? "btn-accent"
                        : `${info.color}`
                    }`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onSave(form)}
            className="flex-1 btn-accent py-2.5 rounded-xl text-sm font-medium"
          >
            保存
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2.5 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/10 transition"
          >
            削除
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-white/40 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}

function ItineraryContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [editTarget, setEditTarget] = useState<{ dayIdx: number; actIdx: number } | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "旅程について何でも聞いてください。\n\n例：\n・「Day2の昼食を寿司に変えて」\n・「3日目にマッサージを追加して」\n・「全体的にもっとグルメ寄りにして」" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (!tripId) return;
    const t = getTrip(tripId);
    if (!t) return;
    setTrip(t);

    let days = getItinerary(tripId);
    if (days.length === 0) {
      days = generateMockItinerary(t);
      saveItinerary(tripId, days);
    }
    setItinerary(days);
  }, [tripId]);

  const persistItinerary = (days: ItineraryDay[]) => {
    setItinerary(days);
    if (tripId) saveItinerary(tripId, days);
  };

  const handleSaveActivity = (a: Activity) => {
    if (!editTarget) return;
    const updated = [...itinerary];
    updated[editTarget.dayIdx].activities[editTarget.actIdx] = a;
    persistItinerary(updated);
    setEditTarget(null);
  };

  const handleDeleteActivity = () => {
    if (!editTarget) return;
    const updated = [...itinerary];
    updated[editTarget.dayIdx].activities.splice(editTarget.actIdx, 1);
    persistItinerary(updated);
    setEditTarget(null);
  };

  const handleAddActivity = (dayIdx: number) => {
    const updated = [...itinerary];
    updated[dayIdx].activities.push({
      time: "12:00",
      title: "新しい予定",
      description: "",
      location: "",
      type: "sightseeing",
    });
    persistItinerary(updated);
    setEditTarget({ dayIdx, actIdx: updated[dayIdx].activities.length - 1 });
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    setTimeout(() => {
      let reply = "";
      const lower = userMsg.toLowerCase();

      if (lower.includes("追加")) {
        const dayMatch = userMsg.match(/(\d+)日目|day\s*(\d+)/i);
        const dayNum = dayMatch ? parseInt(dayMatch[1] || dayMatch[2]) : null;
        if (dayNum && dayNum <= itinerary.length) {
          const updated = [...itinerary];
          updated[dayNum - 1].activities.push({
            time: "15:00",
            title: userMsg.replace(/.*に|.*を|追加して|追加/g, "").trim() || "新しい予定",
            description: "チャットから追加",
            location: trip?.destination || "",
            type: "activity",
          });
          persistItinerary(updated);
          reply = `Day ${dayNum}に予定を追加しました。カードをクリックして詳細を編集できます。`;
        } else {
          reply = "何日目に追加しますか？\n例：「2日目にマッサージを追加して」";
        }
      } else if (lower.includes("変えて") || lower.includes("変更")) {
        reply = "変更したい予定のカードを直接クリックして編集できます。具体的にどの日のどの予定を変更しますか？";
      } else if (lower.includes("削除") || lower.includes("消して")) {
        reply = "削除したい予定のカードをクリックし、「削除」ボタンで消せます。";
      } else {
        reply = `承知しました。現在はデモモードです。\n\nカードを直接クリックして編集するか、以下の形式で指示してください：\n・「○日目に〇〇を追加して」`;
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }, 500);
  };

  if (!trip) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-white/50">旅行プランが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">
      {/* Header bar */}
      <div className="shrink-0 glass-strong border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gradient-warm">
            {trip.destination}
          </h1>
          <p className="text-xs text-white/30">
            {trip.startDate} 〜 {trip.endDate} ・ {trip.travelers}名 ・ 予算{" "}
            {trip.budget.toLocaleString()}円
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`text-sm px-4 py-2 rounded-xl transition ${
              chatOpen
                ? "btn-accent"
                : "glass text-white/50 hover:text-white"
            }`}
          >
            Chat
          </button>
          <Link
            href={`/tasks?tripId=${trip.id}`}
            className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/30 transition text-sm font-medium"
          >
            予約タスクへ
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Horizontal itinerary */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
          <div className="flex gap-4 h-full" style={{ minWidth: "fit-content" }}>
            {itinerary.map((day, dayIdx) => (
              <div
                key={day.dayNumber}
                className="w-72 shrink-0 glass rounded-2xl flex flex-col glow-purple"
              >
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-bold text-white text-base">
                    Day {day.dayNumber}
                  </h2>
                  <p className="text-xs text-white/30">{day.date}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {day.activities.map((act, actIdx) => {
                    const typeInfo = TYPE_LABELS[act.type] || {
                      label: act.type,
                      color: "text-white/50 bg-white/10",
                      border: "border-l-white/20",
                      glow: "",
                    };
                    return (
                      <div
                        key={actIdx}
                        onClick={() => setEditTarget({ dayIdx, actIdx })}
                        className={`p-3 rounded-xl bg-white/5 border-l-4 ${typeInfo.border} cursor-pointer hover:bg-white/10 transition group shadow-lg ${typeInfo.glow}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/30 font-mono">
                            {act.time}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="font-medium text-sm text-white mt-1 leading-tight">
                          {act.title}
                        </p>
                        {act.description && (
                          <p className="text-xs text-white/30 mt-0.5 leading-tight">
                            {act.description}
                          </p>
                        )}
                        <p className="text-[10px] text-purple-400 mt-1 opacity-0 group-hover:opacity-100 transition">
                          クリックして編集
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-white/5">
                  <button
                    onClick={() => handleAddActivity(dayIdx)}
                    className="w-full text-sm text-white/20 border border-dashed border-white/10 rounded-xl py-2 hover:text-purple-400 hover:border-purple-500/30 transition"
                  >
                    + 予定を追加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="w-80 shrink-0 border-l border-white/10 glass-strong flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-sm text-gradient">
                AI Concierge
              </h3>
              <p className="text-[10px] text-white/30 mt-0.5">
                旅程の変更をチャットで指示
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "ml-6" : "mr-6"}>
                  <div
                    className={`text-sm p-3 rounded-2xl whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "btn-accent rounded-br-sm"
                        : "bg-white/5 text-white/70 rounded-bl-sm border border-white/5"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  placeholder="変更を指示..."
                  className="flex-1 glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
                />
                <button
                  onClick={handleChatSend}
                  className="btn-accent px-4 py-2.5 rounded-xl text-sm"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {editTarget && (
        <EditActivityModal
          activity={itinerary[editTarget.dayIdx].activities[editTarget.actIdx]}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<p className="text-white/50 p-8">読み込み中...</p>}>
      <ItineraryContent />
    </Suspense>
  );
}
