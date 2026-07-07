import React, { useState } from "react";
import { CalendarDay, PhotographerProfile } from "../types";
import { DEFAULT_CALENDAR_DAYS } from "../data";

interface ContentCalendarViewProps {
  profile: PhotographerProfile;
}

export default function ContentCalendarView({ profile }: ContentCalendarViewProps) {
  const [days, setDays] = useState<CalendarDay[]>(() => {
    const saved = localStorage.getItem("photo_calendar");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CALENDAR_DAYS;
  });

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [postedStatus, setPostedStatus] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem("photo_calendar_posted");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const [copyFeedback, setCopyFeedback] = useState(false);
  const [editingDay, setEditingDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          area: profile.serviceArea,
          startingPrice: profile.startingPrice,
          strengths: profile.strengths,
          style: profile.style,
          jobTypes: profile.jobTypes,
        }),
      });
      if (!res.ok) {
        throw new Error("ระบบเซิร์ฟเวอร์ขัดข้อง ไม่สามารถตอบสนองการสร้างปฏิทินด้วย AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.calendar && data.calendar.length > 0) {
        saveDays(data.calendar);
        setSelectedDay(1);
      } else {
        throw new Error("ข้อมูลปฏิทินที่ส่งคืนจาก AI ไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตของคุณ");
    } finally {
      setLoading(false);
    }
  };

  const saveDays = (newDays: CalendarDay[]) => {
    setDays(newDays);
    localStorage.setItem("photo_calendar", JSON.stringify(newDays));
  };

  const togglePosted = (dayNum: number) => {
    const updated = { ...postedStatus, [dayNum]: !postedStatus[dayNum] };
    setPostedStatus(updated);
    localStorage.setItem("photo_calendar_posted", JSON.stringify(updated));
  };

  const handleEditChange = (field: keyof CalendarDay, val: string) => {
    if (!editingDay) return;
    setEditingDay({ ...editingDay, [field]: val });
  };

  const saveEdit = () => {
    if (!editingDay) return;
    const updated = days.map((d) => (d.day === editingDay.day ? editingDay : d));
    saveDays(updated);
    setEditingDay(null);
  };

  const copyCaption = (caption: string, cta: string) => {
    const text = `${caption}\n\n${cta}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const activeDay = days.find((d) => d.day === selectedDay) || days[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>📅</span> แผนการโพสต์ดึงลูกค้าใน 7 วัน (7-Day Post Calendar Planner)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            ตารางวางแผนเนื้อหาสำหรับหาคิวว่างสัปดาห์นี้ โดดเด่นด้วยเนื้อหาเล่าเรื่อง เบื้องหลัง และโชว์พอร์ตคละกันไม่จำเจ
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateCalendar}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs text-white font-bold rounded-lg accent-glow transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "🤖 กำลังคิดแผนโพสต์..." : "✨ สร้างด้วย AI ส่วนตัว"}
          </button>
          <button
            onClick={() => {
              if (window.confirm("ต้องการรีเซ็ตปฏิทิน 7 วันเป็นค่าตั้งต้นใช่หรือไม่?")) {
                saveDays(DEFAULT_CALENDAR_DAYS);
                setPostedStatus({});
                localStorage.removeItem("photo_calendar_posted");
                setError(null);
              }
            }}
            className="text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded transition cursor-pointer"
          >
            🔄 รีเซ็ตตารางตั้งต้น
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* 7-Days Quick Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={num} className="glass p-3 h-28 flex flex-col justify-between border-blue-500/10 bg-blue-500/2">
              <div className="w-12 h-3 bg-white/5 rounded"></div>
              <div className="w-full h-8 bg-white/10 rounded"></div>
              <div className="w-16 h-4 bg-white/5 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {days.map((day) => {
            const isSelected = selectedDay === day.day;
            const isPosted = postedStatus[day.day];

            let catColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
            if (day.category.includes("Before")) catColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
            else if (day.category.includes("โพส")) catColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            else if (day.category.includes("เล่า")) catColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
            else if (day.category.includes("คิว")) catColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
            else if (day.category.includes("โปร")) catColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";

            return (
              <div
                key={day.day}
                onClick={() => {
                  setSelectedDay(day.day);
                  setEditingDay(null);
                }}
                className={`glass p-3 relative flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 ${
                  isSelected ? "ring-2 ring-blue-500 border-transparent bg-blue-500/5" : "hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">{day.dayName}</span>
                  {isPosted && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded">
                      ✓ โพสต์แล้ว
                    </span>
                  )}
                </div>
                <p className="text-xs text-white font-semibold line-clamp-2 mb-2 leading-relaxed h-8">
                  {day.topic}
                </p>
                <span className={`text-[9px] font-semibold border px-1.5 py-0.5 rounded-full inline-block text-center truncate ${catColor}`}>
                  {day.category}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Day Detail Display */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-7 glass p-5 h-80 bg-white/1 rounded-xl"></div>
          <div className="lg:col-span-5 glass p-5 h-80 bg-white/1 rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Specific Day Parameters */}
          <div className="lg:col-span-7 glass p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="text-md font-bold text-white">
                    แนวโพสต์ {activeDay.dayName} (วันที่ {activeDay.day})
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">CATEGORY: {activeDay.category}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => togglePosted(activeDay.day)}
                  className={`text-[11px] px-3 py-1.5 rounded border transition cursor-pointer font-semibold ${
                    postedStatus[activeDay.day]
                      ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                      : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  {postedStatus[activeDay.day] ? "✓ ทำเครื่องหมายว่า โพสต์แล้ว" : "⚪ ทำเครื่องหมายว่า โพสต์แล้ว"}
                </button>
                {!editingDay && (
                  <button
                    onClick={() => setEditingDay({ ...activeDay })}
                    className="text-[11px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded transition cursor-pointer font-semibold"
                  >
                    ✏️ แก้ไขข้อมูล
                  </button>
                )}
              </div>
            </div>

            {/* Display / Editing Form */}
            {editingDay ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">หัวข้อหลักโพสต์</label>
                    <input
                      type="text"
                      value={editingDay.topic}
                      onChange={(e) => handleEditChange("topic", e.target.value)}
                      className="w-full text-xs p-2 glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">ช่องทางโพสต์แนะนำ</label>
                    <input
                      type="text"
                      value={editingDay.channel}
                      onChange={(e) => handleEditChange("channel", e.target.value)}
                      className="w-full text-xs p-2 glass-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">วัตถุประสงค์หลัก</label>
                    <input
                      type="text"
                      value={editingDay.purpose}
                      onChange={(e) => handleEditChange("purpose", e.target.value)}
                      className="w-full text-xs p-2 glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">หมวดหมู่แคปชั่น</label>
                    <input
                      type="text"
                      value={editingDay.category}
                      onChange={(e) => handleEditChange("category", e.target.value)}
                      className="w-full text-xs p-2 glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">คำโฆษณาหยุดแชท (Caption)</label>
                  <textarea
                    rows={4}
                    value={editingDay.caption}
                    onChange={(e) => handleEditChange("caption", e.target.value)}
                    className="w-full text-xs p-2 glass-input font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">คำเรียกร้องปิดคิว (CTA)</label>
                    <input
                      type="text"
                      value={editingDay.cta}
                      onChange={(e) => handleEditChange("cta", e.target.value)}
                      className="w-full text-xs p-2 glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">ภาพถ่ายแนะนำประกอบโพสต์</label>
                    <input
                      type="text"
                      value={editingDay.imageSuggestion}
                      onChange={(e) => handleEditChange("imageSuggestion", e.target.value)}
                      className="w-full text-xs p-2 glass-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setEditingDay(null)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded cursor-pointer"
                  >
                    💾 บันทึกแผนโพสต์
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white/2 rounded-lg border border-white/5 space-y-1">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">🎯 วัตถุประสงค์การโพสต์:</p>
                    <p className="text-xs text-gray-200 leading-relaxed font-semibold">{activeDay.purpose}</p>
                  </div>
                  <div className="p-3.5 bg-white/2 rounded-lg border border-white/5 space-y-1">
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">📢 ช่องทางโซเชียล:</p>
                    <p className="text-xs text-gray-200 leading-relaxed font-semibold">{activeDay.channel}</p>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">📝 แคปชั่นสำหรับคัดลอกโพสต์:</span>
                    <button
                      onClick={() => copyCaption(activeDay.caption, activeDay.cta)}
                      className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-1 rounded transition border border-blue-500/20 cursor-pointer"
                    >
                      {copyFeedback ? "คัดลอกแล้วสำเร็จ! ✅" : "📋 คัดลอกแคปชั่นครบชุด"}
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {activeDay.caption}
                  </p>
                  <p className="text-xs text-blue-400 font-semibold mt-3 whitespace-pre-wrap leading-normal bg-blue-500/5 p-2 rounded border border-blue-500/10">
                    🔗 {activeDay.cta}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-white/2 rounded text-[10px] text-gray-400 italic">
            *คุณสามารถย้อนกลับมาบันทึกแผนและติ๊กสถานะ 'โพสต์แล้ว' เพื่อประเมินวินัยของสัปดาห์นี้ได้เสมอ
          </div>
        </div>

        {/* Right Side: Creative Visual Suggestions */}
        <div className="lg:col-span-5 glass p-5 flex flex-col justify-between border-l-4 border-amber-500">
          <div>
            <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-1.5 pb-2 border-b border-white/5">
              <span>📸</span> แนวทางการจัดมุมภาพและวิดีโอแนะนำประกอบโพสต์
            </h4>
            <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/15 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">🎨</span>
                <div>
                  <p className="text-xs font-bold text-white mb-1">ไอเดียชุดภาพและวิดีโอประกอบ:</p>
                  <p className="text-xs text-gray-300 leading-normal font-medium">{activeDay.imageSuggestion}</p>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 space-y-2 pt-2 border-t border-white/5 leading-relaxed">
                <p>💡 <span className="font-bold text-gray-300">ทริกการจัดภาพประกอบ (Portfolio Setup):</span></p>
                <p>1. <span className="font-semibold text-slate-300">คุมสไตล์สีฟีด:</span> ตรวจสอบว่ารูปชุดที่จะลงพิกัดแสงใกล้เคียงกับภาพถ่ายโปรโมตสไตล์หลักของคุณ เพื่อสะท้อนถึงแบรนด์ช่างภาพระดับสูง</p>
                <p>2. <span className="font-semibold text-slate-300">ใส่เครดิตพริ้วๆ:</span> หากคุมหน้าเพจ ให้ใส่ชื่อไอดี LINE หรือ IG ขนาดเล็กมินิมอลไว้ที่มุมขวาล่าง ห้ามขยายจนบดบังอารมณ์ศิลปะในรูป</p>
                <p>3. <span className="font-semibold text-slate-300">สตอรี่แชร์ความสดใส:</span> โชว์เบื้องหลังกล้องหรือตอนแกล้งตลกๆ คู่กันเสมอเพื่อลดขีดความเกร็งของลูกค้ารายอื่น</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h5 className="text-xs font-bold text-blue-300 mb-1.5">🚀 อัปสเกลยอดจองคิว!</h5>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              การสลับลงคอนเทนต์ " Before / After " สลับกับ " เล่าสตอรี่ซาบซึ้งใจของคู่แต่งงาน " จะดึงดูดใจผู้ซื้อที่มีเงินจ่ายสูงได้ยอดเยี่ยมกว่าการจัดโปรลดราคาแบบพร่ำเพรื่อแน่นอน
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
