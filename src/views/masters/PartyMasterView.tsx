import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { Party } from '../../types';
import {
  Users,
  Plus,
  Search,
  Edit2,
  ArrowLeft,
  Download,
  Building,
  CreditCard,
} from 'lucide-react';

interface PartyMasterViewProps {
  onBack: () => void;
}

export const PartyMasterView: React.FC<PartyMasterViewProps> = ({ onBack }) => {
  const { parties, addParty, updateParty } = usePharoah();

  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'All' | 'Sundry Debtors' | 'Sundry Creditors'>('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState<'Sundry Debtors' | 'Sundry Creditors'>('Sundry Debtors');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Udaipur');
  const [state, setState] = useState('Rajasthan');
  const [gst, setGst] = useState('');
  const [dl, setDl] = useState('');
  const [dlExp, setDlExp] = useState('2028-12-31');
  const [priceLevel, setPriceLevel] = useState<'A' | 'B' | 'C'>('A');
  const [creditLimit, setCreditLimit] = useState(50000);
  const [creditDays, setCreditDays] = useState(30);
  const [opBal, setOpBal] = useState(0);

  const openNew = () => {
    setEditingPartyId(null);
    setName('');
    setGroup('Sundry Debtors');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('Udaipur');
    setState('Rajasthan');
    setGst('');
    setDl('');
    setDlExp('2028-12-31');
    setPriceLevel('A');
    setCreditLimit(50000);
    setCreditDays(30);
    setOpBal(0);
    setIsModalOpen(true);
  };

  const openEdit = (p: Party) => {
    setEditingPartyId(p.id);
    setName(p.name);
    setGroup(p.group);
    setPhone(p.phone);
    setEmail(p.email);
    setAddress(p.address);
    setCity(p.city);
    setState(p.state);
    setGst(p.gst);
    setDl(p.dl);
    setDlExp(p.dlExp);
    setPriceLevel(p.priceLevel);
    setCreditLimit(p.creditLimit);
    setCreditDays(p.creditDays);
    setOpBal(p.opBal);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Party name is required.');
      return;
    }

    if (editingPartyId) {
      updateParty(editingPartyId, {
        name: name.trim().toUpperCase(),
        group,
        phone,
        email,
        address,
        city,
        state,
        gst: gst.trim(),
        dl: dl.trim(),
        dlExp,
        priceLevel,
        creditLimit,
        creditDays,
        opBal,
      });
      alert('Party master updated.');
    } else {
      addParty({
        name: name.trim().toUpperCase(),
        group,
        phone,
        email,
        address,
        city,
        state,
        route: 'RT-001',
        gst: gst.trim(),
        dl: dl.trim(),
        dlExp,
        pan: '',
        transport: 'Local',
        priceLevel,
        defaultSeriesId: 'INV',
        hsnCode: '3004',
        opBal,
        creditLimit,
        creditDays,
      });
      alert('New party registered.');
    }
    setIsModalOpen(false);
  };

  const filteredParties = parties.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.city.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.gst.toLowerCase().includes(term);
    const matchesGroup = groupFilter === 'All' || p.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                PARTY MASTER DIRECTORY
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-900 text-indigo-300">
                {parties.length} Parties
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sundry Debtors (chemists/retailers) & Sundry Creditors (distributors/C&F)
            </p>
          </div>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Party</span>
        </button>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search party by name, city, phone, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white"
          />
        </div>

        <div>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white font-semibold"
          >
            <option value="All">All Groups ({parties.length})</option>
            <option value="Sundry Debtors">Sundry Debtors (Customers)</option>
            <option value="Sundry Creditors">Sundry Creditors (Suppliers)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Party Name</th>
                <th className="p-3">Group</th>
                <th className="p-3">Contact Phone</th>
                <th className="p-3">GSTIN</th>
                <th className="p-3">DL Number</th>
                <th className="p-3 text-center">Price Level</th>
                <th className="p-3 text-right">Credit Limit</th>
                <th className="p-3 text-right">Opening Bal</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredParties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="font-extrabold text-white text-sm">{p.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {p.city}, {p.state}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.group === 'Sundry Debtors'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {p.group}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{p.phone || 'N/A'}</td>
                  <td className="p-3 font-mono text-slate-300">{p.gst || 'URP'}</td>
                  <td className="p-3 text-slate-300 text-xs">{p.dl || 'N/A'}</td>
                  <td className="p-3 text-center font-bold text-blue-400">
                    Level {p.priceLevel}
                  </td>
                  <td className="p-3 text-right text-slate-300">
                    ₹{p.creditLimit.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-bold text-white">
                    ₹{p.opBal.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-sm text-white">
              {editingPartyId ? 'Edit Party Profile' : 'Add New Party Profile'}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Party / Chemist Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CITY HEALTH PHARMACY"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Account Group</label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="Sundry Debtors">Sundry Debtors (Customer)</option>
                  <option value="Sundry Creditors">Sundry Creditors (Supplier / Distributor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Price Level</label>
                <select
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                >
                  <option value="A">Rate A (Standard Wholesale)</option>
                  <option value="B">Rate B (Special Retail)</option>
                  <option value="C">Rate C (Institutional)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="15-character GSTIN"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Drug License (DL) No</label>
                <input
                  type="text"
                  value={dl}
                  onChange={(e) => setDl(e.target.value)}
                  placeholder="RJ-UD-20B/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Full Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Credit Days</label>
                <input
                  type="number"
                  value={creditDays}
                  onChange={(e) => setCreditDays(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Opening Bal (₹)</label>
                <input
                  type="number"
                  value={opBal}
                  onChange={(e) => setOpBal(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Save Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
