import { useAuth0 } from "@auth0/auth0-react";

export default function MyBookings() {
  const { user } = useAuth0();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Bookings</h1>
        <p style={styles.description}>
          View and manage your reservations. Track upcoming stays, past trips,
          and booking status for user {user?.email ?? "unknown"}.
        </p>
        <div style={styles.placeholder}>
          List of your bookings will appear here.
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: "1rem",
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
