import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  getSystemInstruction,
  getTargetAnalyzerPrompt,
  getPostGeneratorPrompt,
  getPostScoringPrompt,
  getCalendarPrompt,
  getChatReplyPrompt,
  getPackageComparisonPrompt,
  getObjectionHandlingPrompt,
  getRepurposingPrompt,
  getCaptionGeneratorPrompt,
  getPersonaPrompt
} from "./src/lib/promptService.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI SDK
const apiKey = process.env.GEMINI_API_KEY;
const isRealAi = !!apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";

console.log(`[AI Initializer] API Key provided: ${isRealAi ? "YES" : "NO"}`);

const ai = isRealAi ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Centralized System Instruction based on Thai Sales Psychology
const SYSTEM_INSTRUCTION = getSystemInstruction();

// API Routes

// 1. Target Market Analyzer
app.post("/api/analyze-target", async (req, res) => {
  const { jobType, area, startingPrice, strengths, style, desiredClients } = req.body;

  if (!jobType) {
    return res.status(400).json({ error: "โปรดระบุประเภทงานถ่ายภาพ" });
  }

  const prompt = getTargetAnalyzerPrompt(jobType, area, startingPrice, strengths, style, desiredClients);

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetGroups: { type: Type.ARRAY, items: { type: Type.STRING } },
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              wordsToUse: { type: Type.ARRAY, items: { type: Type.STRING } },
              wordsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
              channels: { type: Type.ARRAY, items: { type: Type.STRING } },
              contentStyles: { type: Type.ARRAY, items: { type: Type.STRING } },
              engagementTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["targetGroups", "painPoints", "wordsToUse", "wordsToAvoid", "channels", "contentStyles", "engagementTriggers"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      // Fallback in case of API error
    }
  }

  // Smart Thai Fallback
  return res.json({
    targetGroups: [
      `กลุ่มลูกค้าที่ต้องการงาน ${jobType} คุณภาพสูง ในโซน ${area || "ทั่วไป"}`,
      `กลุ่มคนที่ชอบภาพแนว ${style || "มินิมอล/ธรรมชาติ"} ที่ชอบความคุ้มค่าและเป็นกันเอง`,
      `ผู้ใช้วัยรุ่น/วัยทำงานในช่องทางโซเชียลที่กำลังมองหาช่างภาพที่เข้าใจความต้องการ`
    ],
    painPoints: [
      "กังวลเรื่องการโพสท่า กลัวถ่ายออกมาแล้วเกร็งหรือไม่เป็นธรรมชาติ",
      "กังวลเรื่องความล่าช้าในการส่งรูป และกลัวได้รูปไม่ครบตามต้องการ",
      "กลัวช่างภาพดุ อารมณ์เสีย หรือคุยยากในระหว่างการทำงาน"
    ],
    wordsToUse: [
      `"ดูแลใกล้ชิด สอนโพสท่าตลอดทริป"`,
      `"โทนสีละมุน สไตล์ ${style || "ธรรมชาติ"} สวยจบพร้อมลงโซเชียล"`,
      `"รับประกันส่งงานไว ภายในเวลากำหนดแน่นอน"`
    ],
    wordsToAvoid: [
      `"มัดจำแล้วห้ามยกเลิกทุกกรณี"`,
      `"ราคาเน็ตๆ ไม่มีลดเพิ่ม"`,
      `"ไม่รวมค่าเดินทาง ค่าอุปกรณ์ และอื่นๆ อีกมากมาย"`
    ],
    channels: [
      "Facebook ส่วนตัว: ใช้เล่าสตอรี่เบื้องหลังการทำงานเพื่อสร้างผู้ติดตามแบบกันเอง",
      `Facebook Group ในพื้นที่ ${area || "ใกล้เคียง"}: โพสต์รีวิวงานเด็ดๆ เพื่อให้ตรงจุดคนหาช่างภาพ`,
      "Instagram / Reels: โชว์ภาพสไลด์และคลิปสั้นเบื้องหลัง ดึงดูดด้วยสไตล์ภาพที่โดดเด่น"
    ],
    contentStyles: [
      `โพสต์แชร์อัลบั้มเต็มของงาน ${jobType} พร้อมเล่าความประทับใจของลูกค้าในแคปชั่น`,
      "ภาพเปรียบเทียบ Before vs After การแต่งโทนสีที่แสดงให้เห็นถึงฝีมือแต่งภาพอันพิถีพิถัน",
      "คลิปเบื้องหลังการจัดท่าทาง (Pose Guide) สั้นๆ เพื่อพิสูจน์ว่าบริการนี้คุ้มค่าสำหรับคนโพสไม่เก่ง"
    ],
    engagementTriggers: [
      "แจกโปรโมชั่นพิเศษ 'รับสิทธิ์จองคิวแถมฟรีภาพขนาดพิเศษ' สำหรับ 5 คิวแรกที่ทักเข้ามา",
      "ทิ้งท้ายโพสต์ด้วยคำถามง่ายๆ เช่น 'ชอบภาพโทนละมุนแบบนี้ หรือสตรีทดาร์กๆ มากกว่ากัน คอมเมนต์บอกหน่อยน้า'",
      "บอกตารางคิวว่างที่เหลือชัดเจน กระตุ้นความรีบเร่ง เช่น 'คิวสัปดาห์นี้เหลือเพียง 2 วันเท่านั้น ทักสอบถามได้เลยครับ'"
    ]
  });
});

// 2. AI Post Generator
app.post("/api/generate-posts", async (req, res) => {
  const { jobType, area, price, strengths, style, details, photographerName } = req.body;

  const prompt = getPostGeneratorPrompt({ jobType, area, price, strengths, style, details, photographerName });

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personalFb: { type: Type.STRING },
              pageFb: { type: Type.STRING },
              groupFb: { type: Type.STRING },
              reelsCaption: { type: Type.STRING },
              storyCaption: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              ctaMessage: { type: Type.STRING },
              interactiveQuestion: { type: Type.STRING },
            },
            required: ["personalFb", "pageFb", "groupFb", "reelsCaption", "storyCaption", "hashtags", "ctaMessage", "interactiveQuestion"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Gemini Post Gen Error:", err);
    }
  }

  // Thai Fallback
  const name = photographerName || "ช่างภาพ";
  return res.json({
    personalFb: `📸✨ “ภาพถ่ายไม่ได้บันทึกแค่ใบหน้า แต่เก็บบันทึกความอบอุ่นและโมเมนต์ที่ไม่มีวันย้อนกลับมา...”\n\nวันนี้เอาผลงานถ่าย ${jobType} สไตล์ ${style} ล่าสุดมาฝากทุกคนครับ เป็นคิวงานที่สนุกและประทับใจมากๆ ลูกค้าน่ารักเป็นกันเองสุดๆ แฮปปี้ทั้งคนถ่ายและคนถูกถ่ายเลย 😊\n\nสำหรับใครที่โพสท่าไม่เป็น กลัวหน้ากล้อง เกร็งๆ อยากให้ลองเปิดใจมาคุยกันก่อนได้นะครับ ผมเน้นดูแลใกล้ชิด สอนโพสท่าตลอดการถ่าย สไตล์ภาพของเราเน้นความสดใส อารมณ์ธรรมชาติเต็มๆ เสมือนมาเที่ยวเล่นแล้วได้รูปพรีเมียมกลับบ้านไปอวดเพื่อน!\n\n📍 พื้นที่ให้บริการ: ${area || "ทุกพื้นที่ทั่วไทย"}\n💸 ค่าบริการคุ้มๆ สบายกระเป๋า เริ่มต้นเพียง ${price || "ราคามิตรภาพ"}\n\nใครอยากมีเซ็ตภาพเก็บความทรงจำสวยๆ แบบนี้ ทัก inbox มาถามคิวคุยเล่นกันก่อนได้นะครับ ยินดีให้บริการมากๆ เลยค้าบ ❤️👇`,
    pageFb: `📢✨ [เปิดรับคิวถ่ายภาพ] บริการถ่าย ${jobType} ระดับมืออาชีพ โดยทีมงาน ${name}\n\nหากคุณกำลังมองหาภาพถ่ายที่มีคุณภาพ คมชัด สีสันสดใส และมีโทนสีเฉพาะตัวสไตล์ ${style} ที่สะท้อนตัวตนของคุณได้อย่างสมบูรณ์แบบที่สุด!\n\n🌟 ทำไมต้องเลือกเรา?\n✔️ จุดเด่น: ${strengths || "บริการสอนโพสท่า ถ่ายรูปไว เป็นกันเอง ส่งงานรวดเร็ว"}\n✔️ การันตีภาพถ่ายสวยงาม โทนสีละมุน เหมาะสำหรับลง Social Media ทุกแพลตฟอร์ม\n✔️ มีบริการให้คำแนะนำสถานที่ เสื้อผ้า และแนวภาพที่เหมาะสมกับคุณ\n\n💼 รายละเอียดบริการและอัตราค่าบริการ:\n- บริการถ่ายภาพ ${jobType} ราคาเริ่มต้นเพียง ${price || "ราคากันเอง"}\n- บริการทั้งนอกและในสถานที่ โซน ${area || "กรุงเทพฯ และปริมณฑล"}\n- ส่งไฟล์รูปปรับแสงสีทุกรูป พร้อมส่งไฟล์ High-Res ความละเอียดสูง\n\n📥 สนใจสอบถามและสำรองคิวถ่ายภาพ:\n💬 ทักแชตเพจ (Inbox) ได้ตลอด 24 ชั่วโมง\n📞 หรือโทรสอบถามคิวว่างด่วนได้เลยครับ!`,
    groupFb: `สวัสดีชาวกลุ่มหาช่างภาพทุกคนครับ 🙏📸 ขออนุญาตแชร์ผลงานและฝากเนื้อฝากตัวด้วยคนนะครับ\n\nผมจากเพจ ${name} รับถ่ายงาน ${jobType} สไตล์ภาพแนว ${style} พิกัด ${area || "ทั่วไป"} ราคาเริ่มต้นสบายๆ เพียง ${price || "มิตรภาพ"} บาทเท่านั้นครับน้าคราบบบ\n\nช่างภาพเป็นกันเอง อารมณ์ดี ไม่กดดัน สอนโพสท่าจัดร่างกายทุกท่วงท่าเพื่อให้ได้จังหวะรอยยิ้มที่เป็นคุณที่สุดน้าค้าบ สนใจจองคิวแชตคุยกันได้เลยคร้าบ! 😊❤️`,
    reelsCaption: `🎬📸 ความเป็นธรรมชาติคือความสวยที่สุดในตัวคุณ... เบื้องหลังทริปถ่ายภาพสนุกๆ ของช่างภาพสายฮา สอนโพสไกด์ท่าทางละลายพฤติกรรมจนตัวแบบฟินตลอดวัน สนใจจองล็อกวันทัก DM แชตเลยจ้า! ✨`,
    storyCaption: `✨📸 ล็อกคิวด่วนสัปดาห์นี้ว่างกะทันหัน 1 วัน! แชตทักเลยจ้า`,
    hashtags: ["หาช่างภาพ", `รับถ่ายภาพ${jobType}`, "ช่างภาพอารมณ์ดี", "สอนโพสท่าทาง", "โทนสีละมุน"],
    ctaMessage: `สนใจล็อกคิวพิเศษแถมภาพจัดพรีเมียมเพิ่ม ทัก inbox คุยเรื่องแนวภาพกันได้น้าค้าบ! 👇📱`,
    interactiveQuestion: `คุณชอบภาพแนวโทนละมุนฟุ้งๆ หรือคมชัดคลีนๆ มากกว่ากัน คอมเมนต์บอกหน่อยน้า 👇😊`
  });
});

