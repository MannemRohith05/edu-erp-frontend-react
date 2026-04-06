import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function StudentLayout() {
    const { user, logout } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const userId = user?.email || '';
    const userName = user ? `${user.firstName} ${user.lastName}` : '';
    const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '';

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery) {
            // Navigate to first matching route
            setSearchQuery('');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f1a' }}>
            <Sidebar
                userId={userId}
                isCollapsed={sidebarCollapsed}
                searchQuery={searchQuery}
                onLogout={handleLogout}
                onToggle={setSidebarCollapsed}
            />
            <main style={{ flex: 1, transition: 'margin-left 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 32px',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        padding: '10px 16px',
                        minWidth: 300,
                    }}>
                        <span style={{ fontSize: 14 }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search menu... (Enter to go)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.875rem',
                                width: '100%',
                                outline: 'none',
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.6)',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >×</button>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>Welcome, {userName}</span>
                        <span style={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}>{userInitials}</span>
                    </div>
                </div>
                <Outlet />
            </main>
        </div>
    );
}
