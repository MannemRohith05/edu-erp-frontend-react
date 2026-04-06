import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getCoursesByDepartment, getCoursesByStudent, enrollStudent } from '../../services/api';
import type { Course } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentCourseRegistration() {
    const { user } = useAuth();
    const [department, setDepartment] = useState('');
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
    const [studentId, setStudentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState<number | null>(null);
    const [success, setSuccess] = useState('');
    const [filterSem, setFilterSem] = useState('ALL');

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => {
                setDepartment(s.department);
                setStudentId(s.id);
                return Promise.all([
                    getCoursesByDepartment(s.department).catch(() => []),
                    getCoursesByStudent(s.id).catch(() => []),
                ]);
            })
            .then(([avail, enrolled]) => {
                setAvailableCourses(avail);
                setEnrolledIds(new Set(enrolled.map((c: Course) => c.id)));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    const handleEnroll = async (courseId: number) => {
        if (!studentId) return;
        setEnrolling(courseId);
        try {
            await enrollStudent(courseId, studentId);
            setEnrolledIds(prev => new Set([...prev, courseId]));
            setSuccess('Successfully registered for course!');
            setTimeout(() => setSuccess(''), 3000);
        } catch { setSuccess('Registration failed. Contact administrator.'); }
        setEnrolling(null);
    };

    const semesters = [...new Set(availableCourses.map(c => c.semester))].sort();
    const filtered = filterSem === 'ALL' ? availableCourses : availableCourses.filter(c => c.semester === Number(filterSem));
    const enrolledCourses = filtered.filter(c => enrolledIds.has(c.id));
    const unenrolledCourses = filtered.filter(c => !enrolledIds.has(c.id));

    return (
        <PageContainer title="Regular Course Registration" subtitle={`Available courses for ${department || 'your branch'}`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4facfe' }}>{availableCourses.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Available Courses</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{enrolledIds.size}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Enrolled</div>
                </div>
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>{department}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Your Branch</div>
                </div>
            </div>

            {success && (
                <div style={{ padding: '12px 20px', background: success.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: success.includes('failed') ? '#ef4444' : '#22c55e', borderRadius: 10, marginBottom: 16, fontSize: '0.85rem' }}>
                    {success}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>📚 {department} Courses</h3>
                <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
                    style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}>
                    <option value="ALL">All Semesters</option>
                    {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading courses for your branch...</div>
            ) : availableCourses.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No courses available for {department}</div>
            ) : (
                <>
                    {/* Already Enrolled */}
                    {enrolledCourses.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ color: '#22c55e', margin: '0 0 12px', fontSize: '0.9rem' }}>✅ Enrolled Courses ({enrolledCourses.length})</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                                {enrolledCourses.map(c => (
                                    <div key={c.id} style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <span style={{ color: '#22c55e', fontSize: '0.72rem', fontWeight: 600 }}>{c.courseCode}</span>
                                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{c.courseName}</div>
                                            </div>
                                            <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '3px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600 }}>Enrolled</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                            <span>👨‍🏫 {c.teacherName || 'TBD'}</span>
                                            <span>📊 {c.credits} Credits</span>
                                            <span>📅 Sem {c.semester}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Available (Not Enrolled) */}
                    {unenrolledCourses.length > 0 && (
                        <div>
                            <h4 style={{ color: '#4facfe', margin: '0 0 12px', fontSize: '0.9rem' }}>📋 Available Courses ({unenrolledCourses.length})</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                                {unenrolledCourses.map(c => (
                                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <span style={{ color: '#4facfe', fontSize: '0.72rem', fontWeight: 600 }}>{c.courseCode}</span>
                                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{c.courseName}</div>
                                            </div>
                                            <span style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '3px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600 }}>{c.credits} Cr</span>
                                        </div>
                                        {c.description && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 10, lineHeight: 1.4 }}>{c.description.substring(0, 100)}{c.description.length > 100 ? '...' : ''}</div>}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: 14, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                                <span>👨‍🏫 {c.teacherName || 'TBD'}</span>
                                                <span>📅 Sem {c.semester}</span>
                                            </div>
                                            <button onClick={() => handleEnroll(c.id)} disabled={enrolling === c.id}
                                                style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: enrolling === c.id ? 'wait' : 'pointer', fontSize: '0.75rem', opacity: enrolling === c.id ? 0.6 : 1 }}>
                                                {enrolling === c.id ? 'Enrolling...' : 'Register'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}
