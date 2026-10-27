/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, SavedPlace } from '../../types/transit';
import { SACCOS, MOCK_SAVED_PLACES, INITIAL_USER_PROFILE } from '../../data/mockData';
import { 
  User, 
  Zap, 
  MapPin, 
  Heart, 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle, 
  Wallet, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink,
  ChevronRight,
  Info,
  PhoneCall,
  Sparkles
} from 'lucide-react';

interface AccountScreenProps {
  onUpdatePreferredSaccos?: (saccoIds: string[]) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onUpdatePreferredSaccos }) => {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(MOCK_SAVED_PLACES);
  const [newPlaceTitle, setNewPlaceTitle] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSacco = (saccoId: string) => {
    const isPreferred = profile.preferredSaccoIds.includes(saccoId);
    const updated = isPreferred
      ? profile.preferredSaccoIds.filter((id) => id !== saccoId)
      : [...profile.preferredSaccoIds, saccoId];

    const updatedProfile = { ...profile, preferredSaccoIds: updated };
    setProfile(updatedProfile);
    if (onUpdatePreferredSaccos) {
      onUpdatePreferredSaccos(updated);
    }
    showToast(`Updated preferred SACCOs`);
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceTitle.trim() || !newPlaceAddress.trim()) return;

    const newPlace: SavedPlace = {
      id: `sp-${Date.now()}`,
      title: newPlaceTitle.trim(),
      address: newPlaceAddress.trim(),
      iconName: 'map-pin',
      lat: -1.286389,
      lng: 36.817223,
    };

    setSavedPlaces([...savedPlaces, newPlace]);
    setNewPlaceTitle('');
    setNewPlaceAddress('');
    setShowAddPlaceModal(false);
    showToast(`Saved "${newPlace.title}" to quick destinations`);
  };

  const handleDeletePlace = (id: string) => {
    setSavedPlaces(savedPlaces.filter((p) => p.id !== id));
    showToast('Destination removed');
  };

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount) || 500;
    setProfile((prev) => ({
      ...prev,
      m3BalanceKes: prev.m3BalanceKes + amount,
    }));
    setShowWalletModal(false);
    showToast(`KES ${amount} added to m3 Transit Pass via M-Pesa (Demo)`);
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b1b3d] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* 1. Profile Header & Green Impact Card */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0b1b3d] text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-slate-100">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#111827] truncate font-heading">
              {profile.name}
            </h2>
            <div className="text-xs text-[#6b7280]">{profile.phone}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {profile.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Environmental & Transit Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                CO₂ Offset
              </span>
              <span className="text-base font-extrabold text-emerald-950">
                {profile.co2SavedKg} kg
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0b1b3d] text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Trips
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {profile.totalTrips} rides
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. m3 Digital Transit Card / Balance */}
      <section className="bg-gradient-to-r from-[#0b1b3d] to-[#1e293b] text-white rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#00e575]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              m3 Transit Balance
            </span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono">
            NFC Active
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-tight font-heading">
              KES {profile.m3BalanceKes.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Auto-topup linked to M-PESA ({profile.phone})
            </div>
          </div>

          <button
            onClick={() => setShowWalletModal(true)}
            className="px-4 py-2 rounded-full bg-[#00e575] text-[#0b1b3d] text-xs font-bold hover:bg-[#05f782] transition shadow-xs"
          >
            + Top Up
          </button>
        </div>
      </section>

      {/* 3. Preferred SACCOs */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="text-sm font-bold text-[#111827]">Preferred SACCOs</h3>
          </div>
          <span className="text-xs text-slate-500">
            {profile.preferredSaccoIds.length} selected
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Prioritizes these operators in route suggestions and arrival boards:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {SACCOS.filter((s) => s.id !== 'all').map((sacco) => {
            const isFav = profile.preferredSaccoIds.includes(sacco.id);
            return (
              <button
                key={sacco.id}
                onClick={() => handleToggleSacco(sacco.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs transition text-left ${
                  isFav
                    ? 'border-[#0b1b3d] bg-slate-50 font-bold text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      sacco.isElectric ? 'bg-[#00e575]' : 'bg-slate-400'
                    }`}
                  />
                  <span>{sacco.name}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isFav ? 'bg-[#0b1b3d] text-white' : 'border border-slate-300'
                  }`}
                >
                  {isFav && <Check className="w-3 h-3 text-[#00e575]" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Saved Destinations Manager */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0b1b3d]" />
            <h3 className="text-sm font-bold text-[#111827]">Saved Destinations</h3>
          </div>
          <button
            onClick={() => setShowAddPlaceModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#0b1b3d] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Place</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="py-2.5 flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-xs text-[#111827]">
                  {place.title}
                </div>
                <div className="text-[11px] text-[#6b7280]">
                  {place.address}
                </div>
              </div>
              <button
                onClick={() => handleDeletePlace(place.id)}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Delete Place"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Language, Location & Accessibility Preferences */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#111827]">Preferences & App Settings</h3>

        {/* Language selector */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-bold text-slate-800">Interface Language</div>
              <div className="text-[11px] text-slate-500">English / Kiswahili / Sheng</div>
            </div>
          </div>
          <select
            value={profile.language}
            onChange={(e) => {
              setProfile({ ...profile, language: e.target.value as any });
              showToast(`Language set to ${e.target.value.toUpperCase()}`);
            }}
            className="bg-slate-100 font-bold text-xs rounded-xl px-2.5 py-1.5 border border-slate-200 outline-none"
          >
            <option value="en">English (Official)</option>
            <option value="sw">Kiswahili (Taifa)</option>
            <option value="sheng">Sheng (Nairobi Streets)</option>
          </select>
        </div>

        {/* Bus Alerts Notification toggle */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-bold text-slate-800">Bus Arrival Notifications</div>
              <div className="text-[11px] text-slate-500">Alert me when my bus is 2 stops away</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={profile.notificationsEnabled}
            onChange={(e) => {
              setProfile({ ...profile, notificationsEnabled: e.target.checked });
              showToast(e.target.checked ? 'Arrival alerts enabled' : 'Arrival alerts silenced');
            }}
            className="w-4 h-4 accent-[#00e575] cursor-pointer"
          />
        </div>

        {/* Low-Floor / Accessible Vehicles */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-bold text-slate-800">Low-Floor Accessibility</div>
              <div className="text-[11px] text-slate-500">Prioritize wheelchair & ramp-ready e-buses</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={profile.accessibleOnly}
            onChange={(e) => {
              setProfile({ ...profile, accessibleOnly: e.target.checked });
              showToast(e.target.checked ? 'Accessible filter active' : 'All vehicles shown');
            }}
            className="w-4 h-4 accent-[#00e575] cursor-pointer"
          />
        </div>
      </section>

      {/* 6. SACCO Support & Help Lines */}
      <section className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-xs space-y-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[#0b1b3d]" />
          <h3 className="font-bold text-[#111827]">SACCO Transit Support (Nairobi)</h3>
        </div>
        <p className="text-[11px] text-slate-500">
          Lost items, route inquiries, or safety hotline numbers:
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <span className="font-bold block text-slate-800">Super Metro Care</span>
            <span className="text-slate-500 font-mono">+254 722 123 456</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <span className="font-bold block text-slate-800">BasiGo Hotline</span>
            <span className="text-slate-500 font-mono">+254 711 987 654</span>
          </div>
        </div>
      </section>

      {/* Top Up Demo Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#0b1b3d] font-heading">
              Top Up m3 Transit Pass
            </h3>
            <p className="text-xs text-slate-600">
              Demo funds will be credited to your card balance via simulated M-Pesa push prompt.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Select Amount (KES)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      topUpAmount === amt
                        ? 'border-[#0b1b3d] bg-[#0b1b3d] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    KES {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTopUp}
                className="flex-1 py-2.5 rounded-full bg-[#00e575] text-[#0b1b3d] text-xs font-bold hover:bg-[#05f782] transition shadow-xs"
              >
                Confirm (Demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Place Modal */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#0b1b3d] font-heading">
              Add Saved Place
            </h3>
            <form onSubmit={handleAddPlace} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Place Name
                </label>
                <input
                  type="text"
                  value={newPlaceTitle}
                  onChange={(e) => setNewPlaceTitle(e.target.value)}
                  placeholder="e.g. Gym, Parents, Church"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#0b1b3d]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Stage / Address
                </label>
                <input
                  type="text"
                  value={newPlaceAddress}
                  onChange={(e) => setNewPlaceAddress(e.target.value)}
                  placeholder="e.g. Valley Arcade, Lavington"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#0b1b3d]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#0b1b3d] text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
