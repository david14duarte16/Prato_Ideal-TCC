import { NextResponse } from "next/server";
import { apiClient } from "@/lib/services/apiClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Faz a requisição para a API do Render no lado do servidor (ignora CORS)
    const response = await apiClient.post("/Usuario/cadastro", body);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("Erro no proxy de cadastro:", error.response?.data || error.message);
    
    // Repassa o erro da API ou um erro genérico
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Erro interno ao cadastrar" };
    
    return NextResponse.json(data, { status });
  }
}
