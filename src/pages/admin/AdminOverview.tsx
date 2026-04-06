import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getUsers, getStudents, getTeachers } from '../../services/api';
import type { DashboardStats, User, Student, Teacher } from '../../types';

export default function AdminOverview() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{students: Student[], teachers: Teacher[]}>({ students: [], teachers: [] });
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        Promise.all([
            getDashboardStats().catch(() => null),
            getUsers().catch(() => []),
        ]).then(([s, u]) => {
            setStats(s);
            setRecentUsers((u as User[]).slice(-5).reverse());
            setLoading(false);
        });
    }, []);

    const handleSearch = async () => {
        if (!search.trim()) { setSearchResults({ students: [], teachers: [] }); return; }
        setSearching(true);
        try {
            const [studs, teachers] = await Promise.all([
                getStudents().catch(() => []),
                getTeachers().catch(() => []),
            ]);
            const q = search.toLowerCase();
            setSearchResults({
                students: studs.filter((s: Student) => `${s.firstName} ${s.lastName} ${s.email} ${s.studentId} ${s.department}`.toLowerCase().includes(q)),
                teachers: teachers.filter((t: Teacher) => `${t.firstName} ${t.lastName} ${t.email} ${t.employeeId} ${t.department}`.toLowerCase().includes(q)),
            });
        } catch { setSearchResults({ students: [], teachers: [] }); }
        setSearching(false);
    };

    const getRoleClass = (role: string) => role === 'ADMIN' || role === 'ADMINISTRATOR' ? 'admin' : role === 'TEACHER' ? 'teacher' : 'student';

    return (
        <div>
            <div className="admin-page-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, {user?.firstName}! Here's what's happening.</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue">👥</div>
                    <div><div className="admin-stat-value">{loading ? '...' : stats?.totalUsers || 0}</div><div className="admin-stat-label">Total Users</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">🎓</div>
                    <div><div className="admin-stat-value">{loading ? '...' : stats?.totalStudents || 0}</div><div className="admin-stat-label">Students</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">👨‍🏫</div>
                    <div><div className="admin-stat-value">{loading ? '...' : stats?.totalTeachers || 0}</div><div className="admin-stat-label">Teachers</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">📚</div>
                    <div><div className="admin-stat-value">{loading ? '...' : stats?.totalCourses || 0}</div><div className="admin-stat-label">Courses</div></div>
                </div>
            </div>

            {/* Global Search */}
            <div className="admin-table-card" style={{ marginBottom: 28 }}>
                <div className="admin-table-header">
                    <h3>🔍 Search Students & Teachers</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            className="admin-table-search"
                            placeholder="Search by name, ID, email, department..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            Search
                        </button>
                    </div>
                </div>

                {searching && <div className="admin-loading">Searching...</div>}

                {(searchResults.students.length > 0 || searchResults.teachers.length > 0) && (
                    <div style={{ padding: 24 }}>
                        {searchResults.students.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ color: '#4facfe', margin: '0 0 12px', fontSize: '0.9rem' }}>🎓 Students ({searchResults.students.length})</h4>
                                <table className="admin-table">
                                    <thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Department</th><th>Semester</th></tr></thead>
                                    <tbody>
                                        {searchResults.students.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.studentId}</td>
                                                <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                                                <td>{s.email}</td>
                                                <td>{s.department}</td>
                                                <td>{s.semester}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {searchResults.teachers.length > 0 && (
                            <div>
                                <h4 style={{ color: '#f093fb', margin: '0 0 12px', fontSize: '0.9rem' }}>👨‍🏫 Teachers ({searchResults.teachers.length})</h4>
                                <table className="admin-table">
                                    <thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Department</th><th>Specialization</th></tr></thead>
                                    <tbody>
                                        {searchResults.teachers.map(t => (
                                            <tr key={t.id}>
                                                <td>{t.employeeId}</td>
                                                <td style={{ fontWeight: 500 }}>{t.firstName} {t.lastName}</td>
                                                <td>{t.email}</td>
                                                <td>{t.department}</td>
                                                <td>{t.specialization}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {search && !searching && searchResults.students.length === 0 && searchResults.teachers.length === 0 && (
                    <div className="admin-empty">No results found for "{search}"</div>
                )}
            </div>

            <div className="admin-quick-grid">
                <div className="admin-action-card">
                    <h3>Quick Actions</h3>
                    <div className="admin-action-list">
                        <Link to="/admin/students" className="admin-action-item">🎓 Manage Students</Link>
                        <Link to="/admin/teachers" className="admin-action-item">👨‍🏫 Manage Teachers</Link>
                        <Link to="/admin/courses" className="admin-action-item">📚 Manage Courses</Link>
                        <Link to="/admin/schedules" className="admin-action-item">📅 Manage Schedules</Link>
                    </div>
                </div>
                <div className="admin-action-card">
                    <h3>Recent Registrations</h3>
                    {recentUsers.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: 12 }}>No recent users</div>
                    ) : (
                        <div className="admin-action-list">
                            {recentUsers.map(u => (
                                <div key={u.id} className="admin-action-item" style={{ cursor: 'default', justifyContent: 'space-between' }}>
                                    <span>{u.firstName} {u.lastName}</span>
                                    <span className={`role-tag ${getRoleClass(u.role)}`}>{u.role}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
