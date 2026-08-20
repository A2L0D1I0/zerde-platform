import React from 'react';
import { Flame, Globe } from 'lucide-react';
import { StudentProfile, Language } from '../types';

interface HeaderProps {
  student: StudentProfile;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ student, currentLang, onLangChange }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#ffffff] border-b border-[#d0d7de] px-4 py-2.5 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        
        {/* Left: GitHub-style Brand + User Info */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* GitHub Octocat / Zerde Icon */}
          <div className="w-8 h-8 rounded-full bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center font-bold text-xs text-[#1f2328] flex-shrink-0 shadow-xs">
            <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </div>

          <div className="min-w-0">
            <div className="text-xs font-bold text-[#1f2328] leading-tight truncate flex items-center gap-1.5">
              <span>{student.name}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#f6f8fa] text-[#656d76] border border-[#d0d7de]">
                {student.grade}
              </span>
            </div>
            <div className="text-[10px] text-[#656d76] flex items-center gap-1 truncate">
              <span>{student.school}</span>
            </div>
          </div>
        </div>

        {/* Right: GitHub Badges, Streak & Lang */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          
          {/* ELO Pill (Light GitHub) */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#f6f8fa] border border-[#d0d7de] text-[11px] font-semibold text-[#1f2328] shadow-2xs">
            <span>{student.eloRank.symbol}</span>
            <span className="text-[#1a7f37] font-mono font-bold">{student.overallElo}</span>
            <span className="text-[#656d76] text-[9px]">ELO</span>
          </div>

          {/* Streak Flame (Light GitHub Amber) */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#fff8c5] border border-[#d4a72c]/40 text-[11px] font-bold text-[#9a6700]">
            <Flame className="w-3 h-3 text-[#d4a72c]" fill="#d4a72c" />
            <span className="font-mono">{student.streakDays}</span>
          </div>

          {/* Language Menu */}
          <div className="relative">
            <select
              value={currentLang}
              onChange={(e) => onLangChange(e.target.value as Language)}
              className="appearance-none bg-[#f6f8fa] hover:bg-[#eaeef2] border border-[#d0d7de] text-[11px] font-semibold text-[#1f2328] py-1 pl-2 pr-5 rounded-md cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-[#0969da]"
            >
              <option value="KZ">KZ</option>
              <option value="RU">RU</option>
              <option value="EN">EN</option>
            </select>
            <Globe className="w-2.5 h-2.5 text-[#656d76] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

      </div>
    </header>
  );
};
