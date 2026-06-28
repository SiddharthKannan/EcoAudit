import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const VALID_CATEGORIES = ['Plastic', 'E-Waste', 'Organic', 'Other'];
const MAX_PHOTO_SIZE_MB = 5;
const CLASSIFY_URL = 'https://ecoaudit-classify.vercel.app/api/classify';

const getSessionId = () => {
  let id = localStorage.getItem('ecoaudit_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ecoaudit_session_id', id);
  }
  return id;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function WasteForm() {
  const [category, setCategory] = useState('Plastic');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedWeight = parseFloat(weight);
    if (!weight || isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 1000) {
      alert('Please enter a valid weight between 0 and 1000 kg.');
      return;
    }
    if (!VALID_CATEGORIES.includes(category)) {
      alert('Invalid category selected.');
      return;
    }
    if (photo && photo.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      alert(`Photo must be smaller than ${MAX_PHOTO_SIZE_MB}MB.`);
      return;
    }

    setLoading(true);
    setGeoError(null);
    setSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await proceedWithSubmit(position.coords.latitude, position.coords.longitude);
      },
      async () => {
        setGeoError("CRITICAL: GPS ACCESS DENIED. RECORDING WITHOUT COORDINATES.");
        await proceedWithSubmit(null, null);
      }
    );
  };

  const proceedWithSubmit = async (lat, lng) => {
    let predictedCategory = null;
    let isVerified = null;

    try {
      if (photo) {
        const base64 = await fileToBase64(photo);
        const res = await fetch(CLASSIFY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: photo.type })
        });
        const data = await res.json();
        if (data.predictedCategory) {
          predictedCategory = data.predictedCategory;
          isVerified = predictedCategory === category;
        }
      }

      await addDoc(collection(db, 'wasteLogs'), {
        category,
        weightKg: parseFloat(weight),
        latitude: lat,
        longitude: lng,
        photoUrl: null,
        predictedCategory,
        isVerified,
        timestamp: serverTimestamp(),
        sessionId: getSessionId()
      });

      setWeight('');
      setPhoto(null);
      setSuccess(true);
      document.getElementById('photo-input').value = '';
    } catch (err) {
      console.error("Error submitting log:", err);
      alert("Failed to submit log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1b15] p-6 border-2 border-[#FAC775] relative">
      <div className="absolute top-0 right-0 w-3 h-3 bg-[#FAC775]"></div>
      <h2 className="text-lg font-black uppercase tracking-widest text-[#FAC775] mb-6 flex items-center justify-between border-b-2 border-[#2e2c22] pb-3">
        <span>[01] ENTRY_RECORD</span>
        <span className="text-xs text-[#8a8a85]">METRIC: KG</span>
      </h2>

      {success && (
        <div className="mb-6 p-4 bg-[#15140f] border-2 border-[#FAC775] text-[#FAC775] text-xs font-bold uppercase tracking-wider">
          &gt;&gt; SUCCESS: DATA_STREAM_COMMITTED
        </div>
      )}
      {geoError && (
        <div className="mb-6 p-4 bg-[#15140f] border-2 border-[#D85A30] text-[#D85A30] text-xs font-bold uppercase tracking-wider">
          ⚠️ WARNING: {geoError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#8a8a85] mb-2">SELECT_MATERIAL_TYPE</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-[#15140f] border-2 border-[#8a8a85] text-[#e8e4d8] focus:border-[#FAC775] outline-none text-sm rounded-none appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%23FAC775'><polygon points='0,0 10,0 5,7'/></svg>")`, backgroundPosition: 'right 15px center', backgroundRepeat: 'no-repeat' }}
          >
            <option value="Plastic">PLASTIC</option>
            <option value="E-Waste">E-WASTE</option>
            <option value="Organic">ORGANIC</option>
            <option value="Other">OTHER_WASTE</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#8a8a85] mb-2">NET_MASS_QUANTITY (KG)</label>
          <input
            type="number" step="0.01" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-[#15140f] border-2 border-[#8a8a85] text-[#e8e4d8] focus:border-[#FAC775] placeholder-[#545450] outline-none text-sm rounded-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#8a8a85] mb-2">VISUAL_EVIDENCE_ATTACHMENT (AI VERIFIED)</label>
          <div className="relative border-2 border-dashed border-[#8a8a85] p-4 bg-[#15140f] text-center">
            <input
              id="photo-input" type="file" accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full text-xs text-[#8a8a85] file:hidden cursor-pointer"
            />
            <span className="text-[11px] font-bold text-[#FAC775] uppercase tracking-wider block mt-1">
              {photo ? `FILE: ${photo.name.toUpperCase()}` : "SELECT IMAGE FILE // [BROWSE]"}
            </span>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-[#FAC775] text-[#15140f] font-black text-xs uppercase tracking-widest py-4 px-4 transition-colors hover:bg-white disabled:opacity-30 border-2 border-[#FAC775] rounded-none"
        >
          {loading ? 'VERIFYING_&_COMMITTING...' : '✓ RECORD_TO_LOGBOOK'}
        </button>
      </form>
    </div>
  );
}