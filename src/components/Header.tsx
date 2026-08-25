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
          {/* User Info */}

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
