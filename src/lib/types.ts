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

export type UserPlan = 'free' | 'pro' | 'locations' | 'past_due'

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

// ─── Structured menu items (the moat) ────────────────────────────

export type DietaryFlag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'halal'
  | 'kosher'
  | 'keto'
  | 'nut-free'
  | 'spicy'

export type Allergen =
  | 'gluten'
  | 'dairy'
  | 'nuts'
  | 'eggs'
  | 'soy'
  | 'shellfish'
  | 'fish'
  | 'sesame'

export const DIETARY_FLAGS: { value: DietaryFlag; label: string; emoji: string }[] = [
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'nut-free', label: 'Nut-Free', emoji: '🥜' },
  { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
]

export const ALLERGENS: { value: Allergen; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'nuts', label: 'Nuts' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'fish', label: 'Fish' },
  { value: 'sesame', label: 'Sesame' },
]

export interface MenuSection {
  id: string
  page_id: string
  name: string
  description: string
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface MenuItem {
  id: string
  page_id: string
  section_id: string | null
  name: string
  description: string
  price_cents: number | null
  currency: string
  dietary: DietaryFlag[]
  allergens: Allergen[]
  photo_url: string | null
  available: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface MenuTree {
  sections: MenuSection[]
  itemsBySection: Record<string, MenuItem[]>
  uncategorised: MenuItem[]
}

/**
 * Build a section→items tree from flat arrays. Items with no section
 * (or a deleted section) drop into `uncategorised`.
 */
export function buildMenuTree(sections: MenuSection[], items: MenuItem[]): MenuTree {
  const sectionIds = new Set(sections.map((s) => s.id))
  const itemsBySection: Record<string, MenuItem[]> = {}
  const uncategorised: MenuItem[] = []

  for (const s of sections) itemsBySection[s.id] = []

  for (const item of items) {
    if (item.section_id && sectionIds.has(item.section_id)) {
      itemsBySection[item.section_id].push(item)
    } else {
      uncategorised.push(item)
    }
  }

  // Sort items within each section by sort_order
  for (const sid of Object.keys(itemsBySection)) {
    itemsBySection[sid].sort((a, b) => a.sort_order - b.sort_order)
  }
  uncategorised.sort((a, b) => a.sort_order - b.sort_order)

  // Sort sections themselves
  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order)

  return { sections: sortedSections, itemsBySection, uncategorised }
}

/**
 * Format integer cents into a display price string.
 * formatPrice(1450, 'AUD') → "$14.50"
 * formatPrice(null, 'AUD') → ""
 */
export function formatPrice(cents: number | null, currency: string): string {
  if (cents === null || cents === undefined) return ''
  const major = cents / 100
  // Default symbol is $; could expand later for €/£/¥
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  return `${symbol}${major.toFixed(2)}`
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
