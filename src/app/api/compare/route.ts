import { NextRequest, NextResponse } from "next/server";
import { compareRequestSchema } from "@/lib/validation/compare";
import { composeCompareResult } from "@/domains/compare/composer";
import { WeatherProviderError } from "@/domains/weather/adapter";

function requestId() {
  return `req_${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = compareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request.",
            details: parsed.error.flatten(),
          },
          meta: { requestId: requestId() },
        },
        { status: 400 },
      );
    }

    const data = await composeCompareResult(parsed.data);

    return NextResponse.json({
      data,
      meta: { requestId: requestId(), generatedAt: new Date().toISOString() },
    });
  } catch (e: unknown) {
    if (e instanceof WeatherProviderError) {
      return NextResponse.json(
        {
          error: {
            code: "WEATHER_PROVIDER_UNAVAILABLE",
            message: e.message,
          },
          meta: { requestId: requestId() },
        },
        { status: 500 },
      );
    }

    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message },
        meta: { requestId: requestId() },
      },
      { status: 500 },
    );
  }
}
