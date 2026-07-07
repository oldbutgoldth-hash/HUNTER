import React, { useState } from "react";
import { ClientCRM, PhotographerProfile } from "../types";

interface CrmViewProps {
  clients: ClientCRM[];
  setClients: (newClients: ClientCRM[]) => void;
  profile: PhotographerProfile;
  setActiveTab: (tab: string) => void;
  setSelectedClientForChat: (client: ClientCRM) => void;
}

export default function CrmView({
  clients,
  setClients,
  profile,
  setActiveTab,
  setSelectedClientForChat,
}: CrmViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("Page Inbox");
  const [jobType, setJobType] = useState(profile.jobTypes[0] || "รับปริญญา");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ClientCRM["status"]>("ทักใหม่");
  const [notes, setNotes] = useState("");
  
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !budget.trim()) return;

    if (editingClientId) {
      const updated = clients.map((c) => {
        if (c.id === editingClientId) {
          return {
            ...c,
            name,
            channel,
            jobType,
            budget,
            date,
            location,
            status,
            notes,
          };
        }
        return c;
      });
      setClients(updated);
      setEditingClientId(null);
    } else {
      const newClient: ClientCRM = {
        id: "client-" + Date.now(),
        name,
        channel,
        jobType,
        budget,
        date,
        location,
        status,
        notes,
        createdAt: new Date().toISOString(),
      };
      setClients([newClient, ...clients]);
    }

    // Reset Form
    setName("");
    setBudget("");
    setDate("");
    setLocation("");
    setStatus("ทักใหม่");
    setNotes("");
    setShowAddForm(false);
  };

  const handleEdit = (client: ClientCRM) => {
    setEditingClientId(client.id);
    setName(client.name);
    setChannel(client.channel);
    setJobType(client.jobType);
    setBudget(client.budget);
    setDate(client.date);
    setLocation(client.location);
    setStatus(client.status);
    setNotes(client.notes);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("ยืนยันการลบประวัติลูกค้ารายนี้หรือไม่?")) {
      const updated = clients.filter((c) => c.id !== id);
      setClients(updated);
    }
  };

  const handleQuickChatResponse = (client: ClientCRM) => {
    setSelectedClientForChat(client);
    setActiveTab("chat");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>👥</span> ระบบจัดการบันทึกลูกค้าสัมพันธ์ (Client CRM Lite)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            เก็บบันทึกงบประมาณ ข้อตกลง พิกัดนัดถ่าย และจัดการการเจรจาเพื่อปิดยอดจองคิวว่างได้อย่างแม่นยำ
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => {
              setEditingClientId(null);
              setName("");
              setBudget("");
              setDate("");
              setLocation("");
              setStatus("ทักใหม่");
              setNotes("");
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs md:text-sm text-white font-semibold rounded-lg accent-glow transition cursor-pointer"
          >
            ➕ บันทึกข้อมูลลูกค้าใหม่
          </button>
        )}
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ลูกค้าเจรจาทั้งหมด</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{clients.length} ราย</p>
        </div>
        <div className="glass p-4 text-center border-l-4 border-emerald-500">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">สำเร็จ (ปิดการขาย)</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1 font-mono">
            {clients.filter((c) => c.status === "ปิดการขายแล้ว").length} ราย
          </p>
        </div>
        <div className="glass p-4 text-center border-l-4 border-amber-500">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">รอคำตอบ (ส่งราคาแล้ว)</p>
          <p className="text-2xl font-bold text-amber-300 mt-1 font-mono">
            {clients.filter((c) => c.status === "ส่งราคาแล้ว" || c.status === "รอคอนเฟิร์ม").length} ราย
          </p>
        </div>
        <div className="glass p-4 text-center border-l-4 border-purple-500">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">ทักสอบถามใหม่</p>
          <p className="text-2xl font-bold text-purple-300 mt-1 font-mono">
            {clients.filter((c) => c.status === "ทักใหม่").length} ราย
          </p>
        </div>
      </div>

      {/* Form Area */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass p-6 space-y-4 border-2 border-blue-500/30">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            {editingClientId ? "✏️ แก้ไขรายละเอียดการเจรจาลูกค้า" : "👥 กรอกรายละเอียดลูกค้าใหม่"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ชื่อลูกค้า / เพจผู้ถาม</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น น้องหนิง นิสิต จุฬา"
                className="w-full text-xs p-2.5 glass-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ช่องทางที่ทักคุย</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
              >
                <option value="Page Inbox" className="bg-[#050506]">Facebook Page Inbox</option>
                <option value="Facebook Chat" className="bg-[#050506]">Facebook Chat ส่วนตัว</option>
                <option value="Line" className="bg-[#050506]">LINE Official / LINE ส่วนตัว</option>
                <option value="Instagram DM" className="bg-[#050506]">Instagram DM</option>
                <option value="โทรติดต่อ" className="bg-[#050506]">เบอร์โทรศัพท์โดยตรง</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">ประเภทงานที่สนใจ</label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">งบประมาณเสนอขาย (บาท)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="เช่น 3,500"
                className="w-full text-xs p-2.5 glass-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">วันเวลานัดหมายถ่ายภาพ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 glass-input"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">สถานที่นัดถ่ายภาพ</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ม.เกษตร หรือสตูดิโอย่านนนท์"
                className="w-full text-xs p-2.5 glass-input"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 font-medium mb-1">สถานะดีลปัจจุบัน</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-2.5 glass-input font-bold"
              >
                <option value="ทักใหม่" className="bg-[#050506] text-purple-400">🆕 ทักสอบถามใหม่</option>
                <option value="ส่งราคาแล้ว" className="bg-[#050506] text-amber-400">💵 ส่งแพ็กเกจราคาแล้ว</option>
                <option value="รอคอนเฟิร์ม" className="bg-[#050506] text-blue-400">⏱️ รอคอนเฟิร์มมัดจำ</option>
                <option value="นัดถ่ายแล้ว" className="bg-[#050506] text-indigo-400">📸 นัดหมายพิกัดเรียบร้อย</option>
                <option value="ปิดการขายแล้ว" className="bg-[#050506] text-emerald-400">💰 ปิดการขายมัดจำแล้ว</option>
                <option value="หลุด" className="bg-[#050506] text-rose-500">❌ ดีลหลุด / หายเงียบ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 font-medium mb-1">หมายเหตุนัดหมาย / ความต้องการลึกๆ (Pain point)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ลูกค้ากังวลเรื่องการโพสท่า, อยากได้รูปเน้นโทนสว่างเกาหลีสุดใจ..."
              className="w-full text-xs p-2.5 glass-input"
            />
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
            >
              💾 {editingClientId ? "อัปเดตข้อมูลลูกค้า" : "บันทึกข้อมูลลูกค้า"}
            </button>
          </div>
        </form>
      )}

      {/* CRM Client Cards Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full h-48 glass flex flex-col items-center justify-center text-center p-6 text-gray-500 italic">
            🛋️ ยังไม่มีลูกค้าในฐานข้อมูล CRM บันทึกรายแรกด้านบนเพื่อเป็นระเบียบแผนปิดยอดขาย!
          </div>
        ) : (
          clients.map((client) => {
            let statusStyle = "border-purple-500/30 text-purple-400 bg-purple-500/5";
            if (client.status === "ปิดการขายแล้ว") {
              statusStyle = "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
            } else if (client.status === "ส่งราคาแล้ว") {
              statusStyle = "border-amber-500/30 text-amber-400 bg-amber-500/5";
            } else if (client.status === "รอคอนเฟิร์ม") {
              statusStyle = "border-blue-500/30 text-blue-400 bg-blue-500/5";
            } else if (client.status === "นัดถ่ายแล้ว") {
              statusStyle = "border-indigo-500/30 text-indigo-400 bg-indigo-500/5";
            } else if (client.status === "หลุด") {
              statusStyle = "border-rose-500/30 text-rose-400 bg-rose-500/5";
            }

            return (
              <div
                key={client.id}
                className="glass p-5 flex flex-col justify-between hover:border-white/15 transition duration-300 relative group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                        {client.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono">CHANNEL: {client.channel}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusStyle}`}>
                      {client.status}
                    </span>
                  </div>

                  {/* Pricing and details */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2 bg-black/20 rounded border border-white/5 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-mono">งบประมาณ</span>
                      <span className="font-bold text-blue-400">฿{client.budget}.-</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-mono">ประเภทงาน</span>
                      <span className="font-semibold text-gray-200">{client.jobType}</span>
                    </div>
                    {client.date && (
                      <div className="col-span-2 border-t border-white/5 pt-1 mt-1">
                        <span className="text-gray-400 block text-[9px] uppercase font-mono">กำหนดนัดถ่าย</span>
                        <span className="font-semibold text-gray-300">📅 {client.date}</span>
                      </div>
                    )}
                    {client.location && (
                      <div className="col-span-2 border-t border-white/5 pt-1">
                        <span className="text-gray-400 block text-[9px] uppercase font-mono">สถานที่ถ่าย</span>
                        <span className="font-semibold text-gray-300">📍 {client.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <p className="text-xs text-gray-300 leading-normal bg-white/2 p-2 rounded border border-white/5 italic">
                      💡 {client.notes}
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleQuickChatResponse(client)}
                    className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[10px] font-bold rounded border border-blue-500/20 cursor-pointer transition text-center"
                  >
                    💬 ตอบแชตอัจฉริยะ AI
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition cursor-pointer"
                    title="แก้ไขข้อมูลลูกค้า"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded transition cursor-pointer"
                    title="ลบข้อมูลลูกค้า"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
