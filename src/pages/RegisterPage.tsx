import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [animateCard, setAnimateCard] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimateCard(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !email) { setError('Please fill in all fields'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        setError('');
        try {
            await register({ email, password, firstName, lastName, role });
            navigate(role === 'TEACHER' ? '/teacher' : '/student');
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <div className={`register-card ${animateCard ? 'animate-in' : ''}`}>
                <div className="logo-section">
                    <div className="logo">
                        <svg viewBox="0 0 100 100" width="70" height="70">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#regGradient)" strokeWidth="3" />
                            <path d="M35 65 L50 30 L65 65 M40 55 L60 55" fill="none" stroke="url(#regGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="regGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1>Create Account</h1>
                    <p>Join EduERP today</p>
                </div>
                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First name" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last name" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Register as</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'STUDENT' | 'TEACHER')} className="role-select">
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a password" minLength={6} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm password" />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Create Account'}
                    </button>
                </form>
                <div className="footer-links">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
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
