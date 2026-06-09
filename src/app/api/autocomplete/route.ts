import { NextResponse } from "next/server";
import { searchRestaurants } from "@/lib/services/restaurantService";
import { z } from "zod";

// AppSec: Validação rigorosa de input (Evita XSS e ataques de buffer/tamanho)
const autocompleteQuerySchema = z.object({
  q: z.string()
    .min(1, "O termo de busca não pode ser vazio")
    .max(100, "O termo de busca excede o limite máximo de 100 caracteres")
    // Sanitização embutida do Zod
    .transform((val) => val.trim()),
});

// AppSec: Rate Limiting Simples em Memória (Para produção ideal usar Upstash Redis)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests por minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - windowData.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (windowData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  windowData.count += 1;
  return true;
}

interface GooglePlace {
  id: string;
  types?: string[];
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
}

export async function GET(request: Request) {
  // AppSec: 1. Proteção DDoS/Bots - Rate Limit baseado em IP
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too Many Requests. Você excedeu o limite de requisições." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get("q");

  if (!rawQ) {
    return NextResponse.json({ restaurants: [], regions: [], categories: [] });
  }

  // AppSec: 2. Input Validation
  const validationResult = autocompleteQuerySchema.safeParse({ q: rawQ });
  
  if (!validationResult.success) {
    // Retorna 400 Bad Request se a entrada for maliciosa/inválida
    return NextResponse.json(
      { error: validationResult.error.issues[0].message },
      { status: 400 }
    );
  }

  const q = validationResult.data.q;

  try {
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Mapeamento de Categorias Locais (Mock/Estático)
    const knownCategories = [
      "Pizza", "Hambúrguer", "Sushi", "Japonês", "Italiano", "Churrasco", 
      "Saudável", "Café", "Doces", "Frutos do Mar", "Vegetariano"
    ];
    const categories = knownCategories
      .filter(c => c.toLowerCase().includes(q.toLowerCase()))
      .map(c => ({ id: `cat-${c}`, name: c, type: 'category' }))
      .slice(0, 3); // max 3 categorias

    // 2. Fetch restaurants
    const result = await searchRestaurants("Brasil", q);
    const restaurants = result.restaurants || [];

    let regions: { id: string; name?: string; address?: string }[] = [];

    if (!isMock && GOOGLE_MAPS_API_KEY) {
      // 3. Detect if the query matches Regions/Cities
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.types,places.formattedAddress",
        },
        next: { revalidate: 3600 },
        body: JSON.stringify({
          textQuery: q,
          maxResultCount: 3,
          languageCode: "pt-BR",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const places: GooglePlace[] = data.places || [];
        
        regions = places.filter((p) => p.types?.some((t: string) => 
          ["locality", "sublocality", "administrative_area_level_2", "administrative_area_level_3", "neighborhood", "political"].includes(t)
        )).map(p => ({
          id: p.id,
          name: p.displayName?.text,
          address: p.formattedAddress
        }));
      }
    } else if (isMock) {
      // Mock para regiões
      if ("são paulo".includes(q.toLowerCase()) || "sao paulo".includes(q.toLowerCase())) {
        regions.push({ id: "reg-sp", name: "São Paulo", address: "São Paulo, SP" });
      }
    }

    return NextResponse.json({ categories, regions, restaurants });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ error: "Falha ao buscar autocomplete" }, { status: 500 });
  }
}
