import { useEffect, useState } from 'react';
import { getCourses, getTeachers, createCourse, updateCourse, deleteCourse } from '../../services/api';
import type { Course, Teacher } from '../../types';

const BRANCHES = ['CSE', 'ECE', 'CSIT', 'EEE', 'ME', 'CIVIL', 'IT', 'AIDS', 'AIML'];

interface CourseForm {
    courseCode: string; courseName: string; description: string;
    credits: number; semester: number; department: string; teacherId: number | null;
}

const emptyForm: CourseForm = { courseCode: '', courseName: '', description: '', credits: 3, semester: 1, department: 'CSE', teacherId: null };

export default function AdminCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterCredits, setFilterCredits] = useState('ALL');
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<CourseForm>({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadData = () => {
        setLoading(true);
        Promise.all([getCourses(), getTeachers()])
            .then(([c, t]) => { setCourses(c); setTeachers(t); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const filtered = courses.filter(c => {
        const matchSearch = `${c.courseName} ${c.courseCode} ${c.department} ${c.teacherName}`.toLowerCase().includes(search.toLowerCase());
        const matchDept = filterDept === 'ALL' || c.department === filterDept;
        const matchCredits = filterCredits === 'ALL' || c.credits === Number(filterCredits);
        return matchSearch && matchDept && matchCredits;
    });

    const creditValues = [...new Set(courses.map(c => c.credits))].sort();

    const totalEnrolled = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    const departments = [...new Set(courses.map(c => c.department))];

    const openCreate = () => {
        setEditId(null);
        setForm({ ...emptyForm });
        setError('');
        setShowModal(true);
    };

    const openEdit = (c: Course) => {
        setEditId(c.id);
        setForm({
            courseCode: c.courseCode, courseName: c.courseName, description: c.description || '',
            credits: c.credits, semester: c.semester, department: c.department, teacherId: c.teacherId || null,
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.courseCode || !form.courseName) { setError('Course code and name are required'); return; }
        setSaving(true); setError('');
        try {
            const payload: any = { ...form };
            if (!payload.teacherId) delete payload.teacherId;
            if (editId) {
                await updateCourse(editId, payload);
                setSuccess('Course updated successfully!');
            } else {
                await createCourse(payload);
                setSuccess('Course created successfully!');
            }
            setShowModal(false);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save course');
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this course? This cannot be undone.')) return;
        try {
            await deleteCourse(id);
            setSuccess('Course deleted.');
            loadData();
        } catch { setSuccess('Failed to delete.'); }
    };

    const inp = { padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', width: '100%' };

    return (
        <div>
            <div className="admin-page-header">
                <h1>Course Management</h1>
                <p>Create, edit, and assign courses to teachers across all BTech branches</p>
            </div>

            <div className="admin-stats-row">
                <div className="admin-stat-card"><div className="admin-stat-icon green">📚</div><div><div className="admin-stat-value">{courses.length}</div><div className="admin-stat-label">Total Courses</div></div></div>
                <div className="admin-stat-card"><div className="admin-stat-icon cyan">🎓</div><div><div className="admin-stat-value">{totalEnrolled}</div><div className="admin-stat-label">Total Enrollments</div></div></div>
                <div className="admin-stat-card"><div className="admin-stat-icon amber">📋</div><div><div className="admin-stat-value">{departments.length}</div><div className="admin-stat-label">Departments</div></div></div>
                <div className="admin-stat-card"><div className="admin-stat-icon pink">👨‍🏫</div><div><div className="admin-stat-value">{teachers.length}</div><div className="admin-stat-label">Teachers</div></div></div>
            </div>

            {success && <div style={{ margin: '0 0 16px', padding: '12px 24px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: 10, fontSize: '0.85rem' }}>{success}<button onClick={() => setSuccess('')} style={{ float: 'right', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}>✕</button></div>}

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3>All Courses ({filtered.length})</h3>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select className="admin-table-search" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ minWidth: 140 }}>
                            <option value="ALL">All Branches</option>
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select className="admin-table-search" value={filterCredits} onChange={e => setFilterCredits(e.target.value)} style={{ minWidth: 120 }}>
                            <option value="ALL">All Credits</option>
                            {creditValues.map(cr => <option key={cr} value={cr}>{cr} Credits</option>)}
                        </select>
                        <input className="admin-table-search" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
                        <button onClick={openCreate} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            + Add Course
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="admin-loading">Loading courses...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty">No courses found</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>Code</th><th>Course Name</th><th>Branch</th><th>Sem</th><th>Credits</th><th>Teacher</th><th>Enrolled</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.courseCode}</strong></td>
                                    <td>{c.courseName}</td>
                                    <td><span style={{ background: 'rgba(102,126,234,0.15)', color: '#667eea', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>{c.department}</span></td>
                                    <td>{c.semester}</td>
                                    <td>{c.credits}</td>
                                    <td>{c.teacherName || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not assigned</span>}</td>
                                    <td>{c.enrolledCount || 0}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => openEdit(c)} style={{ padding: '4px 10px', background: 'rgba(79,172,254,0.15)', border: 'none', borderRadius: 6, color: '#4facfe', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Edit</button>
                                            <button onClick={() => handleDelete(c.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, minWidth: 520, maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: '#fff', margin: '0 0 20px', fontSize: '1.25rem' }}>{editId ? '✏️ Edit Course' : '📚 Create New Course'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Course Code *</label>
                                    <input style={inp} value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} placeholder="e.g. CS301" disabled={!!editId} />
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Branch/Department *</label>
                                    <select style={inp} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Course Name *</label>
                                <input style={inp} value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} placeholder="e.g. Data Structures & Algorithms" />
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Description</label>
                                <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' as const }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Course description..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Credits</label>
                                    <input type="number" style={inp} value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} min={1} max={6} />
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Semester</label>
                                    <input type="number" style={inp} value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} min={1} max={8} />
                                </div>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Assign Teacher</label>
                                <select style={inp} value={form.teacherId ?? ''} onChange={e => setForm({ ...form, teacherId: e.target.value ? Number(e.target.value) : null })}>
                                    <option value="">— No teacher assigned —</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.employeeId}) — {t.department}</option>
                                    ))}
                                </select>
                            </div>
                            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 8, marginBottom: 14, fontSize: '0.85rem' }}>{error}</div>}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                                <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', fontSize: '0.85rem', opacity: saving ? 0.7 : 1 }}>
                                    {saving ? 'Saving...' : editId ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
