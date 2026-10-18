import { useEffect, useState } from 'react';
import { getSchedules, getCourses, createSchedule, updateSchedule, deleteSchedule } from '../../services/api';
import type { Schedule, Course } from '../../types';

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
type Form = { courseId: number | ''; dayOfWeek: string; startTime: string; endTime: string; room: string; building: string };
const empty: Form = { courseId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '', building: '' };

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dayFilter, setDayFilter] = useState('ALL');
    const [form, setForm] = useState<Form>(empty);
    const [editing, setEditing] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const load = () => { setLoading(true); Promise.all([getSchedules(), getCourses()]).then(([s, c]) => { setSchedules(s); setCourses(c); }).catch(() => setError('Unable to load schedules.')).finally(() => setLoading(false)); };
    useEffect(load, []);
    const filtered = schedules.filter(s => dayFilter === 'ALL' || s.dayOfWeek === dayFilter).filter(s => `${s.courseName} ${s.courseCode} ${s.teacherName} ${s.room}`.toLowerCase().includes(search.toLowerCase()));
    const openCreate = () => { setEditing(null); setForm({ ...empty, courseId: courses[0]?.id || '' }); setError(''); setShowForm(true); };
    const openEdit = (schedule: Schedule) => { setEditing(schedule.id); setForm({ courseId: schedule.courseId, dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime.slice(0, 5), endTime: schedule.endTime.slice(0, 5), room: schedule.room || '', building: schedule.building || '' }); setError(''); setShowForm(true); };
    const save = async (event: React.FormEvent) => { event.preventDefault(); setError(''); if (!form.courseId || !form.startTime || !form.endTime || !form.room.trim()) { setError('Course, time, and classroom are required.'); return; } if (form.startTime >= form.endTime) { setError('Start time must be before end time.'); return; } const payload: Partial<Schedule> = { ...form, courseId: Number(form.courseId), dayOfWeek: form.dayOfWeek as Schedule['dayOfWeek'] }; try { if (editing) await updateSchedule(editing, payload); else await createSchedule(payload); setShowForm(false); load(); } catch (err: any) { setError(err.response?.data?.message || 'Unable to save schedule.'); } };
    const remove = async (id: number) => { if (!confirm('Delete this schedule?')) return; try { await deleteSchedule(id); load(); } catch { setError('Unable to delete schedule.'); } };
    return <div>
        <div className="admin-page-header"><h1>Schedule Management</h1><p>Create and manage enrolled-course class schedules</p></div>
        <div className="admin-stats-row"><div className="admin-stat-card"><div className="admin-stat-icon amber">📅</div><div><div className="admin-stat-value">{schedules.length}</div><div className="admin-stat-label">Total Classes</div></div></div><div className="admin-stat-card"><div className="admin-stat-icon green">🏠</div><div><div className="admin-stat-value">{new Set(schedules.map(s => s.room)).size}</div><div className="admin-stat-label">Rooms Used</div></div></div></div>
        {error && !showForm && <div className="admin-error">{error}</div>}
        <div className="admin-table-card"><div className="admin-table-header"><h3>Class Schedule ({filtered.length})</h3><div style={{ display: 'flex', gap: 10 }}><select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="admin-table-search"><option value="ALL">All Days</option>{days.map(d => <option key={d}>{d}</option>)}</select><input className="admin-table-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /><button onClick={openCreate} className="admin-primary-btn">+ Add Schedule</button></div></div>
            {loading ? <div className="admin-loading">Loading schedules...</div> : filtered.length === 0 ? <div className="admin-empty">No schedule entries found</div> : <table className="admin-table"><thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Teacher</th><th>Room</th><th>Actions</th></tr></thead><tbody>{filtered.map(s => <tr key={s.id}><td>{s.dayOfWeek}</td><td>{s.startTime} – {s.endTime}</td><td>{s.courseName} ({s.courseCode})</td><td>{s.teacherName || '—'}</td><td>{s.room}{s.building ? `, ${s.building}` : ''}</td><td><button onClick={() => openEdit(s)} className="admin-link-btn">Edit</button><button onClick={() => remove(s.id)} className="admin-danger-btn">Delete</button></td></tr>)}</tbody></table>}
        </div>
        {showForm && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}><form onSubmit={save} style={{ background: '#1a1a2e', padding: 28, borderRadius: 16, width: 520, border: '1px solid rgba(255,255,255,.12)' }}><h2 style={{ color: '#fff' }}>{editing ? 'Edit Schedule' : 'Create Schedule'}</h2><label>Course<select value={form.courseId} onChange={e => setForm({ ...form, courseId: Number(e.target.value) })} className="admin-table-search" style={{ width: '100%', margin: '8px 0 14px' }}>{courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName} ({c.teacherName || 'Unassigned'})</option>)}</select></label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label>Day<select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })} className="admin-table-search" style={{ width: '100%', margin: '8px 0 14px' }}>{days.map(d => <option key={d}>{d}</option>)}</select></label><label>Room<input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="admin-table-search" style={{ width: '100%', margin: '8px 0 14px' }} /></label><label>Start<input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="admin-table-search" style={{ width: '100%', margin: '8px 0 14px' }} /></label><label>End<input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="admin-table-search" style={{ width: '100%', margin: '8px 0 14px' }} /></label><label style={{ gridColumn: '1 / -1' }}>Building<input value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} className="admin-table-search" style={{ width: '100%', margin: '8px 0 14px' }} /></label></div>{error && <div className="admin-error">{error}</div>}<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button type="button" onClick={() => setShowForm(false)} className="admin-secondary-btn">Cancel</button><button type="submit" className="admin-primary-btn">Save Schedule</button></div></form></div>}
    </div>;
}
