"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactInquiry(formData: FormData) {
  const nameCompany = getStringField(formData, "nameCompany");
  const email = getStringField(formData, "email");
  const message = getStringField(formData, "message");

  if (!nameCompany || !email || !message) {
    throw new Error("모든 항목을 입력해 주세요.");
  }

  await prisma.contactInquiry.create({
    data: {
      nameCompany,
      email,
      message,
    },
  });

  revalidatePath("/contact");
  revalidatePath("/admin");
  redirect("/contact?sent=1");
}
