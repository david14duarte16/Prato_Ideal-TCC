import { NextResponse } from "next/server";
import { getNearbyRestaurants, searchRestaurants } from "@/lib/services/restaurantService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const loc = searchParams.get("loc");
  const q = searchParams.get("q");

  if (!latStr && !lonStr && !loc && !q) {
    return NextResponse.json(
      { error: "Parâmetros inválidos. Forneça lat/lon ou loc/q" },
      { status: 400 }
    );
  }

  try {
    let restaurants;
    
    if (q || loc) {
      restaurants = await searchRestaurants(loc || "São Paulo", q || undefined);
    } else {
      const lat = parseFloat(latStr!);
      const lon = parseFloat(lonStr!);
      restaurants = await getNearbyRestaurants(lat, lon);
    }
    
    if (restaurants.length === 0 && !process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { 
          error: "Chave de API inválida", 
          message: "A GOOGLE_MAPS_API_KEY não foi encontrada no .env.local."
        },
        { status: 401 }
      );
    }

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Falha ao buscar restaurantes" },
      { status: 500 }
    );
  }
}
