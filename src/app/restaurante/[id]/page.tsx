import { getRestaurantById } from "@/services/restaurantService";
import { notFound } from "next/navigation";
import RestaurantDetailClient from "@/components/features/restaurant/RestaurantDetailClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);
  
  if (!restaurant) {
    return {
      title: "Restaurante não encontrado - Prato Ideal",
    };
  }

  return {
    title: `${restaurant.name} - Prato Ideal`,
    description: restaurant.description,
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-24">
      <RestaurantDetailClient restaurant={restaurant} />
    </div>
  );
}
