'use client'

import Link from 'next/link'
import { UtensilsCrossed, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for getting started',
    features: ['1 restaurant page', 'Minimal template', 'All link types', 'QR code generator', 'Basic SEO'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    desc: 'For serious restaurants',
    features: [
      'Unlimited pages',
      'All 3 templates',
      'Analytics dashboard',
      'Custom domain support',
      'Priority support',
      'QR codes with branding',
      'Photo gallery',
      'Remove MenuLink branding',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">MenuLink<span className="text-orange-400">.page</span></span>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Sign Up</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more power.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/30 relative'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-xs font-semibold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 ${plan.highlighted ? 'text-orange-400' : 'text-green-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth">
                <Button
                  className={`w-full ${plan.highlighted ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            All plans include SSL, fast CDN, and mobile-optimized pages.
            <br />
            Questions? <a href="mailto:hello@menulink.page" className="text-orange-400 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}
