import { BookingExperience } from "./booking-experience";
import { SiteHeader } from "./site-header";

const portfolio = [
  {
    src: "/wichita-city.png",
    alt: "Double-exposed view of the Wichita skyline on 35mm film",
    title: "Wichita Study I",
    medium: "35mm / Double exposure",
    className: "project project-wide",
    width: 968,
    height: 642,
  },
  {
    src: "/parking-structure.png",
    alt: "Structural view through a shadowed parking garage",
    title: "Understructure",
    medium: "35mm / Architecture",
    className: "project project-vertical",
    width: 906,
    height: 599,
  },
  {
    src: "/city-riders.png",
    alt: "Two motorcycle riders passing homes on a city street",
    title: "Passing Figures",
    medium: "35mm / Street",
    className: "project project-standard",
    width: 907,
    height: 605,
  },
  {
    src: "/kansas-prairie.png",
    alt: "Power lines receding into a green Kansas prairie",
    title: "Prairie Line",
    medium: "35mm / Landscape",
    className: "project project-panorama",
    width: 909,
    height: 603,
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
    copy: "Image-led stories for artists, independent brands, publications, and ideas that need a less conventional point of view, on digital, 35mm, or both.",
    detail: "Campaigns / Editorial / 35mm",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">Marissa Reynolds / Photographer</p>
          <h1>Images<br />with <em>weight.</em></h1>
          <div className="hero-summary">
            <p>
              Corporate portraiture, events, and independent work photographed with precision and the emotional texture of film.
            </p>
            <a className="arrow-link" href="#work">View selected work <span>↓</span></a>
          </div>
        </div>

        <figure className="hero-figure">
          <img
            src="/marissa-portrait.png"
            alt="Black-and-white portrait of a woman looking upward"
            width={960}
            height={959}
            fetchPriority="high"
            decoding="async"
          />
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
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                />
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
          <img
            src="/parking-structure.png"
            alt="Graphic architectural study through a parking structure"
            width={906}
            height={599}
            loading="lazy"
            decoding="async"
          />
          <span>MR / 2026</span>
        </div>
        <div className="about-copy">
          <p className="section-index">03 / Profile</p>
          <h2>Marissa<br />Reynolds</h2>
          <p className="about-lead">
            I photograph people, work, and gatherings. My approach is observant and composed, attentive to gesture, architecture, light, and the quiet tension that makes a frame last.
          </p>
          <p>
            I work across corporate headshots, organizational events, and self-directed 35mm practice. I shape each commission to feel exact without becoming sterile, and natural without becoming casual.
          </p>
          <dl className="profile-details">
            <div><dt>Based</dt><dd>Wichita, Kansas</dd></div>
            <div><dt>Working in</dt><dd>Digital / 35mm</dd></div>
            <div><dt>Available for</dt><dd>Local and regional work</dd></div>
          </dl>
          <a className="arrow-link" href="#book">Discuss a commission <span>↗</span></a>
        </div>
      </section>

      <section className="booking-section" id="book">
        <div className="booking-intro">
          <p className="section-index">04 / Inquiries</p>
          <h2>Begin a<br /><em>conversation.</em></h2>
          <p>
            Select an available date and send me a short project brief. I personally review and confirm every request!
          </p>
          <div className="booking-notes">
            <p><span>For</span>Portraits, events, editorial, and creative commissions</p>
            <p><span>Response</span>Within two business days</p>
            <p><span>Travel</span>Available throughout the region</p>
          </div>
        </div>

        <BookingExperience />
      </section>
      </main>
      <footer className="site-footer">
        <div className="footer-title">
          <span>Photography by</span>
          <p>Marissa Reynolds</p>
        </div>
        <div className="footer-bottom">
          <a className="wordmark wordmark-footer" href="#top" aria-label="FILMM/FORHER home">FILMM<span>/</span>FORHER</a>
          <p>Wichita, Kansas / Regional commissions</p>
          <p>© 2026</p>
          <a href="#book">Inquire <span>↑</span></a>
        </div>
      </footer>
    </>
  );
}
