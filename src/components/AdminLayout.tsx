import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin' },
    { label: 'Users', icon: '👥', path: '/admin/users' },
    { label: 'Students', icon: '🎓', path: '/admin/students' },
    { label: 'Teachers', icon: '👨‍🏫', path: '/admin/teachers' },
    { label: 'Courses', icon: '📚', path: '/admin/courses' },
    { label: 'Schedules', icon: '📅', path: '/admin/schedules' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar-layout ${collapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        <span className="admin-logo-icon">🎓</span>
                        {!collapsed && <span className="admin-logo-text">EduERP</span>}
                    </div>
                    <button className="admin-toggle" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? '→' : '←'}
                    </button>
                </div>
                {!collapsed && (
                    <div className="admin-user-badge">
                        <span className="admin-badge">Administrator</span>
                    </div>
                )}
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            {!collapsed && <span className="admin-nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>
                <div className="admin-sidebar-bottom">
                    {!collapsed && (
                        <div className="admin-user-info">
                            <div className="admin-avatar">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                            <div className="admin-user-detail">
                                <span className="admin-user-name">{user?.firstName} {user?.lastName}</span>
                                <span className="admin-user-email">{user?.email}</span>
                            </div>
                        </div>
                    )}
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <span>🚪</span>
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
