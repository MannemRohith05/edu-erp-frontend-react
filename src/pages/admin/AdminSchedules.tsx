import { useEffect, useState } from 'react';
import { getSchedules } from '../../services/api';
import type { Schedule } from '../../types';

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dayFilter, setDayFilter] = useState('ALL');

    useEffect(() => {
        getSchedules().then(s => { setSchedules(s); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = schedules
        .filter(s => dayFilter === 'ALL' || s.dayOfWeek === dayFilter)
        .filter(s => `${s.courseName} ${s.courseCode} ${s.teacherName} ${s.room}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

    return (
        <div>
            <div className="admin-page-header">
                <h1>Schedule Management</h1>
                <p>View and manage class schedules</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon amber">📅</div>
                    <div><div className="admin-stat-value">{schedules.length}</div><div className="admin-stat-label">Total Classes</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">🏠</div>
                    <div><div className="admin-stat-value">{new Set(schedules.map(s => s.room)).size}</div><div className="admin-stat-label">Rooms Used</div></div>
                </div>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>Class Schedule ({filtered.length})</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select
                            value={dayFilter}
                            onChange={e => setDayFilter(e.target.value)}
                            className="admin-table-search"
                            style={{ minWidth: 140 }}
                        >
                            <option value="ALL">All Days</option>
                            {dayOrder.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
                        </select>
                        <input className="admin-table-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                {loading ? (
                    <div className="admin-loading">Loading schedules...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">No schedule entries found</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Code</th><th>Teacher</th><th>Room</th></tr></thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.dayOfWeek.charAt(0) + s.dayOfWeek.slice(1).toLowerCase()}</strong></td>
                                    <td>{s.startTime} – {s.endTime}</td>
                                    <td>{s.courseName}</td>
                                    <td>{s.courseCode}</td>
                                    <td>{s.teacherName || '—'}</td>
                                    <td>{s.room}{s.building ? `, ${s.building}` : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
