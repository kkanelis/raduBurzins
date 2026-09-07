import React from 'react';
import BasePopup from '../BasePopoup';

const sections = [
  {
    title: '1. Lietošanas noteikumi',
    text: 'Jūs piekrītat izmantot šo mājaslapu likumīgiem, personīgiem un paredzētajiem mērķiem.',
  },
  {
    title: '2. Lietotāja pienākumi',
    text: 'Jūs esat atbildīgs par sava konta drošību, paroles konfidencialitāti un ievadīto datu patiesumu.',
  },
  {
    title: '3. Personas datu apstrāde',
    text: 'Dati tiek vākti tikai tik daudz, cik nepieciešams platformas darbībai, profila pārvaldībai un notikumiem.',
  },
  {
    title: '4. GDPR un privātums',
    text: 'Personas dati tiek apstrādāti saskaņā ar VDAR/GDPR principiem un netiek nodoti trešajām personām bez pamata.',
  },
  {
    title: '5. Izmaiņas noteikumos',
    text: 'Noteikumi var tikt atjaunināti, ja mainās tehniskās, juridiskās vai organizatoriskās prasības.',
  },
];

function TermsPopup({ onClose }) {
  return (
    <BasePopup title="Lietošanas noteikumi un privātuma politika" onClose={onClose} width="780px">
      <div className="space-y-5">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-dark-purple via-medium-purple to-[#8a6cff] p-5 text-off-white shadow-xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-off-white/75">
            Privātums un lietošana
          </div>
          <h2 className="mt-2 text-2xl font-black">Noteikumi īsi un saprotami</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-off-white/90">
            Šeit ir apkopots, kā lietot mājaslapu un kā tiek apstrādāti dati.
          </p>
        </div>

        <div className="grid gap-3">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-soft"
            >
              <h3 className="text-base font-black text-dark-purple">{section.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{section.text}</p>
            </section>
          ))}
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/85 p-4 text-sm leading-7 text-muted shadow-soft">
          <p>
            Ja jums ir jautājumi par piekļuvi, datiem vai noteikumiem, sazinieties ar administratoru.
          </p>
        </div>
      </div>
    </BasePopup>
  );
}

export default TermsPopup;
