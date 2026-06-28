import React from 'react';
import WasteForm from './WasteForm';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#15140f] text-[#e8e4d8] p-4 md:p-8 selection:bg-[#FAC775] selection:text-[#15140f]">
      {/* File-Tab Style Navigation Header */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-wrap items-center border-b-2 border-[#8a8a85]">
          {/* Active Logbook Tab */}
          <div className="bg-[#FAC775] text-[#15140f] px-6 py-3 font-extrabold text-sm uppercase tracking-wider border-2 border-b-0 border-[#FAC775]">
            📂 ECO-AUDIT // LOG_MAIN
          </div>
          {/* Inactive Metadata Tabs */}
          <div className="border-2 border-b-0 border-[#8a8a85] text-[#8a8a85] px-6 py-3 text-xs uppercase tracking-widest font-bold bg-[#1c1b15] opacity-60 hidden sm:block">
            SYS_STATUS: ACTIVE
          </div>
          <div className="border-2 border-b-0 border-l-0 border-[#8a8a85] text-[#8a8a85] px-6 py-3 text-xs uppercase tracking-widest font-bold bg-[#1c1b15] opacity-60 hidden md:block">
            ENV_SECURE_MODE // ON
          </div>
          {/* Live Sync Stamp Indicator */}
          <div className="ml-auto text-xs text-[#FAC775] font-bold tracking-widest animate-pulse px-3 py-2 border border-[#FAC775]">
            [ LIVE_STREAM_CONNECTED ]
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Sidepanel (1 Column) */}
          <div className="lg:col-span-1">
            <WasteForm />
          </div>

          {/* Data Feed & Metrics (2 Columns) */}
          <div className="lg:col-span-2">
            <Dashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
