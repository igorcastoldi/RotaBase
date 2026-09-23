export type VehicleType = 'Quadriciclo' | 'UTV' | '4x4';

export interface Tour {
  id: string;
  title: string;
  regionId: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  duration: string;
  vehicle: VehicleType;
  price: number;
  featured?: boolean;
}

export interface Region {
  id: string;
  name: string;
  state: string;
}

export const regions: Region[] = [
  { id: 'jericoacoara', name: 'Jericoacoara', state: 'CE' },
  { id: 'bacupari', name: 'Lagoa do Bacupari', state: 'RS' },
  { id: 'serra-gaucha', name: 'Serra Gaúcha', state: 'RS' },
  { id: 'chapada', name: 'Chapada Diamantina', state: 'BA' },
  { id: 'lencois', name: 'Lençóis Maranhenses', state: 'MA' },
  { id: 'pantanal', name: 'Pantanal', state: 'MT' },
  { id: 'amazonia', name: 'Amazônia', state: 'AM' },
];

export const tours: Tour[] = [
  {
    id: 't1',
    title: 'Travessia das Dunas ao Pôr do Sol',
    regionId: 'jericoacoara',
    location: 'Jericoacoara, CE',
    image: '/tours/jericoacoara.png',
    rating: 4.9,
    reviews: 328,
    duration: '3h30',
    vehicle: 'Quadriciclo',
    price: 289,
    featured: true,
  },
  {
    id: 't2',
    title: 'Rota das Lagoas Azuis',
    regionId: 'jericoacoara',
    location: 'Jericoacoara, CE',
    image: '/tours/dunes-sunset.png',
    rating: 4.8,
    reviews: 194,
    duration: '2h00',
    vehicle: 'UTV',
    price: 349,
    featured: true,
  },
  {
    id: 't3',
    title: 'Aventura na Lagoa do Bacupari',
    regionId: 'bacupari',
    location: 'Lagoa do Bacupari, RS',
    image: '/tours/bacupari.png',
    rating: 4.7,
    reviews: 112,
    duration: '2h30',
    vehicle: 'Quadriciclo',
    price: 219,
    featured: true,
  },
  {
    id: 't4',
    title: 'Trilha da Serra e Vinhedos',
    regionId: 'serra-gaucha',
    location: 'Serra Gaúcha, RS',
    image: '/tours/serra.png',
    rating: 4.9,
    reviews: 256,
    duration: '4h00',
    vehicle: 'UTV',
    price: 399,
    featured: true,
  },
  {
    id: 't5',
    title: 'Expedição Cânions da Chapada',
    regionId: 'chapada',
    location: 'Chapada Diamantina, BA',
    image: '/tours/chapada.png',
    rating: 5.0,
    reviews: 87,
    duration: '5h00',
    vehicle: '4x4',
    price: 459,
  },
  {
    id: 't6',
    title: 'Mar de Dunas e Lagoas',
    regionId: 'lencois',
    location: 'Lençóis Maranhenses, MA',
    image: '/tours/lencois.png',
    rating: 4.9,
    reviews: 143,
    duration: '3h00',
    vehicle: '4x4',
    price: 379,
  },
  {
    id: 't7',
    title: 'Praia Selvagem 4x4',
    regionId: 'jericoacoara',
    location: 'Jericoacoara, CE',
    image: '/tours/beach-4x4.png',
    rating: 4.6,
    reviews: 76,
    duration: '2h00',
    vehicle: '4x4',
    price: 259,
  },
];
