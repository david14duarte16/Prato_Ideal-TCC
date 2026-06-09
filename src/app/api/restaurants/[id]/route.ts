import { NextResponse } from "next/server";
import { getRestaurantById } from "@/services/restaurantService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  try {
    const restaurant = await getRestaurantById(id);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Falha ao buscar restaurante" },
      { status: 500 }
    );
  }
}
