
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Loader2, 
  TrainFront,
  X,
  Sparkles,
  Info,
  RefreshCcw,
  Zap,
  Globe,
  Facebook,
  ShoppingBasket,
  Megaphone,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  History,
  ChevronRight,
  Link as LinkIcon,
  Stethoscope,
  Building2,
  GraduationCap,
  CalendarDays,
  MoonStar,
  ShieldAlert,
  Activity,
  BadgeCheck,
  HeartPulse
} from 'lucide-react';
import { Category, Train } from '../types.ts';
import { db } from '../db.ts';

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
}

const STATION_ALIASES: Record<string, string[]> = {
  "ঢাকা (কমলাপুর)": ["ঢাকা", "কমলাপুর", "komlapur", "dhaka"],
  "রাজবাড়ী": ["রাজবাড়ি", "রাজবাড়ী", "rajbari"],
  "পাংশা": ["পাংশা", "pangsha"],
  "ভাঙ্গা জংশন": ["ভাঙ্গা", "bhanga"],
  "মাওয়া": ["মাওয়া", "mawa"],
  "বেনাপোল": ["বেনাপোল", "benapole"],
  "কুষ্টিয়া কোর্ট": ["কুষ্টিয়া", "কুষ্টিয়া", "kushtia"],
  "পোড়াদহ জংশন": ["পোড়াদহ", "poradoho"],
  "চুয়াডাঙ্গা": ["চুয়াডাঙ্গা", "chuadanga"],
  "খুলনা": ["খুলনা", "khulna"]
};

