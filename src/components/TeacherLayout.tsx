import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/teacher' },
    { label: 'My Courses', icon: '📚', path: '/teacher/courses' },
    { label: 'Attendance', icon: '📋', path: '/teacher/attendance' },
    { label: 'My Timetable', icon: '📅', path: '/teacher/timetable' },
    { label: 'Certifications', icon: '🏆', path: '/teacher/certifications' },
];

export default function TeacherLayout() {
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
                        <span className="admin-badge" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>Teacher</span>
                    </div>
                )}
                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/teacher'}
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
                            <div className="admin-avatar" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
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
