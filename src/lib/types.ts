export type LinkType =
  | 'menu'
  | 'booking'
  | 'delivery'
  | 'social'
  | 'maps'
  | 'phone'
  | 'email'
  | 'custom'

export type DeliveryPlatform = 'ubereats' | 'doordash' | 'menulog' | 'custom'
export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'custom'
export type BookingPlatform = 'opentable' | 'resy' | 'custom'
export type Template = 'minimal' | 'photo-hero' | 'elegant'

export interface RestaurantLink {
  id: string
  type: LinkType
  platform?: string
  label: string
  url: string
  icon?: string
  order: number
}

export interface BusinessHours {
  day: string
  open: string
  close: string
  closed: boolean
}

export interface RestaurantPage {
  id: string
  user_id: string
  slug: string
  name: string
  description: string
  logo_url?: string
  hero_url?: string
  template: Template
  theme: ThemeConfig
  links: RestaurantLink[]
  hours: BusinessHours[]
  gallery: string[]
  published: boolean
  views: number
  clicks: number
  created_at: string
  updated_at: string
}

export interface ThemeConfig {
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
}

export type UserPlan = 'free' | 'pro' | 'past_due'

export interface UserProfile {
  id: string
  email: string
  plan: UserPlan
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export const DEFAULT_HOURS: BusinessHours[] = [
  { day: 'Monday', open: '11:00', close: '22:00', closed: false },
  { day: 'Tuesday', open: '11:00', close: '22:00', closed: false },
  { day: 'Wednesday', open: '11:00', close: '22:00', closed: false },
  { day: 'Thursday', open: '11:00', close: '22:00', closed: false },
  { day: 'Friday', open: '11:00', close: '23:00', closed: false },
  { day: 'Saturday', open: '11:00', close: '23:00', closed: false },
  { day: 'Sunday', open: '11:00', close: '21:00', closed: false },
]

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#f97316',
  backgroundColor: '#0a0a0a',
  textColor: '#ffffff',
  accentColor: '#fb923c',
  fontFamily: 'Inter',
}

export const LINK_TYPE_CONFIG: Record<LinkType, { label: string; icon: string; placeholder: string }> = {
  menu: { label: 'Menu', icon: 'UtensilsCrossed', placeholder: 'https://your-menu-url.com' },
  booking: { label: 'Booking', icon: 'CalendarCheck', placeholder: 'https://opentable.com/your-restaurant' },
  delivery: { label: 'Delivery', icon: 'Truck', placeholder: 'https://ubereats.com/your-restaurant' },
  social: { label: 'Social', icon: 'Share2', placeholder: 'https://instagram.com/your-restaurant' },
  maps: { label: 'Directions', icon: 'MapPin', placeholder: 'https://maps.google.com/?q=...' },
  phone: { label: 'Call Us', icon: 'Phone', placeholder: '+1234567890' },
  email: { label: 'Email', icon: 'Mail', placeholder: 'hello@restaurant.com' },
  custom: { label: 'Custom Link', icon: 'ExternalLink', placeholder: 'https://...' },
}
