import SiteHeader from "@/components/SiteHeader";
import DiscographyVideoCard from "@/components/DiscographyVideoCard";
import { prisma } from "@/lib/db";
import { resolveAssetUrl } from "@/lib/storage";
import { socialLinks } from "@/lib/social-links";
import { getYouTubeEmbedUrl, getYouTubeThumbnailCandidates } from "@/lib/video-utils";

export const dynamic = "force-dynamic";

export default async function VideoPage() {
  const videosRaw = await prisma.discographyVideo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const videos = await Promise.all(
    videosRaw.map(async (video) => ({
      ...video,
      videoUrl: await resolveAssetUrl(video.videoAsset),
      thumbnailUrl: await resolveAssetUrl(video.thumbnailAsset),
      embedUrl: getYouTubeEmbedUrl(video.videoAsset),
      youtubeThumbCandidates: getYouTubeThumbnailCandidates(video.videoAsset),
    })),
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light text-charcoal antialiased">
      <SiteHeader active="video" />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pt-28 pb-12 lg:px-20">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="mb-16 space-y-4">
            <h2 className="page-reveal page-delay-1 text-5xl font-light tracking-tight">Video</h2>
          </div>

          <div className="flex flex-col gap-14">
            {videos.map((video, index) => (
              <div key={video.id} className="page-reveal" style={{ animationDelay: `${180 + index * 70}ms` }}>
                <DiscographyVideoCard
                  title={video.title}
                  embedUrl={video.embedUrl}
                  videoUrl={video.videoUrl}
                  thumbnailUrl={video.thumbnailUrl || video.youtubeThumbCandidates[0] || null}
                  thumbnailCandidates={video.youtubeThumbCandidates}
                />
              </div>
            ))}
            {videos.length === 0 && <p className="text-center text-sm text-slate-400">등록된 영상이 없습니다.</p>}
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
