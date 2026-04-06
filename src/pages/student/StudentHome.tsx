import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getCoursesByStudent, getAttendanceByStudent, getAverageGrade } from '../../services/api';
import type { Course, Attendance } from '../../types';
import PageContainer from '../../components/PageContainer';
import './StudentHome.css';

export default function StudentHome() {
    const { user } = useAuth();
    const userName = user ? user.firstName : 'Student';
    const [coursesCount, setCoursesCount] = useState(0);
    const [attendancePct, setAttendancePct] = useState(0);
    const [avgGrade, setAvgGrade] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        getStudentByUserId(user.id)
            .then(s => {
                return Promise.all([
                    getCoursesByStudent(s.id).catch(() => []),
                    getAttendanceByStudent(s.id).catch(() => []),
                    getAverageGrade(s.id).catch(() => 0),
                ]);
            })
            .then(([courses, attendance, avg]) => {
                setCoursesCount((courses as Course[]).length);
                const att = attendance as Attendance[];
                const present = att.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
                setAttendancePct(att.length > 0 ? Math.round((present / att.length) * 100) : 0);
                setAvgGrade(avg as number);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    const cgpa = avgGrade > 0 ? (avgGrade / 10).toFixed(1) : '0.0';

    return (
        <PageContainer title="Dashboard" subtitle={`Welcome back, ${userName}!`}>
            <div className="dashboard-grid">
                <div className="stat-card cyan">
                    <div className="stat-icon-emoji">📚</div>
                    <div className="stat-info-home">
                        <span className="stat-value-home">{loading ? '...' : coursesCount}</span>
                        <span className="stat-label-home">Enrolled Courses</span>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon-emoji">✅</div>
                    <div className="stat-info-home">
                        <span className="stat-value-home">{loading ? '...' : `${attendancePct}%`}</span>
                        <span className="stat-label-home">Attendance</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon-emoji">📊</div>
                    <div className="stat-info-home">
                        <span className="stat-value-home">{loading ? '...' : cgpa}</span>
                        <span className="stat-label-home">Current CGPA</span>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon-emoji">💰</div>
                    <div className="stat-info-home">
                        <span className="stat-value-home">₹0</span>
                        <span className="stat-label-home">Pending Dues</span>
                    </div>
                </div>
            </div>

            <div className="quick-links">
                <h3>Quick Access</h3>
                <div className="links-grid">
                    <a className="quick-link" href="/student/courses/assignments"><span className="link-icon">📝</span><span>Assignments</span></a>
                    <a className="quick-link" href="/student/exam/results"><span className="link-icon">📋</span><span>Results</span></a>
                    <a className="quick-link" href="/student/fees/payments"><span className="link-icon">💳</span><span>Fee Payment</span></a>
                    <a className="quick-link" href="/student/timetable"><span className="link-icon">📅</span><span>Timetable</span></a>
                    <a className="quick-link" href="/student/attendance"><span className="link-icon">✅</span><span>Attendance</span></a>
                    <a className="quick-link" href="/student/profile/view"><span className="link-icon">👤</span><span>Profile</span></a>
                </div>
            </div>

            <div className="info-cards">
                <div className="info-card">
                    <h4>📢 Announcements</h4>
                    <div className="announcement-list">
                        <div className="announcement-item">
                            <span className="date">Jan 10</span>
                            <span className="text">End semester exams schedule released</span>
                        </div>
                        <div className="announcement-item">
                            <span className="date">Jan 08</span>
                            <span className="text">Fee payment deadline extended to Jan 15</span>
                        </div>
                        <div className="announcement-item">
                            <span className="date">Jan 05</span>
                            <span className="text">Holiday notice for Republic Day</span>
                        </div>
                    </div>
                </div>
                <div className="info-card">
                    <h4>📅 Upcoming Events</h4>
                    <div className="event-list">
                        <div className="event-item">
                            <div className="event-date"><span className="day">15</span><span className="month">JAN</span></div>
                            <div className="event-info-detail"><span className="event-title">Internal Exams Begin</span><span className="event-time">9:00 AM</span></div>
                        </div>
                        <div className="event-item">
                            <div className="event-date"><span className="day">20</span><span className="month">JAN</span></div>
                            <div className="event-info-detail"><span className="event-title">Project Submission</span><span className="event-time">5:00 PM</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
