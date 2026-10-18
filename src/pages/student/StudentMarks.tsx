
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getStudentByUserId,
    getMyGrades,
    getAverageGrade
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

export default function StudentMarks() {
    const { user } = useAuth();

    const [grades, setGrades] = useState<Grade[]>([]);
    const [average, setAverage] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [filterCourse, setFilterCourse] = useState('ALL');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadMarks = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const student = await getStudentByUserId(user.id);

                const [gradeResult, averageResult] = await Promise.all([
                    getMyGrades(),
                    getAverageGrade(student.id).catch(() => 0)
                ]);

                if (cancelled) return;

                const safeGrades = Array.isArray(gradeResult)
                    ? gradeResult
                    : [];

                setGrades(safeGrades);

                // APIs may return a number, numeric string, or an object
                // containing the average value.
                let averageValue: unknown = averageResult;

                if (
                    averageValue !== null &&
                    typeof averageValue === 'object'
                ) {
                    const result = averageValue as Record<string, unknown>;

                    averageValue =
                        result.average ??
                        result.averageGrade ??
                        result.averagePercentage ??
                        result.value ??
                        result.result ??
                        0;
                }

                setAverage(toNumber(averageValue));
            } catch {
                if (!cancelled) {
                    setError('Unable to load marks. Please refresh and try again.');
                    setGrades([]);
                    setAverage(0);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadMarks();

        return () => {
            cancelled = true;
        };
    }, [user]);

    const courses = [
        ...new Set(grades.map(g => g.courseName).filter(Boolean))
    ];

    const filtered =
        filterCourse === 'ALL'
            ? grades
            : grades.filter(g => g.courseName === filterCourse);

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return '#22c55e';
        if (percentage >= 75) return '#4facfe';
        if (percentage >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <PageContainer
            title="Internal Marks"
            subtitle="View your marks and grades across all courses"
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
                        background: 'rgba(79,172,254,0.08)',
                        border: '1px solid rgba(79,172,254,0.2)',
                        borderRadius: 14,
                        padding: '20px 16px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4facfe' }}>
                        {grades.length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                        Total Assessments
                    </div>
                </div>

                <div
                    style={{
                        background: 'rgba(168,85,247,0.08)',
                        border: '1px solid rgba(168,85,247,0.2)',
                        borderRadius: 14,
                        padding: '20px 16px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>
                        {average.toFixed(1)}%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                        Average Score
                    </div>
                </div>

                <div
                    style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 14,
                        padding: '20px 16px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>
                        {courses.length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                        Courses Graded
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: 'wrap'
                }}
            >
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                    📊 Marks Details ({filtered.length})
                </h3>

                <select
                    value={filterCourse}
                    onChange={e => setFilterCourse(e.target.value)}
                    style={{
                        padding: '8px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: '0.85rem'
                    }}
                >
                    <option value="ALL">All Courses</option>
                    {courses.map(course => (
                        <option key={course} value={course}>
                            {course}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div
                    style={{
                        padding: 48,
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.4)'
                    }}
                >
                    Loading marks...
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
            ) : filtered.length === 0 ? (
                <div
                    style={{
                        padding: 48,
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.3)'
                    }}
                >
                    No marks/grades available
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
                                    'Assessment',
                                    'Marks',
                                    'Percentage',
                                    'Grade',
                                    'Feedback'
                                ].map(heading => (
                                    <th
                                        key={heading}
                                        style={{
                                            textAlign: 'left',
                                            padding: '12px 20px',
                                            color: 'rgba(255,255,255,0.5)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((grade, index) => {
                                const percentage = toNumber(grade.percentage);
                                const color = getGradeColor(percentage);

                                return (
                                    <tr
                                        key={grade.id}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)'
                                        }}
                                    >
                                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                                            {index + 1}
                                        </td>

                                        <td style={{ padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {grade.courseName}
                                        </td>

                                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                                            {grade.assignmentName}
                                        </td>

                                        <td style={{ padding: '14px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
                                            {grade.marks}/{grade.totalMarks}
                                        </td>

                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ color, fontWeight: 600, fontSize: '0.875rem' }}>
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </td>

                                        <td style={{ padding: '14px 20px' }}>
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
                                                {grade.letterGrade || grade.gradeType || '—'}
                                            </span>
                                        </td>

                                        <td
                                            style={{
                                                padding: '14px 20px',
                                                color: 'rgba(255,255,255,0.5)',
                                                fontSize: '0.8rem',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {grade.feedback || '—'}
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
