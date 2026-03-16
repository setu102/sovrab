
import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabase';

const getFallbackData = (category: string) => {
  if (category === 'trains') {
    return [
      { id: '1', name: 'মধুমতি এক্সপ্রেস (৭৫৫)', route: 'রাজবাড়ী - ঢাকা', detailedRoute: 'রাজবাড়ী, পাঁচুরিয়া, আমিরাবাদ, ফরিদপুর, বাখুন্ডা, পুখুরিয়া, তালমা, ভাঙ্গা, ভাঙ্গা জংশন, শিবচর, পদ্মা, মাওয়া, শ্রীনগর, নিমতলা, গেন্ডারিয়া, ঢাকা (কমলাপুর)', departure: '06:00 AM', arrival: '08:40 AM', offDay: 'বৃহস্পতিবার', type: 'intercity' },
      { id: '2', name: 'মধুমতি এক্সপ্রেস (৭৫৬)', route: 'ঢাকা - রাজবাড়ী', detailedRoute: 'ঢাকা (কমলাপুর), গেন্ডারিয়া, নিমতলা, শ্রীনগর, মাওয়া, পদ্মা, শিবচর, ভাঙ্গা জংশন, ভাঙ্গা, তালমা, পুখুরিয়া, বাখুন্ডা, ফরিদপুর, আমিরাবাদ, পাঁচুরিয়া, রাজবাড়ী', departure: '03:00 PM', arrival: '05:40 PM', offDay: 'বৃহস্পতিবার', type: 'intercity' },
      { id: '3', name: 'নকশীকাঁথা কমিউটার (২৫)', route: 'রাজবাড়ী - খুলনা', detailedRoute: 'রাজবাড়ী, সূর্যনগর, বেলগাছি, কালুখালী, পাংশা, খোকসা, কুমারখালী, কুষ্টিয়া কোর্ট, কুষ্টিয়া, পোড়াদহ জংশন, হালসা, আলমডাঙ্গা, চুয়াডাঙ্গা, দর্শনা, উথলী, আনসারবাড়িয়া, সাফদারপুর, কোটচাঁদপুর, মোবারকগঞ্জ, বারোবাজার, যশোর, নওয়াপাড়া, ফুলতলা, দৌলতপুর, খুলনা', departure: '08:10 AM', arrival: '02:10 PM', offDay: 'নেই', type: 'commuter' },
      { id: '4', name: 'নকশীকাঁথা কমিউটার (২৬)', route: 'খুলনা - রাজবাড়ী', detailedRoute: 'খুলনা, দৌলতপুর, ফুলতলা, নওয়াপাড়া, যশোর, বারোবাজার, মোবারকগঞ্জ, কোটচাঁদপুর, সাফদারপুর, আনসারবাড়িয়া, উথলী, দর্শনা, চুয়াডাঙ্গা, আলমডাঙ্গা, হালসা, পোড়াদহ জংশন, কুষ্টিয়া, কুষ্টিয়া কোর্ট, কুমারখালী, খোকসা, পাংশা, কালুখালী, বেলগাছি, সূর্যনগর, রাজবাড়ী', departure: '11:30 PM', arrival: '05:40 AM', offDay: 'নেই', type: 'commuter' },
      { id: '5', name: 'ভাটিয়াপাড়া এক্সপ্রেস (৭৭)', route: 'রাজবাড়ী - ভাটিয়াপাড়া', detailedRoute: 'রাজবাড়ী, পাঁচুরিয়া, আমিরাবাদ, ফরিদপুর, বাখুন্ডা, পুখুরিয়া, তালমা, ভাঙ্গা, পুখুরিয়া, বোয়ালমারী, সহস্রাইল, ভাটিয়াপাড়া ঘাট', departure: '06:30 AM', arrival: '10:00 AM', offDay: 'নেই', type: 'mail' },
      { id: '6', name: 'ভাটিয়াপাড়া এক্সপ্রেস (৭৮)', route: 'ভাটিয়াপাড়া - রাজবাড়ী', detailedRoute: 'ভাটিয়াপাড়া ঘাট, সহস্রাইল, বোয়ালমারী, পুখুরিয়া, ভাঙ্গা, তালমা, পুখুরিয়া, বাখুন্ডা, ফরিদপুর, আমিরাবাদ, পাঁচুরিয়া, রাজবাড়ী', departure: '10:30 AM', arrival: '02:00 PM', offDay: 'নেই', type: 'mail' },
      { id: '7', name: 'রাজবাড়ী এক্সপ্রেস (১০৫)', route: 'রাজবাড়ী - ভাঙ্গা', detailedRoute: 'রাজবাড়ী, পাঁচুরিয়া, আমিরাবাদ, ফরিদপুর, বাখুন্ডা, পুখুরিয়া, তালমা, ভাঙ্গা', departure: '02:45 PM', arrival: '04:15 PM', offDay: 'নেই', type: 'commuter' },
      { id: '8', name: 'রাজবাড়ী এক্সপ্রেস (১০৬)', route: 'ভাঙ্গা - রাজবাড়ী', detailedRoute: 'ভাঙ্গা, তালমা, পুখুরিয়া, বাখুন্ডা, ফরিদপুর, আমিরাবাদ, পাঁচুরিয়া, রাজবাড়ী', departure: '05:00 PM', arrival: '06:30 PM', offDay: 'নেই', type: 'commuter' },
      { id: '9', name: 'বেনাপোল এক্সপ্রেস (৭৯৫)', route: 'বেনাপোল - ঢাকা', detailedRoute: 'বেনাপোল, নাভারণ, ঝিকরগাছা, যশোর, মোবারকগঞ্জ, কোটচাঁদপুর, দর্শনা হল্ট, চুয়াডাঙ্গা, পোড়াদহ জংশন, কুষ্টিয়া কোর্ট, রাজবাড়ী, ফরিদপুর, ভাঙ্গা জংশন, ঢাকা (কমলাপুর)', departure: '01:00 PM', arrival: '08:45 PM', offDay: 'বুধবার', type: 'intercity' },
      { id: '10', name: 'বেনাপোল এক্সপ্রেস (৭৯৬)', route: 'ঢাকা - বেনাপোল', detailedRoute: 'ঢাকা (কমলাপুর), ভাঙ্গা জংশন, ফরিদপুর, রাজবাড়ী, কুষ্টিয়া কোর্ট, পোড়াদহ জংশন, চুয়াডাঙ্গা, দর্শনা হল্ট, কোটচাঁদপুর, মোবারকগঞ্জ, যশোর, ঝিকরগাছা, নাভারণ, বেনাপোল', departure: '11:45 PM', arrival: '07:20 AM', offDay: 'বুধবার', type: 'intercity' },
      { id: '11', name: 'সুন্দরবন এক্সপ্রেস (৭২৫)', route: 'খুলনা - ঢাকা', detailedRoute: 'খুলনা, দৌলতপুর, নওয়াপাড়া, যশোর, মোবারকগঞ্জ, কোটচাঁদপুর, চুয়াডাঙ্গা, আলমডাঙ্গা, পোড়াদহ জংশন, কুষ্টিয়া কোর্ট, রাজবাড়ী, ফরিদপুর, ভাঙ্গা জংশন, ঢাকা (কমলাপুর)', departure: '09:45 PM', arrival: '05:10 AM', offDay: 'মঙ্গলবার', type: 'intercity' },
      { id: '12', name: 'সুন্দরবন এক্সপ্রেস (৭২৬)', route: 'ঢাকা - খুলনা', detailedRoute: 'ঢাকা (কমলাপুর), ভাঙ্গা জংশন, ফরিদপুর, রাজবাড়ী, কুষ্টিয়া কোর্ট, পোড়াদহ জংশন, আলমডাঙ্গা, চুয়াডাঙ্গা, কোটচাঁদপুর, মোবারকগঞ্জ, যশোর, নওয়াপাড়া, দৌলতপুর, খুলনা', departure: '08:15 AM', arrival: '03:50 PM', offDay: 'বুধবার', type: 'intercity' }
    ];
  }
  if (category === 'emergency') {
    return [
      { id: '1', name: 'জাতীয় জরুরি সেবা', number: '999', type: 'government' },
      { id: '2', name: 'রাজবাড়ী সদর থানা', number: '01320104443', type: 'police' },
      { id: '3', name: 'পাংশা মডেল থানা', number: '01320104475', type: 'police' },
      { id: '4', name: 'গোয়ালন্দ ঘাট থানা', number: '01320104507', type: 'police' },
      { id: '5', name: 'বালিয়াকান্দি থানা', number: '01320104539', type: 'police' },
      { id: '6', name: 'কালুখালী থানা', number: '01320104571', type: 'police' },
      { id: '7', name: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স, রাজবাড়ী', number: '01730002236', type: 'fire' },
      { id: '8', name: 'ফায়ার সার্ভিস, পাংশা', number: '01730002237', type: 'fire' },
      { id: '9', name: 'ফায়ার সার্ভিস, গোয়ালন্দ', number: '01730002238', type: 'fire' },
      { id: '10', name: 'রাজবাড়ী সদর হাসপাতাল এম্বুলেন্স', number: '01730324792', type: 'ambulance' },
      { id: '11', name: 'আল-আমিন এম্বুলেন্স সার্ভিস', number: '01711223344', type: 'ambulance' },
      { id: '12', name: 'জেলা প্রশাসক, রাজবাড়ী', number: '01713333333', type: 'government' },
      { id: '13', name: 'পুলিশ সুপার, রাজবাড়ী', number: '01320104400', type: 'police' }
    ];
  }
  if (category === 'hospitals') {
    return [
      { id: '1', name: 'রাজবাড়ী সদর হাসপাতাল', address: 'সদর হাসপাতাল রোড, রাজবাড়ী', mobile: '02-478807555', type: 'govt' },
      { id: '2', name: 'পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স', address: 'পাংশা, রাজবাড়ী', mobile: '01730324793', type: 'govt' },
      { id: '3', name: 'গোয়ালন্দ উপজেলা স্বাস্থ্য কমপ্লেক্স', address: 'গোয়ালন্দ, রাজবাড়ী', mobile: '01730324794', type: 'govt' },
      { id: '4', name: 'বালিয়াকান্দি উপজেলা স্বাস্থ্য কমপ্লেক্স', address: 'বালিয়াকান্দি, রাজবাড়ী', mobile: '01730324795', type: 'govt' },
      { id: '5', name: 'কালুখালী উপজেলা স্বাস্থ্য কমপ্লেক্স', address: 'কালুখালী, রাজবাড়ী', mobile: '01730324796', type: 'govt' },
      { id: '6', name: 'রাজবাড়ী ক্লিনিক এন্ড ডায়াগনস্টিক সেন্টার', address: 'বড়পুল, রাজবাড়ী', mobile: '01711000001', type: 'private' },
      { id: '7', name: 'আরোগ্য ক্লিনিক', address: 'পান্না চত্বর, রাজবাড়ী', mobile: '01711000002', type: 'private' },
      { id: '8', name: 'সেন্ট্রাল হাসপাতাল', address: 'স্টেশন রোড, রাজবাড়ী', mobile: '01711000003', type: 'private' },
      { id: '9', name: 'ইসলামী ব্যাংক কমিউনিটি হাসপাতাল', address: 'নতুন বাজার, রাজবাড়ী', mobile: '01711000004', type: 'private' },
      { id: '10', name: 'পপুলার ডায়াগনস্টিক সেন্টার', address: 'হাসপাতাল রোড, রাজবাড়ী', mobile: '01711000005', type: 'diagnostic' }
    ];
  }
  if (category === 'doctors') {
    return [
      { id: '1', name: 'ডাঃ মোঃ শফিকুল ইসলাম', specialty: 'মেডিসিন বিশেষজ্ঞ', address: 'রাজবাড়ী ক্লিনিক, বড়পুল', mobile: '01711000001', timing: 'বিকাল ৪টা - রাত ৮টা' },
      { id: '2', name: 'ডাঃ ফাতেমা বেগম', specialty: 'গাইনী ও প্রসূতি রোগ বিশেষজ্ঞ', address: 'আরোগ্য ক্লিনিক, পান্না চত্বর', mobile: '01711000002', timing: 'বিকাল ৩টা - রাত ৭টা' },
      { id: '3', name: 'ডাঃ আব্দুল্লাহ আল মামুন', specialty: 'শিশু রোগ বিশেষজ্ঞ', address: 'সেন্ট্রাল হাসপাতাল, স্টেশন রোড', mobile: '01711000003', timing: 'সকাল ১০টা - দুপুর ১টা' },
      { id: '4', name: 'ডাঃ এস. এম. তারেক', specialty: 'হৃদরোগ বিশেষজ্ঞ', address: 'ইসলামী ব্যাংক হাসপাতাল', mobile: '01711000004', timing: 'বিকাল ৫টা - রাত ৯টা' },
      { id: '5', name: 'ডাঃ রফিকুল হাসান', specialty: 'অর্থোপেডিক সার্জন', address: 'পপুলার ডায়াগনস্টিক সেন্টার', mobile: '01711000005', timing: 'বিকাল ৪টা - রাত ৮টা' },
      { id: '6', name: 'ডাঃ নাজমুল হুদা', specialty: 'চর্ম ও যৌন রোগ বিশেষজ্ঞ', address: 'রাজবাড়ী সদর হাসপাতাল', mobile: '01711000006', timing: 'সকাল ৯টা - দুপুর ২টা' },
      { id: '7', name: 'ডাঃ আয়েশা সিদ্দিকা', specialty: 'নাক, কান ও গলা বিশেষজ্ঞ', address: 'রাজবাড়ী ক্লিনিক', mobile: '01711000007', timing: 'বিকাল ৪টা - রাত ৮টা' },
      { id: '8', name: 'ডাঃ কামরুল ইসলাম', specialty: 'ডায়াবেটিস ও হরমোন বিশেষজ্ঞ', address: 'আরোগ্য ক্লিনিক', mobile: '01711000008', timing: 'বিকাল ৫টা - রাত ৮টা' }
    ];
  }
  if (category === 'prayers') {
    return [
      { id: '1', name: 'ফজর', time: '০৪:৪৫ এএম', type: 'ফরজ' },
      { id: '2', name: 'যোহর', time: '০১:১৫ পিএম', type: 'ফরজ' },
      { id: '3', name: 'আসর', time: '০৪:৩০ পিএম', type: 'ফরজ' },
      { id: '4', name: 'মাগরিব', time: '০৬:১৫ পিএম', type: 'ফরজ' },
      { id: '5', name: 'এশা', time: '০৭:৪৫ পিএম', type: 'ফরজ' },
      { id: '6', name: 'জুম্মা', time: '০১:৩০ পিএম', type: 'ফরজ (শুক্রবার)' },
      { id: '7', name: 'তাহাজ্জুদ', time: '০৩:৩০ এএম', type: 'নফল' }
    ];
  }
  if (category === 'holidays') {
    return [
      { id: '1', name: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস', date: '২১ ফেব্রুয়ারি ২০২৬', duration: '১ দিন' },
      { id: '2', name: 'জাতির পিতার জন্মবার্ষিকী', date: '১৭ মার্চ ২০২৬', duration: '১ দিন' },
      { id: '3', name: 'স্বাধীনতা ও জাতীয় দিবস', date: '২৬ মার্চ ২০২৬', duration: '১ দিন' },
      { id: '4', name: 'জুমাতুল বিদা ও শব-ই-কদর', date: 'এপ্রিল ২০২৬ (চাঁদ দেখা সাপেক্ষে)', duration: '২ দিন' },
      { id: '5', name: 'ঈদুল ফিতর', date: 'এপ্রিল ২০২৬ (চাঁদ দেখা সাপেক্ষে)', duration: '৩ দিন' },
      { id: '6', name: 'পহেলা বৈশাখ', date: '১৪ এপ্রিল ২০২৬', duration: '১ দিন' },
      { id: '7', name: 'মে দিবস', date: '১ মে ২০২৬', duration: '১ দিন' },
      { id: '8', name: 'ঈদুল আজহা', date: 'জুন ২০২৬ (চাঁদ দেখা সাপেক্ষে)', duration: '৩ দিন' },
      { id: '9', name: 'আশুরা', date: 'জুলাই ২০২৬ (চাঁদ দেখা সাপেক্ষে)', duration: '১ দিন' },
      { id: '10', name: 'জাতীয় শোক দিবস', date: '১৫ আগস্ট ২০২৬', duration: '১ দিন' },
      { id: '11', name: 'জন্মাষ্টমী', date: 'আগস্ট ২০২৬', duration: '১ দিন' },
      { id: '12', name: 'ঈদে মিলাদুন্নবী', date: 'সেপ্টেম্বর ২০২৬ (চাঁদ দেখা সাপেক্ষে)', duration: '১ দিন' },
      { id: '13', name: 'দুর্গাপূজা (বিজয়া দশমী)', date: 'অক্টোবর ২০২৬', duration: '১ দিন' },
      { id: '14', name: 'বিজয় দিবস', date: '১৬ ডিসেম্বর ২০২৬', duration: '১ দিন' },
      { id: '15', name: 'যিশু খ্রিস্টের জন্মদিন (বড়দিন)', date: '২৫ ডিসেম্বর ২০২৬', duration: '১ দিন' }
    ];
  }
  if (category === 'education') {
    return [
      { id: '1', name: 'রাজবাড়ী সরকারি কলেজ', address: 'কলেজ রোড, রাজবাড়ী', type: 'সরকারি কলেজ', website: 'http://www.rgc.edu.bd' },
      { id: '2', name: 'রাজবাড়ী সরকারি আদর্শ মহিলা কলেজ', address: 'সদর, রাজবাড়ী', type: 'সরকারি কলেজ', website: 'http://www.rgawc.edu.bd' },
      { id: '3', name: 'পাংশা সরকারি কলেজ', address: 'পাংশা, রাজবাড়ী', type: 'সরকারি কলেজ', website: 'http://www.pangshacollege.edu.bd' },
      { id: '4', name: 'গোয়ালন্দ কামরুল ইসলাম সরকারি কলেজ', address: 'গোয়ালন্দ, রাজবাড়ী', type: 'সরকারি কলেজ', website: '' },
      { id: '5', name: 'রাজবাড়ী সরকারি উচ্চ বিদ্যালয়', address: 'সদর, রাজবাড়ী', type: 'সরকারি বিদ্যালয়', website: '' },
      { id: '6', name: 'রাজবাড়ী সরকারি বালিকা উচ্চ বিদ্যালয়', address: 'সদর, রাজবাড়ী', type: 'সরকারি বিদ্যালয়', website: '' },
      { id: '7', name: 'বালিয়াকান্দি সরকারি কলেজ', address: 'বালিয়াকান্দি, রাজবাড়ী', type: 'সরকারি কলেজ', website: '' },
      { id: '8', name: 'মীর মশাররফ হোসেন ডিগ্রি কলেজ', address: 'পদমদী, বালিয়াকান্দি', type: 'এমপিওভুক্ত কলেজ', website: '' }
    ];
  }
  return [];
};

export const db = {
  extractJSON: (text: string | undefined) => {
    if (!text) return null;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return null;
    } catch (e) { 
      return null; 
    }
  },

  callAI: async (params: { 
    contents: any; 
    systemInstruction?: string;
    useSearch?: boolean;
    category?: string;
  }) => {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

      const baseInstruction = `
        আজ ${dateStr}, সময় ${timeStr}। আপনি রাজবাড়ী স্মার্ট পোর্টালের সহকারী।
        আপনার কাজ রাজবাড়ী জেলা সম্পর্কে নিখুঁত তথ্য দেওয়া।
        ১) ভাষা: বাংলা। ২) তথ্যসূত্র: গুগল সার্চ ব্যবহার করে রিয়েল-টাইম তথ্য দিন। ফেসবুক গ্রুপ, পেজ বা নিউজ পোর্টাল থেকে ট্রেনের লাইভ আপডেট পেলে সোর্সের নাম উল্লেখ করবেন। 
        ৩) সতর্কতা: "Gemini", "AI", বা "জেমিনি" নাম কখনো বলবেন না। ৪) ট্রেন ট্র্যাকিং: সঠিক লোকেশন না পেলে "সম্ভাব্য" বলবেন।
        ${params.systemInstruction || ""}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      let formattedContents;
      if (typeof params.contents === 'string') {
        formattedContents = params.contents;
      } else if (Array.isArray(params.contents)) {
        formattedContents = params.contents.map((msg: any) => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));
      } else {
        formattedContents = params.contents;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: formattedContents,
        config: {
          systemInstruction: baseInstruction,
          tools: params.useSearch ? [{ googleSearch: {} }] : undefined,
          temperature: 0.1,
        }
      });

      return {
        text: response.text,
        mode: 'smart_engine_online',
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || "তথ্যসূত্র",
          uri: chunk.web?.uri || "#"
        })).filter((s: any) => s.uri !== "#") || []
      };

    } catch (error: any) {
      console.error("AI Error:", error);
      return {
        text: null,
        mode: 'local_engine',
        error: error.message
      };
    }
  },

  getCategory: async (category: string) => {
    try {
      if (!supabase) {
        console.warn('Supabase credentials are not set. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        return getFallbackData(category);
      }
      const { data, error } = await supabase
        .from(category)
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return getFallbackData(category);
      }
      
      return data.map((item: any) => {
        const mapped: any = { ...item };
        if ('detailedroute' in mapped) {
          mapped.detailedRoute = mapped.detailedroute;
          delete mapped.detailedroute;
        }
        if ('offday' in mapped) {
          mapped.offDay = mapped.offday;
          delete mapped.offday;
        }
        return mapped;
      });
    } catch (error) {
      console.error(`Error fetching ${category} from Supabase:`, error);
      return getFallbackData(category);
    }
  }
};