// 3. AI Post Score System
app.post("/api/score-post", async (req, res) => {
  const { postContent, jobType, targetStyle } = req.body;

  if (!postContent) {
    return res.status(400).json({ error: "โปรดระบุเนื้อหาโพสต์ที่ต้องการประเมิน" });
  }

  const prompt = getPostScoringPrompt(postContent, jobType, targetStyle);

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              criteria: {
                type: Type.OBJECT,
                properties: {
                  hook: { type: Type.INTEGER },
                  targetRelevance: { type: Type.INTEGER },
                  sellability: { type: Type.INTEGER },
                  credibility: { type: Type.INTEGER },
                  ctaClarity: { type: Type.INTEGER },
                  commentOpportunity: { type: Type.INTEGER },
                  personalFbSuitability: { type: Type.INTEGER },
                },
                required: ["hook", "targetRelevance", "sellability", "credibility", "ctaClarity", "commentOpportunity", "personalFbSuitability"],
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              ctaTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              upgradedVersion: { type: Type.STRING },
            },
            required: ["score", "criteria", "strengths", "improvements", "ctaTips", "upgradedVersion"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Post Scoring Error:", err);
    }
  }

  // Thai Fallback
  return res.json({
    score: 78,
    criteria: {
      hook: 75,
      targetRelevance: 80,
      sellability: 70,
      credibility: 85,
      ctaClarity: 75,
      commentOpportunity: 70,
      personalFbSuitability: 80
    },
    strengths: [
      "มีการใช้ภาษาที่เป็นกันเองและอบอุ่น เข้าถึงกลุ่มลูกค้าได้ง่าย",
      "มีรายละเอียดของสไตล์โทนภาพที่ค่อนข้างชัดเจน",
      "แสดงความน่าเชื่อถือและความประทับใจของช่างภาพอย่างจริงใจ"
    ],
    improvements: [
      "ประโยคแรก (Hook) ยังไม่สะดุดตาพอที่จะหยุดนิ้วคนเลื่อนฟีดได้ทันที",
      "ยังขาดข้อเสนอสิทธิพิเศษและจิตวิทยาความรีบเร่ง (Scarcity) ในการปิดการขาย",
      "ช่องทางการสั่งซื้อหรือคำทักแชต (CTA) ยังไม่ดึงดูดใจและรู้สึกง่ายพอสำหรับมือใหม่"
    ],
    ctaTips: [
      "ควรเน้นความสะดวกรวดเร็วในการปิดจ๊อบ เช่น การล็อกวันว่างแบบยืดหยุ่น",
      "แนะนำเพิ่มสิทธิ์ของแถมกระตุ้นการตัดสินใจในโพสต์ทันที"
    ],
    upgradedVersion: `✨📸 “เคยไหม... อยากมีรูปคู่สวยๆ โทนละมุนแต่อายหน้ากล้อง ไม่รู้ต้องโพสท่าตรงไหน?”\n\nวางใจได้เลยครับ! คิวถ่ายงาน ${jobType || "ถ่ายภาพ"} โทน ${targetStyle || "ธรรมชาติ"} ล่าสุดของผมเน้นความปล่อยชิล ดูแลสอนโพสจัดทิศทางแสงเงาเป็นธรรมชาติสูงสุดเสมือนไปเที่ยวกับเพื่อนสนิท 🤣\n\n💸 พิเศษล็อกสิทธิ์มัดจำ 5 ท่านแรกในสัปดาห์นี้ แถมฟรีทันทีภาพพิเศษพรีเมียมรีทัช 5 รูปคุ้มจุใจ!\n💬 ทัก Inbox แชตคุยไอเดียโทนภาพและเช็กวันว่างกับผมได้เลยนะคร้าบบบ! 👇❤️`
  });
});

// 4. Content Calendar (7-Day Plan)
app.post("/api/generate-calendar", async (req, res) => {
  const { name, area, startingPrice, strengths, style, jobTypes } = req.body;

  const prompt = getCalendarPrompt(jobTypes?.join(", "), style, startingPrice, area);

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calendar: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    dayName: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    channel: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    imageSuggestion: { type: Type.STRING },
                    cta: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ["day", "dayName", "topic", "purpose", "channel", "caption", "imageSuggestion", "cta", "category"],
                }
              }
            },
            required: ["calendar"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Gemini Calendar Error:", err);
    }
  }

  // Thai Fallback
  const job = jobTypes?.join(", ") || "ถ่ายภาพ";
  return res.json({
    calendar: [
      {
        day: 1,
        dayName: "วันจันทร์",
        topic: "เปิดตัวอัลบั้มภาพผลงานเซ็ตล่าสุดชวนประทับใจ",
        purpose: "แสดงความสามารถในการถ่ายทอดอารมณ์และองค์ประกอบภาพ",
        channel: "Facebook Page",
        caption: `สปอยความสุขย้อนหลังกับเซ็ตภาพถ่าย ${job} ล่าสุดครับน้า บรรยากาศอบอุ่นละมุนใจ โพสท่าเป็นธรรมชาติสุดๆ ดีใจที่ได้เป็นส่วนหนึ่งในการเก็บบันทึกความทรงจำนะคร้าบ ❤️📸`,
        imageSuggestion: "ภาพเซ็ตแนวตั้ง 3-4 ภาพ คุมโทนสีอบอุ่นสดใสสะกดสายตา",
        cta: "แวะทักInboxมาปรึกษามุมสวยๆ ล็อกคิวจองเดือนนี้ก่อนเต็มได้น้าคราบบบ",
        category: "ผลงานล่าสุด"
      },
      {
        day: 2,
        dayName: "วันอังคาร",
        topic: "เบื้องหลังการสอนโพสท่าขำๆ ชิลๆ หน้างาน",
        purpose: "ลดความเกร็งละลายพฤติกรรมลูกค้า บ่งบอกช่างภาพใจดีเป็นกันเอง",
        channel: "Facebook Story / Reels",
        caption: "เบื้องหลังการถ่ายรูปฉบับตัวแม่ตัวมัม ไม่ต้องห่วงเรื่องหามุมเกร็ง ช่างภาพคนนี้พร้อมสอนโพสไกด์ท่าทางให้ทุกสเต็ป ตลกเป็นกันเองแน่นอนครับน้า! 🤣✨",
        imageSuggestion: "คลิปวิดีโอสั้นหรือภาพแคนดิดตลกๆ ระหว่างไกด์ท่าทางให้ตัวแบบ",
        cta: "สะดวกวันไหนล็อกคิวด่วนทัก Inbox คุยเล่นคุยไอเดียกันก่อนได้เลยนะครับ",
        category: "เบื้องหลัง"
      },
      {
        day: 3,
        dayName: "วันพุธ",
        topic: "แชร์เคล็ดลับเด็ดๆ ขยับตัวอย่างไรให้หุ่นสวยเพรียว",
        purpose: "ส่งมอบคุณค่าที่เป็นประโยชน์ (Value Content) สร้างความน่าเชื่อถือทางเทคนิค ความละเอียดใส่ใจ และความคุ้งค่าของการรีทัช",
        channel: "Facebook ส่วนตัว / Page",
        caption: "🎞️✨ ก่อนแต่งคือภาพสวยแล้ว หลังดึงสีคือฟิล์มเกาหลีฟิลกู้ดพุ่งขึ้น 300%! งานแต่งละเอียดทุกใบเพื่อให้ทุกคนประทับใจที่สุดเมื่อย้อนกลับมาดูรูปครับ",
        imageSuggestion: "ภาพเดี่ยวแบบเลื่อน Slide หรือแบ่งครึ่งเปรียบเทียบไฟล์ RAW ดิบ และไฟล์แต่งเสร็จเด็ดๆ",
        cta: "ชอบความเปรียบต่างโทนแสงสีแบบนี้ทักมาจองแพ็กเกจปรับโทนพิเศษได้เลยค้าบ",
        category: "Before / After"
      },
      {
        day: 4,
        dayName: "วันพฤหัสบดี",
        topic: "รีวิวความน่ารักและความประทับใจจากปากลูกค้าจริง",
        purpose: "สร้างความน่าเชื่อถือทางสังคม (Social Proof) สลายความกังวลของลูกค้าใหม่",
        channel: "Facebook Page / Story",
        caption: "💬❤️ 'ช่างภาพพูดเก่งมาก สอนโพสดีสุดๆ ถ่ายรูปไว ได้รูปครบถูกใจมากๆ เลยค่า' ขอบคุณรีวิวที่อบอุ่นใจแบบนี้น้า มันคือพลังใจทำงานต่อไปจริงๆ ครับ!",
        imageSuggestion: "รูปแคปหน้าจอบทสนทนาชื่นชมใน LINE หรือแชตเฟสบุ๊ก คู่กับภาพที่ดีที่สุดของคิวถ่ายนั้น",
        cta: "อยากฟินอยากได้ประสบการณ์ถ่ายรูปชิลๆ แบบนี้ ทัก inbox มาจับจองคิวว่างกันครับ",
        category: "รีวิวลูกค้า"
      },
      {
        day: 5,
        dayName: "วันศุกร์",
        topic: "เล่าเคสลูกค้าสุดพีคหรือสตอรี่ประทับใจหน้างานอย่างมีอารมณ์ร่วม",
        purpose: "เชื่อมโยงความสัมพันธ์ส่วนตัว (Engagement) ผ่าน Storytelling ที่มีเสน่ห์",
        channel: "Facebook ส่วนตัว",
        caption: "🌧️📸 ลูกค้าบอกกลัวฝนจะตกพายุจะเข้า แต่ผมบอกลุยเลยครับพี่! และนี่คือผลลัพธ์ของรูปกลางสายหมอกบางๆ ที่สวยโรแมนติกเหมือนหลุดมาจากหนังรักเกาหลีเลย",
        imageSuggestion: "ภาพคู่รักหรือภาพเดี่ยวที่มีบรรยากาศโรแมนติก แฝงสตอรี่เบื้องหลังการแก้ไขสถานการณ์",
        cta: "มีใครชอบพายุฝนโรแมนติกแบบนี้บ้าง แชทมาแชร์ความคิดเห็นกันได้นะครับ!",
        category: "เล่าเคสลูกค้า"
      },
      {
        day: 6,
        dayName: "วันเสาร์",
        topic: "ประกาศคิวว่างหรือโปรโมชั่นด่วนประจำสัปดาห์ / เดือน",
        purpose: "เร่งยอดขาย ปิดคิวว่างโดยตรงด้วยข้อเสนอด่วนที่มีขีดจำกัด",
        channel: "Facebook Group / Story",
        caption: `🔥🗓️ ด่วนมากทุกคน คิวถ่ายภาพสุดสัปดาห์นี้ว่างกะทันหัน 1 คิวเท่านั้น! โอกาสดีสำหรับใครอยากถ่ายงาน ${job} ในราคาสุดพิเศษพร้อมแถมรูปเพิ่มจุใจ!`,
        imageSuggestion: "ภาพถ่ายมุมกว้างโชว์สไตล์อลังการพรีเมียม สกรีนอักษรคิวว่างตัวโตๆ อ่านง่าย",
        cta: "ใครไวสุดได้สิทธิ์ไปครอง ทัก inbox แชตเฟสสอบถามโปรโมชั่นและจองด่วนครับ!",
        category: "เปิดคิวว่าง"
      },
      {
        day: 7,
        dayName: "วันอาทิตย์",
        topic: "เสนอไอเดียแพ็กเกจยอดฮิตสำหรับครอบครัว/พรีเวดดิ้ง/เดี่ยวโปรไฟล์",
        purpose: "นำเสนอสินค้าและบริการอย่างสุภาพ ครบถ้วน ทรงพลัง สะดุดตาก่อนเริ่มสัปดาห์ใหม่",
        channel: "Facebook Page / Facebook ส่วนตัว",
        caption: "✨💼 มัดรวมแพ็กเกจถ่ายภาพที่ดีที่สุดในรอบปี! ไม่ว่าจะเป็นงานแต่ง งานพรีเวดดิ้ง หรือรูปโปรไฟล์ส่งสมัครงาน ครบจบ ดูแลครบทุกขั้นตอนอย่างพรีเมียม",
        imageSuggestion: "กราฟิกดีไซน์แพ็กเกจเรียบร้อย สวยงาม มีรูปตัวอย่างประกอบสไตล์เด่นสะดุดตา",
        cta: "ทักแชตเพื่อรับแคตตาล็อกราคาเต็มและสิทธิพิเศษจองก่อนใครวันนี้!",
        category: "โปรโมชัน"
      }
    ]
  });
});

