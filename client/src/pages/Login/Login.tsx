import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Layers,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { API_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
        return;
      }

      if (data.token) {
        login(data.token, data.user);
        const fromPath = (location.state as any)?.from?.pathname;
        const destination = fromPath && fromPath !== "/" && fromPath !== "/login" ? fromPath : "/dashboard";
        navigate(destination, { replace: true });
      } else {
        setError("Authentication token missing in server response.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* LEFT HERO SIDEBAR */}
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
              <h2>Empower Your Digital Content Architecture</h2>
              <p>
                A high-performance, headless content management system built for speed, flexibility, and modern web applications.
              </p>
            </div>

            <div className="hero-features">
              <div className="feature-pill">
                <CheckCircle2 size={16} className="feature-icon" />
                <span>Visual Drag & Drop Page Builder</span>
              </div>
              <div className="feature-pill">
                <ShieldCheck size={16} className="feature-icon" />
                <span>JWT Authentication & Role Control</span>
              </div>
              <div className="feature-pill">
                <Sparkles size={16} className="feature-icon" />
                <span>Instant REST & Public API Endpoints</span>
              </div>
            </div>
          </div>

          <div className="hero-footer">
            <p>© 2026 Headless CMS Admin Panel. All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="login-form-panel">
          <div className="form-content-box">
            {/* Mobile Brand Logo */}
            <div className="mobile-brand">
              <div className="brand-icon-box">
                <Layers size={22} className="brand-icon" />
              </div>
              <span className="brand-name">Nexus CMS</span>
            </div>

            <div className="form-header">
              <h1>Welcome Back</h1>
              <p>Sign in to manage your content and pages.</p>
            </div>

            {error && (
              <div className="login-alert-error" role="alert">
                <AlertCircle size={18} className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="login-form">
              <div className="input-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-field-wrapper">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="signup-login-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
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

export default Login;