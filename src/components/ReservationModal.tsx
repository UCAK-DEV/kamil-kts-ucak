"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Check } from 'lucide-react';

export default function ReservationModal({ isOpen, rubuNumber, onClose, onConfirm }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">RUBU #{rubuNumber}</h2>
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="space-y-4 mb-8">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Nom complet" className="w-full pl-12 p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-slate-800" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="tel" placeholder="Téléphone" className="w-full pl-12 p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-slate-800" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <button disabled={!name.trim() || !phone.trim()} onClick={() => onConfirm(name, phone)} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
            <Check size={20} /> CONFIRMER
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}