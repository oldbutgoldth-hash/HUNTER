import React from "react";
import { PhotographerProfile } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: PhotographerProfile;
}

export default function Sidebar({ activeTab, setActiveTab, profile }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "แดชบอร์ด", icon: "📊" },
    { id: "analyzer", label: "วิเคราะห์กลุ่มเป้าหมาย", icon: "🎯" },
    { id: "generator", label: "สร้างโพสต์ AI", icon: "✍️" },
    { id: "score", label: "ประเมินให้คะแนนโพสต์", icon: "⭐" },
    { id: "calendar", label: "แผนโพสต์ 7 วัน", icon: "📅" },
    { id: "crm", label: "จัดการลูกค้า (CRM)", icon: "👥" },
    { id: "chat", label: "ตอบแชตอัจฉริยะ", icon: "💬" },
    { id: "package", label: "แพ็กเกจราคา", icon: "📦" },
    { id: "captions", label: "แคปชั่นผลงาน & รีวิว", icon: "📸" },
    { id: "profile", label: "ตั้งค่าโปรไฟล์ช่างภาพ", icon: "⚙️" },
  ];

  return (
    <aside className="w-72 border-r border-white/5 flex flex-col glass-dark z-10 shrink-0 select-none">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic flex items-center gap-2">
          📸 Photo Client Hunter AI
        </h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-mono">
          AI-POWERED COPILOT FOR PHOTOGRAPHERS
        </p>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          ฟังก์ชันวิเคราะห์ & สร้าง
        </div>
        
        {menuItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === item.id
                ? "nav-item-active text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="mr-3 text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="px-3 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          ตัวช่วยปิดการขาย & บริการ
        </div>

        {menuItems.slice(5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === item.id
                ? "nav-item-active text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="mr-3 text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Photographer Quick Info Section */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm uppercase accent-glow">
            {profile.name ? profile.name.slice(0, 2) : "PH"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-200 truncate">{profile.name || "ช่างภาพของฉัน"}</p>
            <p className="text-[10px] text-blue-400 truncate italic font-mono">⚡ {profile.style || "มินิมอล/ธรรมชาติ"}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="ระบบ AI พร้อมใช้งาน"></div>
        </div>
      </div>
    </aside>
  );
}
