"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, User, ChevronRight } from "lucide-react";

interface RubuProps {
  data: {
    rubu_number: number;
    status: 'disponible' | 'pris' | 'termine';
    reader_name?: string;
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
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group p-4 rounded-[2rem] border-2 transition-all duration-300 flex flex-col justify-between min-h-[160px] cursor-pointer shadow-sm ${
        isDone ? 'bg-emerald-50/50 border-emerald-100 shadow-emerald-100/20' : 
        isTaken ? 'bg-amber-50/50 border-amber-100 shadow-amber-100/20' : 
        'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10'
      }`}
      onClick={() => isAvailable && onSelect(data.rubu_number)}
    >
      {/* Header de la carte */}
      <div className="flex justify-between items-start">
        <div className={`text-[13px] font-black w-10 h-10 flex items-center justify-center rounded-2xl shadow-inner ${
          isDone ? 'bg-emerald-600 text-white' : 
          isTaken ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {data.rubu_number}
        </div>
        
        {isDone && <CheckCircle2 size={20} className="text-emerald-600" />}
        {isTaken && (
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </div>
        )}
      </div>

      {/* Corps de la carte */}
      <div className="mt-4 flex-grow">
        {isAvailable ? (
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-widest italic">Libre</span>
            <ChevronRight size={10} />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white rounded-lg shadow-sm">
                <User size={12} className="text-slate-400" />
              </div>
              <p className="text-[11px] font-black text-slate-800 truncate leading-tight uppercase tracking-tight">
                {data.reader_name}
              </p>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase pl-7">Lecteur</p>
          </div>
        )}
      </div>

      {/* Action rapide */}
      {isTaken && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 uppercase tracking-widest"
        >
          Valider ma lecture
        </motion.button>
      )}
    </motion.div>
  );
}