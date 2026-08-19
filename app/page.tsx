"use client";

import { FormEvent, useState } from "react";

const portfolio = [
  {
    src: "/wichita-city.png",
    alt: "Dreamy double-exposed view of the Wichita skyline on 35mm film",
    title: "The city, softly",
    category: "35mm study",
    className: "work-card work-card-wide",
  },
  {
    src: "/parking-structure.png",
    alt: "Graphic view through a shadowy parking structure",
    title: "Negative space",
    category: "Places",
    className: "work-card work-card-tall",
  },
  {
    src: "/city-riders.png",
    alt: "Two motorcycle riders passing old city homes",
    title: "In passing",
    category: "Street / 35mm",
    className: "work-card",
  },
  {
    src: "/kansas-prairie.png",
    alt: "Power lines disappearing into a green Kansas prairie",
    title: "Meet me out there",
    category: "Landscape",
    className: "work-card work-card-wide",
  },
  {
    src: "/night-storefront.png",
    alt: "A papered-over storefront glowing at night",
    title: "After hours",
    category: "Night study",
    className: "work-card work-card-tall",
  },
  {
    src: "/brick-sky.png",
    alt: "Brick buildings silhouetted against a pale blue sky",
    title: "Looking up",
    category: "Places",
    className: "work-card",
  },
];

const services = [
  {
    number: "01",
    title: "Headshots + teams",
    copy: "Natural, polished portraits for people who would rather be doing anything else. Individual sessions, full-team portrait days, and environmental headshots.",
    note: "For humans, not résumés",
  },
  {
    number: "02",
    title: "Events + gatherings",
    copy: "The handshakes, the room, and the small in-between moments that make an event feel alive. From company celebrations to creative community nights.",
    note: "Documentary, never stiff",
  },
  {
    number: "03",
    title: "Brand + creative",
    copy: "A thoughtful mix of digital clarity and analog texture for campaigns, makers, editorial stories, and ideas that do not fit neatly in a box.",
    note: "35mm welcome here",
  },
];

