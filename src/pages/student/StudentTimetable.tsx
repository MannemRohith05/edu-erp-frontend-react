import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId, getSchedulesByStudent } from '../../services/api';
import type { Schedule } from '../../types';
import PageContainer from '../../components/PageContainer';

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const dayLabels: Record<string, string> = {
    MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday',
};

const dayColors: Record<string, string> = {
    MONDAY: '#4facfe', TUESDAY: '#f093fb', WEDNESDAY: '#43e97b',
    THURSDAY: '#f6d365', FRIDAY: '#a855f7', SATURDAY: '#ef4444',
};

export default function StudentTimetable() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('ALL');

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id)
            .then(s => getSchedulesByStudent(s.id))
            .then(data => { setSchedules(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    const grouped = dayOrder.reduce<Record<string, Schedule[]>>((acc, day) => {
        const daySchedules = schedules.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (daySchedules.length > 0) acc[day] = daySchedules;
        return acc;
    }, {});

    const daysToShow = selectedDay === 'ALL' ? Object.keys(grouped) : (grouped[selectedDay] ? [selectedDay] : []);

    return (
        <PageContainer title="My Timetable" subtitle="Your weekly class schedule">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'rgba(79,172,254,0.08)', border: '1px solid rgba(79,172,254,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4facfe' }}>{schedules.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Total Classes/Week</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{new Set(schedules.map(s => s.room)).size}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Classrooms</div>
                </div>
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7' }}>{new Set(schedules.map(s => s.courseName)).size}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>Subjects</div>
                </div>
            </div>

            {/* Day picker */}
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
                            background: selectedDay === day ? `linear-gradient(135deg, ${dayColors[day]}, ${dayColors[day]}88)` : 'rgba(255,255,255,0.06)',
                            color: '#fff', fontWeight: selectedDay === day ? 600 : 400, fontSize: '0.85rem', transition: 'all 0.2s',
                        }}
                    >{dayLabels[day].slice(0, 3)}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading timetable...</div>
            ) : daysToShow.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                    No classes scheduled{selectedDay !== 'ALL' ? ` on ${dayLabels[selectedDay]}` : ''}
                </div>
            ) : (
                daysToShow.map(day => (
                    <div key={day} style={{ marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>
                                <span style={{ color: dayColors[day], marginRight: 8 }}>●</span>
                                {dayLabels[day]}
                            </h3>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{grouped[day].length} class{grouped[day].length > 1 ? 'es' : ''}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                    {['#', 'Time', 'Subject', 'Code', 'Classroom', 'Building'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {grouped[day].map((s, i) => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{i + 1}</td>
                                        <td style={{ padding: '12px 20px', color: '#4facfe', fontSize: '0.85rem', fontWeight: 600 }}>{s.startTime} – {s.endTime}</td>
                                        <td style={{ padding: '12px 20px', color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{s.courseName}</td>
                                        <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{s.courseCode}</td>
                                        <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{s.room}</td>
                                        <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{s.building || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </PageContainer>
    );
}
