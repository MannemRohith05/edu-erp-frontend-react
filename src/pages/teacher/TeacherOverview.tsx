import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTeacherByUserId, getCoursesByTeacher } from '../../services/api';
import type { Course } from '../../types';

export default function TeacherOverview() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState('');

    useEffect(() => {
        if (!user) return;
        getTeacherByUserId(user.id)
            .then(teacher => {
                setDepartment(teacher.department);
                return getCoursesByTeacher(teacher.id);
            })
            .then(c => { setCourses(c); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

    return (
        <div>
            <div className="admin-page-header">
                <h1>Teacher Dashboard</h1>
                <p>Welcome back, {user?.firstName}! Here's your overview.</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon pink">📚</div>
                    <div><div className="admin-stat-value">{courses.length}</div><div className="admin-stat-label">My Courses</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">🎓</div>
                    <div><div className="admin-stat-value">{totalStudents}</div><div className="admin-stat-label">Total Students</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">📋</div>
                    <div><div className="admin-stat-value">{department || '—'}</div><div className="admin-stat-label">Department</div></div>
                </div>
            </div>

            <div className="admin-quick-grid">
                <div className="admin-action-card">
                    <h3>Quick Actions</h3>
                    <div className="admin-action-list">
                        <Link to="/teacher/courses" className="admin-action-item">📚 View My Courses</Link>
                        <Link to="/teacher/attendance" className="admin-action-item">📋 Mark Attendance</Link>
                        <Link to="/teacher/certifications" className="admin-action-item">🏆 Certifications & Achievements</Link>
                    </div>
                </div>
                <div className="admin-action-card">
                    <h3>Recent Courses</h3>
                    {loading ? (
                        <div className="admin-loading">Loading...</div>
                    ) : courses.length === 0 ? (
                        <div className="admin-empty">No courses assigned</div>
                    ) : (
                        <div className="admin-action-list">
                            {courses.slice(0, 4).map(c => (
                                <div key={c.id} className="admin-action-item" style={{ cursor: 'default' }}>
                                    <span>{c.courseCode}</span> — <span>{c.courseName}</span>
                                    <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{c.enrolledCount || 0} students</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
