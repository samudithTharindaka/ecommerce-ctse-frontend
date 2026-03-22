import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
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
          <h1>Create an account</h1>
          <p className="subtitle">Enter your details below</p>

          <form onSubmit={(e) => void onSubmit(e)} className="stack">
            <input
              type="text"
              placeholder="Name"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
            />
            
            <input
              type="email"
              placeholder="Email or Phone Number"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && <p className="banner error">{error}</p>}

            <button type="submit" className="btn primary full-width" disabled={pending} style={{ marginTop: "1rem" }}>
              {pending ? "Creating Account…" : "Create Account"}
            </button>

            <button type="button" className="btn ghost full-width" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "#7d8184" }}>
            Already have account? <Link to="/login" style={{ color: "#000", fontWeight: 500, textDecoration: "underline" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
