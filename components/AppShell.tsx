'use client';
import React from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { HelpProvider } from '@/components/HelpSystem';
import TopBar from '@/components/ui/TopBar';
import PasswordGate from '@/components/PasswordGate';
import WelcomeScreen from '@/components/WelcomeScreen';
import UploadScreen from '@/components/UploadScreen';
import MappingScreen from '@/components/MappingScreen';
import PreviewScreen from '@/components/PreviewScreen';
import ResultsDashboard from '@/components/ResultsDashboard';
import DetailView from '@/components/DetailView';

function AppContent() {
  const { state } = useStore();
  const render = () => {
    switch (state.currentStep) {
      case 0: return <PasswordGate />;
      case 1: return <WelcomeScreen />;
      case 2: return <UploadScreen />;
      case 3: return <MappingScreen />;
      case 4: return <PreviewScreen />;
      case 5: return <ResultsDashboard />;
      case 6: return <DetailView />;
      default: return <PasswordGate />;
    }
  };
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <TopBar currentStep={state.currentStep} />
      <main>{render()}</main>
    </div>
  );
}

export default function AppShell() {
  return (
    <StoreProvider>
      <HelpProvider>
        <AppContent />
      </HelpProvider>
    </StoreProvider>
  );
}
