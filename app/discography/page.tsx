import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/db";
import { resolveAssetUrl } from "@/lib/storage";
import { socialLinks } from "@/lib/social-links";

function albumTypeLabel(type: string): string {
  if (type === "EP") return "EP";
  if (type === "SINGLE") return "SINGLE";
  return "FULL ALBUM";
}

export default async function DiscographyPage() {
  const releasesRaw = await prisma.discographyRelease.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const releases = await Promise.all(
    releasesRaw.map(async (release) => ({
      ...release,
      coverUrl: await resolveAssetUrl(release.coverAsset),
    })),
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light text-charcoal antialiased">
      <SiteHeader active="discography" />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pt-28 pb-12 lg:px-20">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="mb-16 space-y-4">
            <h2 className="text-5xl font-light tracking-tight">Discography</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {releases.map((release) => (
              <a
                key={release.id}
                href={release.streamingUrl}
                target="_blank"
                rel="noreferrer"
                className="group cursor-pointer"
              >
                <div className="mb-4 aspect-square overflow-hidden">
                  {release.coverUrl ? (
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={release.coverUrl}
                      alt={release.title}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No Cover</div>
                  )}
                </div>
                <h4 className="mb-1 text-sm font-medium transition-colors group-hover:text-primary">{release.title}</h4>
                <p className="text-xs text-slate-400">
                  {release.releaseYear} • {albumTypeLabel(release.albumType)}
                </p>
              </a>
            ))}
            {releases.length === 0 && <p className="text-sm text-slate-400">등록된 앨범이 없습니다.</p>}
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-[1440px] border-t border-slate-200 px-6 py-12 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-xs font-medium tracking-widest text-slate-400 uppercase">© 2026 5WD. All Rights Reserved.</div>
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                <img src={social.icon} alt={social.label} className="h-8 w-8 object-contain opacity-80 transition hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
