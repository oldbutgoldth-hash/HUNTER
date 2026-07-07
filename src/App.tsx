import React, { useState, useEffect } from "react";
import { PhotographerProfile, ClientCRM, PhotoPackage } from "./types";
import { DEFAULT_PROFILE, INITIAL_CLIENTS, INITIAL_PACKAGES } from "./data";

import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import TargetAnalyzerView from "./components/TargetAnalyzerView";
import PostGeneratorView from "./components/PostGeneratorView";
import ScoreSystemView from "./components/ScoreSystemView";
import ContentCalendarView from "./components/ContentCalendarView";
import CrmView from "./components/CrmView";
import ChatReplyView from "./components/ChatReplyView";
import PackageBuilderView from "./components/PackageBuilderView";
import ReviewCaptionView from "./components/ReviewCaptionView";
import ProfileSettingsView from "./components/ProfileSettingsView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Photographer Profile State
  const [profile, setProfile] = useState<PhotographerProfile>(() => {
    const saved = localStorage.getItem("photographer_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_PROFILE;
  });

  // Client CRM State
  const [clients, setClients] = useState<ClientCRM[]>(() => {
    const saved = localStorage.getItem("photo_clients");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CLIENTS;
  });

  const saveClients = (newClients: ClientCRM[]) => {
    setClients(newClients);
    localStorage.setItem("photo_clients", JSON.stringify(newClients));
  };

  // Photo Packages State
  const [packages, setPackages] = useState<PhotoPackage[]>(() => {
    const saved = localStorage.getItem("photo_packages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PACKAGES;
  });

  const savePackages = (newPackages: PhotoPackage[]) => {
    setPackages(newPackages);
    localStorage.setItem("photo_packages", JSON.stringify(newPackages));
  };

  // Stats to display on Dashboard
  const [createdPostsCount, setCreatedPostsCount] = useState<number>(() => {
    const saved = localStorage.getItem("photo_stat_created_posts");
    return saved ? parseInt(saved, 10) : 12;
  });

  const [highScorePostsCount, setHighScorePostsCount] = useState<number>(() => {
    const saved = localStorage.getItem("photo_stat_highscore_posts");
    return saved ? parseInt(saved, 10) : 4;
  });

  const incrementCreatedPosts = () => {
    setCreatedPostsCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("photo_stat_created_posts", next.toString());
      return next;
    });
  };

  const incrementHighScorePosts = () => {
    setHighScorePostsCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("photo_stat_highscore_posts", next.toString());
      return next;
    });
  };

  // Support direct transitions from CRM list click to AI Chat assistant
  const [selectedClientForChat, setSelectedClientForChat] = useState<ClientCRM | null>(null);

  // Render the active view component
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            clients={clients}
            packagesCount={packages.length}
            profile={profile}
            createdPostsCount={createdPostsCount}
            highScorePostsCount={highScorePostsCount}
            setActiveTab={setActiveTab}
          />
        );
      case "analyzer":
        return <TargetAnalyzerView profile={profile} />;
      case "generator":
        return <PostGeneratorView profile={profile} onPostCreated={incrementCreatedPosts} />;
      case "score":
        return <ScoreSystemView profile={profile} onHighScoreEvaluated={incrementHighScorePosts} />;
      case "calendar":
        return <ContentCalendarView profile={profile} />;
      case "crm":
        return (
          <CrmView
            clients={clients}
            setClients={saveClients}
            profile={profile}
            setActiveTab={setActiveTab}
            setSelectedClientForChat={setSelectedClientForChat}
          />
        );
      case "chat":
        return (
          <ChatReplyView
            selectedClient={selectedClientForChat}
            profile={profile}
          />
        );
      case "package":
        return (
          <PackageBuilderView
            packages={packages}
            setPackages={savePackages}
            profile={profile}
          />
        );
      case "captions":
        return <ReviewCaptionView profile={profile} />;
      case "profile":
        return (
          <ProfileSettingsView
            profile={profile}
            setProfile={setProfile}
            setClients={saveClients}
            setPackages={savePackages}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-gray-500">
            ขออภัย ไม่พบหน้าที่คุณเลือก คาดว่าจะอยู่ระหว่างพัฒนากระบวนการ
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050506] text-slate-200 font-sans">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

      {/* Main dashboard body area */}
      <main className="flex-1 overflow-y-auto px-8 py-8 relative">
        {/* Absolute Background Atmosphere glow lights */}
        <div className="absolute right-1/4 top-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-10 w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none"></div>

        {/* Dynamic View container */}
        <div className="max-w-6xl mx-auto relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
