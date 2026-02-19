"use client";
import { motion } from "framer-motion";
import { CheckCircle2, User, LayoutGrid } from "lucide-react";

interface RubuProps {
  data: {
    rubu_number: number;
    status: 'disponible' | 'pris' | 'termine';
    reader_name?: string;
    arabic_text?: string;
    juz_number?: number;
  };
  onSelect: (num: number) => void;
  onComplete: () => void;
}

export default function RubuCard({ data, onSelect, onComplete }: RubuProps) {
  const isAvailable = data.status === 'disponible';
  const isTaken = data.status === 'pris';
  const isDone = data.status === 'termine';

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative p-5 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between min-h-[220px] cursor-pointer shadow-sm ${
        isDone ? 'bg-emerald-50/40 border-emerald-200' : 
        isTaken ? 'bg-amber-50/40 border-amber-200' : 
        'bg-white border-slate-100 hover:border-emerald-300'
      }`}
      onClick={() => isAvailable && onSelect(data.rubu_number)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
            <LayoutGrid size={10} />
            <span>Juz' {data.juz_number}</span>
          </div>
          <div className={`text-xs font-black w-9 h-9 flex items-center justify-center rounded-2xl shadow-inner ${
            isDone ? 'bg-emerald-600 text-white' : 
            isTaken ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {data.rubu_number}
          </div>
        </div>
        {isDone && <CheckCircle2 size={20} className="text-emerald-600" />}
      </div>

      <div className="flex-grow flex items-center justify-center py-4 px-1">
        <p className="text-xl md:text-2xl font-medium text-slate-800 text-center leading-[1.8]" 
           style={{ fontFamily: "'Amiri', serif" }} dir="rtl">
          {data.arabic_text}
        </p>
      </div>

      <div className="mt-2">
        {!isAvailable && (
          <div className="flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-slate-50 mb-2">
            <User size={10} className="text-slate-500" />
            <p className="text-[10px] font-black text-slate-700 truncate uppercase">{data.reader_name}</p>
          </div>
        )}

        {isTaken ? (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black py-3 rounded-xl transition-all shadow-md uppercase"
          >
            Valider la lecture
          </button>
        ) : isAvailable ? (
          <div className="text-[9px] font-black text-emerald-500 uppercase text-center italic opacity-60">Libre</div>
        ) : null}
      </div>
    </motion.div>
  );
}