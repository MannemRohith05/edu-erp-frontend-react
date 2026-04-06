import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getGradesByStudent, getAverageGrade } from '../../services/api';
import type { Grade } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentResults() {
    const { user } = useAuth();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [average, setAverage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => Promise.all([getGradesByStudent(s.id), getAverageGrade(s.id).catch(() => 0)]))
            .then(([g, avg]) => { setGrades(g); setAverage(avg); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    // Group grades by course for CGPA-like view
    const courseGroups = grades.reduce<Record<string, Grade[]>>((acc, g) => {
        const key = g.courseName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(g);
        return acc;
    }, {});

    const courseAverages = Object.entries(courseGroups).map(([name, gs]) => {
        const avg = gs.reduce((s, g) => s + (g.percentage || 0), 0) / gs.length;
        return { name, avg, count: gs.length, grade: avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B+' : avg >= 60 ? 'B' : avg >= 50 ? 'C' : 'F' };
    });

    const cgpa = courseAverages.length > 0
        ? (courseAverages.reduce((s, c) => s + (c.avg >= 90 ? 10 : c.avg >= 80 ? 9 : c.avg >= 70 ? 8 : c.avg >= 60 ? 7 : c.avg >= 50 ? 6 : 0), 0) / courseAverages.length).toFixed(2)
        : '0.00';

    const gradeColor = (pct: number) => pct >= 90 ? '#22c55e' : pct >= 75 ? '#4facfe' : pct >= 60 ? '#f59e0b' : '#ef4444';

    const th = { textAlign: 'left' as const, padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
    const td = { padding: '14px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' };

    return (
        <PageContainer title="Exam Results & CGPA" subtitle="Your semester results and cumulative performance">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a855f7' }}>{cgpa}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>CGPA</div>
                </div>
                <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 14, padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4facfe' }}>{average.toFixed(1)}%</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Avg Score</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{courseAverages.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Courses</div>
                </div>
            </div>

            {/* Course-wise results */}
            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem' }}>📋 Course-wise Results</h3>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading results...</div>
            ) : courseAverages.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No exam results available</div>
            ) : (
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                            {['#','Course','Assessments','Average %','Grade','Grade Points'].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {courseAverages.map((c, i) => (
                                <tr key={c.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={td}>{i+1}</td>
                                    <td style={{...td, color: '#fff', fontWeight: 500}}>{c.name}</td>
                                    <td style={td}>{c.count}</td>
                                    <td style={td}><span style={{ color: gradeColor(c.avg), fontWeight: 600 }}>{c.avg.toFixed(1)}%</span></td>
                                    <td style={td}><span style={{ background: `${gradeColor(c.avg)}20`, color: gradeColor(c.avg), padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>{c.grade}</span></td>
                                    <td style={{...td, fontWeight: 600, color: '#fff'}}>{c.avg >= 90 ? 10 : c.avg >= 80 ? 9 : c.avg >= 70 ? 8 : c.avg >= 60 ? 7 : c.avg >= 50 ? 6 : 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageContainer>
    );
}
