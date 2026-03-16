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

// স্টেশন এলিয়াস লজিক (প্রথম কোডের মতো নিখুঁত ডিটেকশনের জন্য)
const STATION_ALIASES: Record<string, string[]> = {
  "ঢাকা (কমলাপুর)": ["ঢাকা", "কমলাপুর", "komlapur", "dhaka"],
  "রাজবাড়ী": ["রাজবাড়ি", "রাজবাড়ী", "rajbari"],
  "পাংশা": ["পাংশা", "pangsha"],
  "ভাঙ্গা জংশন": ["ভাঙ্গা", "bhanga"],
  "মাওয়া": ["মাওয়া", "mawa"],
  "বেনাপোল": ["বেনাপোল", "benapole"],
  "কুষ্টিয়া কোর্ট": ["কুষ্টিয়া", "kushtia"],
  "পোড়াদহ জংশন": ["পোড়াদহ", "poradoho"],
  "চুয়াডাঙ্গা": ["চুয়াডাঙ্গা", "chuadanga"],
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
    return `আজ ${now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}, সময় ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  const normalize = (text: string) => text.toLowerCase().replace(/[ড়র]/g, 'র').replace(/\s+/g, '').trim();

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

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setIsAiLoading(false);
    try {
      const localItems = await db.getCategory(category);
      setData(localItems);
      setDataSource('local');
      
      if (['market_price', 'notices', 'jobs'].includes(category)) {
        const cacheKey = `rajbari_${category}_cache_v6`;
        const timeKey = `rajbari_${category}_timestamp_v6`;
        if (!forceRefresh) {
          const cachedData = localStorage.getItem(cacheKey);
          const cacheTime = localStorage.getItem(timeKey);
          if (cachedData && cacheTime === new Date().toDateString()) {
            setData(JSON.parse(cachedData));
            setDataSource('cache');
            setLoading(false);
            return;
          }
        }
        await fetchAiCategoryData(category, localItems);
      }
    } catch (e) {
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
      prompt = `${timeContext}। রাজবাড়ী জেলার সর্বশেষ খুচরা বাজারদর JSON Array ফরম্যাটে দিন। [{"name": "পণ্য", "unit": "১ কেজি", "priceRange": "দাম", "trend": "up/down/stable"}]`;
    } else if (cat === 'notices') {
      prompt = `${timeContext}। রাজবাড়ী জেলা প্রশাসনের সর্বশেষ ৭ দিনের জরুরি নোটিশ দিন। JSON Array ফরম্যাটে।`;
    } else if (cat === 'jobs') {
      prompt = `${timeContext}। রাজবাড়ীর সর্বশেষ সরকারি চাকরির বিজ্ঞপ্তি দিন। JSON Array ফরম্যাটে।`;
    }

    try {
      const response = await db.callAI({ contents: prompt, useSearch: true });
      const aiParsed = db.extractJSON(response.text);
      if (aiParsed) {
        setData(aiParsed);
        setDataSource('live');
        localStorage.setItem(`rajbari_${cat}_cache_v6`, JSON.stringify(aiParsed));
        localStorage.setItem(`rajbari_${cat}_timestamp_v6`, new Date().toDateString());
      }
    } catch (e) {
      setData(fallbackData);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- আপডেট করা ট্রেন লজিক ---
  const runTrainTracking = async (train: Train) => {
    if (isInferring) return;
    setIsInferring(true);
    setCurrentStation(null);
    setSources([]);
    const timeContext = getLiveTimeContext();
    setAiInference({ reason: 'ফেসবুক এবং নিউজ পোর্টাল স্ক্যান করা হচ্ছে...', delay: 'হিসাব হচ্ছে...' });
    
    try {
      const prompt = `${timeContext}। 
      গুগল সার্চে সরাসরি "${train.name} train location today" অথবা "${train.name} ট্রেন লাইভ লোকেশন" লিখে সার্চ করুন। 
      বিশেষ করে ফেসবুকের ট্র্যাকিং গ্রুপ থেকে আজকের আপডেট খুঁজুন।
      নির্দেশনা:
      ১. আপনার উত্তরের শেষে অবশ্যই [STATION: স্টেশনের_নাম] ফরম্যাটে ট্রেনটির বর্তমান স্টেশন লিখবেন।
      ২. স্টেশনের নামটি অবশ্যই এই লিস্ট থেকে হতে হবে: ${train.detailedRoute}।`;
      
      const response = await db.callAI({ contents: prompt, useSearch: true });
      if (!response.text) throw new Error("FAIL");
      
      const cleanReason = response.text.replace(/\[STATION:.*?\]/gi, '').trim();
      setAiInference({ reason: cleanReason, delay: 'লাইভ ডাটা' });
      setSources(response.sources || []);
      
      let found = null;
      const stationMatch = response.text.match(/\[STATION:\s*(.+?)\]/i);
      if (stationMatch) found = findStationInText(stationMatch[1], train.detailedRoute);
      if (!found) found = findStationInText(response.text, train.detailedRoute);
      
      if (found) {
        setCurrentStation(found);
      } else {
        throw new Error("No Station Found");
      }
    } catch (error) {
      // অফলাইন ক্যালকুলেশন (প্রথম কোডের মূল লজিক)
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const depTimeStr = train.departure; 
      const isPM = depTimeStr.includes('PM');
      const timeParts = depTimeStr.replace(' AM', '').replace(' PM', '').split(':');
      let h = parseInt(timeParts[0]);
      if (isPM && h < 12) h += 12;
      const depMin = h * 60 + parseInt(timeParts[1]);
      
      const stations = train.detailedRoute.split(',').map(s => s.trim());
      const diff = currentMin - depMin;
      let loc = stations[0];
      if (diff > 0) {
        const idx = Math.min(Math.floor(diff / 30), stations.length - 1);
        loc = stations[idx];
      }
      setAiInference({ 
        reason: `সার্ভার এরর: লাইভ ডাটা পাওয়া যায়নি। সময়সূচী অনুযায়ী ট্রেনটি সম্ভবত এখন ${loc} স্টেশনের আশেপাশে।`, 
        delay: 'শিডিউল অনুযায়ী' 
      });
      setCurrentStation(loc);
    } finally {
      setIsInferring(false);
    }
  };

  useEffect(() => { fetchData(); }, [category]);

  const renderItem = (item: any, index: number) => {
    if (category === 'trains') return (
      <div key={item.id || index} onClick={() => { setSelectedTrain(item); runTrainTracking(item); }} className="bg-white dark:bg-slate-900 p-6 rounded-[2.8rem] shadow-sm mb-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 cursor-pointer active:scale-95 transition-all group">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><TrainFront className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{item.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.route}</p>
            </div>
          </div>
          <div className="text-right">
             <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[9px] font-black px-3 py-1 rounded-full mb-1 flex items-center gap-1"><Zap className="w-2.5 h-2.5 animate-pulse" /> Tracker</div>
             <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{item.departure}</p>
          </div>
        </div>
      </div>
    );

    if (category === 'market_price') return (
        <div key={item.id || index} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-slate-50 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-lime-50 dark:bg-lime-950/20 rounded-2xl text-lime-600"><ShoppingBasket className="w-6 h-6" /></div>
            <div><h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4><p className="text-[10px] text-slate-400 font-bold">{item.unit}</p></div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-800 dark:text-white">{item.priceRange}</p>
            {item.trend === 'up' && <span className="text-[10px] text-rose-500 font-bold flex items-center justify-end"><TrendingUp className="w-3 h-3 mr-1" /> বাড়ছে</span>}
            {item.trend === 'down' && <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end"><TrendingDown className="w-3 h-3 mr-1" /> কমছে</span>}
          </div>
        </div>
    );

    return (
        <div key={item.id || index} className="bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] mb-3 flex items-center justify-between border border-slate-50 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-indigo-500"><Info className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name || item.title || item.org}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{item.number || item.mobile || item.time || item.deadline}</p>
            </div>
          </div>
          {(item.mobile || item.number) && <a href={`tel:${item.mobile || item.number}`} className="p-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl active:scale-90 transition-all"><Phone className="w-5 h-5" /></a>}
        </div>
    );
  };

  return (
    <div className="px-6 py-6 pb-44 max-w-lg mx-auto">
      {/* ক্যাটাগরি হেডার */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-none mb-1">
             {category === 'trains' ? 'স্মার্ট ট্রেন রাডার' : 
              category === 'market_price' ? 'লাইভ বাজারদর' : 'বিস্তারিত তালিকা'}
          </h3>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em]">
            {isAiLoading ? 'Scanning...' : dataSource === 'live' ? 'Live Active' : 'Offline Engine'}
          </p>
        </div>
        <button onClick={() => fetchData(true)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-indigo-600 active:rotate-180 transition-all">
           <RefreshCcw className={`w-5 h-5 ${loading || isAiLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* মেইন কন্টেন্ট */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 opacity-20" />
        </div>
      ) : (
        <div className="animate-slide-up space-y-1">
          {data.length > 0 ? data.map((item, i) => renderItem(item, i)) : <div className="text-center py-20 text-slate-400">কোনো তথ্য পাওয়া যায়নি</div>}
        </div>
      )}

      {/* ট্রেন ডিটেইলস মডাল */}
      {selectedTrain && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-end md:items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-3xl relative animate-slide-up flex flex-col max-h-[92vh]">
            <button onClick={() => { setSelectedTrain(null); setCurrentStation(null); }} className="absolute top-8 right-8 p-3 bg-white dark:bg-slate-800 rounded-full text-slate-400 z-50"><X className="w-6 h-6" /></button>
            <div className="p-8 pb-36 overflow-y-auto no-scrollbar">
               <div className="flex items-center gap-5 mb-10">
                 <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white"><TrainFront className="w-8 h-8" /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">{selectedTrain.name}</h3>
                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-indigo-600 text-white flex items-center gap-1.5 mt-1">
                      <Facebook className="w-3 h-3 fill-white" /> ফেসবুক লাইভ আপডেট
                    </span>
                 </div>
               </div>
               
               <div className="bg-white dark:bg-slate-800 rounded-[2.8rem] p-7 border border-slate-100 dark:border-slate-800 mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ফেসবুক গ্রুপ ফিড</span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 italic whitespace-pre-line">
                    {isInferring ? "ফেসবুক গ্রুপ স্ক্যানিং..." : aiInference.reason}
                  </div>
                  {!isInferring && sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">তথ্যসূত্র:</p>
                       {sources.slice(0,2).map((src, i) => (
                         <a key={i} href={src.uri} target="_blank" className="text-[10px] text-indigo-600 block truncate">{src.title}</a>
                       ))}
                    </div>
                  )}
               </div>

               <div className="space-y-6">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> Live Station Radar</h4>
                 <div className="relative pl-10 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                    {selectedTrain.detailedRoute.split(',').map((st, idx) => {
                      const sName = st.trim();
                      const isCurrent = currentStation && normalize(sName).includes(normalize(currentStation));
                      return (
                        <div key={idx} className="relative flex items-center gap-5">
                          <div className={`absolute -left-[30px] w-6 h-6 rounded-full border-[3px] bg-white dark:bg-slate-900 flex items-center justify-center ${isCurrent ? 'border-indigo-600 scale-150 z-10 shadow-lg' : 'border-slate-300 dark:border-slate-600'}`}>
                             {isCurrent && <TrainFront className="w-3 h-3 text-indigo-600 animate-bounce" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-black ${isCurrent ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 opacity-60'}`}>{sName}</span>
                            {isCurrent && <span className="text-[8px] font-black text-indigo-500 uppercase animate-pulse">Now Crossing</span>}
                          </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>
            {/* ফ্লোটিং অ্যাকশন বাটন */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
               <button disabled={isInferring} onClick={() => runTrainTracking(selectedTrain)} className="w-full py-6 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center gap-4 text-white font-black shadow-xl active:scale-95 transition-all disabled:opacity-50">
                 {isInferring ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6" />}
                 {isInferring ? 'তথ্য খোঁজা হচ্ছে...' : 'লাইভ আপডেট করুন'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
