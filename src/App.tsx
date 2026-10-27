/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from './types/transit';
import { Header } from './components/common/Header';
import { BottomNav } from './components/layout/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { ActivityScreen } from './components/activity/ActivityScreen';
import { AccountScreen } from './components/account/AccountScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedSaccoId, setSelectedSaccoId] = useState<string>('all');
  const [activeDestination, setActiveDestination] = useState<string>('Westlands (Sarit/The Mall)');
  const [activeRouteId, setActiveRouteId] = useState<string | undefined>('route-e105-westlands');

  // Navigate to Activity with pre-filled destination/route
  const handleNavigateToActivity = (destinationQuery?: string, selectedRouteId?: string) => {
    if (destinationQuery) {
      setActiveDestination(destinationQuery);
    }
    if (selectedRouteId) {
      setActiveRouteId(selectedRouteId);
    }
    setCurrentTab('activity');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#111827] flex flex-col selection:bg-[#00e575] selection:text-[#0b1b3d]">
      {/* Top Header with lowercase m3 branding */}
      <Header
        onOpenProfile={() => setCurrentTab('account')}
        activeSaccoCount={7}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {currentTab === 'home' && (
          <HomeScreen
            selectedSaccoId={selectedSaccoId}
            onSelectSacco={setSelectedSaccoId}
            onNavigateToActivity={handleNavigateToActivity}
          />
        )}

        {currentTab === 'activity' && (
          <ActivityScreen
            selectedSaccoId={selectedSaccoId}
            onSelectSacco={setSelectedSaccoId}
            initialDestination={activeDestination}
            initialRouteId={activeRouteId}
          />
        )}

        {currentTab === 'account' && (
          <AccountScreen
            onUpdatePreferredSaccos={(preferred) => {
              if (preferred.length > 0 && selectedSaccoId === 'all') {
                setSelectedSaccoId(preferred[0]);
              }
            }}
          />
        )}
      </main>

      {/* Primary 3-Tab Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}
