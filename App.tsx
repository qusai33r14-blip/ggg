import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  CircleDot, 
  Moon, 
  Sunrise, 
  Sunset, 
  Clock, 
  Star, 
  Target, 
  ChevronLeft, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Calendar, 
  Lock, 
  BarChart3, 
  TrendingUp, 
  LayoutGrid, 
  Trash2, 
  BookOpen, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  X,
  Zap,
  History,
  Timer,
  Bell,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { View, AttendanceRecord, PrayerDay, PrayerHistory, Goal, GoalCategory, EntryStatus, ReminderSettings } from './types';

// --- Constants ---
const END_MONTH = 7; 
const END_YEAR = 2026; 

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

// --- Sub-Components ---

const Header: React.FC<{ sub?: string }> = ({ sub }) => (
  <header className="py-8 px-4 text-center animate-fade-in">
    <h1 className="text-3xl font-bold text-emerald-400 mb-2">منظومة المتابعة الشاملة</h1>
    <p className="text-slate-400 text-sm font-light">
      {sub || "نظام تتبع العبادات والمهام اليومية"}
    </p>
  </header>
);

const Card: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  onClick: () => void;
  color: string;
}> = ({ title, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className="glass flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-slate-800/80 active:scale-95 group relative overflow-hidden w-full"
  >
    <div className={`p-4 rounded-full ${color} text-white mb-4 group-hover:rotate-12 transition-transform`}>
      {icon}
    </div>
    <span className="text-lg font-semibold">{title}</span>
  </button>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 shadow-red-500/20"
  >
    <ChevronLeft size={20} />
    <span>العودة للرئيسية</span>
  </button>
);

const SimpleBarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-around h-32 w-full gap-2 px-2 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group">
          <div 
            className={`w-full rounded-t-lg transition-all duration-700 ease-out ${d.color}`}
            style={{ height: `${(d.value / max) * 100}%` }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] px-2 py-1 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-10">
              {d.value}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- View Components ---

const HomeView: React.FC<{ onNavigate: (v: View) => void, isPastDeadline: boolean }> = ({ onNavigate, isPastDeadline }) => (
  <div className="max-w-2xl mx-auto px-4 pb-20">
    <Header sub={`التسجيل متاح حتى نهاية شهر ${END_MONTH} / ${END_YEAR}`} />
    
    {isPastDeadline && (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-8 animate-pulse">
        <Lock size={20} />
        <span className="font-semibold text-sm md:text-base">نعتذر، انتهى وقت التسجيل لهذا العام.</span>
      </div>
    )}

    <div className="grid grid-cols-2 gap-4 md:gap-6">
      <Card title="الحضور والغياب" icon={<ClipboardCheck />} onClick={() => onNavigate('attendance')} color="bg-emerald-500" />
      <Card title="خاتم التسبيح" icon={<CircleDot />} onClick={() => onNavigate('tasbeeh')} color="bg-blue-500" />
      <Card title="تسجيل الصلوات" icon={<Moon />} onClick={() => onNavigate('prayers')} color="bg-amber-500" />
      <Card title="أوقات الصلاة" icon={<Clock />} onClick={() => onNavigate('prayerTimes')} color="bg-purple-500" />
      <Card title="مجموع النقاط" icon={<Star />} onClick={() => onNavigate('total')} color="bg-rose-500" />
      <Card title="أهدافي" icon={<Target />} onClick={() => onNavigate('goals')} color="bg-cyan-500" />
      <Card title="تنبيه الفجر" icon={<Bell />} onClick={() => onNavigate('reminders')} color="bg-indigo-500" />
      <Card title="الإحصائيات" icon={<BarChart3 />} onClick={() => onNavigate('statistics')} color="bg-indigo-600" />
    </div>
  </div>
);

const AttendanceView: React.FC<{ 
  attendance: AttendanceRecord[], 
  onSave: (s: 'حاضر' | 'غائب', l: string) => void,
  isPastDeadline: boolean 
}> = ({ attendance, onSave, isPastDeadline }) => {
  const now = new Date();
  const todayKey = getTodayKey();
  const day = now.getDay(); 
  const hour = now.getHours();
  
  const activeLessonsToday: string[] = useMemo(() => {
    let active: string[] = [];
    if (day === 6) { // Saturday
      if (hour >= 3 && hour < 12) active.push('السبت الفجر');
      if (hour >= 12 && hour < 20) active.push('السبت العصر');
    } else if (day === 3) { // Wednesday
      if (hour >= 15 && hour < 23) active.push('الأربعاء المغرب');
    }
    return active;
  }, [day, hour]);
  
  const availableLessons = activeLessonsToday.filter(l => !attendance.some(a => a.key === todayKey && a.lesson === l));

  const chartData = useMemo(() => {
    const uniqueDates = Array.from(new Set(attendance.map(a => a.date))).slice(0, 7).reverse() as string[];
    return uniqueDates.map(d => ({
      label: d.split('/')[0] + '/' + d.split('/')[1],
      value: attendance.filter(a => a.date === d && a.status === 'حاضر').length,
      color: 'bg-emerald-500'
    }));
  }, [attendance]);

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-28">
      <h2 className="text-2xl font-bold mb-6 text-emerald-400 flex items-center gap-2">
        <ClipboardCheck /> الحضور والغياب
      </h2>

      <div className="glass p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-300">إحصائيات الحضور (آخر 7 أيام نشطة)</h3>
        </div>
        <SimpleBarChart data={chartData.length > 0 ? chartData : [{ label: 'لا بيانات', value: 0, color: 'bg-slate-700' }]} />
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            <h3 className="text-sm font-semibold text-slate-300">تسجيل حضور نشط</h3>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {availableLessons.length > 0 ? (
          <div className="space-y-4">
            {availableLessons.map(l => (
              <div key={l} className="glass p-5 rounded-3xl flex items-center justify-between border-r-4 border-emerald-500 animate-slide-up shadow-xl shadow-emerald-500/5">
                <div className="flex-1 text-right">
                  <p className="text-xl font-bold text-white mb-1">{l}</p>
                  <p className="text-xs text-emerald-400/80 font-medium">جلسة التسجيل مفتوحة الآن</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    disabled={isPastDeadline}
                    onClick={() => onSave('حاضر', l)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl transition-all active:scale-90 shadow-lg shadow-emerald-500/20 group"
                    title="تسجيل حضور"
                  >
                    <CheckCircle2 size={28} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    disabled={isPastDeadline}
                    onClick={() => onSave('غائب', l)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-4 rounded-2xl transition-all active:scale-90 border border-slate-700 group"
                    title="تسجيل غياب"
                  >
                    <XCircle size={28} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-8 rounded-3xl text-center border-dashed border-2 border-slate-800/50 bg-slate-900/30">
            {activeLessonsToday.length > 0 ? (
               <div className="flex flex-col items-center">
                 <CheckCircle2 className="mb-3 text-emerald-500" size={40} />
                 <p className="text-sm text-slate-300 font-bold mb-1">تم التسجيل بنجاح!</p>
                 <p className="text-xs text-slate-500">لقد سجلت حضورك لجميع الجلسات المتاحة لهذا الوقت.</p>
               </div>
            ) : (
               <div className="flex flex-col items-center">
                 <Timer className="mb-3 text-slate-600" size={40} />
                 <p className="text-sm text-slate-400 font-bold mb-2">لا توجد جلسات نشطة حالياً</p>
                 <div className="text-[10px] text-slate-500 space-y-1 text-right" dir="rtl">
                   <p>• السبت (الفجر): 03:00 ص - 12:00 م</p>
                   <p>• السبت (العصر): 12:00 م - 08:00 م</p>
                   <p>• الأربعاء (المغرب): 03:00 م - 11:00 م</p>
                 </div>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="glass p-6 rounded-2xl overflow-hidden shadow-inner">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <h3 className="font-semibold text-slate-300">سجل الحضور الأخير</h3>
          </div>
          <div className="flex gap-3 text-[11px] font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {attendance.filter(a => a.status === 'حاضر').length} حاضر
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {attendance.filter(a => a.status === 'غائب').length} غائب
            </span>
          </div>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {attendance.length === 0 ? (
            <div className="text-center py-10 opacity-30">
               <ClipboardCheck size={48} className="mx-auto mb-3" />
               <p className="text-sm font-light">لا يوجد سجلات حضور مسجلة</p>
            </div>
          ) : (
            attendance.map((rec, i) => (
              <div key={i} className={`flex justify-between items-center bg-slate-800/30 p-4 rounded-2xl border-r-4 transition-all hover:bg-slate-800/50 ${rec.status === 'حاضر' ? 'border-emerald-500/50 shadow-emerald-500/5 shadow-md' : 'border-red-500/50 shadow-red-500/5 shadow-md'}`}>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-200">{rec.lesson}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{rec.date}</span>
                </div>
                <div className={`text-[10px] px-3 py-1 rounded-full font-black tracking-tighter uppercase ${rec.status === 'حاضر' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {rec.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const RemindersView: React.FC<{
  settings: ReminderSettings;
  onUpdate: (s: ReminderSettings) => void;
  fajrTime: string | null;
  locationError: string | null;
}> = ({ settings, onUpdate, fajrTime, locationError }) => {
  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-28">
      <h2 className="text-2xl font-bold mb-8 text-indigo-400 flex items-center gap-2">
        <Bell /> تنبيهات الصلاة
      </h2>

      <div className="glass p-6 rounded-3xl mb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${settings.fajrEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
              <Sunrise size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-100">تنبيه صلاة الفجر</p>
              <p className="text-[10px] text-slate-500">سيتم تنبيهك قبل موعد الصلاة</p>
            </div>
          </div>
          <button 
            onClick={() => onUpdate({ ...settings, fajrEnabled: !settings.fajrEnabled })}
            className={`w-14 h-8 rounded-full transition-all relative ${settings.fajrEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${settings.fajrEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {settings.fajrEnabled && (
          <div className="animate-slide-up space-y-4 border-t border-slate-700/50 pt-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">وقت التنبيه (بالدقائق قبل الفجر)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  step="5"
                  value={settings.fajrMinutesBefore}
                  onChange={(e) => onUpdate({ ...settings, fajrMinutesBefore: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-lg font-bold text-indigo-400 w-12 text-center">{settings.fajrMinutesBefore}</span>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">موعد الفجر المتوقع:</span>
                <span className="text-sm font-bold text-indigo-300">{fajrTime || 'جاري التحميل...'}</span>
              </div>
              {fajrTime && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">سيتم التنبيه الساعة:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {(() => {
                      const [h, m] = fajrTime.split(':').map(Number);
                      const d = new Date();
                      d.setHours(h);
                      d.setMinutes(m - settings.fajrMinutesBefore);
                      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {locationError && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-red-400">خطأ في تحديد الموقع</p>
            <p className="text-[10px] text-slate-500">نحتاج للوصول إلى موقعك الجغرافي لحساب أوقات الصلاة بدقة.</p>
          </div>
        </div>
      )}

      <div className="p-4 text-center opacity-40">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          * ملاحظة: يجب إبقاء التطبيق مفتوحاً في المتصفح لضمان عمل التنبيهات.<br/>
          قد لا تعمل التنبيهات في حال إغلاق المتصفح بالكامل.
        </p>
      </div>
    </div>
  );
};

const TasbeehView: React.FC<{ count: number, onInc: () => void, onReset: () => void, isPastDeadline: boolean }> = ({ count, onInc, onReset, isPastDeadline }) => (
  <div className="max-w-md mx-auto px-4 pt-20 flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-10 text-blue-400">خاتم التسبيح</h2>
    <div className="relative w-64 h-64 flex items-center justify-center mb-10">
      <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-dashed animate-[spin_20s_linear_infinite]"></div>
      <div className="glass w-full h-full rounded-full flex flex-col items-center justify-center shadow-2xl border-blue-500/30">
        <span className="text-7xl font-bold text-white mb-2 tracking-widest">{count}</span>
        <span className="text-blue-400 text-sm font-light">مرة</span>
      </div>
    </div>
    <div className="flex gap-6">
      <button 
        onClick={onInc}
        disabled={isPastDeadline}
        className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-90 text-white shadow-lg flex items-center justify-center transition-all disabled:opacity-50 shadow-blue-500/20"
      >
        <Plus size={40} />
      </button>
      <button 
        onClick={onReset}
        disabled={isPastDeadline}
        className="w-16 h-16 mt-4 rounded-full bg-slate-700 hover:bg-slate-600 active:scale-90 text-slate-300 shadow-md flex items-center justify-center transition-all disabled:opacity-50"
      >
        <RotateCcw size={24} />
      </button>
    </div>
  </div>
);

const PrayersView: React.FC<{ history: PrayerHistory, onSetStatus: (p: keyof PrayerDay, s: EntryStatus) => void, isPastDeadline: boolean }> = ({ history, onSetStatus, isPastDeadline }) => {
  const todayKey = getTodayKey();
  const todayPrayers = history[todayKey] || { fajr: null, maghrib: null, isha: null };
  const completedCount = Object.values(todayPrayers).filter(v => v === 'حاضر').length;
  
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const dayData = history[k] || { fajr: null, maghrib: null, isha: null };
      days.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        value: Object.values(dayData).filter(v => v === 'حاضر').length,
        color: 'bg-amber-500'
      });
    }
    return days;
  }, [history]);

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-28">
      <h2 className="text-2xl font-bold mb-8 text-amber-400 flex items-center gap-2">
        <Moon /> تسجيل الصلوات اليومية
      </h2>

      {isPastDeadline && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6 animate-fade-in">
          <Lock size={18} />
          <span className="text-sm font-semibold">انتهى وقت التسجيل لهذا العام</span>
        </div>
      )}

      <div className="glass p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-300">الأداء الأسبوعي (عدد الصلوات)</h3>
        </div>
        <SimpleBarChart data={chartData} />
      </div>

      <div className={`glass p-6 rounded-3xl mb-10 text-center relative overflow-hidden transition-opacity duration-500 ${isPastDeadline ? 'opacity-60' : ''}`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${isPastDeadline ? 'bg-slate-600' : 'bg-amber-500'}`}></div>
        <p className="text-slate-400 text-sm mb-2">إنجاز اليوم</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl font-bold text-white">{completedCount}</span>
          <span className="text-2xl text-slate-500">/</span>
          <span className="text-2xl text-slate-500">3</span>
        </div>
        <div className="mt-4 flex gap-1 h-2 bg-slate-800 rounded-full overflow-hidden">
           {[...Array(3)].map((_, i) => (
             <div key={i} className={`flex-1 transition-all duration-500 ${i < completedCount ? (isPastDeadline ? 'bg-slate-500' : 'bg-amber-500') : 'bg-transparent'}`}></div>
           ))}
        </div>
        {!isPastDeadline && completedCount === 3 && (
          <p className="mt-3 text-xs text-emerald-400 font-semibold animate-bounce text-right">أحسنت! أتممت صلواتك اليوم ✨</p>
        )}
      </div>

      <div className={`space-y-4 ${isPastDeadline ? 'pointer-events-none' : ''}`}>
        {[
          { id: 'fajr', label: 'صلاة الفجر', color: 'bg-amber-500/20 text-amber-400', icon: <Sunrise size={22} /> },
          { id: 'maghrib', label: 'صلاة المغرب', color: 'bg-orange-500/20 text-orange-400', icon: <Sunset size={22} /> },
          { id: 'isha', label: 'صلاة العشاء', color: 'bg-indigo-500/20 text-indigo-400', icon: <Moon size={22} /> }
        ].map(p => {
          const status = todayPrayers[p.id as keyof PrayerDay];
          const isPresent = status === 'حاضر';
          const isAbsent = status === 'غائب';

          return (
            <div 
              key={p.id}
              className={`glass p-4 rounded-2xl flex justify-between items-center transition-all border-r-4 shadow-sm ${
                isPastDeadline ? 'grayscale cursor-not-allowed opacity-60' : ''
              } ${
                isPresent ? 'border-emerald-500 bg-emerald-500/5' : isAbsent ? 'border-red-500 bg-red-500/5' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${isPresent ? 'bg-emerald-500 text-slate-900' : isAbsent ? 'bg-red-500 text-white' : p.color}`}>
                  {p.icon}
                </div>
                <span className={`font-bold transition-colors duration-300 ${isPresent ? 'text-emerald-400' : isAbsent ? 'text-red-400' : 'text-slate-400'}`}>
                  {p.label}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => onSetStatus(p.id as keyof PrayerDay, isPresent ? null : 'حاضر')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                    isPresent ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-700 hover:border-emerald-500 text-slate-500'
                  }`}
                >
                  <CheckCircle2 size={20} className={isPresent ? 'text-slate-950' : ''} />
                </button>
                <button 
                  onClick={() => onSetStatus(p.id as keyof PrayerDay, isAbsent ? null : 'غائب')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                    isAbsent ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20' : 'border-slate-700 hover:border-red-500 text-slate-500'
                  }`}
                >
                  <X size={20} className={isAbsent ? 'text-white' : ''} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatisticsView: React.FC<{ attendance: AttendanceRecord[], prayerHistory: PrayerHistory }> = ({ attendance, prayerHistory }) => {
  const months = [1, 2, 3, 4, 5, 6, 7];

  const monthData = useMemo(() => {
    return months.map(m => {
      const attRecords = attendance.filter(a => {
        const monthPart = parseInt(a.key.split('-')[1]);
        return monthPart === m;
      });

      const presentCount = attRecords.filter(a => a.status === 'حاضر').length;
      const absentCount = attRecords.filter(a => a.status === 'غائب').length;
      const lessons = Array.from(new Set(attRecords.map(a => a.lesson))).join('، ') || 'لا يوجد';

      let fajrP = 0, maghribP = 0, ishaP = 0;
      let fajrA = 0, maghribA = 0, ishaA = 0;
      
      (Object.entries(prayerHistory) as [string, PrayerDay][]).forEach(([key, day]) => {
        const monthPart = parseInt(key.split('-')[1]);
        if (monthPart === m) {
          if (day.fajr === 'حاضر') fajrP++; else if (day.fajr === 'غائب') fajrA++;
          if (day.maghrib === 'حاضر') maghribP++; else if (day.maghrib === 'غائب') maghribA++;
          if (day.isha === 'حاضر') ishaP++; else if (day.isha === 'غائب') ishaA++;
        }
      });

      return {
        month: m,
        present: presentCount,
        absent: absentCount,
        fajrP, maghribP, ishaP,
        fajrA, maghribA, ishaA,
        lessons
      };
    });
  }, [attendance, prayerHistory]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-28">
      <h2 className="text-2xl font-bold mb-8 text-indigo-400 flex items-center gap-2">
        <BarChart3 /> الإحصائيات التفصيلية (الأشهر 1 - 7)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
        {monthData.map((data) => (
          <div key={data.month} className="glass p-6 rounded-2xl border-l-4 border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-indigo-400" size={20} /> شهر {data.month}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <p className="text-xs text-slate-400 mb-1">الحضور</p>
                  <p className="text-xl font-bold text-emerald-400">{data.present}</p>
                </div>
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <p className="text-xs text-slate-400 mb-1">الغياب</p>
                  <p className="text-xl font-bold text-red-400">{data.absent}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Star size={16} /> مجموع الصلوات (حاضر / غائب):
                </p>
                <div className="flex justify-around text-center" dir="ltr">
                  <div>
                    <p className="text-[10px] text-slate-400">الفجر</p>
                    <p className="text-sm font-bold text-white">{data.fajrP} <span className="text-red-500 text-xs">/ {data.fajrA}</span></p>
                  </div>
                  <div className="border-x border-slate-700 px-4">
                    <p className="text-[10px] text-slate-400">المغرب</p>
                    <p className="text-sm font-bold text-white">{data.maghribP} <span className="text-red-500 text-xs">/ {data.maghribA}</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">العشاء</p>
                    <p className="text-sm font-bold text-white">{data.ishaP} <span className="text-red-500 text-xs">/ {data.ishaA}</span></p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <LayoutGrid size={14} /> الدروس المسجلة:
                </p>
                <p className="text-sm text-slate-300 font-light truncate">{data.lessons}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TotalView: React.FC<{ points: number, attendance: AttendanceRecord[], prayerHistory: PrayerHistory }> = ({ points, attendance, prayerHistory }) => {
  const progress = (points / 120) * 100;

  const totalPrayerPoints = useMemo(() => {
    return (Object.values(prayerHistory) as PrayerDay[]).reduce<number>((acc, day) => {
      return acc + (Object.values(day).filter(v => v === 'حاضر').length * 5);
    }, 0);
  }, [prayerHistory]);

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-28 text-center">
      <h2 className="text-2xl font-bold mb-10 text-rose-400 flex items-center justify-center gap-2">
        <Trophy /> مجموع النقاط
      </h2>
      
      <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
          <circle
            cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
            strokeLinecap="round"
            className="text-rose-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(244,63,94,0.3)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold">{points}</span>
          <span className="text-rose-400 text-sm">من أصل 120</span>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl space-y-4 text-right">
        <h3 className="font-semibold border-b border-slate-700 pb-2 text-rose-300">تفاصيل النقاط:</h3>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">حضور الدروس (5 نقاط/درس):</span>
          <span className="text-emerald-400">{attendance.filter(a => a.status === 'حاضر').length * 5}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">إجمالي نقاط الصلوات الحاضرة:</span>
          <span className="text-amber-400">{totalPrayerPoints}</span>
        </div>
      </div>
    </div>
  );
};

const GoalsView: React.FC<{ 
  goals: Goal[], 
  onAdd: (t: string, c: GoalCategory) => void, 
  onToggle: (id: string) => void,
  onDelete: (id: string) => void,
  isPastDeadline: boolean 
}> = ({ goals, onAdd, onToggle, onDelete, isPastDeadline }) => {
  const [goalInput, setGoalInput] = useState('');
  const [category, setCategory] = useState<GoalCategory>('عبادة');

  const categories: { label: GoalCategory; icon: React.ReactNode; color: string }[] = [
    { label: 'عبادة', icon: <Sparkles size={16} />, color: 'bg-amber-500' },
    { label: 'علم', icon: <BookOpen size={16} />, color: 'bg-blue-500' },
    { label: 'خلق', icon: <Heart size={16} />, color: 'bg-rose-500' },
    { label: 'عام', icon: <Target size={16} />, color: 'bg-slate-500' },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-10 pb-28">
      <h2 className="text-3xl font-bold mb-8 text-cyan-400 flex items-center gap-3">
        <Target size={32} /> أهدافي المستقبليّة
      </h2>
      
      <div className="glass p-6 rounded-3xl mb-10 shadow-xl border-cyan-500/20">
        <div className="space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="ما الذي تطمح لتحقيقه؟"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-right pr-14"
              dir="rtl"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && goalInput.trim() && (onAdd(goalInput, category), setGoalInput(''))}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-500">
              <Plus size={24} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  category === cat.label 
                    ? `${cat.color} text-white scale-105 shadow-lg` 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          <button 
            disabled={isPastDeadline || !goalInput.trim()}
            onClick={() => { onAdd(goalInput, category); setGoalInput(''); }}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            حفظ الهدف
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Target size={64} className="mx-auto mb-4" />
            <p>ابدأ بإضافة أول هدف لك لهذا الشهر!</p>
          </div>
        ) : (
          goals.map((g) => {
            const catColor = categories.find(c => c.label === g.category)?.color || 'bg-slate-500';
            return (
              <div 
                key={g.id} 
                className={`glass p-5 rounded-3xl flex items-center justify-between border-r-4 transition-all group ${
                  g.completed ? 'opacity-50 border-emerald-500' : `border-${catColor.split('-')[1]}-500`
                } animate-slide-up shadow-md hover:shadow-cyan-500/5`}
              >
                <button 
                  onClick={() => onDelete(g.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex-1 px-4 text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${catColor}`}>
                      {g.category}
                    </span>
                  </div>
                  <p className={`text-lg transition-all ${g.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {g.text}
                  </p>
                </div>

                <button 
                  onClick={() => onToggle(g.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                    g.completed 
                      ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' 
                      : 'border-slate-700 hover:border-cyan-500'
                  }`}
                >
                  {g.completed ? <CheckCircle size={24} className="text-slate-900" /> : <div className="w-2 h-2 rounded-full bg-slate-700"></div>}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');

  const isPastDeadline = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return (currentYear > END_YEAR) || (currentYear === END_YEAR && currentMonth > END_MONTH);
  }, []);

  const [tasbeeh, setTasbeeh] = useState<number>(() => Number(localStorage.getItem('tasbeeh')) || 0);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistory>(() => {
    const saved = localStorage.getItem('prayerHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [reminders, setReminders] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : { fajrEnabled: false, fajrMinutesBefore: 30 };
  });
  
  const [fajrTime, setFajrTime] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => localStorage.setItem('tasbeeh', tasbeeh.toString()), [tasbeeh]);
  useEffect(() => localStorage.setItem('attendance', JSON.stringify(attendance)), [attendance]);
  useEffect(() => localStorage.setItem('prayerHistory', JSON.stringify(prayerHistory)), [prayerHistory]);
  useEffect(() => localStorage.setItem('goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('reminders', JSON.stringify(reminders)), [reminders]);

  useEffect(() => {
    const attPoints = attendance.filter(a => a.status === 'حاضر').length * 5;
    const prayPoints = (Object.values(prayerHistory) as PrayerDay[]).reduce<number>((acc, day) => {
      return acc + (Object.values(day).filter(v => v === 'حاضر').length * 5);
    }, 0);
    setPoints(Math.min(120, attPoints + prayPoints));
  }, [attendance, prayerHistory]);

  // Prayer Time Fetching & Reminder Logic
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    const fetchPrayerTimes = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.timings?.Fajr) {
            setFajrTime(data.data.timings.Fajr);
          }
        })
        .catch(() => setLocationError("حدث خطأ أثناء تحميل أوقات الصلاة"));
    };

    navigator.geolocation.getCurrentPosition(fetchPrayerTimes, () => {
      setLocationError("يرجى تفعيل صلاحية الوصول للموقع");
    });
  }, []);

  // Background check for reminder
  useEffect(() => {
    if (!reminders.fajrEnabled || !fajrTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const [fHour, fMin] = fajrTime.split(':').map(Number);
      
      const targetTime = new Date();
      targetTime.setHours(fHour);
      targetTime.setMinutes(fMin - reminders.fajrMinutesBefore);
      targetTime.setSeconds(0);

      // Check if we are within the same minute
      if (
        now.getHours() === targetTime.getHours() && 
        now.getMinutes() === targetTime.getMinutes() && 
        now.getSeconds() === 0
      ) {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification("تنبيه صلاة الفجر", {
              body: `بقي ${reminders.fajrMinutesBefore} دقيقة على موعد صلاة الفجر.`,
              icon: "https://cdn-icons-png.flaticon.com/512/3239/3239330.png"
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        }
        // Fallback or secondary: play a light sound or vibrate
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, fajrTime]);

  const saveAttendance = (status: 'حاضر' | 'غائب', lesson: string) => {
    if (isPastDeadline || !lesson || lesson === 'لا يوجد تسجيل اليوم') return;
    const now = new Date();
    const key = getTodayKey();
    if (attendance.find(a => a.key === key && a.lesson === lesson)) return;
    setAttendance(prev => [{ key, date: now.toLocaleDateString('ar-EG'), lesson, status }, ...prev]);
  };

  const setPrayerStatus = (p: keyof PrayerDay, status: EntryStatus) => {
    if (isPastDeadline) return;
    const key = getTodayKey();
    setPrayerHistory(prev => {
      const todayData = prev[key] || { fajr: null, maghrib: null, isha: null };
      return {
        ...prev,
        [key]: { ...todayData, [p]: status }
      };
    });
  };

  const addGoal = (text: string, category: GoalCategory) => {
    if (isPastDeadline) return;
    setGoals(prev => [{
      id: Date.now().toString(),
      text: text.trim(),
      category,
      completed: false
    }, ...prev]);
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const incrementTasbeeh = () => {
    if (isPastDeadline) return;
    setTasbeeh(t => t + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden transition-colors duration-500">
      {currentView === 'home' && <HomeView onNavigate={setCurrentView} isPastDeadline={isPastDeadline} />}
      {currentView === 'attendance' && <AttendanceView attendance={attendance} onSave={saveAttendance} isPastDeadline={isPastDeadline} />}
      {currentView === 'tasbeeh' && <TasbeehView count={tasbeeh} onInc={incrementTasbeeh} onReset={() => !isPastDeadline && setTasbeeh(0)} isPastDeadline={isPastDeadline} />}
      {currentView === 'prayers' && <PrayersView history={prayerHistory} onSetStatus={setPrayerStatus} isPastDeadline={isPastDeadline} />}
      {currentView === 'prayerTimes' && (
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-28 text-center">
          <h2 className="text-2xl font-bold mb-8 text-purple-400">⏰ أوقات الصلاة</h2>
          <div className="glass rounded-2xl overflow-hidden bg-white p-2">
            <iframe title="Prayer Times" style={{ width: '100%', height: '380px', border: 'none', borderRadius: '12px' }} src="https://timesprayer.today/widget_frame.php?frame=3&id=355&sound=false"></iframe>
          </div>
        </div>
      )}
      {currentView === 'total' && <TotalView points={points} attendance={attendance} prayerHistory={prayerHistory} />}
      {currentView === 'goals' && (
        <GoalsView 
          goals={goals} 
          onAdd={addGoal} 
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          isPastDeadline={isPastDeadline} 
        />
      )}
      {currentView === 'statistics' && <StatisticsView attendance={attendance} prayerHistory={prayerHistory} />}
      {currentView === 'reminders' && (
        <RemindersView 
          settings={reminders} 
          onUpdate={setReminders} 
          fajrTime={fajrTime}
          locationError={locationError}
        />
      )}
      
      {currentView !== 'home' && <BackButton onClick={() => setCurrentView('home')} />}
    </div>
  );
};