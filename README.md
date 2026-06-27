EcoAudit 🌍

An application for communities to log waste, but not just where you say you are, cross checking what you say you're disposing of. Designed for the recruitment task of the VITC Projects Department of CodeChef.

Live app: https://ecoaudit-cc9c1.web.app

What it does

Unlike the manual location field, EcoAudit automatically validates waste disposal entries based on the user's location data provided by the browser's built-in Geolocation API, and lets anyone enter a waste disposal entry (category, weight, optionally a picture). Each log is updated in real-time on a live dashboard, showing live totals for each category, with a live audit feed of all logs.

The difference: AI guided categorization. If the photo is attached, Gemini's vision API analyses it and verifies it with the category the user declared. Also, a mismatch appears on the dashboard instead of being trusted silently, bringing anti-fraud from the buzz to the app.

Tech stack


Backend: Express, Handlebars, and Python (Flask)
You can use real-time listeners to update the Firestore database without any manual intervention.Using real-time listeners you can update the Firestore database without having to do anything manually.
Storage: Firebase Storage
The AI classification is done with the Gemini API (multimodal vision).
Geolocation: Browser native Geolocation API (GPS).Geolocation: Browser native Geolocation API (GPS).
Hosting: Firebase Hosting


How it works


User completes the waste-logging form (category, weight, and optionally a photo)
When submitted, browser's Geolocation API gets the actual latitude/longitude (no manual text entry). If access to the location is denied, then the log is saved without an error, and provides a fallback to "no GPS data available"
If there is a picture attached, it is stored in Firebase Storage, and Gemini Vision identifies the type of waste in the image.
The category asserted and the category predicted by the AI are compared, the outcome (verified / unverified) is recorded together with the log
The dashboard is real-time active listener that will update totals and the audit feed as soon as Firestore updates it — no refresh needed.


Run it locally

bashgit clone https://github.com/<your-username>/ecoaudit.git
cd ecoaudit
npm install

Create a .env file in the root with your own Firebase and Gemini credentials:

VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key

Then run:

bashnpm run dev

The app will be accessible over the web at http://localhost:5173.

Project structure

ecoaudit/
├── src/
│   ├── App.jsx           # Main layout
│   ├── wasteformss.js      # Functions for the "wasteform" objects
│   │   └── Dashboard.jsx      # Live totals + audit feed via Firestore onSnapshot
│   └── package.json                    # Project's package details and installation instructions
├── functions/              # Cloud Function for Gemini Vision classification
├── public/
└── package.json

Bonus features implemented


✅ Graceful handling of location permissions denied (log still saves, and is clearly marked)
Accurately classified categories, verified by AI.AI verified category classification.
⬜ Heat mapping (not implemented)



It was created by Siddharth Kannan as a part of the recruitment drive of VITC Projects Department at CodeChef.
