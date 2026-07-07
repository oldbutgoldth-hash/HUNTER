export interface PhotographerProfile {
  name: string;
  serviceArea?: string;
  phone?: string;
  lineId?: string;
  facebookPage?: string;
  strengths?: string;
  style?: string;
  startingPrice?: string;
  jobTypes?: string[]; // e.g. ["รับปริญญา", "พรีเวดดิ้ง", "งานแต่ง", "โปรไฟล์", "สินค้า/อาหาร"]
  packages?: any[];
}

export interface TargetAnalysis {
  targetGroups: string[];
  painPoints: string[];
  wordsToUse: string[];
  wordsToAvoid: string[];
  channels: string[];
  contentStyles: string[];
  engagementTriggers: string[];
}

export interface GeneratedPosts {
  personalFb: string;
  pageFb: string;
  groupFb: string;
  reelsCaption: string;
  storyCaption: string;
  hashtags: string[];
  ctaMessage: string;
  interactiveQuestion: string;
}

export interface PostScore {
  score: number;
  criteria: {
    hook: number;
    targetRelevance: number;
    sellability: number;
    credibility: number;
    ctaClarity: number;
    commentOpportunity: number;
    personalFbSuitability: number;
  };
  strengths: string[];
  improvements: string[];
  ctaTips: string[];
  upgradedVersion: string;
}

export interface CalendarDay {
  day: number;
  dayName: string;
  topic: string;
  purpose: string;
  channel: string;
  caption: string;
  imageSuggestion: string;
  cta: string;
  category: string; // e.g. "ผลงานล่าสุด", "Before/After", "เบื้องหลัง"
}

export interface ClientCRM {
  id: string;
  name: string;
  channel: string; // e.g. "Facebook Chat", "Line", "Page Inbox"
  jobType: string;
  budget: string;
  date: string;
  location: string;
  status: 'ทักใหม่' | 'ส่งราคาแล้ว' | 'รอคอนเฟิร์ม' | 'นัดถ่ายแล้ว' | 'ปิดการขายแล้ว' | 'หลุด';
  notes: string;
  createdAt: string;
}

export interface ChatReplies {
  firstResponse: string;
  sendPackage: string;
  askDetails: string;
  closeSale: string;
  followUp: string;
  confirmBooking: string;
  requestReview: string;
}

export interface PhotoPackage {
  id: string;
  name: string;
  price: string;
  hours: string;
  photosDelivered: string;
  location: string;
  inclusions: string;
  conditions: string;
  aiEnhancedText?: string;
  aiPromoPost?: string;
}

export interface CaptionGeneration {
  reviewCaption: string;
  thankYouMessage: string;
  requestReview: string;
  portfolioCaption: string;
  albumCaption: string;
  singlePhotoCaption: string;
  beforeAfterCaption: string;
}