// 6. Package Builder
app.post("/api/improve-package", async (req, res) => {
  const { name, price, hours, photosDelivered, location, inclusions, conditions } = req.body;

  const prompt = getPackageComparisonPrompt(
    {
      name: name || "แพ็กเกจถ่ายภาพสุดคุ้ม",
      price: price || "3500",
      hours: hours || "4",
      photosDelivered: photosDelivered || "ไม่จำกัดจำนวนภาพ",
      inclusions: inclusions || "ปรับแสงสีสวยละมุนทุกใบ",
      conditions: conditions || "มัดจำ 1,000 บาทล็อกคิว"
    },
    {
      name: "ช่างภาพมืออาชีพ",
      style: "ธรรมชาติละมุน",
      jobTypes: [],
      startingPrice: price || "3500",
      serviceArea: location || "กรุงเทพฯ",
      phone: "-",
      lineId: "-",
      facebookPage: "-",
      strengths: "-"
    }
  );

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiEnhancedText: { type: Type.STRING },
              aiPromoPost: { type: Type.STRING },
            },
            required: ["aiEnhancedText", "aiPromoPost"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Package Improvement Error:", err);
    }
  }

  // Thai Fallback
  return res.json({
    aiEnhancedText: `⭐💎 [แพ็กเกจยกระดับระดับ Signature]💎⭐\n👑 ชื่อใหม่แนะนำ: "${name} Elite Cinematic Memory"\n\n💸 ราคาเสนอขายสุดพรีเมียม: ${price}.- บาท (คุ้มค่า คุ้มฝีมือ)\n⏱️ เวลาให้บริการเต็มอิ่ม: ${hours} ชั่วโมงเต็ม (เก็บครบทุกมุม ทุกรอยยิ้ม ไม่เร่งรีบ)\n\n🎁 สิ่งที่คุณจะได้ครอบครอง:\n✨ จำนวนรูปปรับแสงและโทนสีเกรดพรีเมียมเกาหลีแบบ 'ไม่จำกัดจำนวนภาพ' (การันตีคัดสรรรูปที่สวยที่สุดอย่างน้อย ${photosDelivered} รูปขึ้นไป)\n✅ บริการสอนโพสท่าทางตลอดวัน มือใหม่แค่ไหนตัวแบบก็สวยเป็นธรรมชาติไร้เกร็ง\n✅ ได้รับไฟล์รูปพรีวิวรวดเร็วทันใจใน 24 ชั่วโมงแรก!\n✅ ให้คำปรึกษาสไตล์การแต่งกายและมุมโลเคชั่นลับๆ ในโซน ${location || "ทั่วไป"} ฟรี!\n\n📥 คิวจองเดือนนี้จำกัดสัปดาห์ละ 2 ทีมเท่านั้นครับ เพื่อคุณภาพงานแต่งสีที่ดีที่สุด!\n💬 สนใจรีบจองสิทธิ์ล็อกคิว ทักส่งข้อความ Inbox เพจช่างภาพด่วนคราบบบ 👇📱`,
    aiPromoPost: `✨📸 เปิดตัวแพ็กเกจพรีเมียมตัวใหม่ที่จะพาคุณไปดื่มด่ำกับประสบการณ์ถ่ายภาพสไตล์ฟิลกู้ด ละมุนตา เสมือนนักแสดงนำในซีรีส์เกาหลี\n\n💎 แพ็กเกจสุดฮิต: "${name} Elite Cinematic Memory" 💎\n\n💸 พิเศษสุดในราคาเพียง ${price}.- บาทถ้วน!\n⏱️ จัดเต็มอิ่มเวลาถ่ายรูปจุใจ ${hours} ชั่วโมงเต็มๆ พร้อมทีมงานช่างภาพคอยดูแลอย่างมืออาชีพและเป็นกันเองสูงสุด\n\n✨ สิทธิประโยชน์เหนือใคร:\n✅ การันตีส่งรูปแสงสีแต่งครบไม่อั้น! (คัดสรรสวยที่สุดอย่างน้อย ${photosDelivered} รูปขึ้นไป)\n✅ บริการสอนโพสท่าทางตลอดวัน มือใหม่แค่ไหนตัวแบบก็สวยเป็นธรรมชาติไร้เกร็ง\n✅ ได้รับไฟล์รูปพรีวิวรวดเร็วทันใจใน 24 ชั่วโมงแรก!\n✅ ให้คำปรึกษาสไตล์การแต่งกายและมุมโลเคชั่นลับๆ ในโซน ${location || "ทั่วไป"} ฟรี!\n\n📥 คิวจองเดือนนี้จำกัดสัปดาห์ละ 2 ทีมเท่านั้นครับ เพื่อคุณภาพงานแต่งสีที่ดีที่สุด!\n💬 สนใจรีบจองสิทธิ์ล็อกคิว ทักส่งข้อความ Inbox เพจช่างภาพด่วนคราบบบ 👇📱`
  });
});

// 11. AI Target Audience Persona Generator
app.post("/api/generate-personas", async (req, res) => {
  const { jobType, style, startingPrice, serviceArea, photographerProfile } = req.body;

  const pName = photographerProfile?.name || "ช่างภาพ";
  const pStyle = style || photographerProfile?.style || "ธรรมชาติ";
  const pPrice = startingPrice || photographerProfile?.startingPrice || "3,500";
  const pArea = serviceArea || photographerProfile?.serviceArea || "กรุงเทพฯ";

  const prompt = getPersonaPrompt(jobType, pStyle, pArea, pPrice, pName);

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    demographics: { type: Type.STRING },
                    deepDesire: { type: Type.STRING },
                    mainObjection: { type: Type.STRING },
                    triggerWords: { type: Type.STRING },
                    upsellScript: { type: Type.STRING },
                  },
                  required: ["name", "demographics", "deepDesire", "mainObjection", "triggerWords", "upsellScript"],
                }
              }
            },
            required: ["personas"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err) {
      console.error("Generate Personas Error:", err);
    }
  }

  // High-fidelity Thai fallback personas based on inputs
  const fallbackPersonas = [
    {
      name: "น้องมายด์ - บัณฑิตวัยรุ่นสายคอนเทนต์ไอจี (IG Story Creator)",
      demographics: "เพศหญิง, อายุ 21-23 ปี, นักศึกษาพึ่งจบใหม่ในเขต " + pArea + " ที่ใช้งาน Instagram ตลอดเวลา",
      deepDesire: "อยากมีเซ็ตภาพถ่ายนอกรอบที่คุมโทนสไตล์ " + pStyle + " ถ่ายทอดความน่ารักสดใสและเป็นธรรมชาติโดยไม่มีตึกหรือองค์ประกอบอื่นรบกวนฉากหลัง อยากได้รูปรีวิวส่งด่วนใน 24 ชั่วโมงแรกเอาไปอัปสปอยเพื่อนร่วมรุ่น",
      mainObjection: "กลัวช่างภาพดุ อารมณ์เสีย หรือบังคับให้โพสท่าที่ยากๆ แปลกๆ จนอึดอัด กังวลเรื่องการส่งงานช้าข้ามเดือน",
      triggerWords: "เน้นสอนโพสท่าแบบปล่อยชิล, เป็นกันเองตลกเหมือนมาเที่ยวกับเพื่อน, การันตีส่งรูปแต่งสีไวใน 3 วัน",
      upsellScript: `สวัสดีครับน้องมายด์ค้าบ 😊 ยินดีแสดงความยินดีกับความสำเร็จล่วงหน้าเลยน้า สำหรับน้องมายด์ที่อยากได้รูปสไตล์ ${pStyle} ละมุนๆ ไปแต่งไอจีสวยๆ พี่แนะเซ็ตโปรเด็ดมินิมอลตัวนี้เลยน้า พี่จะแถมลูกโป่งพาสเทลและเครื่องพ่นฟองสบู่เป็นพร็อพเสริมอารมณ์ความละมุนให้ฟรี และพิเศษสุดๆ พี่ดูแลแต่งเนียนสเปเชียลผิวเนียนลบริ้วรอยจุดด่างดำพร้อมแต่งทรงให้อีก 15 รูปไปเลยครับน้า แถมการันตีส่งไฮไลต์ความทรงจำใน 12 ชั่วโมงแรกทันอัปลง Reels สนุกสนานแน่นอนคราบบบ!`
    },
    {
      name: "คุณกอล์ฟ & คุณอาย - คู่รักหมั้นหมายสร้างอนาคต (Premium Wedding Seekers)",
      demographics: "คู่รักเพศชาย/หญิง, อายุ 26-32 ปี, พนักงานบริษัทและข้าราชการวัยทำงานที่อยากมีพรีเวดดิ้งคุณภาพสูง",
      deepDesire: "ต้องการบันทึกแววตา ความใส่ใจ และโมเมนต์โรแมนติกที่อบอุ่นเหนือกาลเวลา ถ่ายทอดด้วยสไตล์ " + pStyle + " เรียบหรูคลาสสิก",
      mainObjection: "คิดว่าราคาเริ่มต้น " + pPrice + " บาทของเพจเรายังสูงกว่าตลาดย่อยบางเจ้า และกังวลว่าช่างภาพไม่มีกล้องหรือไฟสำรองจนทำให้หากเกิดอุบัติเหตุทางเทคโนโลยีรูปจะสูญหาย",
      triggerWords: "มีกล้องสำรองและคลังแฟลชพร้อมทุกชุด, จัดแต่งไฟดึงมิติดูแพง, สอนเทคนิคไกด์คู่โพสท่ากอดอุ่นเป็นธรรมชาติ",
      upsellScript: `ขอแสดงความยินดีในวาระมงคลล่วงหน้าเลยนะครับคุณกอล์ฟคุณอาย 😊📸 สำหรับพิธีแต่งงานสำคัญพรีเมียม พี่ขอเสนอแนะขยับขึ้นมาดูแพ็กเกจ 'Cinematic Grand Full Day' ครับน้า นอกเหนือจากช่างภาพหลัก 2 คนช่วยระดมเก็บทั้งมุมพิธีหมั้นด้านหน้าและมุมสวมแหวนเจาะลึกด้านหลังแล้ว เราพกเซ็ตไฟสตูแฟลชสตูดิโอและกล้องเซนเซอร์สำรองทุกตัว เพื่อป้องกันความเสี่ยง และแต่งผิวรีทัชให้อลังการสะกดใจผู้เข้าร่วมงานแน่นอนครับน้า!`
    },
    {
      name: "พี่นก - เจ้าของร้านขนมหวานสไตล์โมเดิร์น (Cafe & Small Business Owner)",
      demographics: "เพศหญิง, อายุ 28-42 ปี, เจ้าของร้านอาหารหรือคาเฟ่ในพื้นที่ " + pArea + " ที่ต้องการโฆษณาเชิงพาณิชย์",
      deepDesire: "ต้องการให้ภาพผลงานถ่ายทอดรายละเอียดสีสันสไตลิ่งดึงเท็กซ์เจอร์ของขนมให้ออกมาฉ่ำชวนกิน ดันยอดไลก์และยอดสั่งอาหาร Lineman ทะยานขึ้น 3 เท่า",
      mainObjection: "กลัวทีมช่างภาพนำพาอุปกรณ์เกะกะรบกวนลูกค้าที่กำลังนั่งดื่มกาแฟในร้าน หรือกังวลว่าช่างภาพจะจัดพร็อพส่องแสงไม่เป็นศิลปะ",
      triggerWords: "บริการพกไฟสตูขนาดมินิแต่ทรงพลัง, จัดวางพร็อพอาหารฟรีโดยฟู้ดสไตลิสต์, มอบลิขสิทธิ์ภาพใช้โฆษณาพาณิชย์ตลอดชีพ",
      upsellScript: `สวัสดีครับพี่นกดีกรีร้านอร่อยของจังหวัดเรา 😊 ช่างภาพยินดีช่วยอัปยอดขายสุดพลังเลยคราบบบ สำหรับขนมปังอบชีสฉ่ำวาวของพี่นก พี่แนะนำแพ็กเกจ 'Commercial Food Premium' ครับน้า เราจะมีสไตลิสต์จัดทิศทางแสงเงาแบบสตูดิโอโมเดิร์นช่วยประดับผลไม้และจานไม้วินเทจให้ภาพดูดึงดูดน่ากิน ดันความหิวพุ่งพรวด และพี่ขอมอบสิทธิ์ลิขสิทธิ์แท้เชิงพาณิชย์ให้พี่นกนำไปขึ้นป้ายใหญ่หรือสื่อสิ่งพิมพ์โปรโมตร้านได้ตลอดชีพอย่างไร้ขอบเขตเลยครับ คุ้มแสนคุ้มแน่นอนคราบบบ!`
    }
  ];

  return res.json({ personas: fallbackPersonas });
});

