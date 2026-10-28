/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { COMMUTER_GUIDE_SECTIONS } from '../../data/commuterGuideData';
import {
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Search,
} from 'lucide-react';

interface CommuterGuideModalProps {
  isOpen: boolean;
  initialSectionId?: string | null;
  onClose: () => void;
  onReturnToPlanner?: () => void;
}

export const CommuterGuideModal: React.FC<CommuterGuideModalProps> = ({
  isOpen,
  initialSectionId,
  onClose,
  onReturnToPlanner,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([
    initialSectionId || COMMUTER_GUIDE_SECTIONS[0].id,
  ]);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (isOpen && initialSectionId) {
      setExpandedIds((prev) =>
        prev.includes(initialSectionId) ? prev : [initialSectionId, ...prev]
      );
    }
  }, [isOpen, initialSectionId]);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedIds(COMMUTER_GUIDE_SECTIONS.map((s) => s.id));
  };

  const collapseAll = () => {
    setExpandedIds([]);
  };

  const filteredSections = COMMUTER_GUIDE_SECTIONS.filter((sec) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase().trim();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.summary.toLowerCase().includes(q) ||
      sec.generalGuidance.some((g) => g.toLowerCase().includes(q)) ||
      (sec.terms &&
        sec.terms.some(
          (t) => t.term.toLowerCase().includes(q) || t.meaning.toLowerCase().includes(q)
        ))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#f6f8fa] sm:rounded-3xl rounded-t-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-[#0b1b3d] text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#00e575] text-[#0b1b3d]">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e575]">
                Newcomer & Visitor Handbook
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-heading">
              Nairobi Commuter Guide
            </h2>
            <p className="text-xs text-slate-300">
              Practical tips for navigating SACCO stages, routes, M-Pesa fares, and transfers.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Commuter Guide"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Expand Controls Bar */}
        <div className="bg-white px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search topics (e.g. stage, M-Pesa, shukisha, transfer)..."
              className="w-full bg-[#f6f8fa] text-xs font-medium text-slate-800 rounded-xl pl-8 pr-3 py-2 outline-none focus:ring-1 focus:ring-[#0b1b3d] border border-slate-200/80"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b1b3d] transition"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Scrollable Sections Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {/* Advisory Notice Banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Advisory Note:</strong> This guide provides general orientation for Nairobi public transport. Because fares, stage bays, and payment methods vary by operator and time of day, always verify current details locally with uniformed SACCO marshals or conductors.
            </div>
          </div>

          {/* 8 Expandable Sections */}
          {filteredSections.map((section) => {
            const isExpanded = expandedIds.includes(section.id);
            return (
              <div
                key={section.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-[#0b1b3d] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                        isExpanded
                          ? 'bg-[#0b1b3d] text-[#00e575]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {section.number}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#111827]">
                        {section.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {section.summary}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#0b1b3d]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 text-xs">
                    {/* General Guidance List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        General Commuter Guidance
                      </span>
                      <ul className="space-y-1.5 text-slate-700 leading-relaxed pl-1 mt-1">
                        {section.generalGuidance.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1b3d] mt-1.5 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Glossary Terms if applicable (Section 4) */}
                    {section.terms && section.terms.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {section.terms.map((item) => (
                          <div
                            key={item.term}
                            className="bg-[#f6f8fa] p-2.5 rounded-xl border border-slate-200/80"
                          >
                            <div className="font-bold text-[#0b1b3d] text-xs">
                              {item.term}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {item.meaning}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Verify Locally / Operator-Specific Distinction Box */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-slate-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">
                          Verify Locally:{' '}
                        </span>
                        <span>{section.verifyLocallyNote}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No guide sections matched &quot;{filterQuery}&quot;. Try clearing your search filter.
            </div>
          )}
        </div>

        {/* Footer with Return to Journey Planning */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Your selected origin, destination, and route remain saved.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onReturnToPlanner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturnToPlanner();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-[#00e575] text-[#0b1b3d] font-bold text-xs hover:bg-[#05f782] transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Return to Journey Planner</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-[#0b1b3d] text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
