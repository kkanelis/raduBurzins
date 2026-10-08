import React, { useMemo, useState } from 'react';

import api from '../../services/api';
import CalendarDayDetails from './CalendarDayDetails';
import CreateSpecialDay from './CreateSpecialDay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  extractMonthDayKey,
  formatDateKey,
  formatMonthDayKey,
  getMonthMatrix,
  normalizeItems,
  resolveItems,
  uniqueById,
} from './calendarUtils';

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

      {selectedDay && <CalendarDayDetails day={selectedDay} onClose={closeDayPopup} />}
    </div>
  );
}

export default Calendar;
