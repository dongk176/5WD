import HomeHeroCta from "@/components/HomeHeroCta";
import HomeHeroHeightLock from "@/components/HomeHeroHeightLock";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/db";
import { socialLinks } from "@/lib/social-links";
import { resolveAssetUrl } from "@/lib/storage";
import { submitContactInquiry } from "./contact/actions";

export const dynamic = "force-dynamic";

function formatTourDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}월 ${day}, ${year}`;
}

function albumTypeLabel(type: string): string {
  if (type === "EP") return "EP";
  if (type === "SINGLE") return "SINGLE";
  return "FULL ALBUM";
}

export default async function Home() {
  const [tourRows, releasesRaw, galleryRaw] = await Promise.all([
    prisma.tourEvent.findMany({
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
    }),
    prisma.discographyRelease.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.galleryPhoto.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const [releases, galleryItems] = await Promise.all([
    Promise.all(
      releasesRaw.map(async (release) => ({
        ...release,
        coverUrl: await resolveAssetUrl(release.coverAsset),
      })),
    ),
    Promise.all(
      galleryRaw.map(async (item) => ({
        ...item,
        photoUrl: await resolveAssetUrl(item.photoAsset),
      })),
    ),
  ]);
  const homeTourRows = tourRows.slice(0, 3);
  const hasMoreTours = tourRows.length > 3;

  return (
    <div className="bg-background-light text-charcoal selection:bg-charcoal selection:text-white">
      <SiteHeader logoAnimation="roll-in" />

      <section
        id="home-hero"
        className="relative flex h-[var(--home-hero-height,clamp(720px,78vh,820px))] min-h-[var(--home-hero-height,clamp(720px,78vh,820px))] w-full items-center justify-center overflow-hidden bg-white md:h-screen md:min-h-screen"
      >
        <HomeHeroHeightLock />
        <div className="absolute inset-0 z-10 bg-white/20" />
        <img
          src="/home/main-mobile.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_44%] opacity-90 md:hidden"
        />
        <img
          src="/home/main.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 hidden h-full w-full select-none object-cover object-[center_44%] opacity-90 md:block"
        />
        <HomeHeroCta />
        <div className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 animate-bounce md:bottom-10 md:block">
          <svg
            aria-hidden="true"
            className="h-8 w-8 text-charcoal opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
      </section>

      <section id="tour" className="mx-auto max-w-5xl bg-white px-6 py-32">
        <div className="mb-20">
          <h2 className="home-reveal home-delay-1 mb-2 text-2xl font-light tracking-[0.3em] uppercase">Tour</h2>
          <div className="home-reveal home-delay-2 h-px w-10 bg-slate-300" />
        </div>
        <div className="space-y-0">
          {homeTourRows.map((tour, index) => (
            <div
              key={tour.id}
              className="home-reveal group flex flex-col items-start justify-between border-b border-slate-100 px-4 py-10 transition-colors hover:bg-slate-50 md:flex-row md:items-center"
              style={{ animationDelay: `${140 + index * 45}ms` }}
            >
              <div className="mb-4 flex flex-col gap-1 md:mb-0">
                <span className="text-xs tracking-widest text-slate-400 uppercase">{formatTourDate(tour.eventDate)}</span>
                <h3 className="text-xl font-medium tracking-tight">{tour.eventName}</h3>
              </div>
              <div className="mb-6 flex flex-col gap-1 md:mb-0 md:items-end">
                <span className="text-sm font-light text-slate-500">{tour.eventTime}</span>
                <span className="text-sm font-light text-slate-500">{tour.location}</span>
              </div>
              {tour.isSoldOut ? (
                <button
                  className="cursor-not-allowed border border-slate-200 bg-transparent px-8 py-3 text-xs tracking-widest text-slate-400 uppercase"
                  type="button"
                >
                  Sold Out
                </button>
              ) : tour.ticketUrl ? (
                <a
                  href={tour.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-charcoal bg-transparent px-8 py-3 text-xs tracking-widest uppercase transition-all hover:bg-charcoal hover:text-white"
                >
                  Tickets
                </a>
              ) : (
                <button
                  className="cursor-not-allowed border border-slate-200 bg-transparent px-8 py-3 text-xs tracking-widest text-slate-400 uppercase"
                  type="button"
                >
                  Open Soon
                </button>
              )}
            </div>
          ))}
          {homeTourRows.length === 0 && <p className="px-4 py-12 text-sm text-slate-400">등록된 공연 일정이 없습니다.</p>}
        </div>
        {hasMoreTours && (
          <div className="mt-10 flex justify-center">
            <a
              href="/tour"
              className="border border-charcoal px-8 py-3 text-xs font-bold tracking-[0.22em] text-charcoal uppercase transition hover:bg-charcoal hover:text-white"
            >
              View All
            </a>
          </div>
        )}
      </section>

      <section id="music" className="bg-[#F9F9F9] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20">
            <h2 className="home-reveal home-delay-1 mb-2 text-2xl font-light tracking-[0.3em] uppercase">Discography</h2>
            <div className="home-reveal home-delay-2 h-px w-10 bg-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4">
            {releases.map((album, index) => (
              <a
                key={album.id}
                href={album.streamingUrl}
                target="_blank"
                rel="noreferrer"
                className="home-reveal group cursor-pointer space-y-4"
                style={{ animationDelay: `${160 + index * 40}ms` }}
              >
                <div className="aspect-square overflow-hidden bg-slate-100 shadow-sm">
                  {album.coverUrl ? (
                    <img
                      alt="Album cover"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={album.coverUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No Cover</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight uppercase">{album.title}</h4>
                  <p className="text-[10px] tracking-widest text-slate-400 uppercase">
                    {albumTypeLabel(album.albumType)} • {album.releaseYear}
                  </p>
                </div>
              </a>
            ))}
            {releases.length === 0 && <p className="text-sm text-slate-400">등록된 앨범이 없습니다.</p>}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-white py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20">
            <h2 className="home-reveal home-delay-1 mb-2 text-2xl font-light tracking-[0.3em] uppercase">Gallery</h2>
            <div className="home-reveal home-delay-2 h-px w-10 bg-slate-300" />
          </div>
          <div className="masonry-grid">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className="home-reveal masonry-item cursor-zoom-in overflow-hidden border border-slate-100 opacity-90 transition-all duration-700 hover:opacity-100"
                style={{ animationDelay: `${160 + index * 35}ms` }}
              >
                {item.photoUrl ? (
                  <img alt={item.caption || "Gallery"} src={item.photoUrl} />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">No image</div>
                )}
              </div>
            ))}
            {galleryItems.length === 0 && <p className="text-sm text-slate-400">등록된 사진이 없습니다.</p>}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-100 bg-[#F9F9F9] py-32">
        <div className="mx-auto max-w-7xl px-6">
          <section className="py-16 md:py-24">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
              <div>
                <h2 className="home-reveal home-delay-1 mb-10 text-5xl font-bold tracking-tight uppercase md:text-6xl">Contact</h2>

                <div className="space-y-10">
                  <div className="home-reveal home-delay-2">
                    <div>
                      <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">이메일</p>
                      <p className="text-xl font-bold tracking-tighter md:text-2xl">band5wheeldrive@gmail.com</p>
                    </div>
                  </div>

                  <div className="home-reveal home-delay-3">
                    <div>
                      <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">전화번호</p>
                      <p className="text-xl font-bold tracking-tighter md:text-2xl">010-3581-8879</p>
                    </div>
                  </div>

                  <div className="home-reveal home-delay-4">
                    <p className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">SNS</p>
                    <div className="overflow-x-auto pb-1">
                      <div className="flex min-w-max flex-nowrap items-center gap-6">
                        {socialLinks.map((social) => (
                          <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={social.label}
                            className="shrink-0 opacity-80 transition-all hover:scale-105 hover:opacity-100"
                          >
                            <img src={social.icon} alt={social.label} className="h-9 w-9 object-contain md:h-11 md:w-11" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="home-reveal home-delay-2 border border-slate-200 bg-white p-8 md:p-12">
                <form action={submitContactInquiry} className="space-y-8">
                  <div>
                    <label className="mb-2 block text-sm font-bold tracking-widest text-primary uppercase">
                      Name / Company <span className="align-middle text-[10px] text-slate-400">(required)</span>
                    </label>
                    <input
                      required
                      name="nameCompany"
                      className="w-full border-0 border-b border-primary/30 bg-transparent p-2 focus:border-primary focus:ring-0"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold tracking-widest text-primary uppercase">
                      Email <span className="align-middle text-[10px] text-slate-400">(required)</span>
                    </label>
                    <input
                      required
                      name="email"
                      className="w-full border-0 border-b border-primary/30 bg-transparent p-2 focus:border-primary focus:ring-0"
                      type="email"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold tracking-widest text-primary uppercase">
                      Message <span className="align-middle text-[10px] text-slate-400">(required)</span>
                    </label>
                    <textarea
                      required
                      name="message"
                      className="w-full border-0 border-b border-primary/30 bg-transparent p-2 focus:border-primary focus:ring-0"
                      rows={4}
                    />
                  </div>

                  <button
                    className="bg-primary px-12 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-primary/90"
                    type="submit"
                  >
                    Send Inquiry
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-6 md:flex-row">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max flex-nowrap items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="shrink-0 opacity-80 transition-all hover:opacity-100 hover:scale-105"
                >
                  <img src={social.icon} alt={social.label} className="h-9 w-9 object-contain md:h-11 md:w-11" />
                </a>
              ))}
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] tracking-[0.2em] text-slate-300 uppercase">
              © 2024 Archive. All rights reserved.
            </p>
            <p className="mt-1 text-[8px] tracking-[0.1em] text-slate-200 uppercase">Privacy Policy / Terms of Use</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
