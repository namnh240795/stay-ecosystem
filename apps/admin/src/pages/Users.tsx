import { useAuth0 } from "@auth0/auth0-react";

export default function Users() {
  const { user, logout } = useAuth0();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Panel</h1>
        <div style={styles.userArea}>
          <span style={styles.greeting}>Admin: {user?.name ?? "Admin"}</span>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            style={styles.logoutButton}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <h2 style={styles.sectionTitle}>User Management</h2>
        <p style={styles.description}>
          Manage all platform users. View user profiles, roles, account status,
          and perform administrative actions such as suspending or removing
          accounts.
        </p>
        <div style={styles.placeholder}>
          User management table and controls will appear here.
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
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1a1a2e",
    marginBottom: "0.75rem",
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