// 5. AI Chat Reply Assistant
app.post("/api/generate-chat-replies", async (req, res) => {
  const { name, channel, jobType, budget, date, location, notes, status, photographerProfile } = req.body;

  const prompt = getChatReplyPrompt({
    clientName: name || "ลูกค้า",
    jobType: jobType || "ถ่ายภาพทั่วไป",
    budget: budget || "ไม่ระบุงบประมาณ",
    location: location || "ไม่ระบุสถานที่ชัดเจน",
    status: status || "lead",
    notes: notes || "ลูกค้าคุยสุภาพ สนใจโทนละมุนอบอุ่น",
    photographerProfile: photographerProfile || {
      name: "ช่างภาพมืออาชีพ",
      serviceArea: "ทั่วไป",
      startingPrice: "เริ่มต้นราคากันเอง",
      phone: "-",
      lineId: "-",
      style: "ธรรมชาติละมุน",
      jobTypes: [],
      packages: []
    },
    lastMessage: notes || "สนใจรายละเอียดคิวงานถ่ายภาพสวยๆ ครับ"
  });

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              firstResponse: { type: Type.STRING },
              sendPackage: { type: Type.STRING },
              askDetails: { type: Type.STRING },
              closeSale: { type: Type.STRING },
              followUp: { type: Type.STRING },
              confirmBooking: { type: Type.STRING },
              requestReview: { type: Type.STRING },
            },
            required: ["firstResponse", "sendPackage", "askDetails", "closeSale", "followUp", "confirmBooking", "requestReview"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err) {
      console.error("Chat Reply Generation Error:", err);
    }
  }

  // Thai Fallback
  const pName = photographerProfile?.name || "ช่างภาพ";
  return res.json({
    firstResponse: `สวัสดีครับคุณ ${name || "ลูกค้า"} ยินดีต้อนรับมากๆ เลยครับ 🙏📸 ผม ${pName} ดีใจมากๆ ที่สนใจงานถ่ายภาพของผมครับ สำหรับงาน ${jobType || "ถ่ายภาพ"} ยินดีให้คำแนะนำปรึกษาฟรีน้า เบื้องต้นคุณ ${name} มีวันที่ตั้งเป้าไว้ หรือชอบโทนอารมณ์แนวไหนบ้างไหมครับ แชตคุยกันชิลๆ ได้เลยนะครับน้า 😊✨`,
    sendPackage: `สำหรับแพ็กเกจยอดฮิตในการถ่ายภาพ ${jobType || "ถ่ายภาพ"} ของเราจะมีรายละเอียดดังนี้ครับคุณ ${name} 💼✨\n\n📌 แพ็กเกจสุดคุ้มเริ่มต้นที่เพียง ${photographerProfile?.startingPrice || "มิตรภาพ"} บาทเท่านั้นครับ!\n- ได้จำนวนรูปปรับแสงแต่งสีโทนละมุนไม่อั้น\n- ส่งรูปตัวอย่างด่วนภายใน 24 ชม. แรก\n- พร้อมไฟล์ความละเอียดสูง High-Res ทุกรูป ผ่านคลาวด์ดาวน์โหลดง่าย\n- สอนจัดโพสไกด์ท่าทางให้เป็นธรรมชาติ ตลอดทริปไม่เกร็งแน่นอนครับ\n\nเบื้องต้นมีแพ็กเกจตัวนี้ที่ลูกค้าจองเยอะที่สุด สะดวกพิจารณาเป็นตัวนี้หรืออยากปรับเปลี่ยนจำนวนชั่วโมงได้เลยนะครับ ยินดีปรับยืดหยุ่นให้เสมอเลยครับ! ❤️📸`,
    askDetails: `เพื่อที่ผมจะได้เตรียมไอเดีย วางแผนแสงเงา และเสนอจุดที่ดีที่สุดให้คุณ ${name} รบกวนขอทราบข้อมูลเพิ่มเติมสักนิดนึงนะคร้าบน้า 📸👀\n\n- สถานที่ถ่ายภาพในใจคร่าวๆ (เช่น สตูดิโอ สวนสาธารณะ หรือนอกรอบที่ไหนดีครับ)\n- จำนวนผู้ร่วมถ่ายด้วยในทริปนี้ประมาณกี่คนเอ่ย\n- สไตล์ภาพแนวโทนละมุนอบอุ่น หรือสตรีทเท่ๆ ฟิล์มวินเทจที่ชื่นชอบเป็นพิเศษครับ\n\nยินดีไปช่วยดูแลเต็มที่เลยครับ! ✨`,
    closeSale: `คุณ ${name} ครับ เบื้องต้นคิวถ่ายวันที่ ${date || "ที่คุณเลือก"} ยังว่างอยู่นะคร้าบ แต่ช่วงนี้คิวเข้าค่อนข้างไวมากเลย 🗓️ด่วน\n\nถ้าคุณ ${name} คอนเฟิร์มจองรอบนี้ ผมยินดีล็อกคิวพิเศษไว้ให้เลย พร้อมสิทธิ์แถมฟรีภาพขนาดพิเศษตกแต่งสวยงามเพิ่มให้อีก 5 รูปสุดพิเศษด้วยครับ!\n\nมาสร้างความทรงจำสวยๆ ไปด้วยกันนะครับน้า สนใจล็อกวันมัดจำจองคิวทักหาผมได้เลยน้าค้าบ ยินดีดูแลคุณ ${name} อย่างดีที่สุดเลยครับ ❤️📸`,
    followUp: `สวัสดีครับคุณ ${name} ช่างภาพทักมาหาเบาๆ น้า 😊✨ พอดีอยากแวะมาสอบถามเผื่อติดขัดตรงไหน หรือต้องการข้อมูลเกี่ยวกับแพ็กเกจ ${jobType || "ถ่ายภาพ"} เพิ่มเติมแจ้งผมได้เลยนะครับน้า\n\nหากงบประมาณหรือจำนวนชั่วโมงยังไม่ลงตัว ยินดีมาช่วยพูดคุยปรับปรุง ยืดหยุ่นให้เหมาะสมกับคุณ ${name} ได้เลยนะครับ ยินดีให้บริการมากๆ เผื่อคิวช่วงนั้นใกล้เต็ม จะได้ไม่พลาดโอกาสเก็บรูปสวยๆ กันครับคราบบบ 🙏`,
    confirmBooking: `🎉📸 คอนเฟิร์มการจองคิวสำเร็จครับคุณ ${name}!\n\nได้รับยอดเงินมัดจำเรียบร้อยแล้วนะครับ ล็อกคิวถ่าย ${jobType || "ถ่ายภาพ"} สไตล์โทน ${photographerProfile?.style || "ธรรมชาติ"} ให้เรียบร้อยในตารางงานแล้วคร้าบน้า\n\n📅 วันที่นัดหมาย: ${date || "ตามนัดหมาย"}\n📍 สถานที่: ${location || "ตามตกลง"}\n\n💡 คำแนะนำเบื้องต้น: คืนก่อนวันถ่ายรบกวนคุณ ${name} พักผ่อนให้เต็มอิ่ม ทานน้ำเยอะๆ และเตรียมเสื้อผ้าตามที่เราวางแผนกันไว้ได้เลยครับน้า ระหว่างถ่ายลุยสนุกเต็มที่ ไม่ต้องกังวลเรื่องโพสท่า ผมไกด์ดูแลเต็มที่ตลอดงานครับ!\n\nขอบพระคุณมากๆ ที่ไว้วางใจให้ผมได้เก็บภาพความทรงจำนะครับ แล้วเจอกันวันงานคร้าบ! 😊🙏❤️`,
    requestReview: `สวัสดีครับคุณ ${name} หวังว่ารูปชุด ${jobType || "ถ่ายภาพ"} ที่ผมเพิ่งส่งมอบไป จะสร้างความสุขและรอยยิ้มให้กับคุณ ${name} และครอบครัวนะคร้าบ 😊📸\n\nหากคุณ ${name} ชื่นชอบในผลงานและการบริการของผม รบกวนกดรีวิวสั้นๆ หรือติชมเพื่อเป็นพลังกำลังใจ และฝากแชร์โพสต์รีวิวรูปสวยๆ ในโซเชียลเพื่อเป็นกำลังใจให้ช่างภาพด้วยนะคร้าบบบ\n\nทุกคอมเมนต์ติชมมีความหมายกับผมมาก ขอบพระคุณมากๆ เลยนะครับน้า ไว้มีโอกาสรอบหน้ายินดีรับใช้และถ่ายรูปใหม่อีกเสมอเลยครับ! 🙏❤️📸`
  });
});

