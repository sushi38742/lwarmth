'use client';
import React from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import StepIndicator from '@/components/ui/StepIndicator';
import PasswordGate from '@/components/PasswordGate';
import WelcomeScreen from '@/components/WelcomeScreen';
import Tutorial from '@/components/Tutorial';
import UploadScreen from '@/components/UploadScreen';
import MappingScreen from '@/components/MappingScreen';
import PreviewScreen from '@/components/PreviewScreen';
import ResultsDashboard from '@/components/ResultsDashboard';
import DetailView from '@/components/DetailView';

function AppContent() {
  const { state } = useStore();

  const renderStep = () => {
    switch (state.currentStep) {
      case 0: return <PasswordGate />;
      case 1: return <WelcomeScreen />;
      case 2: return <Tutorial />;
      case 3: return <UploadScreen />;
      case 4: return <MappingScreen />;
      case 5: return <PreviewScreen />;
      case 6: return <ResultsDashboard />;
      case 7: return <DetailView />;
      default: return <PasswordGate />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <StepIndicator currentStep={state.currentStep} />
      <main>
        {renderStep()}
      </main>
    </div>
  );
}

export default function AppShell() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
