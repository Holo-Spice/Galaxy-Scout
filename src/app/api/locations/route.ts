import { NextRequest, NextResponse } from "next/server";
import { LocationInput } from "@/lib/validation";
import * as locationService from "@/domains/locations/location.service";

function requestId() {
  return `req_${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const favorite = url.searchParams.get("favorite") === "true";
    const data = await locationService.listLocations(favorite ? { favorite: true } : undefined);
    return NextResponse.json({
      data,
      meta: { requestId: requestId(), generatedAt: new Date().toISOString() },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LocationInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request.", details: parsed.error.flatten() }, meta: { requestId: requestId() } },
        { status: 400 }
      );
    }
    const data = await locationService.createLocation(parsed.data);
    return NextResponse.json(
      { data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } },
      { status: 500 }
    );
  }
}
