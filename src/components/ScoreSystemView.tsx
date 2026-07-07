import React, { useState } from "react";
import { PhotographerProfile, PostScore } from "../types";

interface ScoreSystemViewProps {
  profile: PhotographerProfile;
  onHighScoreEvaluated: () => void;
}

export default function ScoreSystemView({ profile, onHighScoreEvaluated }: ScoreSystemViewProps) {
  const [postContent, setPostContent] = useState("");
  const [jobType, setJobType] = useState(profile.jobTypes[0] || "รับปริญญา");
  const [targetStyle, setTargetStyle] = useState(profile.style || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<PostScore | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/score-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent,
          jobType,
          targetStyle,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถประเมินและประมวลเกรดโพสต์จาก AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.score !== undefined) {
        setScoreResult(data);
        setError(null);
        if (data.score >= 85) {
          onHighScoreEvaluated(); // Increment parent stat
        }
      } else {
        throw new Error("ข้อมูลประเมินเกรดที่ส่งกลับมาจาก AI ไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบความถูกต้องของอินเทอร์เน็ต");
    } finally {
      setLoading(false);
    }
  };

  const copyUpgraded = () => {
    if (!scoreResult) return;
    navigator.clipboard.writeText(scoreResult.upgradedVersion);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Helper function to render progress bar with color
  const renderBar = (val: number) => {
    let color = "bg-rose-500";
    if (val >= 85) color = "bg-emerald-500";
    else if (val >= 70) color = "bg-blue-500";
    else if (val >= 50) color = "bg-amber-500";

    return (
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${val}%` }}></div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>⭐</span> ระบบประเมินและให้คะแนนโพสต์ (AI Post Grading System)
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          วางเนื้อหาโพสต์ที่คุณเขียนไว้ เพื่อให้ AI ตรวจสอบคะแนนความน่าจ้างงาน และรับเวอร์ชันปรับปรุงระดับขายดีถล่มทลายทันที
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Input */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleScore} className="glass p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              📝 วางเนื้อหาโพสต์ที่ต้องการประเมิน
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">ประเภทงานที่โพสต์</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full text-xs p-2.5 glass-input"
                >
                  {profile.jobTypes.map((t) => (
                    <option key={t} value={t} className="bg-[#050506]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">สไตล์โทนภาพที่พรีเซนต์</label>
                <input
                  type="text"
                  value={targetStyle}
                  onChange={(e) => setTargetStyle(e.target.value)}
                  placeholder="เช่น มินิมอล, คลาสสิก"
                  className="w-full text-xs p-2.5 glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">เนื้อความโพสต์ (พอร์ตหรือโปรโมชัน)</label>
              <textarea
                rows={10}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="พิมพ์หรือกดวางแคปชั่นที่คุณเขียนเองลงที่นี่เพื่อปรับปรุงระดับพลัง..."
                className="w-full text-xs p-2.5 glass-input font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !postContent.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "🤖 กำลังคำนวณและเกรดวิเคราะห์..." : "⭐ เริ่มประเมินโพสต์ด้วย AI"}
            </button>
          </form>
        </div>

        {/* Right Column Results */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {/* Score card skeleton */}
              <div className="glass p-5 flex flex-col md:flex-row items-center gap-6 border-l-4 border-amber-500 bg-white/2 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-white/10 shrink-0"></div>
                <div className="flex-1 w-full space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-5/6"></div>
                </div>
              </div>
              {/* Details skeleton */}
              <div className="glass p-5 bg-white/1 rounded-xl">
                <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-2.5 bg-white/5 rounded w-full"></div>
                  <div className="h-2.5 bg-white/5 rounded w-11/12"></div>
                  <div className="h-2.5 bg-white/5 rounded w-10/12"></div>
                </div>
              </div>
            </div>
          ) : scoreResult ? (
            <div className="space-y-4">
              {/* Score card */}
              <div className="glass p-5 flex flex-col md:flex-row items-center gap-6 border-l-4 border-amber-500">
                {/* Score circle */}
                <div className="w-24 h-24 rounded-full bg-black/40 border-4 border-amber-500 flex flex-col items-center justify-center accent-glow shrink-0">
                  <span className="text-3xl font-extrabold text-amber-400 font-mono">{scoreResult.score}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">เต็ม 100</span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <h4 className="text-md font-bold text-white flex items-center gap-1.5">
                    🚀 ผลการประเมินประสิทธิภาพการจ้างงาน
                  </h4>
                  <p className="text-xs text-gray-300">
                    โพสต์ของคุณจัดอยู่ในเกณฑ์ที่ดี แต่ยังมีจุดกระตุ้น CTA และการเล่าเรื่องบางจุดที่ AI แนะนำให้ปรับปรุงเพื่อให้คนตัดสินใจทักอินบ็อกซ์ได้เร็วกว่าเดิม 1.5 เท่า!
                  </p>
                </div>
              </div>

              {/* Sub-criteria breakdowns */}
              <div className="glass p-5">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                  📊 รายละเอียดคะแนนเฉพาะด้าน (0-100)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: "🧲 ประโยคหยุดนิ้วแรก (Hook)", val: scoreResult.criteria.hook },
                    { label: "🎯 ตรงใจกลุ่มเป้าหมาย (Relevance)", val: scoreResult.criteria.targetRelevance },
                    { label: "💰 นำเสนอสิทธิพิเศษ (Sellability)", val: scoreResult.criteria.sellability },
                    { label: "🤝 ความน่าเชื่อถือ/พอร์ต (Credibility)", val: scoreResult.criteria.credibility },
                    { label: "📩 สัญญาณ CTA ชัดเจน (CTA)", val: scoreResult.criteria.ctaClarity },
                    { label: "💬 ดึงคนคอมเมนต์ (Engagement)", val: scoreResult.criteria.commentOpportunity },
                    { label: "👤 เสน่ห์เฟสบุ๊กส่วนตัว (Personal FB)", val: scoreResult.criteria.personalFbSuitability },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="font-bold text-gray-200 font-mono">{item.val}/100</span>
                      </div>
                      {renderBar(item.val)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 border-l-4 border-emerald-500">
                  <h5 className="text-xs font-bold text-emerald-300 mb-2">⭐ จุดเด่นโดนใจ (Strengths)</h5>
                  <ul className="space-y-1.5">
                    {scoreResult.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-gray-300 leading-snug">
                        ✨ {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass p-4 border-l-4 border-rose-500">
                  <h5 className="text-xs font-bold text-rose-300 mb-2">💡 จุดปรับปรุงเพิ่มด่วน (Improvements)</h5>
                  <ul className="space-y-1.5">
                    {scoreResult.improvements.map((imp, i) => (
                      <li key={i} className="text-xs text-gray-300 leading-snug">
                        🔧 {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tips for closing sales */}
              <div className="glass p-4 bg-blue-500/5 border border-blue-500/15">
                <h5 className="text-xs font-bold text-blue-300 mb-2">🔑 เคล็ดลับการปิดการขายเพิ่มเติม:</h5>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scoreResult.ctaTips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-gray-300 bg-black/20 p-2 rounded">
                      📌 {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgraded version written by AI */}
              <div className="glass p-5 border-t-2 border-indigo-500">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-1">
                    <span>👑</span> แคปชั่นเกรดพรีเมียมตัวอัปเกรด (Upgraded Version)
                  </h4>
                  <button
                    onClick={copyUpgraded}
                    className="text-xs bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 px-3 py-1 rounded transition cursor-pointer"
                  >
                    {copyFeedback ? "คัดลอกสำเร็จ! ✅" : "📋 คัดลอกเวอร์ชันนี้"}
                  </button>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-lg max-h-[300px] overflow-y-auto">
                  <p className="text-xs md:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {scoreResult.upgradedVersion}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] glass flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <span className="text-4xl mb-2">🤖</span>
              <p className="text-sm font-medium">ไม่มีรายงานวิเคราะห์ระดับโพสต์ขณะนี้</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                วางข้อความแคปชั่นที่คุณแต่งไว้ในกล่องด้านซ้าย แล้วกดปุ่มประเมินเพื่อวิเคราะห์คะแนนจากมุมมองการขายของ AI ทันที
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
