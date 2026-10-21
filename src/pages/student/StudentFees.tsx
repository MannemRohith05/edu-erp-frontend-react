import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { confirmMyFeePayment, downloadMyFeeReceiptPdf, getMyFeeLedger, initiateMyFeePayment } from '../../services/api';
import type { FeeLedgerEntry } from '../../types';
import PageContainer from '../../components/PageContainer';
import './StudentFees.css';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } } }
let razorpayScript: Promise<void> | null = null;
function loadRazorpay(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (razorpayScript) return razorpayScript;
    razorpayScript = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => window.Razorpay ? resolve() : reject(new Error('Razorpay Checkout did not initialize'));
        script.onerror = () => reject(new Error('Unable to load Razorpay Checkout. Check your network or content-security policy.'));
        document.body.appendChild(script);
    }).catch(error => { razorpayScript = null; throw error; });
    return razorpayScript;
}
const money = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const paymentError = (reason: unknown, fallback: string) => {
    const response = (reason as { response?: { data?: { message?: string } } })?.response;
    return response?.data?.message || (reason instanceof Error ? reason.message : fallback);
};

export default function StudentFees() {
    const { user } = useAuth();
    const [ledger, setLedger] = useState<FeeLedgerEntry[]>([]), [loading, setLoading] = useState(true), [busy, setBusy] = useState<number | null>(null), [error, setError] = useState(''), [message, setMessage] = useState('');
    const [selected, setSelected] = useState<FeeLedgerEntry | null>(null), [amount, setAmount] = useState('');
    const refreshSequence = useRef(0);
    const refresh = async () => {
        const sequence = ++refreshSequence.current;
        const latest = await getMyFeeLedger();
        if (sequence === refreshSequence.current) setLedger(latest);
        return latest;
    };
    useEffect(() => { if (user) refresh().catch(() => setError('Unable to load your fee ledger.')).finally(() => setLoading(false)); }, [user]);
    const openPayment = (item: FeeLedgerEntry) => { setSelected(item); setAmount(Number(item.balance).toFixed(2)); setError(''); setMessage(''); };
    const startCheckout = async () => {
        if (!selected) return;
        setBusy(selected.invoiceId);
        setError('');
        try {
            const payAmount = Number(Number(amount).toFixed(2));
            if (!Number.isFinite(payAmount) || payAmount <= 0 || payAmount > Number(selected.balance) + 0.000001)
                throw new Error('Enter an amount greater than zero and no more than the current balance.');
            await loadRazorpay();
            const order = await initiateMyFeePayment(selected.invoiceId, payAmount, crypto.randomUUID());
            if (Number(order.balance) <= 0 || !order.providerOrderId) {
                setLedger(current => current.map(item => item.invoiceId === order.invoiceId ? { ...item, ...order } : item));
                setMessage('Payment verified successfully.');
                setSelected(null);
                setBusy(null);
                try { await refresh(); } catch { /* ignore */ }
                return;
            }
            const key = order.providerKeyId;
            const orderAmount = Number(order.providerAmount);
            const currency = order.providerCurrency;
            if (!order.providerOrderId || !key || !Number.isSafeInteger(Math.round(orderAmount * 100)) || orderAmount <= 0 || currency !== 'INR' || !window.Razorpay)
                throw new Error('Razorpay Checkout is not configured for this payment.');
            new window.Razorpay({
                key,
                amount: Math.round(orderAmount * 100),
                currency,
                name: 'EduERP',
                description: selected.category,
                order_id: order.providerOrderId,
                handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                    try {
                        const confirmed = await confirmMyFeePayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
                        setLedger(current => current.map(item => item.invoiceId === confirmed.invoiceId ? { ...item, ...confirmed } : item));
                        setMessage('Payment verified successfully.');
                        setSelected(null);
                        try { await refresh(); } catch { setMessage('Payment verified successfully. The ledger refresh is pending; reload the page shortly.'); }
                        try { await receipt(response.razorpay_payment_id); } catch { setMessage('Payment verified successfully. Receipt download was unavailable; use the receipt action in payment history.'); }
                    } catch (reason) {
                        setSelected(null);
                        setError(`Payment was captured by Razorpay (Reference: ${response.razorpay_payment_id}), but confirmation encountered an error: ${paymentError(reason, 'Verification pending')}. Please refresh your fee ledger instead of paying again.`);
                        try { await refresh(); } catch { /* ignore */ }
                    } finally {
                        setBusy(null);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setBusy(null);
                        setMessage('Payment was not completed. Your balance is unchanged.');
                    }
                }
            }).open();
        } catch (reason) {
            setError(paymentError(reason, 'Unable to start payment.'));
            setBusy(null);
        }
    };
    const receipt = async (paymentId: string) => { const blob = await downloadMyFeeReceiptPdf(paymentId); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `eduerp-receipt-${paymentId}.pdf`; link.click(); URL.revokeObjectURL(url); };
    const total = ledger.reduce((sum, item) => sum + Number(item.amount || 0) + Number(item.adjustment || 0), 0), paid = ledger.reduce((sum, item) => sum + Number(item.paid || 0), 0), balance = ledger.reduce((sum, item) => sum + Number(item.balance || 0), 0), percent = total > 0 ? Math.round((paid / total) * 100) : 0;
    const status = (item: FeeLedgerEntry) => item.amount > 0 && item.balance <= 0 && item.paid > 0 ? 'Paid' : new Date(item.dueDate) < new Date() ? 'Overdue' : item.paid > 0 ? 'Partially Paid' : 'Pending';
    const statusClass = (value: string) => value === 'Paid' ? 'is-paid' : value === 'Partially Paid' ? 'is-partial' : value === 'Overdue' ? 'is-overdue' : 'is-pending';
    return <PageContainer title="My Payments" subtitle="Fee assignments, verified payments and receipts"><div className="student-fees-page">{message && <div className="student-fee-alert is-success" role="status">{message}</div>}{error && <div className="student-fee-alert is-error" role="alert">{error}</div>}<div className="student-fee-summary" aria-label="Payment summary"><article className="student-fee-summary-card is-total"><span className="student-fee-summary-label">Total fee</span><strong className="student-fee-summary-value">{money(total)}</strong></article><article className="student-fee-summary-card is-paid"><span className="student-fee-summary-label">Total paid</span><strong className="student-fee-summary-value">{money(paid)}</strong></article><article className="student-fee-summary-card is-due"><span className="student-fee-summary-label">Balance due</span><strong className="student-fee-summary-value">{money(balance)}</strong></article><article className="student-fee-summary-card is-completion"><span className="student-fee-summary-label">Completion</span><strong className="student-fee-summary-value">{percent}%</strong><div className="student-fee-progress" role="progressbar" aria-label="Fee payment completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div></article></div>{selected && <section className="student-payment-panel" aria-label="Fee payment"><div><h2>Pay {selected.category}</h2><p>Outstanding balance: <strong>{money(selected.balance)}</strong>. Razorpay will securely handle checkout and any bank authentication.</p></div><div className="student-payment-fields"><label>Amount to pay<input type="number" min="0.01" max={selected.balance} step="0.01" value={amount} onChange={event => setAmount(event.target.value)} /></label><button className="student-fee-button is-primary" type="button" disabled={busy === selected.invoiceId} onClick={startCheckout}>{busy === selected.invoiceId ? 'Starting...' : `Pay ${money(Number(amount))} with Razorpay`}</button><button className="student-fee-button is-secondary" type="button" onClick={() => setSelected(null)}>Cancel</button></div></section>}{loading ? <div className="student-fee-state">Loading fee ledger...</div> : ledger.length === 0 ? <div className="student-fee-state">No fee invoices have been issued.</div> : <div className="student-fee-table-wrap"><table className="student-fee-table"><thead><tr>{['#', 'Fee Type', 'Amount', 'Paid', 'Balance', 'Due Date', 'Status', 'Action'].map(item => <th key={item}>{item}</th>)}</tr></thead><tbody>{ledger.map((item, index) => { const state = status(item); const confirmed = item.payments?.find(payment => payment.status === 'CONFIRMED'); return <tr key={item.invoiceId}><td>{index + 1}</td><td>{item.category}</td><td className="student-fee-money">{money(Number(item.amount) + Number(item.adjustment))}</td><td className="student-fee-money is-paid">{money(Number(item.paid))}</td><td className="student-fee-money is-due">{money(Number(item.balance))}</td><td>{new Date(item.dueDate).toLocaleDateString()}</td><td><span className={`student-fee-status ${statusClass(state)}`}>{state}</span></td><td><div className="student-fee-actions">{item.balance > 0 && <button className="student-fee-button is-primary" type="button" disabled={busy === item.invoiceId} onClick={() => openPayment(item)}>Pay online</button>}{confirmed && item.providerPaymentId && <button className="student-fee-button is-secondary" type="button" onClick={() => receipt(item.providerPaymentId!)}>Receipt</button>}</div></td></tr>; })}</tbody></table></div>}</div></PageContainer>;
}
