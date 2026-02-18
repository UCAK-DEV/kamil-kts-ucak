"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import RubuCard from '@/components/RubuCard';
import ReservationModal from '@/components/ReservationModal';
import { BookOpen, Search, Star, Award } from 'lucide-react';
import rubuData from "./rubu.json";

interface RubuData {
  id: string;
  rubu_number: number;
  status: 'disponible' | 'pris' | 'termine';
  reader_name?: string;
  reader_phone?: string;
}

export default function Home() {
  const [rubus, setRubus] = useState<RubuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'tous' | 'disponible' | 'pris' | 'termine'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubu, setSelectedRubu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myReservations, setMyReservations] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('my_rubus');
      if (stored) setMyReservations(JSON.parse(stored));
    } catch (e) { console.error("Erreur Storage", e); }

    fetchRubus();
    const channel = supabase.channel('realtime-kamil').on('postgres_changes', { 
      event: 'UPDATE', schema: 'public', table: 'rubu_sections' 
    }, (payload) => {
      const updated = payload.new as RubuData;
      setRubus(current => current.map(r => r.id === updated.id ? updated : r));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRubus = async () => {
    const { data } = await supabase.from('rubu_sections').select('*').order('rubu_number', { ascending: true });
    if (data) setRubus(data as RubuData[]);
    setLoading(false);
  };

  const filteredRubus = useMemo(() => {
    return rubus.filter(r => {
      const matchesFilter = filter === 'tous' || r.status === filter;
      const matchesSearch = r.rubu_number.toString().includes(searchQuery) || 
                           r.reader_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [rubus, filter, searchQuery]);

  // Fonction pour obtenir le texte arabe du Rubu (basé sur votre image)
  const getArabicText = (num: number): string => {
  return rubuData[num - 1]?.Texte_Rubu ?? "رُبُع غير موجود";
};

  const totalCompleted = rubus.filter(r => r.status === 'termine').length;

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-10">
      <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-[60] px-4 lg:px-12 py-4 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo en CERCLE */}
            <div className="relative group">
               <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-amber-400 rounded-full blur opacity-25 group-hover:opacity-45 transition duration-1000"></div>
               <div className="relative bg-white p-1 rounded-full border border-slate-100 shadow-xl">
                 <img src="/logo-kts.png" alt="Logo KTS" className="w-16 h-16 object-cover rounded-full" />
               </div>
            </div>
            
            <div>
              <h1 className="text-xl lg:text-2xl font-black tracking-tighter leading-none italic uppercase">
                TAZAWUDUS <span className="text-emerald-600">SUBBAN</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KTS UCAK • Kamil Live Management</p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px] bg-slate-50 p-4 rounded-[2rem] border border-slate-100 shadow-inner">
            <div className="flex justify-between text-[11px] font-black uppercase text-slate-600 mb-2 px-1">
              <span className="flex items-center gap-1.5"><Award size={14} className="text-amber-500" /> Progression Khatm</span>
              <span className="text-emerald-700">{totalCompleted} / 240</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                   style={{ width: `${(totalCompleted/240)*100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-12 mt-10 space-y-10">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par numéro ou nom..."
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] outline-none focus:border-emerald-500/30 focus:ring-4 ring-emerald-500/5 transition-all font-bold text-slate-800 shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar shadow-inner">
            {(['tous', 'disponible', 'pris', 'termine'] as const).map((t) => (
              <button 
                key={t} 
                onClick={() => setFilter(t)} 
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                  filter === t ? 'bg-white text-emerald-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'pris' ? 'En cours' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-5 lg:gap-7">
          {filteredRubus.map((rubu) => (
            <RubuCard 
              key={rubu.rubu_number} 
              data={{
                ...rubu,
                arabic_text: getArabicText(rubu.rubu_number),
                juz_number: Math.ceil(rubu.rubu_number / 8)
              }} 
              canComplete={myReservations.includes(rubu.rubu_number)}
              onSelect={(num) => { setSelectedRubu(num); setIsModalOpen(true); }} 
              onComplete={async () => {
                const { error } = await supabase.from('rubu_sections')
                  .update({ status: 'termine', completed_at: new Date().toISOString() })
                  .eq('rubu_number', rubu.rubu_number);
                
                if (!error) {
                  const updated = myReservations.filter(id => id !== rubu.rubu_number);
                  setMyReservations(updated);
                  localStorage.setItem('my_rubus', JSON.stringify(updated));
                }
              }} 
            />
          ))}
        </div>
      </div>

      <ReservationModal 
        isOpen={isModalOpen} 
        rubuNumber={selectedRubu} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={async (name: string, phone: string) => {
          if (selectedRubu) {
            const { error } = await supabase.from('rubu_sections').update({ 
              status: 'pris', reader_name: name, reader_phone: phone, taken_at: new Date().toISOString() 
            }).eq('rubu_number', selectedRubu);
            
            if (!error) {
              const updated = [...myReservations, selectedRubu];
              setMyReservations(updated);
              localStorage.setItem('my_rubus', JSON.stringify(updated));
              setIsModalOpen(false);
            }
          }
        }} 
      />
    </main>
  );
}