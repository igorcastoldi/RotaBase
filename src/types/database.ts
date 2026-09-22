// src/types/database.ts
// (Normalmente gerado via: npx supabase gen types typescript --linked)

export type UserRole = 'super_admin' | 'empresa' | 'guia' | 'cliente';
export type VehicleType = 'quadriciclo' | 'utv' | 'jeep_4x4' | 'buggy' | 'outro';
export type BookingStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida' | 'no_show';
export type PaymentPolicy = 'sinal' | 'integral';
export type PaymentStatus = 'aguardando' | 'pago' | 'estornado' | 'falhou';
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito';
export type WaiverStatus = 'pendente' | 'assinado' | 'recusado';
export type WhatsAppStatus = 'enviado' | 'falhou' | 'pendente';

export interface Agency {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  local_curiosities: string | null;
  logo_url: string | null;
  banner_url: string | null;
  hq_name: string | null;
  hq_address: string | null;
  hq_lat: number | null;
  hq_lng: number | null;
  hq_google_maps_url: string | null;
  hq_waze_url: string | null;
  hq_whatsapp_number: string | null;
  payment_policy: PaymentPolicy;
  deposit_type: 'percentual' | 'valor_fixo' | null;
  deposit_value: number | null;
  whatsapp_api_provider?: string;
  whatsapp_api_url?: string;
  whatsapp_instance?: string;
  payment_gateway?: string;
  notify_guide: boolean;
  fleet_gallery_urls: string[];
  avg_rating: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relações (opcionais, dependendo do join)
  amenities?: AgencyAmenity[];
  tours?: Tour[];
  reviews?: Review[];
}

export interface AgencyAmenity {
  id: string;
  agency_id: string;
  icon: string;
  label: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Vehicle {
  id: string;
  agency_id: string;
  type: VehicleType;
  model: string;
  license_plate: string | null;
  capacity: number;
  photo_url: string | null;
  description: string | null;
  is_active: boolean;
}

export interface Tour {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_per_person: number;
  max_people: number;
  cover_image_url: string | null;
  gallery_urls: string[];
  included_items: string[];
  requirements: string[];
  meeting_point: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface TourSchedule {
  id: string;
  tour_id: string;
  agency_id: string;
  schedule_date: string;      // 'YYYY-MM-DD'
  start_time: string;         // 'HH:MM:SS'
  end_time: string | null;
  max_people: number;
  confirmed_people: number;
  price_override: number | null;
  guide_id: string | null;
  is_active: boolean;
  // Calculated
  available_spots?: number;
}

export interface Booking {
  id: string;
  booking_ref: string;
  agency_id: string;
  tour_id: string;
  schedule_id: string;
  client_id: string;
  num_people: number;
  passenger_names: string[];
  price_per_person: number;
  total_amount: number;
  amount_paid: number;
  payment_policy: PaymentPolicy;
  deposit_amount: number | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  gateway_payment_id: string | null;
  gateway_pix_qrcode: string | null;
  gateway_pix_copy_paste: string | null;
  checked_in_at: string | null;
  checked_in_by: string | null;
  photo_gallery_url: string | null;
  video_url: string | null;
  notes: string | null;
  created_at: string;
  // Relações
  tour?: Tour;
  schedule?: TourSchedule;
  client?: UserProfile;
  waivers?: Waiver[];
}

export interface Waiver {
  id: string;
  booking_id: string;
  client_id: string;
  agency_id: string;
  signer_name: string;
  signer_cpf: string;
  signer_rg: string | null;
  signer_birthdate: string | null;
  signer_phone: string | null;
  signature_data: string;     // base64
  signature_ip: string | null;
  signed_at: string | null;
  status: WaiverStatus;
  waiver_pdf_url: string | null;
  is_main_client: boolean;
  passenger_index: number;
}

export interface Review {
  id: string;
  agency_id: string;
  tour_id: string | null;
  booking_id: string | null;
  client_id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  is_visible: boolean;
  agency_reply: string | null;
  replied_at: string | null;
  created_at: string;
  // Relações
  client?: UserProfile;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  agency_id: string | null;
}
