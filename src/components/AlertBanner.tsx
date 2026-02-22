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
    padding: '0.75rem 1rem',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 'var(--radius)',
    color: '#92400e',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
};
