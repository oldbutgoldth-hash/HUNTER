import React, { useState, useEffect } from "react";

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  picture?: string;
}

export interface FacebookConnectionState {
  isConnected: boolean;
  isRealMode: boolean;
  accessToken: string | null;
  userName: string | null;
  pages: FacebookPage[];
  selectedPageId: string | null;
}

interface FacebookHubProps {
  photographerName?: string;
  onPageSelected?: (page: FacebookPage | null) => void;
  compact?: boolean;
}

export default function FacebookHub({ photographerName = "ช่างภาพ", onPageSelected, compact = false }: FacebookHubProps) {
  const [config, setConfig] = useState<{ isRealMode: boolean; appId: string | null }>({
    isRealMode: false,
    appId: null,
  });

  const [state, setState] = useState<FacebookConnectionState>(() => {
    const saved = localStorage.getItem("photo_fb_connection");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      isConnected: false,
      isRealMode: false,
      accessToken: null,
      userName: null,
      pages: [],
      selectedPageId: null,
    };
  });

  const [loadingPages, setLoadingPages] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load backend configuration on mount
  useEffect(() => {
    fetch("/api/facebook/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Error loading FB config:", err));
  }, []);

  // Sync selected page back to parent
  useEffect(() => {
    if (onPageSelected) {
      const selected = state.pages.find((p) => p.id === state.selectedPageId) || null;
      onPageSelected(selected);
    }
  }, [state.selectedPageId, state.pages, onPageSelected]);

  // Persist state
  const saveState = (newState: FacebookConnectionState) => {
    setState(newState);
    localStorage.setItem("photo_fb_connection", JSON.stringify(newState));
  };

  // Handle message from OAuth Popup window
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // Accept messages from same origin
      if (!origin.startsWith(window.location.origin)) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { accessToken, userName, isRealMode } = event.data.payload;
        
        setError(null);
        setLoadingPages(true);

        try {
          // Fetch pages for this user token
          const res = await fetch("/api/facebook/get-pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, photographerName }),
          });

          if (!res.ok) {
            throw new Error("ไม่สามารถเรียกดูข้อมูลแฟนเพจได้");
          }

          const data = await res.json();
          const pages = data.pages || [];

          const newState: FacebookConnectionState = {
            isConnected: true,
            isRealMode,
            accessToken,
            userName,
            pages,
            selectedPageId: pages.length > 0 ? pages[0].id : null,
          };

          saveState(newState);
        } catch (err: any) {
          setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลแฟนเพจ");
          console.error(err);
        } finally {
          setLoadingPages(false);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [photographerName]);

  const handleConnect = async () => {
    setError(null);
    try {
      const res = await fetch("/api/auth/facebook/url");
      if (!res.ok) {
        throw new Error("ไม่สามารถเปิดใช้งานลิงก์ล็อกอินเฟสบุ๊กได้ในขณะนี้");
      }
      const { url } = await res.json();

      // Open OAuth in centered popup
      const width = 550;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        url,
        "facebook_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      );

      if (!authWindow) {
        alert("🚨 ป๊อปอัพถูกบล็อก! กรุณาอนุญาตสิทธิ์การเปิดป๊อปอัพ (Allow Popups) สำหรับเว็บไซต์นี้เพื่อทำการเชื่อมต่อ Facebook คราบบบ");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("คุณต้องการตัดการเชื่อมต่อบัญชี Facebook และล้างข้อมูลเซสชันหรือไม่?")) {
      const cleared: FacebookConnectionState = {
        isConnected: false,
        isRealMode: false,
        accessToken: null,
        userName: null,
        pages: [],
        selectedPageId: null,
      };
      saveState(cleared);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveState({
      ...state,
      selectedPageId: e.target.value || null,
    });
  };

  const activePage = state.pages.find((p) => p.id === state.selectedPageId);

  // Mini compact view (useful for placing directly inside the Post Generator card)
  if (compact) {
    return (
      <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-[#1877f2]">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            แชร์ไปยัง Facebook Page
          </span>
          {state.isConnected ? (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              state.isRealMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {state.isRealMode ? "LIVE 🟢" : "SIMULATION 🔬"}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
            >
              เชื่อมต่อบัญชี ➔
            </button>
          )}
        </div>

        {state.isConnected ? (
          <div className="flex gap-2 items-center">
            {activePage?.picture && (
              <img
                src={activePage.picture}
                alt={activePage.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full border border-white/10"
              />
            )}
            <select
              value={state.selectedPageId || ""}
              onChange={handlePageChange}
              className="flex-1 bg-black/60 border border-white/10 p-1 rounded text-[11px] text-slate-200 outline-none focus:border-blue-500"
            >
              {state.pages.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0c0d12]">
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-[10px] text-gray-400 hover:text-rose-400 font-semibold cursor-pointer"
              title="ตัดการเชื่อมโยงบัญชีเฟสบุ๊ก"
            >
              ตัดสิทธิ์
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-gray-400">
            ล็อกอินด้วยเฟสบุ๊กเพื่อเลือกแฟนเพจช่างภาพของคุณ สำหรับแชร์และโพสต์ผลงานลงหน้าเพจตรงได้ทันที!
          </p>
        )}
      </div>
    );
  }

  // Full detailed panel view (great for Settings tab or Profile page)
  return (
    <div className="glass p-6 space-y-6" id="facebook_hub_panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1877f2]/10 flex items-center justify-center">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-[#1877f2]">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ระบบจัดการและเชื่อมต่อ Facebook Page</h3>
            <p className="text-xs text-gray-400 mt-0.5">เชื่อมต่อหน้าเพจของคุณเพื่อใช้ระบบโพสต์คอนเทนต์และส่งภาพรีวิวมืออาชีพได้แบบอัตโนมัติ</p>
          </div>
        </div>

        {/* Current Connection Status Badge */}
        <div>
          {state.isConnected ? (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              state.isRealMode 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
            }`}>
              <span className={`w-2 h-2 rounded-full ${state.isRealMode ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              {state.isRealMode ? "เชื่อมต่อ API บัญชีจริงแล้ว" : "เชื่อมต่อแล้ว (Sandbox Simulation)"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              ยังไม่ได้เชื่อมต่อ Facebook Page
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs animate-fade-in flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Control Section */}
        <div className="space-y-4">
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">🛠️ การจัดการการเชื่อมโยงบัญชี</h4>
            
            {state.isConnected ? (
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-400">ผู้ใช้ที่ล็อกอินเข้าระบบ:</p>
                    <p className="text-xs font-bold text-slate-100">{state.userName}</p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded border border-rose-500/20 transition cursor-pointer"
                  >
                    ยกเลิกการเชื่อมโยง
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-300 font-medium">แฟนเพจที่เลือกสำหรับใช้งานหลัก:</label>
                  
                  {loadingPages ? (
                    <div className="h-10 bg-white/5 rounded animate-pulse"></div>
                  ) : state.pages.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">⚠️ ไม่พบหน้าแฟนเพจที่คุณมีสิทธิ์ระดับแอดมิน กรุณาลองตรวจสอบสิทธิ์ใน Facebook</p>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={state.selectedPageId || ""}
                        onChange={handlePageChange}
                        className="w-full text-xs p-2.5 glass-input outline-none font-semibold text-blue-400"
                      >
                        {state.pages.map((p) => (
                          <option key={p.id} value={p.id} className="bg-[#0d0e12] text-slate-100">
                            {p.name}
                          </option>
                        ))}
                      </select>

                      {activePage && (
                        <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-center gap-3">
                          {activePage.picture && (
                            <img
                              src={activePage.picture}
                              alt={activePage.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border border-white/10"
                            />
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{activePage.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">Page ID: {activePage.id}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  เชื่อมโยงระบบ Photo Client Hunter เข้ากับเฟสบุ๊กส่วนตัวของคุณ เพื่อให้ระบบปัญญาประดิษฐ์สแกนและเข้าถึงรายชื่อแฟนเพจที่คุณดูแล และทำให้คุณสามารถคลิกปุ่มแชร์และโพสต์ผลงานของคุณได้แบบเรียลไทม์ไม่ต้องเสียเวลาก๊อปปี้ไปวางเองคราบบบ!
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleConnect}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-[#1877f2] hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-lg shadow-lg accent-glow transition cursor-pointer"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    เชื่อมต่อบัญชี Facebook
                  </button>
                  
                  {!config.isRealMode && (
                    <div className="text-[10px] text-amber-500/90 max-w-[120px] leading-tight flex items-center">
                      ℹ️ เปิดโหมดจำลองพิเศษ (Sandbox Mode) ทดลองใช้งานโพสต์จริงได้ทันที!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Developer configuration and explanation */}
        <div className="space-y-4">
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>🔧 คู่มือเชื่อมต่อ API บัญชีจริง</span>
              <button
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline"
              >
                {showSetupGuide ? "ซ่อนคำแนะนำ ▴" : "ดูคำแนะนำวิธีเชื่อมต่อ ▾"}
              </button>
            </h4>

            <p className="text-xs text-gray-400 leading-relaxed">
              ในสถานะปกติ ระบบรันในโหมด **Sandbox (จำลอง)** เพื่อความปลอดภัยและรวดเร็ว แต่หากท่านต้องการตั้งค่าระบบเชื่อมต่อไปยัง Facebook Developer App ส่วนตัวของท่านเพื่อโพสต์ลงเพจจริง สามารถทำได้ง่ายดายดังนี้:
            </p>

            {showSetupGuide && (
              <div className="space-y-3 text-xs bg-black/60 p-3 rounded border border-white/5 animate-fade-in text-gray-300">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    เข้าไปยัง <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-blue-400 font-bold underline">Facebook Developers Console</a> และลงทะเบียนบัญชีนักพัฒนา
                  </li>
                  <li>
                    สร้าง App ใหม่และเลือกประเภทเป็น <strong>Other</strong> แล้วเลือก use-case เป็น <strong>Consumer</strong> หรือ <strong>Business</strong>
                  </li>
                  <li>
                    เพิ่มโปรดักส์ <strong>Facebook Login for Business</strong> ลงในแอปพลิเคชัน
                  </li>
                  <li>
                    เพิ่มลิงก์ Callback redirect URI ต่อไปนี้ลงในช่อง <strong>Valid OAuth Redirect URIs</strong>:
                    <div className="mt-1 p-2 bg-slate-900 border border-slate-700 rounded font-mono text-[10px] text-emerald-400 break-all select-all">
                      {window.location.origin}/api/auth/facebook/callback
                    </div>
                  </li>
                  <li>
                    นำค่า App ID และ App Secret มากำหนดใน Settings Panel ของระบบในรูปของ Environment Variables ดังนี้:
                    <ul className="list-disc list-inside mt-1 space-y-1 pl-3 text-[11px]">
                      <li><span className="font-mono text-blue-300">FACEBOOK_APP_ID</span></li>
                      <li><span className="font-mono text-blue-300">FACEBOOK_APP_SECRET</span></li>
                    </ul>
                  </li>
                </ol>
              </div>
            )}

            <div className="p-3 bg-white/2 rounded-lg text-xs space-y-1.5 border border-white/5">
              <p className="font-bold text-gray-300">ความปลอดภัยและข้อกำหนด:</p>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                เมื่อเชื่อมต่อในโหมด Simulator ระบบจะไม่ทำการเก็บโทเค็นของท่านในฐานข้อมูลภายนอก ข้อมูลจะถูกจัดเก็บอยู่ในคอมพิวเตอร์ของท่านผ่าน Local Storage เท่านั้น ปลอดภัย 100% คราบบบ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
