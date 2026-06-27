import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({ Plastic: 0, 'E-Waste': 0, Organic: 0, Other: 0 });

  useEffect(() => {
    const q = query(collection(db, 'wasteLogs'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = [];
      const newTotals = { Plastic: 0, 'E-Waste': 0, Organic: 0, Other: 0 };

      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLogs.push({ id: doc.id, ...data });

        if (newTotals[data.category] !== undefined) {
          newTotals[data.category] += data.weightKg || 0;
        }
      });

      setLogs(fetchedLogs);
      setTotals(newTotals);
    }, (error) => {
      console.error("Error listening to logs:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(totals).map(([cat, weight]) => (
          <div key={cat} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{cat}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{weight.toFixed(2)} <span className="text-sm font-normal text-gray-400">kg</span></p>
          </div>
        ))}
      </div>

      {/* Live Logs Stream List */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Audit Feed
        </h2>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No waste entries logged yet.</p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl items-center border border-gray-100">
                {log.photoUrl && (
                  <img 
                    src={log.photoUrl} 
                    alt={log.category} 
                    className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-800">{log.category}</span>
                    <span className="text-emerald-600 font-semibold text-sm">{log.weightKg} kg</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">Session: {log.sessionId}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {log.latitude && log.longitude ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}` : 'No GPS data'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}