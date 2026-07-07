import React, { useState } from "react";
import { PhotographerProfile, CaptionGeneration } from "../types";

interface ReviewCaptionViewProps {
  profile: PhotographerProfile;
}

export default function ReviewCaptionView({ profile }: ReviewCaptionViewProps) {
  const [customerName, setCustomerName] = useState("");
  const [jobType, setJobType] = useState(profile.jobTypes[0] || "รับปริญญา");
  const [location, setLocation] = useState("");
  const [toneStyle, setToneStyle] = useState(profile.style || "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof CaptionGeneration>("reviewCaption");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [captions, setCaptions] = useState<CaptionGeneration | null>(() => {
    // Stunning initial fallback captions
    return {
      reviewCaption: `📸✨ “รอยยิ้มที่จริงใจที่สุด คือรอยยิ้มที่ไม่ต้องปรุงแต่ง...”\n\nวันนี้มีโอกาสไปเก็บภาพงาน รับปริญญา ให้กับคุณ ลูกค้าคนพิเศษ ในพิกัด คาเฟ่ริมน้ำ ขอบอกว่าเป็นคิวงานที่หัวเราะกันเกือบตลอดทริปเลยคร้าบ 😆 น้องบอกโพสท่าไม่เก่ง เกร็งง่าย แต่พอบอกสูตรให้เล่นตลกๆ ผลลัพธ์ที่ได้ออกมาคือธรรมชาติ อบอุ่น แฟลตแสงสีโทน ละมุนธรรมชาติ เกาหลีสุดจึ้งงง!\n\nขอบพระคุณคุณ ลูกค้า มากๆ เลยนะครับที่ให้ใจและเหนื่อยสู้กล้องไปด้วยกัน แวะชมความน่ารักกันเต็มๆ ได้เลยน้าค้าบ ❤️✨ #ช่างภาพ #สไตล์เกาหลีละมุน`,
      thankYouMessage: `ขอบพระคุณคุณลูกค้า สำหรับทริปถ่ายภาพในวันนี้มากๆ เลยนะคร้าบน้า 🙏✨ สนุกเป็นกันเองมากๆ เลย ตัวแบบตั้งใจและน่ารักสุดๆ เดี๋ยวด่วนส่งพรีวิวภาพไฮไลท์สวยๆ ไปให้ชมภายในคืนนี้เลยนะครับ ส่วนรูปเซ็ตเต็มจะรีบขัดเกลาแต่งแสงสีสไตล์โทนละมุนให้อย่างไวที่สุดเลยครับ ได้เหนื่อยพักผ่อนมากๆ นะครับ แล้วพบกันใหม่ครับคราบบบ 🥰📸`,
      requestReview: `คุณลูกค้า ครับน้า ช่างภาพแวะมาส่งความสุขเบาๆ นะคร้าบ 😊 หากได้รับไฟล์รูปครบเรียบร้อยแล้ว ถูกอกถูกใจสไตล์ภาพและการทำงานของผม รบกวนเวลาสัก 1 นาทีกดรีวิวเป็นกำลังใจ หรือแชร์ภาพสวยๆ แท็กมาหาเพจช่างภาพด้วยน้าค้าบ ยินดีรับฟังคำติชมเพื่อเอาไปพัฒนาฝีมือให้ดียิ่งขึ้นคราบบบ ขอบคุณมากๆ เลยนะคร้าบผม! ❤️✨`,
      portfolioCaption: `🎞️📸 [Visual Portfolio Style] 📸🎞️\n\n“The camera is an instrument that teaches people how to see without a camera.”\n\nความงดงามของการจัดวางสายตา แสงธรรมชาติยามเย็น และสไตล์ภาพโทนฟิล์มเกาหลีอบอุ่น ที่ตั้งใจสร้างสรรค์อย่างประณีตสำหรับสัปดาห์นี้ ทักทายสอบถามคิวถ่ายภาพได้เสมอครับน้า ✨`,
      albumCaption: `🎞️✨ [Full Story Showcase Album] 📸✨\n\nปักหมุดความน่ารักเต็มสิบไม่หัก! อัลบั้มเต็มรวมเซ็ตภาพถ่ายบุคคล ณ พิกัดสตูดิโอเก๋ๆ คุมโทนอุ่นใจด้วยโทนสีสไตล์ธรรมชาติละมุน ทุกรูปบอกเล่าสตอรี่ความประทับใจและความเป็นตัวเองได้อย่างชัดเจน\n\nชมภาพทั้งหมดและจับจองคิวว่างของคุณได้ที่แชตเพจเลยนะครับน้า พร้อมไกด์ท่าทางตลอดทริปเหมือนเคย 😊👇`,
      singlePhotoCaption: `✨📸 “The Masterpiece Moment” 📸✨\n\nวินาทีที่แสงตกกระทบหน้าเลนส์และจังหวะรอยยิ้มธรรมชาติของตัวแบบส่องสว่างที่สุด โทนสีและองค์ประกอบแบบพรีเมียม สไตล์รูปที่ใช่ในแบบที่เป็นตัวเอง จองทริปทัก inbox เลยครับ! 🔥`,
      beforeAfterCaption: `🎨🎞️ [The Power of Retouching & Color Grading] 🎞️🎨\n\nพามาดูความแตกต่างระหว่างไฟล์ RAW ดิบ และไฟล์ภาพที่แต่งเสร็จสมบูรณ์สไตล์โทนพรีเมียมเกาหลี\n\nเราใส่ใจแต่งรูปภาพให้อย่างพิถีพิถัน ดึงความสดใส แก้ไขโทนสีเพื่อชูโมเมนต์สำคัญให้ทรงเสน่ห์ที่สุด เพราะเราเชื่อว่าทุกรูปถ่ายคือทรัพย์สินแห่งความทรงจำที่มีค่าของคุณครับ 💖📸`
    };
  });

  const handleGenerateCaptions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          jobType,
          location,
          toneStyle,
          notes,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถประมวลผลคำพูดขอบคุณและแคปชั่นจาก AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.reviewCaption) {
        setCaptions(data);
        setError(null);
      } else {
        throw new Error("ข้อมูลแคปชั่นที่ส่งกลับมาไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตของคุณ");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const activeContent = () => {
    if (!captions) return "";
    return captions[activeTab] || "";
  };

  const tabLabels: Record<keyof CaptionGeneration, { label: string; icon: string; description: string }> = {
    reviewCaption: { label: "เล่าความรู้สึกขอบคุณ", icon: "🌸", description: "โพสต์เล่าสตอรี่ซึ้งใจ ขอบคุณสปอร์ตลูกค้าหน้าเพจ" },
    thankYouMessage: { label: "ส่งขอบคุณในแชตด่วน", icon: "📩", description: "ทักหลังจบทริปทันที เพื่อสร้างผู้ติดตามที่ซื่อสัตย์" },
    requestReview: { label: "ส่งแชตขอเขียนติชม", icon: "⭐", description: "ทักสั้นๆ ขอรีวิวหน้าแฟนเพจพยุงเพจโตขึ้น" },
    portfolioCaption: { label: "คำคมเดี่ยวอารมณ์ศิลปิน", icon: "🎨", description: "เหมาะสำหรับแชร์รูป Masterpiece ลงไอจีคุมฟีด" },
    albumCaption: { label: "เปิดตัวอัลบั้มเต็มชุดใหญ่", icon: "🎞️", description: "แคปชั่นสำหรับสไลด์รูปมากกว่า 10 ใบสะกดคนจอง" },
    singlePhotoCaption: { label: "โชว์ภาพเด่นแสงพุ่ง", icon: "🔥", description: "ข้อความสั้นเน้นความสวยหรูสะดุดหน้าเลนส์" },
    beforeAfterCaption: { label: "เปรียบเทียบ Before/After", icon: "✏️", description: "โชว์ฝีมือรีทัชและการดึงแสงเกรดพรีเมียมให้ผู้จ้างเห็น" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>📸</span> แคปชั่นผลงาน & ส่งคำพูดขอบคุณ (AI Caption & Review Generator)
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          สร้างคำโฆษณาประกอบอัลบั้มรูปพอร์ตโฟลิโอ เล่าสตอรี่ความน่ารักยามไปถ่ายงาน และสร้างประโยคส่งทักขอบคุณขอมุมรีวิวอัตโนมัติ
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <form onSubmit={handleGenerateCaptions} className="lg:col-span-4 glass p-5 space-y-4 self-start">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            🎨 ป้อนรายละเอียดงานถ่าย
          </h3>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">ชื่อลูกค้า (ตัวละครเอกของโพสต์)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="เช่น น้องเมย์ บัณฑิตมธ., พี่บิ๊กบ่าวสาว"
              className="w-full text-xs p-2.5 glass-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ประเภทงาน</label>
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
              <label className="block text-xs text-gray-300 font-medium mb-1">สไตล์สีที่ใช้ดึงแสง</label>
              <input
                type="text"
                value={toneStyle}
                onChange={(e) => setToneStyle(e.target.value)}
                placeholder="เช่น โทนอุ่นอบอุ่นสไตล์ฟิล์ม"
                className="w-full text-xs p-2.5 glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">สถานที่นัดพากล้องลุย</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น คาเฟ่เก๋ไก๋ย่านเอกมัย"
              className="w-full text-xs p-2.5 glass-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">
              โน้ต/สตอรี่หน้างานแสนประทับใจ (สำคัญมากสำหรับการเล่าเรื่อง)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น น้องโพสท่าไม่เป็นเลย เกร็งตลอดทาง แต่พอแกล้งชวนกินขนมคุยมุขแป้ก เลยได้ภาพรอยยิ้มอุ่นๆ ธรรมชาติสุดสะใจ"
              className="w-full text-xs p-2.5 glass-input font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "🤖 กำลังประดิษฐ์แคปชั่นเด็ด..." : "📸 เจนแคปชั่นตกแต่งพอร์ตฟีด"}
          </button>
        </form>

        {/* Output Column with tabs */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4">
          {/* Vertical Menu Buttons */}
          <div className="w-full md:w-60 flex flex-col gap-1 shrink-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-2 mb-1">
              ชุดแคปชั่นเขียนสำเร็จ (7 ด้าน)
            </span>
            {Object.keys(tabLabels).map((key) => {
              const isActive = activeTab === key;
              const tab = tabLabels[key as keyof CaptionGeneration];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`text-left px-3 py-2.5 rounded-lg transition text-xs font-semibold flex flex-col gap-0.5 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white accent-glow"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                  }`}
                >
                  <span className="truncate">
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                  </span>
                  <span className={`text-[9px] font-normal truncate ${isActive ? "text-blue-200" : "text-gray-500"}`}>
                    {tab.description.slice(0, 30)}...
                  </span>
                </button>
              );
            })}
          </div>

          {/* Text Display and copying */}
          <div className="flex-1 glass p-5 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                  {tabLabels[activeTab].label}
                </span>
                <span className="text-[9px] text-blue-300 font-bold">
                  *พร้อมลงคู่ภาพถ่ายสไตล์ {toneStyle || "มินิมอล"}
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
                *ระบบคัดลอกด้วยคลิกเดียว ปิดการขายอัจฉริยะ
              </span>
              <button
                onClick={() => copyText(activeContent())}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg accent-glow transition cursor-pointer"
              >
                {copyFeedback ? "คัดลอกหมดแล้ว! ✅" : "📋 คัดลอกแคปชั่นคู่ชุดพอร์ต"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
