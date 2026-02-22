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
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    color: '#856404',
    marginBottom: '1rem',
  },
};
