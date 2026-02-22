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
    padding: '1.25rem 1.5rem',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-surface)',
    minWidth: '140px',
    boxShadow: 'var(--shadow)',
  },
  label: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
    marginBottom: '0.375rem',
  },
  value: {
    fontSize: '1.3125rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    letterSpacing: '-0.02em',
  },
};
