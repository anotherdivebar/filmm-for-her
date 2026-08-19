"use client";

import { FormEvent, useState } from "react";

const availableDays = [3, 4, 9, 10, 16, 17, 23, 24, 29];
const calendarDays: Array<number | null> = [
  null,
  null,
  ...Array.from({ length: 30 }, (_, index) => index + 1),
];
const times = ["10:00 am", "1:00 pm", "3:30 pm"];

export function BookingExperience() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDay || !selectedTime) return;
    setRequestSent(true);
  }

  return (
    <div className="booking-card">
      {!requestSent ? (
        <>
          <div className="calendar-head">
            <div>
              <span>Booking availability</span>
              <h3>September 2026</h3>
            </div>
            <div className="calendar-key"><i /> Available</div>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid" role="group" aria-label="September 2026 availability">
            {calendarDays.map((day, index) => {
              if (!day) return <span className="calendar-empty" aria-hidden="true" key={`empty-${index}`} />;
              const available = availableDays.includes(day);
              const selected = selectedDay === day;
              return (
                <button
                  type="button"
                  className={`${available ? "available" : ""} ${selected ? "selected" : ""}`}
                  disabled={!available}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedTime("");
                  }}
                  aria-label={`${available ? "Available" : "Unavailable"} September ${day}`}
                  aria-pressed={selected}
                  key={day}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <form className="booking-form" onSubmit={handleRequest} aria-describedby="form-note">
            <div className="time-picker">
              <div className="form-label" id="time-picker-label">
                {selectedDay ? `September ${selectedDay} / select a time` : "Select a date to view times"}
              </div>
              <div className="time-options" role="group" aria-labelledby="time-picker-label">
                {times.map((time) => (
                  <button
                    type="button"
                    disabled={!selectedDay}
                    className={selectedTime === time ? "selected" : ""}
                    onClick={() => setSelectedTime(time)}
                    aria-pressed={selectedTime === time}
                    key={time}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>
                <span>Name</span>
                <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" required />
              </label>
            </div>
            <label>
              <span>Project type</span>
              <select name="project" defaultValue="" required>
                <option value="" disabled>Select one</option>
                <option>Executive portraiture</option>
                <option>Team portrait day</option>
                <option>Corporate event</option>
                <option>Creative event</option>
                <option>Editorial or brand commission</option>
              </select>
            </label>
            <label>
              <span>Project brief</span>
              <textarea name="details" rows={3} maxLength={1200} placeholder="People, place, intended use, and timing" required />
            </label>
            <button className="submit-button" type="submit" disabled={!selectedDay || !selectedTime}>
              Request date <span>↗</span>
            </button>
            <p className="form-note" id="form-note">Demonstration only. No request is sent from this preview.</p>
          </form>
        </>
      ) : (
        <div className="success-state" aria-live="polite">
          <p className="section-index">Request prepared</p>
          <h3>September {selectedDay}<br />at {selectedTime}</h3>
          <p>
            This preview shows the completed request state. Once connected, I would receive your brief and follow up personally.
          </p>
          <button onClick={() => setRequestSent(false)}>Choose another date</button>
        </div>
      )}
    </div>
  );
}
