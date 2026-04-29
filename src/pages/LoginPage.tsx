import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const demoAccounts = [
    { role: 'Admin', email: 'rohithmannemofficial@gmail.com', password: 'password123', icon: '👤' },
    { role: 'Administrator', email: 'administrator@eduerp.com', password: 'password123', icon: '🛡️' },
    { role: 'Teacher', email: 'teacher@eduerp.com', password: 'password123', icon: '👨‍🏫' },
    { role: 'Student', email: 'student1@gmail.com', password: 'password123', icon: '🎓' },
];

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
    const [shakeCard, setShakeCard] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) {
            redirectToDashboard();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimateCard(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const redirectToDashboard = () => {
        if (!user) return;
        const routes: Record<string, string> = {
            ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student', ADMINISTRATOR: '/administrator',
        };
        navigate(routes[user.role] || '/');
    };

    const handleRoleSelect = (role: string) => {
        const account = demoAccounts.find(a => a.role === role);
        if (account) {
            setEmail(account.email);
            setPassword(account.password);
            setSelectedRole(role);
            setError('');
            setOtp('');
            setOtpSent(false);
            setOtpMessage('');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!otpSent) {
                if (!email || !password) { setError('Please enter email and password'); setLoading(false); return; }
                const response = await login({ email, password });
                setOtpSent(true);
                setOtpMessage(response.message || 'OTP sent to your email');
                setLoading(false);
                return;
            }

            if (!otp) { setError('Please enter the OTP'); setLoading(false); return; }
            await verifyOtp({ email, otp });
            setTimeout(() => redirectToDashboard(), 500);
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || (otpSent ? 'Invalid OTP' : 'Invalid email or password'));
            setShakeCard(true);
            setTimeout(() => setShakeCard(false), 400);
        }
    };

    const handleChangeLogin = () => {
        setOtp('');
        setOtpSent(false);
        setOtpMessage('');
        setError('');
    };

    return (
        <div className="login-container">
            <div className={`login-card ${animateCard ? 'animate-in' : ''} ${shakeCard ? 'shake' : ''}`}>
                <div className="logo-section">
                    <div className="logo">
                        <svg viewBox="0 0 100 100" width="80" height="80">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="3" />
                            <path d="M30 50 L45 65 L70 35" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1>EduERP</h1>
                    <p>Educational Resource Planning</p>
                </div>

                <div className="demo-login-section">
                    <label className="demo-label">Quick Login As</label>
                    <div className="demo-buttons">
                        {demoAccounts.map((account) => (
                            <button
                                key={account.role}
                                type="button"
                                className={`demo-btn ${selectedRole === account.role ? 'active' : ''}`}
                                onClick={() => handleRoleSelect(account.role)}
                            >
                                <span className="demo-btn-icon">{account.icon}</span>
                                <span className="demo-btn-content">
                                    <span className="demo-btn-label">{account.role}</span>
                                    <span className="demo-btn-email">{account.email}</span>
                                    <span className="demo-btn-password">{account.password}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" disabled={otpSent} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" disabled={otpSent} />
                    </div>
                    {otpSent && (
                        <>
                            <div className="success-message">{otpMessage}</div>
                            <div className="form-group">
                                <label htmlFor="otp">OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    placeholder="Enter 6-digit OTP"
                                    inputMode="numeric"
                                    maxLength={6}
                                />
                            </div>
                            <button type="button" className="btn-secondary" onClick={handleChangeLogin} disabled={loading}>
                                Change email or resend
                            </button>
                        </>
                    )}
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : otpSent ? 'Verify OTP' : 'Send OTP'}
                    </button>
                </form>
                <div className="footer-links">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                </div>
            </div>
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
        </div>
    );
}
