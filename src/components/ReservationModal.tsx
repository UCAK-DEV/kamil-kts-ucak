// src/components/ReservationModal.tsx
"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  rubuNumber: number | null;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void; // Ajout du paramètre phone
}

export default function ReservationModal({ isOpen, rubuNumber, onClose, onConfirm }: ModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-800">Rubu {rubuNumber}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Votre nom complet"
                className="w-full pl-10 p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all text-black"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                className="w-full pl-10 p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all text-black"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={!name.trim() || !phone.trim()}
            onClick={() => { onConfirm(name, phone); setName(''); setPhone(''); }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
          >
            Confirmer la réservation
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}