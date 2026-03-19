import AdminFileInput from "@/components/AdminFileInput";
import FormConfirmGuard from "@/components/FormConfirmGuard";
import SiteHeader from "@/components/SiteHeader";
import YouTubeThumbnailWithFallback from "@/components/YouTubeThumbnailWithFallback";
import { prisma } from "@/lib/db";
import { resolveAssetUrl } from "@/lib/storage";
import { getYouTubeEmbedUrl, getYouTubeThumbnailCandidates } from "@/lib/video-utils";
import {
  createDiscographyVideo,
  createDiscographyRelease,
  createGalleryPhoto,
  createTeamMember,
  createTourEvent,
  deleteDiscographyVideo,
  deleteDiscographyRelease,
  deleteGalleryPhoto,
  deleteTeamMember,
  deleteTourEvent,
  updateDiscographyVideo,
  updateDiscographyRelease,
  updateGalleryPhoto,
  updateTeamHero,
  updateTeamMember,
  updateTourEvent,
} from "./actions";

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function displayDate(date: Date): string {
  return dateInputValue(date).replaceAll("-", ".");
}

function albumTypeLabel(albumType: string): string {
  if (albumType === "EP") return "EP";
  if (albumType === "SINGLE") return "SINGLE";
  return "FULL ALBUM";
}

