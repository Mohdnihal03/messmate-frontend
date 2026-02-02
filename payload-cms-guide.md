# MessBro Payload CMS Backend Guide

> A comprehensive guide to building a backend for MessBro using Payload CMS

## Table of Contents
1. [What is Payload CMS?](#what-is-payload-cms)
2. [Why Payload CMS for MessBro?](#why-payload-cms-for-MessBro)
3. [Understanding the MessBro Data Model](#understanding-the-MessBro-data-model)
4. [Setting Up Payload CMS](#setting-up-payload-cms)
5. [Creating Collections](#creating-collections)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Uploads](#file-uploads)
8. [API Endpoints](#api-endpoints)
9. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
10. [Deployment to Vercel](#deployment-to-vercel)

---

## What is Payload CMS?

**Payload CMS** is a modern, headless Content Management System built with:
- **TypeScript** - Type-safe development
- **Node.js & Express** - Fast, scalable backend
- **MongoDB** - Flexible NoSQL database
- **Auto-generated REST & GraphQL APIs** - No need to write API routes manually
- **Built-in Authentication** - User management out of the box
- **Admin Panel** - Beautiful UI for managing data
- **File Uploads** - Built-in support for images and files

### Key Concepts

#### Collections
Collections are like database tables. Each collection represents a type of data (e.g., Users, Expenses, Rooms).

```typescript
// Example: A simple collection
{
  slug: 'expenses',
  fields: [
    { name: 'amount', type: 'number', required: true },
    { name: 'description', type: 'text' }
  ]
}
```

#### Fields
Fields define the structure of your data. Payload supports many field types:
- `text`, `textarea`, `number`, `date`
- `relationship` (for linking collections)
- `upload` (for files/images)
- `select`, `checkbox`, `array`

#### Hooks
Hooks let you run custom logic before/after operations (create, update, delete).

#### Access Control
Define who can read/write data based on user roles and conditions.

---

## Why Payload CMS for MessBro?

✅ **Easy Vercel Deployment** - Payload works seamlessly with Vercel  
✅ **Auto-generated APIs** - No need to write CRUD endpoints manually  
✅ **Built-in Authentication** - User login/signup already handled  
✅ **File Uploads** - Perfect for bill image uploads  
✅ **TypeScript** - Type safety for your backend  
✅ **Admin Panel** - Manage data without writing admin UI  
✅ **Flexible** - Easy to customize for MessBro's needs  

---

## Understanding the MessBro Data Model

Based on your frontend, here's what we need:

### Core Entities

#### 1. **Users**
- Name, Email, Password
- Avatar (optional)
- Rooms they belong to

#### 2. **Rooms**
- Room name
- Invite code (unique)
- Admin (user who created it)
- Members (array of users)
- Created date

#### 3. **Expenses**
- Amount
- Description/Notes
- Date
- Paid by (user)
- Members present (array of users)
- Bill image (optional)
- Room (relationship)
- Category (Groceries, Dining, Utilities, Others)

#### 4. **Settlements**
- From user
- To user
- Amount
- Status (pending/completed)
- Date settled
- Room (relationship)

### Data Relationships

```mermaid
erDiagram
    User ||--o{ Room : "belongs to"
    User ||--o{ Expense : "creates"
    User ||--o{ Settlement : "participates in"
    Room ||--o{ Expense : "contains"
    Room ||--o{ Settlement : "contains"
    Expense }o--|| User : "paid by"
    Expense }o--o{ User : "split among"
    Settlement ||--|| User : "from"
    Settlement ||--|| User : "to"
```

---

## Setting Up Payload CMS

### Step 1: Create a New Payload Project

```bash
# Navigate to your projects directory
cd c:\Users\moham\Documents

# Create a new Payload project
npx create-payload-app@latest MessBro-backend

# Follow the prompts:
# - Template: blank
# - Database: MongoDB
# - Package manager: npm
```

### Step 2: Project Structure

After creation, you'll have:

```
MessBro-backend/
├── src/
│   ├── collections/        # Your data models
│   ├── payload.config.ts   # Main configuration
│   └── server.ts           # Express server
├── .env                    # Environment variables
├── package.json
└── tsconfig.json
```

### Step 3: Configure Environment Variables

Edit `.env`:

```env
# Database
DATABASE_URI=mongodb://localhost:27017/MessBro
# Or use MongoDB Atlas for cloud database
# DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/MessBro

# Payload
PAYLOAD_SECRET=your-secret-key-here-make-it-long-and-random

# Server
PORT=3001

# CORS (allow your frontend)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Creating Collections

### Collection 1: Users

Create `src/collections/Users.ts`:

```typescript
import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Enable authentication
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'text',
      required: false,
      // This will store the avatar letter (R, A, P, S)
    },
    {
      name: 'rooms',
      type: 'relationship',
      relationTo: 'rooms',
      hasMany: true,
    },
  ],
};

export default Users;
```

### Collection 2: Rooms

Create `src/collections/Rooms.ts`:

```typescript
import { CollectionConfig } from 'payload/types';

const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Room Name',
    },
    {
      name: 'inviteCode',
      type: 'text',
      required: true,
      unique: true,
      label: 'Invite Code',
      admin: {
        description: 'Unique code for inviting members',
      },
    },
    {
      name: 'admin',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Room Admin',
    },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      label: 'Members',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-generate invite code on creation
        if (operation === 'create' && !data.inviteCode) {
          data.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        }
        return data;
      },
    ],
  },
};

