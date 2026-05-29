import { ProductStatus } from "@/types"

export default function StatusBadge({ status }: { status: ProductStatus }) {
  const styles = {
    pending: {
      bg:     "var(--pending-bg)",
      text:   "var(--pending-text)",
      border: "var(--pending-border)",
      label:  "En attente",
    },
    approved: {
      bg:     "var(--ok-bg)",
      text:   "var(--ok-text)",
      border: "var(--ok-border)",
      label:  "Approuvé",
    },
    rejected: {
      bg:     "var(--reject-bg)",
      text:   "var(--reject-text)",
      border: "var(--reject-border)",
      label:  "Rejeté",
    },
  }[status]

  return (
    <span style={{
      background:   styles.bg,
      color:        styles.text,
      border:       `0.5px solid ${styles.border}`,
      borderRadius: 4,
      padding:      "2px 8px",
      fontSize:     10,
      fontWeight:   500,
      display:      "inline-flex",
      alignItems:   "center",
    }}>
      {styles.label}
    </span>
  )
}