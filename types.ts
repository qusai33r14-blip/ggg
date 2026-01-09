export type View = 'home' | 'attendance' | 'tasbeeh' | 'prayers' | 'prayerTimes' | 'total' | 'goals' | 'statistics' | 'reminders';

export type EntryStatus = 'حاضر' | 'غائب' | null;

export interface AttendanceRecord {
  key: string;
  date: string;
  lesson: string;
  status: 'حاضر' | 'غائب';
}

export interface PrayerDay {
  fajr: EntryStatus;
  maghrib: EntryStatus;
  isha: EntryStatus;
}

export type PrayerHistory = Record<string, PrayerDay>;

export type GoalCategory = 'عبادة' | 'علم' | 'خلق' | 'عام';

export interface Goal {
  id: string;
  text: string;
  category: GoalCategory;
  completed: boolean;
}

export interface ReminderSettings {
  fajrEnabled: boolean;
  fajrMinutesBefore: number;
}