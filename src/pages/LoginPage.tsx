import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-layout">
      {/* Left side - Image */}
      <div className="auth-image">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80" 
          alt="Shopping" 
          style={{ 
            maxWidth: "100%", 
            maxHeight: "500px", 
            objectFit: "contain",
            borderRadius: "4px"
          }}
        />
      </div>

      {/* Right side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <h1>Log in to Exclusive</h1>
          <p className="subtitle">Enter your details below</p>

          <form onSubmit={(e) => void onSubmit(e)} className="stack">
            <input
              type="text"
              placeholder="Email or Phone Number"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
            
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && <p className="banner error">{error}</p>}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem" }}>
              <button type="submit" className="btn primary" disabled={pending}>
                {pending ? "Signing in…" : "Log In"}
              </button>
              <Link to="/forgot-password" style={{ color: "#db4444", fontSize: "0.9rem" }}>
                Forget Password?
              </Link>
            </div>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "#7d8184" }}>
            Don't have an account? <Link to="/register" style={{ color: "#000", fontWeight: 500, textDecoration: "underline" }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
