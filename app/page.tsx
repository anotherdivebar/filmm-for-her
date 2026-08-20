import Image from "next/image";
import { BookingExperience } from "./booking-experience";
import { CinematicStage } from "./cinematic-stage";
import { SiteHeader } from "./site-header";

const work = [
  {
    src: "/wichita-city.png",
    alt: "Double-exposed view of the Wichita skyline on 35mm film",
    title: "Wichita Study I",
    medium: "35mm / Double exposure",
    note: "A familiar skyline held between two exposures and one uncertain moment.",
    width: 968,
    height: 642,
  },
  {
    src: "/parking-structure.png",
    alt: "Structural view through a shadowed parking garage",
    title: "Understructure",
    medium: "35mm / Architecture",
    note: "Structure, interruption, and the soft geometry of daylight.",
    width: 906,
    height: 599,
  },
  {
    src: "/city-riders.png",
    alt: "Two motorcycle riders passing homes on a city street",
    title: "Passing Figures",
    medium: "35mm / Street",
    note: "A passing gesture preserved before the street settles again.",
    width: 907,
    height: 605,
  },
  {
    src: "/kansas-prairie.png",
    alt: "Power lines receding into a green Kansas prairie",
    title: "Prairie Line",
    medium: "35mm / Landscape",
    note: "The measured distance between infrastructure and open land.",
    width: 909,
    height: 603,
  },
];

const services = [
  ["01", "Executive portraiture", "Individuals, leadership teams, and portrait days."],
  ["02", "Events & organizations", "Conferences, culture, community, and institutional stories."],
  ["03", "Editorial & commissions", "Artists, publications, independent brands, and 35mm studies."],
];

export default function Home() {
  return (
    <>
      <CinematicStage />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />

      <main className="cinematic-page" id="main-content" tabIndex={-1}>
        <section className="shot shot-arrival" id="top">
          <div className="shot-frame hero-frame">
            <p className="shot-index">A FILMM/FORHER presentation / Scene 01</p>
            <div className="hero-title">
              <p>Marissa Reynolds / Photographer / Wichita, Kansas</p>
              <h1>Images<br /><em>with weight.</em></h1>
            </div>
            <div className="hero-coda">
              <p>
                Corporate portraiture, events, and independent work shaped with precision and the emotional texture of film.
              </p>
              <a className="cinematic-link" href="#work">Enter the work <span aria-hidden="true">&darr;</span></a>
            </div>
            <p className="frame-note">
              <span>Corporate / Editorial / 35mm</span>
              <span>Scroll to move through the space</span>
            </p>
          </div>
        </section>

        <section className="shot shot-services" id="services">
          <div className="shot-frame services-frame">
            <p className="shot-index">Scene 02 / The approach</p>
            <div className="services-statement">
              <p className="eyebrow">A composed presence on set</p>
              <h2>Direction<br /><em>without theater.</em></h2>
              <p>
                I make the room feel easy, then pay close attention. The result is clear enough for business and human enough to last.
              </p>
            </div>
            <div className="cinematic-services" aria-label="Photography services">
              {services.map(([number, title, detail]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shot shot-work" id="work" aria-label="Selected photography">
          <div className="work-heading">
            <p className="shot-index">Scene 03 / The archive</p>
            <h2>Work, in<br /><em>sequence.</em></h2>
            <p>Four studies made across Wichita and the Midwest, encountered one frame at a time.</p>
          </div>
          <div className="immersive-reel">
            <div className="reel-fallback-grid" aria-hidden="true">
              {work.map((item) => (
                <figure key={item.src}>
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    quality={88}
                    sizes="(max-width: 700px) 46vw, 32vw"
                  />
                </figure>
              ))}
            </div>
            <ol className="visually-hidden">
              {work.map((item) => (
                <li key={item.src}>
                  {item.title}. {item.medium}. {item.alt} {item.note}
                </li>
              ))}
            </ol>
            <p className="reel-instruction" aria-hidden="true">Move through the sequence</p>
          </div>
        </section>

        <section className="shot shot-profile" id="about">
          <div className="shot-frame profile-frame">
            <p className="shot-index">Scene 04 / The photographer</p>
            <div className="profile-copy">
              <p className="eyebrow">Observant / Composed / Direct</p>
              <h2>Marissa<br />Reynolds</h2>
              <p className="profile-lead">
                I photograph people, work, and gatherings. I am attentive to gesture, architecture, light, and the quiet tension that makes a frame last.
              </p>
              <p>
                My practice moves between corporate headshots, organizational events, and self-directed 35mm work. Each commission is exact without becoming sterile and natural without becoming casual.
              </p>
              <dl className="profile-facts">
                <div><dt>Based</dt><dd>Wichita, Kansas</dd></div>
                <div><dt>Working in</dt><dd>Digital / 35mm</dd></div>
                <div><dt>Available for</dt><dd>Local and regional work</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="shot shot-inquiry" id="book">
          <div className="inquiry-heading">
            <p className="shot-index">Scene 05 / Closing shot</p>
            <h2>Begin a<br /><em>conversation.</em></h2>
            <p>
              Select an available date and send me a short project brief. I personally review and confirm every request!
            </p>
          </div>
          <BookingExperience />
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <span>Photography by</span>
          <p>Marissa Reynolds</p>
        </div>
        <div className="footer-line">
          <a href="#top">FILMM/FORHER</a>
          <span>Wichita, Kansas</span>
          <span>&copy; 2026</span>
          <a href="#book">Inquire <span aria-hidden="true">&uarr;</span></a>
        </div>
      </footer>
    </>
  );
}
