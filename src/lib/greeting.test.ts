import { describe, expect, it } from 'vitest';
import { GREETING_LINES, greetingFor, seasonOf } from './greeting';

describe('seasonOf', () => {
  it.each([
    ['2026-03-01', 'spring'],
    ['2026-05-31', 'spring'],
    ['2026-06-01', 'summer'],
    ['2026-08-31', 'summer'],
    ['2026-09-01', 'autumn'],
    ['2026-11-30', 'autumn'],
    ['2026-12-01', 'winter'],
    ['2027-02-28', 'winter'],
  ])('maps %s to %s', (date, season) => {
    expect(seasonOf(new Date(`${date}T12:00:00`))).toBe(season);
  });
});

describe('greetingFor', () => {
  const morning = new Date('2026-10-10T07:40:00');

  it('greets by time of day and name', () => {
    expect(greetingFor({ name: 'Lena', now: morning, pick: 0 }).title).toBe('Guten Morgen, Lena');
    expect(greetingFor({ name: 'Lena', now: new Date('2026-10-10T14:00:00'), pick: 0 }).title).toBe('Hallo, Lena');
    expect(greetingFor({ name: 'Lena', now: new Date('2026-10-10T19:30:00'), pick: 0 }).title).toBe('Guten Abend, Lena');
    expect(greetingFor({ name: 'Lena', now: new Date('2026-10-10T23:30:00'), pick: 0 }).title).toBe('Hallo, Lena');
  });

  it('greets without a name when none is set', () => {
    expect(greetingFor({ name: '', now: morning, pick: 0 }).title).toBe('Guten Morgen');
    expect(greetingFor({ name: '   ', now: morning, pick: 0 }).title).toBe('Guten Morgen');
  });

  it('picks a line from the general and the current season lines', () => {
    const pool = [...GREETING_LINES.general, ...GREETING_LINES.autumn];
    const lines = new Set(Array.from({ length: pool.length }, (_, i) => greetingFor({ name: '', now: morning, pick: i / pool.length }).line));
    expect(lines).toEqual(new Set(pool));
  });

  it('never uses lines from another season', () => {
    for (let i = 0; i < 50; i += 1) {
      const { line } = greetingFor({ name: '', now: morning, pick: i / 50 });
      expect(GREETING_LINES.summer).not.toContain(line);
      expect(GREETING_LINES.winter).not.toContain(line);
    }
  });

  it('follows the season Lena chose instead of the calendar', () => {
    for (let i = 0; i < 50; i += 1) {
      const { line } = greetingFor({ name: '', now: morning, pick: i / 50, season: 'winter' });
      expect([...GREETING_LINES.general, ...GREETING_LINES.winter]).toContain(line);
    }
  });

  it('stays inside the pool for pick values at the edges', () => {
    expect(greetingFor({ name: '', now: morning, pick: 0.999999 }).line).toBeTruthy();
    expect(greetingFor({ name: '', now: morning, pick: 1 }).line).toBeTruthy();
  });
});

describe('greeting lines', () => {
  it('fit on one line of the name band (at most 30 characters)', () => {
    const tooLong = Object.values(GREETING_LINES).flat().filter((line) => line.length > 30);
    expect(tooLong).toEqual([]);
  });

  it('never assume a specific garment Lena may not own', () => {
    const all = Object.values(GREETING_LINES).flat();
    expect(all.some((line) => /Lederjacke|Sommerkleid/.test(line))).toBe(false);
  });

  it('talk like a friend, not like a shop or a parent', () => {
    const all = Object.values(GREETING_LINES).flat();
    expect(all.filter((line) => /Was darf es|nicht vergessen|eingepackt|bereit?/.test(line))).toEqual([]);
  });
});