// 7. Review & Portfolio Caption Generator
app.post("/api/generate-captions", async (req, res) => {
  const { customerName, jobType, location, toneStyle, notes } = req.body;

  const prompt = getCaptionGeneratorPrompt(
    jobType || "ถ่ายรูปบุคคล/โปรไฟล์",
    notes || "ลูกค้าโพสท่าไม่ค่อยเป็น ช่างภาพเลยชวนเล่นสนุกๆ ตลกๆ จนได้รูปยิ้มธรรมชาติมากๆ",
    toneStyle || "ฟิล์มเกาหลี สว่าง ละมุน ธรรมชาติ",
    `พิกัด: ${location || "คาเฟ่ยอดฮิต"} | ลูกค้าชื่อ: ${customerName || "ลูกค้าแสนดี"}`
  );

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reviewCaption: { type: Type.STRING },
              thankYouMessage: { type: Type.STRING },
              requestReview: { type: Type.STRING },
              portfolioCaption: { type: Type.STRING },
              albumCaption: { type: Type.STRING },
              singlePhotoCaption: { type: Type.STRING },
              beforeAfterCaption: { type: Type.STRING },
            },
            required: ["reviewCaption", "thankYouMessage", "requestReview", "portfolioCaption", "albumCaption", "singlePhotoCaption", "beforeAfterCaption"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Caption Generation Error:", err);
    }
  }

  // Thai Fallback
  return res.json({
    reviewCaption: `📸✨ “รอยยิ้มที่จริงใจที่สุด คือรอยยิ้มที่ไม่ต้องปรุงแต่ง...”\n\nวันนี้มีโอกาสไปเก็บภาพงาน ${jobType || "ถ่ายภาพ บุคคล"} ให้กับคุณ ${customerName || "ลูกค้า"} ในพิกัด ${location || "คาเฟ่ลับ"} ขอบอกว่าเป็นคิวงานที่หัวเราะกันเกือบตลอดทริปเลยคร้าบ 😆 น้องบอกโพสท่าไม่เก่ง เกร็งง่าย แต่พอบอกสูตรให้เล่นตลกๆ ผลลัพธ์ที่ได้ออกมาคือธรรมชาติ อบอุ่น แฟลตแสงสีโทน ${toneStyle || "ละมุนธรรมชาติ"} สุดจึ้งงง!\n\nขอบพระคุณคุณ ${customerName || "ลูกค้า"} มากๆ เลยนะครับที่ให้ใจและเหนื่อยสู้กล้องไปด้วยกัน แวะชมความน่ารักกันเต็มๆ ได้เลยน้าค้าบ ❤️✨ #ช่างภาพ #สไตล์${toneStyle || "ธรรมชาติ"}`,
    thankYouMessage: `ขอบพระคุณคุณ ${customerName || "ลูกค้า"} สำหรับทริปถ่ายภาพ ${jobType || "ถ่ายภาพ"} วันนี้มากๆ เลยนะคร้าบน้า 🙏✨ สนุกเป็นกันเองมากๆ เลย ตัวแบบตั้งใจและน่ารักสุดๆ เดี๋ยวด่วนส่งพรีวิวภาพไฮไลท์สวยๆ ไปให้ชมภายในคืนนี้เลยนะครับ ส่วนรูปเซ็ตเต็มจะรีบขัดเกลาแต่งแสงสีสไตล์โทนละมุนให้อย่างไวที่สุดเลยครับ ได้เหนื่อยพักผ่อนมากๆ นะครับ แล้วพบกันใหม่ครับคราบบบ 🥰📸`,
    requestReview: `คุณ ${customerName || "ลูกค้า"} ครับน้า ช่างภาพแวะมาส่งความสุขเบาๆ นะคร้าบ 😊 หากได้รับไฟล์รูปครบเรียบร้อยแล้ว ถูกอกถูกใจสไตล์ภาพและการทำงานของผม รบกวนเวลาสัก 1 นาทีกดรีวิวเป็นกำลังใจ หรือแชร์ภาพสวยๆ แท็กมาหาเพจช่างภาพด้วยน้าค้าบ ยินดีรับฟังคำติชมเพื่อเอาไปพัฒนาฝีมือให้ดียิ่งขึ้นคราบบบ ขอบคุณมากๆ เลยนะคร้าบผม! ❤️✨`,
    portfolioCaption: `🎞️📸 [Visual Portfolio Style] 📸🎞️\n\n“The camera is an instrument that teaches people how to see without a camera.”\n\nความงดงามของการจัดวางสายตา แสงธรรมชาติยามเย็น และสไตล์ภาพโทน ${toneStyle || "ฟิล์มเกาหลีอบอุ่น"} ที่ตั้งใจสร้างสรรค์อย่างประณีตสำหรับสัปดาห์นี้ ทักทายสอบถามคิวถ่ายภาพได้เสมอครับน้า ✨`,
    albumCaption: `🎞️✨ [Full Story Showcase Album] 📸✨\n\nปักหมุดความน่ารักเต็มสิบไม่หัก! อัลบั้มเต็มรวมเซ็ตภาพถ่าย ${jobType || "บุคคล"} ณ พิกัด ${location || "สตูดิโอเก๋ๆ"} คุมโทนอุ่นใจด้วยโทนสีสไตล์ ${toneStyle || "ธรรมชาติละมุน"} ทุกรูปบอกเล่าสตอรี่ความประทับใจและความเป็นตัวเองได้อย่างชัดเจน\n\nชมภาพทั้งหมดและจับจองคิวว่างของคุณได้ที่แชตเพจเลยนะครับน้า พร้อมไกด์ท่าทางตลอดทริปเหมือนเคย 😊👇`,
    singlePhotoCaption: `✨📸 “The Masterpiece Moment” 📸✨\n\nวินาทีที่แสงตกกระทบหน้าเลนส์และจังหวะรอยยิ้มธรรมชาติของตัวแบบส่องสว่างที่สุด โทนสีและองค์ประกอบแบบพรีเมียม สไตล์รูปที่ใช่ในแบบที่เป็นตัวเอง จองทริปทัก inbox เลยครับ! 🔥`,
    beforeAfterCaption: `🎨🎞️ [The Power of Retouching & Color Grading] 🎞️🎨\n\nพามาดูความแตกต่างระหว่างไฟล์ RAW ดิบ และไฟล์ภาพที่แต่งเสร็จสมบูรณ์สไตล์โทน ${toneStyle || "พรีเมียมเกาหลี"}\n\nเราใส่ใจแต่งรูปภาพให้อย่างพิถีพิถัน ดึงความสดใส แก้ไขโทนสีเพื่อชูโมเมนต์สำคัญให้ทรงเสน่ห์ที่สุด เพราะเราเชื่อว่าทุกรูปถ่ายคือทรัพย์สินแห่งความทรงจำที่มีค่าของคุณครับ 💖📸`
  });
});

