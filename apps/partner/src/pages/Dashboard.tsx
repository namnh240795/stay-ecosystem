import { useAuth0 } from "@auth0/auth0-react";

export default function Dashboard() {
  const { user, logout } = useAuth0();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Partner Dashboard</h1>
        <div style={styles.userArea}>
          <span style={styles.greeting}>Welcome, {user?.name ?? "Partner"}</span>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            style={styles.logoutButton}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <p style={styles.description}>
          Your partner overview. View performance metrics, upcoming bookings,
          and property statistics at a glance.
        </p>
        <div style={styles.placeholder}>
          Partner dashboard with stats and overview will appear here.
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1a1a2e",
    margin: 0,
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  greeting: {
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  logoutButton: {
    padding: "0.5rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  main: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  description: {
    fontSize: "1rem",
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: "1.5rem",
  },
  placeholder: {
    padding: "3rem",
    border: "2px dashed #d1d5db",
    borderRadius: "12px",
    textAlign: "center" as const,
    color: "#9ca3af",
    fontSize: "1rem",
  },
};
