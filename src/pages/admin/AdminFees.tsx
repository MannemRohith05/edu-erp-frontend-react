import { useEffect, useState } from 'react';
import { createFeeInvoice, createFeeStructure, getCourses, getFeeInvoices, getFeeStructures, getFinanceDashboard, getStudents, recordFeePayment } from '../../services/api';
import type { Course, FeeLedgerEntry, FeeStructure, FinanceDashboard, Student } from '../../types';
import './AdminFees.css';

const money = (value: number) => `₹${Number(value || 0).toLocaleString()}`;
const formatInr = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);

export default function AdminFees() {
    const [structures, setStructures] = useState<FeeStructure[]>([]), [invoices, setInvoices] = useState<FeeLedgerEntry[]>([]), [students, setStudents] = useState<Student[]>([]), [courses, setCourses] = useState<Course[]>([]);
    const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
    const [category, setCategory] = useState('Tuition'), [amount, setAmount] = useState(''), [dueDate, setDueDate] = useState(''), [courseId, setCourseId] = useState(''), [studentId, setStudentId] = useState(''), [structureId, setStructureId] = useState('');
    const [message, setMessage] = useState(''), [error, setError] = useState('');
    const load = () => Promise.all([getFeeStructures(), getFeeInvoices(), getStudents(), getCourses(), getFinanceDashboard()]).then(([s, i, st, c, d]) => { setStructures(s); setInvoices(i); setStudents(st); setCourses(c); setDashboard(d); }).catch(() => setError('Unable to load fee records.'));
    useEffect(() => { load(); }, []);
    const addStructure = async (e: React.FormEvent) => { e.preventDefault(); try { await createFeeStructure({ category, amount: Number(amount), dueDate, courseId: courseId ? Number(courseId) : undefined }); setMessage('Fee structure created.'); setAmount(''); load(); } catch (x: any) { setError(x.response?.data?.message || 'Unable to create fee structure.'); } };
    const addInvoice = async (e: React.FormEvent) => { e.preventDefault(); if (!studentId || !structureId) return; try { await createFeeInvoice(Number(studentId), Number(structureId)); setMessage('Invoice created.'); load(); } catch (x: any) { setError(x.response?.data?.message || 'Unable to create invoice.'); } };
    const payment = async (invoice: FeeLedgerEntry) => { const value = window.prompt(`Payment amount (balance ${invoice.balance})`), reference = window.prompt('Unique payment reference'); if (!value || !reference) return; try { await recordFeePayment(invoice.invoiceId, Number(value), reference); setMessage('Payment recorded.'); load(); } catch (x: any) { setError(x.response?.data?.message || 'Unable to record payment.'); } };
    const selectedStructure = structures.find(structure => String(structure.id) === structureId);

    return <div className="admin-fees-page">
        <div className="admin-page-header"><h1>Fee Management</h1><p>Configure structures, assign fees and monitor finance performance</p></div>
        {message && <div className="admin-success">{message}</div>}
        {error && <div className="admin-error">{error}</div>}
        {dashboard && <div className="admin-fee-summary" aria-label="Finance summary">
            {[
                ['Assigned', money(dashboard.totalFeesAssigned), 'is-blue'],
                ['Students assessed', dashboard.studentsAssessed.toLocaleString(), 'is-purple'],
                ['Received', money(dashboard.totalAmountReceived), 'is-green'],
                ['Pending', money(dashboard.pendingBalance), 'is-amber'],
                ['Overdue', money(dashboard.overdueBalance), 'is-red'],
            ].map(([label, value, tone]) => <article className={`admin-fee-summary-card ${tone}`} key={label}><span className="admin-fee-summary-label">{label}</span><strong className="admin-fee-summary-value">{value}</strong></article>)}
        </div>}
        <div className="admin-fee-form-grid">
            <form className="admin-fee-panel" onSubmit={addStructure}>
                <h3>New fee structure</h3><p>Define a reusable charge for a course or the wider student body.</p>
                <div className="admin-fee-field"><label htmlFor="fee-category">Category</label><input id="fee-category" className="admin-fee-input" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required /></div>
                <div className="admin-fee-field"><label htmlFor="structure-amount">Amount</label><input id="structure-amount" className="admin-fee-input" type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
                <div className="admin-fee-field"><label htmlFor="structure-due-date">Due date</label><input id="structure-due-date" className="admin-fee-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required /></div>
                <div className="admin-fee-field"><label htmlFor="structure-course">Course scope</label><select id="structure-course" className="admin-fee-input" value={courseId} onChange={e => setCourseId(e.target.value)}><option value="">All courses</option>{courses.map(c => <option value={c.id} key={c.id}>{c.courseCode} - {c.courseName}</option>)}</select></div>
                <button className="admin-fee-primary-button" type="submit">Create structure</button>
            </form>
            <form className="admin-fee-panel" onSubmit={addInvoice}>
                <h3>Assign fee to student</h3><p>Issue an invoice using the selected student and fee structure.</p>
                <div className="admin-fee-field"><label htmlFor="fee-student">Student</label><select id="fee-student" className="admin-fee-input" value={studentId} onChange={e => setStudentId(e.target.value)} required><option value="">Select student</option>{students.map(s => <option value={s.id} key={s.id}>{s.studentId} - {s.fullName}</option>)}</select></div>
                <div className="admin-fee-field"><label htmlFor="fee-structure">Fee structure</label><select id="fee-structure" className="admin-fee-input" value={structureId} onChange={e => setStructureId(e.target.value)} required><option value="">Select structure</option>{structures.map(s => <option value={s.id} key={s.id}>{s.category} - {formatInr(Number(s.amount))}</option>)}</select></div>
                <div className={`admin-fee-assigned-amount ${selectedStructure ? 'is-selected' : ''}`} aria-live="polite"><span>Assigned amount</span><strong>{selectedStructure ? formatInr(Number(selectedStructure.amount)) : 'Select a fee structure first'}</strong></div>
                <button className="admin-fee-primary-button" type="submit" disabled={!studentId || !structureId}>Assign fee</button>
            </form>
        </div>
        {dashboard && <section className="admin-fee-table-card"><div className="admin-fee-table-header"><h3 className="admin-fee-table-title">Student-wise finance</h3></div><div className="admin-fee-table-scroll"><table className="admin-fee-table"><thead><tr><th>Student</th><th className="admin-fee-money">Assessed</th><th className="admin-fee-money">Paid</th><th className="admin-fee-money">Pending</th><th className="admin-fee-money">Overdue</th></tr></thead><tbody>{dashboard.students.map(s => <tr key={s.studentId}><td>{s.studentName}</td><td className="admin-fee-money">{money(s.assessed)}</td><td className="admin-fee-money is-paid">{money(s.paid)}</td><td className="admin-fee-money is-pending">{money(s.pending)}</td><td className="admin-fee-money is-overdue">{money(s.overdue)}</td></tr>)}</tbody></table></div></section>}
        <section className="admin-fee-table-card"><div className="admin-fee-table-header"><h3 className="admin-fee-table-title">Invoices ({invoices.length})</h3></div><div className="admin-fee-table-scroll"><table className="admin-fee-table"><thead><tr><th>Student</th><th>Category</th><th className="admin-fee-money">Amount</th><th className="admin-fee-money">Paid</th><th className="admin-fee-money">Balance</th><th>Action</th></tr></thead><tbody>{invoices.map(i => <tr key={i.invoiceId}><td>{i.studentName}</td><td>{i.category}</td><td className="admin-fee-money">{money(i.amount)}</td><td className="admin-fee-money is-paid">{money(i.paid)}</td><td className={`admin-fee-money ${i.balance > 0 ? 'is-pending' : 'is-paid'}`}>{money(i.balance)}</td><td>{i.balance > 0 && <button className="admin-fee-action-button" type="button" onClick={() => payment(i)}>Record payment</button>}</td></tr>)}</tbody></table></div>{invoices.length === 0 && <div className="admin-fee-empty">No invoices have been issued.</div>}</section>
    </div>;
}
