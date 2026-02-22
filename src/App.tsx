import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { DashboardPage } from './pages/DashboardPage';
import { NewTransactionPage } from './pages/NewTransactionPage';
import { SetupPage } from './pages/SetupPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountsPage } from './pages/AccountsPage';
import { AccountTransactionsPage } from './pages/AccountTransactionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { getAccountId } from './storage/accountStorage';

function RequireAccountId({ children }: { children: React.ReactNode }) {
  const accountId = getAccountId();
  if (!accountId) return <Navigate to="/accounts" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <AuthGuard>
                <RequireAccountId>
                  <DashboardPage />
                </RequireAccountId>
              </AuthGuard>
            }
          />
          <Route
            path="accounts"
            element={
              <AuthGuard>
                <AccountsPage />
              </AuthGuard>
            }
          />
          <Route
            path="accounts/:accountId"
            element={
              <AuthGuard>
                <AccountTransactionsPage />
              </AuthGuard>
            }
          />
          <Route
            path="transactions/new"
            element={
              <AuthGuard>
                <RequireAccountId>
                  <NewTransactionPage />
                </RequireAccountId>
              </AuthGuard>
            }
          />
          <Route
            path="setup"
            element={
              <AuthGuard>
                <SetupPage />
              </AuthGuard>
            }
          />
          <Route
            path="profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
