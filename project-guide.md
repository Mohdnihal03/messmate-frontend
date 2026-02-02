# MessMate Project Guide: Structure & Working

This guide explains how the MessMate application is structured and how the frontend and backend work together.

## 🏗️ high-Level Architecture

MessMate is a full-stack web application built with:
- **Frontend**: React + Vite (Port 5173) for the user interface.
- **Backend**: Payload CMS + Next.js (Port 3001) for API and data management.
- **Database**: MongoDB (Local or Atlas) for storing data.

The frontend communicates with the backend via REST APIs using JWT authentication.

---

## 📂 Project Structure

### 1. Root Directory (`messmate-frontend/`)
This contains the **Frontend** code.

```bash
messmate-frontend/
├── src/
│   ├── components/       # Reusable UI components (Buttons, Cards, Layouts)
│   ├── contexts/         # Global state (AuthContext.tsx)
│   ├── pages/            # Page components (Login, Dashboard, RoomSetup)
│   ├── services/         # API integration (api.ts)
│   ├── App.tsx           # Main app component & routing
│   └── main.tsx          # Entry point
├── backend/              # BACKEND PROJECT FOLDER (Nested here)
├── .env.local            # Frontend environment vars (API URL)
└── package.json          # Frontend dependencies
```

### 2. Backend Directory (`messmate-frontend/backend/`)
This contains the **Payload CMS** code.

```bash
backend/
├── src/
│   ├── collections/      # Data schemas (Database tables)
│   │   ├── Users.ts      # User auth & profile
│   │   ├── Rooms.ts      # Room groups
│   │   ├── Expenses.ts   # Expense records
│   │   ├── Settlements.ts # Payment tracking
│   │   └── Media.ts      # File uploads
│   └── payload.config.ts # CMS configuration
├── .env                  # Backend environment vars (Database URI)
└── package.json          # Backend dependencies
```

---

## 🧠 Key Components & Logic

### 1. Authentication Flow
- **Backend (`Users.ts`)**: Handles user data. We enabled `auth: true`, giving us built-in Login/Logout APIs.
- **Frontend (`AuthContext.tsx`)**: 
  - Manages global user state (`user`, `loading`).
  - Provides `login()`, `signup()`, `logout()` functions.
  - Automatically attaches the JWT token to every API request.

### 2. Room Management
- **Concepts**: A "Room" is a group of users who share expenses.
- **Logic**:
  - Users can **Create** a room (generates a unique `inviteCode`).
  - Users can **Join** a room using that code.
  - **Backend Access Control**: Users can only see expenses/rooms they belong to.

### 3. Expense Tracking
- **Data Model (`Expenses.ts`)**:
  - `amount`: How much was spent.
  - `paidBy`: Who paid (User ID).
  - `membersPresent`: Who shares this expense (User IDs).
  - `billImage`: Optional photo of the receipt.
- **Calculation Logic (`Dashboard.tsx`)**:
  - **Total**: Sum of all expenses in the room.
  - **Your Share**: (Total / Number of Members).
  - **Balance**: (Amount You Paid) - (Your Share).

---

## 🔄 Data Flow Example: Adding an Expense

1.  **User Action**: User fills form in `AddExpense.tsx` and clicks "Submit".
2.  **Frontend Service**: `createExpense()` in `api.ts` is called.
    *   If there's an image, `uploadBillImage()` is called first.
    *   Authentication token is attached to headers.
3.  **API Request**: `POST http://localhost:3001/api/expenses`
4.  **Backend Verification**: 
    *   Payload CMS checks if token is valid.
    *   Checks if user is a member of the room (Access Control).
5.  **Database**: Data is saved to MongoDB.
6.  **Response**: Backend returns the created expense object.
7.  **UI Update**: Frontend navigates to Dashboard, which refetches data and updates balances.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js installed.
- MongoDB running (locally or Atlas).

### 1. Start the Backend
Open a terminal:
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### 2. Start the Frontend
Open a **new** terminal (keep backend running):
```bash
# In the root folder (messmate-frontend)
npm run dev
# Runs on http://localhost:5173
```

### 3. Usage
1.  Go to `http://localhost:5173`.
2.  **Signup** a new user.
3.  **Create a Room** (Copy the invite code).
4.  **Add Expenses**.
5.  (Optional) Open Incognito window, signup another user, and **Join** using the code.

---

## 🛠️ Customization

- **Styling**: We use **Tailwind CSS**. Edit classes directly in TSX files.
- **Components**: We use **shadcn/ui**. Components are in `src/components/ui/`.
- **Backend Fields**: To add more data (e.g., "Phone Number"), edit `backend/src/collections/Users.ts` and restart backend.

---

## 🚢 Deployment (Vercel)

1.  **Database**: Use MongoDB Atlas (Cloud). Update `.env` with Atlas URI.
2.  **Frontend**:
    *   Set `VITE_API_URL` to your production backend URL.
3.  **Backend**:
    *   Deploy as a Next.js app.
    *   Set environment variables in Vercel (`DATABASE_URI`, `PAYLOAD_SECRET`, etc.).
