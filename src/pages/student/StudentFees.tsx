import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyFeeLedger } from '../../services/api';
import type { FeeLedgerEntry } from '../../types';
import PageContainer from '../../components/PageContainer';

export default function StudentFees() {
    const { user } = useAuth();
    const [ledger, setLedger] = useState<FeeLedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!user) return;
        getMyFeeLedger().then(setLedger).catch(() => setError('Unable to load your fee ledger.')).finally(() => setLoading(false));
    }, [user]);
    const total = ledger.reduce((sum, item) => sum + Number(item.amount || 0) + Number(item.adjustment || 0), 0);
    const paid = ledger.reduce((sum, item) => sum + Number(item.paid || 0), 0);
    const balance = ledger.reduce((sum, item) => sum + Number(item.balance || 0), 0);
    const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
    const status = (item: FeeLedgerEntry) => item.balance <= 0 ? 'Paid' : item.paid > 0 ? 'Partial' : 'Pending';
    const statusColor = (value: string) => value === 'Paid' ? '#22c55e' : value === 'Pending' ? '#ef4444' : '#f59e0b';
    const cell = { padding: '14px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' };
    const header = { textAlign: 'left' as const, padding: '12px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const };
    return <PageContainer title="My Payments" subtitle="Fee structure and payment history">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[['Total Fee', total, '#4facfe'], ['Total Paid', paid, '#22c55e'], ['Balance Due', balance, '#ef4444'], ['Completion', `${percent}%`, '#f59e0b']].map(([label, value, color]) =>
                <div key={String(label)} style={{ background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: String(color) }}>{typeof value === 'number' ? `₹${value.toLocaleString()}` : value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 4 }}>{label}</div>
                </div>)}
        </div>
        {loading ? <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading fee ledger...</div> : error ? <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>{error}</div> : ledger.length === 0 ? <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>No fee invoices have been issued.</div> :
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'rgba(0,0,0,0.15)' }}>{['#', 'Fee Type', 'Amount', 'Paid', 'Balance', 'Due Date', 'Status'].map(item => <th key={item} style={header}>{item}</th>)}</tr></thead>
                <tbody>{ledger.map((item, index) => { const state = status(item); return <tr key={item.invoiceId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={cell}>{index + 1}</td><td style={{ ...cell, color: '#fff', fontWeight: 500 }}>{item.category}</td><td style={{ ...cell, color: '#fff' }}>₹{Number(item.amount + item.adjustment).toLocaleString()}</td><td style={{ ...cell, color: '#22c55e' }}>₹{Number(item.paid).toLocaleString()}</td><td style={{ ...cell, color: '#f59e0b' }}>₹{Number(item.balance).toLocaleString()}</td><td style={cell}>{new Date(item.dueDate).toLocaleDateString()}</td><td style={cell}><span style={{ color: statusColor(state) }}>{state}</span></td>
                </tr>; })}</tbody>
            </table></div>}
    </PageContainer>;
}