function getAssetFileName(asset: string | null | undefined): string {
  if (!asset) return "";
  const noQuery = asset.split("?")[0] ?? "";
  const trimmed = noQuery.endsWith("/") ? noQuery.slice(0, -1) : noQuery;
  const fileName = trimmed.split("/").pop() ?? "";
  if (!fileName) return "";
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

export default async function AdminPage() {
  const [tourEvents, releasesRaw, videosRaw, photosRaw, inquiries, teamConfig, teamMembersRaw] = await Promise.all([
    prisma.tourEvent.findMany({
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
    }),
    prisma.discographyRelease.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.discographyVideo.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.galleryPhoto.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.teamConfig.findUnique({
      where: { id: 1 },
    }),
    prisma.teamMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const releases = await Promise.all(
    releasesRaw.map(async (release) => ({
      ...release,
      coverUrl: await resolveAssetUrl(release.coverAsset),
    })),
  );

  const videos = await Promise.all(
    videosRaw.map(async (video) => ({
      ...video,
      videoUrl: await resolveAssetUrl(video.videoAsset),
      thumbnailUrl: await resolveAssetUrl(video.thumbnailAsset),
      embedUrl: getYouTubeEmbedUrl(video.videoAsset),
      youtubeThumbCandidates: getYouTubeThumbnailCandidates(video.videoAsset),
      adminThumbCandidates: (() => {
        const candidates = getYouTubeThumbnailCandidates(video.videoAsset);
        const hq = candidates.filter((url) => url.includes("/hqdefault.jpg"));
        const sdJpg = candidates.filter((url) => url.includes("/sddefault.jpg"));
        const mq = candidates.filter((url) => url.includes("/mqdefault.jpg"));
        const sdWebp = candidates.filter((url) => url.includes("/sddefault.webp"));
        const maxres = candidates.filter((url) => url.includes("/maxresdefault"));
        return [...hq, ...sdJpg, ...mq, ...sdWebp, ...maxres];
      })(),
    })),
  );

  const photos = await Promise.all(
    photosRaw.map(async (photo) => ({
      ...photo,
      photoUrl: await resolveAssetUrl(photo.photoAsset),
    })),
  );

  const teamHeroUrl = await resolveAssetUrl(teamConfig?.heroAsset);
  const teamMembers = await Promise.all(
    teamMembersRaw.map(async (member) => ({
      ...member,
      photoUrl: await resolveAssetUrl(member.photoAsset),
    })),
  );

  return (
    <div className="min-h-screen bg-background-light text-charcoal">
      <FormConfirmGuard />
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <h1 className="mb-10 text-4xl font-bold tracking-tight">Admin</h1>

        <section className="mb-16 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">공연 일정 등록</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 text-lg font-bold">새 일정 추가</h3>
              <form action={createTourEvent} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="date"
                  name="eventDate"
                  required
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  name="eventName"
                  required
                  placeholder="공연 이름"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="time"
                  name="eventTime"
                  required
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="장소"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none md:col-span-2"
                />
                <input
                  type="url"
                  name="ticketUrl"
                  placeholder="티켓 링크"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none md:col-span-2"
                />
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" name="isSoldOut" className="size-4 accent-primary" />
                  Sold Out 처리
                </label>
                <button
                  type="submit"
                  className="rounded bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-primary/90 md:justify-self-end"
                >
                  추가
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {tourEvents.length === 0 && (
                <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                  등록된 공연 일정이 없습니다.
                </div>
              )}

              {tourEvents.map((event) => (
                <details key={event.id} className="group rounded-xl border border-slate-200 bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                        {displayDate(event.eventDate)} / {event.eventTime}
                      </p>
                      <p className="truncate text-base font-semibold text-charcoal">{event.eventName}</p>
                      <p className="truncate text-sm text-slate-500">{event.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {event.isSoldOut ? (
                        <span className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                          Sold Out
                        </span>
                      ) : (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-primary uppercase">
                          Open
                        </span>
                      )}
                      <svg
                        className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </summary>

                  <div className="border-t border-slate-200 p-4">
                    <form action={updateTourEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          type="date"
                          name="eventDate"
                          defaultValue={dateInputValue(event.eventDate)}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          name="eventName"
                          defaultValue={event.eventName}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="time"
                          name="eventTime"
                          defaultValue={event.eventTime}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          name="location"
                          defaultValue={event.location}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none md:col-span-2"
                        />
                        <input
                          type="url"
                          name="ticketUrl"
                          defaultValue={event.ticketUrl ?? ""}
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none md:col-span-2"
                        />
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            name="isSoldOut"
                            defaultChecked={event.isSoldOut}
                            className="size-4 accent-primary"
                          />
                          Sold Out
                        </label>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="submit"
                          className="rounded bg-charcoal px-4 py-2 text-xs font-bold tracking-widest text-white uppercase transition hover:opacity-90"
                        >
                          수정 저장
                        </button>
                        <button
                          type="submit"
                          formAction={deleteTourEvent}
                          data-confirm="이 공연 일정을 삭제할까요?"
                          className="rounded border border-red-300 px-4 py-2 text-xs font-bold tracking-widest text-red-500 uppercase transition hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Discography 등록</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="mb-4 text-lg font-bold">앨범 업로드</h3>
                <p className="mb-4 text-sm text-slate-500">앨범 정보와 커버 이미지 파일을 등록합니다.</p>
                <form action={createDiscographyRelease} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="앨범 제목"
                    className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                  <select
                    name="albumType"
                    defaultValue="FULL_ALBUM"
                    className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  >
                    <option value="FULL_ALBUM">FULL ALBUM</option>
                    <option value="EP">EP</option>
                    <option value="SINGLE">SINGLE</option>
                  </select>
                  <input
                    type="number"
                    name="releaseYear"
                    required
                    min={1990}
                    max={2100}
                    placeholder="발매년도"
                    className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                  <input
                    type="url"
                    name="streamingUrl"
                    required
                    placeholder="스트리밍 링크"
                    className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={releases.length + 1}
                    min={1}
                    placeholder="표시 순서"
                    className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                  <div className="md:col-span-2">
                    <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">앨범 커버 이미지 파일</p>
                    <input
                      type="file"
                      name="coverFile"
                      accept="image/*"
                      className="w-full rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-primary/90 md:col-span-2 md:justify-self-end"
                  >
                    앨범 추가
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-4 text-lg font-bold">등록된 앨범</h3>
                <div className="space-y-4">
                  {releases.length === 0 && <div className="text-sm text-slate-500">등록된 앨범이 없습니다.</div>}
                  {releases.map((release) => (
                    <form key={release.id} action={updateDiscographyRelease} className="rounded-lg border border-slate-200 p-4">
                      <input type="hidden" name="id" value={release.id} />
                      <input type="hidden" name="currentCoverAsset" value={release.coverAsset} />

                      <div className="mb-3 flex items-center gap-3">
                        {release.coverUrl && <img src={release.coverUrl} alt={release.title} className="h-10 w-10 rounded object-cover" />}
                        <div className="text-xs text-slate-500">
                          순서 {release.sortOrder} /&nbsp;
                          {release.releaseYear} / {albumTypeLabel(release.albumType)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          name="title"
                          defaultValue={release.title}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <select
                          name="albumType"
                          defaultValue={release.albumType}
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        >
                          <option value="FULL_ALBUM">FULL ALBUM</option>
                          <option value="EP">EP</option>
                          <option value="SINGLE">SINGLE</option>
                        </select>
                        <input
                          type="number"
                          name="releaseYear"
                          defaultValue={release.releaseYear}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="url"
                          name="streamingUrl"
                          defaultValue={release.streamingUrl}
                          required
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="number"
                          name="sortOrder"
                          min={1}
                          defaultValue={release.sortOrder}
                          className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                        />
                        <div className="md:col-span-2">
                          <p className="mb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">앨범 커버 이미지 파일 교체</p>
                          <input
                            type="file"
                            name="coverFile"
                            accept="image/*"
                            className="w-full rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="submit"
                          className="rounded bg-charcoal px-4 py-2 text-xs font-bold tracking-widest text-white uppercase transition hover:opacity-90"
                        >
                          수정 저장
                        </button>
                        <button
                          type="submit"
                          formAction={deleteDiscographyRelease}
                          data-confirm="이 앨범을 삭제할까요?"
                          className="rounded border border-red-300 px-4 py-2 text-xs font-bold tracking-widest text-red-500 uppercase transition hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </form>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="mb-16 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Video 등록</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 text-lg font-bold">영상 업로드</h3>
              <p className="mb-2 text-sm text-slate-500">유튜브 링크로만 영상을 등록합니다.</p>
              <p className="mb-4 text-xs font-medium text-slate-500">썸네일 이미지를 올리지 않으면 유튜브 기본 썸네일이 사용됩니다.</p>
              <form action={createDiscographyVideo} className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="영상 제목"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={videos.length + 1}
                  min={1}
                  placeholder="표시 순서"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">유튜브 영상 링크</p>
                  <input
                    type="url"
                    name="videoUrl"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">영상 썸네일 이미지 (선택)</p>
                  <input
                    type="file"
                    name="thumbnailFile"
                    accept="image/*"
                    className="w-full rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-primary/90"
                >
                  영상 추가
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-4 text-lg font-bold">등록된 영상</h3>
              <div className="space-y-4">
                {videos.length === 0 && <div className="text-sm text-slate-500">등록된 영상이 없습니다.</div>}
                {videos.map((video) => (
                  <details key={video.id} className="group rounded-lg border border-slate-200">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-14 w-24 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
                          <YouTubeThumbnailWithFallback
                            alt={`${video.title} thumbnail`}
                            sources={[video.thumbnailUrl, ...video.adminThumbCandidates].filter(Boolean) as string[]}
                            previewEmbedUrl={video.embedUrl}
                            className="h-full w-full object-cover"
                            fallbackText="No thumb"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">순서 {video.sortOrder}</p>
                          <p className="truncate text-sm font-semibold text-charcoal">{video.title}</p>
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>

                    <div className="border-t border-slate-200 p-4">
                      <form action={updateDiscographyVideo}>
                        <input type="hidden" name="id" value={video.id} />
                        <input type="hidden" name="currentVideoAsset" value={video.videoAsset} />
                        <input type="hidden" name="currentThumbnailAsset" value={video.thumbnailAsset ?? ""} />

                        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded border border-slate-200 bg-slate-50 p-2">
                            {video.embedUrl ? (
                              <iframe
                                className="aspect-video w-full rounded bg-black"
                                src={video.embedUrl}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <div className="flex aspect-video items-center justify-center rounded bg-white text-xs text-slate-500">
                                유효한 유튜브 링크를 입력해 주세요.
                              </div>
                            )}
                          </div>
                          <div className="rounded border border-slate-200 bg-slate-50 p-2">
                            <YouTubeThumbnailWithFallback
                              alt={`${video.title} thumbnail`}
                              sources={[video.thumbnailUrl, ...video.adminThumbCandidates].filter(Boolean) as string[]}
                              previewEmbedUrl={video.embedUrl}
                              className="aspect-video w-full rounded object-cover"
                              fallbackText="썸네일 없음 (영상 첫 화면 사용)"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            name="title"
                            defaultValue={video.title}
                            required
                            className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                          />
                          <input
                            type="number"
                            name="sortOrder"
                            min={1}
                            defaultValue={video.sortOrder}
                            className="rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                          />
                          <div>
                            <p className="mb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">유튜브 영상 링크</p>
                            <input
                              type="url"
                              name="videoUrl"
                              defaultValue={video.videoAsset}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">썸네일 이미지 교체 (선택)</p>
                            <input
                              type="file"
                              name="thumbnailFile"
                              accept="image/*"
                              className="w-full rounded border border-slate-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                            />
                          </div>
                          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" name="clearThumbnail" className="size-4 accent-primary" />
                            썸네일 제거 (영상 첫 화면 사용)
                          </label>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="submit"
                            className="rounded bg-charcoal px-4 py-2 text-xs font-bold tracking-widest text-white uppercase transition hover:opacity-90"
                          >
                            수정 저장
                          </button>
                          <button
                            type="submit"
                            formAction={deleteDiscographyVideo}
                            data-confirm="이 영상을 삭제할까요?"
                            className="rounded border border-red-300 px-4 py-2 text-xs font-bold tracking-widest text-red-500 uppercase transition hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </div>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Gallery 등록</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 text-lg font-bold">새 사진 추가</h3>
              <p className="mb-4 text-sm text-slate-500">파일 업로드: 갤러리에 표시할 이미지 파일을 올려주세요.</p>
              <form action={createGalleryPhoto} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">갤러리 이미지 파일</p>
                  <input
                    type="file"
                    name="photoFile"
                    accept="image/*"
                    required
                    className="w-full rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  name="caption"
                  placeholder="캡션 (선택)"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={photos.length + 1}
                  min={1}
                  placeholder="정렬 순서 (작을수록 먼저)"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-primary/90 md:col-span-2 md:justify-self-end"
                >
                  추가
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {photos.length === 0 && (
                <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">등록된 사진이 없습니다.</div>
              )}

              {photos.map((photo) => (
                <form
                  key={photo.id}
                  action={updateGalleryPhoto}
                  className="grid grid-cols-1 items-start gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[220px_1fr]"
                >
                  <input type="hidden" name="id" value={photo.id} />
                  <input type="hidden" name="currentPhotoAsset" value={photo.photoAsset} />
                  <div className="overflow-hidden rounded border border-slate-200 bg-slate-100">
                    {photo.photoUrl ? (
                      <img src={photo.photoUrl} alt={photo.caption ?? "gallery"} className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-sm text-slate-400">No image</div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-slate-500">순서 {photo.sortOrder}</p>
                    <div className="space-y-2">
                    <div>
                      <p className="mb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">이미지 파일 교체</p>
                      <AdminFileInput name="photoFile" accept="image/*" currentFileName={getAssetFileName(photo.photoAsset)} />
                    </div>
                      <input
                        type="text"
                        name="caption"
                        defaultValue={photo.caption ?? ""}
                        placeholder="캡션"
                        className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                      />
                      <input
                        type="number"
                        name="sortOrder"
                        min={1}
                        defaultValue={photo.sortOrder}
                        className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="submit"
                        className="rounded bg-charcoal px-4 py-2 text-xs font-bold tracking-widest text-white uppercase transition hover:opacity-90"
                      >
                        수정 저장
                      </button>
                      <button
                        type="submit"
                        formAction={deleteGalleryPhoto}
                        data-confirm="이 사진을 삭제할까요?"
                        className="rounded border border-red-300 px-4 py-2 text-xs font-bold tracking-widest text-red-500 uppercase transition hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Contact 문의 내역</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wider text-slate-500 uppercase">
                  <th className="px-3 py-3">일시</th>
                  <th className="px-3 py-3">NAME / COMPANY</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-3 text-sm text-slate-500">{inquiry.createdAt.toLocaleString("ko-KR")}</td>
                    <td className="px-3 py-3 text-sm font-semibold">{inquiry.nameCompany}</td>
                    <td className="px-3 py-3 text-sm">{inquiry.email}</td>
                    <td className="px-3 py-3 text-sm leading-6 whitespace-pre-wrap">{inquiry.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Team 관리</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-3 text-lg font-bold">팀 메인 사진</h3>
              <p className="mb-4 text-sm text-slate-500">`/team` 페이지 상단에 노출되는 메인 사진입니다.</p>
              {teamHeroUrl && (
                <img src={teamHeroUrl} alt="Team hero" className="mb-4 aspect-[4/5] w-full rounded-lg object-cover" />
              )}
              <form action={updateTeamHero} className="space-y-3">
                <input type="hidden" name="currentHeroAsset" value={teamConfig?.heroAsset ?? ""} />
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">메인 사진 파일</p>
                  <input
                    type="file"
                    name="heroFile"
                    accept="image/*"
                    required={!teamConfig?.heroAsset}
                    className="w-full rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-primary/90"
                >
                  메인 사진 저장
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-3 text-lg font-bold">멤버 추가</h3>
              <p className="mb-2 text-sm text-slate-500">멤버는 최대 6명까지 등록할 수 있습니다.</p>
              <p className="mb-4 text-xs text-slate-500">순서 값이 작을수록 Team 페이지에서 먼저 표시됩니다.</p>
              <form action={createTeamMember} className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="멤버 이름"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  name="part"
                  required
                  placeholder="파트 (예: Guitar)"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <textarea
                  name="description"
                  rows={3}
                  placeholder="설명 (선택)"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="url"
                  name="profileUrl"
                  placeholder="멤버 링크 (선택, https://...)"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={teamMembers.length + 1}
                  min={1}
                  placeholder="표시 순서"
                  className="rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                />
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">멤버 사진 파일</p>
                  <input
                    type="file"
                    name="photoFile"
                    accept="image/*"
                    required
                    className="w-full rounded border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={teamMembers.length >= 6}
                  className="rounded bg-primary px-5 py-3 text-sm font-bold tracking-widest text-white uppercase transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  멤버 추가
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <h3 className="mb-4 text-lg font-bold">등록된 멤버 ({teamMembers.length}/6)</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {teamMembers.length === 0 && <div className="text-sm text-slate-500">등록된 멤버가 없습니다.</div>}
              {teamMembers.map((member) => (
                <form key={member.id} action={updateTeamMember} className="rounded-lg border border-slate-200 p-4">
                  <input type="hidden" name="id" value={member.id} />
                  <input type="hidden" name="currentPhotoAsset" value={member.photoAsset} />
                  <div className="mb-3 flex items-center gap-3">
                    {member.photoUrl && <img src={member.photoUrl} alt={member.name} className="h-12 w-12 rounded object-cover" />}
                    <p className="text-xs text-slate-500">순서: {member.sortOrder}</p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={member.name}
                      className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                    />
                    <input
                      type="text"
                      name="part"
                      required
                      defaultValue={member.part}
                      className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                    />
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={member.description ?? ""}
                      placeholder="설명 (선택)"
                      className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                    />
                    <input
                      type="url"
                      name="profileUrl"
                      defaultValue={member.profileUrl ?? ""}
                      placeholder="멤버 링크 (선택, https://...)"
                      className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                    />
                    <input
                      type="number"
                      name="sortOrder"
                      min={1}
                      defaultValue={member.sortOrder}
                      className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                    />
                    <div>
                      <p className="mb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">멤버 사진 파일 교체</p>
                      <input
                        type="file"
                        name="photoFile"
                        accept="image/*"
                        className="w-full rounded border border-slate-200 px-3 py-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="submit"
                      className="rounded bg-charcoal px-4 py-2 text-xs font-bold tracking-widest text-white uppercase transition hover:opacity-90"
                    >
                      수정 저장
                    </button>
                    <button
                      type="submit"
                      formAction={deleteTeamMember}
                      data-confirm="이 멤버를 삭제할까요?"
                      className="rounded border border-red-300 px-4 py-2 text-xs font-bold tracking-widest text-red-500 uppercase transition hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
