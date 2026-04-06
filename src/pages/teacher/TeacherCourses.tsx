import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherByUserId, getCoursesByTeacher, getStudentsByCourse } from '../../services/api';
import type { Course, Student } from '../../types';

export default function TeacherCourses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        getTeacherByUserId(user.id)
            .then(teacher => getCoursesByTeacher(teacher.id))
            .then(c => { setCourses(c); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const filtered = courses.filter(c =>
        `${c.courseName} ${c.courseCode} ${c.department}`.toLowerCase().includes(search.toLowerCase())
    );

    const toggleCourse = async (courseId: number) => {
        if (expandedCourse === courseId) { setExpandedCourse(null); return; }
        setExpandedCourse(courseId);
        setStudentsLoading(true);
        try {
            const studs = await getStudentsByCourse(courseId);
            setStudents(studs);
        } catch { setStudents([]); }
        setStudentsLoading(false);
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1>My Courses</h1>
                <p>View your assigned courses — click a course to see enrolled students</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">📚</div>
                    <div><div className="admin-stat-value">{courses.length}</div><div className="admin-stat-label">My Courses</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">🎓</div>
                    <div><div className="admin-stat-value">{courses.reduce((s, c) => s + (c.enrolledCount || 0), 0)}</div><div className="admin-stat-label">Total Students</div></div>
                </div>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>My Courses ({filtered.length})</h3>
                    <input className="admin-table-search" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {loading ? (
                    <div className="admin-loading">Loading courses...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">No courses assigned to you</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>Code</th><th>Course Name</th><th>Credits</th><th>Department</th><th>Semester</th><th>Students</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <>
                                    <tr key={c.id} onClick={() => toggleCourse(c.id)} style={{ cursor: 'pointer', background: expandedCourse === c.id ? 'rgba(240,147,251,0.08)' : undefined }}>
                                        <td><strong>{c.courseCode}</strong></td>
                                        <td>{c.courseName}</td>
                                        <td>{c.credits}</td>
                                        <td>{c.department}</td>
                                        <td>{c.semester}</td>
                                        <td>{c.enrolledCount || 0}</td>
                                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{expandedCourse === c.id ? '▲' : '▼'}</td>
                                    </tr>
                                    {expandedCourse === c.id && (
                                        <tr key={`students-${c.id}`}>
                                            <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid rgba(240,147,251,0.2)' }}>
                                                {studentsLoading ? (
                                                    <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading students...</div>
                                                ) : students.length === 0 ? (
                                                    <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No students enrolled</div>
                                                ) : (
                                                    <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)' }}>
                                                        <h4 style={{ color: '#f093fb', margin: '0 0 12px', fontSize: '0.85rem' }}>📋 Enrolled Students ({students.length})</h4>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                                                            {students.map((s, i) => (
                                                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', minWidth: 24 }}>{i + 1}</span>
                                                                    <div>
                                                                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{s.firstName} {s.lastName}</div>
                                                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{s.studentId} • Sem {s.semester}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
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
