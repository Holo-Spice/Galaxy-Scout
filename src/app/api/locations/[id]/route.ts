import { NextRequest, NextResponse } from "next/server";
import { LocationUpdate } from "@/lib/validation";
import * as locationService from "@/domains/locations/location.service";

function requestId() {
  return `req_${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await locationService.getLocationById(params.id);
    if (!data) {
      return NextResponse.json(
        { error: { code: "LOCATION_NOT_FOUND", message: "Location not found." }, meta: { requestId: requestId() } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = LocationUpdate.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request.", details: parsed.error.flatten() }, meta: { requestId: requestId() } },
        { status: 400 }
      );
    }
    const data = await locationService.updateLocation(params.id, parsed.data);
    if (!data) {
      return NextResponse.json(
        { error: { code: "LOCATION_NOT_FOUND", message: "Location not found." }, meta: { requestId: requestId() } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await locationService.deleteLocation(params.id);
    if (!data) {
      return NextResponse.json(
        { error: { code: "LOCATION_NOT_FOUND", message: "Location not found." }, meta: { requestId: requestId() } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: e.message }, meta: { requestId: requestId() } },
      { status: 500 }
    );
  }
}
