import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import './StudentLayout.css';

export default function StudentLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const userId = user?.email || '';
    const userName = user ? `${user.firstName} ${user.lastName}` : '';
    const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery) {
            // Navigate to first matching route
            setSearchQuery('');
        }
    };

    return (
        <div className="student-layout">
            <Sidebar
                userId={userId}
                isCollapsed={sidebarCollapsed}
                searchQuery={searchQuery}
                onLogout={handleLogout}
                onToggle={setSidebarCollapsed}
            />
            <main className="student-main">
                <header className="student-topbar">
                    <div className="student-search">
                        <span aria-hidden="true">🔍</span>
                        <input
                            aria-label="Search student menu"
                            type="text"
                            placeholder="Search menu... (Enter to go)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                        {searchQuery && (
                            <button className="student-search-clear" aria-label="Clear menu search" onClick={() => setSearchQuery('')}>×</button>
                        )}
                    </div>
                    <div className="student-user">
                        <span>Welcome, {userName}</span>
                        <span className="student-avatar">{userInitials}</span>
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
