import React from 'react';
import BasePopup from '../BasePopoup';

const rules = [
  {
    title: '1. Profils un piekļuve',
    text: 'Lietotājs apņemas sniegt patiesu informāciju un rūpēties par sava konta drošību.',
  },
  {
    title: '2. Lietošanas mērķis',
    text: 'Platforma paredzēta ģimenes notikumiem, kalendāram un svarīgām dienām.',
  },
  {
    title: '3. Uzvedība un saturs',
    text: 'Nav atļauts publicēt aizskarošu, kaitīgu vai nelikumīgu saturu.',
  },
  {
    title: '4. Dati un privātums',
    text: 'Dati tiek lietoti tikai mājaslapas darbībai, notikumu pārvaldībai un administrēšanai.',
  },
  {
    title: '5. Drošība',
    text: 'Administrācijai ir tiesības ierobežot piekļuvi vai dzēst saturu, ja noteikumi tiek pārkāpti.',
  },
  {
    title: '6. Lietotāja tiesības',
    text: 'Lietotājs var vērsties pie administratora ar jautājumiem par saviem datiem vai piekļuvi.',
  },
];

function RulesPopup({ onClose }) {
  return (
    <BasePopup title="Mājaslapas vispārīgie noteikumi" onClose={onClose} width="760px">
      <div className="space-y-5">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-dark-purple via-medium-purple to-[#8a6cff] p-5 text-off-white shadow-xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-off-white/75">
            Noteikumi
          </div>
          <h2 className="mt-2 text-2xl font-black">Īsumā — ko drīkst un ko nē</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-off-white/90">
            Šie noteikumi palīdz uzturēt vidi drošu, saprotamu un sakārtotu visiem lietotājiem.
          </p>
        </div>

        <div className="grid gap-3">
          {rules.map((rule) => (
            <section
              key={rule.title}
              className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-soft"
            >
              <h3 className="text-base font-black text-dark-purple">{rule.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{rule.text}</p>
            </section>
          ))}
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/85 p-4 text-sm leading-7 text-muted shadow-soft">
          <p>
            Ja rodas jautājumi par noteikumiem, piekļuvi vai datu apstrādi, sazinies ar administratoru.
          </p>
        </div>
      </div>
    </BasePopup>
  );
}

export default RulesPopup;
