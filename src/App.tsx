import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { LoginPage } from "./LoginPage";
import { HomePage } from "./HomePage";
import { AdminPage } from "./AdminPage";
import { Toaster } from "sonner";

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <div className="flex items-center justify-center p-8">
              <div className="w-full max-w-md mx-auto">
                <LoginPage />
              </div>
            </div>
          } />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Toaster
        position="top-center"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={4000}
        toastOptions={{
          style: {
            direction: 'rtl',
            textAlign: 'right',
          },
          className: 'toast-rtl',
        }}
      />
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

