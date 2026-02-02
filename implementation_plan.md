# MessMate Payload CMS Backend - Implementation Plan

A structured plan to build and deploy the Payload CMS backend for MessMate.

## Overview

This plan will guide you through creating a complete Payload CMS backend that integrates with your existing MessMate frontend, providing authentication, data management, and file uploads, all deployable to Vercel.

---

## Phase 1: Project Setup & Configuration

### 1.1 Create Payload CMS Project

**Location**: `c:\Users\moham\Documents\messmate-backend`

**Steps**:
1. Run `npx create-payload-app@latest messmate-backend`
2. Choose template: **blank**
3. Choose database: **MongoDB**
4. Package manager: **npm**

**Expected Output**: New project directory with Payload boilerplate

---

### 1.2 Configure Environment Variables

**File**: `messmate-backend\.env`

**Required Variables**:
```env
DATABASE_URI=mongodb://localhost:27017/messmate
PAYLOAD_SECRET=your-super-secret-key-change-this-in-production
PORT=3001
CORS_ORIGINS=http://localhost:5173
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
```

> [!IMPORTANT]
> For production, you'll need MongoDB Atlas (free tier available). The local MongoDB is just for development.

---

### 1.3 Install Additional Dependencies

```bash
cd messmate-backend
npm install dotenv cross-env
```

---

## Phase 2: Create Collections

### 2.1 Users Collection

