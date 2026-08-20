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

test("server-renders the cinematic portfolio and booking experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>FILMM\/FORHER \| Photography by Marissa Reynolds<\/title>/i);
  assert.match(html, /Images/);
  assert.match(html, /Images<br\/><em>with weight\.<\/em>/);
  assert.match(html, /Direction/);
  assert.match(html, /Work, in/);
  assert.match(html, /Wichita Study I/);
  assert.match(html, /Executive portraiture/);
  assert.match(html, /I photograph people, work, and gatherings\./);
  assert.match(html, /I personally review and confirm every request!/);
  assert.doesNotMatch(html, /Marissa personally reviews|She works across/);
  assert.match(html, /September 2026/);
  assert.match(html, /Request date/);
  assert.match(html, /http:\/\/localhost:3000\/og-cinematic\.png/);
  assert.match(html, /Skip to content/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /ProfessionalService/);
  assert.match(html, /rel="canonical"/);
  assert.doesNotMatch(html, /\u2014|&mdash;/i);
  assert.doesNotMatch(html, /codex-preview|Starter Project|react-loading-skeleton/i);
});

test("keeps the experiment responsive, accessible, and self-contained", async () => {
  const [page, stage, scene, booking, header, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/cinematic-stage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/cinematic-scene.tsx", import.meta.url), "utf8"),
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
  assert.match(page, /<CinematicStage \/>/);
  assert.match(page, /from "next\/image"/);
  assert.match(page, /className="skip-link"/);
  assert.match(stage, /^"use client";/);
  assert.match(stage, /dynamic\(/);
  assert.match(stage, /ssr: false/);
  assert.match(scene, /^"use client";/);
  assert.match(scene, /<Canvas/);
  assert.match(scene, /useFrame/);
  assert.match(scene, /prefers-reduced-motion: reduce/);
  assert.match(scene, /\/marissa-portrait\.png/);
  assert.match(scene, /createFeatherTexture/);
  assert.match(scene, /alphaMap=\{featherTexture\}/);
  assert.match(scene, /MeshReflectorMaterial/);
  assert.match(scene, /EffectComposer/);
  assert.match(scene, /<Bloom/);
  assert.match(scene, /toneMappingExposure = 1\.02/);
  assert.doesNotMatch(`${page}${booking}${header}${layout}`, /\u2014|&mdash;/i);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /ProfessionalService/);
  assert.match(layout, /canonical/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.skip-link/);
  assert.match(css, /\.cinematic-loader/);
  assert.match(css, /\.film-treatment/);
  assert.match(css, /mask-image:/);
  assert.match(css, /\.spatial-chapter/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(packageJson, /@react-three\/postprocessing/);

  await Promise.all([
    access(new URL("../public/marissa-portrait.png", import.meta.url)),
    access(new URL("../public/og-cinematic.png", import.meta.url)),
  ]);
});
