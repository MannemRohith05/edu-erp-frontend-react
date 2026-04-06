import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import type { DashboardStats } from '../types';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        getDashboardStats().then(setStats).catch((err) => console.error('Failed to load stats', err));
    }, []);

    const handleLogout = () => { logout(); window.location.href = '/login'; };

    return (
        <div className="dashboard-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>EduERP</h2>
                    <span className="role-badge">Admin</span>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Users
                    </Link>
                    <Link to="/admin/students" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                        Students
                    </Link>
                    <Link to="/admin/teachers" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
                        Teachers
                    </Link>
                    <Link to="/admin/courses" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                        Courses
                    </Link>
                    <Link to="/admin/schedules" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        Schedules
                    </Link>
                </nav>
                <div className="sidebar-footer-admin">
                    <button className="logout-btn-admin" onClick={handleLogout}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <h1>Dashboard Overview</h1>
                    <div className="user-info-header">
                        <span>Welcome, {user?.firstName}</span>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon users-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalUsers || 0}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon students-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalStudents || 0}</span>
                            <span className="stat-label">Students</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon teachers-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalTeachers || 0}</span>
                            <span className="stat-label">Teachers</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon courses-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalCourses || 0}</span>
                            <span className="stat-label">Courses</span>
                        </div>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="card">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <button className="action-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add Student
                            </button>
                            <button className="action-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add Teacher
                            </button>
                            <button className="action-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add Course
                            </button>
                        </div>
                    </div>
                    <div className="card">
                        <h3>System Status</h3>
                        <div className="system-status">
                            <div className="status-item"><span className="status-dot online"></span><span>Database Connected</span></div>
                            <div className="status-item"><span className="status-dot online"></span><span>API Server Running</span></div>
                            <div className="status-item"><span className="status-dot online"></span><span>Authentication Active</span></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
