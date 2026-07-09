import React, { useState, useRef } from "react";
import { PhotographerProfile, ClientCRM, PhotoPackage } from "../types";
import FacebookHub from "./FacebookHub";

interface ProfileSettingsViewProps {
  profile: PhotographerProfile;
  setProfile: (prof: PhotographerProfile) => void;
  setClients: (clients: ClientCRM[]) => void;
  setPackages: (packages: PhotoPackage[]) => void;
}

// Predefined high-value demo scenarios
const SCENARIOS = [
  {
    id: "wedding_bkk",
    title: "👰 ช่างภาพวิวาห์หรู (Bangkok Luxury)",
    description: "สไตล์ภาพหรูหรา Cinematic อบอุ่น มีเสน่ห์เฉพาะตัว เจาะกลุ่มบ่าวสาวงบหนาโรงแรมระดับ 5 ดาว",
    profile: {
      name: "Cherish Memory Wedding",
      serviceArea: "กรุงเทพฯ และปริมณฑล (โรงแรมห้าดาว / สตูดิโอพรีเมียม)",
      phone: "081-234-5678",
      lineId: "@cherishwedding",
      facebookPage: "https://facebook.com/cherishmemorywedding",
      strengths: "บริการจัดทีมไฟดึงมิติรูปภาพอลังการ, สอนจัดท่าทางบ่าวสาวอย่างเป็นธรรมชาติคลายความเกร็ง, การันตีส่งภาพไฮไลท์ชุดแรกภายใน 24 ชม., ทีมงานมืออาชีพที่มีกล้องและเลนส์สำรองทุกรอบเพื่อความปลอดภัยสูงสุด",
      style: "Elegant Cinematic Warm & High-End (โทนสีส้มอุ่นแอมเบียนต์เรียบหรู)",
      startingPrice: "35,000",
      jobTypes: ["พรีเวดดิ้ง", "งานแต่งงานพิธีเช้า-เย็น", "งานฉลองมงคลสมรส", "งานหมั้นพรีเมียม"]
    },
    packages: [
      {
        id: "wedding-p1",
        name: "Classic Wedding Ceremony (ครึ่งวัน)",
        price: "35000",
        hours: "4",
        photosDelivered: "ส่งรูปแต่งสีคุมโทนทุกรูป (ประมาณ 300-400 ใบ) และไฟล์ RAW ทั้งหมด",
        location: "กรุงเทพฯ ณ โรงแรมหรือสถานที่จัดงาน",
        inclusions: "ช่างภาพหลัก 1 คน + ผู้ช่วยจัดแสง 1 คน, อุปกรณ์ไฟสปอร์ตไลท์และแฟลชแยกระดับพรีเมียม, ส่งภาพไฮไลท์ส่งด่วนใน 24 ชม.",
        conditions: "มัดจำ 50% เพื่อล็อกวัน"
      },
      {
        id: "wedding-p2",
        name: "Grand Cinematic Wedding (เต็มวัน เช้า-เย็น)",
        price: "65000",
        hours: "10",
        photosDelivered: "ส่งรูปแต่งสีพิเศษสไตล์ภาพยนตร์ 700 ใบขึ้นไป ปรับผิวเนียนสวยไฮคลาส 50 ใบ",
        location: "กรุงเทพฯ ณ โรงแรมหรือสถานที่จัดงาน",
        inclusions: "ช่างภาพหลัก 2 คน + ช่างไฟผู้ช่วยจัดแสง 2 คน, แถมบริการพรีวิวรูปด่วนหน้างานให้ 30 ใบสำหรับแชร์โซเชียล",
        conditions: "มัดจำ 50% เพื่อล็อกวัน"
      }
    ],
    clients: [
      {
        id: "wedding-c1",
        name: "คุณพลอย & คุณท็อป",
        channel: "Line Chat",
        jobType: "งานแต่งงานพิธีเช้า-เย็น",
        date: "2026-11-20",
        status: "ทักใหม่" as const,
        notes: "โรงแรมสยามเคมปินสกี้ งานค่อนข้างหรูหรา แขกประมาณ 400 คน อยากได้ช่างภาพที่ช่วยไกด์ท่าทางเก่งๆ และมีฝีมือจัดแสงในห้องบอลรูมให้ออกมาอลังการเป็นพิเศษ",
        budget: "65,000",
        location: "โรงแรมสยามเคมปินสกี้ กรุงเทพฯ",
        createdAt: "2026-07-07T00:00:00.000Z"
      },
      {
        id: "wedding-c2",
        name: "คุณจิ๊บ & คุณบอส",
        channel: "Facebook Page",
        jobType: "งานหมั้นพรีเมียม",
        date: "2026-12-05",
        status: "ส่งราคาแล้ว" as const,
        notes: "จัดงานหมั้นพิธีเช้าที่โรงแรมแมนดาริน โอเรียนเต็ล มีพิธีสวมแหวนและทานเลี้ยงกลางวัน อยากได้สไตล์ภาพอุ่น ละมุน แคนดิดอารมณ์บ่าวสาวเยอะๆ",
        budget: "35,000",
        location: "โรงแรมแมนดาริน โอเรียนเต็ล กรุงเทพฯ",
        createdAt: "2026-07-07T00:00:00.000Z"
      }
    ]
  },
  {
    id: "grad_cm",
    title: "🎓 ช่างภาพรับปริญญาวัยรุ่น (Chiang Mai Grad)",
    description: "สไตล์สดใส ฟิล์มมินิมอลญี่ปุ่น เป็นกันเอง เข้ากับนักศึกษากลุ่มแก๊งที่อ่างแก้วและคาเฟ่ชิค",
    profile: {
      name: "Minisnap Chiang Mai",
      serviceArea: "เชียงใหม่ (มช. / อ่างแก้ว / คาเฟ่ยอดฮิตในเมือง)",
      phone: "085-444-5555",
      lineId: "@minisnap",
      facebookPage: "https://facebook.com/minisnap.cm",
      strengths: "เชี่ยวชาญการหามุมกล้องพรางหุ่นให้ดูสูงเพรียวเป็นธรรมชาติ, มีพร็อพลูกโป่งและเครื่องพ่นฟองสบู่บริการฟรี, รู้วิธีดึงแสงธรรมชาติสไตล์ญี่ปุ่นละมุนตา",
      style: "Minimal Japanese & Clean Film (โทนสว่างใส พาสเทล ละมุนตา)",
      startingPrice: "2,500",
      jobTypes: ["รับปริญญานอกรอบเดี่ยว", "รับปริญญาหมู่", "ถ่ายพอร์ตโฟลิโอ"]
    },
    packages: [
      {
        id: "grad-p1",
        name: "Graduation Solo (เดี่ยวครึ่งวัน)",
        price: "2500",
        hours: "4",
        photosDelivered: "ส่งรูปแต่งสีคุมโทนพาสเทลทุกรูป (ประมาณ 150-200 ใบ) และปรับผิวเนียนเดี่ยว 15 รูป",
        location: "เชียงใหม่ ณ มหาวิทยาลัยหรือคาเฟ่ที่ต้องการ",
        inclusions: "ช่างภาพหลัก 1 คน, บริการไกด์ท่าทางสไตล์เน็ตไอดอล, ส่งงานสมบูรณ์ใน 5 วัน",
        conditions: "มัดจำ 1,000 บาทล็อกวัน"
      },
      {
        id: "grad-p2",
        name: "Graduation Group (กลุ่มแก๊งซุกซน)",
        price: "4500",
        hours: "4",
        photosDelivered: "ส่งรูปแต่งสีพิเศษทุกใบ (ประมาณ 350 ใบขึ้นไป) และแต่งภาพผิวสวยเนียนเดี่ยว/กลุ่ม 30 ใบ",
        location: "พิกัดยอดฮิตอ่างแก้ว หรืออ่างเก็บน้ำกาแล",
        inclusions: "ช่างภาพหลัก 1 คน, แถมฟรีลูกโป่งพาสเทลและเครื่องพ่นสบู่ฟองสบู่เพิ่มความคึกคัก, ส่งงานสมบูรณ์ใน 5 วัน",
        conditions: "มัดจำ 1,500 บาทล็อกวัน"
      }
    ],
    clients: [
      {
        id: "grad-c1",
        name: "น้องน้ำมนต์ มช.",
        channel: "Line Chat",
        jobType: "รับปริญญานอกรอบเดี่ยว",
        date: "2026-08-15",
        status: "ทักใหม่",
        notes: "สนใจถ่ายเดี่ยวแถวอ่างแก้วและคาเฟ่เก๋ๆ อยากได้โทนญี่ปุ่นสว่างใสคลีนๆ บ่นว่าตัวเองขาสั้น อยากได้ช่างภาพช่วยหามุมกล้องให้ดูสูงเพรียว (เบอร์โทร: 085-444-5555)",
        budget: "2,500",
        location: "อ่างแก้ว มช. เชียงใหม่",
        createdAt: "2026-07-07T00:00:00.000Z"
      },
      {
        id: "grad-c2",
        name: "แก๊งสถาปัตย์ มช. (4 คน)",
        channel: "Facebook Page",
        jobType: "รับปริญญาหมู่",
        date: "2026-08-18",
        status: "รอคอนเฟิร์ม",
        notes: "ลูกค้ากลุ่มสถาปัตยกรรม อยากได้รูปแบบมินิมอล เท่ๆ กวนๆ ไม่อิงสไตล์หวานแหวว สนใจแพ็กเกจกลุ่มแก๊งของร้านโดยตรง (เบอร์โทร: 089-111-2222)",
        budget: "4,500",
        location: "คณะสถาปัตยกรรมศาสตร์ มช.",
        createdAt: "2026-07-07T00:00:00.000Z"
      }
    ]
  },
  {
    id: "prod_phuket",
    title: "🍽️ ช่างภาพโฆษณาและอาหาร (Phuket Commercial)",
    description: "สไตล์คมชัด สีสันสมจริง คอนทราสต์จัดจ้านพรีเมียม เจาะกลุ่มร้านอาหาร คาเฟ่ โรงแรมระดับหรูในเกาะภูเก็ต",
    profile: {
      name: "Phuket Creative Studio",
      serviceArea: "ภูเก็ต (คาเฟ่, ร้านอาหารท้องถิ่น, โรงแรม และธุรกิจขนาดเล็ก)",
      phone: "083-456-7890",
      lineId: "@phuketcreative",
      facebookPage: "https://facebook.com/phuketcreativestudio",
      strengths: "มีชุดเซ็ตไฟสตูดิโอพกพาจัดถ่ายของอร่อยและสินค้าได้ถึงหน้างานทุกที่, มีพร็อพแต่งจานระดับมืออาชีพเตรียมไปให้เลือกใช้ฟรี, ประสบการณ์คุมสีดึงเสน่ห์อาหารให้ออกมาน่าทานขึ้น 300% ช่วยกระตุ้นยอดขายในแอปสั่งอาหารพุ่งกระฉูด",
      style: "Commercial Sharp, Rich Colors & Premium Modern (เน้นมิติแสงเงาและรายละเอียดพื้นผิวสมบูรณ์แบบ)",
      startingPrice: "8,500",
      jobTypes: ["ถ่ายภาพอาหาร", "สินค้า/ผลิตภัณฑ์คอสเมติก", "ถ่ายภาพสถาปัตยกรรมโรงแรม/คาเฟ่", "ถ่ายภาพแอร์บีแอนด์บี"]
    },
    packages: [
      {
        id: "prod-p1",
        name: "Cafe Standard Food Set (ถ่ายเมนูอาหาร)",
        price: "8500",
        hours: "3",
        photosDelivered: "ส่งภาพถ่ายอาหารสวยพร้อมใช้เชิงพาณิชย์และตกแต่งฝุ่นละอองเนียนกริบ 30 เมนูเด็ด",
        location: "ร้านค้าในเขตจังหวัดภูเก็ต",
        inclusions: "ช่างภาพหลัก + ฟู้ดสไตลิสต์ 1 คนช่วยประคองจาน, อุปกรณ์ไฟสปอร์ตไลท์สตูพกพา, ส่งไฟล์ความละเอียดสูงใน 4 วันพร้อมใช้งานโฆษณา",
        conditions: "มัดจำ 3,000 บาทล็อกคิว"
      },
      {
        id: "prod-p2",
        name: "Premium Resort & Dining Commercial",
        price: "18500",
        hours: "6",
        photosDelivered: "ส่งภาพตกแต่งสีพเรียม 80 ใบขึ้นไป พร้อมบริการรีทัชไดคัทเปลี่ยนพื้นหลังผลิตภัณฑ์ฟรี 10 เมนูเด็ด",
        location: "ภูเก็ต พังงา หรือพังงารอบนอก",
        inclusions: "ช่างภาพหลัก + ทีมเซ็ตไฟระดับภาพยนตร์จัดแสงเงาขั้นเทพ, สิทธิ์ใช้ลิขสิทธิ์ภาพถ่ายเชิงพาณิชย์โฆษณาตลอดชีพอย่างไร้ขีดจำกัด",
        conditions: "มัดจำ 50% เพื่อจองงาน"
      }
    ],
    clients: [
      {
        id: "prod-c1",
        name: "โกอ่าง ซีฟู้ดภูเก็ต",
        channel: "Facebook Page",
        jobType: "ถ่ายภาพอาหาร",
        date: "2026-09-10",
        status: "ส่งราคาแล้ว",
        notes: "ร้านอาหารพื้นเมืองต้องการถ่าย 15 เมนูขายดีอัปขึ้น LINE MAN/Grab อยากให้แกงปูและกุ้งมังกรเดือดน่ากินชวนหิวน้ำลายสอ (เบอร์โทร: 076-222-333)",
        budget: "8,500",
        location: "โกอ่าง ซีฟู้ดภูเก็ต",
        createdAt: "2026-07-07T00:00:00.000Z"
      }
    ]
  }
];

