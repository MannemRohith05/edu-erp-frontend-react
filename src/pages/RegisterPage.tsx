
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
    const { register, verifyRegistration } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [accountType, setAccountType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
    const [employeeId, setEmployeeId] = useState('');
    const [department, setDepartment] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [animateCard, setAnimateCard] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setAnimateCard(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loading) return;

        setError('');

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (!otpSent && accountType === 'TEACHER' && (!employeeId.trim() || !department.trim())) {
            setError('Please enter your employee ID and department.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!otpSent && password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (!otpSent && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (otpSent && !/^\d{6}$/.test(otp)) {
            setError('Please enter the six-digit verification OTP.');
            return;
        }

        setLoading(true);

        try {
            if (!otpSent) {
                const response = await register({
                    email: email.trim(),
                    password,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    role: accountType,
                    ...(accountType === 'TEACHER'
                        ? { employeeId: employeeId.trim(), department: department.trim() }
                        : {})
                });

                setOtpSent(true);
                setOtpMessage(
                    response?.message || 'Verification OTP sent to your email.'
                );
                setOtp('');
            } else {
                const response = await verifyRegistration({
                    email: email.trim(),
                    otp: otp.trim()
                });

                navigate(response.user.role === 'TEACHER' ? '/teacher' : '/student');
            }
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: {
                        message?: string;
                        error?: string;
                    };
                };
                message?: string;
            };

            setError(
                apiError.response?.data?.message ||
                apiError.response?.data?.error ||
                apiError.message ||
                (otpSent
                    ? 'OTP verification failed. Please try again.'
                    : 'Registration failed. Please try again.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className={`register-card ${animateCard ? 'animate-in' : ''}`}>
                <div className="logo-section">
                    <div className="logo">
                        <svg viewBox="0 0 100 100" width="70" height="70">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="url(#regGradient)"
                                strokeWidth="3"
                            />
                            <path
                                d="M35 65 L50 30 L65 65 M40 55 L60 55"
                                fill="none"
                                stroke="url(#regGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient
                                    id="regGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
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
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                disabled={otpSent || loading}
                                placeholder="First name"
                                autoComplete="given-name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                disabled={otpSent || loading}
                                placeholder="Last name"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input
                            type="email"
                            id="reg-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={otpSent || loading}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Register as</label>
                        <select
                            id="role"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value as 'STUDENT' | 'TEACHER')}
                            className="role-select"
                            disabled={otpSent || loading}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                        </select>
                    </div>

                    {accountType === 'TEACHER' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="employeeId">Employee ID</label>
                                <input
                                    type="text"
                                    id="employeeId"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    required
                                    disabled={otpSent || loading}
                                    placeholder="Enter employee ID"
                                    autoComplete="organization-title"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <input
                                    type="text"
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                    disabled={otpSent || loading}
                                    placeholder="Enter department"
                                    autoComplete="organization"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input
                            type="password"
                            id="reg-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={otpSent || loading}
                            placeholder="Create a password"
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={otpSent || loading}
                            placeholder="Confirm password"
                            autoComplete="new-password"
                        />
                    </div>

                    {otpSent && (
                        <>
                            <div className="success-message" role="status">
                                {otpMessage}
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-otp">Verification OTP</label>
                                <input
                                    id="reg-otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 6)
                                        )
                                    }
                                    required
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    disabled={loading}
                                    placeholder="Enter 6-digit OTP"
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" aria-label="Loading" />
                        ) : otpSent ? (
                            'Verify Email'
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="footer-links">
                    <p>
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
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
