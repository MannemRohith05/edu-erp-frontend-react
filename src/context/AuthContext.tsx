import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import axios from 'axios';
import type {
    User,
    AuthResponse,
    LoginOtpResponse,
    LoginRequest,
    RegisterRequest,
    VerifyOtpRequest,
} from '../types';

// Connect to the deployed Render backend.
const API_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api'
).replace(/\/+$/, '');

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<LoginOtpResponse>;
    verifyOtp: (data: VerifyOtpRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<LoginOtpResponse>;
    verifyRegistration: (data: VerifyOtpRequest) => Promise<AuthResponse>;
    logout: () => void;
    getToken: () => string | null;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore the stored session on application startup.
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const handleAuthSuccess = (response: AuthResponse) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));

        setUser(response.user);
        setIsAuthenticated(true);
    };

    const login = async (credentials: LoginRequest) => {
        const response = await axios.post<LoginOtpResponse>(
            `${API_URL}/auth/login`,
            credentials,
        );

        return response.data;
    };

    const verifyOtp = async (data: VerifyOtpRequest) => {
        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/verify-otp`,
            data,
        );

        handleAuthSuccess(response.data);
    };

    const register = async (data: RegisterRequest) => {
        const response = await axios.post<LoginOtpResponse>(
            `${API_URL}/auth/register`,
            data,
        );

        return response.data;
    };

    const verifyRegistration = async (data: VerifyOtpRequest) => {
        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/verify-registration`,
            data,
        );

        handleAuthSuccess(response.data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        setUser(null);
        setIsAuthenticated(false);
    };

    const getToken = () => localStorage.getItem('accessToken');

    const hasRole = (role: string) => user?.role === role;

    const hasAnyRole = (roles: string[]) =>
        user ? roles.includes(user.role) : false;

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                verifyOtp,
                register,
                verifyRegistration,
                logout,
                getToken,
                hasRole,
                hasAnyRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
