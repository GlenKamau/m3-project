/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Saved Place Editor & Action Modals for m3 Nairobi
 * Allows commuters to add, rename, edit, and delete saved places,
 * strictly linked with verified Nairobi transit stops and coordinates.
 */

import React, { useState, useEffect } from 'react';
import { SavedPlace, TransitStop } from '../../types/transit';
import { TRANSIT_STOPS, matchStopByQuery } from '../../data/mockData';
import { 
  X, 
  MapPin, 
  Home as HomeIcon, 
  Briefcase, 
  Plane, 
  ShoppingBag, 
  Trash2, 
  Check, 
  Navigation,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SavedPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (place: SavedPlace) => void;
  onDelete?: (id: string) => void;
  initialPlace?: SavedPlace | null;
}

export const SavedPlaceModal: React.FC<SavedPlaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialPlace,
}) => {
  const isEditing = Boolean(initialPlace);

  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState<SavedPlace['iconName']>('home');
  const [selectedStopId, setSelectedStopId] = useState<string>(TRANSIT_STOPS[0].id);
  const [customAddress, setCustomAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Populate fields on open or change
  useEffect(() => {
    if (initialPlace) {
      setTitle(initialPlace.title);
      setIconName(initialPlace.iconName);
      setCustomAddress(initialPlace.address || '');
      
      // Match stop
      const matched = TRANSIT_STOPS.find(
        (s) =>
          s.id === initialPlace.stopId ||
          (Math.abs(s.lat - initialPlace.lat) < 0.001 && Math.abs(s.lng - initialPlace.lng) < 0.001)
      );
      if (matched) {
        setSelectedStopId(matched.id);
      } else {
        setSelectedStopId(TRANSIT_STOPS[0].id);
      }
    } else {
      setTitle('');
      setIconName('home');
      setSelectedStopId(TRANSIT_STOPS[0].id);
      setCustomAddress('');
    }
    setErrorMsg('');
  }, [initialPlace, isOpen]);

  if (!isOpen) return null;

  const selectedStop = TRANSIT_STOPS.find((s) => s.id === selectedStopId) || TRANSIT_STOPS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a display name for this place.');
      return;
    }

    if (!selectedStop) {
      setErrorMsg('Please select a valid Nairobi transit stage.');
      return;
    }

    const placeToSave: SavedPlace = {
      id: initialPlace ? initialPlace.id : `sp-${Date.now()}`,
      title: title.trim(),
      iconName,
      lat: selectedStop.lat,
      lng: selectedStop.lng,
      stopId: selectedStop.id,
      address: customAddress.trim() || `${selectedStop.name}, ${selectedStop.area}`,
    };

    onSave(placeToSave);
    onClose();
  };

  const iconOptions: { name: SavedPlace['iconName']; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { name: 'home', label: 'Home', icon: HomeIcon },
    { name: 'briefcase', label: 'Work', icon: Briefcase },
    { name: 'shopping-bag', label: 'Shopping', icon: ShoppingBag },
    { name: 'plane', label: 'Airport', icon: Plane },
    { name: 'map-pin', label: 'Custom', icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-heading font-extrabold text-[#0b1b3d] text-base md:text-lg">
              {isEditing ? 'Edit Saved Place' : 'Add New Saved Place'}
            </h3>
            <p className="text-xs text-slate-500">
              Quick access shortcut for your Nairobi transit journeys
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Place Category / Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Place Icon & Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = iconName === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      setIconName(opt.name);
                      if (!isEditing && !title.trim()) {
                        if (opt.name === 'home') setTitle('Home');
                        if (opt.name === 'briefcase') setTitle('Work');
                        if (opt.name === 'plane') setTitle('JKIA Airport');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#0b1b3d] text-white border-[#0b1b3d] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Home, Office, Gym, Campus"
              className="w-full bg-[#f6f8fa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0b1b3d] focus:bg-white transition"
            />
          </div>

          {/* Linked Transit Stop / Station */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Nearest Stage / Area <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Verified coords
              </span>
            </div>
            <select
              value={selectedStopId}
              onChange={(e) => {
                setSelectedStopId(e.target.value);
                const stop = TRANSIT_STOPS.find((s) => s.id === e.target.value);
                if (stop && !customAddress) {
                  setCustomAddress(`${stop.name}, ${stop.area}`);
                }
              }}
              className="w-full bg-[#f6f8fa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0b1b3d] focus:bg-white transition"
            >
              {TRANSIT_STOPS.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name} ({stop.area})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5 px-1 font-mono">
              <span>Lines: {selectedStop.lines.join(', ')}</span>
              <span>[{selectedStop.lat.toFixed(4)}, {selectedStop.lng.toFixed(4)}]</span>
            </div>
          </div>

          {/* Specific Address / Landmark */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Address / Landmark Note <span className="text-slate-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="e.g. Near Shell station, Gate B, Apt 4C"
              className="w-full bg-[#f6f8fa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#0b1b3d] focus:bg-white transition"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            {isEditing && onDelete && initialPlace && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialPlace.id);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs transition flex items-center gap-1.5"
                title="Delete this saved place"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0b1b3d] hover:bg-[#14264e] text-white font-bold text-xs shadow-sm transition text-center flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#00e575]" />
              <span>{isEditing ? 'Save Changes' : 'Save Place'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Action Dialog when a Saved Place is tapped
// Allows using as Origin or Destination, or Editing/Deleting
// ---------------------------------------------------------------------------

interface SavedPlaceActionModalProps {
  place: SavedPlace | null;
  onClose: () => void;
  onSetAsDestination: (place: SavedPlace) => void;
  onSetAsOrigin: (place: SavedPlace) => void;
  onEdit: (place: SavedPlace) => void;
  onDelete: (id: string) => void;
}

export const SavedPlaceActionModal: React.FC<SavedPlaceActionModalProps> = ({
  place,
  onClose,
  onSetAsDestination,
  onSetAsOrigin,
  onEdit,
  onDelete,
}) => {
  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0b1b3d] text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5 text-[#00e575]" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-[#0b1b3d] text-base">
                {place.title}
              </h4>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                {place.address || 'Nairobi Transit Stop'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {/* Use as Destination */}
          <button
            onClick={() => {
              onSetAsDestination(place);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-[#00e575] hover:bg-[#00d06a] text-[#0b1b3d] font-bold text-xs md:text-sm flex items-center justify-between transition shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span>Go here (Destination)</span>
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Use as Origin */}
          <button
            onClick={() => {
              onSetAsOrigin(place);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#f6f8fa] hover:bg-slate-100 text-[#0b1b3d] font-semibold text-xs md:text-sm flex items-center justify-between transition border border-slate-200/80"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Start from here (Pick-up)</span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Footer edit & delete */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => {
              onEdit(place);
              onClose();
            }}
            className="font-semibold text-slate-600 hover:text-[#0b1b3d] py-1 px-2 rounded-lg hover:bg-slate-50 transition"
          >
            Edit place details
          </button>

          <button
            onClick={() => {
              onDelete(place.id);
              onClose();
            }}
            className="font-semibold text-red-600 hover:text-red-700 py-1 px-2 rounded-lg hover:bg-red-50 transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
