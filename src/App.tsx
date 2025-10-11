import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Platform } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./features/auth";
import Toast from "react-native-toast-message";
import { toastConfig } from "./lib/toast";
import { ErrorBoundary, PageLoader } from "./components/ui";

// Lazy load route components for code splitting
const HomePage = lazy(() => import("./pages/HomePage").then(module => ({ default: module.HomePage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then(module => ({ default: module.LoginPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then(module => ({ default: module.AdminPage })));

function AppContent() {
  const location = useLocation();
  const userProfile = useQuery(api.auth.getUserProfile);

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-600 shadow-sm pl-4 pr-4">
        <h2 className="text-xl font-semibold text-accent">12 MVP</h2>
        <div className="flex gap-2">
          {userProfile?.isAdmin && location.pathname !== '/admin' && (
            <a 
              href="/admin"
              className="pl-3 pr-3 py-2 rounded bg-background-light text-accent border border-gray-500 font-semibold hover:bg-accent hover:text-white transition-colors shadow-sm hover:shadow"
            >
              پنل مدیریت
            </a>
          )}
          {location.pathname === '/admin' && (
            <a 
              href="/"
              className="pl-3 pr-3 py-2 rounded bg-background-light text-accent border border-gray-500 font-semibold hover:bg-accent hover:text-white transition-colors shadow-sm hover:shadow"
            >
              بازگشت
            </a>
          )}
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader message="در حال بارگذاری صفحه..." />}>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              } />
              <Route path="/login" element={
                <ErrorBoundary>
                  <div className="flex items-center justify-center p-8">
                    <div className="w-full max-w-md mx-auto">
                      <LoginPage />
                    </div>
                  </div>
                </ErrorBoundary>
              } />
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminPage />
                </ErrorBoundary>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {Platform.OS !== 'web' && <Toast config={toastConfig} />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

