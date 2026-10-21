import { useEffect, useState } from 'react';
import { downloadPayrollPayslip, getMyPayrollRecords, getMySalaryStructures } from '../../services/api';
import type { PayrollRecord, SalaryStructure } from '../../types';

export default function TeacherPayroll() {
    const [structures, setStructures] = useState<SalaryStructure[]>([]);
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [error, setError] = useState('');
    useEffect(() => { Promise.all([getMySalaryStructures(), getMyPayrollRecords()]).then(([s, r]) => { setStructures(s); setRecords(r); }).catch(() => setError('Unable to load your salary records.')); }, []);
    const current = structures[0];
    const payslip = async (id: number) => { try { const blob = await downloadPayrollPayslip(id); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `payslip-${id}.pdf`; link.click(); URL.revokeObjectURL(url); } catch { setError('Unable to download payslip.'); } };
    return <div><div className="admin-page-header"><h1>My Salary &amp; Payments</h1><p>View-only salary configuration and payroll history</p></div>{error && <div className="admin-error">{error}</div>}{current && <div className="admin-stats-row"><div className="admin-stat-card"><div><div className="admin-stat-value">₹{current.grossSalary}</div><div className="admin-stat-label">Gross Salary</div></div></div><div className="admin-stat-card"><div><div className="admin-stat-value">₹{Number(current.grossSalary) + Number(current.allowances) + Number(current.bonuses || 0) - Number(current.deductions)}</div><div className="admin-stat-label">Configured Net</div></div></div></div>}<div className="admin-table-card"><h3>Payroll history</h3><table className="admin-table"><thead><tr><th>Period</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Payment Date</th><th>Status</th><th>Reference</th><th>Document</th></tr></thead><tbody>{records.map(r => <tr key={r.id}><td>{r.payrollMonth}/{r.payrollYear}</td><td>{r.grossSalary}</td><td>{r.deductions}</td><td>{r.netSalary}</td><td>{r.paymentDate || '—'}</td><td>{r.status}</td><td>{r.paymentReference || '—'}</td><td>{(r.status === 'PAID' || r.status === 'CREDITED') && <button className="admin-secondary-btn" onClick={() => payslip(r.id)}>Download payslip</button>}</td></tr>)}</tbody></table>{records.length === 0 && <div className="admin-empty">No payroll records available.</div>}</div></div>;
}
