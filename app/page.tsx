"use client";

import { FormEvent, useState } from "react";

const portfolio = [
  {
    src: "/wichita-city.png",
    alt: "Double-exposed view of the Wichita skyline on 35mm film",
    title: "Wichita Study I",
    medium: "35mm / Double exposure",
    className: "project project-wide",
  },
  {
    src: "/parking-structure.png",
    alt: "Structural view through a shadowed parking garage",
    title: "Understructure",
    medium: "35mm / Architecture",
    className: "project project-vertical",
  },
  {
    src: "/city-riders.png",
    alt: "Two motorcycle riders passing homes on a city street",
    title: "Passing Figures",
    medium: "35mm / Street",
    className: "project project-standard",
  },
  {
    src: "/kansas-prairie.png",
    alt: "Power lines receding into a green Kansas prairie",
    title: "Prairie Line",
    medium: "35mm / Landscape",
    className: "project project-panorama",
  },
  {
    src: "/night-storefront.png",
    alt: "Papered storefront illuminated at night",
    title: "Nocturne",
    medium: "35mm / Night study",
    className: "project project-standard",
  },
  {
    src: "/brick-sky.png",
    alt: "Brick buildings cut against a pale blue sky",
    title: "Wichita Study II",
    medium: "35mm / Architecture",
    className: "project project-vertical",
  },
];

const services = [
  {
    number: "01",
    title: "Executive portraiture",
    copy: "Individual headshots, environmental portraits, and consistent full-team photography. Directed with restraint and built around how each person actually carries themselves.",
    detail: "Individuals / Teams / Portrait days",
  },
  {
    number: "02",
    title: "Events & organizations",
    copy: "Clear coverage of the room, the work, and the people inside it. Designed for annual reports, communications, press, and the institutional archive.",
    detail: "Conferences / Culture / Community",
  },
  {
    number: "03",
    title: "Editorial & commissions",
    copy: "Image-led stories for artists, independent brands, publications, and ideas that need a less conventional point of view—on digital, 35mm, or both.",
    detail: "Campaigns / Editorial / 35mm",
  },
];

