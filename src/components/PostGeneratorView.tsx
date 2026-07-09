import React, { useState } from "react";
import { PhotographerProfile, GeneratedPosts } from "../types";
import FacebookHub, { FacebookPage } from "./FacebookHub";

interface PostGeneratorViewProps {
  profile: PhotographerProfile;
  onPostCreated: () => void;
}

export default function PostGeneratorView({ profile, onPostCreated }: PostGeneratorViewProps) {
  const [jobType, setJobType] = useState(profile.jobTypes[0] || "รับปริญญา");
  const [area, setArea] = useState(profile.serviceArea || "");
  const [price, setPrice] = useState(profile.startingPrice || "");
  const [strengths, setStrengths] = useState(profile.strengths || "");
  const [style, setStyle] = useState(profile.style || "");
  const [details, setDetails] = useState("");
  const [photographerName, setPhotographerName] = useState(profile.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<"personal" | "page" | "group" | "reels" | "story">("personal");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [selectedFbPage, setSelectedFbPage] = useState<FacebookPage | null>(null);
  const [publishingToFb, setPublishingToFb] = useState(false);
  const [fbPublishResult, setFbPublishResult] = useState<{ postId: string; permalinkUrl: string } | null>(null);

  const handlePublishToFb = async () => {
    if (!selectedFbPage || !posts) return;
    setPublishingToFb(true);
    setFbPublishResult(null);
    setError(null);

    const textToPublish = appendCtaAndHashtags(activeContent());

    try {
      const res = await fetch("/api/facebook/post-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedFbPage.id,
          pageAccessToken: selectedFbPage.access_token,
          message: textToPublish
        })
      });

      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ปฏิเสธการโพสต์ กรุณาตรวจสอบสิทธิ์แฟนเพจ");
      }

      const data = await res.json();
      if (data.success) {
        setFbPublishResult({
          postId: data.postId,
          permalinkUrl: data.permalinkUrl
        });
        onPostCreated(); // Increment statistical counter
      } else {
        throw new Error("ไม่ได้รับข้อมูลการโพสต์สำเร็จที่ถูกต้อง");
      }
    } catch (err: any) {
      console.error(err);
      setError("การโพสต์ล้มเหลว: " + (err.message || "เกิดข้อขัดข้องทางเทคนิค"));
    } finally {
      setPublishingToFb(false);
    }
  };


  const [posts, setPosts] = useState<GeneratedPosts | null>(() => {
    // Elegant fallback initial templates based on profile style
    return {
      personalFb: `📸✨ “ภาพถ่ายไม่ได้บันทึกแค่ใบหน้า แต่เก็บบันทึกความอบอุ่นและโมเมนต์ที่ไม่มีวันย้อนกลับมา...”

วันนี้เอาผลงานถ่าย รับปริญญา สไตล์เกาหลีละมุน มินิมอล ฟิล์ม Cinematic ล่าสุดมาฝากทุกคนครับ เป็นคิวงานที่สนุกและประทับใจมากๆ ลูกค้าน่ารักเป็นกันเองสุดๆ แฮปปี้ทั้งคนถ่ายและคนถูกถ่ายเลย 😊

สำหรับใครที่โพสท่าไม่เป็น กลัวหน้ากล้อง เกร็งๆ อยากให้ลองเปิดใจมาคุยกันก่อนได้นะครับ ผมเน้นดูแลใกล้ชิด สอนโพสท่าตลอดการถ่าย สไตล์ภาพของเราเน้นความสดใส อารมณ์ธรรมชาติเต็มๆ เสมือนมาเที่ยวเล่นแล้วได้รูปพรีเมียมกลับบ้านไปอวดเพื่อน!

📍 พื้นที่ให้บริการ: กรุงเทพฯ และปริมณฑล / เชียงใหม่
💸 ค่าบริการคุ้มๆ สบายกระเป๋า เริ่มต้นเพียง 3,500.- บาท

ใครอยากมีเซ็ตภาพเก็บความทรงจำสวยๆ แบบนี้ ทัก inbox มาถามคิวคุยเล่นกันก่อนได้นะครับ ยินดีให้บริการมากๆ เลยค้าบ ❤️👇`,
      pageFb: `📢✨ [เปิดรับคิวถ่ายภาพ] บริการถ่าย รับปริญญา ระดับมืออาชีพ โดยทีมงาน ${profile.name}

หากคุณกำลังมองหาภาพถ่ายที่มีคุณภาพ คมชัด สีสันสดใส และมีโทนสีเฉพาะตัวสไตล์เกาหลีละมุน มินิมอล ฟิล์ม Cinematic ที่สะท้อนตัวตนของคุณได้อย่างสมบูรณ์แบบที่สุด!

🌟 ทำไมต้องเลือกเรา?
✔️ จุดเด่น: สอนโพสท่าเก่ง เป็นกันเอง ถ่ายภาพด้วยแสงธรรมชาติสวยงาม ส่งงานไวใน 3 วัน
✔️ การันตีภาพถ่ายสวยงาม โทนสีละมุน เหมาะสำหรับลง Social Media ทุกแพลตฟอร์ม
✔️ มีบริการให้คำแนะนำสถานที่ เสื้อผ้า และแนวภาพที่เหมาะสมกับคุณ

💼 รายละเอียดบริการและอัตราค่าบริการ:
- บริการถ่ายภาพ รับปริญญา ราคาเริ่มต้นเพียง 3,500.- บาท
- บริการทั้งนอกและในสถานที่ โซน กรุงเทพฯ และปริมณฑล / เชียงใหม่
- ส่งไฟล์รูปปรับแสงสีทุกรูป พร้อมส่งไฟล์ High-Res ความละเอียดสูง

📥 สนใจสอบถามและสำรองคิวถ่ายภาพ:
💬 ทักแชตเพจ (Inbox) ได้ตลอด 24 ชั่วโมง
📞 หรือโทรสอบถามคิวว่างด่วนได้เลยครับ!`,
      groupFb: `สวัสดีชาวกลุ่มหาช่างภาพทุกคนครับ 🙏📸 ขออนุญาตแชร์ผลงานและฝากเนื้อฝากตัวด้วยคนนะครับ

ผมจากเพจ ${profile.name} รับถ่ายงาน รับปริญญา สไตล์ภาพแนวเกาหลีละมุน มินิมอล ฟิล์ม Cinematic เน้นอารมณ์ละมุน ธรรมชาติ และความสุขของตัวแบบเป็นหลักครับ

สำหรับเพื่อนๆ ในกลุ่มท่านใดที่กำลังวางแผนมองหาช่างภาพไปเก็บโมเมนต์สำคัญ ไม่ว่าจะเป็นกลุ่มครอบครัว เพื่อนสนิท หรือถ่ายเดี่ยวโปรไฟล์เก๋ๆ แวะชมผลงานและทักทายเข้ามาได้เลยนะคร้าบ

📌 พิกัดให้บริการหลัก: กรุงเทพฯ และปริมณฑล / เชียงใหม่
💵 งบสบายกระเป๋า เริ่มต้นที่ 3,500.- บาท

ยินดีให้คำปรึกษา แนะนำพิกัดโลเคชั่น และการแต่งตัวฟรีๆ ครับ ทักแชตส่วนตัวผมมาได้เลยน้า ยินดีตอบทุกคำถามเลยครับ ขอบคุณแอดมินกลุ่มและสมาชิกทุกคนล่วงหน้าด้วยครับ! 🌟📸`,
      reelsCaption: `🎬✨ เปลี่ยนวันธรรมดาให้กลายเป็นโมเมนต์ระดับ Cinematic 📸 ทริกง่ายๆ สำหรับคนโพสท่าไม่เก่ง แต่อยากได้รูปสวยๆ สไตล์เกาหลีละมุน มินิมอล ฟิล์ม Cinematic! แวะดูคลิปนี้จนจบแล้วจะรู้ว่าความสุขหน้ากล้องเป็นยังไง 🥰 จองคิวถ่ายทักแชตเลยน้า! #ถ่ายภาพ #ช่างภาพ #สอนโพสท่า`,
      storyCaption: `📸✨ คิวถ่ายสัปดาห์นี้ว่างอีกแค่ 2 ที่สุดท้ายเท่านั้น! ใครอยากได้รูปสไตล์เกาหลีสวยๆ ละมุนๆ แบบนี้ ทักแชตมาด่วนเลยน้า ให้ราคาพิเศษเฉพาะรอบนี้เท่านั้นครับ! 📩🔥`,
      hashtags: ["#ช่างภาพรับปริญญา", "#รับถ่ายภาพ", "#หาช่างภาพ", "#ช่างภาพมินิมอล", "#รีวิวช่างภาพ", "#PhotoClientHunter"],
      ctaMessage: `📩 อย่าปล่อยให้โมเมนต์สำคัญผ่านไปโดยไม่มีภาพสวยๆ! คลิก "ส่งข้อความ" เพื่อสอบถามคิวว่างและโปรโมชั่นพิเศษประจำเดือนนี้ได้ทันทีคราบบบ`,
      interactiveQuestion: `ชอบภาพแนวอารมณ์ละมุนธรรมชาติแบบนี้ หรือชอบแบบโพสเท่ๆ คูลๆ มากกว่ากันครับ? คอมเมนต์บอกหน่อยน้า 👇👇`
    };
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          area,
          price,
          strengths,
          style,
          details,
          photographerName,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถสร้างโพสต์ด้วย AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.personalFb) {
        setPosts(data);
        setError(null);
        onPostCreated(); // Increment parent state statistic
      } else {
        throw new Error("ข้อมูลโพสต์ที่ส่งกลับมาไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const activeContent = () => {
    if (!posts) return "";
    switch (activeOutputTab) {
      case "personal":
        return posts.personalFb;
      case "page":
        return posts.pageFb;
      case "group":
        return posts.groupFb;
      case "reels":
        return posts.reelsCaption;
      case "story":
        return posts.storyCaption;
      default:
        return "";
    }
  };

  const appendCtaAndHashtags = (baseText: string) => {
    if (!posts) return baseText;
    const combined = `${baseText}\n\n${posts.ctaMessage}\n\n${posts.interactiveQuestion}\n\n${posts.hashtags.join(" ")}`;
    return combined;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>✍️</span> ระบบสร้างโพสต์อัจฉริยะ (AI Post Generator)
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          สร้างสรรค์แคปชั่นและบทความสำหรับโพสต์ขายงานให้โดนใจกลุ่มเป้าหมาย เพื่อกระตุ้นยอดทักถามราคาโดยตรง
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="lg:col-span-4 glass p-5 space-y-4 self-start">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
            <span>⚙️</span> ตัวกรองโฆษณา
          </h3>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">ชื่อช่างภาพ / เพจ</label>
            <input
              type="text"
              value={photographerName}
              onChange={(e) => setPhotographerName(e.target.value)}
              placeholder="เช่น TP Photography"
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
              <label className="block text-xs text-gray-300 font-medium mb-1">ราคาเริ่มต้น (บาท)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="เช่น 3,500"
                className="w-full text-xs p-2.5 glass-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">พื้นที่พิกัดบริการ</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="เช่น กรุงเทพฯ/สวนเบญจกิติ"
              className="w-full text-xs p-2.5 glass-input"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">สไตล์ภาพคุมโทนเฉพาะ</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="เช่น อุ่นอารมณ์ คลาสสิค แฟชั่น"
              className="w-full text-xs p-2.5 glass-input"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">จุดเด่นของคุณ (ชูจุดขายหลัก)</label>
            <textarea
              rows={2}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="เช่น ไกด์จัดท่าเก่ง ตลก ชวนคุยคลายเครียด"
              className="w-full text-xs p-2.5 glass-input"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">เล่าสตอรี่เบื้องหลังสั้นๆ (ดึงอารมณ์ร่วม)</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="เช่น ลูกค้าทริปนี้กังวลเรื่องอ้วนและขาสั้นมาก แต่ผมจัดแสงเฉียงทำมุมและแนะการบิดส้นเท้า ทำให้รูปออกมาขายาว แฮปปี้สุดๆ"
              className="w-full text-xs p-2.5 glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "🤖 AI กำลังสร้างสรรค์ผลงาน..." : "✍️ สร้างโพสต์ด้วยปัญญาประดิษฐ์"}
          </button>
        </form>

        {/* Display Output Formats */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {posts ? (
            <div className="glass p-5 flex flex-col flex-1">
              {/* Tab Selection */}
              <div className="flex border-b border-white/5 pb-2 overflow-x-auto no-scrollbar gap-1">
                {[
                  { id: "personal", label: "เฟสบุ๊กส่วนตัว", icon: "👤" },
                  { id: "page", label: "แฟนเพจทางการ", icon: "📢" },
                  { id: "group", label: "โพสต์ลงกลุ่มหาช่าง", icon: "🤝" },
                  { id: "reels", label: "Reels แคปชั่น", icon: "🎬" },
                  { id: "story", label: "Story แคปชั่น", icon: "⏱️" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOutputTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      activeOutputTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Text Content Display Area */}
              <div className="mt-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2 bg-white/2 p-2 rounded">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                    {activeOutputTab.toUpperCase()} FORMAT TEMPLATE
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(activeContent(), "pure")}
                      className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      {copyFeedback === "pure" ? "คัดลอกแล้ว! ✅" : "📋 คัดลอกเฉพาะแคปชั่น"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(appendCtaAndHashtags(activeContent()), "full")}
                      className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-2.5 py-1 rounded border border-blue-500/20 transition cursor-pointer"
                    >
                      {copyFeedback === "full" ? "คัดลอกหมดแล้ว! ✅" : "🚀 คัดลอก + CTA + Hashtags"}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-lg flex-1 min-h-[220px]">
                  {loading ? (
                    <div className="space-y-3 animate-pulse py-2">
                      <div className="h-4 bg-white/10 rounded w-1/3"></div>
                      <div className="h-3 bg-white/5 rounded w-full"></div>
                      <div className="h-3 bg-white/5 rounded w-11/12"></div>
                      <div className="h-3 bg-white/5 rounded w-4/5"></div>
                      <div className="h-3 bg-white/5 rounded w-5/6"></div>
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                      {activeContent()}
                    </p>
                  )}
                </div>

                {/* Facebook Posting Control */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-blue-950/15 border border-blue-500/20 p-3 rounded-lg">
                  <div className="md:col-span-8">
                    <FacebookHub compact={true} photographerName={profile.name} onPageSelected={setSelectedFbPage} />
                  </div>
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <button
                      type="button"
                      disabled={!selectedFbPage || publishingToFb || loading}
                      onClick={handlePublishToFb}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700/50 text-white text-[11px] font-bold rounded-lg border border-blue-500/20 shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {publishingToFb ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          กำลังโพสต์...
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          โพสต์ลงเพจทันที
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Facebook Success Notice */}
                {fbPublishResult && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
                    <div className="space-y-0.5">
                      <p className="font-bold flex items-center gap-1"><span>🎉</span> โพสต์บนแฟนเพจสำเร็จ!</p>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {fbPublishResult.postId.slice(0, 24)}...</p>
                    </div>
                    <a
                      href={fbPublishResult.permalinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      เปิดดูโพสต์ ➔
                    </a>
                  </div>
                )}
              </div>

              {/* Extras Column */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                {/* CTA Card */}
                <div className="p-3 bg-white/2 rounded border border-white/5">
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      <div className="h-2 bg-white/5 rounded w-full"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1.5">
                        <h5 className="text-[11px] font-bold text-blue-300">🔗 CTA แนะนำ</h5>
                        <button
                          onClick={() => copyToClipboard(posts?.ctaMessage || "", "cta")}
                          className="text-[9px] text-gray-400 hover:text-white cursor-pointer"
                        >
                          {copyFeedback === "cta" ? "คัดลอกแล้ว ✅" : "คัดลอก"}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-normal">{posts?.ctaMessage}</p>
                    </>
                  )}
                </div>

                {/* Question Card */}
                <div className="p-3 bg-white/2 rounded border border-white/5">
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-white/10 rounded w-2/3"></div>
                      <div className="h-2 bg-white/5 rounded w-full"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1.5">
                        <h5 className="text-[11px] font-bold text-purple-300">💬 คำถามดึง Engagement</h5>
                        <button
                          onClick={() => copyToClipboard(posts?.interactiveQuestion || "", "q")}
                          className="text-[9px] text-gray-400 hover:text-white cursor-pointer"
                        >
                          {copyFeedback === "q" ? "คัดลอกแล้ว ✅" : "คัดลอก"}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-normal">{posts?.interactiveQuestion}</p>
                    </>
                  )}
                </div>

                {/* Hashtags Card */}
                <div className="p-3 bg-white/2 rounded border border-white/5">
                  {loading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-white/10 rounded w-1/3"></div>
                      <div className="h-2 bg-white/5 rounded w-full"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1.5">
                        <h5 className="text-[11px] font-bold text-amber-300">🏷️ แฮชแท็กหลัก</h5>
                        <button
                          onClick={() => copyToClipboard(posts?.hashtags.join(" ") || "", "hash")}
                          className="text-[9px] text-gray-400 hover:text-white cursor-pointer"
                        >
                          {copyFeedback === "hash" ? "คัดลอกแล้ว ✅" : "คัดลอก"}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-normal font-mono">{posts?.hashtags.join(" ")}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 glass flex flex-col items-center justify-center text-center p-6 text-gray-400 flex-1">
              <span className="text-4xl mb-2">✍️</span>
              <p className="text-sm font-medium">พร้อมสร้างโพสต์หาลูกค้าชุดแรกของคุณ</p>
              <p className="text-xs text-gray-500 mt-1">
                ระบุรายละเอียดและสไตล์ภาพด้านซ้าย จากนั้นกดปุ่มประมวลผลเพื่อดึงพลังปัญญาประดิษฐ์ขึ้นรูปภาพโพสต์แบบต่างๆ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
