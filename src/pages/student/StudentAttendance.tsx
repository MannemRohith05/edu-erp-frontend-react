import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getAttendanceByStudent } from '../../services/api';
import type { Attendance } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentAttendance() {
    const { user } = useAuth();
    const [records, setRecords] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCourse, setFilterCourse] = useState('ALL');

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => getAttendanceByStudent(s.id))
            .then(data => { setRecords(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const courses = [...new Set(records.map(r => r.courseName))];
    const filtered = filterCourse === 'ALL' ? records : records.filter(r => r.courseName === filterCourse);
    
    const totalPresent = filtered.filter(r => r.status === 'PRESENT').length;
    const totalAbsent = filtered.filter(r => r.status === 'ABSENT').length;
    const totalLate = filtered.filter(r => r.status === 'LATE').length;
    const percentage = filtered.length > 0 ? Math.round(((totalPresent + totalLate) / filtered.length) * 100) : 0;

    const getStatusColor = (status: string) => {
        if (status === 'PRESENT') return '#22c55e';
        if (status === 'ABSENT') return '#ef4444';
        return '#f59e0b';
    };

    const getStatusBg = (status: string) => {
        if (status === 'PRESENT') return 'rgba(34,197,94,0.12)';
        if (status === 'ABSENT') return 'rgba(239,68,68,0.12)';
        return 'rgba(245,158,11,0.12)';
    };

    // Compute per-course stats
    const courseStats = courses.map(course => {
        const courseRecords = records.filter(r => r.courseName === course);
        const present = courseRecords.filter(r => r.status === 'PRESENT').length;
        const late = courseRecords.filter(r => r.status === 'LATE').length;
        const pct = courseRecords.length > 0 ? Math.round(((present + late) / courseRecords.length) * 100) : 0;
        return { course, total: courseRecords.length, present, late, absent: courseRecords.filter(r => r.status === 'ABSENT').length, pct };
    });

    return (
        <PageContainer title="Attendance Register" subtitle="View your attendance records across all courses">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4facfe' }}>{percentage}%</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Overall Attendance</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{totalPresent}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Present</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>{totalAbsent}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Absent</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>{totalLate}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Late</div>
                </div>
            </div>

            {/* Per-course summary */}
            {courseStats.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <h3 style={{ color: '#fff', margin: '0 0 12px', fontSize: '1rem' }}>📊 Course-wise Attendance</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                        {courseStats.map(cs => (
                            <div key={cs.course} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>{cs.course}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{cs.total} classes</span>
                                    <span style={{ color: cs.pct >= 75 ? '#22c55e' : cs.pct >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>{cs.pct}%</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${cs.pct}%`, background: cs.pct >= 75 ? '#22c55e' : cs.pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 6, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>📋 Attendance Records ({filtered.length})</h3>
                <select
                    value={filterCourse}
                    onChange={e => setFilterCourse(e.target.value)}
                    style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                >
                    <option value="ALL">All Courses</option>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading attendance...</div>
            ) : filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No attendance records found</div>
            ) : (
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course</th>
                                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{i + 1}</td>
                                    <td style={{ padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 500 }}>{r.courseName}</td>
                                    <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{new Date(r.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{ background: getStatusBg(r.status), color: getStatusColor(r.status), padding: '4px 12px', borderRadius: 12, fontWeight: 600, fontSize: '0.75rem' }}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{r.remarks || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageContainer>
    );
}
