import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherByUserId, getCoursesByTeacher, getAttendanceByCourse, getStudentsByCourse, markBulkAttendance } from '../../services/api';
import type { Course, Attendance } from '../../types';

type AttendanceEntry = { studentId: number; studentName: string; studentCode: string; status: 'PRESENT' | 'ABSENT' | 'LATE' };

export default function TeacherAttendance() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [records, setRecords] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);
    // Mark attendance mode
    const [markMode, setMarkMode] = useState(false);
    const [entries, setEntries] = useState<AttendanceEntry[]>([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0,10));
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user) return;
        getTeacherByUserId(user.id)
            .then(teacher => getCoursesByTeacher(teacher.id))
            .then(c => { setCourses(c); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const handleCourseSelect = async (courseId: number) => {
        setSelectedCourse(courseId);
        setMarkMode(false);
        setSuccess('');
        setRecordsLoading(true);
        try {
            const data = await getAttendanceByCourse(courseId);
            setRecords(data);
        } catch { setRecords([]); }
        setRecordsLoading(false);
    };

    const startMarkAttendance = async () => {
        if (!selectedCourse) return;
        setRecordsLoading(true);
        try {
            const studs = await getStudentsByCourse(selectedCourse);
            setEntries(studs.map(s => ({
                studentId: s.id,
                studentName: `${s.firstName} ${s.lastName}`,
                studentCode: s.studentId,
                status: 'PRESENT' as const,
            })));
            setMarkMode(true);
        } catch { setEntries([]); }
        setRecordsLoading(false);
    };

    const updateStatus = (idx: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setEntries(prev => prev.map((e, i) => i === idx ? { ...e, status } : e));
    };

    const markAllAs = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setEntries(prev => prev.map(e => ({ ...e, status })));
    };

    const submitAttendance = async () => {
        if (!selectedCourse) return;
        setSubmitting(true);
        try {
            const payload = entries.map(e => ({
                studentId: e.studentId,
                courseId: selectedCourse,
                date: attendanceDate,
                status: e.status,
                remarks: e.status === 'LATE' ? 'Late arrival' : '',
            }));
            await markBulkAttendance(payload);
            setSuccess(`Attendance marked successfully for ${entries.length} students!`);
            setMarkMode(false);
            // Reload records
            const data = await getAttendanceByCourse(selectedCourse);
            setRecords(data);
        } catch { setSuccess('Failed to submit attendance. Try again.'); }
        setSubmitting(false);
    };

    const getStatusColor = (s: string) => s === 'PRESENT' ? '#22c55e' : s === 'ABSENT' ? '#ef4444' : '#f59e0b';
    const getStatusBg = (s: string) => s === 'PRESENT' ? 'rgba(34,197,94,0.12)' : s === 'ABSENT' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';

    const btnStyle = (active: boolean, color: string) => ({
        padding: '6px 14px', borderRadius: 8, border: active ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
        background: active ? `${color}20` : 'transparent', color: active ? color : 'rgba(255,255,255,0.5)',
        cursor: 'pointer' as const, fontWeight: active ? 600 : 400, fontSize: '0.8rem', transition: 'all 0.2s',
    });

    return (
        <div>
            <div className="admin-page-header">
                <h1>Attendance Management</h1>
                <p>Mark and track student attendance for your courses</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">📚</div>
                    <div><div className="admin-stat-value">{courses.length}</div><div className="admin-stat-label">My Courses</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">✅</div>
                    <div><div className="admin-stat-value">{records.filter(r => r.status === 'PRESENT').length}</div><div className="admin-stat-label">Present</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon amber">❌</div>
                    <div><div className="admin-stat-value">{records.filter(r => r.status === 'ABSENT').length}</div><div className="admin-stat-label">Absent</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue">⏰</div>
                    <div><div className="admin-stat-value">{records.filter(r => r.status === 'LATE').length}</div><div className="admin-stat-label">Late</div></div>
                </div>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>{markMode ? '✏️ Mark Attendance' : 'Attendance Records'}</h3>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <select className="admin-table-search" value={selectedCourse ?? ''} onChange={e => e.target.value ? handleCourseSelect(Number(e.target.value)) : setSelectedCourse(null)}>
                            <option value="">Select a Course</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>)}
                        </select>
                        {selectedCourse && !markMode && (
                            <button onClick={startMarkAttendance} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                ✏️ Mark Attendance
                            </button>
                        )}
                        {markMode && (
                            <button onClick={() => setMarkMode(false)} style={{ padding: '8px 18px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 8, color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {success && (
                    <div style={{ padding: '12px 24px', background: success.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: success.includes('Failed') ? '#ef4444' : '#22c55e', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {success}
                    </div>
                )}

                {markMode ? (
                    <div style={{ padding: 24 }}>
                        {/* Date & Quick Actions */}
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Date:</label>
                                <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => markAllAs('PRESENT')} style={btnStyle(false, '#22c55e')}>All Present</button>
                                <button onClick={() => markAllAs('ABSENT')} style={btnStyle(false, '#ef4444')}>All Absent</button>
                                <button onClick={() => markAllAs('LATE')} style={btnStyle(false, '#f59e0b')}>All Late</button>
                            </div>
                        </div>

                        {entries.length === 0 ? (
                            <div className="admin-empty">No students enrolled in this course</div>
                        ) : (
                            <>
                                <table className="admin-table">
                                    <thead><tr><th>#</th><th>Student ID</th><th>Name</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {entries.map((e, i) => (
                                            <tr key={e.studentId}>
                                                <td>{i + 1}</td>
                                                <td>{e.studentCode}</td>
                                                <td style={{ fontWeight: 500 }}>{e.studentName}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button onClick={() => updateStatus(i, 'PRESENT')} style={btnStyle(e.status === 'PRESENT', '#22c55e')}>Present</button>
                                                        <button onClick={() => updateStatus(i, 'ABSENT')} style={btnStyle(e.status === 'ABSENT', '#ef4444')}>Absent</button>
                                                        <button onClick={() => updateStatus(i, 'LATE')} style={btnStyle(e.status === 'LATE', '#f59e0b')}>Late</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 12 }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 16, marginRight: 'auto' }}>
                                        <span>✅ Present: {entries.filter(e => e.status === 'PRESENT').length}</span>
                                        <span>❌ Absent: {entries.filter(e => e.status === 'ABSENT').length}</span>
                                        <span>⏰ Late: {entries.filter(e => e.status === 'LATE').length}</span>
                                    </div>
                                    <button onClick={submitAttendance} disabled={submitting}
                                        style={{ padding: '10px 28px', background: 'linear-gradient(135deg, #22c55e, #38f9d7)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontSize: '0.9rem', opacity: submitting ? 0.7 : 1 }}>
                                        {submitting ? 'Submitting...' : 'Submit Attendance'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // View mode
                    loading ? (
                        <div className="admin-loading">Loading courses...</div>
                    ) : !selectedCourse ? (
                        <div className="admin-empty">Select a course to view attendance records</div>
                    ) : recordsLoading ? (
                        <div className="admin-loading">Loading attendance...</div>
                    ) : records.length === 0 ? (
                        <div className="admin-empty">No attendance records found</div>
                    ) : (
                        <table className="admin-table">
                            <thead><tr><th>Student</th><th>Student ID</th><th>Date</th><th>Status</th><th>Remarks</th></tr></thead>
                            <tbody>
                                {records.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.studentName}</td>
                                        <td>{r.studentCode}</td>
                                        <td>{new Date(r.date).toLocaleDateString()}</td>
                                        <td><span style={{ background: getStatusBg(r.status), color: getStatusColor(r.status), padding: '4px 12px', borderRadius: 12, fontWeight: 600, fontSize: '0.75rem' }}>{r.status}</span></td>
                                        <td>{r.remarks || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}
