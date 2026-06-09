import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { input, types } = await request.json();

    if (!input) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY não configurada no servidor.");
      return NextResponse.json({ predictions: [] }, { status: 500 });
    }

    // Usando a API REST Autocomplete do Google Places (New)
    // Documentação: https://developers.google.com/maps/documentation/places/web-service/autocomplete
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: input,
        // Limita a busca a regiões geográficas, ruas ou cidades (evita estabelecimentos comerciais genéricos)
        // O frontend nos enviará "types" mapeados para os includedPrimaryTypes permitidos, ex: ["locality", "route"]
        // Se vazio, não aplicamos restrição para não quebrar a busca
        ...(types && types.length > 0 ? { includedPrimaryTypes: types } : {}),
        languageCode: "pt-BR",
        regionCode: "BR",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Places Autocomplete (New) Erro:", errorText);
      return NextResponse.json({ predictions: [] }, { status: response.status });
    }

    const data = await response.json();
    
    // O retorno da API REST é { suggestions: [ { placePrediction: { ... } }, ... ] }
    const formattedPredictions = (data.suggestions || []).map((sugg: { 
      placePrediction: { 
        placeId: string; 
        text?: { text: string }; 
        structuredFormat?: { 
          mainText?: { text: string }; 
          secondaryText?: { text: string } 
        } 
      } 
    }) => {
      const pred = sugg.placePrediction;
      return {
        place_id: pred.placeId,
        structured_formatting: {
          main_text: pred.structuredFormat?.mainText?.text || pred.text?.text || "",
          secondary_text: pred.structuredFormat?.secondaryText?.text || ""
        }
      };
    });

    return NextResponse.json({ predictions: formattedPredictions });

  } catch (error) {
    console.error("Erro na rota /api/places/autocomplete:", error);
    return NextResponse.json(
      { error: "Falha interna no autocomplete" },
      { status: 500 }
    );
  }
}
