import React, { useState } from "react";
import { PhotographerProfile, TargetAnalysis } from "../types";

interface TargetAnalyzerViewProps {
  profile: PhotographerProfile;
}

interface AudiencePersona {
  name: string;
  demographics: string;
  deepDesire: string;
  mainObjection: string;
  triggerWords: string;
  upsellScript: string;
}

interface RepurposedOutput {
  repurposedContent: string;
  hookStrategy: string;
  formattingTips: string;
}

export default function TargetAnalyzerView({ profile }: TargetAnalyzerViewProps) {
  // Navigation for interior tabs
  const [activeTab, setActiveTab] = useState<"analyzer" | "personas" | "repurpose">("analyzer");

  // State for Market Analyzer
  const [jobType, setJobType] = useState(profile.jobTypes[0] || "รับปริญญา");
  const [area, setArea] = useState(profile.serviceArea || "");
  const [startingPrice, setStartingPrice] = useState(profile.startingPrice || "");
  const [strengths, setStrengths] = useState(profile.strengths || "");
  const [style, setStyle] = useState(profile.style || "");
  const [desiredClients, setDesiredClients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TargetAnalysis | null>(() => {
    return {
      targetGroups: [
        `กลุ่มวัยรุ่น/บัณฑิตจบใหม่ ที่ชื่นชอบโทนภาพ ${style || "พาสเทลละมุน"}`,
        `กลุ่มครอบครัวหรือกลุ่มเพื่อนสนิทที่ต้องการบันทึกความรู้สึกอันคุ้มค่า`,
        `คู่รักวัยทำงานที่อยากมีพอร์ตภาพแฟชั่นสไตล์เกาหลีมินิมอล`,
      ],
      painPoints: [
        "กลัวเกร็งเวลาโพสท่า ไม่อยากหน้าบึ้งหรือยิ้มแห้ง",
        "กลัวได้งานช้าหลังถ่ายเสร็จจนลืมความประทับใจไปหมด",
        "กลัวช่างภาพดุ อารมณ์ฉุนเฉียว ไม่รับฟังแนวสไตล์ที่ผู้ใช้ต้องการ",
      ],
      wordsToUse: [
        `"ชิวๆ สบายๆ ไกด์จัดโพสท่าละเอียด"`,
        `"ภาพคุมโทน ${style || "ฟิล์มเกาหลี"} ละมุน ดึงตัวตนได้สูงสุด"`,
        `"พร้อมส่งงานไวภายใน 3 วันทันใช้ลงไอจี"`,
      ],
      wordsToAvoid: [
        `"มัดจำแล้วยึดทันทีไม่คืนทุกกรณี"`,
        `"ต้องจองด่วนเท่านั้นราคานี้ไม่มีจัดโปรแล้ว"`,
        `"เพิ่มไฟ/เพิ่มอุปกรณ์ต้องบวกเงินหน้างาน"`,
      ],
      channels: [
        `กลุ่ม Facebook ในพิกัด ${area || "กรุงเทพและจังหวัดใกล้เคียง"}: ลงภาพสไลด์บีฟอร์อาฟเตอร์ดึงดูดผู้จ้าง`,
        "TikTok/Reels: ทำวิดีโอ 15 วินาทีสอนจัดท่าเผลอๆ ของตัวแบบ",
        "Instagram Grid: คุมธีมภาพคู่รักโรแมนติกที่ดูลักชัวรีแต่มินิมอล",
      ],
      contentStyles: [
        "เบื้องหลังวิดีโอสั้นการกระทำความอบอุ่นแบบเป็นกันเอง",
        "อัลบั้มภาพคู่รักก่อนดึงสี/หลังดึงสีสไตล์ฟิล์มเกาหลี",
        "โพสต์แคปชั่นขอบคุณลูกค้ารายวันพร้อมสปอยล์รูปเด่น 1 ใบ",
      ],
      engagementTriggers: [
        "ถามคำถามปลายเปิด เช่น 'ชอบสไตล์คาเฟ่เก๋ๆ หรือธรรมชาติป่าเขามากกว่ากัน'",
        "ประกาศโควตาที่เหลือน้อย เช่น 'เหลือคิวว่างวันอาทิตย์นี้วันเดียวเท่านั้นน้า'",
        "มอบของสมนาคุณพิเศษ เช่น 'สิทธิพิเศษแถมฟรีกรอบรูปพลาสติก 5 ท่านแรก'",
      ],
    };
  });

  // State for Personas Generator (Task 5)
  const [personas, setPersonas] = useState<AudiencePersona[] | null>(null);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [errorPersonas, setErrorPersonas] = useState<string | null>(null);
  const [copyFeedbackPersonaIdx, setCopyFeedbackPersonaIdx] = useState<number | null>(null);

  // State for Content Repurposing (Task 6)
  const [originalPost, setOriginalPost] = useState("");
  const [targetChannel, setTargetChannel] = useState("Reels Video Script");
  const [repurposedResult, setRepurposedResult] = useState<RepurposedOutput | null>(null);
  const [loadingRepurpose, setLoadingRepurpose] = useState(false);
  const [errorRepurpose, setErrorRepurpose] = useState<string | null>(null);
  const [copyFeedbackRepurpose, setCopyFeedbackRepurpose] = useState<"pure" | "full" | null>(null);

  // Market Analyzer Action
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          area,
          startingPrice,
          strengths,
          style,
          desiredClients,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถวิเคราะห์ความสนใจและสเปกกลุ่มเป้าหมายจาก AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.targetGroups) {
        setAnalysis(data);
        setError(null);
      } else {
        throw new Error("ข้อมูลวิเคราะห์ที่ส่งกลับมาจาก AI ไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตของคุณ");
    } finally {
      setLoading(false);
    }
  };

  // Persona Generator Action (Task 5)
  const handleGeneratePersonas = async () => {
    setLoadingPersonas(true);
    setErrorPersonas(null);
    try {
      const res = await fetch("/api/generate-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          style,
          startingPrice,
          serviceArea: area,
          photographerProfile: profile,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถสกัดกลุ่มเป้าหมายอวาตารด้วย AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.personas && Array.isArray(data.personas)) {
        setPersonas(data.personas);
        setErrorPersonas(null);
      } else {
        throw new Error("ข้อมูลอวาตารกลุ่มเป้าหมายที่ส่งกลับมาไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setErrorPersonas(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setLoadingPersonas(false);
    }
  };

  // Content Repurpose Action (Task 6)
  const handleRepurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalPost.trim()) return;

    setLoadingRepurpose(true);
    setErrorRepurpose(null);
    try {
      const res = await fetch("/api/repurpose-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPost,
          targetChannel,
          photographerProfile: profile,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถแปรรูปโพสต์ด้วย AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.repurposedContent) {
        setRepurposedResult(data);
        setErrorRepurpose(null);
      } else {
        throw new Error("ข้อมูลแปรรูปที่ได้รับจาก AI ไม่สมบูรณ์");
      }
    } catch (err: any) {
      console.error(err);
      setErrorRepurpose(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoadingRepurpose(false);
    }
  };

  // Copy helpers
  const copyToClipboard = (text: string, key: string, type: "persona" | "repurpose") => {
    navigator.clipboard.writeText(text);
    if (type === "persona") {
      setCopyFeedbackPersonaIdx(Number(key));
      setTimeout(() => setCopyFeedbackPersonaIdx(null), 2000);
    } else {
      setCopyFeedbackRepurpose(key as any);
      setTimeout(() => setCopyFeedbackRepurpose(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="target-analyzer-container">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🎯</span> คลังปัญญาและข้อมูลกลุ่มเป้าหมาย (Audience Intelligence Hub)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            สกัดข้อมูลลูกค้า วิเคราะห์ความในใจ และแปลงคำโฆษณาของคุณให้โดนใจผู้ซื้อในทุกแพลตฟอร์มอย่างเป็นธรรมชาติ
          </p>
        </div>

        {/* Outer Tabs */}
        <div className="flex bg-white/5 p-1 rounded-lg self-start">
          {[
            { id: "analyzer", label: "วิเคราะห์ตลาด", icon: "📊" },
            { id: "personas", label: "อวาตารกลุ่มลูกค้า", icon: "👤" },
            { id: "repurpose", label: "แปรรูปคำโฆษณา", icon: "⚡" },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: Market Analysis */}
      {activeTab === "analyzer" && (
        <div className="space-y-6 animate-fade-in" id="market-analysis-view">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Inputs */}
            <form onSubmit={handleAnalyze} className="lg:col-span-4 glass p-5 space-y-4 self-start" id="market-analyzer-form">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                ข้อมูลตั้งต้นวิเคราะห์
              </h3>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">ประเภทงานที่ต้องการเจาะตลาด</label>
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
                  <option value="ถ่ายภาพเดี่ยวบุคคล" className="bg-[#050506]">ถ่ายภาพเดี่ยวบุคคล</option>
                  <option value="ถ่ายภาพครอบครัว" className="bg-[#050506]">ถ่ายภาพครอบครัว</option>
                  <option value="ถ่ายภาพโปรไฟล์นายแบบ/นางแบบ" className="bg-[#050506]">ถ่ายภาพโปรไฟล์</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">พื้นที่พิกัดบริการ</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="เช่น กรุงเทพฯ/โซนสยาม"
                  className="w-full text-xs p-2.5 glass-input"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">ราคาเริ่มต้น (บาท)</label>
                <input
                  type="text"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="เช่น 3,500"
                  className="w-full text-xs p-2.5 glass-input"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">จุดเด่นบริการ / สไตล์การคุย</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="เช่น คุยง่าย ตลก อารมณ์ดี มีความกระตือรือร้นจัดท่าทางส่งไฟล์รูปด่วนใน 24 ชั่วโมง"
                  className="w-full text-xs p-2.5 glass-input"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">สไตล์ภาพคุมโทน</label>
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="เช่น ฟิล์มเกาหลี โทนสว่างละมุน หรือดาร์กแนว Cinematic"
                  className="w-full text-xs p-2.5 glass-input"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">กลุ่มเป้าหมายเจาะจงเป็นพิเศษ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={desiredClients}
                  onChange={(e) => setDesiredClients(e.target.value)}
                  placeholder="เช่น นศ.จบใหม่ มธ., คู่รักรักหรูแต่งงาน"
                  className="w-full text-xs p-2.5 glass-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "🤖 กำลังประมวลผลด่วน..." : "🔮 วิเคราะห์กลุ่มเป้าหมายทันที"}
              </button>
            </form>

            {/* Analysis Result Displays */}
            <div className="lg:col-span-8 space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="glass p-5 bg-white/2 rounded-xl">
                      <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-2.5 bg-white/5 rounded w-full"></div>
                        <div className="h-2.5 bg-white/5 rounded w-11/12"></div>
                        <div className="h-2.5 bg-white/5 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : analysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Target Groups Card */}
                  <div className="glass p-5 border-l-4 border-blue-500" id="target-groups-card">
                    <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-1.5 mb-3">
                      <span>👥</span> กลุ่มลูกค้าหลักที่กำลังโหยหาคุณ
                    </h4>
                    <ul className="space-y-2">
                      {analysis.targetGroups.map((g, i) => (
                        <li key={i} className="text-xs text-gray-300 bg-white/2 p-2.5 rounded border border-white/5">
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pain Points Card */}
                  <div className="glass p-5 border-l-4 border-purple-500" id="pain-points-card">
                    <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-1.5 mb-3">
                      <span>💔</span> ปัญหาลึกๆ หรือเรื่องกังวล (Pain Points)
                    </h4>
                    <ul className="space-y-2">
                      {analysis.painPoints.map((p, i) => (
                        <li key={i} className="text-xs text-gray-300 bg-white/2 p-2.5 rounded border border-white/5">
                          😱 {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Words to Use Card */}
                  <div className="glass p-5 border-l-4 border-emerald-500" id="words-to-use-card">
                    <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5 mb-3">
                      <span>💚</span> คำทองคำที่ควรใช้สะกดความสนใจ (Words to Use)
                    </h4>
                    <ul className="space-y-2">
                      {analysis.wordsToUse.map((w, i) => (
                        <li key={i} className="text-xs text-emerald-300 font-medium bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                          ✅ {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Words to Avoid Card */}
                  <div className="glass p-5 border-l-4 border-rose-500" id="words-to-avoid-card">
                    <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5 mb-3">
                      <span>❌</span> คำต้องห้ามที่ควรเลี่ยงเพื่อไม่ให้ดูแพง/น่ากลัว
                    </h4>
                    <ul className="space-y-2">
                      {analysis.wordsToAvoid.map((w, i) => (
                        <li key={i} className="text-xs text-rose-400 bg-rose-500/5 p-2 rounded border border-rose-500/10">
                          ⛔ {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Channels & Media Card */}
                  <div className="glass p-5 md:col-span-2" id="marketing-channels-card">
                    <h4 className="text-sm font-semibold text-slate-200 mb-3 border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <span>📢</span> ช่องทางการตลาด & สไตล์โพสต์ทำคอนเทนต์ที่ดีที่สุด
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs text-blue-300 font-semibold mb-2">📍 แพลตฟอร์มหลัก & คอนเทนต์:</h5>
                        <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                          {analysis.channels.map((c, i) => (
                            <li key={i} className="bg-white/2 p-1.5 rounded">{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs text-indigo-300 font-semibold mb-2">⚡ แนวคอนเทนต์สร้างยอดทักแชต:</h5>
                        <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                          {analysis.contentStyles.map((s, i) => (
                            <li key={i} className="bg-white/2 p-1.5 rounded">{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 bg-blue-500/5 p-3 rounded border border-blue-500/10">
                      <h5 className="text-xs text-blue-400 font-semibold mb-1.5">💡 ทริกกระตุ้นให้เกิดยอดคอมเมนต์ & ทักแชตทันที:</h5>
                      <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {analysis.engagementTriggers.map((t, i) => (
                          <li key={i} className="text-[11px] text-gray-200 bg-black/30 p-2 rounded border border-white/5">
                            👉 {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 glass flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <span className="text-4xl mb-2">🔮</span>
                  <p className="text-sm font-medium">รอรับผลลัพธ์วิเคราะห์กลุ่มเป้าหมาย</p>
                  <p className="text-xs text-gray-500 mt-1">
                    กรอกข้อมูลทางเมนูด้านซ้ายและกดปุ่มวิเคราะห์ ระบบ AI จะวิเคราะห์อุปสงค์ของกลุ่มผู้ซื้อทันที
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Audience Persona Generator (Task 5) */}
      {activeTab === "personas" && (
        <div className="space-y-6 animate-fade-in" id="audience-personas-view">
          {errorPersonas && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
              <span>⚠️ {errorPersonas}</span>
              <button onClick={() => setErrorPersonas(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
            </div>
          )}

          {personas ? (
            <div className="space-y-6">
              {/* Reset Button */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">⚡ ค้นพบพฤติกรรมลูกค้าอุดมคติ 3 อวาตารสำหรับการตลาดเชิงรุก</span>
                <button
                  onClick={handleGeneratePersonas}
                  disabled={loadingPersonas}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-xs transition cursor-pointer"
                >
                  {loadingPersonas ? "🤖 กำลังประมวลผล..." : "🔄 สกัดและสร้างอวาตารใหม่"}
                </button>
              </div>

              {/* Grid of 3 Personas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {personas.map((pers, idx) => (
                  <div key={idx} className="glass p-5 border-t-4 border-blue-500 flex flex-col justify-between space-y-4" id={`persona-card-${idx}`}>
                    <div className="space-y-3">
                      {/* Persona Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg shrink-0">
                          {idx === 0 ? "🙋‍♀️" : idx === 1 ? "🤵‍♂️" : "🏪"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{pers.name}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">{pers.demographics}</span>
                        </div>
                      </div>

                      {/* Deep Desire */}
                      <div className="bg-white/2 p-2.5 rounded border border-white/5 text-[11px] leading-relaxed">
                        <span className="font-bold text-blue-300 block mb-0.5">🎯 ความชอบลึกๆ ในฝัน</span>
                        <p className="text-gray-300">{pers.deepDesire}</p>
                      </div>

                      {/* Main Objection */}
                      <div className="bg-rose-500/5 p-2.5 rounded border border-rose-500/10 text-[11px] leading-relaxed">
                        <span className="font-bold text-rose-300 block mb-0.5">💔 จุดกังวลหลัก (Objection)</span>
                        <p className="text-gray-300">{pers.mainObjection}</p>
                      </div>

                      {/* Trigger Words */}
                      <div className="bg-emerald-500/5 p-2.5 rounded border border-emerald-500/10 text-[11px] leading-relaxed">
                        <span className="font-bold text-emerald-300 block mb-0.5">⚡ คำกระตุ้นใจสะกดเงิน</span>
                        <p className="text-emerald-200 font-medium font-sans">{pers.triggerWords}</p>
                      </div>
                    </div>

                    {/* Closing Script */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-300">💬 สคริปต์พูดปิดแชตอัปเซลล์:</span>
                        <button
                          onClick={() => copyToClipboard(pers.upsellScript, String(idx), "persona")}
                          className="text-[9px] bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          {copyFeedbackPersonaIdx === idx ? "คัดลอกสำเร็จ! ✅" : "📋 คัดลอกสคริปต์"}
                        </button>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded text-[11px] text-slate-300 italic max-h-[140px] overflow-y-auto font-sans leading-relaxed">
                        {pers.upsellScript}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-12 space-y-4">
              <div className="text-5xl">👤</div>
              <div>
                <h3 className="text-md font-bold text-white">ยังไม่มีการสกัดอวาตารกลุ่มเป้าหมาย</h3>
                <p className="text-xs text-gray-400 mt-1">
                  ระบบอัจฉริยะจะสร้าง 3 โปรไฟล์จำลองลูกค้าที่มีโอกาสตกลงจองงานช่างภาพของคุณมากที่สุด พร้อมระบุความรู้สึกและสคริปต์ปิดแชตแบบเจาะจง
                </p>
              </div>
              <button
                onClick={handleGeneratePersonas}
                disabled={loadingPersonas}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer"
              >
                {loadingPersonas ? "🤖 AI กำลังคำนวณและดึงข้อมูล..." : "🔮 วิเคราะห์และสกัดกลุ่มลูกค้าอวาตาร (3 Personas)"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Content Repurposing Tool (Task 6) */}
      {activeTab === "repurpose" && (
        <div className="space-y-6 animate-fade-in" id="content-repurpose-view">
          {errorRepurpose && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
              <span>⚠️ {errorRepurpose}</span>
              <button onClick={() => setErrorRepurpose(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <form onSubmit={handleRepurpose} className="lg:col-span-5 glass p-5 space-y-4 self-start" id="repurpose-form">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                🔄 แปลงรูปแบบเนื้อหาหลายแพลตฟอร์ม (Content Repurpose)
              </h3>
              <p className="text-xs text-gray-400">
                วางแคปชั่นดั้งเดิมของคุณเพื่อแปลงเป็นสคริปต์ Reels สั้น, สตอรี่ไอจีดึงยอดทักแชต หรือโพสต์ฝากผลงานลงกลุ่ม Facebook ในคลิกเดียว
              </p>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">เลือกช่องทางเป้าหมายที่ต้องการส่งสาร</label>
                <select
                  value={targetChannel}
                  onChange={(e) => setTargetChannel(e.target.value)}
                  className="w-full text-xs p-2.5 glass-input"
                >
                  <option value="Reels Video Script (วีดีโอสั้น 15 วินาที)" className="bg-[#050506]">🎬 สคริปต์ Reels/TikTok สั้นกระตุ้นสายตา</option>
                  <option value="Instagram Story Visual Pitch (สตอรี่ดึงยอดทักแชต)" className="bg-[#050506]">📸 สตอรี่ไอจี/FB ดึงทักดีเอ็มทันใจ</option>
                  <option value="Facebook Group Showcase (โพสต์ลงกลุ่มช่างภาพ)" className="bg-[#050506]">🤝 โพสต์สุภาพฝากร้านในกลุ่มหาช่างภาพ</option>
                  <option value="Thread / Short Pitch (โพสต์สั้นกระตุกใจ)" className="bg-[#050506]">🧵 บทความสั้นสไตล์ Threads/Twitter ชวนคิด</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">วางข้อความแคปชั่นหรือไอเดียโพสต์หลัก</label>
                <textarea
                  rows={8}
                  value={originalPost}
                  onChange={(e) => setOriginalPost(e.target.value)}
                  placeholder="เช่น 'เพิ่งไปถ่ายงานรับปริญญามา สนุกมาก ลูกค้าชอบรูปสว่างๆ เกาหลีละมุน ใครสนใจทักจองราคา 3500'"
                  className="w-full text-xs p-2.5 glass-input font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingRepurpose || !originalPost.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingRepurpose ? "🤖 AI กำลังปรับแปรรูปเนื้อหา..." : "⚡ เริ่มแปลงรูปแบบโพสต์ด่วน"}
              </button>
            </form>

            {/* Output Display Column */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              {loadingRepurpose ? (
                <div className="space-y-4 animate-pulse flex-1">
                  <div className="glass p-5 bg-white/2 rounded-xl flex-1 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                    <div className="h-3 bg-white/5 rounded w-11/12"></div>
                    <div className="h-3 bg-white/5 rounded w-5/6"></div>
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                  </div>
                </div>
              ) : repurposedResult ? (
                <div className="space-y-4" id="repurposed-output-container">
                  {/* Converted Output Content */}
                  <div className="glass p-5 border-t-2 border-indigo-500">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-mono">
                        🔥 {targetChannel.toUpperCase()} OUTPUT MATCH
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(repurposedResult.repurposedContent, "pure", "repurpose")}
                          className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded transition cursor-pointer"
                        >
                          {copyFeedbackRepurpose === "pure" ? "คัดลอกแล้ว! ✅" : "📋 คัดลอกเฉพาะข้อความ"}
                        </button>
                        <button
                          onClick={() => {
                            const full = `${repurposedResult.repurposedContent}\n\n[สัญชาตญาณความสนใจ]: ${repurposedResult.hookStrategy}\n[คำแนะนำการแต่งรูป/เพลง]: ${repurposedResult.formattingTips}`;
                            copyToClipboard(full, "full", "repurpose");
                          }}
                          className="text-[10px] bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-2.5 py-1 rounded border border-indigo-500/20 transition cursor-pointer"
                        >
                          {copyFeedbackRepurpose === "full" ? "คัดลอกทั้งหมดแล้ว! ✅" : "🚀 คัดลอกทั้งหมดพร้อมคำแนะนำ"}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 border border-white/5 rounded-lg max-h-[320px] overflow-y-auto">
                      <p className="text-xs md:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
                        {repurposedResult.repurposedContent}
                      </p>
                    </div>
                  </div>

                  {/* Supporting strategies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hook Strategy */}
                    <div className="glass p-4 border-l-4 border-amber-500">
                      <h5 className="text-xs font-bold text-amber-300 mb-1.5">🧲 จิตวิทยาเปิดหัวประเด็น (Hook Strategy)</h5>
                      <p className="text-[11px] text-gray-300 leading-normal">{repurposedResult.hookStrategy}</p>
                    </div>

                    {/* Formatting tips */}
                    <div className="glass p-4 border-l-4 border-emerald-500">
                      <h5 className="text-xs font-bold text-emerald-300 mb-1.5">🎵 แนะนำเพลงประกอบ / คู่ภาพวิดีโอ</h5>
                      <p className="text-[11px] text-gray-300 leading-normal">{repurposedResult.formattingTips}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 glass flex flex-col items-center justify-center text-center p-6 text-gray-400 flex-1">
                  <span className="text-4xl mb-2">⚡</span>
                  <p className="text-sm font-medium">รอแปรรูปข้อความโฆษณาของคุณ</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    ใส่แคปชั่นหรือเรื่องเล่าเดิมในกล่องเมนูด้านซ้าย เลือกช่องทาง แล้วกดสกัดความต้องการ AI จะแปลงออกมาให้โดนพฤติกรรมลูกค้าช่องทางนั้นทันที
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