const CategoryView: React.FC<CategoryViewProps> = ({ category }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'local' | 'cache'>('local');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [isInferring, setIsInferring] = useState(false);
  const [currentStation, setCurrentStation] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [aiInference, setAiInference] = useState({ 
    reason: 'লাইভ ডাটা লোড হচ্ছে...', 
    delay: '০ মিনিট'
  });

  const getLiveTimeContext = () => {
    const now = new Date();
    return `আজ ${now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}, সময় ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setIsAiLoading(false);
    
    try {
      const localItems = await db.getCategory(category);
      setData(localItems);
      setDataSource('local');
      
      if (['market_price', 'notices', 'jobs'].includes(category)) {
        if ((category === 'jobs' || category === 'market_price' || category === 'notices') && !forceRefresh) {
          const cacheKey = `rajbari_${category}_cache_v6`;
          const timeKey = `rajbari_${category}_timestamp_v6`;
          const cachedData = localStorage.getItem(cacheKey);
          const cacheTime = localStorage.getItem(timeKey);
          const today = new Date().toDateString();

          if (cachedData && cacheTime === today) {
            setData(JSON.parse(cachedData));
            setDataSource('cache');
            setLoading(false);
            return;
          }
        }
        await fetchAiCategoryData(category, localItems);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiCategoryData = async (cat: string, fallbackData: any[]) => {
    setIsAiLoading(true);
    const timeContext = getLiveTimeContext();
    let prompt = "";

    if (cat === 'market_price') {
      prompt = `${timeContext}। গুগল সার্চ ব্যবহার করে বাংলাদেশের (বিশেষ করে রাজবাড়ী বা ঢাকার) আজকের সর্বশেষ খুচরা বাজারদর (Latest Retail Market Price) এবং সরকারি নির্ধারিত দাম খুঁজুন।
      শর্তসমূহ:
      ১. গুগল সার্চ থেকে প্রাপ্ত আজকের বা গতকালকের সর্বশেষ নির্ভরযোগ্য নিউজ, টিসিবি (TCB) বা কৃষি বিপণন অধিদপ্তরের রিপোর্ট অনুযায়ী বর্তমান বাজারদর দিন।
      ২. দাম আগের চেয়ে বেড়েছে নাকি কমেছে, তা 'trend' ফিল্ডে ('up', 'down', বা 'stable') সঠিকভাবে উল্লেখ করবেন।
      ৩. কোনো ভুয়া বা মনগড়া দাম দেবেন না। একদম লেটেস্ট আপডেট দিবেন।
      শুধুমাত্র একটি JSON Array রিটার্ন করবেন। অন্য কোনো কথা বলবেন না। ফরম্যাট: [{"name": "পণ্যের নাম (যেমন: ব্রয়লার মুরগি)", "unit": "১ কেজি", "priceRange": "২০০-২১০ টাকা", "trend": "up"}]`;
    } else if (cat === 'notices') {
      prompt = `${timeContext}। গুগল সার্চ করে রাজবাড়ী জেলা প্রশাসন (DC Office), পুলিশ (Police), বা জনপ্রতিনিধিদের (MP) দেওয়া শুধুমাত্র *গত ৭ দিনের* জরুরি নোটিশ খুঁজুন। 
      যদি গত ৭ দিনের মধ্যে প্রশাসন থেকে কোনো নতুন নোটিশ না থাকে, তবে কোনো পুরনো বা ভুয়া নোটিশ দেখাবেন না। সেক্ষেত্রে হুবহু এই JSON টি রিটার্ন করবেন: [{"title": "কোনো নতুন নোটিশ নেই", "date": "আজ", "summary": "প্রশাসন থেকে সাম্প্রতিক কোনো নোটিশ পাওয়া যায়নি।", "priority": "normal"}]
      আর যদি সত্যি নতুন নোটিশ পান, তবে ফরম্যাট হবে: [{"title": "নোটিশের শিরোনাম", "date": "তারিখ", "summary": "সারাংশ", "priority": "high"}]
      শুধুমাত্র JSON Array রিটার্ন করবেন, অন্য কোনো কথা নয়।`;
    } else if (cat === 'jobs') {
      prompt = `${timeContext}। গুগল সার্চ করে রাজবাড়ী জেলার জন্য শুধুমাত্র *বর্তমান সময়ের* নতুন "সরকারি চাকরির বিজ্ঞপ্তি" (Government Jobs) খুঁজুন।
      শর্তসমূহ:
      ১. রাজবাড়ী জেলা প্রশাসন (DC Office), কালেক্টরেট স্কুল (Collectorate School), পুলিশ সুপার কার্যালয়, জেলা পরিষদ, বা অন্যান্য ভেরিফায়েড সরকারি সোর্স থেকে ডাটা নিবেন।
      ২. কোনো পুরনো বছরের (যেমন ২০২৫ বা তার আগের) বিজ্ঞপ্তি দেখাবেন না।
      ৩. যে চাকরির আবেদনের শেষ তারিখ (deadline) পার হয়ে গেছে, সেগুলো একদমই দেখাবেন না।
      ৪. বিজ্ঞপ্তির বিস্তারিত তথ্য (পদের সংখ্যা, যোগ্যতা বা অন্যান্য গুরুত্বপূর্ণ তথ্য) 'details' ফিল্ডে যুক্ত করবেন।
      যদি বর্তমানে রাজবাড়ী জেলায় কোনো নতুন সরকারি চাকরির বিজ্ঞপ্তি না থাকে বা সবগুলোর মেয়াদ শেষ হয়ে যায়, তবে কোনো ভুয়া বা পুরনো বিজ্ঞপ্তি বানাবেন না। সেক্ষেত্রে হুবহু এই JSON টি রিটার্ন করবেন: [{"title": "কোনো নতুন চাকরির বিজ্ঞপ্তি নেই", "org": "সরকারি প্রতিষ্ঠান", "deadline": "-", "link": "#", "type": "Govt", "details": "বর্তমানে রাজবাড়ী জেলায় কোনো নতুন সরকারি চাকরির বিজ্ঞপ্তি পাওয়া যায়নি।"}]
      আর যদি সত্যি নতুন ও চলমান বিজ্ঞপ্তি পান, তবে ফরম্যাট হবে: [{"title": "পদের নাম", "org": "প্রতিষ্ঠানের নাম", "deadline": "শেষ তারিখ", "link": "লিংক", "type": "Govt", "details": "বিস্তারিত তথ্য (যোগ্যতা, পদ সংখ্যা ইত্যাদি)"}]
      শুধুমাত্র JSON Array রিটার্ন করবেন, অন্য কোনো কথা নয়।`;
    }

    try {
      const response = await db.callAI({
        contents: prompt,
        category: cat,
        useSearch: true
      });

      if (response.mode === 'local_engine' || !response.text) throw new Error("FAIL");

      const aiParsed = db.extractJSON(response.text);
      if (aiParsed && Array.isArray(aiParsed) && aiParsed.length > 0) {
        setData(aiParsed);
        setDataSource('live');
        if (cat === 'jobs' || cat === 'market_price' || cat === 'notices') {
          localStorage.setItem(`rajbari_${cat}_cache_v6`, JSON.stringify(aiParsed));
          localStorage.setItem(`rajbari_${cat}_timestamp_v6`, new Date().toDateString());
        }
      } else {
        throw new Error("Invalid JSON");
      }
    } catch (e) {
      console.error("AI Fetch Error:", e);
      setData(fallbackData);
      setDataSource('local');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [category]);

  const [timeTick, setTimeTick] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setTimeTick(prev => prev + 1);
  }, 60000);

  return () => clearInterval(interval);
}, []);

  const normalize = (text: string) => text.toLowerCase().replace(/[ড়র]/g, 'র').replace(/\s+/g, '').trim();

  const findStationInText = (text: string, route: string) => {
    if (!text) return null;
    const stations = route.split(',').map(s => s.trim());
    const nText = normalize(text);
    for (const station of stations) {
      const aliases = STATION_ALIASES[station] || [station];
      for (const alias of aliases) {
        if (nText.includes(normalize(alias))) return station;
      }
    }
    return null;
  };

 const runTrainAIInference = async (train: Train) => {
  if (isInferring) return;
  setIsInferring(true);
  setCurrentStation(null);
  setAiInference({ delayMinutes: 0, confidence: 0, reason: 'অনলাইনে তথ্য খোঁজা হচ্ছে...', isAI: true, sources: [] });
  
  try {
    const now = new Date().toLocaleTimeString('bn-BD');

    const prompt = `এখন সময় ${now}। রাজবাড়ী জেলার "${train.name}" (ট্রেন নং ${train.id}) বর্তমানে কোথায় আছে? ফেসবুক গ্রুপ 'Rajbari Rail Club' বা 'Rajbari Helpline' এবং অনলাইন সোর্স থেকে সর্বশেষ ২ ঘণ্টার আপডেট চেক করুন। আপনার উত্তরের শেষে অবশ্যই "[STATION: স্টেশনের নাম]" ট্যাগটি যোগ করবেন। যদি সঠিক স্টেশন না পান তবে "অজানা" লিখুন।`;

    const response = await db.callAI({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: "আপনি রাজবাড়ী রেলওয়ে ট্র্যাকিং সহকারী। গুগল সার্চ ব্যবহার করে দ্রুত ও সঠিক তথ্য দিন।",
      model: 'gemini-3-flash-preview',
      tools: [{ googleSearch: {} }]
    });

    const text = response.text || "দুঃখিত, কোনো সাম্প্রতিক তথ্য পাওয়া যায়নি।";
    const stationMatch = text.match(/\[STATION:\s*(.*?)\]/i);
    
    if (stationMatch && stationMatch[1] && !stationMatch[1].includes("অজানা")) {
      const found = stationMatch[1].trim();
      const routeStations = train.detailedRoute.split(',').map(s => s.trim());
      const bestMatch = routeStations.find(s => found.includes(s) || s.includes(found));
      setCurrentStation(bestMatch || found);
    }

    setAiInference({ 
      delayMinutes: 0, 
      confidence: 0.95, 
      reason: text.replace(/\[STATION:.*?\]/i, '').trim(), 
      isAI: true, 
      sources: response.groundingMetadata?.groundingChunks || [] 
    });

  } catch (e:any) {

    setAiInference({ 
      delayMinutes: 0, 
      confidence: 0, 
      reason: "দুঃখিত! কানেকশন এরর: " + (e.message || "Unknown error"), 
      isAI: false, 
      sources: [] 
    });

  } finally {

    setIsInferring(false);

  }
};
  const getPrayerTimes = (data: any[]) => {
  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  let currentPrayer = null;
  let nextPrayer = null;

  for (let i = 0; i < data.length; i++) {
    const t = parseTime(data[i].time);

    if (t <= current) {
      currentPrayer = data[i];
    } else if (!nextPrayer) {
      nextPrayer = data[i];
    }
  }

  if (!nextPrayer) nextPrayer = data[0];

  return { currentPrayer, nextPrayer, currentTime: current };
};

  const renderItem = (item: any, index: number) => {
    if (category === 'trains') return (
      <div key={item.id || index} onClick={() => { setSelectedTrain(item); runTrainTracking(item); }} className="bg-white dark:bg-slate-900 p-6 rounded-[2.8rem] shadow-sm mb-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 cursor-pointer active:scale-95 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><TrainFront className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{item.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.route}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[9px] font-black px-3 py-1 rounded-full mb-1 border border-indigo-100/50 uppercase flex items-center gap-1 shadow-sm">
               <Zap className="w-2.5 h-2.5 fill-indigo-600 animate-pulse" /> Tracker
             </div>
             <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{item.departure}</p>
          </div>
        </div>
      </div>
    );

    if (category === 'market_price') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-lime-50 dark:bg-lime-950/20 rounded-2xl text-lime-600">
            <ShoppingBasket className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.unit}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-sm font-black text-slate-800 dark:text-white">{item.priceRange}</p>
          {item.trend === 'up' && <span className="flex items-center text-[10px] text-rose-500 font-bold"><TrendingUp className="w-3 h-3 mr-1" /> বাড়ছে</span>}
          {item.trend === 'down' && <span className="flex items-center text-[10px] text-emerald-500 font-bold"><TrendingDown className="w-3 h-3 mr-1" /> কমছে</span>}
        </div>
      </div>
    );

    if (category === 'notices') return (
      <div key={item.id || index} className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border ${item.priority === 'high' ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/30' : 'border-slate-100 dark:border-slate-800'} shadow-sm`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl ${item.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Megaphone className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</span>
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white text-base mb-2 leading-tight">{item.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">{item.summary}</p>
      </div>
    );

    if (category === 'jobs') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner border border-purple-100/50 dark:border-purple-800/50 group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> {item.org}
              </p>
            </div>
          </div>
          <span className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-indigo-100/50 shadow-sm">{item.type}</span>
        </div>
        {item.details && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl relative z-10 border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {item.details}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
           <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-xl">
             <Clock className="w-4 h-4" />
             <span className="text-[11px] font-black uppercase tracking-wider">শেষ সময়: {item.deadline}</span>
           </div>
           <a href={item.link} target="_blank" className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase px-4 py-2 rounded-xl hover:scale-105 transition-transform shadow-md">
             বিস্তারিত <ExternalLink className="w-3.5 h-3.5" />
           </a>
        </div>
      </div>
    );

    if (category === 'emergency') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-rose-50 dark:border-rose-900/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-2xl text-rose-600 border border-rose-100/50 dark:border-rose-900/50 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base mb-0.5">{item.name}</h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.type}</p>
          </div>
        </div>
        <a href={`tel:${item.number}`} className="relative z-10 p-4 bg-rose-500 text-white rounded-2xl active:scale-90 transition-all shadow-lg shadow-rose-500/30 hover:bg-rose-600 flex items-center gap-2">
          <Phone className="w-5 h-5 animate-pulse" />
          <span className="font-black text-sm tracking-wider">{item.number}</span>
        </a>
      </div>
    );

    if (category === 'hospitals') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border border-emerald-50 dark:border-emerald-900/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl text-emerald-600 border border-emerald-100/50 dark:border-emerald-900/50 group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">{item.name}</h4>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.address}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-emerald-100/50">{item.type}</span>
          <a href={`tel:${item.mobile}`} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors">
            <Phone className="w-4 h-4" /> কল করুন
          </a>
        </div>
      </div>
    );

    if (category === 'doctors') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border border-blue-50 dark:border-blue-900/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl text-blue-600 border border-blue-100/50 dark:border-blue-900/50 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">{item.name}</h4>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider mb-1.5">{item.specialty}</p>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.address}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl">
             <Clock className="w-4 h-4 text-blue-500" />
             <span className="text-[10px] font-bold">{item.timing}</span>
          </div>
          <a href={`tel:${item.mobile}`} className="flex items-center gap-2 bg-blue-500 text-white font-black text-xs px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
            <Phone className="w-4 h-4" /> সিরিয়াল
          </a>
        </div>
      </div>
    );

   if (category === 'prayers') {
  const { currentPrayer, nextPrayer, currentTime } = getPrayerTimes(data);

  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const nextTime = parseTime(nextPrayer?.time || '00:00 AM');
  const diff = nextTime - currentTime;
  const minutesLeft = diff > 0 ? diff : diff + 1440;

  return (
    <div key={item.id || index} className="space-y-3">

      {item.id === data[0]?.id && (
        <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl mb-4">
          <p className="text-xs opacity-80 font-bold">পরবর্তী নামাজ</p>
          <h3 className="text-xl font-black">{nextPrayer?.name}</h3>
          <p className="text-3xl font-black mt-1">{nextPrayer?.time}</p>
          <div className="mt-3 text-sm font-bold">
            ⏳ {minutesLeft} মিনিট বাকি
          </div>
        </div>
      )}

      <div
        className={`p-5 rounded-[2.5rem] transition-all duration-300 border ${
          item.name === currentPrayer?.name
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl'
            : 'bg-white dark:bg-slate-900 border-emerald-50 dark:border-emerald-900/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black">{item.name}</h4>
            <p className="text-xs font-bold opacity-70">{item.type}</p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur font-black text-lg">
            {item.time}
          </div>
        </div>

        {item.name === currentPrayer?.name && (
          <div className="mt-3 text-xs font-bold animate-pulse">
            🟢 এখনকার নামাজ
          </div>
        )}
      </div>
    </div>
  );
}

    if (category === 'holidays') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-orange-50 dark:border-orange-900/20 shadow-sm relative overflow-hidden group">
        <div className="absolute -left-4 -top-4 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl text-orange-600 border border-orange-100/50 dark:border-orange-900/50">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5">{item.name}</h4>
            <p className="text-[11px] text-orange-500 font-black uppercase tracking-widest">{item.date}</p>
          </div>
        </div>
        <div className="relative z-10 text-right">
          <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-orange-100/50 dark:border-orange-800/50">{item.duration}</span>
        </div>
      </div>
    );

    if (category === 'education') return (
      <div key={item.id || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] mb-4 border border-indigo-50 dark:border-indigo-900/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl text-indigo-600 border border-indigo-100/50 dark:border-indigo-900/50 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">{item.name}</h4>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.address}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase border border-indigo-100/50">{item.type}</span>
          {item.website && (
            <a href={item.website} target="_blank" className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs px-4 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-colors">
              ওয়েবসাইট <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );

    return (
        <div key={item.id || index} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-slate-50 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-indigo-500"><Info className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name || item.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{item.number || item.mobile || item.time || item.deadline || item.priceRange}</p>
            </div>
          </div>
          {(item.mobile || item.number) && <a href={`tel:${item.mobile || item.number}`} className="p-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl active:scale-90 transition-all"><Phone className="w-5 h-5" /></a>}
        </div>
    );
  };

  return (
    <div className="px-6 py-6 pb-44 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-none mb-1">
             {category === 'trains' ? 'স্মার্ট ট্রেন রাডার' : 
              category === 'market_price' ? 'লাইভ বাজারদর' :
              category === 'notices' ? 'জরুরি নোটিশ' :
              category === 'jobs' ? 'চাকরি বিজ্ঞপ্তি' : 'বিস্তারিত তালিকা'}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em]">
              {isAiLoading ? 'Scanning Socials...' : 
               dataSource === 'live' ? 'Live Cloud Active' : 
               dataSource === 'cache' ? 'Data Cached' : 'Smart Engine Offline'}
            </p>
            {(dataSource === 'live' || isAiLoading) && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
          </div>
        </div>
        <button onClick={() => fetchData(true)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-indigo-600 active:rotate-180 transition-all">
           <RefreshCcw className={`w-5 h-5 ${loading || isAiLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">পাওয়ারিং আপ স্মার্ট ইঞ্জিন...</p>
        </div>
      ) : (
        <div className="animate-slide-up space-y-1">
          {isAiLoading && (
            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/50 mb-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3 animate-bounce" /> Smart Scan in Progress
                </span>
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              </div>
              <div className="w-full h-1 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div className="w-full h-full bg-indigo-600 animate-[shimmer_1.5s_infinite]"></div>
              </div>
            </div>
          )}
          {data.length > 0 ? data.map((item, i) => renderItem(item, i)) : <div className="text-center py-20 text-slate-400 font-bold">কোনো তথ্য পাওয়া যায়নি</div>}
        </div>
      )}

      {selectedTrain && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-end md:items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-3xl relative animate-slide-up flex flex-col max-h-[92vh]">
            <button onClick={() => { setSelectedTrain(null); setCurrentStation(null); }} className="absolute top-8 right-8 p-3 bg-white dark:bg-slate-800 rounded-full text-slate-400 z-50 shadow-xl active:scale-90 transition-all hover:text-rose-500"><X className="w-6 h-6" /></button>
            <div className="p-8 pb-36 overflow-y-auto no-scrollbar">
               <div className="flex items-center gap-5 mb-10">
                 <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-pulse-slow"><TrainFront className="w-8 h-8" /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{selectedTrain.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/20 bg-indigo-600 text-white">
                         <Facebook className="w-3 h-3 fill-white" /> ফেসবুক লাইভ আপডেট
                       </span>
                    </div>
                 </div>
               </div>
               <div className="bg-white dark:bg-slate-800 rounded-[2.8rem] p-7 border border-slate-100 dark:border-slate-800 shadow-sm mb-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Globe className="w-20 h-20" /></div>
                  <div className="flex items-center gap-2 mb-5">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ফেসবুক গ্রুপ ফিড</span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line italic">
                    {isInferring ? (
                       <div className="flex flex-col gap-3 py-4">
                         <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 bg-indigo-500 w-1/3 animate-shimmer"></div>
                         </div>
                         <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest animate-pulse">ফেসবুক গ্রুপ স্ক্যানিং...</p>
                       </div>
                    ) : aiInference.reason}
                  </div>
                  {!isInferring && sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><LinkIcon className="w-3 h-3" /> তথ্যসূত্র:</p>
                       {sources.map((src, i) => (
                         <a key={i} href={src.uri} target="_blank" className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all">
                            <span className="text-xs font-bold text-indigo-600 truncate max-w-[200px]">{src.title}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                         </a>
                       ))}
                    </div>
                  )}
               </div>
               <div className="space-y-6">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> Live Station Radar</h4>
                 <div className="relative pl-10 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    {selectedTrain.detailedRoute.split(',').map((st, idx) => {
                      const stationName = st.trim();
                      const isCurrent = currentStation && normalize(stationName).includes(normalize(currentStation));
                      return (
                        <div key={idx} className="relative flex items-center gap-5 group/st">
                          <div className={`absolute -left-[30px] w-6 h-6 rounded-full border-[3px] bg-white dark:bg-slate-900 transition-all duration-1000 flex items-center justify-center ${isCurrent ? 'border-indigo-600 scale-150 shadow-[0_0_20px_rgba(79,70,229,0.5)] z-10' : 'border-slate-300 dark:border-slate-600'}`}>
                             {isCurrent && <TrainFront className="w-3 h-3 text-indigo-600 animate-bounce" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-black transition-all duration-700 ${isCurrent ? 'text-indigo-600 dark:text-indigo-400 scale-110 tracking-tight' : 'text-slate-400 opacity-60'}`}>
                               {stationName}
                            </span>
                            {isCurrent && <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-0.5 animate-pulse">Now Crossing</span>}
                          </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-2xl backdrop-blur-md">
               <button 
                 disabled={isInferring}
                 onClick={() => runTrainTracking(selectedTrain)}
                 className="w-full py-6 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center gap-4 text-white font-black shadow-[0_15px_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all disabled:opacity-50 group"
               >
                 {isInferring ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />}
                 {isInferring ? 'রিয়েল-টাইম তথ্য খোঁজা হচ্ছে...' : 'লাইভ লোকেশন আপডেট করুন'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
