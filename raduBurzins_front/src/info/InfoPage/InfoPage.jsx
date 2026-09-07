import React from 'react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Kalendārs',
    text: 'Vārda dienas, dzimšanas dienas un īpašie notikumi vienuviet.',
    icon: '📅',
  },
  {
    title: 'Notikumi',
    text: 'Pievieno un pārvaldi ģimenes pasākumus ātri un pārskatāmi.',
    icon: '🗂️',
  },
  {
    title: 'Profils',
    text: 'Atjauno savu profilu un turi svarīgo informāciju kārtībā.',
    icon: '👤',
  },
];

const values = [
  'Viss svarīgais vienuviet',
  'Vienkārši lietojama struktūra',
  'Pielāgota ģimenes vajadzībām',
  'Pastāvīgi tiek papildināta',
];

function InfoPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_20px_60px_rgba(58,39,99,0.12)] backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-5">
                <div className="eyebrow">
                  <span>✦</span>
                  <span>Par mājaslapu</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-dark-purple sm:text-5xl lg:text-6xl">
                  Radu Burziņš
                  <span className="block bg-gradient-to-r from-medium-purple via-light-purple to-[#12b5a6] bg-clip-text text-transparent">
                    digitālā ģimenes vieta
                  </span>
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Šī mājaslapa ir veidota, lai ģimenes notikumi, kalendārs un svarīgā informācija būtu vienā,
                  skaistā un ērtā vietā.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <h2 className="mt-3 text-base font-black text-dark-purple">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm sm:p-6">
              <div className="eyebrow">
                <span>✦</span>
                <span>Par ideju</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                Šis projekts sākās ar to kad man (Kristam Kārlim Grundmanim) radās ideja par kopīgu kalendāru mūsu ģimenei,
                lai vieglāk būtu pārskatīti visu kas visiem tuvojas protams ar iespēju pievienot arī svarīgus notikumus,
                vai arī kādus baļukus vai tak ne? Tad nu es arī sāku veidot savu mazo projektu kas beigās izvērtās par nu bišķīt sarežģītāku
                nekā sākumā biju iecerējis, protams viss arī ieildzinājās ilgāk nekā biju plānojis, bet nu tas tikai tāpēc lai pēctam 
                būtu foršāk un lai viss būtu tā kā es un tu gribam, jo ja jau daru tad daru kārtīgi, vai ne?
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Bet veidojot šo mājaslapu es sapratu, ka varētu būt forši, ja šī vietne būtu ne tikai kalendārs, bet gan vieta,
                kur varētu daudz ko interesantu izdarīt lai tikai nepaliktu par vienkāršu kalendāru, tāpēc arī tika/tiks 
                pievienotas jaunas lietas kā piemēram ideju dēlis, kur varētu pierakstīt dažādas idejas, vai foto albūmu
                kur varētu ielikt dažādas bildes kurās ir redzami dažādi notikumi kuri jau ir notikuši, vai arī kādu citu funkciju kas varētu
                būt noderīga mums un mūsu ģimenei, jo kāpēc gan ne? Ja jau ir doma un iespēja, tad kāpēc gan neizmantot to, vai ne?
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Jaunās funkcijas tiks pievienotas pakāpeniski, jo nevajag jau visu uzreiz, ja nē viss būs un nekā jauna? Tas izklausas garlaicīgi,
                tāpēc es gribu pievienot jaunas lietas pakāpeniski, lai būtu interesanti un lai vienmēr būtu kaut kas jauns ko izmēģināt jo jaunas 
                lietas ir foršākas par vecām lietām, vai ne?
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