**File**: [NEW] [Users.ts](file:///c:/Users/moham/Documents/messmate-backend/src/collections/Users.ts)

**Features**:
- Built-in authentication
- Name, email, password fields
- Avatar field (stores initials)
- Relationship to rooms

**Key Configuration**:
- `auth: true` - Enables JWT authentication
- Email/password validation
- Secure password hashing (automatic)

---

### 2.2 Rooms Collection

**File**: [NEW] [Rooms.ts](file:///c:/Users/moham/Documents/messmate-backend/src/collections/Rooms.ts)

**Features**:
- Room name
- Auto-generated invite code
- Admin (creator) relationship
- Members array (user relationships)

**Hooks**:
- `beforeChange`: Auto-generate unique invite code on creation

---

### 2.3 Expenses Collection

**File**: [NEW] [Expenses.ts](file:///c:/Users/moham/Documents/messmate-backend/src/collections/Expenses.ts)

**Features**:
- Amount, description, date
- Paid by (user relationship)
- Members present (multiple users)
- Category (select field)
- Bill image upload (relationship to Media)
- Room relationship

**Access Control**:
- Users can only see expenses from their rooms
- Users can only create/edit expenses in their rooms

---

### 2.4 Settlements Collection

**File**: [NEW] [Settlements.ts](file:///c:/Users/moham/Documents/messmate-backend/src/collections/Settlements.ts)

**Features**:
- From/To user relationships
- Amount
- Status (pending/completed)
- Date settled
- Room relationship

---

### 2.5 Media Collection

**File**: [NEW] [Media.ts](file:///c:/Users/moham/Documents/messmate-backend/src/collections/Media.ts)

**Features**:
- File upload handling
- Image storage in `media/` directory
- Alt text field
- Automatic URL generation

---

### 2.6 Update Payload Config

**File**: [MODIFY] [payload.config.ts](file:///c:/Users/moham/Documents/messmate-backend/src/payload.config.ts)

**Changes**:
- Import all collections
- Add collections to config
- Configure CORS for frontend
- Set admin user collection
- Enable TypeScript types generation

---

## Phase 3: Frontend Integration

### 3.1 Create API Service Layer

**File**: [NEW] [api.ts](file:///c:/Users/moham/Documents/messmate-frontend/src/services/api.ts)

**Functions to Implement**:

#### Authentication
- `login(email, password)` → Returns user + JWT token
- `signup(name, email, password)` → Creates user + returns token
- `logout()` → Clears token
- `getCurrentUser()` → Gets logged-in user data

#### Rooms
- `createRoom(name)` → Creates new room with auto-generated invite code
- `joinRoom(inviteCode)` → Finds room and adds user to members
- `getRoomsByUser()` → Gets all rooms user belongs to
- `updateRoom(id, data)` → Updates room settings

#### Expenses
- `createExpense(data)` → Creates new expense
- `getExpensesByRoom(roomId, month?)` → Gets expenses with optional month filter
- `updateExpense(id, data)` → Updates expense
- `deleteExpense(id)` → Deletes expense
- `uploadBillImage(file)` → Uploads image, returns media ID

#### Settlements
- `createSettlement(data)` → Creates settlement
- `getSettlementsByRoom(roomId)` → Gets settlements for room
- `markSettlementAsPaid(id)` → Updates status to completed

---

### 3.2 Create Auth Context

**File**: [NEW] [AuthContext.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/contexts/AuthContext.tsx)

**Purpose**: Manage authentication state globally

**Features**:
- Store current user
- Store JWT token
- Provide login/logout functions
- Persist token in localStorage
- Auto-fetch user on app load

---

### 3.3 Update Frontend Pages

#### Login Page
**File**: [MODIFY] [Login.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/Login.tsx)

**Changes**:
- Connect form to `login()` API
- Handle loading states
- Show error messages
- Redirect to dashboard on success

---

#### Signup Page
**File**: [MODIFY] [Signup.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/Signup.tsx)

**Changes**:
- Connect form to `signup()` API
- Validate password strength
- Handle errors
- Redirect to room setup on success

---

#### Room Setup Page
**File**: [MODIFY] [RoomSetup.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/RoomSetup.tsx)

**Changes**:
- Create room: Call `createRoom()` API
- Join room: Call `joinRoom()` API with invite code
- Redirect to dashboard after success

---

#### Dashboard Page
**File**: [MODIFY] [Dashboard.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/Dashboard.tsx)

**Changes**:
- Fetch current user's room
- Fetch expenses for current month
- Calculate statistics from real data
- Use React Query for data fetching

---

#### Add Expense Page
**File**: [MODIFY] [AddExpense.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/AddExpense.tsx)

**Changes**:
- Upload bill image first (if provided)
- Create expense with form data
- Include current room ID
- Redirect to dashboard on success

---

#### Monthly Summary Page
**File**: [MODIFY] [MonthlySummary.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/MonthlySummary.tsx)

**Changes**:
- Fetch expenses for selected month
- Group by category
- Calculate totals
- Display bill images

---

#### Settlement Page
**File**: [MODIFY] [Settlement.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/Settlement.tsx)

**Changes**:
- Fetch settlements for current room
- Calculate balances from expenses
- Create settlements automatically
- Mark settlements as paid

---

#### Room Settings Page
**File**: [MODIFY] [RoomSettings.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/pages/RoomSettings.tsx)

**Changes**:
- Fetch current room data
- Display invite code
- Update room name
- Manage members (admin only)

---

### 3.4 Add Protected Routes

**File**: [MODIFY] [App.tsx](file:///c:/Users/moham/Documents/messmate-frontend/src/App.tsx)

**Changes**:
- Wrap app with AuthContext
- Create ProtectedRoute component
- Redirect to login if not authenticated
- Redirect to room setup if no room

---

## Phase 4: Testing

### 4.1 Backend Testing

**Using Payload Admin Panel**:
1. Start backend: `npm run dev`
2. Visit `http://localhost:3001/admin`
3. Create first user (admin)
4. Test creating rooms, expenses, settlements
5. Verify relationships work
6. Test file uploads

**Using Postman/Thunder Client**:
1. Test login endpoint
2. Test protected endpoints with JWT
3. Test query parameters
4. Test file upload endpoint

---

### 4.2 Frontend Testing

**Manual Testing Flow**:
1. ✅ Signup new user
2. ✅ Create a room
3. ✅ Copy invite code
4. ✅ Signup second user (different browser/incognito)
5. ✅ Join room with invite code
6. ✅ Add expense as user 1
7. ✅ Verify user 2 sees the expense
8. ✅ Upload bill image
9. ✅ View monthly summary
10. ✅ Check settlements
11. ✅ Mark settlement as paid
12. ✅ Update room settings

---

## Phase 5: Deployment

### 5.1 Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Whitelist all IPs (0.0.0.0/0) for Vercel
6. Get connection string
7. Update `.env` with Atlas URI

---

### 5.2 Deploy Backend to Vercel

**Preparation**:
1. Create `vercel.json` in backend
2. Update `package.json` scripts
3. Build locally to test: `npm run build`
4. Push to GitHub

**Deployment**:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in backend directory
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URI` (MongoDB Atlas)
   - `PAYLOAD_SECRET`
   - `CORS_ORIGINS` (frontend URL)
4. Deploy: `vercel --prod`

---

### 5.3 Deploy Frontend to Vercel

**Preparation**:
1. Update API URL in `api.ts` to use environment variable
2. Create `.env.production` with backend URL
3. Build locally to test: `npm run build`

**Deployment**:
1. Run `vercel` in frontend directory
2. Set environment variable:
   - `VITE_API_URL` (backend URL)
3. Deploy: `vercel --prod`

---

## Phase 6: Post-Deployment

### 6.1 Test Production

- [ ] Test signup/login flow
- [ ] Test room creation/joining
- [ ] Test expense creation
- [ ] Test file uploads
- [ ] Test settlements
- [ ] Test on mobile devices

---

### 6.2 Monitor & Optimize

- Set up error logging (Sentry)
- Monitor API response times
- Check MongoDB Atlas metrics
- Optimize queries if needed

---

## Verification Plan

### Backend Verification
1. Run `npm run dev` - Server starts without errors
2. Visit admin panel - Can create users and data
3. Test API endpoints - All CRUD operations work
4. Test authentication - JWT tokens work correctly
5. Test file uploads - Images upload and are accessible

### Frontend Verification
1. Run `npm run dev` - App starts without errors
2. Complete signup flow - User created in database
3. Create room - Room appears in database
4. Add expense - Expense saved with relationships
5. Upload bill - Image stored and displayed
6. View dashboard - Real data displayed correctly

### Integration Verification
1. Multi-user test - Two users in same room
2. Expense splitting - Calculations correct
3. Settlements - Generated correctly
4. Real-time updates - Data syncs across users

---

## Timeline Estimate

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Setup | 1-2 hours |
| Phase 2: Collections | 2-3 hours |
| Phase 3: Frontend Integration | 4-6 hours |
| Phase 4: Testing | 2-3 hours |
| Phase 5: Deployment | 1-2 hours |
| **Total** | **10-16 hours** |

---

## Next Steps

1. Review the [Payload CMS Guide](file:///C:/Users/moham/.gemini/antigravity/brain/6dcce844-9e08-4b38-8960-4ffeb4ba4cba/payload-cms-guide.md) for detailed explanations
2. Start with Phase 1: Project Setup
3. Test each collection as you create it
4. Integrate frontend incrementally (one page at a time)
5. Deploy early and often to catch issues

---

## Support Resources

- **Payload Docs**: https://payloadcms.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas
- **Vercel Docs**: https://vercel.com/docs
- **React Query**: https://tanstack.com/query/latest

Ready to start building? 🚀
