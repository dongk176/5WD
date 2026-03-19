import GalleryPhotoGrid from "@/components/GalleryPhotoGrid";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/db";
import { resolveAssetUrl } from "@/lib/storage";
import { socialLinks } from "@/lib/social-links";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryRaw = await prisma.galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const galleryItems = await Promise.all(
    galleryRaw.map(async (item) => ({
      ...item,
      photoUrl: await resolveAssetUrl(item.photoAsset),
    })),
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light text-charcoal antialiased">
      <SiteHeader active="gallery" />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pt-28 pb-12 lg:px-20">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="mb-16">
            <h2 className="page-reveal page-delay-1 text-5xl font-light tracking-tight">Gallery</h2>
          </div>

          <GalleryPhotoGrid items={galleryItems} revealStartDelay={180} />
        </div>
      </main>

      <footer className="mx-auto w-full max-w-[1440px] border-t border-slate-200 px-6 py-12 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-xs font-medium tracking-[0.2em] uppercase opacity-50">© 2024 5WD</div>
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
