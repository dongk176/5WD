"use server";

import { AlbumType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isDirectAssetUrl, uploadFileAsset } from "@/lib/storage";
import { isYouTubeUrl } from "@/lib/video-utils";

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalHttpUrl(formData: FormData, key: string): string | null {
  const value = getStringField(formData, key);
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("링크 URL 형식이 올바르지 않습니다.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("링크 URL 형식이 올바르지 않습니다.");
  }

  return value;
}

function toDateOnlyUtc(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function getAlbumType(value: string): AlbumType {
  if (value === AlbumType.EP) return AlbumType.EP;
  if (value === AlbumType.SINGLE) return AlbumType.SINGLE;
  return AlbumType.FULL_ALBUM;
}

function getRequestedSortOrder(formData: FormData, key: string): number | null {
  const value = getStringField(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(1, Math.floor(parsed));
}

function clampSortOrder(input: number | null, max: number, fallback: number): number {
  const value = input ?? fallback;
  if (max <= 0) return 1;
  return Math.min(Math.max(value, 1), max);
}

async function normalizeDiscographyReleaseOrders() {
  const rows = await prisma.discographyRelease.findMany({
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  await Promise.all(
    rows.map((row, index) => {
      const nextOrder = index + 1;
      if (row.sortOrder === nextOrder) return Promise.resolve();
      return prisma.discographyRelease.update({
        where: { id: row.id },
        data: { sortOrder: nextOrder },
      });
    }),
  );
}

async function normalizeDiscographyVideoOrders() {
  const rows = await prisma.discographyVideo.findMany({
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  await Promise.all(
    rows.map((row, index) => {
      const nextOrder = index + 1;
      if (row.sortOrder === nextOrder) return Promise.resolve();
      return prisma.discographyVideo.update({
        where: { id: row.id },
        data: { sortOrder: nextOrder },
      });
    }),
  );
}

async function normalizeGalleryPhotoOrders() {
  const rows = await prisma.galleryPhoto.findMany({
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  await Promise.all(
    rows.map((row, index) => {
      const nextOrder = index + 1;
      if (row.sortOrder === nextOrder) return Promise.resolve();
      return prisma.galleryPhoto.update({
        where: { id: row.id },
        data: { sortOrder: nextOrder },
      });
    }),
  );
}

async function normalizeTeamMemberOrders() {
  const rows = await prisma.teamMember.findMany({
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  await Promise.all(
    rows.map((row, index) => {
      const nextOrder = index + 1;
      if (row.sortOrder === nextOrder) return Promise.resolve();
      return prisma.teamMember.update({
        where: { id: row.id },
        data: { sortOrder: nextOrder },
      });
    }),
  );
}

async function pickAsset(input: {
  formData: FormData;
  fileField: string;
  urlField: string;
  folder: "tour" | "discography" | "gallery" | "team";
  current?: string | null;
  required?: boolean;
}): Promise<string> {
  const url = getStringField(input.formData, input.urlField);
  if (url) {
    if (!isDirectAssetUrl(url)) {
      throw new Error("URL 형식이 올바르지 않습니다.");
    }
    return url;
  }

  const maybeFile = input.formData.get(input.fileField);
  if (maybeFile instanceof File && maybeFile.size > 0) {
    const uploaded = await uploadFileAsset({
      file: maybeFile,
      folder: input.folder,
    });
    if (uploaded) return uploaded;
  }

  if (input.current) return input.current;
  if (input.required) throw new Error("파일 또는 URL을 입력해야 합니다.");

  return "";
}

export async function createTourEvent(formData: FormData) {
  const date = getStringField(formData, "eventDate");
  const eventName = getStringField(formData, "eventName");
  const time = getStringField(formData, "eventTime");
  const location = getStringField(formData, "location");
  const ticketUrl = getStringField(formData, "ticketUrl");
  const isSoldOut = getStringField(formData, "isSoldOut") === "on";

  if (!date || !eventName || !time || !location) {
    throw new Error("날짜, 공연 이름, 시간, 장소는 필수입니다.");
  }

  await prisma.tourEvent.create({
    data: {
      eventDate: toDateOnlyUtc(date),
      eventName,
      eventTime: time,
      location,
      ticketUrl: ticketUrl || null,
      isSoldOut,
    },
  });

  revalidatePath("/tour");
  revalidatePath("/admin");
}

export async function updateTourEvent(formData: FormData) {
  const id = getStringField(formData, "id");
  const date = getStringField(formData, "eventDate");
  const eventName = getStringField(formData, "eventName");
  const time = getStringField(formData, "eventTime");
  const location = getStringField(formData, "location");
  const ticketUrl = getStringField(formData, "ticketUrl");
  const isSoldOut = getStringField(formData, "isSoldOut") === "on";

  if (!id || !date || !eventName || !time || !location) {
    throw new Error("필수 항목이 비어 있습니다.");
  }

  await prisma.tourEvent.update({
    where: { id },
    data: {
      eventDate: toDateOnlyUtc(date),
      eventName,
      eventTime: time,
      location,
      ticketUrl: ticketUrl || null,
      isSoldOut,
    },
  });

  revalidatePath("/tour");
  revalidatePath("/admin");
}

export async function deleteTourEvent(formData: FormData) {
  const id = getStringField(formData, "id");
  if (!id) return;

  await prisma.tourEvent.delete({ where: { id } });
  revalidatePath("/tour");
  revalidatePath("/admin");
}

export async function createDiscographyRelease(formData: FormData) {
  const title = getStringField(formData, "title");
  const albumType = getAlbumType(getStringField(formData, "albumType"));
  const releaseYear = Number(getStringField(formData, "releaseYear"));
  const streamingUrl = getStringField(formData, "streamingUrl");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");

  if (!title || !releaseYear || !streamingUrl) {
    throw new Error("제목, 발매년도, 스트리밍 링크는 필수입니다.");
  }

  const coverAsset = await pickAsset({
    formData,
    fileField: "coverFile",
    urlField: "coverUrl",
    folder: "discography",
    required: true,
  });

  await normalizeDiscographyReleaseOrders();
  const count = await prisma.discographyRelease.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count + 1, count + 1);

  await prisma.$transaction(async (tx) => {
    await tx.discographyRelease.updateMany({
      where: { sortOrder: { gte: targetSortOrder } },
      data: { sortOrder: { increment: 1 } },
    });

    await tx.discographyRelease.create({
      data: {
        title,
        albumType,
        sortOrder: targetSortOrder,
        releaseYear,
        coverAsset,
        streamingUrl,
      },
    });
  });

  revalidatePath("/discography");
  revalidatePath("/admin");
}

export async function updateDiscographyRelease(formData: FormData) {
  const id = getStringField(formData, "id");
  const title = getStringField(formData, "title");
  const albumType = getAlbumType(getStringField(formData, "albumType"));
  const releaseYear = Number(getStringField(formData, "releaseYear"));
  const streamingUrl = getStringField(formData, "streamingUrl");
  const currentCoverAsset = getStringField(formData, "currentCoverAsset");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");

  if (!id || !title || !releaseYear || !streamingUrl) {
    throw new Error("필수 항목이 비어 있습니다.");
  }

  const coverAsset = await pickAsset({
    formData,
    fileField: "coverFile",
    urlField: "coverUrl",
    folder: "discography",
    current: currentCoverAsset,
    required: true,
  });

  await normalizeDiscographyReleaseOrders();
  const current = await prisma.discographyRelease.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  const count = await prisma.discographyRelease.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count, current.sortOrder);

  await prisma.$transaction(async (tx) => {
    if (targetSortOrder < current.sortOrder) {
      await tx.discographyRelease.updateMany({
        where: {
          sortOrder: {
            gte: targetSortOrder,
            lt: current.sortOrder,
          },
        },
        data: { sortOrder: { increment: 1 } },
      });
    } else if (targetSortOrder > current.sortOrder) {
      await tx.discographyRelease.updateMany({
        where: {
          sortOrder: {
            gt: current.sortOrder,
            lte: targetSortOrder,
          },
        },
        data: { sortOrder: { decrement: 1 } },
      });
    }

    await tx.discographyRelease.update({
      where: { id },
      data: {
        title,
        albumType,
        sortOrder: targetSortOrder,
        releaseYear,
        coverAsset,
        streamingUrl,
      },
    });
  });

  revalidatePath("/discography");
  revalidatePath("/admin");
}

export async function deleteDiscographyRelease(formData: FormData) {
  const id = getStringField(formData, "id");
  if (!id) return;

  await normalizeDiscographyReleaseOrders();
  const current = await prisma.discographyRelease.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  await prisma.$transaction(async (tx) => {
    await tx.discographyRelease.delete({ where: { id } });
    await tx.discographyRelease.updateMany({
      where: { sortOrder: { gt: current.sortOrder } },
      data: { sortOrder: { decrement: 1 } },
    });
  });

  revalidatePath("/discography");
  revalidatePath("/admin");
}

export async function createDiscographyVideo(formData: FormData) {
  const title = getStringField(formData, "title");
  const videoUrl = getStringField(formData, "videoUrl");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");
  if (!title) {
    throw new Error("영상 제목은 필수입니다.");
  }
  if (!videoUrl) {
    throw new Error("유튜브 링크를 입력해야 합니다.");
  }
  if (!isDirectAssetUrl(videoUrl) || !isYouTubeUrl(videoUrl)) {
    throw new Error("유효한 유튜브 링크를 입력해 주세요.");
  }

  const thumbnailAsset = await pickAsset({
    formData,
    fileField: "thumbnailFile",
    urlField: "thumbnailUrl",
    folder: "discography",
  });

  await normalizeDiscographyVideoOrders();
  const count = await prisma.discographyVideo.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count + 1, count + 1);

  await prisma.$transaction(async (tx) => {
    await tx.discographyVideo.updateMany({
      where: { sortOrder: { gte: targetSortOrder } },
      data: { sortOrder: { increment: 1 } },
    });
    await tx.discographyVideo.create({
      data: {
        title,
        sortOrder: targetSortOrder,
        videoAsset: videoUrl,
        thumbnailAsset: thumbnailAsset || null,
      },
    });
  });

  revalidatePath("/video");
  revalidatePath("/admin");
}

export async function updateDiscographyVideo(formData: FormData) {
  const id = getStringField(formData, "id");
  const title = getStringField(formData, "title");
  const videoUrl = getStringField(formData, "videoUrl");
  const currentVideoAsset = getStringField(formData, "currentVideoAsset");
  const currentThumbnailAsset = getStringField(formData, "currentThumbnailAsset");
  const clearThumbnail = getStringField(formData, "clearThumbnail") === "on";
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");

  if (!id || !title) {
    throw new Error("필수 항목이 비어 있습니다.");
  }

  const nextVideoUrl = videoUrl || currentVideoAsset;
  if (!nextVideoUrl) {
    throw new Error("유튜브 링크를 입력해야 합니다.");
  }
  if (!isDirectAssetUrl(nextVideoUrl) || !isYouTubeUrl(nextVideoUrl)) {
    throw new Error("유효한 유튜브 링크를 입력해 주세요.");
  }

  const thumbnailAsset = clearThumbnail
    ? null
    : (
        await pickAsset({
          formData,
          fileField: "thumbnailFile",
          urlField: "thumbnailUrl",
          folder: "discography",
          current: currentThumbnailAsset,
        })
      ) || null;

  await normalizeDiscographyVideoOrders();
  const current = await prisma.discographyVideo.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  const count = await prisma.discographyVideo.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count, current.sortOrder);

  await prisma.$transaction(async (tx) => {
    if (targetSortOrder < current.sortOrder) {
      await tx.discographyVideo.updateMany({
        where: {
          sortOrder: {
            gte: targetSortOrder,
            lt: current.sortOrder,
          },
        },
        data: { sortOrder: { increment: 1 } },
      });
    } else if (targetSortOrder > current.sortOrder) {
      await tx.discographyVideo.updateMany({
        where: {
          sortOrder: {
            gt: current.sortOrder,
            lte: targetSortOrder,
          },
        },
        data: { sortOrder: { decrement: 1 } },
      });
    }

    await tx.discographyVideo.update({
      where: { id },
      data: {
        title,
        sortOrder: targetSortOrder,
        videoAsset: nextVideoUrl,
        thumbnailAsset,
      },
    });
  });

  revalidatePath("/video");
  revalidatePath("/admin");
}

export async function deleteDiscographyVideo(formData: FormData) {
  const id = getStringField(formData, "id");
  if (!id) return;

  await normalizeDiscographyVideoOrders();
  const current = await prisma.discographyVideo.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  await prisma.$transaction(async (tx) => {
    await tx.discographyVideo.delete({ where: { id } });
    await tx.discographyVideo.updateMany({
      where: { sortOrder: { gt: current.sortOrder } },
      data: { sortOrder: { decrement: 1 } },
    });
  });

  revalidatePath("/video");
  revalidatePath("/admin");
}

export async function createGalleryPhoto(formData: FormData) {
  const caption = getStringField(formData, "caption");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");

  const photoAsset = await pickAsset({
    formData,
    fileField: "photoFile",
    urlField: "photoUrl",
    folder: "gallery",
    required: true,
  });

  await normalizeGalleryPhotoOrders();
  const count = await prisma.galleryPhoto.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count + 1, count + 1);

  await prisma.$transaction(async (tx) => {
    await tx.galleryPhoto.updateMany({
      where: { sortOrder: { gte: targetSortOrder } },
      data: { sortOrder: { increment: 1 } },
    });
    await tx.galleryPhoto.create({
      data: {
        photoAsset,
        caption: caption || null,
        sortOrder: targetSortOrder,
      },
    });
  });

  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function updateGalleryPhoto(formData: FormData) {
  const id = getStringField(formData, "id");
  const caption = getStringField(formData, "caption");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");
  const currentPhotoAsset = getStringField(formData, "currentPhotoAsset");
  if (!id) return;

  const photoAsset = await pickAsset({
    formData,
    fileField: "photoFile",
    urlField: "photoUrl",
    folder: "gallery",
    current: currentPhotoAsset,
    required: true,
  });

  await normalizeGalleryPhotoOrders();
  const current = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  const count = await prisma.galleryPhoto.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count, current.sortOrder);

  await prisma.$transaction(async (tx) => {
    if (targetSortOrder < current.sortOrder) {
      await tx.galleryPhoto.updateMany({
        where: {
          sortOrder: {
            gte: targetSortOrder,
            lt: current.sortOrder,
          },
        },
        data: { sortOrder: { increment: 1 } },
      });
    } else if (targetSortOrder > current.sortOrder) {
      await tx.galleryPhoto.updateMany({
        where: {
          sortOrder: {
            gt: current.sortOrder,
            lte: targetSortOrder,
          },
        },
        data: { sortOrder: { decrement: 1 } },
      });
    }

    await tx.galleryPhoto.update({
      where: { id },
      data: {
        photoAsset,
        caption: caption || null,
        sortOrder: targetSortOrder,
      },
    });
  });

  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function deleteGalleryPhoto(formData: FormData) {
  const id = getStringField(formData, "id");
  if (!id) return;

  await normalizeGalleryPhotoOrders();
  const current = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  await prisma.$transaction(async (tx) => {
    await tx.galleryPhoto.delete({ where: { id } });
    await tx.galleryPhoto.updateMany({
      where: { sortOrder: { gt: current.sortOrder } },
      data: { sortOrder: { decrement: 1 } },
    });
  });

  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function updateTeamHero(formData: FormData) {
  const currentHeroAsset = getStringField(formData, "currentHeroAsset");
  const heroAsset = await pickAsset({
    formData,
    fileField: "heroFile",
    urlField: "heroUrl",
    folder: "team",
    current: currentHeroAsset,
    required: true,
  });

  await prisma.teamConfig.upsert({
    where: { id: 1 },
    update: {
      heroAsset,
    },
    create: {
      id: 1,
      heroAsset,
    },
  });

  revalidatePath("/team");
  revalidatePath("/admin");
}

export async function createTeamMember(formData: FormData) {
  await normalizeTeamMemberOrders();
  const count = await prisma.teamMember.count();
  if (count >= 6) {
    throw new Error("팀 멤버는 최대 6명까지 등록할 수 있습니다.");
  }

  const name = getStringField(formData, "name");
  const part = getStringField(formData, "part");
  const description = getStringField(formData, "description");
  const profileUrl = getOptionalHttpUrl(formData, "profileUrl");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");

  if (!name || !part) {
    throw new Error("이름과 파트는 필수입니다.");
  }

  const photoAsset = await pickAsset({
    formData,
    fileField: "photoFile",
    urlField: "photoUrl",
    folder: "team",
    required: true,
  });

  const targetSortOrder = clampSortOrder(requestedSortOrder, count + 1, count + 1);

  await prisma.$transaction(async (tx) => {
    await tx.teamMember.updateMany({
      where: { sortOrder: { gte: targetSortOrder } },
      data: { sortOrder: { increment: 1 } },
    });
    await tx.teamMember.create({
      data: {
        name,
        part,
        description: description || null,
        profileUrl,
        sortOrder: targetSortOrder,
        photoAsset,
      },
    });
  });

  revalidatePath("/team");
  revalidatePath("/admin");
}

export async function updateTeamMember(formData: FormData) {
  const id = getStringField(formData, "id");
  const name = getStringField(formData, "name");
  const part = getStringField(formData, "part");
  const description = getStringField(formData, "description");
  const profileUrl = getOptionalHttpUrl(formData, "profileUrl");
  const requestedSortOrder = getRequestedSortOrder(formData, "sortOrder");
  const currentPhotoAsset = getStringField(formData, "currentPhotoAsset");

  if (!id || !name || !part) {
    throw new Error("필수 항목이 비어 있습니다.");
  }

  const photoAsset = await pickAsset({
    formData,
    fileField: "photoFile",
    urlField: "photoUrl",
    folder: "team",
    current: currentPhotoAsset,
    required: true,
  });

  await normalizeTeamMemberOrders();
  const current = await prisma.teamMember.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  const count = await prisma.teamMember.count();
  const targetSortOrder = clampSortOrder(requestedSortOrder, count, current.sortOrder);

  await prisma.$transaction(async (tx) => {
    if (targetSortOrder < current.sortOrder) {
      await tx.teamMember.updateMany({
        where: {
          sortOrder: {
            gte: targetSortOrder,
            lt: current.sortOrder,
          },
        },
        data: { sortOrder: { increment: 1 } },
      });
    } else if (targetSortOrder > current.sortOrder) {
      await tx.teamMember.updateMany({
        where: {
          sortOrder: {
            gt: current.sortOrder,
            lte: targetSortOrder,
          },
        },
        data: { sortOrder: { decrement: 1 } },
      });
    }

    await tx.teamMember.update({
      where: { id },
      data: {
        name,
        part,
        description: description || null,
        profileUrl,
        sortOrder: targetSortOrder,
        photoAsset,
      },
    });
  });

  revalidatePath("/team");
  revalidatePath("/admin");
}

export async function deleteTeamMember(formData: FormData) {
  const id = getStringField(formData, "id");
  if (!id) return;

  await normalizeTeamMemberOrders();
  const current = await prisma.teamMember.findUnique({
    where: { id },
    select: { sortOrder: true },
  });
  if (!current) return;

  await prisma.$transaction(async (tx) => {
    await tx.teamMember.delete({ where: { id } });
    await tx.teamMember.updateMany({
      where: { sortOrder: { gt: current.sortOrder } },
      data: { sortOrder: { decrement: 1 } },
    });
  });

  revalidatePath("/team");
  revalidatePath("/admin");
}
