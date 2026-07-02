import { useAuth0 } from "@auth0/auth0-react";

export default function Earnings() {
  const { user } = useAuth0();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Earnings</h1>
        <p style={styles.description}>
          Track your revenue and payouts. View earnings breakdowns by property,
          monthly summaries, and payment history for partner {user?.name ?? "unknown"}.
        </p>
        <div style={styles.placeholder}>
          Earnings overview and payment history will appear here.
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
    maxWidth: "1200px",
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
