"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const POPULAR_DESTINATIONS = [
  { name: "東京", lat: 35.6762, lng: 139.6503, country: "日本" },
  { name: "京都", lat: 35.0116, lng: 135.7681, country: "日本" },
  { name: "大阪", lat: 34.6937, lng: 135.5023, country: "日本" },
  { name: "沖縄", lat: 26.3344, lng: 127.8056, country: "日本" },
  { name: "北海道（札幌）", lat: 43.0618, lng: 141.3545, country: "日本" },
  { name: "ソウル", lat: 37.5665, lng: 126.978, country: "韓国" },
  { name: "釜山", lat: 35.1796, lng: 129.0756, country: "韓国" },
  { name: "台北", lat: 25.033, lng: 121.5654, country: "台湾" },
  { name: "バンコク", lat: 13.7563, lng: 100.5018, country: "タイ" },
  { name: "プーケット", lat: 7.8804, lng: 98.3923, country: "タイ" },
  { name: "シンガポール", lat: 1.3521, lng: 103.8198, country: "シンガポール" },
  { name: "クアラルンプール", lat: 3.139, lng: 101.6869, country: "マレーシア" },
  { name: "バリ", lat: -8.3405, lng: 115.092, country: "インドネシア" },
  { name: "ホーチミン", lat: 10.8231, lng: 106.6297, country: "ベトナム" },
  { name: "ハノイ", lat: 21.0278, lng: 105.8342, country: "ベトナム" },
  { name: "マニラ", lat: 14.5995, lng: 120.9842, country: "フィリピン" },
  { name: "香港", lat: 22.3193, lng: 114.1694, country: "中国" },
  { name: "上海", lat: 31.2304, lng: 121.4737, country: "中国" },
  { name: "北京", lat: 39.9042, lng: 116.4074, country: "中国" },
  { name: "パリ", lat: 48.8566, lng: 2.3522, country: "フランス" },
  { name: "ロンドン", lat: 51.5074, lng: -0.1278, country: "イギリス" },
  { name: "ローマ", lat: 41.9028, lng: 12.4964, country: "イタリア" },
  { name: "バルセロナ", lat: 41.3874, lng: 2.1686, country: "スペイン" },
  { name: "アムステルダム", lat: 52.3676, lng: 4.9041, country: "オランダ" },
  { name: "ベルリン", lat: 52.52, lng: 13.405, country: "ドイツ" },
  { name: "ウィーン", lat: 48.2082, lng: 16.3738, country: "オーストリア" },
  { name: "プラハ", lat: 50.0755, lng: 14.4378, country: "チェコ" },
  { name: "イスタンブール", lat: 41.0082, lng: 28.9784, country: "トルコ" },
  { name: "ニューヨーク", lat: 40.7128, lng: -74.006, country: "アメリカ" },
  { name: "ロサンゼルス", lat: 34.0522, lng: -118.2437, country: "アメリカ" },
  { name: "ハワイ（ホノルル）", lat: 21.3069, lng: -157.8583, country: "アメリカ" },
  { name: "ラスベガス", lat: 36.1699, lng: -115.1398, country: "アメリカ" },
  { name: "カンクン", lat: 21.1619, lng: -86.8515, country: "メキシコ" },
  { name: "シドニー", lat: -33.8688, lng: 151.2093, country: "オーストラリア" },
  { name: "ドバイ", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { name: "モルディブ", lat: 3.2028, lng: 73.2207, country: "モルディブ" },
  { name: "カイロ", lat: 30.0444, lng: 31.2357, country: "エジプト" },
];

interface WorldMapProps {
  onSelect: (destination: string) => void;
  selected: string;
}

export default function WorldMap({ onSelect, selected }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [search, setSearch] = useState("");

  const filteredDestinations = search
    ? POPULAR_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.country.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_DESTINATIONS;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 100],
      zoom: 3,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredDestinations.forEach((dest) => {
      const isSelected = selected === dest.name;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${isSelected ? "18px" : "10px"};
          height: ${isSelected ? "18px" : "10px"};
          background: ${isSelected ? "linear-gradient(135deg, #a78bfa, #6366f1)" : "rgba(168, 85, 247, 0.7)"};
          border: 2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.3)"};
          border-radius: 50%;
          box-shadow: 0 0 ${isSelected ? "20px" : "8px"} rgba(139, 92, 246, ${isSelected ? "0.8" : "0.4"});
          transition: all 0.3s;
        "></div>`,
        iconSize: [isSelected ? 18 : 10, isSelected ? 18 : 10],
        iconAnchor: [isSelected ? 9 : 5, isSelected ? 9 : 5],
      });

      const marker = L.marker([dest.lat, dest.lng], { icon })
        .addTo(map)
        .bindTooltip(`${dest.name}（${dest.country}）`, {
          direction: "top",
          offset: [0, -8],
          className: "custom-tooltip",
        })
        .on("click", () => {
          onSelect(dest.name);
          map.flyTo([dest.lat, dest.lng], 6, { duration: 0.8 });
        });

      markersRef.current.push(marker);
    });
  }, [filteredDestinations, selected, onSelect]);

  const handleListSelect = (dest: (typeof POPULAR_DESTINATIONS)[0]) => {
    onSelect(dest.name);
    mapInstanceRef.current?.flyTo([dest.lat, dest.lng], 6, { duration: 0.8 });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/70">
        行き先を地図から選ぶ
      </label>

      <div
        ref={mapRef}
        className="w-full h-72 rounded-2xl border border-white/10 z-0 overflow-hidden"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="都市名・国名で検索..."
        className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/50 border-none"
      />

      <div className="max-h-36 overflow-y-auto glass rounded-xl">
        {filteredDestinations.map((dest) => (
          <button
            key={dest.name}
            type="button"
            onClick={() => handleListSelect(dest)}
            className={`w-full text-left px-4 py-2.5 text-sm border-b border-white/5 last:border-b-0 transition ${
              selected === dest.name
                ? "bg-purple-500/20 text-purple-300 font-medium"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {dest.name}
            <span className="text-white/20 ml-1 text-xs">({dest.country})</span>
          </button>
        ))}
        {filteredDestinations.length === 0 && (
          <p className="text-sm text-white/30 p-3">
            見つかりません。テキスト欄に直接入力してください。
          </p>
        )}
      </div>
    </div>
  );
}
