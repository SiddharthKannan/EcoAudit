EcoAudit

An application that allows for disposal logging in a community - not only to place where you say you are, but to see where you say you're throwing your trash. This is a development of the CodeChef VITC Projects Department recruitment task.

Live app: https://ecoaudit-cc9c1.web.app

What it does

EcoAudit allows anybody to enter a waste disposal record – what it is, how much it weighs and take a picture – and automatically validates it based on the native Geolocation API that powers the browser instead of an application-specific location field. Each log will populate a live dashboard providing real time numbers per category and a real time audit stream of each log entry.

The key differentiator – AI verified categorization. If there is a photo attached, Gemini's vision API identifies the waste in the photo and compares it to the category user declared. When a mismatch occurs, it's reported on the dashboard as AI_FLAGGED and not silently assumed — making anti-fraud a buzzword in the short-term and a feature in the app in the long run.

Tech stack


Backend: NextJS (Next Auth)
Store data: Firebase Firestore (No manual refresh required, real time listeners)
Keep the API Key in the back-end, don't expose in frontend code — AI classification: Gemini API (gemini-2.5-flash, multimodal vision), via small serverless function on Vercel.
Geolocation: Browser built-in Geolocation API
Hosting: Firebase Hosting


How it works


User completes Waste Logging Form: Category, Weight and picture.
No manual text entry is possible, when submitted the browser's Geolocation API picks up real latitude/longitude. In the case of being unable to access the location, the log still saves as "no GPS data available" rather than failing.
The image is encoded in the browser then directly transmitted to a serverless function (/api/classify), which is automatically forwarded to Gemini Vision together with the four valid waste categories.
The function passes the predicted category back to the app; this is returned by Gemini.
The application compares the category declared by the user with the predicted category by Gemini and saves the result – match or mismatch – as isVerified: true/false, along with the log in Firestore.
The dashboard is listening to Firestore in real time, so totals and the audit feed always update as they change, no refresh needed. All entries have a VERIFIED_GPS/NO_GPS stamp, and if a photo was submitted an AI_MATCH/AI_FLAGGED stamp.


Run it locally

bashgit clone https://github.com/SiddharthKannan/ecoaudit.git
cd ecoaudit
npm install

Make a .env file in the root with your own Firebase credentials:

VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

Then run:

bashnpm run dev

The app will be accessible through the URL: http://localhost:5173.

Note about the AI-verification function: This funciton is deployed separately on Vercel, and the GEMINI_API_KEY is in the Vercel environment variables (not this repo). If you wish to run that piece yourself, deploy the function in functions/classify-service (see comments in the folder) to Vercel using your own Gemini key.

Project structure

ecoaudit/
├── src/
│   ├── App.jsx           # Main layout, file-tab navigation
│   |   ├── AddWaste.jsx      # Add waste form: category, weight, photo, geolocation, AI verification call
│   ├── Dashboard.jsx      # Live totals + audit feed onSnapshot Firestore
│   └── functions.js        # Functions for handling cloud functions in the app
├── public/
└── package.json

Design

The design of the visual direction is not the standard eco-app look. The design of Eco Audit is a rugged field manual / research logbook: monospace typography everywhere, sharp corners with heavy 2px borders, a file-tab navigation bar, and rotated rubber-stamp markers for the verification status (rather than colored badge pills). It is a tone intended to be precise or audited, so use onyx or amber instead of green.

Bonus features implemented


Logs are saved in a graceful way if location permission is denied (no crash, log file is marked as such)
Verify categories with AI using Gemini Vision.AI verified category classification with Gemini Vision.
 Map visualization (not implemented)


Known limitations


Photos are processed in-memory for AI classification, and not persisted to storage — Firebase storage now requires a paid (Blaze) plan, which wasn't feasible for the timeframe of this project. The result of the verification is stored and the image is not.



Created by Siddharth Kannan for the recruitment process of VITC Projects Department at CodeChef.
