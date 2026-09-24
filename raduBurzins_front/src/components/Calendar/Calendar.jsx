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

const WEEKDAY_LABELS = ['P', 'O', 'T', 'C', 'P', 'S', 'S'];

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

  const { data: usersStatus, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users-status"],
    queryFn: async () => {
      const response = await api.get("/api/users/status");
      return response.data;
    },
  });

  const birthdayUsers = useMemo(() => {
    const combinedUsers = [
      ...(usersStatus?.online || []),
      ...(usersStatus?.offline || []),
    ];

    return uniqueById(combinedUsers).filter((user) => user.date_of_birth);
  }, [usersStatus]);

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
      const keys = day.repeats ? [monthDayKey] : [fullKey, monthDayKey];

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
      <div className="section-shell relative py-6 sm:py-8 lg:py-16">
        <div className="space-y-5 sm:space-y-6">
          <div className="card surface-strong p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="eyebrow">
                  <span>✦</span>
                  <span>Kalendārs</span>
                </div>
                <h1 className="section-title mt-3">Kalendārs</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
                  Skaties vārda dienas un dzimšanas dienas vienuviet. Pieskaries dienai, lai atvērtu detaļas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-start lg:justify-end">
                <button type="button" onClick={handleToday} className="btn-ghost w-full sm:w-auto">
                  Šodien
                </button>
                <button type="button" onClick={handlePreviousMonth} className="btn-ghost w-full sm:w-auto">
                  ← Iepriekšējais
                </button>
                <button type="button" onClick={handleNextMonth} className="btn-ghost w-full sm:w-auto">
                  Nākamais →
                </button>
                <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary w-full sm:w-auto">
                  + Jauns notikums
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="card surface-strong p-3 sm:p-4 lg:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg sm:text-xl font-black text-dark-purple capitalize">{monthLabel}</h2>
                <div className="text-sm text-muted">
                  {loading ? 'Ielādē...' : 'Pieskaries dienai, lai atvērtu detaļas'}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {WEEKDAY_LABELS.map((label, index) => (
                  <div
                    key={`${label}-${index}`}
                    className="rounded-lg sm:rounded-xl bg-white/80 px-1.5 py-2 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] text-medium-purple"
                  >
                    {label}
                  </div>
                ))}

                {monthCells.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="min-h-[84px] sm:min-h-[104px] md:min-h-[120px] rounded-lg sm:rounded-2xl bg-white/35" />;
                  }

                  const fullKey = formatDateKey(date);
                  const monthDayKey = formatMonthDayKey(date);
                  const names = resolveItems(nameDaysData, date);
                  const birthdays = birthdayUsersByDate[fullKey] || birthdayUsersByDate[monthDayKey] || [];
                  const specials = resolveItems(specialDaysByDate, date);
                  const isToday = formatDateKey(new Date()) === fullKey;
                  const hasBirthday = birthdays.length > 0;
                  const hasEvent = specials.length > 0;
                  const primaryItems = names;

                  const cellClasses = [
                    'min-h-[84px] sm:min-h-[104px] md:min-h-[120px] rounded-lg sm:rounded-2xl border p-2 sm:p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-medium-purple/30',
                    hasBirthday
                      ? 'border-[#f28e6b] bg-[#fff3ec]'
                      : hasEvent
                        ? 'border-emerald-300 bg-emerald-50'
                        : isToday
                          ? 'border-medium-purple bg-medium-purple/10'
                          : 'border-white/80 bg-white/80',
                  ].join(' ');

                  return (
                    <button
                      key={fullKey}
                      type="button"
                      onClick={() => openDay(date)}
                      className={cellClasses}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-dark-purple leading-none">
                          {date.getDate()}
                        </span>
                        
                      </div>

                      <div className="mt-2 sm:mt-3 space-y-1 overflow-hidden">
                        {primaryItems.slice(0, 2).map((item) => (
                          <div
                            key={`${monthDayKey}-${item}`}
                            className="line-clamp-1 text-[10px] sm:text-xs font-semibold text-dark-purple"
                          >
                            {item}
                          </div>
                        ))}

                        {!primaryItems.length && (
                          <div className="text-[10px] sm:text-xs text-muted">
                            Nav vārda dienas
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/70 bg-white/80 p-4 sm:p-5 shadow-soft">
                <div className="eyebrow">📌 Leģenda</div>
                <div className="mt-4 space-y-3 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-medium-purple" />
                    <span>Vārda dienas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#f28e6b]" />
                    <span>Dzimšanas dienas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Īpaši notikumi</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/70 bg-white/80 p-4 sm:p-5 shadow-soft">
                <div className="eyebrow">💡 Padoms</div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Pieskaries dienai, lai redzētu vārda dienas, dzimšanas dienas, uzvārda dienas un notikumus vienā logā.
                </p>
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
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedDay && (
        <BasePopup title={formatDateKey(selectedDay.date)} onClose={closeDayPopup} width="720px">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/90 p-4">
              <div className="text-sm font-bold text-dark-purple">
                {formatDisplayDate(selectedDay.date)}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-medium-purple">
                  Vārda dienas
                </div>
                <div className="mt-3 space-y-2">
                  {uniqueDayNames.length > 0 ? (
                    uniqueDayNames.map((name, index) => (
                      <div key={`${name}-${index}`} className="rounded-xl bg-medium-purple/10 px-3 py-2 text-sm font-semibold text-dark-purple">
                        {name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted">Nav vārda dienu.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c85d36]">
                  Dzimšanas dienas
                </div>
                <div className="mt-3 space-y-2">
                  {uniqueDayBirthdays.length > 0 ? (
                    uniqueDayBirthdays.map((user) => (
                      <div key={user.id} className="rounded-xl bg-[#fff3ec] px-3 py-2 text-sm font-semibold text-dark-purple">
                        {user.first_name} {user.last_name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted">Nav dzimšanas dienu.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-light-purple">
                  Uzvārda dienas
                </div>
                <div className="mt-3 space-y-2">
                  {uniqueDaySurnames.length > 0 ? (
                    uniqueDaySurnames.map((name, index) => (
                      <div key={`${name}-${index}`} className="rounded-xl bg-light-purple/10 px-3 py-2 text-sm font-semibold text-dark-purple">
                        {name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted">Nav uzvārda dienu.</div>
                  )}
                </div>
              </div>

              {hasDaySpecials && (
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    Pasākuma informācija
                  </div>
                  <div className="mt-3 space-y-2">
                    {daySpecials.map((event) => {
                      const repeatsYearly = Boolean(event.repeats);
                      const displayDate = repeatsYearly ? selectedDay.date : event.date;
                      return (
                        <div key={event.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                          <div className="text-sm font-black text-dark-purple">{event.title}</div>
                          {event.description && (
                            <p className="mt-2 text-sm leading-6 text-muted">{event.description}</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-dark-purple">
                            <span className="rounded-full bg-white px-3 py-1">📅 {formatDisplayDate(displayDate)}</span>
                            {event.event_time && <span className="rounded-full bg-white px-3 py-1">🕒 {event.event_time}</span>}
                            {event.location && <span className="rounded-full bg-white px-3 py-1">📍 {event.location}</span>}
                            <span className="rounded-full bg-white px-3 py-1">
                              {repeatsYearly ? 'Atkārtojas katru gadu' : 'Vienreizējs notikums'}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              {event.is_public !== false ? 'Publisks' : 'Privāts'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </BasePopup>
      )}
    </div>
  );
}

export default Calendar;
