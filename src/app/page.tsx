"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import RubuCard from '@/components/RubuCard';
import ReservationModal from '@/components/ReservationModal';
import { Search, Award } from 'lucide-react';
import rubuData from "./rubu.json";

interface RubuData {
  id: string;
  rubu_number: number;
  status: 'disponible' | 'pris' | 'termine';
  reader_name?: string;
}

export default function Home() {
  const [rubus, setRubus] = useState<RubuData[]>([]);
  const [filter, setFilter] = useState<'tous' | 'disponible' | 'pris' | 'termine'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubu, setSelectedRubu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
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
  };

  const filteredRubus = useMemo(() => {
    return rubus.filter(r => {
      const matchesFilter = filter === 'tous' || r.status === filter;
      const matchesSearch = r.rubu_number.toString().includes(searchQuery) || 
                           r.reader_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [rubus, filter, searchQuery]);

  const getArabicText = (num: number): string => {
    return rubuData[num - 1]?.Texte_Rubu ?? "رُبُع غير موجود";
  };

  const totalCompleted = rubus.filter(r => r.status === 'termine').length;

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-10">
      <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-[60] px-4 lg:px-12 py-4 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative bg-white p-1 rounded-full border border-slate-100 shadow-xl overflow-hidden">
              <img src="\Logo.png" alt="Logo KTS" className="w-16 h-16 object-cover rounded-full"
                   onError={(e) => e.currentTarget.src = "https://ui-avatars.com/api/?name=KTS&background=059669&color=fff"} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black italic uppercase">
                TAZAWUDUS <span className="text-emerald-600">SUBBAN</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KTS UCAK • Kamil Management</p>
            </div>
          </div>

          <div className="w-full lg:w-[450px] bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
            <div className="flex justify-between text-[11px] font-black uppercase text-slate-600 mb-2 px-1">
              <span className="flex items-center gap-1.5"><Award size={14} className="text-amber-500" /> Progression</span>
              <span className="text-emerald-700 font-black">{totalCompleted} / 240</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000"
                   style={{ width: `${(totalCompleted/240)*100}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-12 mt-10 space-y-10">
        <div className="flex flex-col xl:flex-row gap-5">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input type="text" placeholder="Rechercher..." className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] outline-none transition-all font-bold"
                   onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar">
            {(['tous', 'disponible', 'pris', 'termine'] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${filter === t ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}>
                {t === 'pris' ? 'En cours' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
          {filteredRubus.map((rubu) => (
            <RubuCard 
              key={rubu.rubu_number} 
              data={{ ...rubu, arabic_text: getArabicText(rubu.rubu_number), juz_number: Math.ceil(rubu.rubu_number / 8) }} 
              onSelect={(num) => { setSelectedRubu(num); setIsModalOpen(true); }} 
              onComplete={async () => {
                await supabase.from('rubu_sections').update({ status: 'termine', completed_at: new Date().toISOString() }).eq('rubu_number', rubu.rubu_number);
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
            await supabase.from('rubu_sections').update({ status: 'pris', reader_name: name, reader_phone: phone, taken_at: new Date().toISOString() }).eq('rubu_number', selectedRubu);
            setIsModalOpen(false);
          }
        }} 
      />
    </main>
  );
}