import { NextRequest, NextResponse } from "next/server";
import * as imageService from "@/domains/images/image.service";

function requestId() { return `req_${crypto.randomUUID().slice(0, 8)}`; }

export async function PATCH(req: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    const body = await req.json();
    const data = await imageService.updateImage(params.imageId, body);
    return NextResponse.json({ data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } });
  } catch (e: any) {
    const status = e.message === "Image not found" ? 404 : 500;
    return NextResponse.json({ error: { code: status === 404 ? "IMAGE_NOT_FOUND" : "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    await imageService.deleteImage(params.imageId);
    return NextResponse.json({ data: { deleted: true }, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } });
  } catch (e: any) {
    const status = e.message === "Image not found" ? 404 : 500;
    return NextResponse.json({ error: { code: status === 404 ? "IMAGE_NOT_FOUND" : "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } }, { status });
  }
}
