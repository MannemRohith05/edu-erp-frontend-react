
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getStudentByUserId,
    getMyGrades,
    getAverageGrade,
    getMyAcademicSummary
} from '../../services/api';
import type { Grade } from '../../types';
import PageContainer from '../../components/PageContainer';

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function getAverageValue(value: unknown): number {
    if (value !== null && typeof value === 'object') {
        const result = value as Record<string, unknown>;

        return toNumber(
            result.average ??
            result.averageGrade ??
            result.averagePercentage ??
            result.value ??
            result.result,
            0
        );
    }

    return toNumber(value);
}

export default function StudentResults() {
    const { user } = useAuth();

    const [grades, setGrades] = useState<Grade[]>([]);
    const [average, setAverage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [academicSummary, setAcademicSummary] = useState<{ cgpa: number; sgpaBySemester: Record<string, number>; eligibleCredits: number } | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadResults = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const [gradeResult, averageResult, summary] = await Promise.all([
                    getMyGrades(),
                    getStudentByUserId(user.id).then(student => getAverageGrade(student.id)).catch(() => 0),
                    getMyAcademicSummary().catch(() => null)
                ]);

                if (cancelled) return;

                setGrades(Array.isArray(gradeResult) ? gradeResult : []);
                setAverage(getAverageValue(averageResult));
                setAcademicSummary(summary);
            } catch {
                if (!cancelled) {
                    setGrades([]);
                    setAverage(0);
                    setError('Unable to load exam results. Please refresh and try again.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadResults();

        return () => {
            cancelled = true;
        };
    }, [user]);

    // Group grades by course.
    const courseGroups = grades.reduce<Record<string, Grade[]>>((acc, grade) => {
        const key = grade.courseName || 'Unassigned Course';

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(grade);
        return acc;
    }, {});

    const courseAverages = Object.entries(courseGroups).map(([name, courseGrades]) => {
        const total = courseGrades.reduce(
            (sum, grade) => sum + toNumber(grade.percentage),
            0
        );

        const avg = courseGrades.length > 0 ? total / courseGrades.length : 0;

        const letterGrade =
            avg >= 90 ? 'A+' :
            avg >= 80 ? 'A' :
            avg >= 70 ? 'B+' :
            avg >= 60 ? 'B' :
            avg >= 50 ? 'C' : 'F';

        const gradePoints =
            avg >= 90 ? 10 :
            avg >= 80 ? 9 :
            avg >= 70 ? 8 :
            avg >= 60 ? 7 :
            avg >= 50 ? 6 : 0;

        return {
            name,
            avg,
            count: courseGrades.length,
            grade: letterGrade,
            gradePoints
        };
    });

    const cgpa = academicSummary ? Number(academicSummary.cgpa).toFixed(2) : '0.00';

    const gradeColor = (percentage: number) => {
        if (percentage >= 90) return '#22c55e';
        if (percentage >= 75) return '#4facfe';
        if (percentage >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const th = {
        textAlign: 'left' as const,
        padding: '12px 20px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    };

    const td = {
        padding: '14px 20px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.875rem'
    };

    return (
        <PageContainer
            title="Exam Results & CGPA"
            subtitle="Your semester results and cumulative performance"
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 16,
                    marginBottom: 28
                }}
            >
                <div
                    style={{
                        background: 'rgba(168,85,247,0.08)',
                        border: '1px solid rgba(168,85,247,0.2)',
                        borderRadius: 14,
                        padding: '24px 16px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a855f7' }}>
                        {cgpa}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                        CGPA
                    </div>
                </div>

                <div
                    style={{
                        background: 'rgba(79,172,254,0.08)',
                        border: '1px solid rgba(79,172,254,0.2)',
                        borderRadius: 14,
                        padding: '24px 16px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4facfe' }}>
                        {average.toFixed(1)}%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                        Avg Score
                    </div>
                </div>

                <div
                    style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 14,
                        padding: '24px 16px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>
                        {courseAverages.length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                        Courses
                    </div>
                </div>
            </div>

            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem' }}>
                📋 Course-wise Results
            </h3>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    Loading results...
                </div>
            ) : error ? (
                <div
                    role="alert"
                    style={{
                        padding: 24,
                        textAlign: 'center',
                        color: '#f87171',
                        background: 'rgba(239,68,68,0.08)',
                        borderRadius: 12
                    }}
                >
                    {error}
                </div>
            ) : courseAverages.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    No exam results available
                </div>
            ) : (
                <div
                    style={{
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        overflowX: 'auto'
                    }}
                >
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                                {[
                                    '#',
                                    'Course',
                                    'Assessments',
                                    'Average %',
                                    'Grade',
                                    'Grade Points'
                                ].map(heading => (
                                    <th key={heading} style={th}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {courseAverages.map((course, index) => {
                                const color = gradeColor(course.avg);

                                return (
                                    <tr
                                        key={course.name}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)'
                                        }}
                                    >
                                        <td style={td}>{index + 1}</td>

                                        <td style={{ ...td, color: '#fff', fontWeight: 500 }}>
                                            {course.name}
                                        </td>

                                        <td style={td}>{course.count}</td>

                                        <td style={td}>
                                            <span style={{ color, fontWeight: 600 }}>
                                                {course.avg.toFixed(1)}%
                                            </span>
                                        </td>

                                        <td style={td}>
                                            <span
                                                style={{
                                                    background: `${color}20`,
                                                    color,
                                                    padding: '4px 10px',
                                                    borderRadius: 8,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {course.grade}
                                            </span>
                                        </td>

                                        <td style={{ ...td, fontWeight: 600, color: '#fff' }}>
                                            {course.gradePoints}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </PageContainer>
    );
}
