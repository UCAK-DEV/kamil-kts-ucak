"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, BarChart3, Phone, User, LogOut, XCircle, Trash2, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [details, setDetails] = useState<any[]>([]);
  const [stats, setStats] = useState({ pris: 0, termine: 0 });

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') setIsAdmin(true);
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('rubu_sections').select('*').order('rubu_number', { ascending: true });
    if (data) {
      setStats({
        pris: data.filter(r => r.status === 'pris').length,
        termine: data.filter(r => r.status === 'termine').length
      });
      setDetails(data.filter(r => r.status !== 'disponible'));
    }
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-sm border border-slate-100 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="text-emerald-600" size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Admin</h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10 text-[10px]">Accès restreint</p>
        <input 
          type="password" 
          placeholder="Code secret"
          className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-[1.5rem] mb-6 outline-none font-black text-center text-xl tracking-[0.5em]"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          onClick={() => { if(password === "UCAK") { setIsAdmin(true); localStorage.setItem('admin_auth', 'true'); }}}
          className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:scale-[1.02] transition-all"
        >
          DÉVERROUILLER
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">DASHBOARD</h1>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Kamil Management System</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('admin_auth'); setIsAdmin(false); }} 
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-red-500 font-black text-xs flex items-center gap-2 hover:bg-red-50 transition-all shadow-sm"
          >
            <LogOut size={16} /> QUITTER LA SESSION
          </button>
        </div>

        {/* Stats Cards avec courbe d'évolution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <StatCard label="En cours de lecture" val={stats.pris} color="amber" icon={<Clock size={20}/>} />
          <StatCard label="Rubu complétés" val={stats.termine} color="emerald" icon={<CheckCircle2 size={20}/>} />
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 text-white">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" /> Evolution Globale
              </p>
              <p className="text-5xl font-black">{((stats.termine / 240) * 100).toFixed(1)}<span className="text-xl text-emerald-400 ml-1">%</span></p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800">
              <div className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${(stats.termine / 240) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Liste des Lecteurs */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Lecteurs Actifs ({details.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black uppercase text-slate-400 bg-slate-50/50">
                  <th className="px-10 py-6">Numéro</th>
                  <th className="px-10 py-6">Statut</th>
                  <th className="px-10 py-6">Nom</th>
                  <th className="px-10 py-6">Téléphone</th>
                  <th className="px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {details.map((item) => (
                  <tr key={item.rubu_number} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6"><span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-800">#{item.rubu_number}</span></td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase ${item.status === 'termine' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-bold text-slate-700 tracking-tight">{item.reader_name}</td>
                    <td className="px-10 py-6 text-slate-400 font-bold">
                      <a href={`tel:${item.reader_phone}`} className="hover:text-emerald-600 flex items-center gap-2"><Phone size={14}/> {item.reader_phone}</a>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => { if(confirm("Libérer ce Rubu ?")) supabase.from('rubu_sections').update({ status: 'disponible', reader_name: null, reader_phone: null }).eq('rubu_number', item.rubu_number).then(fetchData); }} 
                              className="text-red-300 hover:text-red-600 transition-colors"><XCircle size={22} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, color, icon }: any) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:scale-[1.02] transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color as keyof typeof colors]}`}>
        {icon}
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
      <p className="text-5xl font-black text-slate-900 tracking-tighter">{val}</p>
    </div>
  );
}