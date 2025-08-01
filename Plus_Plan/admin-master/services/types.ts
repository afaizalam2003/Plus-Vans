// Booking Types
export interface Booking {
  id: string;
  user_id: string | null;
  postcode: string;
  address: string;
  geolocation: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  collection_time: string | null;
  quote: {
    breakdown: {
      volume: string;
      material_risk: number;
      postcode: string;
      price_components: {
        base_rate: number;
        hazard_surcharge: number;
        access_fee: number;
        dismantling_fee: number;
        total: number;
      };
    };
    compliance: string[];
    explanation: {
      heatmapUrl: string | null;
      similarCases: any[];
      applied_rules: any[];
    };
  } | null;
  created_at: string;
  updated_at: string;
  stripe_payments?: StripePayment[];
  media_uploads?: MediaUpload[];
  customer_name?: string;
  price?: number
}

// Media Upload Types
export interface MediaUpload {
  id: string;
  booking_id: string;
  image_urls: string[];
  waste_location: string;
  access_restricted: boolean;
  dismantling_required: boolean;
  created_at: string;
  updated_at: string;
}

// Vision Analysis Types
export interface VisionAnalysisResult {
  id: string;
  booking_id: string;
  result_json: Record<string, any>;
  created_at: string;
}

// Admin Audit Log Types
export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  previous_value?: Record<string, any>;
  new_value?: Record<string, any>;
  reason?: string;
  created_at: string;
}

// Quote History Types
export interface QuoteHistory {
  id: string;
  booking_id: string;
  breakdown: Record<string, any>;
  override: string;
  override_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Compliance Regulation Types
export interface ComplianceRegulation {
  id: string;
  region: string;
  regulation_code: string;
  notes: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

// Media Attachment Types
export interface MediaAttachment {
  id: string;
  booking_id: string;
  s3_key: string;
  ai_analysis: Record<string, any> | null;
  created_at: string;
}

// Stripe Payment Types
export interface StripePayment {
  id: string;
  booking_id: string;
  amount: string;
  currency: string;
  status: string;
  client_secret: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  created_at: string;
  updated_at: string;
}

// Stripe Event Types
export interface StripeEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  payload: Record<string, any>;
  processed: string;
  created_at: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  hashed_password: string;
  role: "customer" | "admin" | "ops" | "support";
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin" | "ops" | "support";
}

// Customer Details Types
export interface CustomerDetails {
  id: string;
  booking_id: string;
  full_name: string;
  contact_number: string;
  email: string;
  collection_date: string;
  created_at: string;
  updated_at: string;
}

// Estimation Rule Types
export interface EstimationRule {
  id: string;
  rule_name: string;
  rule_description: string | null;
  rule_type:
    | "hazard_multiplier"
    | "location_modifier"
    | "dismantling_fee_adjustment"
    | "base_rate_adjustment"
    | "volume_estimation";
  min_value: number | null;
  max_value: number | null;
  multiplier: number;
  active: boolean;
  currency: string;
  zipcode: string | null;
  postcode_prefix: string | null;
  base_rate: number | null;
  hazard_surcharge: number | null;
  access_fee: number | null;
  dismantling_fee: number | null;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreate {
  booking_id: string;
  rating: number;
  comment: string;
}

// Analysis Types
export interface AnalyzeContext {
  locationType: string;
  dismantlingRequired: boolean;
  notes?: string;
}

export interface AnalyzeRequest {
  images: string[];
  context: AnalyzeContext;
}

export interface PriceComponents {
  base: number;
  hazardSurcharge: number;
  accessFee: number;
}

export interface Breakdown {
  volume: string;
  materialRisk: number;
  priceComponents: PriceComponents;
}

export interface Explanation {
  heatmapUrl?: string;
  similarCases?: any[];
}

export interface AnalyzeResponse {
  breakdown: Breakdown;
  compliance: string[];
  explanation?: Explanation;
}

// Dashboard Statistics Types
export interface TimeSeriesPoint {
  name: string;
  value: number;
}

export interface BookingStats {
  total: number;
  time_series: TimeSeriesPoint[];
  status_distribution: Array<Record<string, any>>;
}

export interface PaymentStats {
  total_revenue: number;
  successful_revenue: number;
  count: number;
  time_series: TimeSeriesPoint[];
}

export interface UserStats {
  total: number;
  time_series: TimeSeriesPoint[];
}

export interface ReviewStats {
  count: number;
  average_rating: number;
}

export interface DashboardStats {
  booking_stats: BookingStats;
  payment_stats: PaymentStats;
  user_stats: UserStats;
  review_stats: ReviewStats;
}

// Estimation Rule List Params
export interface EstimationRuleListParams {
  skip?: number;
  limit?: number;
  status?: "active" | "inactive";
  rule_type?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}