export default function ProfileSettingsView({
  profile,
  setProfile,
  setClients,
  setPackages
}: ProfileSettingsViewProps) {
  const [name, setName] = useState(profile.name);
  const [serviceArea, setServiceArea] = useState(profile.serviceArea);
  const [phone, setPhone] = useState(profile.phone);
  const [lineId, setLineId] = useState(profile.lineId);
  const [facebookPage, setFacebookPage] = useState(profile.facebookPage);
  const [strengths, setStrengths] = useState(profile.strengths);
  const [style, setStyle] = useState(profile.style);
  const [startingPrice, setStartingPrice] = useState(profile.startingPrice);
  const [jobTypes, setJobTypes] = useState<string[]>(profile.jobTypes);

  const [savingFeedback, setSavingFeedback] = useState(false);
  const [newJobType, setNewJobType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preset scenarios
  const handleLoadScenario = (scenario: typeof SCENARIOS[0]) => {
    if (
      window.confirm(
        `⚠️ คุณแน่ใจหรือไม่ที่จะเปิดใช้งานโมเดลสถานการณ์จำลองของ "${scenario.profile.name}"?\n\n* ข้อมูลโปรไฟล์ช่างภาพหลัก, รายชื่อลูกค้าร่าง CRM, และรายการแพ็กเกจปัจจุบันจะถูกปรับเป็นของตัวอย่างสถานการณ์นี้ทั้งหมด เพื่อให้คุณเห็นไอเดียตัวอย่างการใช้ระบบตอบแชตแอนด์โฆษณาจริง!`
      )
    ) {
      // Save Photographer Profile
      const updatedProfile: PhotographerProfile = scenario.profile;
      setProfile(updatedProfile);
      localStorage.setItem("photographer_profile", JSON.stringify(updatedProfile));

      // Update Form Local State
      setName(updatedProfile.name);
      setServiceArea(updatedProfile.serviceArea);
      setPhone(updatedProfile.phone);
      setLineId(updatedProfile.lineId);
      setFacebookPage(updatedProfile.facebookPage);
      setStrengths(updatedProfile.strengths);
      setStyle(updatedProfile.style);
      setStartingPrice(updatedProfile.startingPrice);
      setJobTypes(updatedProfile.jobTypes);

      // Save Clients & Packages
      setClients(scenario.clients as ClientCRM[]);
      setPackages(scenario.packages as PhotoPackage[]);

      alert(`✅ โหลดสถานการณ์จำลอง "${scenario.title}" เรียบร้อยแล้ว!\n\nแวะไปดูระบบปิดการขายแชทบอท (Chat Reply) และระบบแคปชั่นโฆษณาต่างๆ เพื่อเห็นตัวอย่างคัดลอกปิดดีลจริงได้เลยครับคราบบบ`);
    }
  };

  // Export full local storage backup file
  const handleExportBackup = () => {
    const backupData = {
      photographer_profile: JSON.parse(localStorage.getItem("photographer_profile") || "{}"),
      photo_clients: JSON.parse(localStorage.getItem("photo_clients") || "[]"),
      photo_packages: JSON.parse(localStorage.getItem("photo_packages") || "[]"),
      photo_stat_created_posts: parseInt(localStorage.getItem("photo_stat_created_posts") || "12", 10),
      photo_stat_highscore_posts: parseInt(localStorage.getItem("photo_stat_highscore_posts") || "4", 10),
      backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photo-client-hunter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import full backup file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.photographer_profile) {
          localStorage.setItem("photographer_profile", JSON.stringify(data.photographer_profile));
          setProfile(data.photographer_profile);
          setName(data.photographer_profile.name);
          setServiceArea(data.photographer_profile.serviceArea);
          setPhone(data.photographer_profile.phone);
          setLineId(data.photographer_profile.lineId);
          setFacebookPage(data.photographer_profile.facebookPage);
          setStrengths(data.photographer_profile.strengths);
          setStyle(data.photographer_profile.style);
          setStartingPrice(data.photographer_profile.startingPrice);
          setJobTypes(data.photographer_profile.jobTypes || []);
        }
        if (data.photo_clients) {
          localStorage.setItem("photo_clients", JSON.stringify(data.photo_clients));
          setClients(data.photo_clients);
        }
        if (data.photo_packages) {
          localStorage.setItem("photo_packages", JSON.stringify(data.photo_packages));
          setPackages(data.photo_packages);
        }
        if (data.photo_stat_created_posts !== undefined) {
          localStorage.setItem("photo_stat_created_posts", data.photo_stat_created_posts.toString());
        }
        if (data.photo_stat_highscore_posts !== undefined) {
          localStorage.setItem("photo_stat_highscore_posts", data.photo_stat_highscore_posts.toString());
        }

        alert("🎉 นำเข้าข้อมูลประวัติและสำรองระบบสำเร็จเรียบร้อย! ระบบจะประมวลผลข้อมูลชุดนี้ทันทีโดยไม่ต้องกรอกข้อมูลใหม่คราบบบ");
        window.location.reload();
      } catch (err) {
        alert("❌ ไฟล์สำรองข้อมูลชำรุดเสียหายหรือไม่ถูกต้องตามมาตรฐาน JSON โปรดเลือกไฟล์ตัวสำรองของ Photo Client Hunter อีกครั้ง");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeedback(true);

    const updatedProfile: PhotographerProfile = {
      name,
      serviceArea,
      phone,
      lineId,
      facebookPage,
      strengths,
      style,
      startingPrice,
      jobTypes
    };

    setProfile(updatedProfile);
    localStorage.setItem("photographer_profile", JSON.stringify(updatedProfile));

    setTimeout(() => {
      setSavingFeedback(false);
      alert("💾 บันทึกการอัปเดตข้อมูลโปรไฟล์ช่างภาพเรียบร้อยแล้ว! ระบบ AI จะอ้างอิงข้อมูลชุดใหม่นี้คราบบบ");
    }, 800);
  };

  const handleAddJobType = () => {
    if (!newJobType.trim()) return;
    if (!jobTypes.includes(newJobType.trim())) {
      setJobTypes([...jobTypes, newJobType.trim()]);
    }
    setNewJobType("");
  };

  const handleRemoveJobType = (t: string) => {
    setJobTypes(jobTypes.filter((item) => item !== t));
  };

  return (
    <div className="space-y-6 animate-fade-in" id="profile_setup_view">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>⚙️</span> ตั้งค่าโปรไฟล์ช่างภาพหลัก (Photographer Profile Setup)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            อัปเดตข้อมูลความสามารถ จุดเด่น บริการ และช่องทางติดต่อของคุณเพื่อนำมาปรับใช้เป็นบริบทในการสร้างคำปิดแชตและคำโฆษณา AI ทุกเมนู
          </p>
        </div>

        {/* Export / Import buttons */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-700 transition cursor-pointer"
            title="ส่งออกไฟล์ข้อมูลสำรองทั้งหมด (Profile, CRM, Packages)"
            id="btn_export_backup"
          >
            📥 สำรองข้อมูลระบบ
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded border border-slate-700 transition cursor-pointer"
            title="นำเข้าไฟล์ข้อมูลสำรองทั้งหมด"
            id="btn_import_backup"
          >
            📤 นำเข้าข้อมูลสำรอง
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Demo Scenario Seeder Card */}
      <div className="glass p-5 border-l-4 border-emerald-500 bg-emerald-950/10">
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5">💡</div>
          <div className="space-y-3 flex-1">
            <div>
              <h4 className="text-sm font-bold text-emerald-300">
                สถานการณ์จำลองใช้งานจริง (Demo Playgrounds)
              </h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                เลือกคลิกโมเดลตัวอย่างแบรนด์ช่างภาพยอดนิยมของเมืองไทยด้านล่างนี้ทันที เพื่อลองสลับฟังก์ชันการทำงาน คอนเทนต์เป้าหมาย ตัวเลือกแพ็กเกจ และลูกค้าจำลองใน CRM อย่างประณีตและรวดเร็ว!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => handleLoadScenario(sc)}
                  className="bg-black/40 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-lg text-left transition cursor-pointer hover:bg-emerald-950/20 group relative overflow-hidden"
                  id={`scenario_card_${sc.id}`}
                >
                  <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1">
                    {sc.title}
                  </h5>
                  <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-2">
                    {sc.description}
                  </p>
                  <span className="absolute right-2 bottom-2 text-[10px] text-emerald-500/0 group-hover:text-emerald-400/100 font-semibold transition flex items-center gap-0.5">
                    โหลดด่วน ➔
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 glass p-6 space-y-5" id="form_profile_settings">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            👤 ข้อมูลส่วนตัวช่างภาพ & บริการหลัก
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ชื่อช่างภาพ / ชื่อแบรนด์ของคุณ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_profile_name"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">สไตล์คุมโทนภาพถ่ายที่เป็นซิกเนเจอร์</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="เช่น เกาหลีอบอุ่น มินิมอล ฟิล์มคอนทราสต์ต่ำ"
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_profile_style"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">พิกัดรับงาน / พื้นที่ให้บริการ</label>
              <input
                type="text"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_profile_area"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ราคาให้บริการเริ่มต้น (บาท)</label>
              <input
                type="text"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full text-xs p-2.5 glass-input font-semibold text-blue-400"
                required
                id="input_profile_price"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">เบอร์โทรศัพท์ติดต่อโดยตรง</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
                id="input_profile_phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ไอดีไลน์ LINE ID / LINE Official</label>
              <input
                type="text"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_profile_line"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ลิงก์หน้าแฟนเพจ Facebook Page</label>
              <input
                type="text"
                value={facebookPage}
                onChange={(e) => setFacebookPage(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_profile_fb"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">จุดเด่น / บริการหลักพิเศษ (ที่จะให้ AI ชูจุดเด่นเวลาโปรโมต)</label>
            <textarea
              rows={3}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="เช่น บริการแนะท่าเผลออย่างใกล้ชิด, มีความอดทนสูง, อารมณ์ดีตลก ชวนคุยคลายเหงาหน้ากล้อง, มีบริการส่งงานไวไฮไลต์ส่งด่วนใน 24 ชั่วโมง"
              className="w-full text-xs p-2.5 glass-input"
              required
              id="input_profile_strengths"
            />
          </div>

          {/* Job types management */}
          <div>
            <label className="block text-xs text-gray-300 font-medium mb-2">บริการงานถ่ายภาพที่ครอบคลุม</label>
            <div className="flex flex-wrap gap-2 mb-3" id="profile_job_types_tags">
              {jobTypes.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveJobType(t)}
                    className="text-[10px] text-blue-300 hover:text-rose-400 font-bold transition cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                placeholder="เช่น งานรับปริญญาหมู่, พรีเวดดิ้ง, แฟชั่นโปรไฟล์"
                className="flex-1 text-xs p-2.5 glass-input"
                id="input_new_job_type"
              />
              <button
                type="button"
                onClick={handleAddJobType}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold rounded-lg cursor-pointer"
                id="btn_add_job_type"
              >
                เพิ่มประเภทงาน
              </button>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              type="submit"
              disabled={savingFeedback}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
              id="btn_save_profile"
            >
              {savingFeedback ? "💾 กำลังจัดบันทึกประวัติ..." : "💾 บันทึกโปรไฟล์ช่างภาพ"}
            </button>
          </div>
        </form>

        {/* Brand Card mockup preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass p-6 border-l-4 border-indigo-500 relative overflow-hidden flex flex-col justify-between h-80" id="profile_mockup_card">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-bl-full pointer-events-none"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow accent-glow">
                  {name ? name.slice(0, 2) : "PH"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{name || "ชื่อช่างภาพของคุณ"}</h4>
                  <p className="text-[10px] text-gray-400 italic">⭐ สไตล์ {style || "ธรรมชาติ"}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3 text-xs text-gray-300">
                <p>📍 <span className="text-gray-400">พื้นที่บริการ:</span> {serviceArea || "ทั่วไป"}</p>
                <p>📞 <span className="text-gray-400">เบอร์โทรศัพท์:</span> {phone || "-"}</p>
                <p>💬 <span className="text-gray-400">LINE ID:</span> {lineId || "-"}</p>
                <p>📢 <span className="text-gray-400">เฟสบุ๊กเพจ:</span> {facebookPage || "-"}</p>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 p-3 rounded text-[11px] text-gray-400">
              📌 <span className="font-semibold text-gray-300">ความรู้ AI:</span> ข้อมูลเซ็ตนี้จะถูกนำส่งไปยังเซิร์ฟเวอร์เพื่อให้การแต่งแคปชั่นและการเสนอแพ็กเกจตรงจริตกับคุณ 100%
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Integration Hub Section */}
      <FacebookHub photographerName={profile.name} />
    </div>
  );
}
