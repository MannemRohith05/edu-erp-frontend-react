import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByUserId } from '../../services/api';
import PageContainer from '../../components/PageContainer';

const feeData = [
    { id: 1, type: 'Tuition Fee', amount: 75000, paid: 75000, status: 'Paid', dueDate: '2025-06-15', paidDate: '2025-06-10' },
    { id: 2, type: 'Exam Fee', amount: 5000, paid: 5000, status: 'Paid', dueDate: '2025-07-01', paidDate: '2025-06-28' },
    { id: 3, type: 'Transport Fee', amount: 15000, paid: 15000, status: 'Paid', dueDate: '2025-06-15', paidDate: '2025-06-12' },
    { id: 4, type: 'Library Fee', amount: 2000, paid: 2000, status: 'Paid', dueDate: '2025-06-15', paidDate: '2025-06-10' },
    { id: 5, type: 'Lab Fee', amount: 8000, paid: 0, status: 'Pending', dueDate: '2025-08-15', paidDate: null },
    { id: 6, type: 'Hostel Fee', amount: 50000, paid: 25000, status: 'Partial', dueDate: '2025-07-30', paidDate: '2025-07-15' },
];

export default function StudentFees() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getStudentByUserId(user.id).then(() => setLoading(false)).catch(() => setLoading(false));
    }, [user]);

    const totalAmt = feeData.reduce((s, f) => s + f.amount, 0);
    const totalPaid = feeData.reduce((s, f) => s + f.paid, 0);
    const totalPending = totalAmt - totalPaid;
    const pct = Math.round((totalPaid / totalAmt) * 100);

    const statusColor = (s: string) => s === 'Paid' ? '#22c55e' : s === 'Pending' ? '#ef4444' : '#f59e0b';
    const statusBg = (s: string) => s === 'Paid' ? 'rgba(34,197,94,0.12)' : s === 'Pending' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';

    const th = { textAlign: 'left' as const, padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
    const td = { padding: '14px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' };

    return (
        <PageContainer title="My Payments" subtitle="Fee structure and payment history">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Fee', val: `₹${totalAmt.toLocaleString()}`, color: '#4facfe' },
                    { label: 'Total Paid', val: `₹${totalPaid.toLocaleString()}`, color: '#22c55e' },
                    { label: 'Pending', val: `₹${totalPending.toLocaleString()}`, color: '#ef4444' },
                    { label: 'Completion', val: `${pct}%`, color: '#f59e0b' },
                ].map(c => (
                    <div key={c.label} style={{ background: `${c.color}12`, border: `1px solid ${c.color}33`, borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: c.color }}>{c.val}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>{c.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Payment Progress</span>
                    <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>₹{totalPaid.toLocaleString()} / ₹{totalAmt.toLocaleString()}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(135deg, #22c55e, #38f9d7)', borderRadius: 8, transition: 'width 0.5s ease' }} />
                </div>
            </div>

            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1rem' }}>💳 Fee Details</h3>

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
            ) : (
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                            {['#','Fee Type','Amount','Paid','Due Date','Paid Date','Status'].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {feeData.map((f, i) => (
                                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={td}>{i+1}</td>
                                    <td style={{...td, color: '#fff', fontWeight: 500}}>{f.type}</td>
                                    <td style={{...td, color: '#fff', fontWeight: 600}}>₹{f.amount.toLocaleString()}</td>
                                    <td style={{...td, color: '#22c55e', fontWeight: 600}}>₹{f.paid.toLocaleString()}</td>
                                    <td style={td}>{new Date(f.dueDate).toLocaleDateString()}</td>
                                    <td style={td}>{f.paidDate ? new Date(f.paidDate).toLocaleDateString() : '—'}</td>
                                    <td style={td}><span style={{ background: statusBg(f.status), color: statusColor(f.status), padding: '4px 12px', borderRadius: 12, fontWeight: 600, fontSize: '0.75rem' }}>{f.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PageContainer>
    );
}
