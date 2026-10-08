import BasePopup from '../BasePopoup';
import { formatDisplayDate, uniqueById, uniqueLabels } from './calendarUtils';

function CalendarDayDetails({ day, onClose }) {
  const names = uniqueLabels(day.names || [], (name) => name);
  const birthdays = uniqueById(day.birthdays || []);
  const surnames = uniqueLabels(day.surnames || [], (name) => name);
  const specials = day.specials || [];

  return (
    <BasePopup title={formatDisplayDate(day.date)} onClose={onClose} width="720px">
      <div className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="min-w-0 rounded-lg border border-[#d8e0fb] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#5372c9]" />
              <h4 className="text-xs font-bold uppercase text-muted">Vārda dienas</h4>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {names.length > 0 ? (
                names.map((name, index) => (
                  <span key={`${name}-${index}`} className="rounded-md bg-[#f0f3ff] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                    {name}
                  </span>
                ))
              ) : (
                <div className="text-sm text-muted">Nav vārda dienu.</div>
              )}
            </div>
          </section>
          {birthdays.length > 0 && (
            <section className="min-w-0 rounded-lg border border-[#cfe0d0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#54805a]" />
                <h4 className="text-xs font-bold uppercase text-muted">Dzimšanas dienas</h4>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {birthdays.map((user) => (
                  <span key={user.id} className="rounded-md bg-[#f1f7f0] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                    {user.first_name} {user.last_name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="min-w-0 rounded-lg border border-[#efdfc0] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#b77a23]" />
              <h4 className="text-xs font-bold uppercase text-muted">Uzvārda dienas</h4>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {surnames.length > 0 ? (
                surnames.map((name, index) => (
                  <span key={`${name}-${index}`} className="rounded-md bg-[#fff7e9] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                    {name}
                  </span>
                ))
              ) : (
                <div className="text-sm text-muted">Nav uzvārda dienu.</div>
              )}
            </div>
          </section>

          {specials.length > 0 && (
            <section className="min-w-0 rounded-lg border border-[#efcfbd] bg-[#fffaf7] p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#df8058]" />
                <h4 className="text-xs font-bold uppercase text-muted">Pasākumi</h4>
              </div>
              <div className="mt-3 space-y-2">
                {specials.map((event) => {
                  const displayDate = event.repeats ? day.date : event.date;
                  return (
                    <article key={event.id} className="rounded-md border border-[#f0ddcf] bg-white p-3 shadow-sm">
                      <h5 className="break-words text-sm font-extrabold text-dark-purple">{event.title}</h5>
                      {event.description && (
                        <p className="mt-1.5 break-words text-sm leading-5 text-muted">{event.description}</p>
                      )}
                      <dl className="mt-3 grid grid-cols-2 gap-2">
                        <div className="min-w-0 rounded-md bg-[#fff3ed] px-2.5 py-2">
                          <dt className="text-[10px] font-bold uppercase text-muted">Datums</dt>
                          <dd className="mt-0.5 break-words text-xs font-semibold text-dark-purple">{formatDisplayDate(displayDate)}</dd>
                        </div>
                        {event.event_time && (
                          <div className="min-w-0 rounded-md bg-[#fff3ed] px-2.5 py-2">
                            <dt className="text-[10px] font-bold uppercase text-muted">Laiks</dt>
                            <dd className="mt-0.5 break-words text-xs font-semibold text-dark-purple">{event.event_time}</dd>
                          </div>
                        )}
                        {event.location && (
                          <div className="col-span-2 min-w-0 rounded-md bg-[#fff3ed] px-2.5 py-2">
                            <dt className="text-[10px] font-bold uppercase text-muted">Vieta</dt>
                            <dd className="mt-0.5 break-words text-xs font-semibold text-dark-purple">{event.location}</dd>
                          </div>
                        )}
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </BasePopup>
  );
}

export default CalendarDayDetails;