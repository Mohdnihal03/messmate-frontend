import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser, login as apiLogin, signup as apiSignup, logout as apiLogout, getAuthToken } from '@/services/api'

interface User {
    id: string
    email: string
    name: string
    avatar?: string
    rooms?: any[]
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        const token = getAuthToken()
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const data = await getCurrentUser()
            setUser(data.user)
        } catch (error) {
            console.error('Failed to fetch user:', error)
            apiLogout()
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const login = async (email: string, password: string) => {
        const data = await apiLogin(email, password)
        setUser(data.user)
    }

    const signup = async (name: string, email: string, password: string) => {
        const data = await apiSignup(name, email, password)
        setUser(data.user || data.doc)
    }

    const logout = () => {
        apiLogout()
        setUser(null)
    }

    const refetchUser = async () => {
        await fetchUser()
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
                isAuthenticated: !!user,
                refetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