// 8. Package Comparison & Upsell Builder
app.post("/api/compare-packages", async (req, res) => {
  const { packages, photographerProfile } = req.body;

  if (!packages || !Array.isArray(packages) || packages.length < 2) {
    return res.status(400).json({ error: "โปรดเลือกแพ็กเกจอย่างน้อย 2 แพ็กเกจเพื่อเปรียบเทียบ" });
  }

  const pName = photographerProfile?.name || "ช่างภาพ";
  const pStyle = photographerProfile?.style || "ธรรมชาติ";

  const prompt = `กรุณาวิเคราะห์และเปรียบเทียบแพ็กเกจบริการถ่ายภาพต่อไปนี้เพื่อช่วยช่างภาพปิดการขายและจูงใจลูกค้าให้อัปเกรดเป็นแพ็กเกจที่แพงกว่า (Upsell) ด้วยหลักจิตวิทยาการบริการและการนำเสนอคุณค่าอารมณ์:
ข้อมูลช่างภาพ:
- ชื่อร้าน/แบรนด์: ${pName}
- สไตล์งาน: ${pStyle}

รายชื่อแพ็กเกจที่ต้องการเปรียบเทียบ:
${packages.map((p, idx) => `แพ็กเกจที่ ${idx + 1}:
- ชื่อ: ${p.name}
- ราคา: ${p.price} บาท
- เวลาให้บริการ: ${p.hours} ชั่วโมง
- ส่งมอบภาพ: ${p.photosDelivered || "ไม่ระบุ"}
- สถานที่: ${p.location || "ไม่ระบุ"}
- สิ่งที่รวม: ${p.inclusions || "ไม่ระบุ"}`).join("\n\n")}

กรุณาส่งกลับเป็น JSON ตาม Schema ดังนี้:
1. comparisonGrid: รายการสิ่งอำนวยความสะดวกและความพิเศษที่แตกต่างอย่างเห็นได้ชัดระหว่างแต่ละแพ็กเกจ (อาทิ ปรับแสงสี, ถ่ายช่วงแสงเย็น Golden Hour, ความรีบเร่ง/ความเหนื่อย, จำนวนรูปภาพที่ปรับโทนเพิ่มขึ้น) เพื่อช่วยลูกค้าพิจารณาได้ง่าย (ส่งเป็น array ของสายอักขระ 3-5 ข้อ)
2. valueProposition: คำอธิบายคุณประโยชน์และเหตุผลทางจิตวิทยาเชิงอารมณ์ว่าทำไมลูกค้าถึงคุ้มค่าที่สุดหากขยับมาใช้แพ็กเกจที่พรีเมียมกว่า (Emotion & Value-based explanation)
3. upsellScript: ข้อความบทพูด/บทพิมพ์ปิดแชตปิดการขาย (Upsell Chat Script) สำหรับส่งให้ลูกค้าที่สนใจแพ็กเกจราคาเริ่มต้น เพื่อจูงใจสลายความกังวลและแนะนำให้อัปเกรดอย่างนุ่มนวล เป็นมิตร และดูสุภาพช่วยเหลือเต็มที่
4. objectionResponses: ประโยคสั้นๆ ตอบประเด็นคำถามว่า 'ทำไมราคาของสองแพ็กเกจนี้ถึงต่างกันเยอะคะ' เพื่อชี้แจงความคุ้มค่าระดับพรีเมียม`;

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              comparisonGrid: { type: Type.ARRAY, items: { type: Type.STRING } },
              valueProposition: { type: Type.STRING },
              upsellScript: { type: Type.STRING },
              objectionResponses: { type: Type.STRING },
            },
            required: ["comparisonGrid", "valueProposition", "upsellScript", "objectionResponses"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Compare Packages Error:", err);
    }
  }

  // Thai Fallback
  const pkg1 = packages[0];
  const pkg2 = packages[1];
  return res.json({
    comparisonGrid: [
      `⏰ เวลาถ่ายภาพจุใจเพิ่มขึ้น: แพ็กเกจ "${pkg2.name}" ให้ชั่วโมงถ่ายยาวนานกว่า ช่วยให้ไม่เร่งรีบ มีเวลาเปลี่ยนชุดและหามุมแสงสวยๆ มากขึ้น`,
      `🎨 จำนวนรูปที่คัดสรรและแต่งสีพรีเมียมแบบจัดเต็มมากกว่า ส่งมอบผลงานที่ประณีตกว่าอย่างเห็นได้ชัด`,
      `✨ ได้รับของแถมและการดูแลพิเศษ เช่น ส่งรูปไฮไลท์พรีวิวไวภายใน 24 ชม. และคำไกด์มุมกล้องพิเศษเฉพาะบุคคล`
    ],
    valueProposition: `การเลือกระดับบริการที่ขยับขึ้นมาอีกนิด จะช่วยให้คุณได้รับโมเมนต์ความอบอุ่นที่สมบูรณ์แบบที่สุด ไม่ต้องกังวลเรื่องเวลาที่จำกัดจนเกินไป ช่างภาพสามารถเก็บบรรยากาศแบบเผลอๆ ธรรมชาติ และช่วงแสงสวยของวัน (Golden Hour) ได้ครบถ้วน ซึ่งเป็นคุณค่าทางความทรงจำที่จะคงอยู่ตลอดไป`,
    upsellScript: `ยินดีต้อนรับครับคุณลูกค้า 😊📸 สำหรับแพ็กเกจเริ่มต้น "${pkg1.name}" ราคา ${pkg1.price}.- นั้นดีมากๆ เลยครับ แต่ถ้าอยากได้รูปคุมโทนที่สวยสมบูรณ์แบบรอบด้านจริงๆ ช่างภาพขอแนะนำแพ็กเกจซิกเนเจอร์ยอดฮิตตัวนี้เลยครับน้า คือ "${pkg2.name}" ราคาเพียง ${pkg2.price}.- เท่านั้นครับ!\n\nสิ่งที่เพิ่มขึ้นมาบอกเลยว่าคุ้มฝีมือมากๆ ครับน้า:\n✅ ได้เวลาถ่ายเพิ่มขึ้นเต็มอิ่ม ทำให้เรามีจังหวะถ่ายสบายๆ ไม่เหนื่อยเกร็ง ช่างภาพหามุมบิดหามุมสวยได้เต็มที่\n✅ คัดสรรแต่งแสงสีโทนเกาหลีละมุนให้แบบพิเศษเพิ่มขึ้นจุใจ\n✅ การันตีส่งภาพรีวิวพอร์ตโฟลิโอตัวอย่างไวที่สุดใน 24 ชม. เพื่อเอาไปลงอวดเพื่อนได้ทันทีเลยครับ\n\nจ่ายเพิ่มอีกเพียงนิดเดียวแต่ได้รับความสบายใจและความทรงจำที่สมบูรณ์แบบที่สุดเลยครับน้า สะดวกพิจารณาเป็นตัวนี้เพื่อล็อกสิทธิ์คิวถ่ายช่วงเวลาแสงสวยๆ ไว้เลยดีไหมครับผม? 🥰👇`,
    objectionResponses: `“สาเหตุที่แพ็กเกจ "${pkg2.name}" มีความคุ้มค่าสูงกว่าเนื่องจากช่างภาพได้เพิ่มเวลาให้บริการอย่างประณีต มีกระบวนการขัดเกลาภาพปรับสีแบบจุใจเพิ่มขึ้นเท่าตัว พร้อมรับประกันสิทธิพิเศษบริการส่งงานไฮไลต์ไวเพื่อลงสตอรี่ได้ทันทีหน้างาน ซึ่งเหมาะมากสำหรับลูกค้าที่ต้องการความประณีตสูงสุดและอยากได้รูปภาพโมเมนต์ที่ละเอียดอ่อนเก็บไว้ตลอดไปครับน้า”`
  });
});

// 9. AI Objection Handling Generator
app.post("/api/handle-objection", async (req, res) => {
  const { objectionType, clientName, jobType, price, photographerProfile } = req.body;

  const pName = photographerProfile?.name || "ช่างภาพ";
  const pStyle = photographerProfile?.style || "ธรรมชาติ";

  const prompt = getObjectionHandlingPrompt(
    clientName || "ลูกค้า",
    jobType || "ถ่ายภาพ",
    price || "ราคาทั่วไป",
    pStyle,
    objectionType || "expensive"
  );

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              empathicGreeting: { type: Type.STRING },
              coreExplanation: { type: Type.STRING },
              valueCompensation: { type: Type.STRING },
              callToAction: { type: Type.STRING },
              fullReplyMessage: { type: Type.STRING },
            },
            required: ["empathicGreeting", "coreExplanation", "valueCompensation", "callToAction", "fullReplyMessage"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Handle Objection Error:", err);
    }
  }

  // Thai Fallbacks based on objectionType
  let fallback = {
    empathicGreeting: "",
    coreExplanation: "",
    valueCompensation: "",
    callToAction: "",
    fullReplyMessage: ""
  };

  if (objectionType === "expensive") {
    fallback = {
      empathicGreeting: `เข้าใจและขอบคุณสำหรับฟีดแบ็กเรื่องงบประมาณมากๆ เลยครับคุณ ${clientName || "ลูกค้า"} การตัดสินใจเรื่องค่าใช้จ่ายของวันสำคัญเป็นสิ่งที่เราใส่ใจมากๆ ครับ`,
      coreExplanation: `ที่อัตราบริการราคา ${price || "นี้"} ช่างภาพอยากเรียนชี้แจงด้วยความจริงใจน้าว่า เราดูแลตั้งแต่การคัดสรรสถานที่ การจัดทิศทางแสงเงาเฉพาะตัว และการปรับแสงสีแต่งรูปอย่างพิถีพิถันทุกชิ้นงาน เพื่อให้แน่ใจว่าคุณ ${clientName || "ลูกค้า"} จะได้เซ็ตภาพแห่งความสุขที่ดูละมุน สะท้อนตัวตนเป็นธรรมชาติ และกลับมามองดูได้กี่ครั้งก็มีรอยยิ้มอุ่นใจตลอดไปครับ`,
      valueCompensation: `เพื่อช่วยเหลือเรื่องความคุ้มค่าสูงสุด หากจองมัดจำล็อกสิทธิ์รอบนี้ ช่างภาพยินดีแถมภาพแต่งแสงสีพิเศษสำหรับนำไปอัดกรอบเพิ่มให้อีก 5 ภาพฟรีทันทีเลยคราบบบ`,
      callToAction: `เบื้องต้นสนใจรับสิทธิ์ของแถมพิเศษนี้ไปล็อกคิวตารางว่างในสัปดาห์นี้ไว้ก่อนดีไหมครับน้า? 😊👇`,
      fullReplyMessage: `เข้าใจและขอบคุณสำหรับฟีดแบ็กเรื่องงบประมาณมากๆ เลยครับคุณ ${clientName || "ลูกค้า"} ยินดีและใส่ใจเป็นที่สุดเลยครับน้า 😊\n\nสำหรับอัตราบริการราคา ${price || "เริ่มต้น"} ช่างภาพอยากเรียนชี้แจงด้วยความจริงใจเลยครับว่า งานบริการนี้ครอบคลุมความละเอียดอ่อนและความประณีตสูงสุดคราบบบ:\n✔️ ช่างภาพคอยช่วยจัดเตรียมสอนไกด์ท่าทางเผลอละมุนตลอดงาน ไม่ต้องกังวลเรื่องเกร็งหน้ากล้องเลยครับ\n✔️ ขั้นตอนการปรับแต่งดึงสีและแสงอารมณ์สไตล์คุมโทน ${pStyle} ที่ใส่ใจทุกความคมชัด\n✔️ การส่งรูปที่รวดเร็ว มั่นใจได้ว่าได้รับความทรงจำที่คุ้มค่าไม่ตกหล่น\n\nเพื่อช่วยเหลือและทดแทนเรื่องความคุ้มค่ารอบนี้ ช่างภาพยินดีมอบสิทธิประโยชน์แถมฟรีภาพปรับสีเพิ่มพิเศษ 5 ใบสำหรับอัดทำพอร์ตขนาดพรีเมียมให้ฟรีเลยครับน้าคราบบบ!\n\nเบื้องต้นสะดวกรับโควต้าของแถมนี้เพื่อล็อกวันดีๆ สัปดาห์นี้ไว้เลยดีไหมครับผม? ยินดีดูแลคุณ ${clientName || "ลูกค้า"} สุดฝีมือเลยครับ ❤️📸`
    };
  } else if (objectionType === "raw_files") {
    fallback = {
      empathicGreeting: `เข้าใจความต้องการที่อยากได้รูปถ่ายครบถ้วนเก็บไว้มากๆ เลยครับคุณ ${clientName || "ลูกค้า"} สำหรับช่างภาพแล้ว ทุกจังหวะกดชัดเตอร์สำคัญจริงครับ`,
      coreExplanation: `ช่างภาพขอเรียนชี้แจงอย่างเป็นกันเองและจริงใจน้าว่า ไฟล์รูปดิบ (RAW) จะยังเปรียบเสมือนอาหารดิบที่ยังไม่ได้ผ่านการปรุงแต่งครับ มาตรฐานของร้านช่างภาพมืออาชีพจึงเน้นการปรุงสุกอย่างละเอียดอ่อน คือการคัดกรองจัดโทนแสงสีสไตล์ละมุนอุ่นใจให้เสร็จสมบูรณ์ร้อยเปอร์เซ็นต์ เพื่อเป็นการรักษาคุณภาพและชื่อเสียงของแบรนด์ รวมถึงมอบไฟล์ที่พร้อมแชร์ลงโซเชียลได้สวยเป๊ะสะกดสายตาที่สุดให้คุณ ${clientName || "ลูกค้า"} ครับ`,
      valueCompensation: `แต่หากคุณ ${clientName || "ลูกค้า"} มีความจำเป็นต้องการใช้นำไปใช้งานเพิ่ม ช่างภาพยินดีมอบสิทธิ์เปิดคลังรูปคัดเลือกปรับเพิ่มรูปที่ชอบให้อีก 20 รูปเป็นกรณีพิเศษเลยครับคราบบบ`,
      callToAction: `สะดวกดีลตัวนี้เพื่อยืนยันคิวพิเศษช่วงสุดสัปดาห์นี้ไว้เลยดีไหมครับน้า? 🥰👇`,
      fullReplyMessage: `เข้าใจความต้องการที่อยากเก็บทุกๆ มุมไว้ดูเล่นมากๆ เลยครับคุณ ${clientName || "ลูกค้า"} 😊📸\n\nแต่ช่างภาพขออธิบายด้วยความจริงใจและถ่อมตนเลยน้าว่า สำหรับไฟล์ดิบ (RAW) นั้นเปรียบเสมือนเมนูอาหารที่ยังไม่ได้ปรุงสุกครับ ทางเพจเราต้องการส่งมอบสิ่งที่ดีที่สุดและสมบูรณ์แบบที่สุดที่ปรับโทน คุมสไตล์แสงเงาละมุน ${pStyle} เรียบร้อยแล้วเท่านั้น เพื่อให้สมกับที่คุณ ${clientName || "ลูกค้า"} มอบความไว้วางใจให้ช่างภาพดูแลความทรงจำสำคัญครั้งนี้ครับ ✨\n\nแต่เพื่อความประทับใจของทุกคน ช่างภาพยินดีปรับเพิ่มจำนวนรูปคัดสรรแต่งแสงสีให้เพิ่มอีก 20 รูปเต็มๆ รวมในแพ็กเกจเดิมไปเลยคราบบบ เพื่อให้ได้ครบทุกมุมน่าเอ็นดูแน่นอนครับ!\n\nรับรองว่าเปิดดูรูปสุกหอมละมุนพร้อมส่งลงเฟสแล้วจะแฮปปี้สุดใจแน่นอนครับน้า สนใจรับข้อเสนอเพิ่มรูปพิเศษเพื่อล็อกคิววันนี้เลยดีไหมครับน้า? ❤️👇`
    };
  } else {
    fallback = {
      empathicGreeting: `เข้าใจในสถานการณ์ความจำเป็นกะทันหันของคุณ ${clientName || "ลูกค้า"} มากๆ เลยครับ เรื่องดินฟ้าอากาศหรือเหตุจำเป็นย่อมเกิดขึ้นได้ครับ`,
      coreExplanation: `เนื่องจากตารางงานคิวถ่ายของช่างภาพค่อนข้างจำกัดและมีการล็อกวันล่วงหน้าเพื่อเตรียมพร้อมอุปกรณ์และค่าเสียโอกาสสำหรับทีมงาน อย่างไรก็ตามช่างภาพยินดีบริการดูแลช่วยประนีประนอมตามเงื่อนไขยืดหยุ่นเป็นกันเองสุดฝีมือครับ`,
      valueCompensation: `ทางเพจเราขอมอบเงื่อนไขให้คุณ ${clientName || "ลูกค้า"} สามารถเลื่อนสิทธิ์จองคิวฟรี 1 ครั้งภายในระยะเวลา 6 เดือน โดยใช้ยอดมัดจำเดิมได้ทั้งหมดเพื่อความสบายใจสูงสุดครับน้า`,
      callToAction: `เบื้องต้นสะดวกมองหาวันคิวว่างวันใหม่ในช่วงเดือนหน้าร่วมกันเลยดีไหมครับผม? ยินดีประสานงานคิวว่างให้ทันทีเลยครับคราบบบ 🙏`,
      fullReplyMessage: `สวัสดีครับคุณ ${clientName || "ลูกค้า"} เข้าใจและเห็นใจในสถานการณ์เหตุจำเป็นกะทันหันรอบนี้มากๆ เลยครับน้า สบายใจได้ครับเราคุยกันเป็นกันเองได้เสมอ 😊📸\n\nเนื่องจากการจองวันถ่ายช่างภาพจะมีการล็อกคิวปิดตารางเพื่อเตรียมความพร้อมร้อยเปอร์เซ็นต์ อย่างไรก็ดีเพื่อดูแลลูกค้าคนสำคัญ ช่างภาพยินดีเสนอทางออกอะลุ่มอล่วยยืดหยุ่นให้สูงสุดดังนี้ครับ:\n✔️ ยินดีให้เลื่อนสิทธิ์คิวจองไปใช้วันใหม่ได้ฟรี 1 ครั้ง ภายในระยะเวลา 6 เดือนเต็มล่วงหน้า\n✔️ สามารถรักษายอดเงินจองมัดจำเดิมไว้หักลบได้เต็มจำนวน ไม่ริบยอดจองแน่นอนครับเพื่อความอุ่นใจ\n\nช่างภาพอยากให้คุณ ${clientName || "ลูกค้า"} สบายใจและแฮปปี้ที่สุดครับ เบื้องต้นเราแวะมาดูตารางคิวว่างรอบถัดไปในช่วงสัปดาห์หน้าหรือเดือนหน้าด้วยกันก่อนดีไหมครับน้า? ทักแชทล็อกวันใหม่คุยสบายๆ ได้เลยคราบบบ 🙏❤️`
    };
  }

  return res.json(fallback);
});

