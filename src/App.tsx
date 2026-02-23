import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { DashboardPage } from './pages/DashboardPage';
import { NewTransactionPage } from './pages/NewTransactionPage';
import { SetupPage } from './pages/SetupPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ImportTransactionsPage } from './pages/ImportTransactionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PeriodConfigPage } from './pages/PeriodConfigPage';
import { CategoriesPage } from './pages/CategoriesPage';
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            path="accounts/:accountId/transactions"
            element={
              <AuthGuard>
                <TransactionsPage />
              </AuthGuard>
            }
          />
          <Route
            path="accounts/:accountId/import"
            element={
              <AuthGuard>
                <ImportTransactionsPage />
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
          <Route
            path="period-config"
            element={
              <AuthGuard>
                <RequireAccountId>
                  <PeriodConfigPage />
                </RequireAccountId>
              </AuthGuard>
            }
          />
          <Route
            path="categories"
            element={
              <AuthGuard>
                <CategoriesPage />
              </AuthGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
