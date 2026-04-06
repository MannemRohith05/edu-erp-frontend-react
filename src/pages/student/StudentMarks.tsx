import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getGradesByStudent, getAverageGrade } from '../../services/api';
import type { Grade } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentMarks() {
    const { user } = useAuth();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [average, setAverage] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [filterCourse, setFilterCourse] = useState('ALL');

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => Promise.all([getGradesByStudent(s.id), getAverageGrade(s.id).catch(() => 0)]))
            .then(([g, avg]) => { setGrades(g); setAverage(avg); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const courses = [...new Set(grades.map(g => g.courseName))];
    const filtered = filterCourse === 'ALL' ? grades : grades.filter(g => g.courseName === filterCourse);

    const getGradeColor = (pct: number) => {
        if (pct >= 90) return '#22c55e';
        if (pct >= 75) return '#4facfe';
        if (pct >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <PageContainer title="Internal Marks" subtitle="View your marks and grades across all courses">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4facfe' }}>{grades.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Total Assessments</div>
                </div>
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>{average.toFixed(1)}%</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Average Score</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{courses.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Courses Graded</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>📊 Marks Details ({filtered.length})</h3>
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
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading marks...</div>
            ) : filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No marks/grades available</div>
            ) : (
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                {['#', 'Course', 'Assessment', 'Marks', 'Percentage', 'Grade', 'Feedback'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((g, i) => (
                                <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{i + 1}</td>
                                    <td style={{ padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 500 }}>{g.courseName}</td>
                                    <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{g.assignmentName}</td>
                                    <td style={{ padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>{g.marks}/{g.totalMarks}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{ color: getGradeColor(g.percentage), fontWeight: 600, fontSize: '0.875rem' }}>{g.percentage?.toFixed(1)}%</span>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{
                                            background: `${getGradeColor(g.percentage)}20`,
                                            color: getGradeColor(g.percentage),
                                            padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600
                                        }}>
                                            {g.letterGrade || g.gradeType || '—'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {g.feedback || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageContainer>
    );
}
