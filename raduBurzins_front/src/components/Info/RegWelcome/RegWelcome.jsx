import React from 'react';
import { Link } from 'react-router-dom';

const actions = [
  {
    title: 'Sākt no kalendāra',
    text: 'Apskati šodienu, tuvākos datumus un ģimenes notikumus.',
    icon: '📅',
    to: '/calendar',
    color: 'from-medium-purple to-[#8a6cff]',
  },
  {
    title: 'Izveidot kaut ko jaunu',
    text: 'Pievieno notikumu, ideju vai jebko, ko gribi paturēt redzamā vietā.',
    icon: '➕',
    to: '/my-events',
    color: 'from-[#12b5a6] to-emerald-500',
  },
  {
    title: 'Veidot albumus',
    text: 'Sakārto foto no notikumiem, svētkiem un ikdienas mirkļiem vienuviet.',
    icon: '📚',
    to: '/albums',
    color: 'from-[#7c5cff] to-[#4f8cff]',
  },
  {
    title: 'Atvērt savu telpu',
    text: 'Pārvaldi profilus, iestatījumus un visu, kas pieder tev.',
    icon: '👤',
    to: '/profile',
    color: 'from-[#f28e6b] to-[#ffb37a]',
  },
  // {
  //   title: 'Svētku režīms',
  //   text: 'Ieej ziemas sadaļā un pieslēdz svētku sajūtu.',
  //   icon: '🎄',
  //   to: '/christmas',
  //   color: 'from-[#7c5cff] to-[#4f8cff]',
  // },
  {
    title: 'Tavi notikumi',
    text: 'Skaties, labo un organizē visu vienuviet.',
    icon: '🗂️',
    to: '/my-events',
    color: 'from-[#ff9f68] to-[#ffcf6b]',
  },
];

const spotlightItems = [
  'Šodienas kopsavilkums',
  'Nākamie svarīgie datumi',
  'Ātrās darbības',
  'Svarīgās saites',
];

function RegWelcome() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />

      <div className="section-shell relative py-6 sm:py-10 lg:py-16">
        <div className="space-y-6 sm:space-y-8">
          <section className="grid gap-5 rounded-[2rem] border border-white/70 bg-white/88 p-4 shadow-[0_20px_60px_rgba(58,39,99,0.12)] backdrop-blur-xl sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:p-8">
            <div className="space-y-5">
              <div className="eyebrow">
                <span>✦</span>
                <span>Radu Burziņš</span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-dark-purple sm:text-5xl lg:text-6xl">
                  Ko gribi darīt
                  <span className="block bg-gradient-to-r from-medium-purple via-light-purple to-[#12b5a6] bg-clip-text text-transparent">
                    tieši tagad?
                  </span>
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Šī sākumlapa dod tev izvēli - nevis tikai vienu ceļu. Atver kalendāru, veido notikumus,
                  skaties profilu.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/calendar" className="btn-primary px-6 py-3 text-sm sm:text-base no-underline">
                  Atvērt kalendāru
                </Link>
                <Link to="/my-events" className="btn-ghost px-6 py-3 text-sm sm:text-base no-underline">
                  Izveidot notikumu
                </Link>
                <Link to="/albums" className="btn-ghost px-6 py-3 text-sm sm:text-base no-underline">
                  Albumi
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:grid-rows-2">
              {actions.map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group flex min-h-[148px] flex-col justify-between rounded-[1.5rem] border border-white/80 bg-white p-4 no-underline shadow-soft transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[162px]"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} text-2xl shadow-lg`}>
                    {action.icon}
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-black text-dark-purple">{action.title}</h2>
                      <span className="text-sm font-bold text-medium-purple transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted">{action.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RegWelcome;