export default Rooms;
```

### Collection 3: Expenses

Create `src/collections/Expenses.ts`:

```typescript
import { CollectionConfig } from 'payload/types';

const Expenses: CollectionConfig = {
  slug: 'expenses',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['description', 'amount', 'paidBy', 'date'],
  },
  fields: [
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      label: 'Amount (₹)',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description/Notes',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: 'Expense Date',
    },
    {
      name: 'paidBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Paid By',
    },
    {
      name: 'membersPresent',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      label: 'Members Present',
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
      label: 'Room',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Groceries', value: 'groceries' },
        { label: 'Dining', value: 'dining' },
        { label: 'Utilities', value: 'utilities' },
        { label: 'Others', value: 'others' },
      ],
      defaultValue: 'others',
    },
    {
      name: 'billImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Bill Image',
    },
  ],
};

export default Expenses;
```

### Collection 4: Settlements

Create `src/collections/Settlements.ts`:

```typescript
import { CollectionConfig } from 'payload/types';

const Settlements: CollectionConfig = {
  slug: 'settlements',
  admin: {
    defaultColumns: ['from', 'to', 'amount', 'status', 'dateSettled'],
  },
  fields: [
    {
      name: 'from',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'From User',
    },
    {
      name: 'to',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'To User',
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      label: 'Amount (₹)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'dateSettled',
      type: 'date',
      required: false,
      label: 'Date Settled',
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
      label: 'Room',
    },
  ],
};

export default Settlements;
```

### Collection 5: Media (for file uploads)

Create `src/collections/Media.ts`:

```typescript
import { CollectionConfig } from 'payload/types';

const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
};

export default Media;
```

---

## Authentication & Authorization

### Configure Payload Config

Edit `src/payload.config.ts`:

```typescript
import { buildConfig } from 'payload/config';
import path from 'path';

// Import collections
import Users from './collections/Users';
import Rooms from './collections/Rooms';
import Expenses from './collections/Expenses';
import Settlements from './collections/Settlements';
import Media from './collections/Media';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: Users.slug,
  },
  collections: [
    Users,
    Rooms,
    Expenses,
    Settlements,
    Media,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  csrf: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
});
```

### Access Control Example

Add access control to Expenses:

```typescript
// In Expenses.ts
access: {
  read: ({ req: { user } }) => {
    // Users can only read expenses from their rooms
    if (!user) return false;
    
    return {
      room: {
        members: {
          contains: user.id,
        },
      },
    };
  },
  create: ({ req: { user } }) => !!user,
  update: ({ req: { user } }) => !!user,
  delete: ({ req: { user } }) => !!user,
},
```

---

## File Uploads

File uploads are already configured in the Media collection! Here's how they work:

1. **Upload endpoint**: `POST /api/media`
2. **Files are stored** in the `media/` directory
3. **Accessible via**: `http://localhost:3001/media/filename.jpg`

### Frontend Upload Example

```typescript
const uploadBillImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:3001/api/media', {
    method: 'POST',
    headers: {
      'Authorization': `JWT ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  return data.doc.id; // Use this ID in expense creation
};
```

---

## API Endpoints

Payload auto-generates REST APIs for all collections:

### Users
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `POST /api/users` - Create user (signup)
- `GET /api/users/me` - Get current user
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms` - List rooms
- `GET /api/rooms/:id` - Get room by ID
- `PATCH /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses (with filters)
- `GET /api/expenses/:id` - Get expense by ID
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Settlements
- `POST /api/settlements` - Create settlement
- `GET /api/settlements` - List settlements
- `GET /api/settlements/:id` - Get settlement by ID
- `PATCH /api/settlements/:id` - Update settlement (e.g., mark as paid)

### Query Parameters

```
GET /api/expenses?where[room][equals]=ROOM_ID
GET /api/expenses?where[date][greater_than_equal]=2026-01-01
GET /api/expenses?limit=10&page=1
GET /api/expenses?sort=-date (descending)
```

---

## Connecting Frontend to Backend

### Step 1: Create API Service

Create `src/services/api.ts` in your frontend:

```typescript
const API_URL = 'http://localhost:3001/api';

