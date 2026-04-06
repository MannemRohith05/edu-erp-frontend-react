import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getCoursesByStudent } from '../../services/api';
import type { Course } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentCourses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => getCoursesByStudent(s.id))
            .then(data => { setCourses(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const filtered = courses.filter(c =>
        `${c.courseName} ${c.courseCode} ${c.department} ${c.teacherName}`.toLowerCase().includes(search.toLowerCase())
    );

    const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

    return (
        <PageContainer title="My Courses" subtitle="Courses you are currently enrolled in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4facfe' }}>{courses.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Enrolled Courses</div>
                </div>
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>{totalCredits}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Total Credits</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{new Set(courses.map(c => c.department)).size}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Departments</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>📚 Course List ({filtered.length})</h3>
                <input
                    placeholder="Search courses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', minWidth: 220 }}
                />
            </div>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading courses...</div>
            ) : filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    {search ? 'No courses match your search' : 'No courses enrolled yet'}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {filtered.map(c => (
                        <div key={c.id} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 14, padding: 20, transition: 'all 0.3s', cursor: 'default'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ color: '#4facfe', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>{c.courseCode}</div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{c.courseName}</div>
                                </div>
                                <span style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 600 }}>
                                    {c.credits} Credits
                                </span>
                            </div>
                            {c.description && (
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 12, lineHeight: 1.5 }}>
                                    {c.description.length > 100 ? c.description.substring(0, 100) + '...' : c.description}
                                </div>
                            )}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 14 }}>👨‍🏫</span>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{c.teacherName || 'Not assigned'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 14 }}>📂</span>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{c.department}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