// 10. AI Content Repurposing Tool
app.post("/api/repurpose-post", async (req, res) => {
  const { originalPost, targetChannel, photographerProfile } = req.body;

  if (!originalPost) {
    return res.status(400).json({ error: "โปรดระบุเนื้อหาคอนเทนต์ต้นฉบับเพื่อแปลงรูปแบบ" });
  }

  const pName = photographerProfile?.name || "ช่างภาพ";
  const pStyle = photographerProfile?.style || "ธรรมชาติ";

  const prompt = getRepurposingPrompt(originalPost, targetChannel, pName, pStyle);

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              repurposedContent: { type: Type.STRING },
              hookStrategy: { type: Type.STRING },
              formattingTips: { type: Type.STRING },
            },
            required: ["repurposedContent", "hookStrategy", "formattingTips"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Repurpose Post Error:", err);
    }
  }

  // Thai Fallback
  let rep = "";
  let hook = "";
  let tips = "";

  if (targetChannel.includes("Reels")) {
    rep = `🎬✨ [Reels Video Script: เบื้องหลังสร้างความสุข] ✨🎬\n\n📌 [On-Screen Text ดึงดูด]: "ความจริงเบื้องหลังภาพสวยลอยฟ้า.. สำหรับคนโพสท่าไม่เป็น! 📸"\n\n🎙️ [Voiceover พูดด้วยอารมณ์กันเอง]:\n"เบื่อไหมครับ? อยากได้รูปถ่ายสไตล์ละมุนๆ แต่พอยืนมองกล้องทีไร หัวใจสั่น เกร็งหน้าไปหมด! 😆 วันนี้ช่างภาพ ${pName} มีทริคง่ายๆ 3 ข้อมาโชว์ให้เห็นเบื้องหลังการสอนโพสท่าแบบปล่อยชิล เสริมมุมขาสวยตัวเพรียว คุยตลกคลายเครียดหน้ากล้องจนได้ภาพสวยเป๊ะเป็นธรรมชาติในเซ็ตล่าสุดนี้ครับ!"\n\n📌 [On-Screen Text]: "แนะมุมสวยละมุน สวยจบพร้อมลงโซเชียลทันที"\n\n🎙️ [Voiceover ปิดท้าย]:\n"ใครชอบประสบการณ์ถ่ายรูปแบบเป็นกันเอง ชิลๆ เหมือนไปเที่ยวกับเพื่อน ทักแชท Inbox มาจับจองคิวว่างเดือนนี้กันได้นะค้าบ เหลือ 2 ที่สุดท้ายน้า!"\n\n🎵 [แนะนำเพลงคู่ใจ]: ใช้เพลงจังหวะแจ๊สเกาหลี (Lo-Fi Acoustic Cute Beat) สดใส เบาๆ ชวนมองรูปเพลินๆ`;
    hook = `สะกดสายตาใน 3 วินาทีแรกด้วยข้อความ On-screen 'เบื้องหลังการถ่ายภาพคนโพสท่าไม่เก่ง' ซึ่งเป็นปัญหาใหญ่ที่คนทั่วไปกำลังเลื่อนหาช่างภาพกลัวอยู่ เพื่อดึงความฉงนใจอยากดูเฉลย`;
    tips = `ถ่ายวิดีโอคลิปสั้นเป็นมุมกว้าง (Behind the scenes) ที่ช่างภาพกำลังเล่นสนุก หัวเราะ ชี้แนะตัวแบบด้วยความเป็นกันเอง และสไลด์สลับกับผลงานภาพที่แต่งเสร็จประณีตเปรียบเทียบคาหน้าจอ`;
  } else if (targetChannel.includes("Story")) {
    rep = `📸✨ [Instagram & FB Story Visual Pitch] ✨📸\n\n“รอยยิ้มอารมณ์ธรรมชาติเต็มสิบ.. ทิปง่ายๆ สไตล์ช่างภาพที่เป็นกันเองสุดใจ! 🥰”\n\n🔥 คิวถ่ายว่างรอบสัปดาห์นี้หลุดจอง 1 วันสุดท้ายเท่านั้น!\n👉 ทักด่วนลดค่าบริการล็อกวันแถมฟรีภาพเพิ่มทันที\n\n📩 [สติกเกอร์ DM ชวนคุย]: 'อยากมีรูปสวยสะกดใจทักพิมพ์ 1 ด่วนคราบบบ!'`;
    hook = `สาดด้วยข้อเสนอ 'คิวว่างหลุดจองด่วน' และกระตุ้นความรีบเร่งพร้อมปุ่มสติกเกอร์ตอบโต้อย่างรวดเร็ว (Low friction) เพื่อเปลี่ยนยอดรับชมมาเป็นแชตคุยจริงในทันที`;
    tips = `เลือกรูปเดี่ยวพอร์ตเทรตมุมปังที่สุดที่แสงตกไล่ขอบแก้ม (Rim light) สวยสมบูรณ์ ใส่ฟิลเตอร์เม็ดฝุ่นเกรนเบาๆ ในสตอรี่ชวนให้สะดุดตาชวนดึงดูดสายตา`;
  } else {
    rep = `สวัสดีชาวกลุ่มคนรักภาพถ่ายทุกคนครับ 🙏📸\n\nผม ${pName} ฝากตัวด้วยคนคร้าบ วันนี้พกผลงานสไตล์ ${pStyle} ละมุนๆ คัดสรรใบโปรดล่าสุดมาฝากทุกคนในพิกัดเด็ดๆ ครับ 😊\n\nสำหรับบ่าวสาว เพื่อนๆ น้องๆ ท่านใดที่วางแผนเตรียมตารางเก็บโมเมนต์สำคัญ ไม่ว่าจะโปรไฟล์ แฟชั่น หรือพรีเวดดิ้ง แวะเยี่ยมชมพอร์ตและพูดคุยปรึกษาพิกัด/เสื้อผ้าฟรีได้เลยน้า ช่างภาพเป็นกันเอง อารมณ์ดี ตลก และใจเย็นมากๆ ครับ!\n\n📌 พิกัดพร้อมลุย: ยินดีเดินทางดูแลทั่วประเทศครับ\n💸 งบเบาๆ เป็นกันเอง เจรจาจับคู่แพ็กเกจราคาพรีเมียมตัวจริงได้เสมอคราบบบ\n\nสนใจล็อกคิว ทัก Inbox แชทเฟสคุยถามตารางได้เลยครับ ยินดีบริการน้าค้าบผม ❤️👇`;
    hook = `เน้นการสร้างปฏิสัมพันธ์แบบถ่อมตน นึกถึงการฝากตัวและให้ความประทับใจเป็นหลัก เพื่อเลี่ยงความรู้สึกที่ผู้ใช้งานกลุ่มกลุ่มช่างภาพจะต้านโพสต์สแปมขายเกินเหตุ`;
    tips = `โพสต์รูปเด็ดที่สุด 1 รูปพรีเมียมเป็นปกนำ แล้วประกบคลิปเบื้องหลังสั้นๆ หรือรูปภาพชุดย่อยอีก 3-4 ใบเป็นเลย์เอาต์ช่องสี่เหลี่ยมเด็ดๆ ชวนคลิกเปิดดูรูปขยายเต็มสเกล`;
  }

  return res.json({
    repurposedContent: rep,
    hookStrategy: hook,
    formattingTips: tips
  });
});

