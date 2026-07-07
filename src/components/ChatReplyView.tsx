import React, { useState, useEffect } from "react";
import { ClientCRM, ChatReplies, PhotographerProfile } from "../types";

interface ChatReplyViewProps {
  selectedClient: ClientCRM | null;
  profile: PhotographerProfile;
}

const OBJECTION_TYPES = [
  { id: "expensive", label: "💸 'แพงเกินไป ขอลดราคาอีกได้ไหม?'" },
  { id: "raw_files", label: "📸 'ขอไฟล์รูปดิบ (RAW) ทั้งหมดฟรีได้ไหม?'" },
  { id: "postpone", label: "📅 'ขอเลื่อนคิววันงานกะทันหันแบบไม่เสียค่าธรรมเนียม'" },
  { id: "no_posing", label: "🙈 'พี่โพสท่าไม่เก่งเลย เขินกล้อง กลัวรูปเสีย'" },
  { id: "other_photographers", label: "🆚 'ทำไมเจ้าอื่นเขาคิดถูกกว่านี้เยอะเลย?'" },
  { id: "weather", label: "🌧️ 'ฝนตกหนัก ขอยกเลิกงานและคืนมัดจำเต็มจำนวน'" }
];

export default function ChatReplyView({ selectedClient, profile }: ChatReplyViewProps) {
  const [clientName, setClientName] = useState("");
  const [jobType, setJobType] = useState(profile.jobTypes[0] || "รับปริญญา");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [specialRequirement, setSpecialRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof ChatReplies>("firstResponse");
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Objection state variables (Task 8)
  const [selectedObjection, setSelectedObjection] = useState("expensive");
  const [loadingObjection, setLoadingObjection] = useState(false);
  const [objectionResponse, setObjectionResponse] = useState<{
    empathyAndGreeting: string;
    boundaryExplanation: string;
    valueOffer: string;
    cta: string;
    fullReplyMessage: string;
  } | null>(null);
  const [copyObjectionFeedback, setCopyObjectionFeedback] = useState(false);

  const [replies, setReplies] = useState<ChatReplies | null>(() => {
    return {
      firstResponse: `สวัสดีครับคุณลูกค้า ยินดีต้อนรับครับน้า 📸✨\n\nขอบคุณมากๆ เลยนะครับที่สนใจสไตล์ภาพของเพจเรา ผมยินดีให้คำแนะนำรายละเอียดมากๆ คราบบบ สำหรับคิวงานถ่ายภาพเดี่ยวหรือกลุ่มที่อยากได้สไตล์ธรรมชาติคุมโทนพาสเทล สามารถแจ้งกำหนดการคร่าวๆ ได้เลยนะคร้าบ ยินดีให้บริการมากๆ คราบบบ ❤️`,
      sendPackage: `สำหรับเรทแพ็กเกจราคาพรีเมียมคราบบบ 💼📸\n\nเสนอราคาคุ้มฝีมือ เพียง 3,500.- บาทถ้วนครับน้า\n⏱️ เวลาถ่ายเต็มอิ่ม 4 ชั่วโมงจุใจ (ปรับโทนสีเกรดเกาหลีละมุนทั้งหมดไม่จำกัดรูป)\n🎁 รับฟรีรูปพรีวิวรวดเร็วทันใจภายใน 24 ชั่วโมงแรก!\n\nและเรามีคู่มือช่วยแนะแนวสอนจัดท่าเผลออย่างละเอียด ไม่ต้องกังวลเรื่องโพสท่าเกร็งเลยครับ ยืนยันพิกัดทางอินบ็อกซ์ได้ทันทีคราบบบ 🥰👇`,
      askDetails: `เพื่อความประณีตสูงสุดคราบบบคุณลูกค้า 😊📸\n\nอยากสอบถามสไตล์โทนภาพที่ชอบเป็นพิเศษ หรือมีฉากและแนวชุดเสื้อผ้าที่เล็งไว้บ้างหรือยังน้า? และแวะถามข้อกังวลลึกๆ เช่น กลัวตาหยีหรือถ่ายมุมไหนแล้วไม่มั่นใจ แจ้งผมได้เลยครับ ช่างภาพจะช่วยบิดและหามุมที่สวยเป๊ะที่สุดให้แน่นอนคราบบบ ✨`,
      closeSale: `สิทธิ์ล็อกโปรโมชันพิเศษด่วนที่สุดครับคุณลูกค้า! 🔥⏰\n\nคิวถ่ายสัปดาห์นี้ว่างเพียง "1 ที่สุดท้าย" เท่านั้นน้า หากจองมัดจำล็อกสิทธิ์วันนี้ แถมฟรีภาพเปรียบเทียบ Before & After แต่งสีพิเศษ 10 รูปทันทีครับน้า สนใจรับสิทธิ์พิมพ์คอนเฟิร์มได้เลยคราบบบ 📩`,
      followUp: `แวะมาทักทายส่งความคิดถึงครับคุณลูกค้า 😊📸\n\nโปรโมชันแถมรูปพิเศษเซ็ตแต่งสีใกล้จะหมดรอบจองโควตาแล้วน้า ช่างภาพเกรงว่าจะพลาดคิวพิเศษวันหยุดสัปดาห์นี้ไป ถ้าคุณลูกค้ายังสนใจรับคิวหรืออยากให้ปรับเปลี่ยนเวลาอย่างไร แชตคุยกับผมได้เสมอนะค้าบ ยินดีคุยเป็นกันเองมากๆ คราบบบ ❤️`,
      confirmBooking: `ยินดีต้อนรับสู่ทริปแสนสนุกครับน้า! 🎉📸\n\nช่องทางสำรองคิวและชำระเงินมัดจำล็อกตารางงาน:\n🏦 ธนาคารกสิกรไทย (KBANK)\n💳 เลขบัญชี: 123-4-56789-0\n👤 ชื่อบัญชี: นายธนพล ช่างภาพมืออาชีพ\n\n*ยอดโอนจองเพียง 1,000.- บาทเพื่อยืนยันคิวครับ โอนแล้วแชร์หลักฐานใบสลิปแจ้งช่างภาพได้ทันที ยินดีให้บริการอย่างสุดฝีมือเลยครับผม! 🙏💖`,
      requestReview: `ยินดีและขอบพระคุณมากๆ สำหรับทริปถ่ายภาพแสนสนุกน้าค้าบคุณลูกค้า 🥰\n\nตอนนี้ผมส่งมอบผลงานแต่งสีกว่า 150 รูปเสร็จสมบูรณ์เรียบร้อยแล้วน้า! หากชื่นชอบผลงานและการบริการของเพจเรา รบกวนเวลาสักครึ่งนาทีกดรีวิวติชมหน้าเพจเพื่อเป็นกำลังใจเล็กๆ ให้ทีมงานช่างภาพด้วยนะคร้าบบบ ขอบคุณมากๆ เลยครับน้า! ❤️✨`
    };
  });

  // Automatically populate when selectedClient is provided
  useEffect(() => {
    if (selectedClient) {
      setClientName(selectedClient.name);
      setJobType(selectedClient.jobType);
      setBudget(selectedClient.budget);
      setLocation(selectedClient.location || "");
      setSpecialRequirement(selectedClient.notes || "");
      
      // Smart tab routing based on client current status
      if (selectedClient.status === "ทักใหม่") setActiveTab("firstResponse");
      else if (selectedClient.status === "ส่งราคาแล้ว") setActiveTab("sendPackage");
      else if (selectedClient.status === "รอคอนเฟิร์ม") setActiveTab("closeSale");
      else if (selectedClient.status === "นัดถ่ายแล้ว") setActiveTab("confirmBooking");
      else if (selectedClient.status === "ปิดการขายแล้ว") setActiveTab("requestReview");
      else if (selectedClient.status === "หลุด") setActiveTab("followUp");
    }
  }, [selectedClient]);

  const handleGenerateReplies = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-chat-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          channel: selectedClient?.channel || "Page Inbox",
          jobType: jobType,
          budget: budget,
          date: selectedClient?.date || "",
          location: location,
          notes: specialRequirement,
          status: selectedClient?.status || "ทักใหม่",
          photographerProfile: profile,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถสร้างคำตอบแชตจาก AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.firstResponse) {
        setReplies(data);
        setError(null);
      } else {
        throw new Error("ข้อมูลคำตอบแชตที่ส่งกลับไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ");
    } finally {
      setLoading(false);
    }
  };

  // Call the objection solver endpoint (Task 8)
  const handleSolveObjection = async () => {
    setLoadingObjection(true);
    setError(null);
    try {
      const res = await fetch("/api/handle-objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectionType: selectedObjection,
          clientName: clientName || "ลูกค้า",
          jobType: jobType,
          price: budget || "เรทแพ็กเกจ",
          photographerProfile: profile
        })
      });

      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถแก้ข้อโต้แย้งลูกค้าผ่าน AI ได้ในขณะนี้");
      }

      const data = await res.json();
      setObjectionResponse(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ไม่สามารถเชื่อมต่อ AI แก้ข้อโต้แย้งลูกค้าได้");
    } finally {
      setLoadingObjection(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const copyObjectionText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyObjectionFeedback(true);
    setTimeout(() => setCopyObjectionFeedback(false), 2000);
  };

  const activeContent = () => {
    if (!replies) return "";
    return replies[activeTab] || "";
  };

  const tabLabels: Record<keyof ChatReplies, { label: string; icon: string; status: string }> = {
    firstResponse: { label: "1. ตอบแชตแรกทักทาย", icon: "👋", status: "ลูกค้าใหม่" },
    sendPackage: { label: "2. เสนอแพ็กเกจราคา", icon: "💼", status: "คุยรายละเอียด" },
    askDetails: { label: "3. ซักถามสไตล์/แก้กังวล", icon: "🔮", status: "คุยรายละเอียด" },
    closeSale: { label: "4. จู่โจมเร่งปิดการขาย", icon: "🔥", status: "รอคอนเฟิร์ม" },
    followUp: { label: "5. ทักตามคำตอบเมื่อเงียบ", icon: "🕰️", status: "หลุด/เงียบ" },
    confirmBooking: { label: "6. คอนเฟิร์มเลขบัญชีมัดจำ", icon: "🏦", status: "จองแล้ว" },
    requestReview: { label: "7. ส่งมอบรูป & ขอรีวิว", icon: "⭐", status: "เสร็จงาน" },
  };

  return (
    <div className="space-y-6 animate-fade-in" id="chat_reply_view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>💬</span> ผู้ช่วยตอบแชตและเจรจาปิดการขาย (AI Chat Reply Assistant)
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          สร้างชุดคำพูดตอบแชตอัตโนมัติ 7 ขั้นตอน เจาะตามสไตล์ความต้องการและข้อกังวลลึกๆ ของลูกค้า เพื่อเพิ่มความมั่นใจในการวางมัดจำ
        </p>
      </div>

      {selectedClient && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 flex justify-between items-center" id="selected_client_banner">
          <span>
            📋 ดึงข้อมูลเจรจาล่าสุดของลูกค้าคุณ <strong className="text-white font-bold">{selectedClient.name}</strong> คัดลอกไปตอบได้เลย!
          </span>
          <button
            onClick={() => {
              setClientName("");
              setBudget("");
              setLocation("");
              setSpecialRequirement("");
            }}
            className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
          >
            ล้างตัวดึง
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form */}
        <form onSubmit={handleGenerateReplies} className="lg:col-span-4 glass p-5 space-y-4 self-start" id="form_chat_reply_parameters">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            ⚙️ พารามิเตอร์การตอบแชต
          </h3>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">ชื่อของคู่สนทนา / ลูกค้า</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="เช่น คุณเมย์ บ่าวสาว"
              className="w-full text-xs p-2.5 glass-input"
              required
              id="input_chat_client_name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ประเภทงานที่ทักถาม</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
                id="select_chat_job_type"
              >
                {profile.jobTypes.map((t) => (
                  <option key={t} value={t} className="bg-[#050506]">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">งบประมาณ / ราคาดีล</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="เช่น 18,900"
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_chat_budget"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">สถานที่นัดหมายหรือคลังโลเคชั่น</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ช็อกโกแลตวิลล์"
              className="w-full text-xs p-2.5 glass-input"
              id="input_chat_location"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">
              ความต้องการเสริม / ปัญหาความอายหน้ากล้อง (Pain Point)
            </label>
            <textarea
              rows={3}
              value={specialRequirement}
              onChange={(e) => setSpecialRequirement(e.target.value)}
              placeholder="เช่น ลูกค้าโพสท่าไม่ค่อยเก่ง เกร็งง่าย ขาสั้น อยากได้ภาพแนวละมุนมินิมอลธรรมชาติ"
              className="w-full text-xs p-2.5 glass-input"
              id="input_chat_painpoint"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
            id="btn_generate_chat_replies"
          >
            {loading ? "🤖 กำลังสร้างประโยคปิดดีล..." : "💬 เจนชุดตอบแชตด้วย AI"}
          </button>
        </form>

        {/* Reply Workflows Column */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4">
          {/* Vertical step list */}
          <div className="w-full md:w-60 flex flex-col gap-1 shrink-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-2 mb-1">
              ขั้นตอนแชต (1 - 7)
            </span>
            {Object.keys(tabLabels).map((key) => {
              const isActive = activeTab === key;
              const tab = tabLabels[key as keyof ChatReplies];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`text-left px-3 py-2.5 rounded-lg transition text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white accent-glow"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                  }`}
                  id={`btn_tab_${key}`}
                >
                  <span className="truncate">
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label.split(".")[1]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Large text display area with copy */}
          <div className="flex-1 glass p-5 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                  {tabLabels[activeTab].label}
                </span>
                <span className="text-[9px] bg-blue-500/10 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-500/15">
                  เหมาะกับสถานะ: {tabLabels[activeTab].status}
                </span>
              </div>

              <div className="p-4 bg-black/40 border border-white/5 rounded-lg">
                {loading ? (
                  <div className="space-y-3 animate-pulse py-2">
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                    <div className="h-3 bg-white/5 rounded w-11/12"></div>
                    <div className="h-3 bg-white/5 rounded w-4/5"></div>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {activeContent()}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[10px] text-gray-400 italic">
                *แก้ไของค์ประกอบบางส่วน หรือคัดลอกส่งต่อหาลูกค้าได้ในทันที
              </span>
              <button
                type="button"
                onClick={() => copyText(activeContent())}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg accent-glow transition cursor-pointer"
                id="btn_copy_chat_reply"
              >
                {copyFeedback ? "คัดลอกสำเร็จแล้ว! ✅" : "📋 คัดลอกประโยคตอบแชต"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Psychology Objection Shield (Task 8) */}
      <div className="glass p-6 border-t-4 border-rose-500 mt-8 space-y-5" id="objection_handling_section">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🧠</span> คลังแก้ข้อโต้แย้งยอดฮิตด้วยหลักจิตวิทยา (Sales Psychology Objection Handler)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            เมื่อลูกค้าอึกอักเรื่องราคา ขอลด แย่งขอไฟล์ RAW หรือเปลี่ยนตารางงานกะทันหัน อย่าเพิ่งตื่นตระหนก! เลือกประเภทข้อโต้แย้งเพื่อให้ AI วิเคราะห์เจรจาขอบเขตแบบประณีต ทะนุถนอมน้ำใจ แต่รักษาผลประโยชน์ของช่างภาพอย่างดีเยี่ยม
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8">
            <label className="block text-xs text-gray-300 font-medium mb-1.5">🛡️ เลือกข้อโต้แย้งหรือคำถามชวนอึดอัดของลูกค้า</label>
            <select
              value={selectedObjection}
              onChange={(e) => setSelectedObjection(e.target.value)}
              className="w-full text-xs p-2.5 glass-input"
              id="select_objection_type"
            >
              {OBJECTION_TYPES.map(obj => (
                <option key={obj.id} value={obj.id} className="bg-[#050506]">
                  {obj.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <button
              type="button"
              onClick={handleSolveObjection}
              disabled={loadingObjection}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
              id="btn_solve_objection"
            >
              {loadingObjection ? "🤖 กำลังปรุงสูตรจิตวิทยา..." : "🧠 แก้ข้อโต้แย้งด้วย AI"}
            </button>
          </div>
        </div>

        {loadingObjection && (
          <div className="space-y-3 animate-pulse p-4 bg-black/30 border border-white/5 rounded-lg">
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
            <div className="h-3 bg-white/5 rounded w-full"></div>
            <div className="h-3 bg-white/5 rounded w-11/12"></div>
          </div>
        )}

        {objectionResponse && !loadingObjection && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" id="objection_result_panel">
            {/* Theoretical breakdown */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="p-4 bg-rose-950/10 border border-rose-900/30 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <span>🤝</span> 1. เริ่มต้นด้วยความเข้าอกเข้าใจ (Empathy Frame)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{objectionResponse.empathyAndGreeting}&rdquo;
                </p>
              </div>

              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <span>🚧</span> 2. กำหนดขอบเขตอาชีพ (Professional Boundary)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {objectionResponse.boundaryExplanation}
                </p>
              </div>

              <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span>🎁</span> 3. ยื่นข้อเสนอทางเลือกปลอบใจ (Value-Add Alternative)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {objectionResponse.valueOffer}
                </p>
              </div>
            </div>

            {/* Ready to send chat reply block */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-black/50 border border-slate-800 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    💬 ข้อความพิมพ์ตอบลูกค้าเต็มรูปแบบ (Full Reply Message)
                  </h4>
                  <span className="text-[10px] bg-rose-500/10 text-rose-300 font-semibold px-2 py-0.5 rounded">
                    สูตรปิดขัดแย้ง
                  </span>
                </div>
                
                <div className="p-4 bg-black/40 border border-white/5 rounded-lg max-h-[220px] overflow-y-auto">
                  <p className="text-xs md:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-mono">
                    {objectionResponse.fullReplyMessage}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[10px] text-gray-500 italic">
                  {objectionResponse.cta}
                </span>
                <button
                  type="button"
                  onClick={() => copyObjectionText(objectionResponse.fullReplyMessage)}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  id="btn_copy_objection_message"
                >
                  {copyObjectionFeedback ? "คัดลอกเรียบร้อย! ✅" : "📋 คัดลอกประโยคแก้ลำ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
