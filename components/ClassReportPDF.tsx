import React from 'react';
import { Module } from '../data/courseData';
import { BookOpen, Trophy } from 'lucide-react';

interface StudentProgress {
  uid: string;
  displayName: string;
  email: string;
  completedModules: string[];
  classId: string;
}

interface Props {
  className: string;
  students: StudentProgress[];
  modules: Module[];
}

export const ClassReportPDF: React.FC<Props> = ({ className, students, modules }) => {
  const totalStudents = students.length;
  
  // Calculate module stats
  const moduleStats = modules.map(m => {
    const completedCount = students.filter(s => s.completedModules.includes(m.id)).length;
    const completionRate = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0;
    return {
      id: m.id,
      title: m.translations.en.title,
      completedCount,
      completionRate
    };
  });

  const classAverageProgress = totalStudents > 0 
    ? moduleStats.reduce((acc, curr) => acc + curr.completionRate, 0) / modules.length 
    : 0;

  return (
    <div id="class-report-pdf" className="bg-white p-20 w-[1000px] font-sans text-slate-900 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7F7FFA]/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7F7FFA]/5 rounded-full translate-y-48 -translate-x-48 blur-3xl" />

      {/* Header */}
      <div className="flex justify-between items-start mb-20 relative z-10">
        <div className="flex items-center gap-8">
          <div className="w-28 h-28 bg-[#0b0f19] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <BookOpen className="w-14 h-14 text-[#7F7FFA]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-4xl font-black text-[#3C3C3C] tracking-tighter">BeginFin</span>
               <div className="w-2 h-2 bg-[#7F7FFA] rounded-full mt-2" />
            </div>
            <p className="text-[#7F7FFA] font-black uppercase tracking-[0.4em] text-[10px] whitespace-nowrap">Performance Analytics Report</p>
          </div>
        </div>
        <div className="text-right pt-4">
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <h2 className="text-5xl font-black text-[#3C3C3C] tracking-tighter leading-none">{className}</h2>
          <div className="h-1.5 w-24 bg-[#7F7FFA] ml-auto mt-4 rounded-full" />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-8 mb-20 relative z-10">
        <div className="bg-[#F4F8FA] p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:bg-white hover:shadow-xl transition-all">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Average Progress</p>
          <p className="text-7xl font-black text-[#7F7FFA] tracking-tighter">{Math.round(classAverageProgress)}%</p>
          <div className="mt-4 text-xs font-bold text-slate-400">Class Mastery Level</div>
        </div>
        <div className="bg-[#F4F8FA] p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:bg-white hover:shadow-xl transition-all">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Class Size</p>
          <p className="text-7xl font-black text-[#3C3C3C] tracking-tighter">{totalStudents}</p>
          <div className="mt-4 text-xs font-bold text-slate-400">Total Students</div>
        </div>
        <div className="bg-[#F4F8FA] p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:bg-white hover:shadow-xl transition-all">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Total Graduates</p>
          <p className="text-7xl font-black text-[#7F7FFA] tracking-tighter">
            {students.filter(s => s.completedModules.length === modules.length).length}
          </p>
          <div className="mt-4 text-xs font-bold text-slate-400">Completed All Units</div>
        </div>
      </div>

      {/* Unit Breakdown */}
      <div className="space-y-10 relative z-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <h3 className="text-3xl font-black flex items-center gap-4 text-[#3C3C3C]">
            <Trophy className="w-10 h-10 text-[#7F7FFA]" />
            Curriculum Breakdown
          </h3>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Completion Rate Per Unit</div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {moduleStats.map((m, idx) => (
            <div key={m.id} className="flex items-center gap-10 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0">
                {idx + 1}
              </div>
              <div className="w-64 shrink-0">
                <p className="text-xl font-black text-[#3C3C3C] leading-tight">{m.title}</p>
              </div>
              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#7F7FFA] rounded-full"
                  style={{ width: `${m.completionRate}%` }}
                />
              </div>
              <div className="w-24 text-right">
                <p className="text-2xl font-black text-[#3C3C3C]">{Math.round(m.completionRate)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-center relative z-10">
        <p className="text-slate-400 text-sm font-bold tracking-wide">© 2026 BeginFin - An Open-Source Educational Project</p>
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="BeginFin Logo" className="w-5 h-5 object-contain rounded-md shadow-xs" referrerPolicy="no-referrer" />
           <span className="font-black text-slate-900 tracking-tighter text-lg">BeginFin</span>
        </div>
      </div>
    </div>
  );
};
