import React, { useState } from "react";
import { PhotographerProfile, ClientCRM } from "../types";

interface DashboardViewProps {
  clients: ClientCRM[];
  packagesCount: number;
  profile: PhotographerProfile;
  createdPostsCount: number;
  highScorePostsCount: number;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({
  clients,
  packagesCount,
  profile,
  createdPostsCount,
  highScorePostsCount,
  setActiveTab,
}: DashboardViewProps) {
  const [loadingTip, setLoadingTip] = useState(false);
  const [aiTip, setAiTip] = useState<string>(() => {
    return `วันนี้เหมาะอย่างยิ่งสำหรับการโพสต์งานแนว "Before / After" โชว์ผลงานสไตล์ ${profile.style || "ธรรมชาติเกาหลี"} ของคุณ เพื่อกระตุ้นยอดไลก์และสร้างภาพลักษณ์แบรนด์ที่อบอุ่นและเป็นมิตร แนะนำให้โพสต์ในช่วง 19:30 - 21:00 น. เพราะเป็นเวลาที่กลุ่มเป้าหมายส่วนใหญ่กำลังพักผ่อนไถมือถือ`;
  });

  const getAITip = async () => {
    setLoadingTip(true);
    try {
      const response = await fetch("/api/analyze-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType: profile.jobTypes[0] || "ถ่ายภาพพอร์ตเทรต",
          area: profile.serviceArea,
          startingPrice: profile.startingPrice,
          strengths: profile.strengths,
          style: profile.style,
          desiredClients: "คนทั่วไปและคู่บ่าวสาว",
        }),
      });
      const data = await response.json();
      if (data.engagementTriggers && data.engagementTriggers.length > 0) {
        setAiTip(`[คำแนะนำ AI ด่วนสำหรับวันนี้] จากประเภทงานหลัก "${profile.jobTypes[0] || "ถ่ายภาพ"}" ในพื้นที่ "${profile.serviceArea || "ทั่วไป"}" ของคุณ:\n\n🔥 แนะนำวิธีกระตุ้นการมีส่วนร่วม: ${data.engagementTriggers[0]}\n\n✨ ช่องทางที่ควรลงคอนเทนต์หลัก: ${data.channels[0]}\n\n🎨 แนวคอนเทนต์สร้างยอดทักแชต: ${data.contentStyles[0]}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTip(false);
    }
  };

  const closeSaleCount = clients.filter(
    (c) => c.status === "ส่งราคาแล้ว" || c.status === "รอคอนเฟิร์ม"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>📊</span> ภาพรวมแผงควบคุมหลัก (Dashboard)
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          วิเคราะห์สถิติจำนวนโพสต์ ข้อมูลลูกค้า และรับแผนกลยุทธ์จากปัญญาประดิษฐ์รายวัน
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">โพสต์ที่สร้างแล้ว</span>
            <span className="text-blue-400 text-lg group-hover:scale-110 transition-transform">✍️</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white font-mono">{createdPostsCount || 12}</p>
            <p className="text-[10px] text-emerald-400 mt-1 font-medium">📋 พร้อมให้คัดลอกใช้งาน</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">ลูกค้าในระบบ CRM</span>
            <span className="text-purple-400 text-lg group-hover:scale-110 transition-transform">👥</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white font-mono">{clients.length}</p>
            <p className="text-[10px] text-blue-400 mt-1 font-medium">👥 อัปเดตล่าสุดเรียบร้อย</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">โพสต์ที่ได้คะแนนสูง</span>
            <span className="text-amber-400 text-lg group-hover:scale-110 transition-transform">⭐</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white font-mono">{highScorePostsCount || 4}</p>
            <p className="text-[10px] text-amber-300 mt-1 font-medium">✨ คะแนน 85+ (AI Optimized)</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">ใกล้ปิดการขาย</span>
            <span className="text-emerald-400 text-lg group-hover:scale-110 transition-transform">🤝</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-white font-mono">{closeSaleCount}</p>
            <p className="text-[10px] text-emerald-300 mt-1 font-medium">💰 สถานะ: ส่งราคา / รอคอนเฟิร์ม</p>
          </div>
        </div>
      </div>

      {/* Middle Row: AI Guide & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Today Tip */}
        <div className="lg:col-span-2 glass p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-12 -top-12 text-gray-700/10 font-bold text-8xl pointer-events-none font-mono">
            GUIDE
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <h3 className="text-md font-semibold text-blue-300 flex items-center gap-2">
                <span>✨</span> คำแนะนำกลยุทธ์จาก AI ประจำวันนี้
              </h3>
              <button
                onClick={getAITip}
                disabled={loadingTip}
                className="text-[11px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loadingTip ? "🤖 กำลังวิเคราะห์..." : "🔄 วิเคราะห์เจาะลึก"}
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative">
              <p className="text-sm md:text-base leading-relaxed text-slate-200 whitespace-pre-wrap">
                {aiTip}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("generator")}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs md:text-sm text-white font-medium rounded-lg accent-glow transition-all cursor-pointer"
            >
              📝 สร้างโพสต์หาลูกค้าด้วย AI ทันที
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs md:text-sm text-gray-200 rounded-lg border border-white/10 transition-all cursor-pointer"
            >
              🎯 วิเคราะห์ตลาดเป้าหมายกลุ่มอื่น
            </button>
          </div>
        </div>

        {/* Quick Actions & Shortcut */}
        <div className="glass p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-white mb-4 border-b border-white/5 pb-3">
              🚀 ทางลัดด่วน (Quick Actions)
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab("crm")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  <div>
                    <p className="text-xs font-semibold text-white">เพิ่มบันทึกลูกค้าใหม่</p>
                    <p className="text-[10px] text-gray-400">เก็บรายชื่อช่องทางแชตและงบประมาณ</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">→</span>
              </button>

              <button
                onClick={() => setActiveTab("package")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="text-xs font-semibold text-white">ตั้งแพ็กเกจถ่ายภาพ</p>
                    <p className="text-[10px] text-gray-400">สร้างรายละเอียดให้น่าซื้อ + โพสต์โปรโมต</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">→</span>
              </button>

              <button
                onClick={() => setActiveTab("captions")}
                className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📸</span>
                  <div>
                    <p className="text-xs font-semibold text-white">เขียนแคปชั่นอัลบั้มผลงาน</p>
                    <p className="text-[10px] text-gray-400">โปรโมตพอร์ตและขอรีวิวอัตโนมัติ</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs">→</span>
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-lg text-center text-[11px] text-slate-400">
            💡 <span className="font-semibold text-slate-300">ความรู้คู่ช่างภาพ:</span> การปิดคิวว่างที่ดีที่สุดคือการให้ความสำคัญกับสตอรี่เบื้องหลังความสุขในวันสำคัญ
          </div>
        </div>
      </div>

      {/* Bottom CRM Snapshot */}
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <span>🤝</span> รายชื่อลูกค้ายอดใกล้ปิดการขาย (CRM Quick View)
          </h3>
          <button
            onClick={() => setActiveTab("crm")}
            className="text-[11px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 text-gray-300 transition cursor-pointer"
          >
            จัดการระบบลูกค้า CRM ทั้งหมด
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-white/5 text-[10px] uppercase tracking-wider">
                <th className="pb-3 px-2">ชื่อลูกค้า</th>
                <th className="pb-3">ประเภทงาน</th>
                <th className="pb-3">งบประมาณ</th>
                <th className="pb-3">สถานที่นัดถ่าย</th>
                <th className="pb-3">สถานะปิดดีล</th>
                <th className="pb-3 text-right">เครื่องมือ AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500 italic">
                    ไม่มีลูกค้าที่อยู่ระหว่างเจรจา มารีบโพสต์ขายเพื่อดึงทราฟฟิกคนเข้าแชตกันเลย!
                  </td>
                </tr>
              ) : (
                clients.slice(0, 3).map((client) => {
                  let statusBg = "bg-blue-500/10 text-blue-400";
                  if (client.status === "ปิดการขายแล้ว") {
                    statusBg = "bg-emerald-500/10 text-emerald-400";
                  } else if (client.status === "ส่งราคาแล้ว") {
                    statusBg = "bg-amber-500/10 text-amber-400";
                  } else if (client.status === "รอคอนเฟิร์ม") {
                    statusBg = "bg-purple-500/10 text-purple-400";
                  } else if (client.status === "หลุด") {
                    statusBg = "bg-rose-500/10 text-rose-400";
                  }

                  return (
                    <tr key={client.id} className="hover:bg-white/2">
                      <td className="py-3 px-2 font-medium text-white">{client.name}</td>
                      <td className="py-3 text-slate-300">{client.jobType}</td>
                      <td className="py-3 font-semibold text-blue-400 font-mono">฿{client.budget}.-</td>
                      <td className="py-3 text-gray-400 max-w-[150px] truncate">{client.location || "-"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBg}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setActiveTab("chat")}
                          className="text-[10px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded cursor-pointer transition"
                        >
                          💬 ตอบแชตอัจฉริยะ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
