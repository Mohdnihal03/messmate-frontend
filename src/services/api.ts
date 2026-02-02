// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Store token in localStorage
let authToken: string | null = localStorage.getItem('token')

export const setAuthToken = (token: string | null) => {
    authToken = token
    if (token) {
        localStorage.setItem('token', token)
    } else {
        localStorage.removeItem('token')
    }
}

export const getAuthToken = () => authToken

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (authToken) {
        headers['Authorization'] = `JWT ${authToken}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || data.message || 'API request failed')
    }

    return data
}

// ============================================
// Authentication APIs
// ============================================

export const login = async (email: string, password: string) => {
    const data = await fetchAPI('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
    setAuthToken(data.token)
    return data
}

export const signup = async (name: string, email: string, password: string) => {
    const data = await fetchAPI('/users', {
        method: 'POST',
        body: JSON.stringify({
            name,
            email,
            password,
            avatar: name.charAt(0).toUpperCase(),
        }),
    })
    if (data.token) {
        setAuthToken(data.token)
    }
    return data
}

export const logout = () => {
    setAuthToken(null)
}

export const getCurrentUser = async () => {
    const data = await fetchAPI('/users/me')
    return data
}

// ============================================
// Room APIs
// ============================================

export const createRoom = async (name: string, userId: string) => {
    const data = await fetchAPI('/rooms', {
        method: 'POST',
        body: JSON.stringify({
            name,
            admin: userId,
            members: [userId],
        }),
    })
    return data
}

export const joinRoom = async (inviteCode: string, userId: string) => {
    // First find the room by invite code
    const rooms = await fetchAPI(`/rooms?where[inviteCode][equals]=${inviteCode}`)

    if (!rooms.docs || rooms.docs.length === 0) {
        throw new Error('Invalid invite code')
    }

    const room = rooms.docs[0]

    // Check if user is already a member
    const memberIds = room.members.map((m: any) => typeof m === 'string' ? m : m.id)
    if (memberIds.includes(userId)) {
        return room
    }

    // Add user to room members
    const updatedRoom = await fetchAPI(`/rooms/${room.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            members: [...memberIds, userId],
        }),
    })

    return updatedRoom
}

export const getRoomsByUser = async (userId: string) => {
    const data = await fetchAPI(`/rooms?where[members][contains]=${userId}&depth=1`)
    return data
}

export const updateRoom = async (roomId: string, updates: { name?: string; members?: string[]; admin?: string }) => {
    const data = await fetchAPI(`/rooms/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    })
    return data
}

// ============================================
// Expense APIs
// ============================================

export const createExpense = async (expense: {
    amount: number
    description: string
    date: string
    paidBy: string
    membersPresent: string[]
    room: string
    category: string
    billImage?: string
}) => {
    const data = await fetchAPI('/expenses', {
        method: 'POST',
        body: JSON.stringify(expense),
    })
    return data
}

export const getExpensesByRoom = async (roomId: string, month?: string) => {
    let query = `/expenses?where[room][equals]=${roomId}&sort=-date&depth=1`

    if (month) {
        const startDate = new Date(month)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)

        query += `&where[date][greater_than_equal]=${startDate.toISOString()}`
        query += `&where[date][less_than]=${endDate.toISOString()}`
    }

    const data = await fetchAPI(query)
    return data
}

export const updateExpense = async (expenseId: string, updates: any) => {
    const data = await fetchAPI(`/expenses/${expenseId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    })
    return data
}

export const deleteExpense = async (expenseId: string) => {
    const data = await fetchAPI(`/expenses/${expenseId}`, {
        method: 'DELETE',
    })
    return data
}

// ============================================
// Settlement APIs
// ============================================

export const createSettlement = async (settlement: {
    from: string
    to: string
    amount: number
    room: string
    status?: 'pending' | 'completed'
}) => {
    const data = await fetchAPI('/settlements', {
        method: 'POST',
        body: JSON.stringify(settlement),
    })
    return data
}

export const getSettlementsByRoom = async (roomId: string) => {
    const data = await fetchAPI(`/settlements?where[room][equals]=${roomId}&depth=1`)
    return data
}

export const markSettlementAsPaid = async (settlementId: string) => {
    const data = await fetchAPI(`/settlements/${settlementId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: 'completed',
            dateSettled: new Date().toISOString(),
        }),
    })
    return data
}

// ============================================
// Media/File Upload APIs
// ============================================

export const uploadBillImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    if (authToken) {
        headers['Authorization'] = `JWT ${authToken}`
    }

    const response = await fetch(`${API_URL.replace('/api', '')}/api/media`, {
        method: 'POST',
        headers,
        body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'File upload failed')
    }

    return data.doc
}
