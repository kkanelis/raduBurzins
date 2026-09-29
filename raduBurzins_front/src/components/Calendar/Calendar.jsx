import React, { useMemo, useState } from 'react';

import api from '../../services/api';
import BasePopup from '../BasePopoup';
import CreateSpecialDay from './CreateSpecialDay';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MONTH_NAMES = [
  'janvāris',
  'februāris',
  'marts',
  'aprīlis',
  'maijs',
  'jūnijs',
  'jūlijs',
  'augusts',
  'septembris',
  'oktobris',
  'novembris',
  'decembris',
];

const WEEKDAY_LABELS = ['Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se', 'Sv'];

// Kalendāra palīgfunkcijas

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthDayKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

function extractMonthDayKey(dateValue) {
  const rawDate = String(dateValue || '');
  if (rawDate.length >= 10) {
    return rawDate.slice(5, 10);
  }
  return rawDate;
}

function formatDisplayDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const cells = [];

  for (let i = 0; i < startDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function normalizeItems(responseData, propertyName) {
  const mapped = {};

  responseData.forEach((item) => {
    const rawDate = String(item.date || '');
    const fullKey = rawDate.slice(0, 10);
    const monthDayKey = extractMonthDayKey(rawDate);
    const values = Array.isArray(item[propertyName]) ? item[propertyName] : [];

    if (!mapped[fullKey]) mapped[fullKey] = values;
    if (!mapped[monthDayKey]) mapped[monthDayKey] = values;
  });

  return mapped;
}

function resolveItems(dataMap, date) {
  const fullKey = formatDateKey(date);
  const monthDayKey = formatMonthDayKey(date);
  return dataMap[fullKey] || dataMap[monthDayKey] || [];
}

function uniqueById(items) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function uniqueLabels(items, labelGetter) {
  return Array.from(new Map(items.map((item) => [labelGetter(item), item])).values());
}

function Calendar() {
  const queryClient = useQueryClient();

  const { data: nameDaysResponse = [], isLoading: namedaysLoading, isError: namedaysError } = useQuery({
    queryKey: ["namedays"],
    queryFn: async () => {
      const response = await api.get("/api/namedays");
      return response.data || [];
    },
  });

  const { data: surnameDaysResponse = [], isLoading: surnamesLoading, isError: surnamesError } = useQuery({
    queryKey: ["surnames"],
    queryFn: async () => {
      const response = await api.get("/api/surnames");
      return response.data || [];
    },
  });

  const nameDaysData = useMemo(
    () => Array.isArray(nameDaysResponse)
      ? normalizeItems(nameDaysResponse, 'names')
      : nameDaysResponse,
    [nameDaysResponse],
  );

  const surnameDaysData = useMemo(
    () => Array.isArray(surnameDaysResponse)
      ? normalizeItems(surnameDaysResponse, 'surnames')
      : surnameDaysResponse,
    [surnameDaysResponse],
  );

  const { data: specialDays = [], isLoading: specialDaysLoading, isError: specialDaysError } = useQuery({
    queryKey: ["special-days"],
    queryFn: async () => {
      const response = await api.get("/api/special-days");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: usersStatus = [], isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users-status"],
    queryFn: async () => {
      const response = await api.get("/api/users/status");
      return response.data;
    },
  });

  const birthdayUsers = useMemo(
    () => uniqueById(usersStatus.users || []).filter((user) => user.date_of_birth),
    [usersStatus],
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const loading = namedaysLoading || surnamesLoading || specialDaysLoading || usersLoading;
  const error = namedaysError || surnamesError || specialDaysError || usersError;

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthCells = useMemo(() => getMonthMatrix(currentYear, currentMonth), [currentYear, currentMonth]);

  const specialDaysByDate = useMemo(() => {
    const map = {};

    specialDays.forEach((day) => {
      const rawDate = String(day.date || '');
      const fullKey = rawDate.slice(0, 10);
      const monthDayKey = extractMonthDayKey(rawDate);
      const keys = day.repeats ? [monthDayKey] : [fullKey];

      keys.forEach((key) => {
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(day);
      });
    });

    return map;
  }, [specialDays]);

  const birthdayUsersByDate = useMemo(() => {
    const map = {};

    birthdayUsers.forEach((user) => {
      const rawDate = String(user.date_of_birth || '');
      const fullKey = rawDate.slice(0, 10);
      const monthDayKey = extractMonthDayKey(rawDate);
      [fullKey, monthDayKey].forEach((key) => {
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(user);
      });
    });

    return map;
  }, [birthdayUsers]);

  const surnameDaysByDate = useMemo(() => {
    const map = {};

    Object.entries(surnameDaysData).forEach(([key, values]) => {
      map[key] = Array.isArray(values) ? values : [];
    });

    return map;
  }, [surnameDaysData]);

  // Kalendāra navigācijas funkcijas

  const handlePreviousMonth = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Dienas detaļu funkcijas

  const openDay = (date) => {
    const fullKey = formatDateKey(date);
    const monthDayKey = formatMonthDayKey(date);

    setSelectedDay({
      date,
      dateKey: fullKey,
      names: nameDaysData[fullKey] || nameDaysData[monthDayKey] || [],
      surnames: surnameDaysByDate[fullKey] || surnameDaysByDate[monthDayKey] || [],
      birthdays: birthdayUsersByDate[fullKey] || birthdayUsersByDate[monthDayKey] || [],
      specials: specialDaysByDate[fullKey] || specialDaysByDate[monthDayKey] || [],
    });
  };

  const closeDayPopup = () => {
    setSelectedDay(null);
  };

  const monthLabel = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  const dayNames = selectedDay?.names || [];
  const daySurnames = selectedDay?.surnames || [];
  const dayBirthdays = selectedDay?.birthdays || [];
  const daySpecials = selectedDay?.specials || [];

  const uniqueDayNames = uniqueLabels(dayNames, (name) => name);
  const uniqueDayBirthdays = uniqueById(dayBirthdays);
  const uniqueDaySurnames = uniqueLabels(daySurnames, (name) => name);
  const hasDaySpecials = daySpecials.length > 0;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-4 sm:py-7 lg:py-10">
        <div className="space-y-4 sm:space-y-5">
          <div className="card surface-strong p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Kalendārs</span>
                </div>
                <h1 className="mt-2 text-3xl font-black text-dark-purple">Kalendārs</h1>
                <p className="mt-2 max-w-xl text-sm text-muted">
                  Vārda dienas, dzimšanas dienas un ģimenes notikumi vienuviet.
                </p>
              </div>

              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:shrink-0">
                <button type="button" onClick={handleToday} className="btn-ghost w-full sm:w-auto">
                  Šodien
                </button>
                <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary w-full sm:w-auto">
                  <span aria-hidden="true">+</span> Jauns notikums
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
            <div className="card surface-strong p-2.5 sm:p-4 lg:p-5">
              <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3">
                  <button
                    type="button"
                    onClick={handlePreviousMonth}
                    aria-label="Iepriekšējais mēnesis"
                    title="Iepriekšējais mēnesis"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-dark-purple transition hover:bg-[#f1f4ef] focus:outline-none focus:ring-2 focus:ring-medium-purple/30"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <h2 className="min-w-0 flex-1 text-center text-lg font-black capitalize text-dark-purple sm:min-w-[12rem] sm:text-xl">
                    {monthLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Nākamais mēnesis"
                    title="Nākamais mēnesis"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-dark-purple transition hover:bg-[#f1f4ef] focus:outline-none focus:ring-2 focus:ring-medium-purple/30"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="hidden text-sm text-muted sm:block">
                  {loading ? 'Ielādē...' : 'Izvēlies dienu detaļām'}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {WEEKDAY_LABELS.map((label, index) => (
                  <div
                    key={`${label}-${index}`}
                    className="rounded-md bg-[#f1f4ef] px-0.5 py-2 text-center text-[10px] font-extrabold text-[#526456] sm:rounded-lg sm:py-2.5 sm:text-xs"
                  >
                    {label}
                  </div>
                ))}

                {monthCells.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} aria-hidden="true" className="min-h-[64px] rounded-lg bg-[#f7f8f5] sm:min-h-[100px] sm:rounded-xl lg:min-h-[112px]" />;
                  }

                  const fullKey = formatDateKey(date);
                  const monthDayKey = formatMonthDayKey(date);
                  const names = resolveItems(nameDaysData, date);
                  const surnames = surnameDaysByDate[fullKey] || surnameDaysByDate[monthDayKey] || [];
                  const birthdays = birthdayUsersByDate[fullKey] || birthdayUsersByDate[monthDayKey] || [];
                  const specials = resolveItems(specialDaysByDate, date);
                  const isToday = formatDateKey(new Date()) === fullKey;
                  const hasBirthday = birthdays.length > 0;
                  const hasEvent = specials.length > 0;
                  const hasSurnameDay = surnames.length > 0;

                  const cellClasses = [
                    'group flex min-h-[64px] flex-col rounded-lg border p-1.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-medium-purple/30 sm:min-h-[100px] sm:rounded-xl sm:p-2.5 lg:min-h-[112px]',
                    hasBirthday
                      ? 'border-[#9bb99e] bg-[#f1f7f0] hover:bg-[#e9f3e8]'
                      : hasEvent
                        ? 'border-[#edb18f] bg-[#fff6f0] hover:bg-[#fff0e6]'
                        : isToday
                          ? 'border-[#466c52] bg-[#edf4ed] ring-1 ring-[#466c52]/20'
                          : 'border-[#e7e9e4] bg-white hover:border-[#b7c4b8] hover:bg-[#fbfcfa]',
                  ].join(' ');

                  return (
                    <button
                      key={fullKey}
                      type="button"
                      onClick={() => openDay(date)}
                      aria-label={`${date.getDate()}. ${MONTH_NAMES[currentMonth]}${isToday ? ', šodien' : ''}${hasSurnameDay ? ', uzvārda diena' : ''}${hasBirthday ? ', dzimšanas diena' : ''}${hasEvent ? ', īpašs notikums' : ''}`}
                      className={cellClasses}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-extrabold leading-none sm:h-7 sm:min-w-7 sm:text-sm ${isToday ? 'bg-[#315844] text-white' : 'text-[#29382d]'}`}>
                          {date.getDate()}
                        </span>
                        {isToday && <span className="hidden text-[10px] font-bold text-[#315844] sm:inline">Šodien</span>}
                      </div>

                      <div className="mt-1 hidden w-full space-y-1 overflow-hidden sm:block">
                        {names.slice(0, 2).map((item) => (
                          <div
                            key={`${monthDayKey}-${item}`}
                            className="line-clamp-1 text-[10px] font-semibold text-dark-purple lg:text-xs"
                          >
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex min-h-2 items-center gap-1.5 pt-1" aria-hidden="true">
                        {names.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-[#5372c9]" />}
                        {hasSurnameDay && <span className="h-1.5 w-1.5 rounded-full bg-[#b77a23]" />}
                        {hasBirthday && <span className="h-1.5 w-1.5 rounded-full bg-[#54805a]" />}
                        {hasEvent && <span className="h-1.5 w-1.5 rounded-full bg-[#df8058]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-xl border border-white/80 bg-white/75 p-4 shadow-soft sm:p-5">
              <h2 className="text-sm font-extrabold text-dark-purple">Leģenda</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-1 sm:gap-3 sm:text-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#5372c9]" />
                  <span>Vārda dienas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#b77a23]" />
                  <span>Uzvārda dienas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#54805a]" />
                  <span>Dzimšanas dienas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#df8058]" />
                  <span>Īpaši notikumi</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateSpecialDay
          onClose={() => setShowCreateModal(false)}
          onSuccess={(created) => {
            queryClient.setQueryData(["special-days"], (current = []) => [created, ...current]);
            queryClient.invalidateQueries({ queryKey: ["user-special-days"] });
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedDay && (
        <BasePopup title={formatDisplayDate(selectedDay.date)} onClose={closeDayPopup} width="720px">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <section className="min-w-0 rounded-lg border border-[#d8e0fb] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#5372c9]" />
                  <h4 className="text-xs font-bold uppercase text-muted">Vārda dienas</h4>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {uniqueDayNames.length > 0 ? (
                    uniqueDayNames.map((name, index) => (
                      <span key={`${name}-${index}`} className="rounded-md bg-[#f0f3ff] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                        {name}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-muted">Nav vārda dienu.</div>
                  )}
                </div>
              </section>
              {uniqueDayBirthdays.length > 0 && (
                <section className="min-w-0 rounded-lg border border-[#cfe0d0] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#54805a]" />
                    <h4 className="text-xs font-bold uppercase text-muted">Dzimšanas dienas</h4>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {uniqueDayBirthdays.map((user) => (
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
                  {uniqueDaySurnames.length > 0 ? (
                    uniqueDaySurnames.map((name, index) => (
                      <span key={`${name}-${index}`} className="rounded-md bg-[#fff7e9] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                        {name}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-muted">Nav uzvārda dienu.</div>
                  )}
                </div>
              </section>

              {hasDaySpecials && (
                <section className="min-w-0 rounded-lg border border-[#efcfbd] bg-[#fffaf7] p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#df8058]" />
                    <h4 className="text-xs font-bold uppercase text-muted">Pasākumi</h4>
                  </div>
                  <div className="mt-3 space-y-2">
                    {daySpecials.map((event) => {
                      const repeatsYearly = Boolean(event.repeats);
                      const displayDate = repeatsYearly ? selectedDay.date : event.date;
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
      )}
    </div>
  );
}

export default Calendar;
