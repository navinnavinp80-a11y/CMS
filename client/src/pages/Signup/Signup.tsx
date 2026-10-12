import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    ArrowRight,
    Layers,
    ShieldCheck,
} from "lucide-react";
import { API_URL } from "../../services/api";
import "./Signup.css";

function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to create your account.");
                return;
            }

            setSuccess("Account created successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error("Signup error:", err);
            setError("Unable to connect to server. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container signup-container">
                <div className="login-hero-panel">
                    <div className="hero-gradient-overlay" />

                    <div className="hero-content">
                        <div className="hero-brand">
                            <div className="brand-icon-box">
                                <Layers size={24} className="brand-icon" />
                            </div>
                            <span className="brand-name">Nexus CMS</span>
                        </div>

                        <div className="hero-main-text">
                            <h2>Build Your Digital Experience</h2>
                            <p>
                                Create your account and start managing your content,
                                pages, and digital experiences with Nexus CMS.
                            </p>
                        </div>

                        <div className="hero-features">
                            <div className="feature-pill">
                                <ShieldCheck size={16} className="feature-icon" />
                                <span>Secure Account Access</span>
                            </div>
                            <div className="feature-pill">
                                <Layers size={16} className="feature-icon" />
                                <span>Visual Page Builder</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-footer">
                        <p>© 2026 Headless CMS Admin Panel. All rights reserved.</p>
                    </div>
                </div>

                <div className="login-form-panel signup-form-panel">
                    <div className="form-content-box">
                        <div className="mobile-brand">
                            <div className="brand-icon-box">
                                <Layers size={22} className="brand-icon" />
                            </div>
                            <span className="brand-name">Nexus CMS</span>
                        </div>

                        <div className="form-header">
                            <h1>Create Account</h1>
                            <p>Sign up to get started with Nexus CMS.</p>
                        </div>

                        {error && (
                            <div className="login-alert-error" role="alert">
                                <AlertCircle size={18} className="alert-icon" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="signup-alert-success" role="status">
                                {success}
                            </div>
                        )}

                        <form
                            onSubmit={handleSignup}
                            noValidate
                            className="login-form signup-form"
                        >
                            <div className="input-group">
                                <label htmlFor="signup-name">Full Name</label>
                                <div className="input-field-wrapper">
                                    <User size={18} className="field-icon" />
                                    <input
                                        id="signup-name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="name"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="signup-email">Email Address</label>
                                <div className="input-field-wrapper">
                                    <Mail size={18} className="field-icon" />
                                    <input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="signup-password">Password</label>
                                <div className="input-field-wrapper">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Minimum 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="signup-confirm-password">
                                    Confirm Password
                                </label>
                                <div className="input-field-wrapper">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        id="signup-confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="btn-spinner" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="signup-login-link">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </div>

                        <div className="form-footer-info">
                            <ShieldCheck size={14} />
                            <span>Protected by Enterprise Security</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
