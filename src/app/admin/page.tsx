"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  RotateCcw, 
  ShieldCheck, 
  Loader2, 
  BarChart3, 
  Trash2, 
  ArrowLeft, 
  Phone, 
  User,
  LogOut,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 240, pris: 0, termine: 0 });
  const [details, setDetails] = useState<any[]>([]);

  // 1. PERSISTANCE DE LA SESSION
  useEffect(() => {
    const savedAdmin = localStorage.getItem('kamil_admin_auth');
    if (savedAdmin === 'true') setIsAdmin(true);
  }, []);

  // 2. RÉCUPÉRATION DES DONNÉES (Incluant le téléphone)
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('rubu_sections')
      .select('status, rubu_number, reader_name, reader_phone')
      .order('rubu_number', { ascending: true });

    if (!error && data) {
      setStats({
        total: data.length,
        pris: data.filter(r => r.status === 'pris').length,
        termine: data.filter(r => r.status === 'termine').length
      });
      // On affiche tous ceux qui ne sont pas "disponible"
      setDetails(data.filter(r => r.status !== 'disponible'));
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();

    // TEMPS RÉEL : Mise à jour automatique si un utilisateur s'inscrit sur le site
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rubu_sections' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  // 3. ACTIONS
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "UCAK") { 
      setIsAdmin(true);
      localStorage.setItem('kamil_admin_auth', 'true');
    } else {
      alert("Code incorrect");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kamil_admin_auth');
    setIsAdmin(false);
  };

  // LIBÉRER UN SEUL RUBU (Pratique pour corriger une erreur)
  const releaseRubu = async (num: number) => {
    if (!confirm(`Libérer le Rubu #${num} ?`)) return;
    const { error } = await supabase
      .from('rubu_sections')
      .update({ status: 'disponible', reader_name: null, reader_phone: null, taken_at: null, completed_at: null })
      .eq('rubu_number', num);
    
    if (error) alert(error.message);
    else fetchData();
  };

  const resetAll = async () => {
    if (!confirm("⚠️ RÉINITIALISATION TOTALE ?")) return;
    setLoading(true);
    const { error } = await supabase
      .from('rubu_sections')
      .update({ status: 'disponible', reader_name: null, reader_phone: null, taken_at: null, completed_at: null })
      .neq('status', 'disponible');

    if (error) alert(error.message);
    else fetchData();
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border">
          <div className="flex justify-center mb-6 text-emerald-600"><ShieldCheck size={50} /></div>
          <h1 className="text-xl font-black text-center mb-6 uppercase text-slate-800">Accès Admin</h1>
          <input 
            type="password" 
            autoFocus
            placeholder="Code secret"
            className="w-full p-4 bg-slate-50 border rounded-2xl mb-4 outline-none focus:ring-2 ring-emerald-500 text-black font-bold text-center"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg">Connexion</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfd] p-6">
      <div className="max-w-5xl mx-auto text-black">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft size={16} /> Retour au site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>

        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-8">
          <BarChart3 className="text-emerald-600" /> DASHBOARD ADMINISTRATEUR
        </h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-2 text-black">Lectures en cours</p>
            <p className="text-4xl font-black text-amber-500">{stats.pris}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-2 text-black">Sections terminées</p>
            <p className="text-4xl font-black text-emerald-600">{stats.termine}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-2 text-black">Progression</p>
            <p className="text-4xl font-black text-slate-800">{((stats.termine / 240) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Tableau détaillé des lecteurs avec Téléphone */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm mb-10 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">Suivi des lecteurs ({details.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase border-b border-slate-50">
                  <th className="p-4">Rubu</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Nom du Lecteur</th>
                  <th className="p-4">Téléphone</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {details.map((item) => (
                  <tr key={item.rubu_number} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-slate-900">#{item.rubu_number}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        item.status === 'termine' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-300" /> {item.reader_name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {item.reader_phone ? (
                        <a href={`tel:${item.reader_phone}`} className="flex items-center gap-2 hover:text-emerald-600 transition-colors">
                          <Phone size={14} className="text-slate-300" /> {item.reader_phone}
                        </a>
                      ) : "Non renseigné"}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => releaseRubu(item.rubu_number)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Libérer ce rubu"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {details.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400 italic">
                      Aucune activité pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zone de Danger */}
        <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem]">
          <h2 className="text-red-800 font-black text-xl mb-4 flex items-center gap-2">
            <RotateCcw size={20} /> Zone de réinitialisation
          </h2>
          <button 
            onClick={resetAll}
            disabled={loading}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-red-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Trash2 size={20} />}
            TOUT EFFACER ET RECOMMENCER
          </button>
        </div>
      </div>
    </div>
  );
}