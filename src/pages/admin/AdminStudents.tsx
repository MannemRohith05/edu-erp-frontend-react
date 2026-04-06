import { useEffect, useState } from 'react';
import { getStudents, getCoursesByStudent, getAttendanceByStudent, getGradesByStudent } from '../../services/api';
import type { Student, Course, Attendance, Grade } from '../../types';

export default function AdminStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterBranch, setFilterBranch] = useState('ALL');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        getStudents().then(s => { setStudents(s); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const branches = [...new Set(students.map(s => s.department))].sort();
    const branchCounts: Record<string, number> = {};
    students.forEach(s => { branchCounts[s.department] = (branchCounts[s.department] || 0) + 1; });

    const filtered = students.filter(s => {
        const matchSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.studentId} ${s.department}`.toLowerCase().includes(search.toLowerCase());
        const matchBranch = filterBranch === 'ALL' || s.department === filterBranch;
        return matchSearch && matchBranch;
    });

    const selectStudent = async (id: number) => {
        if (selectedId === id) { setSelectedId(null); return; }
        setSelectedId(id);
        setDetailLoading(true);
        try {
            const [c, a, g] = await Promise.all([
                getCoursesByStudent(id).catch(() => []),
                getAttendanceByStudent(id).catch(() => []),
                getGradesByStudent(id).catch(() => []),
            ]);
            setCourses(c); setAttendance(a); setGrades(g);
        } catch {}
        setDetailLoading(false);
    };

    const getStatusColor = (s: string) => s === 'PRESENT' ? '#22c55e' : s === 'ABSENT' ? '#ef4444' : '#f59e0b';

    const attPct = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length / attendance.length) * 100)
        : 0;

    const avgGrade = grades.length > 0
        ? (grades.reduce((s, g) => s + (g.percentage || 0), 0) / grades.length).toFixed(1)
        : '0';

    const selectedStudent = students.find(s => s.id === selectedId);

    return (
        <div>
            <div className="admin-page-header">
                <h1>Student Management</h1>
                <p>View and manage all registered students — click a student to see full details</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">🎓</div>
                    <div><div className="admin-stat-value">{students.length}</div><div className="admin-stat-label">Total Students</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">📋</div>
                    <div><div className="admin-stat-value">{branches.length}</div><div className="admin-stat-label">Branches</div></div>
                </div>
                {filterBranch !== 'ALL' && (
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon amber">🏷️</div>
                        <div><div className="admin-stat-value">{branchCounts[filterBranch] || 0}</div><div className="admin-stat-label">{filterBranch} Students</div></div>
                    </div>
                )}
            </div>

            {/* Branch chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button onClick={() => setFilterBranch('ALL')} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: filterBranch === 'ALL' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)', color: filterBranch === 'ALL' ? '#fff' : 'rgba(255,255,255,0.5)' }}>All ({students.length})</button>
                {branches.map(b => (
                    <button key={b} onClick={() => setFilterBranch(b)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: filterBranch === b ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)', color: filterBranch === b ? '#fff' : 'rgba(255,255,255,0.5)' }}>{b} ({branchCounts[b] || 0})</button>
                ))}
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>{filterBranch === 'ALL' ? 'All' : filterBranch} Students ({filtered.length})</h3>
                    <input className="admin-table-search" placeholder="Search by name, ID, email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {loading ? (
                    <div className="admin-loading">Loading students...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">No students found</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>#</th><th>Student ID</th><th>Name</th><th>Email</th><th>Department</th><th>Semester</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <>
                                    <tr key={s.id} onClick={() => selectStudent(s.id)} style={{ cursor: 'pointer', background: selectedId === s.id ? 'rgba(102,126,234,0.08)' : undefined }}>
                                        <td>{i + 1}</td>
                                        <td>{s.studentId}</td>
                                        <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                                        <td>{s.email}</td>
                                        <td>{s.department}</td>
                                        <td>{s.semester}</td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{selectedId === s.id ? '▲' : '▼'}</td>
                                    </tr>
                                    {selectedId === s.id && (
                                        <tr key={`detail-${s.id}`}>
                                            <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid rgba(102,126,234,0.2)' }}>
                                                {detailLoading ? (
                                                    <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading details...</div>
                                                ) : (
                                                    <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                                                        {/* Stats row */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                                                            {[
                                                                { label: 'Courses', val: courses.length, color: '#4facfe' },
                                                                { label: 'Attendance', val: `${attPct}%`, color: attPct >= 75 ? '#22c55e' : '#ef4444' },
                                                                { label: 'Avg Marks', val: `${avgGrade}%`, color: '#a855f7' },
                                                                { label: 'Assessments', val: grades.length, color: '#f59e0b' },
                                                            ].map(c => (
                                                                <div key={c.label} style={{ background: `${c.color}12`, border: `1px solid ${c.color}33`, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: 2 }}>{c.label}</div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Profile */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>👤 Profile</h4>
                                                                {[
                                                                    ['DOB', selectedStudent?.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : '—'],
                                                                    ['Parent Contact', selectedStudent?.parentContact || '—'],
                                                                    ['Address', selectedStudent?.address || '—'],
                                                                    ['Enrollment', selectedStudent?.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString() : '—'],
                                                                ].map(([k, v]) => (
                                                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{k}</span>
                                                                        <span style={{ color: '#fff', fontSize: '0.8rem' }}>{v}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>📚 Enrolled Courses</h4>
                                                                {courses.length === 0 ? (
                                                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>No courses</div>
                                                                ) : courses.map(c => (
                                                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                        <span style={{ color: '#fff', fontSize: '0.8rem' }}>{c.courseCode} — {c.courseName}</span>
                                                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{c.credits} cr</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Recent Grades */}
                                                        {grades.length > 0 && (
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>📊 Recent Marks (last 5)</h4>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <thead><tr>{['Course','Assessment','Marks','%','Grade'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                                                                    <tbody>
                                                                        {grades.slice(0,5).map(g => (
                                                                            <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                                                <td style={{ padding: '8px 10px', color: '#fff', fontSize: '0.8rem' }}>{g.courseName}</td>
                                                                                <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{g.assignmentName}</td>
                                                                                <td style={{ padding: '8px 10px', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>{g.marks}/{g.totalMarks}</td>
                                                                                <td style={{ padding: '8px 10px', color: g.percentage >= 75 ? '#22c55e' : g.percentage >= 50 ? '#f59e0b' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>{g.percentage?.toFixed(1)}%</td>
                                                                                <td style={{ padding: '8px 10px' }}><span style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>{g.letterGrade || '—'}</span></td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}

                                                        {/* Recent Attendance */}
                                                        {attendance.length > 0 && (
                                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '0.85rem' }}>📋 Recent Attendance (last 5)</h4>
                                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                    {attendance.slice(0,5).map(a => (
                                                                        <div key={a.id} style={{ background: `${getStatusColor(a.status)}12`, border: `1px solid ${getStatusColor(a.status)}33`, borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem' }}>
                                                                            <div style={{ color: '#fff', fontWeight: 500 }}>{a.courseName}</div>
                                                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{new Date(a.date).toLocaleDateString()}</div>
                                                                            <span style={{ color: getStatusColor(a.status), fontWeight: 600, fontSize: '0.75rem' }}>{a.status}</span>
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
