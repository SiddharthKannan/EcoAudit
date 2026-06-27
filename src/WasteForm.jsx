import React, { useState } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get or create a persistent session ID for the user
const getSessionId = () => {
  let id = localStorage.getItem('ecoaudit_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ecoaudit_session_id', id);
  }
  return id;
};

export default function WasteForm() {
  const [category, setCategory] = useState('Plastic');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) {
      alert('Please enter a weight.');
      return;
    }

    setLoading(true);
    setGeoError(null);
    setSuccess(false);

    // 1. Get Geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await proceedWithUpload(latitude, longitude);
      },
      async (error) => {
        console.error("Location permission denied or error:", error);
        setGeoError("Location access denied. Saving log without GPS coordinates.");
        // Proceeding with null coordinates as fallback so app doesn't crash
        await proceedWithUpload(null, null);
      }
    );
  };

  const proceedWithUpload = async (lat, lng) => {
    try {
      // 2. Upload Photo to Firebase Storage (only if one was provided)
      let photoUrl = null;
      if (photo) {
        const storageRef = ref(storage, `waste_photos/${Date.now()}_${photo.name}`);
        const uploadResult = await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(uploadResult.ref);
      }

      // 3. Save Record to Firestore
      await addDoc(collection(db, 'wasteLogs'), {
        category,
        weightKg: parseFloat(weight),
        latitude: lat,
        longitude: lng,
        photoUrl,
        timestamp: serverTimestamp(),
        sessionId: getSessionId()
      });

      // Reset form on success
      setWeight('');
      setPhoto(null);
      setSuccess(true);
      document.getElementById('photo-input').value = '';
    } catch (err) {
      console.error("Error submitting log:", err);
      alert("Failed to submit log. Check your Firebase security rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Log Waste Item</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
          ✓ Logged successfully!
        </div>
      )}

      {geoError && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
          ⚠️ {geoError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Plastic">Plastic</option>
            <option value="E-Waste">E-Waste</option>
            <option value="Organic">Organic</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 2.5"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Upload Photo</label>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="w-full p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition dynamic disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Log'}
        </button>
      </form>
    </div>
  );
}