import { NextResponse } from "next/server";
import { searchRestaurants, getNearbyRestaurants } from "@/lib/services/restaurantService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageToken, lat, lng, q, loc } = body;

    if (!pageToken) {
      return NextResponse.json(
        { error: "pageToken is required" },
        { status: 400 }
      );
    }

    let result;

    if (lat !== undefined && lng !== undefined) {
      result = await getNearbyRestaurants(lat, lng, loc, pageToken);
    } else {
      result = await searchRestaurants(loc || "São Paulo", q || undefined, { pageToken });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route /more Error:", error);
    return NextResponse.json(
      { error: "Falha ao buscar mais restaurantes" },
      { status: 500 }
    );
  }
}
