import { useEffect, useState } from 'react';
import { getTeachers, getCoursesByTeacher, getSchedulesByTeacher } from '../../services/api';
import type { Teacher, Course, Schedule } from '../../types';

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterBranch, setFilterBranch] = useState('ALL');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    useEffect(() => {
        getTeachers().then(t => { setTeachers(t); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const branches = [...new Set(teachers.map(t => t.department))].sort();
    const branchCounts: Record<string, number> = {};
    teachers.forEach(t => { branchCounts[t.department] = (branchCounts[t.department] || 0) + 1; });

    const filtered = teachers.filter(t => {
        const matchSearch = `${t.firstName} ${t.lastName} ${t.email} ${t.department} ${t.specialization}`.toLowerCase().includes(search.toLowerCase());
        const matchBranch = filterBranch === 'ALL' || t.department === filterBranch;
        return matchSearch && matchBranch;
    });

    const selectTeacher = async (id: number) => {
        if (selectedId === id) { setSelectedId(null); return; }
        setSelectedId(id);
        setDetailLoading(true);
        try {
            const [c, s] = await Promise.all([
                getCoursesByTeacher(id).catch(() => []),
                getSchedulesByTeacher(id).catch(() => []),
            ]);
            setCourses(c); setSchedules(s);
        } catch {}
        setDetailLoading(false);
    };

    const selectedTeacher = teachers.find(t => t.id === selectedId);

    return (
        <div>
            <div className="admin-page-header">
                <h1>Teacher Management</h1>
                <p>View and manage all registered teachers — click to see full details</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">👨‍🏫</div>
                    <div><div className="admin-stat-value">{teachers.length}</div><div className="admin-stat-label">Total Teachers</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">📋</div>
                    <div><div className="admin-stat-value">{branches.length}</div><div className="admin-stat-label">Branches</div></div>
                </div>
                {filterBranch !== 'ALL' && (
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon amber">🏷️</div>
                        <div><div className="admin-stat-value">{branchCounts[filterBranch] || 0}</div><div className="admin-stat-label">{filterBranch} Teachers</div></div>
                    </div>
                )}
            </div>

            {/* Branch chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button onClick={() => setFilterBranch('ALL')} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: filterBranch === 'ALL' ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 'rgba(255,255,255,0.06)', color: filterBranch === 'ALL' ? '#fff' : 'rgba(255,255,255,0.5)' }}>All ({teachers.length})</button>
                {branches.map(b => (
                    <button key={b} onClick={() => setFilterBranch(b)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: filterBranch === b ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 'rgba(255,255,255,0.06)', color: filterBranch === b ? '#fff' : 'rgba(255,255,255,0.5)' }}>{b} ({branchCounts[b] || 0})</button>
                ))}
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>{filterBranch === 'ALL' ? 'All' : filterBranch} Teachers ({filtered.length})</h3>
                    <input className="admin-table-search" placeholder="Search by name, email, specialization..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {loading ? (
                    <div className="admin-loading">Loading teachers...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">No teachers found</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>#</th><th>Employee ID</th><th>Name</th><th>Email</th><th>Department</th><th>Specialization</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map((t, i) => (
                                <>
                                    <tr key={t.id} onClick={() => selectTeacher(t.id)} style={{ cursor: 'pointer', background: selectedId === t.id ? 'rgba(240,147,251,0.08)' : undefined }}>
                                        <td>{i + 1}</td>
                                        <td>{t.employeeId}</td>
                                        <td style={{ fontWeight: 500 }}>{t.firstName} {t.lastName}</td>
                                        <td>{t.email}</td>
                                        <td>{t.department}</td>
                                        <td>{t.specialization}</td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{selectedId === t.id ? '▲' : '▼'}</td>
                                    </tr>
                                    {selectedId === t.id && (
                                        <tr key={`detail-${t.id}`}>
                                            <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid rgba(240,147,251,0.2)' }}>
                                                {detailLoading ? (
                                                    <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading details...</div>
                                                ) : (
                                                    <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                                                            {[
                                                                { label: 'Courses', val: courses.length, color: '#f093fb' },
                                                                { label: 'Students', val: courses.reduce((s, c) => s + (c.enrolledCount || 0), 0), color: '#4facfe' },
                                                                { label: 'Weekly Classes', val: schedules.length, color: '#43e97b' },
                                                            ].map(c => (
                                                                <div key={c.label} style={{ background: `${c.color}12`, border: `1px solid ${c.color}33`, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 2 }}>{c.label}</div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                            {/* Profile */}
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>👤 Profile</h4>
                                                                {[
                                                                    ['Qualification', selectedTeacher?.qualification || '—'],
                                                                    ['Specialization', selectedTeacher?.specialization || '—'],
                                                                    ['Joining Date', selectedTeacher?.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString() : '—'],
                                                                ].map(([k, v]) => (
                                                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{k}</span>
                                                                        <span style={{ color: '#fff', fontSize: '0.8rem' }}>{v}</span>
                                                                    </div>
                                                                ))}
                                                                {selectedTeacher?.courseCodes && selectedTeacher.courseCodes.length > 0 && (
                                                                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                                        {selectedTeacher.courseCodes.map(c => (
                                                                            <span key={c} style={{ background: 'rgba(240,147,251,0.15)', color: '#f093fb', padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>{c}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Courses */}
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>📚 Assigned Courses</h4>
                                                                {courses.length === 0 ? (
                                                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>No courses assigned</div>
                                                                ) : courses.map(c => (
                                                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                        <span style={{ color: '#fff', fontSize: '0.8rem' }}>{c.courseCode} — {c.courseName}</span>
                                                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{c.enrolledCount || 0} students</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Schedule */}
                                                        {schedules.length > 0 && (
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)', marginTop: 16 }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>📅 Weekly Schedule</h4>
                                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                    {schedules.map(s => (
                                                                        <div key={s.id} style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem' }}>
                                                                            <div style={{ color: '#4facfe', fontWeight: 600, fontSize: '0.72rem' }}>{s.dayOfWeek.charAt(0) + s.dayOfWeek.slice(1).toLowerCase()}</div>
                                                                            <div style={{ color: '#fff', fontWeight: 500 }}>{s.courseName}</div>
                                                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{s.startTime}–{s.endTime} • {s.room}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
