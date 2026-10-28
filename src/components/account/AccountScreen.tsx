/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, SavedPlace, TransportPreferences } from '../../types/transit';
import { SACCOS, INITIAL_USER_PROFILE } from '../../data/mockData';
import { 
  getSavedPlaces, 
  savePlace,
  deletePlace, 
  getTransportPreferences,
  saveTransportPreferences,
  togglePreferredSacco,
  setPrioritizePreferred,
  STORAGE_EVENT 
} from '../../utils/storage';
import { SavedPlaceModal } from '../modals/SavedPlaceModal';
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
  Sparkles,
  Edit2,
  Sliders
} from 'lucide-react';

interface AccountScreenProps {
  onUpdatePreferredSaccos?: (saccoIds: string[]) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onUpdatePreferredSaccos }) => {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => getSavedPlaces());
  const [transportPrefs, setTransportPrefs] = useState<TransportPreferences>(() => getTransportPreferences());
  const [placeToEdit, setPlaceToEdit] = useState<SavedPlace | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshStorageData = useCallback(() => {
    setSavedPlaces(getSavedPlaces());
    const prefs = getTransportPreferences();
    setTransportPrefs(prefs);
    setProfile((prev) => ({
      ...prev,
      preferredSaccoIds: prefs.preferredSaccoIds,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener(STORAGE_EVENT, refreshStorageData);
    return () => window.removeEventListener(STORAGE_EVENT, refreshStorageData);
  }, [refreshStorageData]);

  const handleToggleSacco = (saccoId: string) => {
    const updated = togglePreferredSacco(saccoId);
    setTransportPrefs(updated);
    setProfile((prev) => ({
      ...prev,
      preferredSaccoIds: updated.preferredSaccoIds,
    }));

    if (onUpdatePreferredSaccos) {
      onUpdatePreferredSaccos(updated.preferredSaccoIds);
    }

    const sacco = SACCOS.find((s) => s.id === saccoId);
    const saccoName = sacco ? sacco.name : saccoId;
    const isNowFav = updated.preferredSaccoIds.includes(saccoId);
    showToast(isNowFav ? `Added ${saccoName} to preferred` : `Removed ${saccoName}`);
  };

  const handleTogglePrioritize = () => {
    const nextVal = !transportPrefs.prioritizePreferred;
    const updated = setPrioritizePreferred(nextVal);
    setTransportPrefs(updated);
    showToast(
      nextVal
        ? 'Preferred SACCOs will be prioritized on Home & Activity'
        : 'SACCO prioritization turned off'
    );
  };

  const handleSelectAllSaccos = () => {
    const allValidIds = SACCOS.filter((s) => s.id !== 'all').map((s) => s.id);
    const updated = saveTransportPreferences({
      ...transportPrefs,
      preferredSaccoIds: allValidIds,
    });
    setTransportPrefs(updated);
    setProfile((prev) => ({ ...prev, preferredSaccoIds: allValidIds }));
    if (onUpdatePreferredSaccos) onUpdatePreferredSaccos(allValidIds);
    showToast('All operators selected as preferred');
  };

  const handleClearAllSaccos = () => {
    const updated = saveTransportPreferences({
      ...transportPrefs,
      preferredSaccoIds: [],
    });
    setTransportPrefs(updated);
    setProfile((prev) => ({ ...prev, preferredSaccoIds: [] }));
    if (onUpdatePreferredSaccos) onUpdatePreferredSaccos([]);
    showToast('Cleared preferred operators');
  };

  const handleDeletePlace = (id: string) => {
    const updated = deletePlace(id);
    setSavedPlaces(updated);
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

      {/* 3. Preferred SACCOs & Transit Preferences */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="text-sm font-bold text-[#111827]">Preferred SACCOs</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">
              {transportPrefs.preferredSaccoIds.length} of {SACCOS.filter((s) => s.id !== 'all').length} selected
            </span>
          </div>
        </div>

        {/* Prioritization Toggle Card */}
        <div className="bg-[#f6f8fa] rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex-1 pr-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b1b3d]">
              <Sliders className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Prioritize Preferred SACCOs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Positions your favorite operators first on Home and Activity screens while keeping all routes accessible.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={transportPrefs.prioritizePreferred}
            onClick={handleTogglePrioritize}
            className={`w-11 h-6 shrink-0 rounded-full transition-colors relative focus:outline-none p-0.5 ${
              transportPrefs.prioritizePreferred ? 'bg-[#00e575]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                transportPrefs.prioritizePreferred ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Quick Selection Actions */}
        <div className="flex items-center justify-between text-[11px] pt-1 px-0.5">
          <span className="text-slate-500">
            Select the operators you ride most often:
          </span>
          <div className="flex items-center gap-2 font-semibold">
            <button
              type="button"
              onClick={handleSelectAllSaccos}
              className="text-[#0b1b3d] hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={handleClearAllSaccos}
              className="text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Operator Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SACCOS.filter((s) => s.id !== 'all').map((sacco) => {
            const isFav = transportPrefs.preferredSaccoIds.includes(sacco.id);
            return (
              <button
                key={sacco.id}
                type="button"
                onClick={() => handleToggleSacco(sacco.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition text-left group ${
                  isFav
                    ? 'border-[#0b1b3d] bg-slate-50/80 font-bold text-slate-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      sacco.isElectric ? 'bg-[#00e575] shadow-[0_0_6px_#00e575]' : 'bg-slate-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{sacco.name}</span>
                      {sacco.isElectric && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                          ⚡
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                      {sacco.corridors.slice(0, 2).join(' • ')}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full shrink-0 ml-2 flex items-center justify-center transition-all ${
                    isFav ? 'bg-[#0b1b3d] text-white' : 'border border-slate-300 group-hover:border-slate-400'
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
            onClick={() => {
              setPlaceToEdit(null);
              setIsPlaceModalOpen(true);
            }}
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setPlaceToEdit(place);
                    setIsPlaceModalOpen(true);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-[#0b1b3d] hover:bg-slate-100 transition"
                  title="Edit Place"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePlace(place.id)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Place"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
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

      {/* Add / Edit Saved Place Modal */}
      <SavedPlaceModal
        isOpen={isPlaceModalOpen}
        initialPlace={placeToEdit}
        onClose={() => {
          setIsPlaceModalOpen(false);
          setPlaceToEdit(null);
        }}
        onSave={(place) => {
          const updated = savePlace(place);
          setSavedPlaces(updated);
          showToast(`Saved "${place.title}"`);
        }}
        onDelete={(id) => {
          handleDeletePlace(id);
        }}
      />
    </div>
  );
};
