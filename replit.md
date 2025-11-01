# Kenya Syllabus AI Tutor

## Overview
This is an AI-powered tutoring application designed for the Kenyan 8-4-4 secondary school curriculum (Forms 1-4). The app uses Google's Gemini AI to answer questions about various subjects including History, Business Studies, Biology, Chemistry, Mathematics, English, and Kiswahili.

**Access Control**: The application requires a one-time access code to use. Administrators can generate and manage these codes through the admin panel.

## Project Architecture

### Technology Stack
- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Backend**: Express.js (Node.js)
- **AI Service**: Google Gemini AI (via @google/genai)
- **Styling**: Tailwind CSS (via CDN)

### Project Structure
```
/
├── components/          # React components
│   ├── icons/          # SVG icon components
│   ├── AnswerDisplay.tsx
│   ├── EssaySection.tsx
│   ├── ImageUploader.tsx
│   ├── NoteUploader.tsx
│   ├── QuestionInput.tsx
│   └── SubjectSelector.tsx
├── services/           # Frontend services
│   └── geminiService.ts
├── server/             # Backend server
│   └── index.ts       # Express API server
├── api/               # Original Vercel Edge function (deprecated)
│   └── generate.ts    # Not used - replaced by server/index.ts
├── App.tsx            # Main React application
├── types.ts           # TypeScript type definitions
├── constants.ts       # App constants
└── vite.config.ts     # Vite configuration
```

### Architecture Details

**Frontend (Port 5000)**:
- Vite development server serving the React application
- Proxies `/api` requests to the backend server
- Configured for Replit's environment with HMR over WSS

**Backend (Port 8000)**:
- Express server running on localhost:8000
- Handles POST requests to `/api/generate`
- Manages Gemini AI API calls with the GEMINI_API_KEY
- Supports image uploads (base64) for Math problems
- Provides subject-specific AI tutoring with custom system instructions

### Key Features
1. **Access Control System**: One-time access codes protect the tutor application
2. **Admin Dashboard**: Generate and manage access codes at `/admin`
3. **Subject Selection**: Seven subjects from Kenyan curriculum
4. **Note Upload**: Upload syllabus booklets (.txt, .md, .pdf, .docx) for Business and Chemistry
5. **Image Upload**: Upload math problem images for Mathematics subject
6. **Essay Questions**: Special interface for English and Kiswahili with set book selection
7. **AI-Powered Answers**: Gemini AI provides curriculum-aligned responses

### Authentication & Access
- **User Access**: Users visit the main page and enter a one-time access code
- **Admin Panel**: Accessible at `/admin` with the admin password
- **Code Management**: Admins can generate, view active codes, and see used codes
- **One-Time Codes**: Each code can only be used once, then it's moved to used codes list

## Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (stored in Replit Secrets)
- `ADMIN_PASSWORD`: Password for admin panel access (stored in Replit Secrets)

## Running the Application

The app runs both frontend and backend concurrently:
```bash
npm run dev:full
```

This executes:
- Backend API server on http://localhost:8000
- Frontend Vite dev server on http://0.0.0.0:5000

## Development Notes

### Recent Changes (Nov 1, 2025)

**Initial Setup:**
- Migrated from Vercel Edge runtime to Express.js for Replit compatibility
- Updated Vite config to use port 5000 (required for Replit webview)
- **Added `allowedHosts: true` to Vite config** (critical for Replit's dynamic proxy domains)
- Added API proxy in Vite to route `/api` requests to backend
- Removed API key exposure from frontend (now backend-only)
- Configured HMR for Replit's proxy environment (WSS protocol on port 443)
- Installed all required dependencies including pdfjs-dist

**Authentication System:**
- Added one-time access code system to control tutor access
- Created admin panel at `/admin` for code management
- Implemented secure admin authentication with password
- Added file-based storage for access codes (data/codes.json)
- Codes are 8-character hex strings, single-use only
- Admin can generate, view, and delete access codes

### Migration from Vercel
The original app used Vercel's Edge runtime for serverless functions. For Replit:
- Created Express server (`server/index.ts`) to replace Edge function
- Backend handles Gemini AI calls server-side only
- Frontend remains unchanged, still calls `/api/generate`
- Vite proxy ensures seamless communication between layers

## User Preferences
None specified yet.

## Usage Instructions

### For Administrators
1. Visit `/admin` to access the admin panel
2. Login with your admin password (set in ADMIN_PASSWORD secret)
3. Click "Generate New Code" to create access codes
4. Share the generated codes with users
5. View active and used codes in the dashboard
6. Delete codes that are no longer needed

### For Users
1. Visit the main page
2. Enter the access code provided by your administrator
3. Once verified, you'll have permanent access (stored in browser)
4. Select a subject and start asking questions

## Known Issues
- Browser console shows HMR WebSocket warnings - these are cosmetic and don't affect functionality
- CDN Tailwind warning in production - consider installing Tailwind CSS properly for production builds

## Future Improvements
- Add session expiration for admin tokens
- Implement server-side validation of admin sessions on page load
- Add optional expiration time for user access codes
- Improve error handling for network failures in admin panel
