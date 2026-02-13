'use client'

import Link from 'next/link'
import {
  UtensilsCrossed, MapPin, Phone, Instagram, Star, Zap,
  Palette, QrCode, BarChart3, Globe, ArrowRight, Check, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

const FEATURES = [
  { icon: Zap, title: 'Ready in 2 Minutes', desc: 'Add your links, pick a template, and publish. It\'s that simple.' },
  { icon: Palette, title: '3 Beautiful Templates', desc: 'Minimal, Photo Hero, or Elegant — each designed for restaurants.' },
  { icon: QrCode, title: 'QR Code Generator', desc: 'Print QR codes for table tents, menus, and receipts.' },
  { icon: BarChart3, title: 'Analytics', desc: 'See who\'s visiting your page and what they\'re clicking.' },
  { icon: Globe, title: 'Custom Domain', desc: 'Use your own domain for a professional look.' },
  { icon: Star, title: 'SEO Optimized', desc: 'Beautiful OG images and meta tags for social sharing.' },
]

const LINK_TYPES = [
  { icon: UtensilsCrossed, label: 'Menu', color: 'text-orange-400' },
  { icon: MapPin, label: 'Directions', color: 'text-green-400' },
  { icon: Phone, label: 'Call', color: 'text-blue-400' },
  { icon: Instagram, label: 'Social', color: 'text-pink-400' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">MenuLink<span className="text-orange-400">.page</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-white transition">Features</a>
          <a href="#templates" className="text-sm text-muted-foreground hover:text-white transition">Templates</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition">Pricing</a>
          <Link href="/auth">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Get Started Free</Button>
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/95 p-4 space-y-3">
          <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
          <a href="#templates" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Templates</a>
          <a href="#pricing" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Pricing</a>
          <Link href="/auth"><Button className="w-full bg-orange-500">Get Started Free</Button></Link>
        </div>
      )}
    </nav>
  )
}

function ExamplePage() {
  return (
    <div className="w-[320px] bg-gradient-to-b from-zinc-900 to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-orange-500/10">
      <div className="h-32 bg-gradient-to-br from-orange-600/30 to-amber-600/20 relative">
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl border-4 border-zinc-900">
          🍕
        </div>
      </div>
      <div className="pt-12 pb-6 px-6 text-center space-y-4">
        <div>
          <h3 className="font-bold text-lg">Bella Napoli</h3>
          <p className="text-xs text-muted-foreground">Authentic Italian Kitchen • ⭐ 4.8</p>
        </div>
        {[
          { emoji: '📋', label: 'View Our Menu', color: 'from-orange-500/20 to-orange-500/5' },
          { emoji: '📅', label: 'Book a Table', color: 'from-blue-500/20 to-blue-500/5' },
          { emoji: '🛵', label: 'Order on Uber Eats', color: 'from-green-500/20 to-green-500/5' },
          { emoji: '📍', label: 'Get Directions', color: 'from-red-500/20 to-red-500/5' },
        ].map((item) => (
          <div
            key={item.label}
            className={`bg-gradient-to-r ${item.color} border border-white/5 rounded-xl py-3 px-4 text-sm font-medium flex items-center gap-3 hover:border-white/20 transition cursor-pointer`}
          >
            <span>{item.emoji}</span>
            {item.label}
          </div>
        ))}
        <div className="flex justify-center gap-4 pt-2">
          {['📸', '👤', '🎵'].map((e, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition cursor-pointer">
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
                <Zap className="w-3 h-3" /> Built for restaurants
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your restaurant&apos;s
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"> perfect link page</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                One beautiful page with all your links — menu, bookings, delivery, social media, directions, and more. Set it up in 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-base px-8 h-12 w-full sm:w-auto">
                    Create Your Page <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#templates">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto border-white/10">
                    See Templates
                  </Button>
                </a>
              </div>
              <p className="text-xs text-muted-foreground">Free forever • No credit card needed</p>
            </div>
            <div className="flex justify-center animate-fade-in-delay-2">
              <ExamplePage />
            </div>
          </div>
        </div>
      </section>

      {/* Supported Links */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {LINK_TYPES.map((lt) => (
              <div key={lt.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <lt.icon className={`w-4 h-4 ${lt.color}`} />
                {lt.label}
              </div>
            ))}
            <span className="text-sm text-muted-foreground">+ Delivery, Email, Custom & more</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything your restaurant needs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Replace that messy link-in-bio with a page built specifically for restaurants.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6 bg-white/[0.02] border-white/5 hover:border-orange-500/30 transition">
                <f.icon className="w-10 h-10 text-orange-400 mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">3 Beautiful Templates</h2>
            <p className="text-muted-foreground">Each designed for different restaurant vibes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Minimal', desc: 'Clean & fast. Text-focused design that loads instantly.', gradient: 'from-zinc-800 to-zinc-900', emoji: '✨' },
              { name: 'Photo Hero', desc: 'Big hero photo with overlay. Perfect for visual brands.', gradient: 'from-orange-900/40 to-zinc-900', emoji: '📸' },
              { name: 'Elegant', desc: 'Script fonts, soft colors. Upscale fine dining feel.', gradient: 'from-amber-900/30 to-zinc-900', emoji: '🌿' },
            ].map((t) => (
              <Card key={t.name} className={`overflow-hidden border-white/5 hover:border-orange-500/30 transition bg-gradient-to-b ${t.gradient}`}>
                <div className="h-48 flex items-center justify-center text-6xl">{t.emoji}</div>
                <div className="p-6">
                  <h3 className="font-semibold mb-1">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="p-8 bg-white/[0.02] border-white/10">
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['1 page', 'Minimal template', 'All link types', 'QR code'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" />{f}</li>
                ))}
              </ul>
              <Link href="/auth">
                <Button variant="outline" className="w-full border-white/10">Get Started</Button>
              </Link>
            </Card>
            {/* Pro */}
            <Card className="p-8 bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-xs font-semibold rounded-full">POPULAR</div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <div className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['Unlimited pages', 'All 3 templates', 'Analytics dashboard', 'Custom domain', 'Priority support', 'QR codes'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-orange-400" />{f}</li>
                ))}
              </ul>
              <Link href="/auth">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">Start Pro Trial</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to create your page?</h2>
          <p className="text-muted-foreground">Join hundreds of restaurants sharing their links beautifully.</p>
          <Link href="/auth">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-base px-8 h-12">
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <UtensilsCrossed className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">MenuLink.page</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing">Pricing</Link>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="mailto:hello@menulink.page">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 MenuLink.page</p>
        </div>
      </footer>
    </div>
  )
}
