import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

interface NavbarProps {
  onStartCooking?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStartCooking }) => {
  const { currentUser, isVerified, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 no-print">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-fire-burner"></i>
          </div>

          <span className="font-serif text-2xl font-bold text-slate-900">
            Aj Kya Pakayen?
          </span>
        </Link>

        {!loading && (
          <div className="flex items-center gap-2 sm:gap-3">

            {currentUser ? (
              <>
                {/* Email Verification */}
                {!isVerified && (
                  <Link
                    to="/verify-email"
                    className="hidden sm:inline-flex text-amber-700 bg-amber-100 px-3 py-2 rounded-full text-sm font-semibold"
                  >
                    Email verify karein
                  </Link>
                )}

                {/* Start Cooking */}
                {isHome && onStartCooking && (
                  <button
                    onClick={onStartCooking}
                    className="hidden md:block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-100"
                  >
                    Start Cooking
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>

                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-3 py-2.5 rounded-full transition-all"
                  >
                    {/* User Icon */}
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <i className="fa-solid fa-user text-sm"></i>
                    </div>

                    {/* Email */}
                    <span className="hidden sm:block text-sm text-slate-600 max-w-[180px] truncate">
                      {currentUser.email}
                    </span>

                    {/* Arrow */}
                    <i
                      className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">

                      {/* User Info */}
                      <div className="px-4 py-4 border-b border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">
                          Signed in as
                        </p>

                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      {/* History */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/history");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Recipe History
                          </p>
                          <p className="text-xs text-slate-400">
                            View your generated recipes
                          </p>
                        </div>
                      </button>

                      {/* Logout */}
                      <div className="border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                            <i className="fa-solid fa-right-from-bracket"></i>
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Logout
                            </p>
                            <p className="text-xs text-rose-400">
                              Sign out of your account
                            </p>
                          </div>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="text-slate-700 px-4 py-2.5 rounded-full font-semibold hover:bg-slate-50"
                >
                  Login
                </Link>

                {/* Sign Up */}
                <Link
                  to="/signup"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-100"
                >
                  Sign up
                </Link>
              </>
            )}

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;