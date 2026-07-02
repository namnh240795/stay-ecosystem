import { useParams } from "react-router-dom";

export default function Booking() {
  const { propertyId } = useParams<{ propertyId: string }>();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Book This Property</h1>
        <p style={styles.description}>
          Complete your reservation for property #{propertyId}. Select your
          check-in and check-out dates, number of guests, and confirm your
          booking details.
        </p>
        <div style={styles.placeholder}>
          Booking form for property #{propertyId ?? "unknown"} will appear here.
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
