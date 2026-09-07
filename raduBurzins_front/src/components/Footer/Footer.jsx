import React from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Kalendārs', to: '/calendar' },
  { label: 'Notikumi', to: '/my-events' },
  { label: 'Profils', to: '/profile' },
  { label: 'Ziemassvētki', to: '/christmas' },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="section-shell py-8 sm:py-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-soft sm:p-6">
            <div className="eyebrow">
              <span>✦</span>
              <span>Radu Burziņš</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">
              Digitāla ģimenes vieta kalendāram, notikumiem un svarīgām lietām, ko gribas turēt kopā vienā, skaistā vietā.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-bold text-dark-purple shadow-sm transition hover:-translate-y-0.5 hover:shadow-md no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-soft sm:p-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-medium-purple">
              Noderīgi
            </div>
            <div className="mt-4 space-y-3">
              <Link to="/info" className="block text-sm font-semibold text-dark-purple no-underline transition hover:text-medium-purple">
                Par mājaslapu
              </Link>
              <Link to="/terms" className="block text-sm font-semibold text-dark-purple no-underline transition hover:text-medium-purple">
                Lietošanas noteikumi
              </Link>
              <Link to="/calendar" className="block text-sm font-semibold text-dark-purple no-underline transition hover:text-medium-purple">
                Atvērt kalendāru
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-dark-purple via-medium-purple to-[#8a6cff] p-5 text-off-white shadow-xl sm:p-6">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-off-white/75">
              Kontakti
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-off-white/90">
              <p>
                E-pasts
                <br />
                <a href="mailto:kristskarlisgrundmanis@gmail.com" className="font-semibold text-off-white no-underline">
                  kristskarlisgrundmanis@gmail.com
                </a>
              </p>
              <p>
                Tālrunis
                <br />
                <a href="tel:+37125671299" className="font-semibold text-off-white no-underline">
                  +371 25671299
                </a>
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-off-white/90">
              Izstrādāja
              <div className="mt-1 font-black text-off-white">Krists Kārlis Grundmanis</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/80 bg-white/85 px-4 py-4 text-sm text-muted shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {currentYear} Radu Burziņš. Visas tiesības aizsargātas.</p>
          <p className="font-semibold text-dark-purple">Svarīgais vienuviet · skaisti · ātri · pārskatāmi</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
