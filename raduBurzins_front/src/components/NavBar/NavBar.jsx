import React, { useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../services/api';

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

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "";

  const navLinks = [
    { to: '/calendar', label: 'Kalendārs', icon: '📅' },
    { to: '/my-events', label: 'Notikumi', icon: '🗂️' },
    { to: '/albums', label: 'Albumi', icon: '📚' },
    { to: '/family-chat', label: 'Ģimenes čats', icon: '💬' },
    { to: '/christmas', label: 'Svētki', icon: '🎄' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-[#eadfd8] bg-[#fffaf7]/95 shadow-[0_12px_40px_rgba(36,23,38,0.09)] backdrop-blur-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r lg:bg-[#fffaf7]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-medium-purple/40 to-transparent lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-px lg:bg-gradient-to-b" />
      <div className="section-shell lg:flex lg:h-full lg:flex-col lg:px-5">
        <div className="flex items-center justify-between gap-3 py-3 sm:py-4 lg:block lg:py-7">
          <Link to="/RegWelcome" className="group flex items-center gap-3 rounded-lg border border-white/80 bg-white/75 p-2.5 no-underline transition hover:shadow-md sm:p-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl opacity-60 blur-sm transition" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-dark-purple via-medium-purple to-[#8a6cff] text-off-white font-black shadow-lg">
                RB
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="mb-0.5 text-sm font-black uppercase text-medium-purple">
                Radu Burziņš
              </p>
              <p className="text-xs font-medium text-muted">Kalendārs • Notikumi • Ģimene</p>
            </div>
          </Link>

          <div className="hidden lg:block lg:pt-8">
            <div className="mb-3 px-2 text-[10px] font-bold uppercase text-[#a18f86]">Navigācija</div>
            <div className="grid gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `group flex items-center gap-3 rounded-lg border px-3.5 py-3 text-sm font-bold no-underline transition-all duration-200 ${isActive ? "border-[#d8c8e8] bg-[#eee7f5] text-[#382d5b] shadow-sm" : "border-transparent bg-transparent text-dark-purple hover:translate-x-1 hover:border-white/80 hover:bg-white/80 hover:shadow-sm"}`}
              >
                <span className="text-base transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:mt-auto">
            <div className="hidden items-center gap-2 sm:flex lg:mb-6 lg:flex-col lg:items-stretch lg:rounded-lg lg:border lg:border-white/90 lg:bg-white/75 lg:p-3">
              {user ? (
                <>
                  <Link to="/profile" className="hidden items-center gap-3 rounded-lg bg-[#f4eee9] px-3 py-3 text-left no-underline transition hover:bg-[#eee7f5] lg:flex">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-dark-purple to-medium-purple text-sm font-black text-white">
                      {user.avatar_path ? (
                        <img
                          src={`${api.defaults.baseURL}/storage/${user.avatar_path}`}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-dark-purple">{user.first_name} {user.last_name}</div>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-3 text-sm font-bold text-off-white shadow-md transition hover:translate-x-1 hover:shadow-lg lg:w-full"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/80 bg-white/90 text-lg font-bold text-dark-purple shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:hidden"
              aria-label={showMobileMenu ? "Aizvērt izvēlni" : "Atvērt izvēlni"}
              aria-expanded={showMobileMenu}
              aria-controls="mobile-navigation"
            >
              {showMobileMenu ? "×" : "☰"}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div id="mobile-navigation" className="pb-4 lg:hidden">
            <div className="rounded-lg border border-white/80 bg-white/92 p-3 shadow-[0_18px_40px_rgba(36,23,38,0.12)]">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className={({ isActive }) => `flex items-center gap-3 rounded-lg border px-3.5 py-3 font-semibold no-underline transition ${isActive ? "border-[#d8c8e8] bg-[#eee7f5] text-[#382d5b]" : "border-white/80 bg-white text-dark-purple hover:bg-warm-beige/40"}`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="my-3 h-px bg-warm-beige/80" />

              <div className="grid gap-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg border border-white/80 bg-white px-3.5 py-3 font-semibold text-dark-purple no-underline transition hover:bg-warm-beige/40"
                    >
                      <span className="text-lg">👤</span>
                      <span>Profils</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-lg bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-3 text-left font-bold text-off-white shadow-md transition hover:shadow-lg"
                    >
                      Izrakstīties
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg border border-white/80 bg-white px-3.5 py-3 font-semibold text-dark-purple no-underline transition hover:bg-warm-beige/40"
                    >
                      <span className="text-lg">🔑</span>
                      <span>Pieslēgties</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="rounded-lg bg-gradient-to-r from-medium-purple to-[#8a6cff] px-4 py-3 text-center font-bold text-off-white shadow-md transition hover:shadow-lg no-underline"
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
