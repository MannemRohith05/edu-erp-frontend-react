import {} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Course } from '../types';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const courses: Course[] = [];

    const handleLogout = () => { logout(); window.location.href = '/login'; };

    return (
        <div className="teacher-dashboard">
            <aside className="teacher-sidebar">
                <h2>EduERP</h2>
                <span className="teacher-badge">Teacher</span>
                <nav>
                    <Link to="/teacher" className="active">Dashboard</Link>
                    <Link to="/teacher/courses">My Courses</Link>
                    <Link to="/teacher/attendance">Attendance</Link>
                    <Link to="/teacher/grades">Grades</Link>
                </nav>
                <button onClick={handleLogout}>Logout</button>
            </aside>
            <main>
                <h1>Welcome, {user?.firstName}!</h1>
                <div className="teacher-stats">
                    <div className="teacher-card"><span>{courses.length}</span>Courses</div>
                </div>
                <section>
                    <h2>My Courses</h2>
                    {courses.length > 0 ? (
                        courses.map((c) => (
                            <div key={c.id} className="course-item">{c.courseName} ({c.courseCode})</div>
                        ))
                    ) : (
                        <p className="empty-text">No courses assigned yet</p>
                    )}
                </section>
            </main>
        </div>
    );
}
