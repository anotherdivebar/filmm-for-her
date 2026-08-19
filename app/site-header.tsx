"use client";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="FILMM/FORHER home">
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
        <nav
          aria-label="Mobile navigation"
          onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
        >
          <a href="#work">Selected work</a>
          <a href="#services">Services</a>
          <a href="#about">Profile</a>
          <a href="#book">Inquire</a>
        </nav>
      </details>
    </header>
  );
}
