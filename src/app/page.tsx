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
  completed_at?: string;
  taken_at?: string;
}

export default function Home() {
  const [rubus, setRubus] = useState<RubuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'tous' | 'disponible' | 'pris' | 'termine'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubu, setSelectedRubu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // État pour suivre les rubus réservés sur cet appareil
  const [myReservations, setMyReservations] = useState<number[]>([]);

  useEffect(() => {
    // Charger les réservations locales au démarrage
    const stored = JSON.parse(localStorage.getItem('my_rubus') || '[]');
    setMyReservations(stored);

    fetchRubus();
    const channel = supabase.channel('realtime-kamil').on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'rubu_sections' 
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Initialisation du Kaamil...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60] px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-[1.25rem] shadow-xl shadow-emerald-200">
              <BookOpen className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none italic">KAAMIL <span className="text-emerald-600">RUBU'</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suivi communautaire en direct</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[400px] space-y-3">
            <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
              <span className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /> Progression Globale</span>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{totalCompleted} / 240</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full p-1 border border-slate-200">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 shadow-sm"
                   style={{ width: `${(totalCompleted/240)*100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un numéro ou un participant..."
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-50 rounded-[1.5rem] outline-none focus:border-emerald-500/20 focus:ring-4 ring-emerald-500/5 transition-all font-bold text-slate-800 shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200 overflow-x-auto no-scrollbar">
            {(['tous', 'disponible', 'pris', 'termine'] as const).map((t) => (
              <button 
                key={t} 
                onClick={() => setFilter(t)} 
                className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase transition-all whitespace-nowrap ${
                  filter === t ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'pris' ? 'En cours' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-5 pb-20">
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
                  // Retirer du stockage local après validation
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
              status: 'pris', 
              reader_name: name, 
              reader_phone: phone, 
              taken_at: new Date().toISOString() 
            }).eq('rubu_number', selectedRubu);
            
            if (!error) {
              // Enregistrer le numéro du rubu localement
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