interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: '1rem 1.25rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-surface)',
    minWidth: '140px',
    boxShadow: 'var(--shadow-sm)',
  },
  label: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    marginBottom: '0.25rem',
  },
  value: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
};
