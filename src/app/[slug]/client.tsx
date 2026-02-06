'use client'

import {
  UtensilsCrossed, CalendarCheck, Truck, Share2, MapPin,
  Phone, Mail, ExternalLink, Clock, Instagram, Facebook, Music2, ChevronDown
} from 'lucide-react'
import type { RestaurantPage, RestaurantLink } from '@/lib/types'
import { useState } from 'react'

const ICON_MAP: Record<string, any> = {
  menu: UtensilsCrossed,
  booking: CalendarCheck,
  delivery: Truck,
  social: Share2,
  maps: MapPin,
  phone: Phone,
  email: Mail,
  custom: ExternalLink,
}

function getLinkHref(link: RestaurantLink) {
  if (link.type === 'phone') return `tel:${link.url}`
  if (link.type === 'email') return `mailto:${link.url}`
  return link.url
}

function trackClick(pageId: string, linkId?: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageId, type: 'click', linkId }),
  }).catch(() => {})
}

// ==================== MINIMAL TEMPLATE ====================
function MinimalTemplate({ page }: { page: RestaurantPage }) {
  const { theme } = page
  const [showHours, setShowHours] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div className="w-full max-w-md mx-auto px-4 py-10 space-y-6">
        {/* Profile */}
        <div className="text-center space-y-3 animate-fade-in">
          {page.logo_url ? (
            <img src={page.logo_url} alt={page.name} className="w-20 h-20 rounded-full mx-auto object-cover shadow-lg" />
          ) : (
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: theme.primaryColor + '20' }}
            >
              🍽️
            </div>
          )}
          <h1 className="font-bold text-2xl">{page.name}</h1>
          <p className="text-sm opacity-70 max-w-xs mx-auto">{page.description}</p>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {page.links.sort((a, b) => a.order - b.order).map((link, i) => {
            const Icon = ICON_MAP[link.type] || ExternalLink
            return (
              <a
                key={link.id}
                href={getLinkHref(link)}
                target={link.type !== 'phone' && link.type !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={() => trackClick(page.id, link.id)}
                className="block rounded-xl py-3.5 px-5 font-medium text-center border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: theme.primaryColor + '40',
                  backgroundColor: theme.primaryColor + '10',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Icon className="w-4 h-4" style={{ color: theme.primaryColor }} />
                  <span className="text-sm">{link.label}</span>
                </div>
              </a>
            )
          })}
        </div>

        {/* Hours */}
        {page.hours?.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setShowHours(!showHours)}
              className="flex items-center gap-2 mx-auto text-sm opacity-70 hover:opacity-100 transition"
            >
              <Clock className="w-4 h-4" />
              Hours
              <ChevronDown className={`w-3 h-3 transition-transform ${showHours ? 'rotate-180' : ''}`} />
            </button>
            {showHours && (
              <div className="mt-3 space-y-1.5 text-sm opacity-70">
                {page.hours.map(h => (
                  <div key={h.day} className="flex justify-between max-w-xs mx-auto">
                    <span>{h.day}</span>
                    <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {page.gallery?.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-4">
            {page.gallery.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square rounded-lg object-cover" />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <a
            href="/"
            className="text-xs opacity-30 hover:opacity-60 transition"
          >
            Powered by MenuLink.page
          </a>
        </div>
      </div>
    </div>
  )
}

// ==================== PHOTO HERO TEMPLATE ====================
function PhotoHeroTemplate({ page }: { page: RestaurantPage }) {
  const { theme } = page
  const [showHours, setShowHours] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      {/* Hero */}
      <div className="relative h-72">
        {page.hero_url ? (
          <img src={page.hero_url} alt={page.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600/40 to-amber-600/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5">
          <div className="flex items-end gap-4">
            {page.logo_url && (
              <img src={page.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-xl" />
            )}
            <div>
              <h1 className="font-bold text-2xl text-white drop-shadow-lg">{page.name}</h1>
              <p className="text-sm text-white/80 drop-shadow">{page.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {page.links.sort((a, b) => a.order - b.order).map((link, i) => {
          const Icon = ICON_MAP[link.type] || ExternalLink
          return (
            <a
              key={link.id}
              href={getLinkHref(link)}
              target={link.type !== 'phone' && link.type !== 'email' ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={() => trackClick(page.id, link.id)}
              className="block rounded-2xl py-4 px-5 font-medium border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                borderColor: theme.primaryColor + '30',
                backgroundColor: theme.primaryColor + '15',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor + '25' }}
                >
                  <Icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
                <span className="text-sm flex-1">{link.label}</span>
                <ExternalLink className="w-4 h-4 opacity-40" />
              </div>
            </a>
          )
        })}

        {/* Gallery Carousel */}
        {page.gallery?.length > 0 && (
          <div className="pt-4">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {page.gallery.map((url, i) => (
                <img key={i} src={url} alt="" className="w-40 h-40 rounded-2xl object-cover flex-shrink-0 snap-start" />
              ))}
            </div>
          </div>
        )}

        {/* Hours */}
        {page.hours?.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setShowHours(!showHours)}
              className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition"
            >
              <Clock className="w-4 h-4" /> Hours
              <ChevronDown className={`w-3 h-3 transition-transform ${showHours ? 'rotate-180' : ''}`} />
            </button>
            {showHours && (
              <div className="mt-3 space-y-1.5 text-sm opacity-60 bg-white/5 rounded-xl p-4">
                {page.hours.map(h => (
                  <div key={h.day} className="flex justify-between">
                    <span>{h.day}</span>
                    <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-8 pb-6">
          <a href="/" className="text-xs opacity-20 hover:opacity-50 transition">
            Powered by MenuLink.page
          </a>
        </div>
      </div>
    </div>
  )
}

// ==================== ELEGANT TEMPLATE ====================
function ElegantTemplate({ page }: { page: RestaurantPage }) {
  const [showHours, setShowHours] = useState(false)

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2a2a2a]">
      <div className="max-w-md mx-auto px-6 py-12 space-y-8">
        {/* Profile */}
        <div className="text-center space-y-4 animate-fade-in">
          {page.logo_url ? (
            <img src={page.logo_url} alt={page.name} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-200/50" />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-amber-100 flex items-center justify-center text-4xl">
              🌿
            </div>
          )}
          <div>
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>{page.name}</h1>
            <div className="w-12 h-px bg-amber-400 mx-auto mt-3" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs mx-auto italic">{page.description}</p>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {page.links.sort((a, b) => a.order - b.order).map((link, i) => {
            const Icon = ICON_MAP[link.type] || ExternalLink
            return (
              <a
                key={link.id}
                href={getLinkHref(link)}
                target={link.type !== 'phone' && link.type !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={() => trackClick(page.id, link.id)}
                className="block rounded-lg py-3.5 px-5 text-sm font-medium text-center bg-white border border-amber-200/50 hover:border-amber-400/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center gap-3">
                  <Icon className="w-4 h-4 text-amber-700" />
                  <span>{link.label}</span>
                </div>
              </a>
            )
          })}
        </div>

        {/* Gallery */}
        {page.gallery?.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {page.gallery.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-[4/3] rounded-lg object-cover" />
            ))}
          </div>
        )}

        {/* Hours */}
        {page.hours?.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setShowHours(!showHours)}
              className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-gray-600 transition"
            >
              <Clock className="w-4 h-4" />
              <span style={{ fontFamily: 'var(--font-playfair)' }}>Hours</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showHours ? 'rotate-180' : ''}`} />
            </button>
            {showHours && (
              <div className="mt-4 space-y-2 text-sm text-gray-500 bg-white rounded-lg border border-amber-200/30 p-5">
                {page.hours.map(h => (
                  <div key={h.day} className="flex justify-between">
                    <span>{h.day}</span>
                    <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-8">
          <a href="/" className="text-xs text-gray-300 hover:text-gray-400 transition">
            Powered by MenuLink.page
          </a>
        </div>
      </div>
    </div>
  )
}

// ==================== PUBLIC PAGE CLIENT ====================
export function PublicPageClient({ page }: { page: RestaurantPage }) {
  switch (page.template) {
    case 'photo-hero':
      return <PhotoHeroTemplate page={page} />
    case 'elegant':
      return <ElegantTemplate page={page} />
    default:
      return <MinimalTemplate page={page} />
  }
}
