export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMonthDayKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

export function extractMonthDayKey(dateValue) {
  const rawDate = String(dateValue || '');
  if (rawDate.length >= 10) {
    return rawDate.slice(5, 10);
  }
  return rawDate;
}

export function formatDisplayDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const cells = [];

  for (let index = 0; index < startDay; index += 1) {
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

export function normalizeItems(responseData, propertyName) {
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

export function resolveItems(dataMap, date) {
  const fullKey = formatDateKey(date);
  const monthDayKey = formatMonthDayKey(date);
  return dataMap[fullKey] || dataMap[monthDayKey] || [];
}

export function uniqueById(items) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export function uniqueLabels(items, labelGetter) {
  return Array.from(new Map(items.map((item) => [labelGetter(item), item])).values());
}