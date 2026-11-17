'use client';

import { useState } from 'react';
import type { Event } from '../lib/data';
import EventRequestForm from './EventRequestForm';

// Convert common RA-entered time ranges into Google Calendar's timed-event format.
// Examples: "8:00 PM - 10:00 PM", "8-10pm", "7:30pm to 9pm", "18:00–20:00".
function parseTimeRange(input: string): [string, string] | null {
  const match = input.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  const [, startH, startM = '00', startPeriod, endH, endM = '00', endPeriod] = match;
  const start24 = Number(startH) > 12 || Number(endH) > 12;
  const inferredStartPeriod = startPeriod || (start24 ? '' : endPeriod || '');
  const inferredEndPeriod = endPeriod || (start24 ? '' : startPeriod || '');
  function clock(hText: string, mText: string, period: string): number | null {
    let h = Number(hText), m = Number(mText);
    if (m > 59 || h > 23 || (period && (h < 1 || h > 12))) return null;
    if (period) h = (h % 12) + (period.toLowerCase() === 'pm' ? 12 : 0);
    return h * 60 + m;
  }
  let start = clock(startH, startM, inferredStartPeriod);
  const end = clock(endH, endM, inferredEndPeriod);
  if (start === null || end === null) return null;
  // "8-10pm" means 8pm–10pm, but "11am-1pm" spans noon.
  if (!startPeriod && endPeriod && start > end) {
    const alternate = clock(startH, startM, endPeriod.toLowerCase() === 'pm' ? 'am' : 'pm');
    if (alternate !== null && alternate < end) start = alternate;
  }
  if (end <= start) return null; // Avoid guessing overnight events.
  const format = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}${String(minutes % 60).padStart(2, '0')}00`;
  return [format(start), format(end)];
}

function googleCalendarLink(event: Event): string {
  const date = event.event_date.replace(/-/g, '');
  const range = parseTimeRange(event.time || '');
  const next = new Date(`${event.event_date}T12:00:00`);
  next.setDate(next.getDate() + 1);
  const followingDate = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    // A time range is interpreted in Stanford's local Pacific time zone.
    dates: range ? `${date}T${range[0]}/${date}T${range[1]}` : `${date}/${followingDate}`,
    details: [!range && event.time ? `Time: ${event.time}` : '', event.description || '', 'FloToon Network'].filter(Boolean).join('\n\n'),
    location: event.location || '',
  });
  if (range) params.set('ctz', 'America/Los_Angeles');
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function Calendar({ events }: { events: Event[] }) {
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selected, setSelected] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [expanded, setExpanded] = useState(false);
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, i) => i - first + 1);
  const chosen = events.filter(e => e.event_date === selected);

  function move(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected('');
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>WHAT'S ON?</h2>
        <span className="heading-line" />
        <button className="text-action" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'COLLAPSE ↗' : 'EXPAND CALENDAR ↗'}
        </button>
      </div>
      <div className={`calendar-layout ${expanded ? 'expanded' : ''}`}>
        <div className="calendar-box">
          <div className="calendar-top">
            <button aria-label="Previous month" onClick={() => move(-1)}>‹</button>
            <strong>{new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</strong>
            <button aria-label="Next month" onClick={() => move(1)}>›</button>
          </div>
          <div className="calendar-grid">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="day-head">{d}</div>)}
            {cells.map((day, i) => {
              const date = day > 0 && day <= days ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const hasEvent = events.some(e => e.event_date === date);
              return <button key={i} disabled={!date} className={`date ${date === selected ? 'selected' : ''} ${hasEvent ? 'has-event' : ''}`} onClick={() => setSelected(date)}>{date ? day : ''}{hasEvent && <i />}</button>;
            })}
          </div>
        </div>
        <div className="event-detail">
          <div className="yellow-title">{selected ? new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() : 'SELECT A DATE'}</div>
          <div className="detail-body">
            {chosen.length ? chosen.map(e => (
              <article key={e.id} className="event-snippet">
                <h3>{e.title}</h3>
                <p>{[e.time, e.location].filter(Boolean).join(' · ')}</p>
                <p>{e.description}</p>
                <a href={googleCalendarLink(e)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, padding: '10px 14px', background: '#111', color: '#fff', fontWeight: 800, textDecoration: 'none', borderRadius: 0, fontSize: 12, letterSpacing: '.03em' }}>
                  + ADD TO GOOGLE CALENDAR ↗
                </a>
              </article>
            )) : <><h3>NO EVENTS YET.</h3><p>CHECK BACK SOON!</p></>}
          </div>
        </div>
      </div>
      <EventRequestForm />
    </section>
  );
}