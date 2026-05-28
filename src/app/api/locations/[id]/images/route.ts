import { NextRequest, NextResponse } from "next/server";
import * as imageService from "@/domains/images/image.service";

function requestId() { return `req_${crypto.randomUUID().slice(0, 8)}`; }

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await imageService.listImages(params.id);
    return NextResponse.json({ data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } });
  } catch (e: any) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string | null;
    if (!file) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "File is required" }, meta: { requestId: requestId() } }, { status: 400 });
    }
    const data = await imageService.uploadImage(params.id, file);
    if (caption) {
      await imageService.updateImage(data.id, { caption });
    }
    return NextResponse.json({ data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } }, { status: 201 });
  } catch (e: any) {
    const status = e.message?.includes("Invalid file type") || e.message?.includes("File too large") ? 400 : 500;
    return NextResponse.json({ error: { code: status === 400 ? "VALIDATION_ERROR" : "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } }, { status });
  }
}
