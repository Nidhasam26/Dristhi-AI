# DRISHTI AI

DRISHTI AI is an explainable diabetic retinopathy screening platform for rural healthcare workflows. It supports offline-first patient and scan workflows, MySQL persistence, patient privacy filtering, and spoken guidance in English, Hindi, Kannada, and Marathi.

## Requirements

- Node.js 18 or newer
- MySQL 8 or compatible MySQL server
- A modern browser with Web Speech API support for voice guidance

## Install

```powershell
npm install
```

## Configure MySQL

The backend reads its environment variables from `scripts/backend/.env`.

Example:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=drishti_ai
DB_PORT=3306
PORT=5000
```

Run `setup-mysql.sql` in MySQL Workbench to create or migrate the database tables. Do not commit real database passwords or other secrets.

## Run Locally

Open two terminals in the project root.

Terminal 1:

```powershell
npm run backend
```

The API runs at `http://localhost:5000`.

Terminal 2:

```powershell
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173/Drishti-AI/
```

If port 5173 is busy, Vite selects another port.

## Verify the Backend

```powershell
Invoke-WebRequest http://localhost:5000/api/health
Invoke-WebRequest http://localhost:5000/api/test-db
```

The database check should return `connected: 1`.

## Frontend and MySQL Data

When the backend is online, registering a patient from the frontend sends the record to MySQL. The frontend keeps an IndexedDB cache for offline use and queues changes when the backend is unavailable.

Patient and scan records are refreshed from the backend when the app loads, regains focus, or reconnects.

## Privacy

- Admin accounts can access the complete patient registry.
- Patient-facing accounts receive only their own patient record and scans.
- Backend ownership checks protect patient reads, updates, and deletes.
- Existing patients must have the correct `user_id` in MySQL to appear to that patient account.

Example:

```sql
UPDATE patients
SET user_id = 'USR003'
WHERE id = 'PAT001';
```

Use the canonical user ID from the `users` table.

## Voice Guidance

Voice guidance is available from the login screen, top navigation, and Settings. Select English, Hindi, Kannada, or Marathi and enable voice from a user click.

The app uses the browser's local speech engine and works offline. If the app reports that voice is unavailable, install the required Windows language Text-to-speech voices and restart the browser. Kannada and Hindi require matching system voices for natural pronunciation.

## Build

```powershell
npm run build
```

## Main Folders

- `src/` - React frontend
- `src/context/` - authentication, patient, connectivity, and sync state
- `src/services/` - voice guidance, synchronization, inference, and notifications
- `scripts/backend/` - Express API and MySQL routes
- `public/` - static assets and PWA files
- `setup-mysql.sql` - database setup and compatibility migration
