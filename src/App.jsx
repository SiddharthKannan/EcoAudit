import React from 'react';
import WasteForm from './WasteForm';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="bg-emerald-700 text-white py-5 px-6 shadow-md mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">♻️ EcoAudit</h1>
          <p className="text-xs bg-emerald-800 px-3 py-1 rounded-full text-emerald-200 font-mono">Live Sync Enabled</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form takes 1 Column */}
          <div className="lg:col-span-1">
            <WasteForm />
          </div>
          
          {/* Dashboard takes 2 Columns */}
          <div className="lg:col-span-2">
            <Dashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
