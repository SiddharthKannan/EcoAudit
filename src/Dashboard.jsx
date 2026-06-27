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
    <div className="space-y-8">
      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(totals).map(([cat, weight]) => (
          <div key={cat} className="bg-[#1c1b15] p-4 border-2 border-[#8a8a85] relative">
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#8a8a85]"></div>
            <p className="text-[10px] font-black text-[#8a8a85] uppercase tracking-widest">{cat}</p>
            <p className="text-xl font-bold text-[#e8e4d8] mt-2">
              {weight.toFixed(2)} <span className="text-xs font-normal text-[#8a8a85]">KG</span>
            </p>
          </div>
        ))}
      </div>

      {/* Live Logs Stream List */}
      <div className="bg-[#1c1b15] p-6 border-2 border-[#8a8a85] relative">
        <h2 className="text-lg font-black uppercase tracking-widest text-[#FAC775] mb-6 flex items-center justify-between border-b-2 border-[#2e2c22] pb-3">
          <span className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#D85A30]"></span>
            [02] FIELD_LEDGER_STREAM
          </span>
          <span className="text-xs text-[#8a8a85]">COUNT: {logs.length}</span>
        </h2>

        {logs.length === 0 ? (
          <div className="text-[#8a8a85] text-center py-12 text-xs border-2 border-dashed border-[#2e2c22] uppercase tracking-widest">
            // NO ENTRIES COMMITTED TO CURRENT LEDGER //
          </div>
        ) : (
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-[#15140f] border-2 border-[#2e2c22] relative items-start sm:items-center">
                
                {/* Visual Evidence Field Box */}
                {log.photoUrl && (
                  <img 
                    src={log.photoUrl} 
                    alt={log.category} 
                    className="w-20 h-20 object-cover border-2 border-[#8a8a85] bg-[#1c1b15] filter grayscale contrast-125 rounded-none"
                  />
                )}
                
                {/* Ledger Item Details */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-sm text-[#e8e4d8] uppercase tracking-wider">
                      MTRL: {log.category}
                    </span>
                    <span className="text-[#FAC775] font-black text-base">
                      {log.weightKg.toFixed(2)} KG
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8a8a85] font-mono tracking-tight truncate">
                    ID: {log.sessionId}
                  </p>
                  <p className="text-[11px] text-[#8a8a85] font-mono mt-1">
                    LOC: {log.latitude && log.longitude ? `${log.latitude.toFixed(5)}N, ${log.longitude.toFixed(5)}E` : 'UNMAPPED_FIELD_ENTRY'}
                  </p>
                </div>

                {/* Rotated Field-Rubber Stamp Custom Accent */}
                <div className="sm:ml-4 flex items-center self-end sm:self-center pt-2 sm:pt-0">
                  {log.latitude && log.longitude ? (
                    <div className="border-2 border-[#FAC775] text-[#FAC775] text-[10px] font-black tracking-widest uppercase px-2 py-1 rotate-[-8deg] pointer-events-none whitespace-nowrap">
                      VERIFIED_GPS
                    </div>
                  ) : (
                    <div className="border-2 border-[#D85A30] text-[#D85A30] text-[10px] font-black tracking-widest uppercase px-2 py-1 rotate-[-8deg] pointer-events-none whitespace-nowrap">
                      UNVERIFIED
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}