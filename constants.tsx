
import React from 'react';
import { 
  ShieldAlert, 
  UserRoundSearch, 
  Building2, 
  Crown, 
  Clock, 
  CalendarCheck, 
  School,
  Map as MapIcon,
  TrainFront,
  Landmark,
  Megaphone,
  Briefcase,
  ShoppingBasket
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES = [
  { id: 'emergency' as Category, title: 'জরুরি সেবা', icon: <ShieldAlert className="w-7 h-7" />, color: 'bg-rose-500', textColor: 'text-rose-500', bgColor: 'bg-rose-50' },
  { id: 'doctors' as Category, title: 'ডাক্তার তালিকা', icon: <UserRoundSearch className="w-7 h-7" />, color: 'bg-blue-500', textColor: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 'hospitals' as Category, title: 'হাসপাতাল ও ক্লিনিক', icon: <Building2 className="w-7 h-7" />, color: 'bg-emerald-500', textColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  { id: 'trains' as Category, title: 'ট্রেন সময়সূচী', icon: <TrainFront className="w-7 h-7" />, color: 'bg-indigo-600', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'govt_services' as Category, title: 'সরকারি সেবা', icon: <Landmark className="w-7 h-7" />, color: 'bg-cyan-600', textColor: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { id: 'notices' as Category, title: 'জরুরি নোটিশ', icon: <Megaphone className="w-7 h-7" />, color: 'bg-orange-600', textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'jobs' as Category, title: 'চাকরি বিজ্ঞপ্তি', icon: <Briefcase className="w-7 h-7" />, color: 'bg-purple-600', textColor: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'market_price' as Category, title: 'বাজারদর (AI)', icon: <ShoppingBasket className="w-7 h-7" />, color: 'bg-lime-600', textColor: 'text-lime-600', bgColor: 'bg-lime-50' },
  { id: 'prayer' as Category, title: 'নামাজের সময়সূচি', icon: <Clock className="w-7 h-7" />, color: 'bg-violet-500', textColor: 'text-violet-500', bgColor: 'bg-violet-50' },
  { id: 'holidays' as Category, title: 'ছুটির তালিকা', icon: <CalendarCheck className="w-7 h-7" />, color: 'bg-orange-500', textColor: 'text-orange-500', bgColor: 'bg-orange-50' },
  { id: 'education' as Category, title: 'শিক্ষা প্রতিষ্ঠান', icon: <School className="w-7 h-7" />, color: 'bg-sky-500', textColor: 'text-sky-500', bgColor: 'bg-sky-50' },
  { id: 'personalities' as Category, title: 'গুরুত্বপূর্ণ ব্যক্তি', icon: <Crown className="w-7 h-7" />, color: 'bg-amber-500', textColor: 'text-amber-500', bgColor: 'bg-amber-50' },
];