const availableDays = [3, 4, 9, 10, 16, 17, 23, 24, 29];
const calendarDays: Array<number | null> = [null, null, ...Array.from({ length: 30 }, (_, i) => i + 1)];
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
          filmm<span>for</span>her<i>✦</i>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a className="nav-cta" href="#book">Check availability <span>↗</span></a>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#book">Book a date</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> Wichita, KS · 35mm + digital</p>
          <h1>Sharp work.<br /><em>Soft edges.</em></h1>
          <p className="hero-intro">
            Corporate portraits and real-life celebrations, photographed with warmth, wit, and a little bit of film grain.
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="#work">See the work <span>↓</span></a>
            <a className="text-link" href="#book">Plan something good <span>↗</span></a>
          </div>
        </div>

        <div className="hero-art" aria-label="Featured portrait by Marissa Reynolds">
          <div className="scribble scribble-one">✳</div>
          <div className="portrait-frame">
            <img src="/marissa-portrait.png" alt="Black-and-white portrait of a woman looking upward" />
            <span className="film-edge film-edge-left">KODAK 400 • 24</span>
            <span className="film-edge film-edge-right">MR 01</span>
          </div>
          <div className="photo-note">
            <span>Portraits with</span>
            <strong>presence</strong>
            <span>— without the pose.</span>
          </div>
          <div className="round-stamp" aria-hidden="true">
            <span>MADE WITH CARE • ON FILM • </span>
            <b>35</b>
          </div>
        </div>

        <div className="scroll-note" aria-hidden="true">SCROLL TO WANDER <span>↓</span></div>
      </section>

      <div className="marquee" aria-label="Photography specialties">
        <div>
          <span>HEADSHOTS</span><i>✦</i><span>EVENTS</span><i>✦</i><span>BRANDS</span><i>✦</i><span>35MM STORIES</span><i>✦</i>
          <span>HEADSHOTS</span><i>✦</i><span>EVENTS</span><i>✦</i><span>BRANDS</span><i>✦</i><span>35MM STORIES</span><i>✦</i>
        </div>
      </div>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected frames · No. 01—06</p>
            <h2>Proof that the<br /><em>in-between matters.</em></h2>
          </div>
          <p className="section-kicker">
            A little commercial. A little curious. Always looking for the thing everyone else almost missed.
          </p>
        </div>

        <div className="work-grid">
          {portfolio.map((item, index) => (
            <figure className={item.className} key={item.src}>
              <div className="work-image-wrap">
                <img src={item.src} alt={item.alt} loading={index > 1 ? "lazy" : "eager"} />
                <span className="work-index">0{index + 1}</span>
              </div>
              <figcaption>
                <h3>{item.title}</h3>
                <span>{item.category}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="hand-note hand-note-work">ordinary places,<br />kept forever ↗</p>
      </section>

      <section className="services-section" id="services">
        <div className="services-title">
          <p className="eyebrow">Ways to work together</p>
          <h2>Made for people<br />doing <em>good things.</em></h2>
          <div className="flower-mark" aria-hidden="true">✤</div>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <span className="service-number">{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </div>
              <span className="service-note">{service.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-images">
          <div className="about-main-image">
            <img src="/winter-cedar.png" alt="Snow resting on the branches of a cedar tree" loading="lazy" />
          </div>
          <div className="about-small-image">
            <img src="/marissa-portrait.png" alt="Black-and-white portrait detail" loading="lazy" />
          </div>
          <span className="tape tape-one" />
          <p className="hand-note">notice everything.<br />keep what matters.</p>
        </div>

        <div className="about-copy">
          <p className="eyebrow">Hi, I’m Marissa</p>
          <h2>Kind eyes.<br /><em>Curious camera.</em></h2>
          <p className="about-lead">
            I’m Marissa Reynolds, the photographer behind filmmforher. I make thoughtful images for people, teams, and gatherings that want to feel like themselves—not a stock photo version of themselves.
          </p>
          <p>
            My work lives somewhere between clean commercial storytelling and the odd, lovely honesty of a roll of 35mm. The result is polished enough for the boardroom, warm enough for the family archive, and never too precious to have a little fun.
          </p>
          <a className="button button-outline" href="#book">Tell me what you’re dreaming up <span>↗</span></a>
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <p className="eyebrow">The very simple process</p>
        <h2 id="process-title">No mystery. <em>Just good planning.</em></h2>
        <div className="process-grid">
          <article><span>01</span><h3>Say hello</h3><p>Choose an open date and share the basics: who, what, where, and the feeling you want.</p></article>
          <article><span>02</span><h3>Make a plan</h3><p>We’ll shape the shot list, timeline, location, and all the practical bits together.</p></article>
          <article><span>03</span><h3>Be there</h3><p>I’ll guide when needed, disappear when it matters, and deliver a gallery that feels alive.</p></article>
        </div>
      </section>

      <section className="booking-section" id="book">
        <div className="booking-intro">
          <p className="eyebrow eyebrow-light">Booking · Fall 2026</p>
          <h2>Let’s put something<br /><em>good on the calendar.</em></h2>
          <p>
            Start with a date that works. This preview calendar shows how clients can request a session; every booking is personally confirmed by Marissa.
          </p>
          <div className="booking-details">
            <div><span>01</span><p>Select an available date</p></div>
            <div><span>02</span><p>Choose a starting time</p></div>
            <div><span>03</span><p>Share a few project details</p></div>
          </div>
          <p className="booking-aside">Need a full-day event or a date not shown? Include it in your note.</p>
        </div>

        <div className="booking-card">
          {!requestSent ? (
            <>
              <div className="calendar-head">
                <div>
                  <span>Availability</span>
                  <h3>September 2026</h3>
                </div>
                <div className="calendar-key"><i /> Open dates</div>
              </div>
              <div className="calendar-weekdays" aria-hidden="true">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}
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
                      onClick={() => { setSelectedDay(day); setSelectedTime(""); }}
                      aria-label={`${available ? 'Available' : 'Unavailable'} September ${day}`}
                      aria-pressed={selected}
                      key={day}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="booking-divider" />

              <form className="booking-form" onSubmit={handleRequest}>
                <div className="time-picker">
                  <div className="form-label">{selectedDay ? `September ${selectedDay} · choose a time` : "Choose a date to see times"}</div>
                  <div className="time-options">
                    {times.map(time => (
                      <button
                        type="button"
                        disabled={!selectedDay}
                        className={selectedTime === time ? "selected" : ""}
                        onClick={() => setSelectedTime(time)}
                        aria-pressed={selectedTime === time}
                        key={time}
                      >{time}</button>
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
                  <span>What are we making?</span>
                  <select name="project" defaultValue="">
                    <option value="" disabled>Choose a project type</option>
                    <option>Headshots + team portraits</option>
                    <option>Corporate event</option>
                    <option>Creative event</option>
                    <option>Brand + editorial</option>
                    <option>Something else entirely</option>
                  </select>
                </label>
                <label>
                  <span>A few details</span>
                  <textarea name="details" rows={3} placeholder="Tell Marissa about the people, place, and feeling…" />
                </label>
                <button className="button button-book" type="submit" disabled={!selectedDay || !selectedTime}>
                  Request this date <span>↗</span>
                </button>
                <p className="form-note">Demo only—no message is sent yet. Connect a scheduling service before launch.</p>
              </form>
            </>
          ) : (
            <div className="success-state" aria-live="polite">
              <span>✦</span>
              <p className="eyebrow">Request ready</p>
              <h3>September {selectedDay}<br />at {selectedTime}</h3>
              <p>This is how a completed request will look. In the live version, Marissa would receive the details and follow up personally.</p>
              <button className="button button-outline" onClick={() => setRequestSent(false)}>Try another date</button>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <p>Have camera,<br /><em>will wander.</em></p>
          <a href="#book">Start a project <span>↗</span></a>
        </div>
        <div className="footer-bottom">
          <a className="wordmark wordmark-footer" href="#top">filmm<span>for</span>her<i>✦</i></a>
          <p>Photography by Marissa Reynolds · Wichita, Kansas</p>
          <p>© 2026 · Made with care & a little grain</p>
        </div>
      </footer>
    </main>
  );
}
