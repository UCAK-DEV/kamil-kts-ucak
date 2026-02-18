"use client";
import { motion } from "framer-motion";
import { CheckCircle2, User, ChevronRight } from "lucide-react";

interface RubuProps {
  data: {
    rubu_number: number;
    status: 'disponible' | 'pris' | 'termine';
    reader_name?: string;
  };
  onSelect: (num: number) => void;
  onComplete: () => void;
  canComplete: boolean; // Autorise la validation uniquement pour le propriétaire
}

export default function RubuCard({ data, onSelect, onComplete, canComplete }: RubuProps) {
  const isAvailable = data.status === 'disponible';
  const isTaken = data.status === 'pris';
  const isDone = data.status === 'termine';

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative group p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem] border-2 transition-all duration-300 flex flex-col justify-between min-h-[140px] lg:min-h-[160px] cursor-pointer shadow-sm ${
        isDone ? 'bg-emerald-50/40 border-emerald-100' : 
        isTaken ? 'bg-amber-50/40 border-amber-100' : 
        'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-lg'
      }`}
      onClick={() => isAvailable && onSelect(data.rubu_number)}
    >
      <div className="flex justify-between items-start">
        <div className={`text-xs lg:text-[13px] font-black w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl lg:rounded-2xl shadow-inner ${
          isDone ? 'bg-emerald-600 text-white' : 
          isTaken ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {data.rubu_number}
        </div>
        
        {isDone && <CheckCircle2 size={18} className="text-emerald-600 lg:w-5 lg:h-5" />}
        {isTaken && (
          <div className="relative flex h-2.5 w-2.5 lg:h-3 lg:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 lg:h-3 lg:w-3 bg-amber-500"></span>
          </div>
        )}
      </div>

      <div className="mt-3 lg:mt-4 flex-grow">
        {isAvailable ? (
          <div className="flex items-center gap-1 text-slate-300 group-hover:text-emerald-500 transition-colors">
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic">Libre</span>
            <ChevronRight size={10} />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/80 rounded-lg shadow-sm">
                <User size={10} className="text-slate-400 lg:w-3 lg:h-3" />
              </div>
              <p className="text-[10px] lg:text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">
                {data.reader_name}
              </p>
            </div>
            <p className="text-[8px] lg:text-[9px] text-slate-400 font-bold uppercase pl-6 lg:pl-7 tracking-tighter">Lecteur</p>
          </div>
        )}
      </div>

      {isTaken && canComplete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] lg:text-[10px] font-black py-2.5 lg:py-3 rounded-xl transition-all shadow-md shadow-emerald-200 uppercase tracking-widest"
        >
          Valider ma lecture
        </motion.button>
      )}

      {isTaken && !canComplete && (
        <div className="mt-3 w-full py-2 text-center text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase italic border border-dashed border-slate-200 rounded-xl">
          Occupé
        </div>
      )}
    </motion.div>
  );
}