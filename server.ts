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
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
}) : null;

const SYSTEM_INSTRUCTION = getSystemInstruction();

// Helper to handle AI requests safely
async function generateAIResponse(prompt: string, schema: any, fallback: any) {
  if (isRealAi && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.error("Gemini API Error, using fallback:", err);
    }
  }
  return fallback;
}

// 1. Target Market Analyzer
app.post("/api/analyze-target", async (req, res) => {
  const { jobType, area, startingPrice, strengths, style, desiredClients } = req.body;
  if (!jobType) return res.status(400).json({ error: "โปรดระบุประเภทงานถ่ายภาพ" });

  const prompt = getTargetAnalyzerPrompt(jobType, area, startingPrice, strengths, style, desiredClients);
  const schema = {
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
  };

  const fallback = {
    targetGroups: [
      `กลุ่มลูกค้างาน ${jobType} คุณภาพพรีเมียม โซน ${area || "ทั่วไป"}`,
      `กลุ่มคนรักภาพถ่ายโทน ${style || "พาสเทลเกาหลี/ธรรมชาติ"} คอนเซ็ปต์สดใส`,
      `วัยรุ่นและคนทำงานที่อยากได้รูปโปรไฟล์สวยสะกดสายตาไว้ลงโซเชียล`
    ],
    painPoints: [
      "กังวลว่าโพสท่าไม่เป็น ถ่ายรูปออกมาเด๋อ เขินกล้องเกร็งหนักมาก",
      "กลัวช่างภาพดุ เหวี่ยง อารมณ์บูดหน้างาน ทำให้บรรยากาศอึดอัด",
      "กังวลเรื่องงานส่งรูปช้า ได้รูปไม่ตรงสเปก มู้ดโทนไม่ได้"
    ],
    wordsToUse: [
      `"ช่างภาพใจดีมาก ดูแลใกล้ชิด สอนกอดก้าวหมุนจัดท่าให้ตลอดทริป"`,
      `"แต่งผิวเนียนคุมโทนสวยพาสเทล ${style || "ละมุน"} สวยเสร็จพร้อมลงฟีด"`,
      `"การันตีส่งพรีวิวรูปรีวิวไฮไลท์ทันใจภายใน 24 ชั่วโมงคร้าบ"`
    ],
    wordsToAvoid: [
      `"มัดจำแล้วไม่มีนโยบายคืนเงินเด็ดขาด"`,
      `"ค่าบริการเน็ตๆ งดต่อราคา"`,
      `"ไม่รวมค่าเดินทางและพร็อพจัดฉากอื่นๆ"`
    ],
    channels: [
      `Facebook Group พื้นที่ ${area || "ใกล้เคียง"} เน้นโชว์ผลงานน่าเชื่อถือ`,
      "Instagram / Reels คอนเทนต์วิดีโอสั้นสตอรี่เบื้องหลังความสนุก",
      "Facebook แฟนเพจหลัก รีวิวผลงานและสเปเชียลโปรโมชั่นเร่งปิดยอดจอง"
    ],
    contentStyles: [
      `แชร์พอร์ตเต็มของงาน ${jobType} พร้อมเล่าเบื้องหลังความประทับใจลูกค้า`,
      "ภาพเปรียบเทียบ Before vs After การเกรดสีผิวผิวเนียนละออละมุนตา",
      "คลิปสั้น Reels ยอดฮิตเผยทริกโพสท่าคนเขินกล้องให้ธรรมชาติดูแพง"
    ],
    engagementTriggers: [
      "แถมเซ็ตฟรีกระดาษการ์ดลายเซ็นหรือพรีเซตสีพิเศษสำหรับผู้คอมเมนต์",
      "สร้างโปรโควตาจำกัดคิวว่างด่วนสัปดาห์ละ 2 สิทธิ์กระตุ้นทักแชตเดือด",
      "ตั้งคำถามเลือกแนวโทนสีรูปที่ชอบที่สุดแจกส่วนลดมิตรภาพ"
    ]
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 2. Persona Generator
app.post("/api/generate-personas", async (req, res) => {
  const { jobType, style, startingPrice, serviceArea, photographerProfile } = req.body;
  const pName = photographerProfile?.name || "ช่างภาพแสนดี";
  const prompt = getPersonaPrompt(jobType || "ถ่ายภาพบุคคล", style || "ธรรมชาติ", serviceArea || "ทั่วไทย", startingPrice || "3,500", pName);
  const schema = {
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
            upsellScript: { type: Type.STRING }
          },
          required: ["name", "demographics", "deepDesire", "mainObjection", "triggerWords", "upsellScript"]
        }
      }
    },
    required: ["personas"]
  };

  const fallback = {
    personas: [
      {
        name: "น้องเมย์ - ว่าที่บัณฑิตจบใหม่สายโซเชียลด่วนลงสตอรี่",
        demographics: "อายุ 21-23 ปี, ชอบแชร์ Reels และ TikTok คลั่งไคล้โทนเกาหลีละมุน",
        deepDesire: `รูปเดี่ยวพอร์ตเทรตฉลองวันสำเร็จการศึกษา สไตล์ ${style || "ละมุน"} สวยโดดเด่นสะดุดตาเพื่อนฝูง`,
        mainObjection: "เกร็งหน้ากล้องสุดขีด กลัวรูปออกมาหน้าบึ้งโพสไม่เป๊ะ",
        triggerWords: "ช่วยจัดท่าเป๊ะปัง, ส่งพรีวิวไฮไลท์ด่วนใน 24 ชม., ตลกเป็นกันเองเป็นมิตร",
        upsellScript: `“ยินดีด้วยล่วงหน้าน้าคุณเมย์ 😊 สำหรับแพ็กเกจซิกเนเจอร์ยอดฮิต เราเพิ่มเวลาถ่ายภาพคูณสอง หามุมสลัวแสง Golden hour สวยสดชื่นพรีเมียม แถมฟรีรูปพัดปริ้นท์แคนวาสใหญ่ไปกอดวันรับจริงด้วยครับ แนะนำตัวนี้คุ้มค่าที่สุดแน่นอนคร้าบ!”`
      },
      {
        name: "คุณบี - คุณแม่รุ่นใหม่สายอบอุ่นหัวใจโฮมมี่",
        demographics: "อายุ 31-37 ปี, พนักงานบริษัทหรือเจ้าของแบรนด์, มีลูกน้อยน่าเอ็นดู 1-2 คน",
        deepDesire: `บันทึกโมเมนต์ความน่ารักและอบอุ่นรอยยิ้มครอบครัว คุมแสงธรรมชาติสวยหรูย้อนดูประทับใจ`,
        mainObjection: "กลัวเด็กๆ งอแงหน้ากล้องจนภาพเด๋อ และหวั่นช่างภาพโมโหดุร้ายง่าย",
        triggerWords: "รักเด็กใจดีเป็นกันเอง, เน้นจับภาพทีเผลอธรรมชาติ, ชิวสบายไม่เร่งรีบ",
        upsellScript: `“ดีใจมากๆ ที่ทักมาน้าคุณบี ช่างภาพขอแนะนำเซ็ตอุ่นใจโฮมมี่เลยครับ เราจะใช้เวลาชิวๆ เล่นตลกละลายพฤติกรรมหนูๆ ได้เต็มที่ ไม่เร่งรีบ ได้รอยยิ้มเผลอสวยละมุนอุ่นใจครบครอบครัวคุ้มค่าที่สุดครับผม 🥰👇”`
      }
    ]
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 3. Post Generator
app.post("/api/generate-posts", async (req, res) => {
  const { jobType, area, startingPrice, strengths, style, photographerProfile } = req.body;
  const pName = photographerProfile?.name || "ช่างภาพแสนดี";
  const prompt = getPostGeneratorPrompt({
    jobType: jobType || "ถ่ายภาพบุคคล",
    area: area || "ทั่วไทย",
    price: startingPrice || "3,500",
    strengths: strengths || "ช่วยสอนจัดท่าโพส เป็นกันเอง อารมณ์ดีชวนคุย",
    style: style || "ธรรมชาติละมุน",
    photographerName: pName
  });

  const schema = {
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
  };

  const fallback = {
    personalFb: `📸✨ “รูปถ่ายที่ดีไม่ได้เก็บบันทึกแค่ใบหน้า แต่เก็บบันทึกช่วงความสุขและความอบอุ่นที่ย้อนกลับมาไม่ได้...”\n\nวันนี้มีผลงานถ่าย ${jobType || "ภาพเดี่ยวพอร์ตเทรต"} สไตล์โทน ${style || "เกาหลีละมุน"} สุดน่ารักมาอวดทุกคนครับ ทริปนี้หัวเราะสนุกเป็นกันเองสุดขีด 😊\n\nใครโพสท่าไม่ถูก โพสแล้วเกร็ง ไม่ต้องกังวลนะครับ ช่างภาพดูแลสอนจัดกอดก้าวหมุนละเอียดยิบ เสมือนมาเที่ยวเล่นเฮฮาแล้วมีรูปโปรไฟล์พรีเมียมกลับไปลงอินสตาแกรมสวยๆ!\n\n📍 พิกัดรับงาน: ${area || "ทุกพิกัดจัดเต็ม"}\n💸 ค่าบริการเริ่มต้นสบายใจ: ${startingPrice || "ราคากันเอง"}\n\nใครอยากได้เซ็ตภาพความทรงจำอุ่นๆ แบบนี้ ทัก inbox มาถามคิวคุยเล่นกันก่อนได้นะคร้าบบบ ช่างภาพยินดีบริการสุดฝีมือเลยคร้าบผม ❤️👇`,
    pageFb: `📢✨ [เปิดรับจองคิวถ่ายรูป] บริการถ่าย ${jobType || "ภาพพรีเมียม"} โดยช่างภาพแบรนด์ ${pName}\n\nให้ความทรงจำของคุณเฉิดฉายด้วยความคมชัด มู้ดแสงและสไตล์โทนสี ${style || "ละมุนพาสเทล"} เฉพาะตัวที่สว่างใสโดดเด่นสะท้อนอารมณ์เรียบหรูเป็นธรรมชาติ!\n\n🌟 ไฮไลท์ดีลพรีเมียม:\n✔️ ${strengths || "สอนจัดโพสท่าละเอียด เป็นกันเองอารมณ์ดี ไม่กดดัน"}\n✔️ คัดสรรปรับเกรดสีผิวผิวเนียนละเมียดละออทุกภาพ\n\n💼 ราคาแพ็กเกจเริ่มต้นเพียง ${startingPrice || "3,500"} บาทเท่านั้นคราบบบ\n\n*จองวันนี้ล็อกคิวรอบเวลาแสง Golden Hour อุ่นๆ ด่วน ทัก Inbox แชทเพจเพื่อรับสิทธิ์เลยคร้าบ!*`,
    groupFb: `สวัสดีครับฝากเนื้อฝากตัวด้วยคร้าบคุณแม่คุณน้า 🙏📸 ช่างภาพสไตล์ ${style || "อบอุ่นใจ"} ยินดีรับใช้บริการงานถ่าย ${jobType || "พอร์ตเทรต"} คร้าบผม เน้นคุยสบายๆ ไม่เร่งรีบ สนุกสนานเป็นมิตร\n\nเปิดโปรสเปเชียลอัตรามิตรภาพ เริ่มต้นเพียง ${startingPrice || "กันเอง"} บาทเท่านั้นคร้าบ!\n\n📷 ไฟล์แต่งสีแสงเกรดพาสเทลสวยงามจบพร้อมลงอวดเพื่่อน\n⚡ จัดส่งด่วนรีวิวไฮไลท์แรกสุดใน 24 ชม.\n\nสนใจส่องผลงานพอร์ตเพิ่มเติมและล็อกรอบวัน ทักอินบ็อกซ์คุยเล่นส่งมู้ดที่อยากได้มาคุยกันได้เลยคราบบบ ✉️👇`,
    reelsCaption: `เมื่อคุณบอกช่างภาพว่า "หนูเขินกล้องโพสไม่รอด แขนขากลัวเกร็งเก้งก้าง!" 🥺📸 สบายใจได้เลยคร้าบ ช่างภาพพกความเป็นกันเองเต็มพิกัด บิวท์อารมณ์หัวเราะสดใส สอนกอดก้าวหมุนทีเผลอแบบพริ้วไหวเป็นธรรมชาติสุดๆ 🥰✨\n\n#ช่างภาพใจดี #สอนจัดท่าโพส #โทนละมุน`,
    storyCaption: `📸 วันว่างถ่ายรูปยอดฮิตสัปดาห์นี้ใกล้เต็มโควตาแล้วน้าคร้าบ สนใจจองตารางทัก Inbox ด่วนเลยนะคร้าบผม 🥰👇`,
    hashtags: ["ช่างภาพ", `ถ่าย${jobType || "รูป"}`, style || "โทนพาสเทล", "สอนโพสท่า"],
    ctaMessage: "โควตาประณีตจำกัดรับสัปดาห์ละ 2 ท่านเท่านั้นน้า ทัก inbox ส่งความปรารถนาหาช่างภาพตอนนี้ได้เลยครับ!",
    interactiveQuestion: "ชอบภาพแนวสตリートเท่ๆ คูลๆ หรือแสงเย็นเกาหลีพาสเทลอุ่นใจมากกว่ากัน กดโหวตคอมเมนต์บอกกันน้า 👇✨"
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 4. Content Calendar Planner
app.post("/api/generate-calendar", async (req, res) => {
  const { jobType, style, startingPrice, serviceArea } = req.body;
  const prompt = getCalendarPrompt(jobType || "ถ่ายภาพบุคคล", style || "ธรรมชาติ", startingPrice || "3,500", serviceArea || "ทั่วไทย");
  const schema = {
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
            category: { type: Type.STRING },
            caption: { type: Type.STRING },
            imageSuggestion: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["day", "dayName", "topic", "purpose", "channel", "category", "caption", "imageSuggestion", "cta"]
        }
      }
    },
    required: ["calendar"]
  };

  const fallback = {
    calendar: [
      {
        day: 1,
        dayName: "วันจันทร์ - คอนเทนต์แชร์งานชิ้นโบว์แดง",
        topic: `เปิดตัวภาพเดี่ยวไฮไลท์สวยละมุนอุ่นใจ`,
        purpose: "นำเสนอฝีมือการจัดแสงเฉียบคมมัดใจ ดึงดูดความอยากรู้สไตล์สตอรี่ลิ่ง",
        channel: "Facebook Page + IG Grid",
        category: "ผลงานล่าสุด",
        caption: `🌈✨ “รอยยิ้มและโมเมนต์อุ่นๆ บันทึกในกล่องเวลาแสนวิเศษ...”\n\nสปอยผลงานถ่ายภาพสไตล์ ${style || "พาสเทลละมุน"} ยามบ่ายแสงส่องนุ่มๆ ผิวเรียบเนียนละเอียดน่าสัมผัส ลูกค้าแฮปปี้ช่างภาพก็ยิ้มแก้มปริ ทัก Inbox คุยเล่นไอเดียถ่ายภาพเดี่ยวได้ตลอดเวลาเลยค้าบผม 🥰🤍`,
        imageSuggestion: "รูปไฮไลท์ถ่ายแนวละลายหลัง 3-4 ภาพคัดโทนเดียวกันสวยเด่นสะกดตา",
        cta: "แวะเข้ามาชมรูปแล้วบอกมู้ดภาพแนวที่ถูกชะตาคุณกันน้าคร้าบ"
      },
      {
        day: 2,
        dayName: "วันอังคาร - คอนเทนต์วิดีโอเบื้องหลังฮาๆ",
        topic: "เบื้องหลังความสดใสช่วยแก้เขินอายฉลุย",
        purpose: "ละลายความกลัวเรื่องช่างภาพดุโหด แนะนำบุคลิกความสบายๆ เป็นมิตรวางใจได้",
        channel: "Reels / TikTok",
        category: "เบื้องหลัง",
        caption: "“เมื่อลูกค้าบ่นโพสไม่ไหว กลัวดูเกร็งกล้อง ช่างภาพจัดบทคุยตลกกระตุ้นต่อมฮาหัวเราะพริ้วธรรมชาติเฉยเลยคร้าบ!” 😆📸 บิวท์อารมณ์สดชื่นพร้อมภาพพรีเมียมกลับบ้านชิวๆ",
        imageSuggestion: "วิดีโอคลิปสั้นแนวตั้งความยาว 15 วิ เผยช่วงหลุดขำตลกเป็นกันเองหน้ากล้อง",
        cta: "ใครกลัวเขินกล้องรีบกดแชร์แชตเพจนี้ต้อนรับบริการแบบชิวผ่อนคลายเลยคราบบบ!"
      },
      {
        day: 3,
        dayName: "วันพุธ - สาระความรู้แก้ปวดตับ",
        topic: "เผยวิธีจัดท่าโพสฉลองรอยยิ้มฉบับคนเขินกล้อง",
        purpose: "สร้างความรู้ความเชี่ยวชาญ (Authority Expert) และช่วยเหลือละลายปมความกังวลใจของลูกค้ายอดฮิต",
        channel: "Facebook Page + IG Carousel",
        category: "สาระความรู้",
        caption: "💡📸 [แชร์ทริกคนพกความเขินระดับสิบ] โพสท่ายังไงไม่ให้ดูเด๋อด๋าแขนขาเกร็งกล้อง!\n\n1. เดินหันหลัง 45 องศาแล้วเอี้ยวตัวหน้ายิ้ม\n2. สองมือกำสร้อย หมวก แก้วกาแฟช่วยละลายความลนลาน\n3. หลับตาปัดฝุ่นจังหวะลึกๆ ยิ้มแป้นพริ้วไหวธรรมชาติสุดๆ คราบบบ!",
        imageSuggestion: "รูปคู่ออกแบบกราฟิกเปรียบเทียบ ท่ายืนตัวตรงเด๋อ VS ท่าหันข้างเก๋ไก๋น่ามอง",
        cta: "เซฟโพสต์ด่วนเพื่อไว้ซ้อมหน้ากระจกน้า หรือจองคิวไว้แล้วช่างภาพพร้อมคุมสอนสเต็ปจริงหน้างานเลยครับ!"
      }
    ]
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 5. Post Scoring Engine
app.post("/api/score-post", async (req, res) => {
  const { postText, targetGroup, channel, photographerProfile } = req.body;
  const prompt = getPostScoringPrompt(postText || "", targetGroup || "กลุ่มลูกค้าทั่วไป", photographerProfile?.style || "ธรรมชาติละมุน");
  const schema = {
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
          personalFbSuitability: { type: Type.INTEGER }
        },
        required: ["hook", "targetRelevance", "sellability", "credibility", "ctaClarity", "commentOpportunity", "personalFbSuitability"]
      },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
      ctaTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      upgradedVersion: { type: Type.STRING },
      psychologyNotes: { type: Type.STRING }
    },
    required: ["score", "criteria", "strengths", "improvements", "ctaTips", "upgradedVersion", "psychologyNotes"]
  };

  const fallback = {
    score: 80,
    criteria: { hook: 75, targetRelevance: 85, sellability: 78, credibility: 82, ctaClarity: 88, commentOpportunity: 70, personalFbSuitability: 82 },
    strengths: [
      "มีการระบุรายละเอียดขอบเขตการทำงาน พื้นที่ พิกัด และราคาชัดเจนสมบูรณ์",
      "มีอัธยาศัยไมตรีที่ดี มีการแทรกอีโมจิน่ารัก อบอุ่น เป็นกันเอง",
      "ชูจุดขายเรื่องสไตล์ภาพและสอนจัดท่าโพสได้ชัดเจนดีต่อใจ"
    ],
    improvements: [
      "ประโยคสะดุดตาคำแรกสุดยังจืดชืด 'รับถ่ายภาพ...' ดึงดูดสายตาคนอัปฟีดได้ค่อนข้างยาก",
      "ขาดเทคนิคการเร่งเร้าจำกัดเวลาโปรโมชันเพื่อเร่งการซื้อ (Scarcity Trigger)",
      "ขาดการโยนคำถามชวนให้คนกดคอมเมนต์เปิดปฏิสัมพันธ์ปลายเปิด"
    ],
    ctaTips: [
      "เสริมวลี: 'ทักข้อความขอดูตัวอย่างมู้ดพอร์ตเต็มไปประกบตัดสินใจก่อนได้คราบบบ ช่างภาพคุยตลกยินดีต้อนรับสุดๆ'",
      "แถมสิทธิ์ส่งไฮไลท์ไวในคืนแรกสุดด่วนเร้าใจ"
    ],
    upgradedVersion: `📸✨ “โพสไม่เก่ง เขินกล้อง กลัวถ่ายออกมาแล้วตัวเกร็ง... ปลดล็อกความกลัวหมดห่วงทันทีคร้าบ!” 🥰❤️\n\nเปิดจองตารางคิวบริการถ่ายรูปสวยละมุนพาสเทลระดับพรีเมียม สวยเป๊ะพร้อมลงโปรไฟล์ ช่างภาพแสนดีอารมณ์ร่วมสูง สนุกสนาน คอยบิดตัวแนะแนวจัดท่านิ้ว แขน ขาให้ทุกวินาที ชิวแฮปปี้ธรรมชาติ 100% คร้าบผม!\n\n💸 ราคาโปรเริ่มต้นเพียง 3,500.- บาทถ้วน\n⏱️ เวลาเต็มอิ่ม 4 ชั่วโมงจุใจ ถ่ายสนุกไม่มีเร่ง\n⚡ ส่งรูปพรีวิวรวดเร็วทันใจภายใน 24 ชม.\n\n🔒 คุมคุณภาพสูงสุดด้วยการจำกัดโควตาคิวถ่ายเพียง 2 สล็อตต่อสัปดาห์เท่านั้นน้า เพื่อเวลาประณีตแต่งโทนทีละใบคร้าบ\n\n📌 สนใจทักถามวันว่างแชต inbox แฟนเพจมาปรึกษาคอนเซ็ปต์คุยเล่นกันก่อนได้เลยนะคร้าบบบ ช่างภาพรอต้อนรับด้วยความใจดีคร้าบผม! ✉️👇`,
    psychologyNotes: "วิเคราะห์จิตวิทยาคำโฆษณา: การเปลี่ยนโฉมใหม่เน้นเปิดประโยคละลายปมความกังวลใจด่านแรก ทำให้ผู้ใช้รู้สึกอุ่นใจ เกิดความไว้วางใจ และกระตุ้นต่อมจำกัดโควตาเร่งการสอบถามทันควัน"
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 6. Intelligent Chat Lead Handler
app.post("/api/generate-chat-replies", async (req, res) => {
  const { name, jobType, budget, location, notes, status, photographerProfile } = req.body;
  const prompt = getChatReplyPrompt({
    clientName: name || "ลูกค้า",
    jobType: jobType || "ถ่ายภาพบุคคล",
    budget: budget || "งบปกติ",
    location: location || "กรุงเทพฯ",
    status: status || "ทักใหม่",
    notes: notes || "",
    photographerProfile: photographerProfile || { name: "ช่างภาพแสนดี", style: "ธรรมชาติละมุน", startingPrice: "3,500", jobTypes: ["ถ่ายภาพบุคคล"] },
    lastMessage: "สวัสดีครับ สนใจรายละเอียดราคาและวันว่างครับ"
  });

  const schema = {
    type: Type.OBJECT,
    properties: {
      firstResponse: { type: Type.STRING },
      sendPackage: { type: Type.STRING },
      askDetails: { type: Type.STRING },
      closeSale: { type: Type.STRING },
      followUp: { type: Type.STRING },
      confirmBooking: { type: Type.STRING },
      requestReview: { type: Type.STRING }
    },
    required: ["firstResponse", "sendPackage", "askDetails", "closeSale", "followUp", "confirmBooking", "requestReview"]
  };

  const client = name || "ลูกค้า";
  const job = jobType || "ถ่ายภาพบุคคล";
  const fallback = {
    firstResponse: `สวัสดีครับยินดีต้อนรับครับคุณ ${client} 🙏📸✨ ขอบพระคุณมากๆ เลยนะครับที่สนใจมู้ดพอร์ตสไตล์ภาพของเพจผม ยินดีให้คำแนะนำข้อมูลพิกัดคิวว่างเป็นกันเองสูงสุดเลยคร้าบผม สำหรับตารางเวลาถ่ายงาน ${job} ในดวงใจคุณ สามารถบอกเล่าให้ช่างภาพฟังก่อนได้น้าคราบบบ ❤️`,
    sendPackage: `สำหรับเรทแพ็กเกจพรีเมียมราคาโดนใจสุดคุ้มฝีมือคราบบบคุณ ${client} 💼✨\n\nเพียง 3,500.- บาทถ้วนเท่านั้นครับน้าคราบบบ\n⏱️ ถ่ายภาพจุใจเต็มอิ่ม 4 ชั่วโมง (แต่งแสงสีผิวเนียนคุมโทนพาสเทลละมุนทั้งหมดไม่จำกัดจำนวนใบ)\n🎁 พิเศษสุดๆ แถมสิทธิ์จัดส่งภาพพรีวิวไฮไลท์ไวสะใจใน 24 ชั่วโมงแรกทันทีครับ!\n\nช่างภาพดูแลคอยคุมแนะสอนจัดกอดก้าวหมุนโพสท่าให้ชิวๆ ตลอดเวลา ไม่ต้องหวั่นเกร็งหน้ากล้องเลยครับผม สนใจรับข้อเสนอนี้ทักแชตดีลได้ทันทีคร้าบ 🥰`,
    askDetails: `เพื่อผลลัพธ์รูปภาพมู้ดสวยวิจิตรและถูกอกถูกใจสูงสุดครับคุณ ${client} 😊📸\n\nช่างภาพแวะถามเพิ่มเติม มีแนวสไตล์ภาพโทนคุมสีเกาหลีแนวไหนที่รักเป็นพิเศษ หรือเล็งสถานที่เสื้อผ้าพร็อพจัดเต็มไว้บ้างแล้วหรือยังน้า? รวมถึงแว๊บแชร์จุดกังวลส่วนตัว เช่น กลัวตาหยี่ หรืออยากเน้นมุมหน้าฝั่งไหนพิเศษ บอกได้เลยนะครับ ช่างภาพจะได้ช่วยบิดมุมสวยเป๊ะสุดฝีมือคราบบบ! 🌸`,
    closeSale: `สิทธิ์รับของแถมข้อเสนอพิเศษสุดด่วนด่วนครับคุณ ${client}! 🔥⏰\n\nคิวถ่ายคุมโทนสวยสุดสัปดาห์นี้ว่างสล็อต "สุดท้าย สล็อตเดียว" แล้วนะคร้าบ หากมัดจำล็อกรอบวันนี้ ช่างภาพแถมฟรีเพิ่มโควตาสกรีนรูปปริ้นท์โพลารอยด์น่ารักกลับบ้าน 5 ใบไปสะสมความแฮปปี้เลยครับน้า สนใจล็อกสิทธิ์คอนเฟิร์มพิมพ์ตกลงกลับมาได้เลยค้าบผม 📩`,
    followUp: `แวะมาส่งมิตรภาพและเคาะรอยยิ้มครับคุณ ${client} 😊📸\n\nโควตาแถมสิทธิ์ส่งภาพพรีวิวพรีเมียมพิเศษด่วน 24 ชม. กำลังจะเต็มสิทธิ์รอบสอบถามสัปดาห์นี้น้า เกรงว่าจะพลาดสิทธิ์พิเศษวันถ่ายแสงงามไป หากคุณลูกค้าอยากให้ปรับเวลาหรือมีงบปรับแต่งอย่างไร มาคุยเล่นแชร์ดีลเป็นกันเองสบายกระเป๋ากันก่อนได้เสมอนะครับผม ยินดีต้อนรับมากๆ คราบบบ ❤️`,
    confirmBooking: `ยินดีดูแลต้อนรับเข้าสู่ช่วงบันทึกความทรงจำแสนสวยงามคร้าบคุณ ${client}! 🎉📸\n\nช่องทางโอนค่ามัดจำล็อกรอบจองสิทธิ์:\n🏦 ธนาคารกสิกรไทย (KBANK)\n💳 เลขที่บัญชี: 123-4-56789-0\n👤 ชื่อบัญชี: นายช่างภาพ แสนดีเป็นมิตร\n\n*ยอดโอนล็อกสิทธิ์เพียง 1,000.- บาท เพื่อล็อกคิวตารางว่างครับ โอนแล้วแชร์ใบสลิปแจ้งช่างภาพได้ทันที ยินดีดูแลสุดหัวใจเลยครับผม! 🙏💖`,
    requestReview: `ขอบพระคุณจากหัวใจสำหรับวันทริปสุดสนุกสนานตลกเฮฮานะคร้าบคุณ ${client} 🥰\n\nขณะนี้ไฟล์รูปแต่งสีเกรดพาสเทลประณีตเสร็จเสร็จสรรพเรียบร้อยแล้วน้า! หากประทับใจสไตล์ความสุขการดูแลของผม รบกวนกดให้คะแนนหรือแชร์เขียนสั้นรีวิวความประทับใจหน้าแฟนเพจสักนิดนะค้าบ เพื่อกำลังใจทีมงานสร้างรูปสวยต่อไปคราบบบ รักและนับถือเป็นครอบครัวเสมอคร้าบ! ❤️✨`
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 7. Objection Handling Master
app.post("/api/handle-objection", async (req, res) => {
  const { objectionType, clientName, jobType, price, photographerProfile } = req.body;
  const prompt = getObjectionHandlingPrompt(
    clientName || "ลูกค้า",
    jobType || "ถ่ายภาพบุคคล",
    price || "3,500",
    photographerProfile?.style || "ธรรมชาติอบอุ่น",
    objectionType || "expensive"
  );

  const schema = {
    type: Type.OBJECT,
    properties: {
      empathyAndGreeting: { type: Type.STRING },
      boundaryExplanation: { type: Type.STRING },
      valueOffer: { type: Type.STRING },
      cta: { type: Type.STRING },
      fullReplyMessage: { type: Type.STRING }
    },
    required: ["empathyAndGreeting", "boundaryExplanation", "valueOffer", "cta", "fullReplyMessage"]
  };

  const client = clientName || "ลูกค้า";
  const rate = price || "เรทมาตรฐาน";

  // Detailed custom fallbacks per objection type
  let empathyAndGreeting = `สวัสดีครับคุณ ${client} ช่างภาพยินดีไขข้อข้อกังวลและตอบถามด้วยความเป็นมิตรรู้สึกอบอุ่นใจที่สุดเลยนะครับน้า 😊`;
  let boundaryExplanation = `อัตราค่าจ้างเริ่มต้น ${rate} บาท เป็นเรทที่สะสมความใส่ใจประณีตสุดพลัง ตั้งแต่เวลาดูแล คุมจัดสอนจัดท่าเผลอ ตลอดจนการนั่งไล่ปรับเกรดแต่งสกินโทนแสงพาสเทลทีละรูปจนหน้าผ่องเนียนสวยสมจริง ไม่ออโต้ คุ้มค่าทางจิตใจเวลากลับมาย้อนดูภาพความทรงจำตลอดช่วง 10 ปีแน่นอนครับ`;
  let valueOffer = `พิเศษสำหรับคุณ ${client} ที่ถูกชะตาไอเดียมู้ดรูปผม ช่างภาพขอมอบของแถมสิทธิ์ส่งภาพพรีวิวตัวพรีวิวเซ็ตใหญ่ด่วนจี๋คืนแรกสุดฟิน เพื่อไปลงโชว์ฉลองความสุขก่อนใครเลยครับคราบบบ`;
  let cta = `คุณลูกค้าแวะสอบถามรอบคิวถ่ายช่วงแสงสวยเสาร์อาทิตย์นี้เพิ่มเติมคุยเล่นสบายๆ กันก่อนได้ตลอดเวลาเลยคร้าบผม 👇💖`;

  if (objectionType === "expensive") {
    empathyAndGreeting = `สวัสดีครับคุณ ${client} ช่างภาพเข้าใจเรื่องการจัดสรรงบประมาณความประหยัดใจมากๆ เลยน้าค้าบ ขอบคุณมากๆ ที่สนใจและสอบถามเข้ามาอย่างเปิดเผยแบบคนกันเองคราบบบ 😊`;
    boundaryExplanation = `สำหรับเรทราคา ${rate} บาทนี้ ช่างภาพเน้นความละเมียดละไมสูงสุดประณีตมากครับน้า เรามีบริการคอยช่วยไกด์บิวท์รอยยิ้มอารมณ์ คลายเกร็ง ช่วยดีไซน์มุมเป๊ะให้ และกระบวนการขัดเกลาภาพปรับหน้าใสสว่างนุ่มนวลทีละใบด้วยความรัก ไม่ใช่งานกดรัวสอยเทมเพลต เพื่อความประทับใจพรีเมียมลิมิเต็ดแท้จริงครับ`;
    valueOffer = `แต่เพราะถูกมู้ดเคสคุณมากๆ ช่างภาพยินดีแถมสิทธิ์พรีวิวด่วนพิเศษเซ็ตแรกสุดชิคให้รับชมพิจารณาคืนวันถ่ายทันควัน เพื่อเอาไปอัปสตอรี่ได้ก่อนหมดสิทธิ์โปรเลยค้าบผม`;
  } else if (objectionType === "raw_files") {
    empathyAndGreeting = `สวัสดีครับคุณ ${client} ยินดีอธิบายเรื่องนโยบายการดูแลความประณีตพอร์ตงานไฟล์ภาพดิบ (RAW) ด้วยความรักและเป็นมิตรสไตล์ช่างภาพคราบบบผม 😊`;
    boundaryExplanation = `ปกติไฟล์ดิบ RAW จะเป็นขนาดจักษุเทคโนโลยีสีเทาๆ ซีดๆ ที่ต้องการการรังสรรค์แสงและเกรดผิวเนียนประณีตให้ผุดผ่องสวยเสร็จสมบูรณ์ เปรียบสเปกวัตถุดิบอาหารที่ปรุงแต่งเสร็จสรรพให้อร่อยเหาะน่ามองที่สุดแบรนด์ช่างภาพเน้นจัดส่งผลงานคัดเฉพาะรูปที่แต่งสวยเป๊ะ 100% เพื่อรักษาความพรีเมียมหรูหราให้พอร์ตลูกค้ามั่นใจสูงสุดครับ`;
    valueOffer = `แต่หากคุณลูกค้าอยากได้รูปโมเมนต์เผลอตลกๆ เก็บสะสม ช่างภาพยินดีจัดคัดไฟล์คุมแสงสีเบื้องต้น JPEG สวยงามคัดแถมเพิ่มให้อีก 50 รูปจุใจกันเลยคราบบบน้า ดีต่อใจสุดๆ แน่นอนครับ`;
  } else if (objectionType === "weather") {
    empathyAndGreeting = `สวัสดีครับคุณ ${client} เรื่องฟ้าฝน สภาพฝนตกแดดแผดเผาเป็นเรื่องกังวลลึกๆ ของทุกคนเลยคราบบบ สบายใจหายห่วงได้เลยน้า ช่างภาพมีนโยบายรับมือให้ปลอดภัยแฮปปี้ที่สุดครับ 😊🌨️`;
    boundaryExplanation = `หากวันจองถ่ายจริงเกิดกรณีมรสุมฝนตกกระหน่ำพายุฟ้าปิดจริงๆ ช่างภาพมีมาตรฐานดูแลความปลอดภัยและสบายใจ โดยให้คุณลูกค้าเลือกเลื่อนขยับตารางวันถ่ายภาพออกไปได้ฟรี 1 ครั้งแบบไม่มีหักค่าธรรมเนียมใดๆ เพื่อมู้ดรอยยิ้มสดใสที่ดีที่สุดคร้าบ`;
    valueOffer = `แถมช่างภาพเตรียมพร็อพร่มญี่ปุ่นใสพรีเมียมไว้คู่ใจด้วยน้า เผลอๆ รูปเผลอเดินจับร่มกลางแสงปรอยสะท้อนมิตินุ่มๆ จะออกมาน่ารักสดใสอุ่นใจเหมือนหลุดมาในซีรีส์โรแมนติกชั้นเลิศเลยคร้าบผม!`;
  }

  const fullReplyMessage = `${empathyAndGreeting}\n\n${boundaryExplanation}\n\n${valueOffer}\n\n${cta}`;
  const fallbackResponse = { empathyAndGreeting, boundaryExplanation, valueOffer, cta, fullReplyMessage };

  const data = await generateAIResponse(prompt, schema, fallbackResponse);
  res.json({
    empathyAndGreeting: data.empathyAndGreeting || data.empathicGreeting || empathyAndGreeting,
    boundaryExplanation: data.boundaryExplanation || data.coreExplanation || boundaryExplanation,
    valueOffer: data.valueOffer || data.valueCompensation || valueOffer,
    cta: data.cta || data.callToAction || cta,
    fullReplyMessage: data.fullReplyMessage || fullReplyMessage
  });
});

// 8. Package Builder / Improver
app.post("/api/improve-package", async (req, res) => {
  const { name, price, hours, photosDelivered, inclusions, conditions } = req.body;
  const prompt = `ปรับแต่งแนะแพ็กเกจ: ชื่อ ${name || " Lite "}, ราคา ${price || "3,500"}, ถ่าย ${hours || "4"} ชม., รูป ${photosDelivered || "ไม่จำกัด"}, แถม ${inclusions || "ปรับผิวแสงนวล"}, เงื่อนไข ${conditions || "มัดจำ"}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      aiEnhancedText: { type: Type.STRING },
      aiPromoPost: { type: Type.STRING }
    },
    required: ["aiEnhancedText", "aiPromoPost"]
  };

  const pName = name || "แพ็กเกจพอร์ตละมุนใจ";
  const pPrice = price || "3,500";
  const pHours = hours || "4";
  const pPhotos = photosDelivered || "ไม่จำกัดจำนวนภาพคัดสรรแสงสวย";
  const pInclusions = inclusions || "ปรับผิวเรียบเนียนอุ่นใจโทนเกาหลีแถมพรีวิวด่วนใน 24 ชม.";
  const pConditions = conditions || "โอนจองมัดจำล็อกรอบชัวร์";

  const fallback = {
    aiEnhancedText: `✨📸 เติมเต็มช่วงเวลาสุดพิเศษกับแบรนด์ช่างภาพไทยแพ็กเกจ "${pName}" ✨\n\nเพียง ${pPrice}.- บาทเท่านั้น แต่ดูแลอบอุ่นประดุจครอบครัว:\n✅ ถ่ายรูปจุใจยาวนาน ${pHours} ชั่วโมงเต็มอิ่ม ช่างภาพใจเย็น ไม่เร่ง ไม่กดดัน\n✅ ผลงานส่งมอบ: ${pPhotos}\n✅ บริการพรีเมียมลิมิเต็ด: ${pInclusions}\n✅ ไกด์ท่าโพสอย่างเป็นกันเอง ตลกผ่อนคลายความเขินอาย 100%\n\n🔒 เงื่อนไขตกลงสบายใจ: ${pConditions}\n\n*แพ็กเกจนี้สรรสร้างมาเพื่อลูกค้าเขินกล้องโดยเฉพาะ รอยยิ้มธรรมชาติแฮปปี้ชัวร์คร้าบ 🥰📸`,
    aiPromoPost: `🔥📸 โค้งสุดท้ายโปรต้อนรับซีซั่นใหม่ จองคิวถ่ายโปรพรีเมียมแพ็กเกจ "${pName}"! 📸🔥\n\nใครบอกว่าคนเขินกล้องเกร็งตาจะไม่มีรูปสวยอัปลงโซเชียลสกินสวยหรูล่ะ? คิวถ่ายสุดประณีตจำกัดเพียง 2 สิทธิ์ต่อสัปดาห์เท่านั้นน้าเพื่อคุณภาพสูงสุด\n\n✨ สิทธิประโยชน์เต็มอิ่ม:\n⏱️ เวลาชิวหามุมแสงพริ้ว ${pHours} ชั่วโมงเต็มอิ่ม\n📷 คัดเกรดสีผิวพาสเทลเนียนใจ: ${pPhotos}\n🎁 พิเศษของแถมพรีวิวเร็วทันใจ: ${pInclusions}\n\n"รูปถ่ายที่มีมูลค่าไม่ใช่เพราะพิกเซลคมกริบ แต่เพราะรอยยิ้มที่คุณแฮปปี้พึ่งพาได้เวลานึกถึง.."\n\n💬 สนใจแชตปรึกษามู้ดคิวว่างจองล็อกสิทธิ์ ทัก Inbox เพจหาช่างภาพตอนนี้เลยคราบบบ ❤️`
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 9. Compare Packages Pricing
app.post("/api/compare-packages", async (req, res) => {
  const { packages: pkgs, photographerProfile } = req.body;
  const pkg1 = pkgs?.[0] || { name: "แพ็กเกจเริ่มต้น", price: "3,000" };
  const pkg2 = pkgs?.[1] || { name: "แพ็กเกจซิกเนเจอร์", price: "5,000" };

  const prompt = getPackageComparisonPrompt(pkg1, photographerProfile || { name: "ช่างภาพแสนดี", style: "ธรรมชาติละมุน", startingPrice: "3,500" });
  const schema = {
    type: Type.OBJECT,
    properties: {
      comparisonGrid: { type: Type.ARRAY, items: { type: Type.STRING } },
      valueProposition: { type: Type.STRING },
      upsellScript: { type: Type.STRING },
      objectionResponses: { type: Type.STRING }
    },
    required: ["comparisonGrid", "valueProposition", "upsellScript", "objectionResponses"]
  };

  const fallback = {
    comparisonGrid: [
      `⏰ เวลาถ่ายแฮปปี้จุใจคูณสอง: แพ็กเกจ "${pkg2.name}" ขยายเวลาถ่ายยาวชิวๆ ดึงมู้ดแสงเย็น Golden hour สบายไม่เหนื่อยหอบเกร็ง`,
      `🎨 ผิวพรรณแต่งประณีตระดับพรีเมียมพาสเทลแต่งละเอียดทีละรูปจำนวนรูปคัดสรรสวยจบจุใจกว่ามาก`,
      `✨ สิทธิ์ของแถมลิมิเต็ดบริการแชร์พรีวิวด่วนไฮไลท์ในคืนแรกเอาไปโพสต์สตอรี่ขิงเพื่อนๆ ได้ทันที`
    ],
    valueProposition: `การยอมขยับระดับสิทธิ์มาดีลพรีเมียม จะช่วยคุ้มครองความสุขความอบอุ่นใจอันแสนล้ำค่าของรอยยิ้มอย่างละเมียดละไมสูงสุด เพราะโมเมนต์สำคัญช่วงนี้มีเพียงครั้งเดียว การบริการประณีตจากช่างภาพมืออาชีพจะคงอยู่ให้คุณย้อนรอยดูอย่างภูมิใจไปชั่วกาลนาน`,
    upsellScript: `“ยินดีต้อนรับครับน้าคุณลูกค้า 😊 สำหรับแพ็กเกจตั้งต้น "${pkg1.name}" ราคา ${pkg1.price}.- ดีต่อใจมากๆ เลยน้า แต่ถ้าอยากได้มู้ดรอยยิ้มสวยฟินจัดเต็มแบบอุ่นใจสุดพลัง ช่างภาพแนะนำแพ็กเกจยอดฮิตซิกเนเจอร์ "${pkg2.name}" ราคาเพียง ${pkg2.price}.- ดีกว่ามากคราบบบ!\n\nเราจะได้ขยายเวลาถ่ายชิวๆ สบายหามุมปังไม่เร่งรีบ แถมรีทัชปรับสเกลเกรดสีผิวผิวเนียนละมุนละเอียดเพิ่มขึ้นจุใจ และส่งพรีวิวด่วนทันควันในคืนแรกให้ไปลงฟีดสตอรี่อวดเพื่อนๆ ได้เลยครับผม สะดวกพิจารณารับตัวพรีเมียมนี้ล็อกคิวรอบแสงสวยคุ้มฝีมือเลยดีไหมครับผม? 🥰👇”`,
    objectionResponses: `“สาเหตุที่แพ็กเกจ "${pkg2.name}" คุ้มค่าโดนใจกว่าเนื่องจากช่างภาพได้ทุ่มเทสเกลเวลาขัดเกลาภาพ ปรับผิวพรรณแต่งผิวหน้าเนียนและเกรดสกินโทนออทัมน์ด้วยมือละเอียดทีละใบ และของแถมการส่งพรีวิวไฮไลท์ภาพไวทันใจคืนแรกเพื่อแฮปปี้ลงอวดทันทีกิจกรรม เหมาะสมที่สุดสำหรับความประณีตลิมิเต็ดแท้จริงครับคุณลูกค้า”`
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 10. Content Repurposer
app.post("/api/repurpose-post", async (req, res) => {
  const { originalPost, targetChannel, photographerProfile } = req.body;
  const prompt = getRepurposingPrompt(originalPost || "", targetChannel || "Reels Script", photographerProfile?.name || "ช่างภาพแสนดี", photographerProfile?.style || "ธรรมชาติละมุน");
  const schema = {
    type: Type.OBJECT,
    properties: {
      repurposedContent: { type: Type.STRING },
      hookStrategy: { type: Type.STRING },
      formattingTips: { type: Type.STRING }
    },
    required: ["repurposedContent", "hookStrategy", "formattingTips"]
  };

  const fallback = {
    repurposedContent: `🎬✨ [บทพูดวิดีโอสั้น / แคปชั่น สำหรับช่องทาง: ${targetChannel || "Reels Script"}]\n\n“รู้ไหมครับว่า... รูปถ่ายทีเผลอที่อบอุ่นละมุนที่สุด มักจะเกิดขึ้นในวินาทีที่คุณไม่ได้มองเลนส์กล้องเลยน้า!” 🥰📸\n\n(สลับคัตวิดีโอสั้นตลกเบื้องหลัง สลับภาพพอร์ตสกินนุ่มหวานๆ)\n\nนี่คือเบื้องหลังความสุขและรอยยิ้มธรรมชาติของลูกค้าสัปดาห์นี้ครับ ช่างภาพแสนดีคอยบิ้วท์สอนท่าเก่งเป็นมิตรสุดๆ คลายความกลัวเขินกล้องได้เป็นสิบระดับเลย! ใครอยากได้เซ็ตพอร์ตฟิล์มเกาหลีสวยจับใจแบบนี้ ทักแชทคุยเช็กสิทธิ์รอบวันว่างด่วนก่อนคิวเต็มนะค้าบผม! ❤️👇\n\n#ช่างภาพเป็นกันเอง #สอนจัดท่าโพส #Reels`,
    hookStrategy: "ใช้เทคนิคคำเปิดหัวละลายกำแพงข้อกังวลลึกเรื่องคนกลัวเกร็งกล้อง เพื่อตะล่อมดึงสายตาคนปัดฟีดให้จ้องหยุดชมคลิปตั้งแต่ 3 วินาทีแรกสุด",
    formattingTips: "แนะนำให้ใช้คู่คลิปคุยเล่นหัวเราะสั้น 3 วินาทีแรกประกบคู่ภาพเซ็ตไฮไลท์ที่สวยที่สุดสลับเฟดไปมาอย่างรวดเร็ว ประกอบเพลงคลื่นบีตโลฟายฟิลกู๊ดนุ่มนวล"
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// 11. Custom Captions Generator
app.post("/api/generate-captions", async (req, res) => {
  const { customerName, jobType, location, toneStyle, notes } = req.body;
  const prompt = getCaptionGeneratorPrompt(jobType || "ถ่ายภาพบุคคล", notes || "เป็นกันเอง", customerName || "ลูกค้า", toneStyle || "ธรรมชาติละมุน");
  const schema = {
    type: Type.OBJECT,
    properties: {
      reviewCaption: { type: Type.STRING },
      thankYouMessage: { type: Type.STRING },
      requestReview: { type: Type.STRING },
      portfolioCaption: { type: Type.STRING },
      albumCaption: { type: Type.STRING },
      singlePhotoCaption: { type: Type.STRING },
      beforeAfterCaption: { type: Type.STRING }
    },
    required: ["reviewCaption", "thankYouMessage", "requestReview", "portfolioCaption", "albumCaption", "singlePhotoCaption", "beforeAfterCaption"]
  };

  const customer = customerName || "ลูกค้า";
  const job = jobType || "ถ่ายภาพบุคคล";
  const loc = location || "คาเฟ่ลับแสงเย็น";
  const tone = toneStyle || "พาสเทลเกาหลี";

  const fallback = {
    reviewCaption: `📸✨ “รอยยิ้มแสนอบอุ่นและธรรมชาติที่สุด ไม่ต้องอาศัยการจัดฉากปรุงแต่ง...”\n\nวันนี้พาทุกคนไปส่องผลงานถ่าย ${job} ร่วมกับคุณ ${customer} ณ ${loc} ขอบอกเลยว่าทริปนี้เต็มเปี่ยมไปด้วยความฮาเสียงหัวเราะตลอดเวลา น้องบอกเขินง่ายมากๆ โพสไม่ถูก แต่พอบอกเคล็ดลับสูตรลับเผลอกลับได้มู้ดแสงเงาโทน ${tone} สวยสั่นสะท้อนสะกดตาแก้มบุ๋มละลายใจเลยคร้าบ 😆🤍\n\nขอบพระคุณคุณ ${customer} มากๆ น้าครับที่เหนื่อยลุยสู้แดดสู้กล้องไปด้วยกัน แวะส่งความรักกดใจชมภาพเซ็ตน่ารักกันได้เต็มอิ่มคราบบบ! #ช่างภาพมืออาชีพ #สอนจัดท่าโพส #โทน${tone}`,
    thankYouMessage: `ขอบคุณคุณ ${customer} สำหรับทริปถ่ายภาพสนุกฟีลกู๊ดวันนี้น้าค้าบน้า 🙏✨ เป็นระเบียบเรียบร้อยสนุกเป็นกันเองสุดขีดเลย ตัวแบบน่าเอ็นดูสู้กล้องมากๆ เดี๋ยวช่างภาพด่วนส่งพรีวิวรูปรีวิวคัดสวยๆ ให้ส่องคืนนี้เลยนะครับ ส่วนงานรวมเซ็ตเต็มจะรีบขัดเกลาแสงพาสเทลสกินละมุนให้แบบละเมียดละไมส่งด่วนที่สุดครับ พักผ่อนรักษาสุขภาพมากๆ แล้วปัดหมุดพบกันใหม่ทริปหน้านะคร้าบบบ 🥰`,
    requestReview: `คุณ ${customer} ครับ ช่างภาพแวะมาส่งความสุขเบาๆ ยามค่ำคืนน้าคร้าบ 😊 หากอิมพอร์ตเช็กรับไฟล์รูปคัดคุมโทนเสร็จครบถ้วนเรียบร้อยแล้ว ถูกใจฝีมือการดูแลแนะนำของผม รบกวนเวลาอันมีค่าสักครึ่งนาทีกดปุ่มสกรีนเขียนสั้นรีวิวความประทับใจเป็นกำลังใจหน้าเพจช่างภาพด้วยน้าค้าบ จะยินดีนอบน้อมนับถือเป็นกำลังใจพัฒนาผลงานอย่างยิ่งยวดเลยคราบบบ ขอบคุณมากๆ เลยครับ! ❤️✨`,
    portfolioCaption: `🎞️📸 [Visual Portfolio Masterpiece] 📸🎞️\n\n“The camera captures what the heart feels, frozen in a split second of timeless warmth.”\n\nสุนทรียภาพแห่งทิศทางแสงเงา แววตาสื่อสารอารมณ์ และเกรดสีผิวเรียบเนียนสไตล์ ${tone} เผยแพร่ผลงานที่ประดิษฐ์ขึ้นอย่างพิถีพิถันให้ชื่นชมความสุขของศิลปะร่วมกันคราบบบ! ✨`,
    albumCaption: `📢✨ [เปิดพอร์ตผลงานอัลบั้มเต็ม] สตรีมภาพรอยยิ้มพรีเมียมจากทริปคุณ ${customer} ในพิกัดปักหมุด ${loc}\n\nเซ็ตพอร์ตชุดนี้ตั้งใจคัดขัดเกลาและปรับค่าคุมแสงสว่างนุ่มฟูสีหวานอบอุ่น เพื่อเก็บบันทึกรอยยิ้มความสวยของคุณให้ออกมามีมิติพรีเมียมที่สุด ค่อยๆ ปัดเลื่อนดูทีละใบแล้วกดไลก์บอกหน่อยน้าคร้าบว่าโดนใจใบไหนสูงสุด! 🥰👇`,
    singlePhotoCaption: `“ล็อกเวลาความอบอุ่นแสงยามบ่าย กับประกายสายตาที่สว่างไสว” 🌻☕✨ #สตอรี่สีละมุน #โทน${tone}`,
    beforeAfterCaption: `🎨👈 Left (Raw) vs Right (Upgraded Edit) 👉🎨\n\nเบื้องหลังความวิจิตรบรรจงในการแต่งเกรดสกินสีผิว ผิวเนียนผุดผ่องเรียบหรูทีละรูปด้วยใจ เพื่อให้มั่นใจได้ว่าลูกค้าที่รักของเพจเราจะได้ครอบครองเซ็ตพอร์ตฟิล์มเกาหลีที่งดงามคุ้มค่าหรูหราระดับสากลที่สุดคร้าบผม!`
  };

  const data = await generateAIResponse(prompt, schema, fallback);
  res.json(data);
});

// --- Facebook Hub & OAuth API Integrations ---

const FB_APP_ID = process.env.FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const isFbRealMode = !!FB_APP_ID && !!FB_APP_SECRET && FB_APP_ID.trim() !== "" && FB_APP_SECRET.trim() !== "";

// Facebook Config Endpoint
app.get("/api/facebook/config", (req, res) => {
  res.json({
    isRealMode: isFbRealMode,
    appId: FB_APP_ID || null
  });
});

// OAuth URL Generator
app.get("/api/auth/facebook/url", (req, res) => {
  const serverOrigin = process.env.APP_URL || req.get('origin') || `${req.protocol}://${req.get('host')}`;
  
  if (!isFbRealMode) {
    // Sandbox mode: Return simulation callback URL
    return res.json({
      url: `${serverOrigin}/api/auth/facebook/sandbox-callback`,
      isRealMode: false
    });
  }

  // Real Mode: Build official Facebook Graph OAuth login URL
  const redirectUri = `${serverOrigin}/api/auth/facebook/callback`;
  const fbOAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,publish_video`;
  
  res.json({
    url: fbOAuthUrl,
    isRealMode: true
  });
});

// Sandbox Simulator Interactive Login Callback Page
app.get("/api/auth/facebook/sandbox-callback", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="utf-8">
        <title>Facebook Login Sandbox Simulator</title>
        <style>
          body {
            background-color: #0d0e12;
            color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            width: 440px;
            padding: 24px;
            text-align: center;
          }
          .icon { font-size: 48px; margin-bottom: 12px; }
          .title { color: #3b82f6; font-size: 20px; font-weight: bold; margin-bottom: 8px; }
          .subtitle { color: #9ca3af; font-size: 13px; line-height: 1.5; margin-bottom: 20px; }
          .badge {
            background-color: rgba(245, 158, 11, 0.1);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.2);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 20px;
            display: inline-block;
          }
          .btn-primary {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
          }
          .btn-primary:hover { background-color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔬</div>
          <div class="title">Facebook Sandbox Simulator</div>
          <div class="badge">ระบบกำลังรันในโหมดจำลองสถานการณ์ทดสอบ</div>
          <div class="subtitle">คุณสามารถคลิกปุ่มด้านล่างเพื่อเชื่อมบัญชีแฟนเพจจำลองของแบรนด์ช่างภาพของคุณ ได้อย่างปลอดภัยทันทีโดยไม่ต้องตั้งค่าเครดิต API คีย์แต่อย่างใดคราบบบ</div>
          <button class="btn-primary" onclick="approveSandbox()">ดำเนินการต่อในฐานะ ช่างภาพแสนดี (Sandbox)</button>
        </div>
        <script>
          function approveSandbox() {
            if (window.opener) {
              window.opener.postMessage({
                type: "OAUTH_AUTH_SUCCESS",
                payload: {
                  accessToken: "sb_token_user_mock_99aa",
                  userName: "ช่างภาพซิกเนเจอร์ (Sandbox)",
                  isRealMode: false
                }
              }, "*");
              document.querySelector('.card').innerHTML = '<div style="padding: 20px;"><span style="font-size: 48px;">✅</span><h3 style="color: #10b981; margin-top: 15px;">เชื่อมต่อจำลองสิทธิ์สำเร็จ!</h3><p style="color: #9ca3af; font-size: 12px;">หน้าต่างนี้จะปิดตัวลงโดยอัตโนมัติ...</p></div>';
              setTimeout(() => window.close(), 1000);
            } else {
              alert("Error: Window opener not found!");
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Real OAuth Authorization Exchange Code Callback
app.get("/api/auth/facebook/callback", async (req, res) => {
  const { code } = req.query;
  const serverOrigin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${serverOrigin}/api/auth/facebook/callback`;

  if (!code) {
    return res.status(400).send("Authorization code missing from query parameters");
  }

  try {
    // 1. Exchange OAuth code for User Access Token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FB_APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json() as any;

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const userAccessToken = tokenData.access_token;

    // 2. Query user profile credentials
    const profileRes = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${userAccessToken}&fields=name`);
    const profileData = await profileRes.json() as any;
    const userName = profileData.name || "Facebook User";

    // Respond back using window message channel
    res.send(`
      <html>
        <body style="background: #0d0e12; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; max-width: 380px;">
            <p style="font-size: 40px; margin: 0 0 12px 0;">🎉</p>
            <h3 style="color: #10b981; margin: 0 0 8px 0;">เชื่อมต่อกับ Facebook สำเร็จ!</h3>
            <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0 0 16px 0;">ยินดีต้อนรับครับคุณ ${userName} บัญชีของคุณถูกเชื่อมต่อเรียบร้อยแล้ว ระบบกำลังนำทางกลับ...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: "OAUTH_AUTH_SUCCESS",
                  payload: {
                    accessToken: "${userAccessToken}",
                    userName: "${userName}",
                    isRealMode: true
                  }
                }, "*");
                setTimeout(() => window.close(), 1200);
              } else {
                window.location.href = "/";
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Facebook OAuth Callback Error:", err);
    res.status(500).send(`
      <html>
        <body style="background: #0d0e12; color: #f3f4f6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(244,63,94,0.2); border-radius: 12px; max-width: 380px;">
            <p style="font-size: 40px; margin: 0 0 12px 0;">⚠️</p>
            <h3 style="color: #f43f5e; margin: 0 0 8px 0;">เกิดข้อผิดพลาดในการเชื่อมต่อ</h3>
            <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0 0 16px 0;">${err.message || "Unknown token exchange failure"}</p>
            <button onclick="window.close()" style="background: #3b82f6; border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">ปิดหน้าต่างนี้</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Fetch Selected User Pages list
app.post("/api/facebook/get-pages", async (req, res) => {
  const { accessToken, photographerName } = req.body;
  if (!accessToken) return res.status(400).json({ error: "Access Token is missing" });

  if (accessToken.startsWith("sb_")) {
    const pName = photographerName || "ช่างภาพแสนดี";
    return res.json({
      pages: [
        {
          id: "sb_page_101",
          name: `📸 เพจหลักของแบรนด์ - ${pName} Studio`,
          access_token: "sb_page_token_101_v2",
          picture: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=100&auto=format&fit=crop"
        },
        {
          id: "sb_page_102",
          name: `🎨 พอร์ตผลงานพิเศษ - ${pName} Gallery & Review`,
          access_token: "sb_page_token_102_v2",
          picture: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?q=80&w=100&auto=format&fit=crop"
        }
      ]
    });
  }

  try {
    const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}&fields=name,access_token,picture{url}`;
    const pageRes = await fetch(pagesUrl);
    const pageData = await pageRes.json() as any;

    if (pageData.error) {
      return res.status(400).json({ error: pageData.error.message });
    }

    const pages = (pageData.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      access_token: p.access_token,
      picture: p.picture?.data?.url || null
    }));

    res.json({ pages });
  } catch (err: any) {
    console.error("Facebook API Get Pages Error:", err);
    res.status(500).json({ error: "ล้มเหลวในการเชื่อมโยงแฟนเพจ: " + err.message });
  }
});

// Post feed message to selected page
app.post("/api/facebook/post-feed", async (req, res) => {
  const { pageId, pageAccessToken, message, link } = req.body;
  if (!pageId || !pageAccessToken || !message) {
    return res.status(400).json({ error: "ข้อมูลสำหรับโพสต์ข้อความหน้าเพจไม่ครบถ้วน" });
  }

  if (pageAccessToken.startsWith("sb_")) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const randomPostId = Math.floor(Math.random() * 1000000000000).toString();
    return res.json({
      success: true,
      postId: `${pageId}_${randomPostId}`,
      permalinkUrl: `https://facebook.com/${pageId}/posts/${randomPostId}`,
      isSandbox: true
    });
  }

  try {
    const postUrl = `https://graph.facebook.com/v20.0/${pageId}/feed`;
    const params: any = { message: message, access_token: pageAccessToken };
    if (link) params.link = link;

    const postRes = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    const postData = await postRes.json() as any;
    if (postData.error) {
      return res.status(400).json({ error: postData.error.message });
    }

    res.json({
      success: true,
      postId: postData.id,
      permalinkUrl: `https://facebook.com/${postData.id}`,
      isSandbox: false
    });
  } catch (err: any) {
    console.error("Facebook Post Feed Error:", err);
    res.status(500).json({ error: "ล้มเหลวในการโพสต์: " + err.message });
  }
});

// Start Server with Compliant Vite Integration
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
    console.log(`[Server] Photo Client Hunter AI active on port ${PORT}`);
  });
};

startAppServer();
