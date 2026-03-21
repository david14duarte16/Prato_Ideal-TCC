export interface Restaurant {
  id: string;
  name: string;
  city: string;
  state: string;
  rating: number;
  distance: string;
  openUntil: string;
  image: string;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Sabor Paulista",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    distance: "1.2 km",
    openUntil: "23:00",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    name: "Cantina da Nonna",
    city: "São Paulo",
    state: "SP",
    rating: 4.5,
    distance: "3.5 km",
    openUntil: "22:30",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    name: "Burger Station",
    city: "São Paulo",
    state: "SP",
    rating: 4.2,
    distance: "0.8 km",
    openUntil: "02:00",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    name: "Sushi Zen",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    distance: "5.1 km",
    openUntil: "23:30",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "5",
    name: "El Toro Steakhouse",
    city: "São Paulo",
    state: "SP",
    rating: 4.6,
    distance: "2.2 km",
    openUntil: "00:00",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "6",
    name: "La Pizzaria",
    city: "São Paulo",
    state: "SP",
    rating: 4.4,
    distance: "4.0 km",
    openUntil: "23:45",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "7",
    name: "Café Botânico",
    city: "São Paulo",
    state: "SP",
    rating: 4.7,
    distance: "1.5 km",
    openUntil: "20:00",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "8",
    name: "Taquería Mexicana",
    city: "São Paulo",
    state: "SP",
    rating: 4.3,
    distance: "2.9 km",
    openUntil: "23:00",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
  },
];
