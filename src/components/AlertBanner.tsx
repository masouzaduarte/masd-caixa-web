interface AlertBannerProps {
  message: string;
}

export function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div style={styles.banner}>
      {message}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    padding: '0.875rem 1.125rem',
    backgroundColor: 'var(--color-warning-bg)',
    border: '1px solid var(--color-warning-border)',
    borderRadius: 'var(--radius-sm)',
    color: '#92400e',
    marginBottom: '1.25rem',
    fontSize: '0.875rem',
  },
};