const availableDays = [3, 4, 9, 10, 16, 17, 23, 24, 29];
const calendarDays: Array<number | null> = [
  null,
  null,
  ...Array.from({ length: 30 }, (_, index) => index + 1),
];
const times = ["10:00 am", "1:00 pm", "3:30 pm"];

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDay || !selectedTime) return;
    setRequestSent(true);
  }

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="filmmforher home">
          FILMM<span>/</span>FORHER
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#work">Selected work</a>
          <a href="#services">Services</a>
          <a href="#about">Profile</a>
          <a className="nav-inquiry" href="#book">Inquire <span>↗</span></a>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Index</summary>
          <nav aria-label="Mobile navigation">
            <a href="#work">Selected work</a>
            <a href="#services">Services</a>
            <a href="#about">Profile</a>
            <a href="#book">Inquire</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">Marissa Reynolds / Photographer</p>
          <h1>Images<br />with <em>weight.</em></h1>
          <div className="hero-summary">
            <p>
              Corporate portraiture, events, and independent work photographed with precision—and the emotional texture of film.
            </p>
            <a className="arrow-link" href="#work">View selected work <span>↓</span></a>
          </div>
        </div>

        <figure className="hero-figure">
          <img src="/marissa-portrait.png" alt="Black-and-white portrait of a woman looking upward" />
          <figcaption>
            <span>Portrait 001</span>
            <span>35mm / B&W</span>
          </figcaption>
        </figure>

        <div className="hero-meta">
          <p>Wichita, Kansas</p>
          <p>Available for regional commissions</p>
        </div>
      </section>

      <section className="statement" aria-label="Approach">
        <p>Commercial clarity.</p>
        <p>Human presence.</p>
      </section>

      <section className="work-section" id="work">
        <div className="section-header">
          <p className="section-index">01 / Selected work</p>
          <h2>Observations,<br /><em>held still.</em></h2>
          <p className="section-intro">
            Commissioned and self-directed photographs made across Wichita and the Midwest. Digital when clarity matters; film when texture tells more.
          </p>
        </div>

        <div className="project-grid">
          {portfolio.map((item, index) => (
            <figure className={item.className} key={item.src}>
              <div className="project-image">
                <img src={item.src} alt={item.alt} loading={index > 1 ? "lazy" : "eager"} />
              </div>
              <figcaption>
                <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <span>{item.medium}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="image-break" aria-label="Featured landscape photograph">
        <img src="/winter-cedar.png" alt="Snow resting on dark cedar branches" loading="lazy" />
        <div>
          <span>Study / Winter</span>
          <p>The frame begins<br />before the shutter.</p>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="section-header section-header-dark">
          <p className="section-index">02 / Services</p>
          <h2>Exacting images.<br /><em>No performance required.</em></h2>
          <p className="section-intro">
            Every commission begins with the same premise: understand the purpose, remove what is unnecessary, and make room for something honest.
          </p>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-row" key={service.number}>
              <span className="service-number">{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
              <span className="service-detail">{service.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-visual">
          <img src="/parking-structure.png" alt="Graphic architectural study through a parking structure" loading="lazy" />
          <span>MR / 2026</span>
        </div>
        <div className="about-copy">
          <p className="section-index">03 / Profile</p>
          <h2>Marissa<br />Reynolds</h2>
          <p className="about-lead">
            Marissa photographs people, work, and gatherings. Her approach is observant and composed—attentive to gesture, architecture, light, and the quiet tension that makes a frame last.
          </p>
          <p>
            She works across corporate headshots, organizational events, and self-directed 35mm practice. Each commission is shaped to feel exact without becoming sterile, and natural without becoming casual.
          </p>
          <dl className="profile-details">
            <div><dt>Based</dt><dd>Wichita, Kansas</dd></div>
            <div><dt>Working in</dt><dd>Digital / 35mm</dd></div>
            <div><dt>Available for</dt><dd>Local and regional work</dd></div>
          </dl>
          <a className="arrow-link" href="#book">Discuss a commission <span>↗</span></a>
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div>
          <p className="section-index">04 / Process</p>
          <h2 id="process-title">A clear process<br />leaves room to <em>notice.</em></h2>
        </div>
        <div className="process-list">
          <article>
            <span>01</span>
            <h3>Brief</h3>
            <p>Purpose, audience, location, schedule, and the images the work needs to produce.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Photograph</h3>
            <p>Direction where it helps. Observation where it matters. No unnecessary theater.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Deliver</h3>
            <p>A focused, edited gallery prepared for its intended use and built to hold up over time.</p>
          </article>
        </div>
      </section>

      <section className="booking-section" id="book">
        <div className="booking-intro">
          <p className="section-index">05 / Inquiries</p>
          <h2>Begin a<br /><em>conversation.</em></h2>
          <p>
            Select an available date and send a short project brief. Marissa personally reviews and confirms every request.
          </p>
          <div className="booking-notes">
            <p><span>For</span>Portraits, events, editorial, and creative commissions</p>
            <p><span>Response</span>Within two business days</p>
            <p><span>Travel</span>Available throughout the region</p>
          </div>
        </div>

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
              <div className="calendar-grid" role="grid" aria-label="September 2026 availability">
                {calendarDays.map((day, index) => {
                  if (!day) return <span className="calendar-empty" key={`empty-${index}`} />;
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

              <form className="booking-form" onSubmit={handleRequest}>
                <div className="time-picker">
                  <div className="form-label">
                    {selectedDay ? `September ${selectedDay} / select a time` : "Select a date to view times"}
                  </div>
                  <div className="time-options">
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
                    <input name="name" type="text" placeholder="Your name" required />
                  </label>
                  <label>
                    <span>Email</span>
                    <input name="email" type="email" placeholder="you@company.com" required />
                  </label>
                </div>
                <label>
                  <span>Project type</span>
                  <select name="project" defaultValue="">
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
                  <textarea name="details" rows={3} placeholder="People, place, intended use, and timing" />
                </label>
                <button className="submit-button" type="submit" disabled={!selectedDay || !selectedTime}>
                  Request date <span>↗</span>
                </button>
                <p className="form-note">Demonstration only. No request is sent from this preview.</p>
              </form>
            </>
          ) : (
            <div className="success-state" aria-live="polite">
              <p className="section-index">Request prepared</p>
              <h3>September {selectedDay}<br />at {selectedTime}</h3>
              <p>
                This preview shows the completed request state. Once connected, Marissa would receive the brief and follow up personally.
              </p>
              <button onClick={() => setRequestSent(false)}>Choose another date</button>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-title">
          <span>Photography by</span>
          <p>Marissa Reynolds</p>
        </div>
        <div className="footer-bottom">
          <a className="wordmark wordmark-footer" href="#top">FILMM<span>/</span>FORHER</a>
          <p>Wichita, Kansas / Regional commissions</p>
          <p>© 2026</p>
          <a href="#book">Inquire <span>↑</span></a>
        </div>
      </footer>
    </main>
  );
}
