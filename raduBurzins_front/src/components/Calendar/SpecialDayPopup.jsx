import React from 'react';
import BasePopup from '../BasePopoup';

function SpecialDayPopup({ specialDay, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasDescription = Boolean(specialDay.description);
  const isPublic = specialDay.is_public !== false;
  const repeatLabel = specialDay.repeats ? 'Atkārtojas katru gadu' : 'Vienreizējs notikums';

  return (
    <BasePopup title={specialDay.title} onClose={onClose} width="720px">
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-medium-purple via-light-purple to-[#8a6cff] p-5 text-off-white shadow-xl sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
              Notikuma detaļas
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPublic ? 'bg-emerald-400/20 text-emerald-50' : 'bg-amber-400/20 text-amber-50'}`}>
              {isPublic ? 'Publisks' : 'Privāts'}
            </span>
            {specialDay.repeats && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                Atkārtojas
              </span>
            )}
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-off-white/90 sm:text-base">
            {hasDescription ? specialDay.description : 'Nav apraksta.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-dark-purple shadow-sm">
              📅 {formatDate(specialDay.date)}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-off-white">
              {repeatLabel}
            </span>
            {specialDay.event_time && (
              <span className="rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-off-white">
                🕒 {specialDay.event_time}
              </span>
            )}
            {specialDay.location && (
              <span className="rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-off-white">
                📍 {specialDay.location}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Kas var redzēt</div>
            <div className="mt-2 text-sm font-semibold text-dark-purple">
              {isPublic ? 'Visi lietotāji' : 'Tikai izvēlētie cilvēki'}
            </div>
            <div className="mt-2 text-sm text-muted">
              Šis notikums ir sakārtots uzreiz redzamai, īsai pārskatāmībai.
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Statuss</div>
            <div className="mt-2 text-sm font-semibold text-dark-purple">
              {specialDay.repeats ? 'Gada notikums' : 'Viena diena'}
            </div>
            <div className="mt-2 text-sm text-muted">
              Atver dienas skatu, lai šo notikumu atrastu ātrāk nākamreiz.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            Aizvērt
          </button>
        </div>
      </div>
    </BasePopup>
  );
}

export default SpecialDayPopup;
