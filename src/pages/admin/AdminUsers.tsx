import { useEffect, useState } from 'react';
import { getUsers } from '../../services/api';
import type { User } from '../../types';

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getUsers().then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleClass = (role: string) => {
        if (role === 'ADMIN' || role === 'ADMINISTRATOR') return 'admin';
        if (role === 'TEACHER') return 'teacher';
        return 'student';
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1>User Management</h1>
                <p>View and manage all registered users</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue">👥</div>
                    <div><div className="admin-stat-value">{users.length}</div><div className="admin-stat-label">Total Users</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">🎓</div>
                    <div><div className="admin-stat-value">{users.filter(u => u.role === 'STUDENT').length}</div><div className="admin-stat-label">Students</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">👨‍🏫</div>
                    <div><div className="admin-stat-value">{users.filter(u => u.role === 'TEACHER').length}</div><div className="admin-stat-label">Teachers</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon amber">🔑</div>
                    <div><div className="admin-stat-value">{users.filter(u => u.role === 'ADMIN' || u.role === 'ADMINISTRATOR').length}</div><div className="admin-stat-label">Admins</div></div>
                </div>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>All Users ({filtered.length})</h3>
                    <input className="admin-table-search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {loading ? (
                    <div className="admin-loading">Loading users...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">No users found</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                        <tbody>
                            {filtered.map((u, i) => (
                                <tr key={u.id}>
                                    <td>{i + 1}</td>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`role-tag ${getRoleClass(u.role)}`}>{u.role}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
