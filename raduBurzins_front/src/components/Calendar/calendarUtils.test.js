import { describe, expect, it } from 'vitest';
import {
  extractMonthDayKey,
  formatDateKey,
  getMonthMatrix,
  normalizeItems,
  resolveItems,
  uniqueById,
  uniqueLabels,
} from './calendarUtils';

describe('calendar utilities', () => {
  it('formats local date keys and extracts recurring month-day keys', () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(extractMonthDayKey('2000-02-29T12:00:00.000Z')).toBe('02-29');
    expect(extractMonthDayKey('02-29')).toBe('02-29');
  });

  it('creates a Monday-first month matrix padded to full weeks', () => {
    const cells = getMonthMatrix(2024, 1);

    expect(cells).toHaveLength(35);
    expect(cells.slice(0, 3)).toEqual([null, null, null]);
    expect(cells[3].getDate()).toBe(1);
    expect(cells[31].getDate()).toBe(29);
    expect(cells[32]).toBeNull();
  });

  it('normalizes nameday data and resolves exact or recurring dates', () => {
    const data = normalizeItems([
      { date: '2026-01-05', names: ['Anna'] },
      { date: '2026-01-06', names: ['Zane'] },
    ], 'names');

    expect(data['2026-01-05']).toEqual(['Anna']);
    expect(resolveItems(data, new Date(2026, 0, 5))).toEqual(['Anna']);
    expect(resolveItems(data, new Date(2027, 0, 6))).toEqual(['Zane']);
  });

  it('removes duplicate users and labels while keeping the last entry', () => {
    const users = [{ id: 1, name: 'Old' }, { id: 1, name: 'New' }];

    expect(uniqueById(users)).toEqual([{ id: 1, name: 'New' }]);
    expect(uniqueLabels(['A', 'B', 'A'], (label) => label)).toEqual(['A', 'B']);
  });
});