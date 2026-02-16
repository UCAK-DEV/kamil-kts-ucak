"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RubuCard from '@/components/RubuCard';
import ReservationModal from '@/components/ReservationModal';
import { BookOpen, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [rubus, setRubus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRubu, setSelectedRubu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRubus = async () => {
    try {
      const { data, error } = await supabase
        .from('rubu_sections')
        .select('*')
        .order('rubu_number', { ascending: true });
      
      if (error) throw error;
      if (data) setRubus(data);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubus();

    const channel = supabase
      .channel('kamil-live-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rubu_sections' },
        (payload) => {
          const updated = payload.new as any;
          setRubus((current) =>
            current.map((r) => (r.id === updated.id ? updated : r))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- CORRECTION ICI : Ajout du paramètre readerPhone ---
  const handleReserve = async (readerName: string, readerPhone: string) => {
    if (!selectedRubu) return;

    // Mise à jour optimiste (visuel immédiat incluant le téléphone)
    setRubus(current => current.map(r => 
      r.rubu_number === selectedRubu ? { ...r, status: 'pris', reader_name: readerName, reader_phone: readerPhone } : r
    ));

    const { error } = await supabase
      .from('rubu_sections')
      .update({
        status: 'pris',
        reader_name: readerName,
        reader_phone: readerPhone, // <--- C'ÉTAIT CETTE LIGNE MANQUANTE
        taken_at: new Date().toISOString()
      })
      .eq('rubu_number', selectedRubu);

    if (error) {
      alert("Erreur lors de la réservation");
      fetchRubus();
    }
    
    setIsModalOpen(false);
    setSelectedRubu(null);
  };

  const handleMarkComplete = async (rubuNumber: number) => {
    setRubus(current => current.map(r => 
      r.rubu_number === rubuNumber ? { ...r, status: 'termine' } : r
    ));

    const { error } = await supabase
      .from('rubu_sections')
      .update({ 
        status: 'termine', 
        completed_at: new Date().toISOString() 
      })
      .eq('rubu_number', rubuNumber);

    if (error) {
      alert("Erreur de synchronisation");
      fetchRubus();
    }
  };

  const totalCompleted = rubus.filter((r) => r.status === 'termine').length;
  const progressPercent = Math.round((totalCompleted / 240) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">KAMIL RAMADAN</h1>
            <p className="text-sm text-emerald-600 font-bold mt-1 uppercase tracking-widest">Suivi des 240 Rubu'</p>
          </div>

          <div className="w-full md:w-80">
            <div className="flex justify-between text-[11px] font-bold mb-2 uppercase text-gray-500">
              <span>Progression Globale</span>
              <span className="text-emerald-700">{totalCompleted} / 240</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
            <BookOpen size={24} />
          </div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed text-black">
            Cliquez sur un <b>Rubu disponible</b> pour le réserver. Une fois votre lecture finie, cliquez sur le bouton <b>Valider</b> pour mettre à jour le Kamil en direct.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {rubus.map((rubu) => (
            <RubuCard
              key={rubu.rubu_number}
              data={rubu}
              onSelect={(num) => {
                setSelectedRubu(num);
                setIsModalOpen(true);
              }}
              onComplete={() => handleMarkComplete(rubu.rubu_number)}
            />
          ))}
        </div>
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        rubuNumber={selectedRubu}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleReserve} // Appellera maintenant handleReserve(nom, tel)
      />
    </main>
  );
}