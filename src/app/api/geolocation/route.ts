import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Get IP from headers (behind proxy like Vercel/Cloudflare)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "8.8.8.8"; // Default mock IP if none

  try {
    // Calling a public free IP Geolocation API
    // Note: In production, you would use a paid service like MaxMind or ipstack
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon`);
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Falha ao obter localização por IP");
    }

    return NextResponse.json({
      ip: data.query,
      city: data.city,
      region: data.regionName,
      country: data.country,
      latitude: data.lat,
      longitude: data.lon,
      source: "IP Geolocation API"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Não foi possível obter a localização", message },
      { status: 500 }
    );
  }
}
