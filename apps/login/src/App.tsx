import { useEffect, useState } from "react";
import {
  getAuth0Client,
  loginWithRole,
  signupWithRole,
  handleRedirectCallback,
  isAuthenticated,
  type UserRole,
} from "./auth/auth0";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "partner", label: "Partner" },
  { value: "admin", label: "Admin" },
];

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await getAuth0Client();

      if (window.location.search.includes("code=")) {
        const redirectTarget = await handleRedirectCallback();
        if (redirectTarget) {
          window.location.href = redirectTarget;
          return;
        }
      }

      const authed = await isAuthenticated();
      if (authed) {
        // Already logged in - redirect based on stored role or default to customer
        window.location.href = "http://localhost:5174";
        return;
      }

      setLoading(false);
    }

    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithRole(selectedRole);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await signupWithRole(selectedRole);
  };

  const handleSocialLogin = async (connection: string) => {
    const client = await getAuth0Client();
    await client.loginWithRedirect({
      connection,
      appState: {
        target: REDIRECT_URIS[selectedRole],
      },
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Booking System</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>I am a</label>
            <div style={styles.roleSelector}>
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  style={{
                    ...styles.roleButton,
                    ...(selectedRole === role.value
                      ? styles.roleButtonActive
                      : {}),
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.primaryButton}>
            Sign In
          </button>

          <button
            type="button"
            onClick={handleSignup}
            style={styles.secondaryButton}
          >
            Create Account
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or continue with</span>
        </div>

        <div style={styles.socialButtons}>
          <button
            type="button"
            onClick={() => handleSocialLogin("google-oauth2")}
            style={styles.socialButton}
          >
            <span style={styles.socialIcon}>G</span>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            style={styles.socialButton}
          >
            <span style={styles.socialIcon}>GH</span>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

const REDIRECT_URIS: Record<UserRole, string> = {
  customer: "http://localhost:5174",
  partner: "http://localhost:5175",
  admin: "http://localhost:5176",
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "1rem",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  roleSelector: {
    display: "flex",
    gap: "0.5rem",
  },
  roleButton: {
    flex: 1,
    padding: "0.625rem 0.75rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#6b7280",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  roleButtonActive: {
    borderColor: "#667eea",
    color: "#667eea",
    background: "#eef2ff",
  },
  primaryButton: {
    padding: "0.75rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  secondaryButton: {
    padding: "0.75rem",
    background: "transparent",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "1.5rem 0",
    gap: "1rem",
  },
  dividerText: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
  },
  socialButtons: {
    display: "flex",
    gap: "0.75rem",
  },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#374151",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  socialIcon: {
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  loadingText: {
    textAlign: "center" as const,
    color: "#6b7280",
    padding: "2rem",
  },
};
