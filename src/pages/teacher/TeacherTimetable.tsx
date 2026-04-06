import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherByUserId, getSchedulesByTeacher } from '../../services/api';
import type { Schedule } from '../../types';

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const dayLabels: Record<string, string> = {
    MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday',
};

export default function TeacherTimetable() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('ALL');

    useEffect(() => {
        if (!user) return;
        getTeacherByUserId(user.id)
            .then(teacher => getSchedulesByTeacher(teacher.id))
            .then(s => { setSchedules(s); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const grouped = dayOrder.reduce<Record<string, Schedule[]>>((acc, day) => {
        const daySchedules = schedules.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (daySchedules.length > 0) acc[day] = daySchedules;
        return acc;
    }, {});

    const daysToShow = selectedDay === 'ALL' ? Object.keys(grouped) : (grouped[selectedDay] ? [selectedDay] : []);

    return (
        <div>
            <div className="admin-page-header">
                <h1>My Timetable</h1>
                <p>Your daily class schedule with sections and classrooms</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon amber">📅</div>
                    <div><div className="admin-stat-value">{schedules.length}</div><div className="admin-stat-label">Total Classes/Week</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">🏠</div>
                    <div><div className="admin-stat-value">{new Set(schedules.map(s => s.room)).size}</div><div className="admin-stat-label">Classrooms</div></div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon cyan">📚</div>
                    <div><div className="admin-stat-value">{new Set(schedules.map(s => s.courseName)).size}</div><div className="admin-stat-label">Subjects</div></div>
                </div>
            </div>

            <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={() => setSelectedDay('ALL')}
                    style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: selectedDay === 'ALL' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)',
                        color: '#fff', fontWeight: selectedDay === 'ALL' ? 600 : 400, fontSize: '0.85rem', transition: 'all 0.2s',
                    }}
                >All Days</button>
                {dayOrder.map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        style={{
                            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: selectedDay === day ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)',
                            color: '#fff', fontWeight: selectedDay === day ? 600 : 400, fontSize: '0.85rem', transition: 'all 0.2s',
                        }}
                    >{dayLabels[day].slice(0, 3)}</button>
                ))}
            </div>

            {loading ? (
                <div className="admin-loading">Loading timetable...</div>
            ) : daysToShow.length === 0 ? (
                <div className="admin-table-card"><div className="admin-empty">No classes scheduled{selectedDay !== 'ALL' ? ` on ${dayLabels[selectedDay]}` : ''}</div></div>
            ) : (
                daysToShow.map(day => (
                    <div key={day} className="admin-table-card" style={{ marginBottom: 20 }}>
                        <div className="admin-table-header">
                            <h3>📅 {dayLabels[day]}</h3>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{grouped[day].length} class{grouped[day].length > 1 ? 'es' : ''}</span>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Sec No</th>
                                    <th>Time</th>
                                    <th>Subject</th>
                                    <th>Course Code</th>
                                    <th>Classroom</th>
                                    <th>Building</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grouped[day].map((s, i) => (
                                    <tr key={s.id}>
                                        <td><strong>{i + 1}</strong></td>
                                        <td>{s.startTime} – {s.endTime}</td>
                                        <td><strong>{s.courseName}</strong></td>
                                        <td>{s.courseCode}</td>
                                        <td>{s.room}</td>
                                        <td>{s.building || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
}
