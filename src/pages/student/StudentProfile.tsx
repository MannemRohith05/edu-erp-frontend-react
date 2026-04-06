import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId } from '../../services/api';
import type { Student } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentProfile() {
    const { user } = useAuth();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => { setStudent(s); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const infoRow = (label: string, value: string | number | undefined) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{label}</span>
            <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 500, textAlign: 'right' }}>{value || '—'}</span>
        </div>
    );

    if (loading) {
        return (
            <PageContainer title="My Profile">
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading profile...</div>
            </PageContainer>
        );
    }

    if (!student) {
        return (
            <PageContainer title="My Profile">
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
                    <p>Profile information not available. Please contact the administrator.</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="My Profile" subtitle="Your personal and academic information">
            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, padding: 24, background: 'rgba(79,172,254,0.05)', border: '1px solid rgba(79,172,254,0.15)', borderRadius: 16 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
                }}>
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                </div>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                        {student.firstName} {student.lastName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 8 }}>
                        {student.email}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ background: 'rgba(79,172,254,0.15)', color: '#4facfe', padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>
                            {student.studentId}
                        </span>
                        <span style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>
                            Semester {student.semester}
                        </span>
                        <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>
                            {student.department}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Personal Information */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem' }}>👤 Personal Information</h3>
                    {infoRow('Full Name', student.fullName || `${student.firstName} ${student.lastName}`)}
                    {infoRow('Email', student.email)}
                    {infoRow('Date of Birth', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—')}
                    {infoRow('Parent Contact', student.parentContact)}
                    {infoRow('Address', student.address)}
                </div>

                {/* Academic Information */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem' }}>🎓 Academic Information</h3>
                    {infoRow('Student ID', student.studentId)}
                    {infoRow('Department', student.department)}
                    {infoRow('Semester', student.semester)}
                    {infoRow('Enrollment Date', student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '—')}
                    {infoRow('Enrolled Courses', student.courseCodes?.length || 0)}
                </div>
            </div>

            {/* Course Codes */}
            {student.courseCodes && student.courseCodes.length > 0 && (
                <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24 }}>
                    <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem' }}>📚 Enrolled Course Codes</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {student.courseCodes.map(code => (
                            <span key={code} style={{ background: 'rgba(102,126,234,0.15)', color: '#667eea', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                                {code}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
