import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects unauthenticated users to login
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
    }

    return <>{children}</>;
}

// Checks role access
export function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
    const { isAuthenticated, hasAnyRole, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !hasAnyRole(roles)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Redirects authenticated users to their dashboard
export function LoginRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) return null;

    if (isAuthenticated && user) {
        const dashboardRoutes: Record<string, string> = {
            ADMIN: '/admin',
            TEACHER: '/teacher',
            STUDENT: '/student',
            ADMINISTRATOR: '/administrator',
        };
        return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
    }

    return <>{children}</>;
}