// Store token in localStorage
let authToken: string | null = localStorage.getItem('token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `JWT ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Auth APIs
export const login = async (email: string, password: string) => {
  const data = await fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  return data;
};

export const signup = async (name: string, email: string, password: string) => {
  const data = await fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuthToken(data.token);
  return data;
};

export const getCurrentUser = async () => {
  return fetchAPI('/users/me');
};

// Room APIs
export const createRoom = async (name: string) => {
  return fetchAPI('/rooms', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const joinRoom = async (inviteCode: string) => {
  // First find the room by invite code
  const rooms = await fetchAPI(`/rooms?where[inviteCode][equals]=${inviteCode}`);
  if (rooms.docs.length === 0) {
    throw new Error('Invalid invite code');
  }
  
  const room = rooms.docs[0];
  const user = await getCurrentUser();
  
  // Add user to room members
  return fetchAPI(`/rooms/${room.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      members: [...room.members.map((m: any) => m.id), user.user.id],
    }),
  });
};

export const getRoomsByUser = async () => {
  const user = await getCurrentUser();
  return fetchAPI(`/rooms?where[members][contains]=${user.user.id}`);
};

// Expense APIs
export const createExpense = async (expense: {
  amount: number;
  description: string;
  date: string;
  paidBy: string;
  membersPresent: string[];
  room: string;
  category: string;
  billImage?: string;
}) => {
  return fetchAPI('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });
};

export const getExpensesByRoom = async (roomId: string, month?: string) => {
  let query = `/expenses?where[room][equals]=${roomId}&sort=-date`;
  
  if (month) {
    const startDate = new Date(month);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    query += `&where[date][greater_than_equal]=${startDate.toISOString()}`;
    query += `&where[date][less_than]=${endDate.toISOString()}`;
  }
  
  return fetchAPI(query);
};

// Settlement APIs
export const createSettlement = async (settlement: {
  from: string;
  to: string;
  amount: number;
  room: string;
}) => {
  return fetchAPI('/settlements', {
    method: 'POST',
    body: JSON.stringify(settlement),
  });
};

export const markSettlementAsPaid = async (settlementId: string) => {
  return fetchAPI(`/settlements/${settlementId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'completed',
      dateSettled: new Date().toISOString(),
    }),
  });
};

export const getSettlementsByRoom = async (roomId: string) => {
  return fetchAPI(`/settlements?where[room][equals]=${roomId}`);
};
```

### Step 2: Update Login Page

Update `src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/api';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component
}
```

### Step 3: Use React Query for Data Fetching

Update `src/pages/Dashboard.tsx`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getExpensesByRoom, getRoomsByUser } from '@/services/api';

export default function Dashboard() {
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRoomsByUser,
    enabled: !!userData,
  });

  const currentRoom = roomsData?.docs[0];

  const { data: expensesData } = useQuery({
    queryKey: ['expenses', currentRoom?.id],
    queryFn: () => getExpensesByRoom(currentRoom.id),
    enabled: !!currentRoom,
  });

  // ... rest of the component
}
```

---

## Deployment to Vercel

### Step 1: Prepare for Deployment

1. **Use MongoDB Atlas** (free cloud database):
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string
   - Update `.env`: `DATABASE_URI=mongodb+srv://...`

2. **Update `package.json`**:

```json
{
  "scripts": {
    "dev": "cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts nodemon",
    "build": "cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts payload build",
    "start": "cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts node dist/server.js"
  }
}
```

### Step 2: Create `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URI
# - PAYLOAD_SECRET
# - CORS_ORIGINS (your frontend URL)
```

### Step 4: Update Frontend API URL

In production, update `src/services/api.ts`:

```typescript
const API_URL = import.meta.env.PROD 
  ? 'https://your-backend.vercel.app/api'
  : 'http://localhost:3001/api';
```

---

## Next Steps

1. ✅ Set up Payload CMS project
2. ✅ Create all collections (Users, Rooms, Expenses, Settlements, Media)
3. ✅ Test APIs using Payload admin panel or Postman
4. ✅ Create frontend API service
5. ✅ Connect frontend pages to backend
6. ✅ Test authentication flow
7. ✅ Test expense creation and listing
8. ✅ Deploy to Vercel
9. ✅ Update frontend to use production API

---

## Useful Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload CMS Examples](https://github.com/payloadcms/payload/tree/main/examples)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vercel Documentation](https://vercel.com/docs)

---

## Common Issues & Solutions

### Issue: CORS errors
**Solution**: Add your frontend URL to `CORS_ORIGINS` in `.env`

### Issue: Authentication not working
**Solution**: Check that JWT token is being sent in `Authorization` header

### Issue: File uploads failing
**Solution**: Ensure `media/` directory exists and has write permissions

### Issue: Vercel deployment fails
**Solution**: Run `npm run build` locally first to check for TypeScript errors

---

**Ready to build?** Start with Step 1: Setting Up Payload CMS! 🚀
