import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../src/context/AuthContext";

const VerifyEmailPage: React.FC = () => {
  const {
    currentUser,
    isVerified,
    loading,
    resendVerification,
    refreshVerification,
  } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!currentUser || isVerified) return;

    const interval = window.setInterval(async () => {
      try {
        const verified = await refreshVerification();
        if (verified) navigate("/");
      } catch {
        // keep waiting; user can also tap "I have verified"
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [currentUser, isVerified, navigate, refreshVerification]);

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isVerified) return <Navigate to="/" replace />;

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await resendVerification();
      setMessage("Verification email dobara bhej di gayi hai. Inbox check karein.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email send nahi ho saki.");
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    setError(null);
    setBusy(true);
    try {
      const verified = await refreshVerification();
      if (verified) {
        navigate("/");
      } else {
        setMessage("Abhi verified nahi hai. Email mein link pe click karein, phir yahan check karein.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check nahi ho saka.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 bg-pattern -z-10"></div>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/5 border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-envelope-circle-check text-2xl"></i>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-3">
            Email verify karein
          </h1>
          <p className="text-slate-500 mb-2">
            Humne verification link bheji hai:
          </p>
          <p className="font-semibold text-slate-800 mb-6 break-all">
            {currentUser.email}
          </p>
          <p className="text-slate-500 mb-8">
            Link pe click karein, phir wapas aake recipes generate kar sakte
            hain. Spam folder bhi check karein.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm">
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={busy}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white py-3.5 rounded-2xl font-bold"
            >
              I have verified
            </button>
            <button
              onClick={handleResend}
              disabled={busy}
              className="flex-1 border border-slate-200 hover:bg-slate-50 py-3.5 rounded-2xl font-bold"
            >
              Resend email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
