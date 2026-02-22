import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { NewTransactionPage } from './pages/NewTransactionPage';
import { SetupPage } from './pages/SetupPage';
import { getAccountId } from './storage/accountStorage';

function RequireAccountId({ children }: { children: React.ReactNode }) {
  const accountId = getAccountId();
  if (!accountId) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RequireAccountId><DashboardPage /></RequireAccountId>} />
          <Route path="transactions/new" element={<RequireAccountId><NewTransactionPage /></RequireAccountId>} />
          <Route path="setup" element={<SetupPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
