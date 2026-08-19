import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost:3000/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the editorial portfolio and booking experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>FILMM\/FORHER \| Photography by Marissa Reynolds<\/title>/i);
  assert.match(html, /Images/);
  assert.match(html, /with <em>weight\.<\/em>/);
  assert.match(html, /Executive portraiture/);
  assert.match(html, /I photograph people, work, and gatherings\./);
  assert.match(html, /I personally review and confirm every request!/);
  assert.doesNotMatch(html, /Marissa personally reviews|She works across/);
  assert.match(html, /September 2026/);
  assert.match(html, /Request date/);
  assert.match(html, /http:\/\/localhost:3000\/og-serious\.png/);
  assert.match(html, /Skip to content/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /ProfessionalService/);
  assert.match(html, /rel="canonical"/);
  assert.doesNotMatch(html, /\u2014|&mdash;/i);
  assert.doesNotMatch(html, /codex-preview|Starter Project|react-loading-skeleton/i);
});

test("keeps the finished site responsive, accessible, and self-contained", async () => {
  const [page, booking, header, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/booking-experience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/site-header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /^"use client";/);
  assert.match(booking, /^"use client";/);
  assert.match(header, /^"use client";/);
  assert.match(booking, /const availableDays = \[/);
  assert.match(booking, /setRequestSent\(true\)/);
  assert.match(booking, /autoComplete="name"/);
  assert.match(booking, /Demonstration only\. No request is sent from this preview\./);
  assert.match(page, /fetchPriority="high"/);
  assert.match(page, /className="skip-link"/);
  assert.doesNotMatch(`${page}${booking}${header}${layout}`, /\u2014|&mdash;/i);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /ProfessionalService/);
  assert.match(layout, /canonical/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.skip-link/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/marissa-portrait.png", import.meta.url)),
    access(new URL("../public/og-serious.png", import.meta.url)),
  ]);
});
