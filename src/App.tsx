import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { AdminGuard } from '@/guards/AdminGuard';
import { HolderGuard } from '@/guards/HolderGuard';
import { Toaster } from 'sonner';
import { useAppStore } from '@/store/appStore';

// Layouts
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { HolderLayout } from '@/components/layouts/HolderLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminHoldersPage from '@/pages/admin/AdminHoldersPage';
import AdminAssetsPage from '@/pages/admin/AdminAssetsPage';
import AdminActiveAssetsPage from '@/pages/admin/AdminActiveAssetsPage';
import AdminApprovalsPage from '@/pages/admin/AdminApprovalsPage';
import AdminHistoryPage from '@/pages/admin/AdminHistoryPage';
import AdminCommissionsPage from '@/pages/admin/AdminCommissionsPage';

// Holder pages
import HolderDashboardPage from '@/pages/holder/HolderDashboardPage';
import HolderPortfolioPage from '@/pages/holder/HolderPortfolioPage';
import HolderTransactionsPage from '@/pages/holder/HolderTransactionsPage';
import HolderHistoryPage from '@/pages/holder/HolderHistoryPage';

const App: React.FC = () => {
  const { loadTokens, updatePrices } = useAppStore();

  useEffect(() => {
    loadTokens();
    updatePrices();

    const priceInterval = setInterval(() => {
      updatePrices();
    }, 1000);

    return () => clearInterval(priceInterval);
  }, [loadTokens, updatePrices]);

  return (
    <ThemeProvider>
      <I18nProvider>
        <Router>
          <AuthProvider>
            <RouteGuard>
              <IntersectObserver />

              <Routes>
                {/* PUBLIC */}
                <Route path="/login" element={<LoginPage />} />

                {/* ADMIN */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="holders" element={<AdminHoldersPage />} />
                  <Route path="assets" element={<AdminAssetsPage />} />
                  <Route path="active-assets" element={<AdminActiveAssetsPage />} />
                  <Route path="approvals" element={<AdminApprovalsPage />} />
                  <Route path="history" element={<AdminHistoryPage />} />
                  <Route path="commissions" element={<AdminCommissionsPage />} />
                </Route>

                {/* HOLDER */}
                <Route
                  path="/holder"
                  element={
                    <HolderGuard>
                      <HolderLayout />
                    </HolderGuard>
                  }
                >
                  <Route path="dashboard" element={<HolderDashboardPage />} />
                  <Route path="portfolio" element={<HolderPortfolioPage />} />
                  <Route path="transactions" element={<HolderTransactionsPage />} />
                  <Route path="history" element={<HolderHistoryPage />} />
                </Route>

                {/* FALLBACK */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              <Toaster position="top-right" richColors />
            </RouteGuard>
          </AuthProvider>
        </Router>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;