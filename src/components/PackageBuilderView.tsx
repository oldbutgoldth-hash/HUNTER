import React, { useState, useEffect } from "react";
import { PhotoPackage, PhotographerProfile } from "../types";
import { INITIAL_PACKAGES } from "../data";

interface PackageBuilderViewProps {
  packages: PhotoPackage[];
  setPackages: (pkgs: PhotoPackage[]) => void;
  profile: PhotographerProfile;
}

export default function PackageBuilderView({ packages, setPackages, profile }: PackageBuilderViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [hours, setHours] = useState("");
  const [photosDelivered, setPhotosDelivered] = useState("");
  const [location, setLocation] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [conditions, setConditions] = useState("");
  
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [loadingImprove, setLoadingImprove] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<Record<string, "enhanced" | "promo">>({});

  // Upsell builder state variables
  const [pkgAId, setPkgAId] = useState("");
  const [pkgBId, setPkgBId] = useState("");
  const [comparisonResult, setComparisonResult] = useState<{
    comparisonGrid: string[];
    valueProposition: string;
    upsellScript: string;
    objectionResponses: string;
  } | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [copyCompareFeedback, setCopyCompareFeedback] = useState<string | null>(null);

  // Initialize comparison packages dropdowns when packages change
  useEffect(() => {
    if (packages.length >= 2) {
      setPkgAId(packages[packages.length - 1].id); // Usually basic
      setPkgBId(packages[0].id); // Usually premium
    }
  }, [packages]);

  const savePackages = (pkgs: PhotoPackage[]) => {
    setPackages(pkgs);
    localStorage.setItem("photo_packages", JSON.stringify(pkgs));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !hours.trim()) return;

    if (editingPkgId) {
      const updated = packages.map((p) => {
        if (p.id === editingPkgId) {
          return {
            ...p,
            name,
            price,
            hours,
            photosDelivered,
            location,
            inclusions,
            conditions,
          };
        }
        return p;
      });
      savePackages(updated);
      setEditingPkgId(null);
    } else {
      const newPkg: PhotoPackage = {
        id: "pkg-" + Date.now(),
        name,
        price,
        hours,
        photosDelivered,
        location,
        inclusions,
        conditions,
      };
      savePackages([newPkg, ...packages]);
    }

    // Reset Form
    setName("");
    setPrice("");
    setHours("");
    setPhotosDelivered("");
    setLocation("");
    setInclusions("");
    setConditions("");
    setShowAddForm(false);
  };

  const handleEdit = (pkg: PhotoPackage) => {
    setEditingPkgId(pkg.id);
    setName(pkg.name);
    setPrice(pkg.price);
    setHours(pkg.hours);
    setPhotosDelivered(pkg.photosDelivered);
    setLocation(pkg.location);
    setInclusions(pkg.inclusions);
    setConditions(pkg.conditions);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("ต้องการลบแพ็กเกจราคานี้ใช่หรือไม่?")) {
      const updated = packages.filter((p) => p.id !== id);
      savePackages(updated);
    }
  };

  const handleAIImprove = async (pkg: PhotoPackage) => {
    setLoadingImprove(pkg.id);
    setError(null);
    try {
      const res = await fetch("/api/improve-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pkg.name,
          price: pkg.price,
          hours: pkg.hours,
          photosDelivered: pkg.photosDelivered,
          location: pkg.location,
          inclusions: pkg.inclusions,
          conditions: pkg.conditions,
        }),
      });
      if (!res.ok) {
        throw new Error("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถเพิ่มมูลค่าและปรับแต่งแพ็กเกจด้วย AI ได้ในขณะนี้");
      }
      const data = await res.json();
      if (data.aiEnhancedText) {
        const updated = packages.map((p) => {
          if (p.id === pkg.id) {
            return {
              ...p,
              aiEnhancedText: data.aiEnhancedText,
              aiPromoPost: data.aiPromoPost,
            };
          }
          return p;
        });
        savePackages(updated);
        setError(null);
        // Set default output tab to enhanced for this card
        setActiveOutputTab(prev => ({ ...prev, [pkg.id]: "enhanced" }));
      } else {
        throw new Error("ข้อมูลแพ็กเกจปรับแต่งที่ส่งกลับมาจาก AI ไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตของคุณ");
    } finally {
      setLoadingImprove(null);
    }
  };

  const handleBuildUpsell = async () => {
    if (!pkgAId || !pkgBId) return;
    if (pkgAId === pkgBId) {
      alert("โปรดเลือกแพ็กเกจที่แตกต่างกันสองแบบเพื่อสร้างตารางวิเคราะห์และคำอัปเซลล์");
      return;
    }

    setLoadingCompare(true);
    setError(null);

    const pkgA = packages.find(p => p.id === pkgAId);
    const pkgB = packages.find(p => p.id === pkgBId);

    if (!pkgA || !pkgB) {
      setLoadingCompare(false);
      return;
    }

    try {
      const res = await fetch("/api/compare-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packages: [pkgA, pkgB],
          photographerProfile: profile
        })
      });

      if (!res.ok) {
        throw new Error("เกิดข้อขัดข้องระหว่างเรียก AI เปรียบเทียบราคาแพ็กเกจ");
      }

      const data = await res.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ไม่สามารถเชื่อมต่อ AI เปรียบเทียบราคาแพ็กเกจได้");
    } finally {
      setLoadingCompare(false);
    }
  };

  const copyToClipboard = (text: string, cardId: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${cardId}_${type}`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const copyCompareText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyCompareFeedback(field);
    setTimeout(() => setCopyCompareFeedback(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="package_builder_view">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>📦</span> บิลด์และเพิ่มระดับแพ็กเกจขายบริการ (AI Package Optimizer)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            ระบุรายละเอียดแพ็กเกจการให้บริการช่างภาพของคุณ และสั่งให้ AI แปลงข้อเสนอเพื่อเพิ่มมูลค่าให้น่าซื้อและอิมพรูฟยอดขายขึ้นเท่าตัว
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => {
              setEditingPkgId(null);
              setName("");
              setPrice("");
              setHours("");
              setPhotosDelivered("");
              setLocation("");
              setInclusions("");
              setConditions("");
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs md:text-sm text-white font-semibold rounded-lg accent-glow transition cursor-pointer"
            id="btn_add_package"
          >
            ➕ สร้างแพ็กเกจบริการใหม่
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass p-6 space-y-4 border-2 border-blue-500/30" id="form_add_edit_package">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            {editingPkgId ? "✏️ แก้ไขข้อมูลแพ็กเกจบริการ" : "📦 กรอกรายละเอียดบริการใหม่"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ชื่อแพ็กเกจ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Portrait Lite หรือ Premium Wedding"
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_package_name"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ราคาให้บริการ (บาท)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="เช่น 3,500"
                className="w-full text-xs p-2.5 glass-input"
                required
                id="input_package_price"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">เวลา (ชั่วโมง)</label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="เช่น 4"
                  className="w-full text-xs p-2.5 glass-input"
                  required
                  id="input_package_hours"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 font-medium mb-1">ส่งงาน (อย่างน้อย)</label>
                <input
                  type="text"
                  value={photosDelivered}
                  onChange={(e) => setPhotosDelivered(e.target.value)}
                  placeholder="เช่น 120 รูป"
                  className="w-full text-xs p-2.5 glass-input"
                  id="input_package_delivered"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">พื้นที่ / โลเคชั่นจัดงาน</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น สวนรถไฟ หรือสตูดิโอคุมแสง"
                className="w-full text-xs p-2.5 glass-input"
                id="input_package_location"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ของแถม / บริการอื่นที่ครอบคลุม</label>
              <input
                type="text"
                value={inclusions}
                onChange={(e) => setInclusions(e.target.value)}
                placeholder="ปรับแสงสี, ส่งรูปด่วนใน 24 ชม., รวมค่าเดินทาง"
                className="w-full text-xs p-2.5 glass-input"
                id="input_package_inclusions"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">เงื่อนไขการเลื่อน / จอง</label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="เลื่อนวันฟรี 1 ครั้ง, มัดจำ 1,000 บาท"
                className="w-full text-xs p-2.5 glass-input"
                id="input_package_conditions"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold rounded-lg cursor-pointer"
              id="btn_submit_package"
            >
              💾 {editingPkgId ? "อัปเดตแพ็กเกจ" : "บันทึกแพ็กเกจ"}
            </button>
          </div>
        </form>
      )}

      {/* Package List Grid */}
      <div className="space-y-6">
        {packages.length === 0 ? (
          <div className="glass p-8 text-center text-gray-500 italic">
            🛋️ ยังไม่มีข้อมูลบริการแพ็กเกจ คลิกสร้างบริการแพ็กเกจแรกเพื่อเป็นพอร์ตราคากันเลย!
          </div>
        ) : (
          packages.map((pkg) => {
            const isImproving = loadingImprove === pkg.id;
            const hasAIOutput = !!pkg.aiEnhancedText;
            const outputTab = activeOutputTab[pkg.id] || "enhanced";

            return (
              <div
                key={pkg.id}
                className="glass p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 hover:border-white/15 transition-all duration-300"
                id={`package_card_${pkg.id}`}
              >
                {/* Left block: package core metadata */}
                <div className="xl:col-span-4 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-white/5 pb-4 xl:pb-0 xl:pr-6">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-md font-bold text-white uppercase tracking-tight">{pkg.name}</h3>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="p-1 text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded transition cursor-pointer"
                          title="แก้ไขรายละเอียด"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-1 text-xs bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 rounded transition cursor-pointer"
                          title="ลบแพ็กเกจ"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="my-3 p-3 bg-blue-600/10 border border-blue-500/20 rounded text-center">
                      <span className="text-[10px] text-blue-300 block uppercase tracking-wider font-mono">ราคาเสนอขายเริ่มต้น</span>
                      <span className="text-2xl font-extrabold text-blue-400 font-mono">฿{parseFloat(pkg.price as any).toLocaleString() || pkg.price}.-</span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-300">
                      <p>⏱️ <span className="text-gray-400">เวลาที่ให้บริการ:</span> <strong className="text-white">{pkg.hours} ชั่วโมงเต็ม</strong></p>
                      {pkg.photosDelivered && <p>📸 <span className="text-gray-400">ส่งรูปภาพขั้นต่ำ:</span> <strong className="text-white">{pkg.photosDelivered} รูป</strong></p>}
                      {pkg.location && <p>📍 <span className="text-gray-400">พิกัดสถานที่:</span> <strong className="text-white">{pkg.location}</strong></p>}
                      {pkg.inclusions && <p>🎁 <span className="text-gray-400">บริการรวมพิเศษ:</span> <span className="text-gray-200">{pkg.inclusions}</span></p>}
                      {pkg.conditions && <p>⚠️ <span className="text-gray-400">เงื่อนไขการจอง:</span> <span className="text-gray-200">{pkg.conditions}</span></p>}
                    </div>
                  </div>

                  {!hasAIOutput && (
                    <button
                      onClick={() => handleAIImprove(pkg)}
                      disabled={isImproving}
                      className="w-full py-2 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg accent-glow transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isImproving ? "🤖 กำลังปรุงแต่งด้วย AI..." : "🔮 ยกระดับมูลค่า + เขียนโพสต์ขาย"}
                    </button>
                  )}
                </div>

                {/* Right block: AI Enhanced output */}
                <div className="xl:col-span-8 flex flex-col justify-between">
                  {hasAIOutput ? (
                    <div className="space-y-3 h-full flex flex-col justify-between">
                      <div>
                        {/* Tab Headers inside card */}
                        <div className="flex border-b border-white/5 pb-1.5 gap-2 justify-between items-center">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setActiveOutputTab(prev => ({ ...prev, [pkg.id]: "enhanced" }))}
                              className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                                outputTab === "enhanced"
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              💎 รายละเอียดแพ็กเกจระดับหรู (AI Enhanced)
                            </button>
                            <button
                              onClick={() => setActiveOutputTab(prev => ({ ...prev, [pkg.id]: "promo" }))}
                              className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                                outputTab === "promo"
                                  ? "bg-purple-600 text-white"
                                  : "text-gray-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              📢 โพสต์โปรโมตบนโซเชียล
                            </button>
                          </div>

                          <button
                            onClick={() => handleAIImprove(pkg)}
                            disabled={isImproving}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                          >
                            {isImproving ? "ปรับปรุงอยู่..." : "🔄 สั่งปรับปรุงใหม่"}
                          </button>
                        </div>

                        {/* Text Display */}
                        <div className="p-3.5 bg-black/40 border border-white/5 rounded-lg mt-3 overflow-y-auto max-h-[220px]">
                          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {outputTab === "enhanced" ? pkg.aiEnhancedText : pkg.aiPromoPost}
                          </p>
                        </div>
                      </div>

                      {/* Copy Action footer */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                        <span className="text-[10px] text-gray-400 italic">
                          {outputTab === "enhanced" ? "*ข้อความนี้หรูหราส่งแชทคุยปิดการขายดีเยี่ยม" : "*แชร์โพสต์นี้หน้าแฟนเพจเพื่อดึงยอดทักอินบ็อกซ์ด่วน"}
                        </span>
                        
                        <button
                          onClick={() => copyToClipboard(
                            outputTab === "enhanced" ? pkg.aiEnhancedText! : pkg.aiPromoPost!,
                            pkg.id,
                            outputTab
                          )}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded text-xs border border-white/10 transition cursor-pointer animate-fade-in"
                        >
                          {copyFeedback === `${pkg.id}_${outputTab}` ? "คัดลอกสำเร็จแล้ว! ✅" : "📋 คัดลอกข้อความด้านบน"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                      <span className="text-3xl mb-2">💎</span>
                      <p className="text-xs font-semibold">อยากเห็นผลงานนี้ในสเกลพรีเมียมหรือไม่?</p>
                      <p className="text-[11px] text-gray-500 max-w-sm mt-1">
                        คลิกปุ่ม 'ยกระดับมูลค่า' ด้านซ้าย AI จะจัดระดับของแถม ชื่อแพ็กเกจใหม่สไตล์เกาหลีละมุน และเขียนโพสต์ขายให้ครบถ้วนในพริบตา
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Package Comparison Section (Task 9) */}
      {packages.length >= 2 && (
        <div className="glass p-6 border-t-4 border-indigo-500 space-y-5" id="package_comparison_builder_section">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📊</span> เครื่องมือเปรียบเทียบแพ็กเกจ & สร้างบทอัปเซลล์ (AI Package Upsell Builder)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              เลือกแพ็กเกจราคาธรรมดาคู่กับแพ็กเกจพรีเมียม เพื่อให้ AI สร้างบทเปรียบเทียบแสดงความแตกต่าง และเขียนสคริปต์พิมพ์คุยเชียร์อัปเกรดแบบสุภาพแต่ทรงอิทธิพล
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs text-gray-300 font-medium mb-1.5">🎯 เลือกแพ็กเกจราคาเริ่มต้น (Base Tier)</label>
              <select
                value={pkgAId}
                onChange={(e) => setPkgAId(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
              >
                {packages.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#050506]">
                    {p.name} (฿{parseFloat(p.price as any).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs text-gray-300 font-medium mb-1.5">💎 เลือกแพ็กเกจระดับหรูหรากว่า (Upsell Target)</label>
              <select
                value={pkgBId}
                onChange={(e) => setPkgBId(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
              >
                {packages.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#050506]">
                    {p.name} (฿{parseFloat(p.price as any).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleBuildUpsell}
                disabled={loadingCompare}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition disabled:opacity-50"
                id="btn_compare_packages"
              >
                {loadingCompare ? "🤖 วิเคราะห์อยู่..." : "📊 เริ่มวิเคราะห์อัปเซลล์"}
              </button>
            </div>
          </div>

          {/* Upsell Output Panel */}
          {loadingCompare && (
            <div className="space-y-4 animate-pulse p-4 bg-black/30 border border-white/5 rounded-lg">
              <div className="h-4 bg-white/15 rounded w-1/4"></div>
              <div className="h-3 bg-white/5 rounded w-full"></div>
              <div className="h-3 bg-white/5 rounded w-5/6"></div>
              <div className="h-3 bg-white/5 rounded w-4/5"></div>
            </div>
          )}

          {comparisonResult && !loadingCompare && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" id="comparison_result_panel">
              {/* Matrix of Differences */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                    🎯 จุดแตกต่างสำคัญเด่นชัด (Value Matrix)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {comparisonResult.comparisonGrid.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400">⚡</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                    🧠 จิตวิทยาโน้มน้าวใจ (Value Proposition)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {comparisonResult.valueProposition}
                  </p>
                </div>
              </div>

              {/* Scripts & Responses */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-black/40 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                      💬 สคริปต์เสนอขายอัปเซลล์ (Upsell Chat Script)
                    </h4>
                    <button
                      onClick={() => copyCompareText(comparisonResult.upsellScript, "upsell")}
                      className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      {copyCompareFeedback === "upsell" ? "คัดลอกแล้ว! ✅" : "📋 คัดลอกบทแชท"}
                    </button>
                  </div>
                  <div className="p-3 bg-black/30 border border-white/5 rounded text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto font-mono">
                    {comparisonResult.upsellScript}
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                      🛡️ ตอบคำถามส่วนต่างราคา (Objection Shield)
                    </h4>
                    <button
                      onClick={() => copyCompareText(comparisonResult.objectionResponses, "objection")}
                      className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      {copyCompareFeedback === "objection" ? "คัดลอกแล้ว! ✅" : "📋 คัดลอกแนวคิด"}
                    </button>
                  </div>
                  <div className="p-3 bg-black/30 border border-white/5 rounded text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto font-mono">
                    {comparisonResult.objectionResponses}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
