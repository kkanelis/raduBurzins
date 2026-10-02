import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

function parseLocalDate(dateValue) {
  const [year, month, day] = String(dateValue || '').slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTodaysItems(responseData, propertyName, date) {
  const monthDayKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const fullDateKey = `${date.getFullYear()}-${monthDayKey}`;

  if (!Array.isArray(responseData)) {
    const items = responseData?.[fullDateKey] || responseData?.[monthDayKey] || [];
    return Array.isArray(items) ? items : [];
  }

  const matchingDay = responseData.find((item) => {
    const rawDate = String(item.date || '');
    return rawDate.length >= 10 ? rawDate.slice(5, 10) === monthDayKey : rawDate === monthDayKey;
  });

  return Array.isArray(matchingDay?.[propertyName]) ? matchingDay[propertyName] : [];
}

function getNextAnnualDate(dateValue, today) {
  const originalDate = parseLocalDate(dateValue);
  if (!originalDate) return null;

  const nextDate = new Date(today.getFullYear(), originalDate.getMonth(), originalDate.getDate());
  if (nextDate < today) nextDate.setFullYear(nextDate.getFullYear() + 1);
  return nextDate;
}

function RegWelcome() {
  const { data: nameDaysResponse = [], isLoading: loadingNameDays, isError: nameDaysError } = useQuery({
    queryKey: ['namedays'],
    queryFn: async () => {
      const response = await api.get('/api/namedays');
      return response.data || [];
    },
  });

  const { data: surnameDaysResponse = [], isLoading: loadingSurnameDays, isError: surnameDaysError } = useQuery({
    queryKey: ['surnames'],
    queryFn: async () => {
      const response = await api.get('/api/surnames');
      return response.data || [];
    },
  });

  const { data: specialDays = [], isLoading: loadingEvents, isError: eventsError } = useQuery({
    queryKey: ['special-days'],
    queryFn: async () => {
      const response = await api.get('/api/special-days');
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: usersStatus = {}, isLoading: loadingUsers, isError: usersError } = useQuery({
    queryKey: ['users-status'],
    queryFn: async () => {
      const response = await api.get('/api/users/status');
      return response.data || {};
    },
  });

  const upcomingDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDates = specialDays.map((event) => {
      const date = event.repeats ? getNextAnnualDate(event.date, today) : parseLocalDate(event.date);
      if (!date || date < today) return null;

      return {
        id: `event-${event.id}`,
        title: event.title,
        date,
        type: 'Pasākums',
        detail: [event.event_time, event.location].filter(Boolean).join(' · '),
        isBirthday: false,
      };
    });

    const birthdayUsers = Array.isArray(usersStatus.users) ? usersStatus.users : [];
    const birthdays = Array.from(new Map(birthdayUsers.map((user) => [user.id, user])).values())
      .filter((user) => user.date_of_birth)
      .map((user) => ({
        id: `birthday-${user.id}`,
        title: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Dzimšanas diena',
        date: getNextAnnualDate(user.date_of_birth, today),
        type: 'Dzimšanas diena',
        detail: '',
        isBirthday: true,
      }));

    return [...eventDates, ...birthdays]
      .filter(Boolean)
      .sort((first, second) => first.date - second.date)
      .slice(0, 5);
  }, [specialDays, usersStatus.users]);

  const loading = loadingEvents || loadingUsers;
  const hasError = eventsError || usersError;
  const today = new Date();
  const todaysNameDays = getTodaysItems(nameDaysResponse, 'names', today);
  const todaysSurnameDays = getTodaysItems(surnameDaysResponse, 'surnames', today);
  const loadingToday = loadingNameDays || loadingSurnameDays;
  const todayError = nameDaysError || surnameDaysError;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />

      <div className="section-shell relative py-5 sm:py-8 lg:py-10">
        <div className="space-y-4 sm:space-y-5">
          <section className="card surface-strong p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
              <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Radu Burziņš</span>
                </div>
                <h1 className="mt-2 text-3xl font-black text-dark-purple">Ģimenes sākums</h1>
                <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                  {loading ? 'Ielādē tuvākos datumus...' : 'Tuvākie notikumi un ģimenes jaunumi vienuviet.'}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
            <section className="card surface-strong p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-dark-purple sm:text-xl">Tuvākie datumi</h2>
              </div>

              {hasError ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Neizdevās ielādēt tuvākos datumus.
                </div>
              ) : loading ? (
                <div className="py-6 text-sm text-muted">Ielādē tuvākos datumus...</div>
              ) : upcomingDates.length > 0 ? (
                <div className="divide-y divide-[#ece9e5]">
                  {upcomingDates.map((item) => (
                    <Link
                      key={item.id}
                      to="/calendar"
                      className="group grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3 py-3 no-underline first:pt-1 last:pb-1 sm:grid-cols-[58px_minmax(0,1fr)_auto]"
                    >
                      <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg ${item.isBirthday ? 'bg-[#eaf2e9] text-[#3f6b45]' : 'bg-[#fff0e8] text-[#a95e3e]'}`}>
                        <span className="text-lg font-black leading-none">{item.date.getDate()}</span>
                        <span className="mt-1 text-[9px] font-bold uppercase leading-none">
                          {item.date.toLocaleDateString('lv-LV', { month: 'short' }).replace('.', '')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-dark-purple group-hover:text-medium-purple">{item.title}</div>
                        <div className="mt-0.5 truncate text-xs text-muted">
                          {item.type}{item.detail ? ` · ${item.detail}` : ''}
                        </div>
                      </div>
                      <span className={`col-start-2 w-fit rounded-md px-2 py-1 text-[10px] font-bold sm:col-start-auto ${item.isBirthday ? 'bg-[#eaf2e9] text-[#3f6b45]' : 'bg-[#fff0e8] text-[#a95e3e]'}`}>
                        {item.date.toLocaleDateString('lv-LV', { day: 'numeric', month: 'long' })}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-sm text-muted">Tuvākajā laikā nav gaidāmu pasākumu vai dzimšanas dienu.</p>
              )}
            </section>

            <section className="card surface-strong p-4 sm:p-6">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-dark-purple sm:text-xl">Šodiena</h2>
              </div>
              <p className="mb-4 text-sm text-muted">
                {today.toLocaleDateString('lv-LV', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              {todayError ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Neizdevās ielādēt šodienas vārdadienas.
                </div>
              ) : loadingToday ? (
                <p className="py-3 text-sm text-muted">Ielādē šodienas vārdadienas...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-medium-purple">Vārda dienas</h3>
                    {todaysNameDays.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {todaysNameDays.map((name, index) => (
                          <span key={`${name}-${index}`} className="rounded-md bg-[#f0ebf4] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted">Šodien vārda dienu nav.</p>
                    )}
                  </div>

                  <div className="border-t border-[#ece9e5] pt-3">
                    <h3 className="text-xs font-bold uppercase text-medium-purple">Uzvārda dienas</h3>
                    {todaysSurnameDays.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {todaysSurnameDays.map((surname, index) => (
                          <span key={`${surname}-${index}`} className="rounded-md bg-[#f4eee9] px-2.5 py-1.5 text-sm font-semibold text-dark-purple">
                            {surname}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted">Šodien uzvārda dienu nav.</p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegWelcome;