// 11. AI Target Audience Persona Generator
app.post("/api/generate-personas", async (req, res) => {
  const { jobType, style, startingPrice, serviceArea, photographerProfile } = req.body;

  const pName = photographerProfile?.name || "ช่างภาพ";
  const pStyle = style || photographerProfile?.style || "ธรรมชาติ";
  const pPrice = startingPrice || photographerProfile?.startingPrice || "3,500";
  const pArea = serviceArea || photographerProfile?.serviceArea || "กรุงเทพฯ";

  const prompt = `คุณคือผู้เชี่ยวชาญการตลาดดิจิทัลและจิตวิทยาการขายขั้นสูงสำหรับช่างภาพเมืองไทย
กรุณาสร้างอวาตารกลุ่มเป้าหมาย (Ideal Customer Persona) จำนวน 3 บุคลิกภาพที่แตกต่างกันอย่างละเอียดและเฉียบคม โดยอ้างอิงจากข้อมูลต่อไปนี้:
- ประเภทบริการของช่างภาพ: ${jobType}
- สไตล์คุมโทนรูปภาพ: ${pStyle}
- พิกัดพื้นที่รับงาน: ${pArea}
- อัตราค่าบริการเริ่มต้น: ${pPrice} บาท
- แบรนด์ของช่างภาพ: ${pName}

กรุณาวิเคราะห์และตอบกลับในรูปแบบ JSON ตาม Schema นี้:
{
  "personas": [
    {
      "name": "ชื่ออวาตารสมมติภาษาไทยที่สะท้อนคาแร็กเตอร์ชัดเจน (เช่น 'น้องไอซ์ - บัณฑิตจบใหม่สายติสท์')",
      "demographics": "ข้อมูลประชากรศาสตร์สั้นๆ (อายุ, เพศ, การศึกษา/อาชีพ, พฤติกรรมโซเชียลหลัก)",
      "deepDesire": "ความต้องการลึกๆ ทางจิตวิทยาหรือเบื้องหลังภาพในฝันที่พวกเขาอยากได้ แสงและโทนที่ถูกชะตา",
      "mainObjection": "ข้อกังวลลึกๆ หรือเหตุผลที่จะทำให้เขาปัดโพสต์ทิ้งหรือไม่ตัดสินใจจอง (เช่น กลัวช่างภาพดุ, กังวลราคา)",
      "triggerWords": "คำทองคำหรือประโยคสะกิดใจ 3 คำที่หากได้ยินจะตัดสินใจทักคุยทันที",
      "upsellScript": "สคริปต์เสนอขายปิดแชตอัปเซลล์เฉพาะบุคคลนี้ด้วยภาษาสุภาพแต่อ่อนโยนเป็นกันเองสไตล์ช่างภาพแสนดี"
    }
  ]
}

กรุณาสร้าง Persona ที่ใช้งานได้จริง และเป็นภาษาไทยที่เรียบง่ายเป็นธรรมชาติ`;

  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    demographics: { type: Type.STRING },
                    deepDesire: { type: Type.STRING },
                    mainObjection: { type: Type.STRING },
                    triggerWords: { type: Type.STRING },
                    upsellScript: { type: Type.STRING },
                  },
                  required: ["name", "demographics", "deepDesire", "mainObjection", "triggerWords", "upsellScript"],
                }
              }
            },
            required: ["personas"],
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (err: any) {
      console.error("Generate Personas Error:", err);
    }
  }

  // High-fidelity Thai fallback personas based on inputs
  const fallbackPersonas = [
    {
      name: "น้องมายด์ - บัณฑิตวัยรุ่นสายคอนเทนต์ไอจี (IG Story Creator)",
      demographics: "เพศหญิง, อายุ 21-23 ปี, นักศึกษาพึ่งจบใหม่ในเขต " + pArea + " ที่ใช้งาน Instagram ตลอดเวลา",
      deepDesire: "อยากมีเซ็ตภาพถ่ายนอกรอบที่คุมโทนสไตล์ " + pStyle + " ถ่ายทอดความน่ารักสดใสและเป็นธรรมชาติโดยไม่มีตึกหรือองค์ประกอบอื่นรบกวนฉากหลัง อยากได้รูปรีวิวส่งด่วนใน 24 ชั่วโมงแรกเอาไปอัปสปอยเพื่อนร่วมรุ่น",
      mainObjection: "กลัวช่างภาพดุ อารมณ์เสีย หรือบังคับให้โพสท่าที่ยากๆ แปลกๆ จนอึดอัด กังวลเรื่องการส่งงานช้าข้ามเดือน",
      triggerWords: "เน้นสอนโพสท่าแบบปล่อยชิล, เป็นกันเองตลกเหมือนมาเที่ยวกับเพื่อน, การันตีส่งรูปแต่งสีไวใน 3 วัน",
      upsellScript: `สวัสดีครับน้องมายด์ค้าบ 😊 ยินดีแสดงความยินดีกับความสำเร็จล่วงหน้าเลยน้า สำหรับน้องมายด์ที่อยากได้รูปสไตล์ ${pStyle} ละมุนๆ ไปแต่งไอจีสวยๆ พี่แนะเซ็ตโปรเด็ดมินิมอลตัวนี้เลยน้า พี่จะแถมลูกโป่งพาสเทลและเครื่องพ่นฟองสบู่เป็นพร็อพเสริมอารมณ์ความละมุนให้ฟรี และพิเศษสุดๆ พี่ดูแลแต่งเนียนสเปเชียลผิวเนียนลบริ้วรอยจุดด่างดำพร้อมแต่งทรงให้อีก 15 รูปไปเลยครับน้า แถมการันตีส่งไฮไลต์ความทรงจำใน 12 ชั่วโมงแรกทันอัปลง Reels สนุกสนานแน่นอนคราบบบ!`
    },
    {
      name: "คุณกอล์ฟ & คุณอาย - คู่รักหมั้นหมายสร้างอนาคต (Premium Wedding Seekers)",
      demographics: "คู่รักเพศชาย/หญิง, อายุ 26-32 ปี, พนักงานบริษัทและข้าราชการวัยทำงานที่อยากมีพรีเวดดิ้งคุณภาพสูง",
      deepDesire: "ต้องการบันทึกแววตา ความใส่ใจ และโมเมนต์โรแมนติกที่อบอุ่นเหนือกาลเวลา ถ่ายทอดด้วยสไตล์ " + pStyle + " เรียบหรูคลาสสิก",
      mainObjection: "คิดว่าราคาเริ่มต้น " + pPrice + " บาทของเพจเรายังสูงกว่าตลาดย่อยบางเจ้า และกังวลว่าช่างภาพไม่มีกล้องหรือไฟสำรองจนทำให้หากเกิดอุบัติเหตุทางเทคโนโลยีรูปจะสูญหาย",
      triggerWords: "มีกล้องสำรองและคลังแฟลชพร้อมทุกชุด, จัดแต่งไฟดึงมิติดูแพง, สอนเทคนิคไกด์คู่โพสท่ากอดอุ่นเป็นธรรมชาติ",
      upsellScript: `ขอแสดงความยินดีในวาระมงคลล่วงหน้าเลยนะครับคุณกอล์ฟคุณอาย 😊📸 สำหรับพิธีแต่งงานสำคัญพรีเมียม พี่ขอเสนอแนะขยับขึ้นมาดูแพ็กเกจ 'Cinematic Grand Full Day' ครับน้า นอกเหนือจากช่างภาพหลัก 2 คนช่วยระดมเก็บทั้งมุมพิธีหมั้นด้านหน้าและมุมสวมแหวนเจาะลึกด้านหลังแล้ว เราพกเซ็ตไฟสตูแฟลชสตูดิโอและกล้องเซนเซอร์สำรองทุกตัว เพื่อป้องกันความเสี่ยง และแต่งผิวรีทัชให้อลังการสะกดใจผู้เข้าร่วมงานแน่นอนครับน้า!`
    },
    {
      name: "พี่นก - เจ้าของร้านขนมหวานสไตล์โมเดิร์น (Cafe & Small Business Owner)",
      demographics: "เพศหญิง, อายุ 28-42 ปี, เจ้าของร้านอาหารหรือคาเฟ่ในพื้นที่ " + pArea + " ที่ต้องการโฆษณาเชิงพาณิชย์",
      deepDesire: "ต้องการให้ภาพผลงานถ่ายทอดรายละเอียดสีสันสไตลิ่งดึงเท็กซ์เจอร์ของขนมให้ออกมาฉ่ำชวนกิน ดันยอดไลก์และยอดสั่งอาหาร Lineman ทะยานขึ้น 3 เท่า",
      mainObjection: "กลัวทีมช่างภาพนำพาอุปกรณ์เกะกะรบกวนลูกค้าที่กำลังนั่งดื่มกาแฟในร้าน หรือกังวลว่าช่างภาพจะจัดพร็อพส่องแสงไม่เป็นศิลปะ",
      triggerWords: "บริการพกไฟสตูขนาดมินิแต่ทรงพลัง, จัดวางพร็อพอาหารฟรีโดยฟู้ดสไตลิสต์, มอบลิขสิทธิ์ภาพใช้โฆษณาพาณิชย์ตลอดชีพ",
      upsellScript: `สวัสดีครับพี่นกดีกรีร้านอร่อยของจังหวัดเรา 😊 ช่างภาพยินดีช่วยอัปยอดขายสุดพลังเลยคราบบบ สำหรับขนมปังอบชีสฉ่ำวาวของพี่นก พี่แนะนำแพ็กเกจ 'Commercial Food Premium' ครับน้า เราจะมีสไตลิสต์จัดทิศทางแสงเงาแบบสตูดิโอโมเดิร์นช่วยประดับผลไม้และจานไม้วินเทจให้ภาพดูดึงดูดน่ากิน ดันความหิวพุ่งพรวด และพี่ขอมอบสิทธิ์ลิขสิทธิ์แท้เชิงพาณิชย์ให้พี่นกนำไปขึ้นป้ายใหญ่หรือสื่อสิ่งพิมพ์โปรโมตร้านได้ตลอดชีพอย่างไร้ขอบเขตเลยครับ คุ้มแสนคุ้มแน่นอนคราบบบ!`
    }
  ];

  return res.json({ personas: fallbackPersonas });
});

// Start Server with Vite Middleware
const startAppServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Photo Client Hunter AI running on port ${PORT}`);
  });
};

startAppServer();
