import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
    navigate('/login');
  };

  const closeMenu = () => setShowMobileMenu(false);

  const navLinks = [
    { to: '/calendar', label: 'Kalendārs', icon: '📅' },
    { to: '/my-events', label: 'Notikumi', icon: '🗂️' },
    { to: '/albums', label: 'Albumi', icon: '📚' },
    { to: '/family-chat', label: 'Ģimenes čats', icon: '💬' },
    // { to: '/christmas', label: 'Svētki', icon: '🎄' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(36,23,38,0.09)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-medium-purple/40 to-transparent" />
      <div className="section-shell">
        <div className="flex items-center justify-between gap-3 py-3 sm:py-4 lg:py-4">
          <Link to="/RegWelcome" className="group flex items-center gap-3 shrink-0 no-underline">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl opacity-60 blur-sm transition" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-dark-purple via-medium-purple to-[#8a6cff] text-off-white font-black shadow-lg">
                RB
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-medium-purple mb-0.5">
                Radu Burziņš
              </p>
              <p className="text-xs font-medium text-muted">Kalendārs • Notikumi • Ģimene</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2.5 text-sm font-extrabold text-dark-purple shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-medium-purple hover:bg-white hover:shadow-md no-underline"
              >
                <span className="text-base transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-bold text-dark-purple shadow-sm transition hover:-translate-y-0.5 hover:shadow-md no-underline"
                  >
                    Profils
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-full bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-2 text-sm font-bold text-off-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Izrakstīties
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-bold text-dark-purple shadow-sm transition hover:-translate-y-0.5 hover:shadow-md no-underline"
                  >
                    Pieslēgties
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-2 text-sm font-bold text-off-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg no-underline"
                  >
                    Reģistrēties
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu((value) => !value)}
              className="sm:hidden inline-flex items-center justify-center rounded-full border border-white/80 bg-white/90 px-4 py-3 text-sm font-black text-dark-purple shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              aria-label="Atvērt izvēlni"
              aria-expanded={showMobileMenu}
            >
              ☰
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="sm:hidden pb-4">
            <div className="rounded-[1.75rem] border border-white/80 bg-white/92 p-3 shadow-[0_18px_40px_rgba(36,23,38,0.12)]">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 font-semibold text-dark-purple no-underline transition hover:bg-warm-beige/40"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="my-3 h-px bg-warm-beige/80" />

              <div className="grid gap-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 font-semibold text-dark-purple no-underline transition hover:bg-warm-beige/40"
                    >
                      <span className="text-lg">👤</span>
                      <span>Profils</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-2xl bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-3 font-bold text-off-white shadow-md transition hover:shadow-lg"
                    >
                      Izrakstīties
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 font-semibold text-dark-purple no-underline transition hover:bg-warm-beige/40"
                    >
                      <span className="text-lg">🔑</span>
                      <span>Pieslēgties</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="rounded-2xl bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-3 font-bold text-off-white text-center shadow-md transition hover:shadow-lg no-underline"
                    >
                      Reģistrēties
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
