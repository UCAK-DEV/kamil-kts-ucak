"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, ExternalLink, User } from "lucide-react";

// MISE À JOUR DE L'INTERFACE : On ajoute onComplete ici
interface RubuProps {
  data: {
    rubu_number: number;
    status: 'disponible' | 'pris' | 'en_cours' | 'termine';
    reader_name?: string;
    pdf_url?: string;
    content_label?: string;
  };
  onSelect: (num: number) => void;
  onComplete: () => void; // <--- C'est cette ligne qui manquait
}

export default function RubuCard({ data, onSelect, onComplete }: RubuProps) {
  
  // Styles dynamiques selon le statut
  const styles = {
    disponible: "bg-white border-gray-200 hover:border-emerald-400 hover:shadow-md",
    pris: "bg-amber-50 border-amber-200 shadow-sm",
    termine: "bg-emerald-50 border-emerald-200 opacity-80",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative p-3 border-2 rounded-2xl transition-all flex flex-col justify-between min-h-[140px] cursor-pointer ${
        data.status === 'termine' ? styles.termine : 
        data.status === 'disponible' ? styles.disponible : styles.pris
      }`}
      onClick={() => data.status === 'disponible' && onSelect(data.rubu_number)}
    >
      {/* Badge Numéro */}
      <div className="flex justify-between items-start">
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
          data.status === 'termine' ? 'bg-emerald-200 text-emerald-800' : 
          data.status === 'pris' ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-500'
        }`}>
          RUBU {data.rubu_number}
        </span>
        
        {data.status === 'termine' && <CheckCircle size={18} className="text-emerald-600" />}
        {data.status === 'pris' && <Clock size={18} className="text-amber-600 animate-pulse" />}
      </div>

      {/* Contenu Central */}
      <div className="my-2">
        {data.status === 'disponible' ? (
          <p className="text-gray-400 text-[10px] font-medium italic uppercase">Libre</p>
        ) : (
          <div className="flex items-center gap-1 text-gray-700">
            <User size={10} className="shrink-0" />
            <span className="text-[11px] font-bold truncate">{data.reader_name}</span>
          </div>
        )}
        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
          {data.content_label || `Section ${data.rubu_number}`}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-2 space-y-1.5">
        {data.pdf_url && data.status !== 'disponible' && (
          <a
            href={data.pdf_url}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 w-full bg-white border border-gray-200 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={10} /> LIRE LE PDF
          </a>
        )}

        {data.status === 'pris' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(); // Appelle la fonction de validation automatique
            }}
            className="w-full bg-emerald-600 text-white text-[10px] font-black py-2 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
          >
            VALIDER
          </button>
        )}
      </div>
    </motion.div>
  );
}