import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Lietošanas noteikumi',
    text: 'Jūs piekrītat izmantot šo mājaslapu likumīgiem, personīgiem un paredzētajiem mērķiem.',
  },
  {
    title: 'Lietotāja pienākumi',
    text: 'Jūs esat atbildīgs par sava konta drošību, paroles konfidencialitāti un ievadīto datu patiesumu.',
  },
  {
    title: 'Personas datu apstrāde',
    text: 'Dati tiek vākti tikai tik daudz, cik nepieciešams platformas darbībai, profila pārvaldībai un notikumiem.',
  },
  {
    title: 'GDPR un privātums',
    text: 'Personas dati tiek apstrādāti saskaņā ar VDAR/GDPR principiem un netiek nodoti trešajām personām bez pamata.',
  },
  {
    title: 'Izmaiņas noteikumos',
    text: 'Noteikumi var tikt atjaunināti, ja mainās tehniskās, juridiskās vai organizatoriskās prasības.',
  },
];

function Terms() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_20px_60px_rgba(58,39,99,0.12)] backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <div className="eyebrow">
                  <span>✦</span>
                  <span>Lietošanas noteikumi</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-dark-purple sm:text-5xl lg:text-6xl">
                  Noteikumi un
                  <span className="block bg-gradient-to-r from-medium-purple via-light-purple to-[#12b5a6] bg-clip-text text-transparent">
                    privātuma politika
                  </span>
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Šeit ir īss un saprotams kopsavilkums par to, kā lietot mājaslapu un kā tiek apstrādāti dati.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link to="/calendar" className="btn-primary px-6 py-3 text-sm sm:text-base no-underline">
                    Atpakaļ uz kalendāru
                  </Link>
                  <Link to="/info" className="btn-ghost px-6 py-3 text-sm sm:text-base no-underline">
                    Par mājaslapu
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  { label: 'Mērķis', value: 'droša lietošana' },
                  { label: 'Dati', value: 'tikai vajadzīgais' },
                  { label: 'Atjauninājumi', value: 'pakāpeniski' },
                  { label: 'Atbilstība', value: 'GDPR' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-soft"
                  >
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                      {stat.label}
                    </div>
                    <div className="mt-2 text-lg font-black text-dark-purple">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6"
              >
                <h2 className="text-lg font-black text-dark-purple">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{section.text}</p>
              </div>
            ))}
          </section>

          <section className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6">
            <div className="eyebrow">
              <span>✦</span>
              <span>Ko atcerēties</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                'Lieto mājaslapu tikai paredzētajiem mērķiem',
                'Sargi sava konta drošību un piekļuves datus',
                'Ievadi tikai patiesu un aktuālu informāciju',
                'Sazinies ar administratoru, ja rodas jautājumi',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-medium-purple/10 px-4 py-3 text-sm font-semibold text-dark-purple"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
