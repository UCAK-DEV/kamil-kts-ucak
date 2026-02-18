"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import RubuCard from '@/components/RubuCard';
import ReservationModal from '@/components/ReservationModal';
import { BookOpen, Search, Loader2, Star } from 'lucide-react';

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
  
  // État pour les réservations locales (Android/Desktop)
  const [myReservations, setMyReservations] = useState<number[]>([]);

  useEffect(() => {
    // Lecture sécurisée du localStorage après le montage (Client-side)
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

  const totalCompleted = rubus.filter(r => r.status === 'termine').length;

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-10">
      <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-[60] px-4 lg:px-12 py-4 lg:py-6">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-2.5 lg:p-3 rounded-2xl shadow-lg shadow-emerald-100">
              <BookOpen className="text-white w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black tracking-tighter leading-none italic">KAAMIL <span className="text-emerald-600">RUBU'</span></h1>
              <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Live Dashboard</p>
            </div>
          </div>

          <div className="w-full lg:w-[450px] space-y-2">
            <div className="flex justify-between text-[10px] lg:text-[11px] font-black uppercase text-slate-500">
              <span className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /> Progression</span>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full border border-emerald-100">{totalCompleted} / 240</span>
            </div>
            <div className="h-3 lg:h-4 w-full bg-slate-100 rounded-full p-1 border border-slate-200/50">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 shadow-sm"
                   style={{ width: `${(totalCompleted/240)*100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-12 mt-8 lg:mt-12 space-y-8">
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par numéro ou nom..."
              className="w-full pl-14 pr-6 py-4 lg:py-5 bg-white border-2 border-slate-100 rounded-2xl lg:rounded-[1.5rem] outline-none focus:border-emerald-500/30 focus:ring-4 ring-emerald-500/5 transition-all font-bold text-slate-800 shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl lg:rounded-[1.5rem] border border-slate-200 overflow-x-auto no-scrollbar">
            {(['tous', 'disponible', 'pris', 'termine'] as const).map((t) => (
              <button 
                key={t} 
                onClick={() => setFilter(t)} 
                className={`px-5 lg:px-8 py-2.5 lg:py-3 rounded-xl lg:rounded-[1.2rem] text-[10px] lg:text-[11px] font-black uppercase transition-all whitespace-nowrap ${
                  filter === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'pris' ? 'En cours' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Grille Ultra-Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 3xl:grid-cols-12 gap-3 lg:gap-5">
          {filteredRubus.map((rubu) => (
            <RubuCard 
              key={rubu.rubu_number} 
              data={rubu} 
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