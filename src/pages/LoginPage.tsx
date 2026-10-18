import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const { login, verifyOtp, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [animateCard, setAnimateCard] = useState(false);

    useEffect(() => { const timer = setTimeout(() => setAnimateCard(true), 100); return () => clearTimeout(timer); }, []);
    useEffect(() => {
        if (isAuthenticated && user) navigate({ ADMIN: '/admin', ADMINISTRATOR: '/administrator', TEACHER: '/teacher', STUDENT: '/student' }[user.role] || '/', { replace: true });
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); setLoading(true); setError('');
        try {
            if (!otpSent) { const response = await login({ email: email.trim(), password }); setOtpSent(true); setOtpMessage(response.message || 'OTP sent to your email'); }
            else await verifyOtp({ email: email.trim(), otp });
        } catch (err: any) { setError(err.response?.data?.message || (otpSent ? 'Invalid OTP' : 'Invalid email or password')); }
        finally { setLoading(false); }
    };

    return <div className="login-container">
        <div className={`login-card ${animateCard ? 'animate-in' : ''}`}>
            <div className="logo-section"><div className="logo"><svg viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="3" /><path d="M30 50 L45 65 L70 35" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="gradient"><stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" /></linearGradient></defs></svg></div><h1>EduERP</h1><p>Educational Resource Planning</p></div>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={otpSent} placeholder="Enter your email" /></div>
                <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={otpSent} placeholder="Enter your password" /></div>
                {otpSent && <><div className="success-message">{otpMessage}</div><div className="form-group"><label htmlFor="otp">OTP</label><input id="otp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} inputMode="numeric" placeholder="Enter 6-digit OTP" /></div><button type="button" className="btn-secondary" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}>Change email or resend</button></>}
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? <span className="spinner" /> : otpSent ? 'Verify OTP' : 'Send OTP'}</button>
            </form>
            <div className="footer-links"><p>Don't have an account? <Link to="/register">Register</Link></p></div>
        </div><div className="background-shapes"><div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" /></div>
    </div>;
}
