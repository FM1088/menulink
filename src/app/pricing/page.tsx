import type { Metadata } from 'next'
import Link from 'next/link'
import { UtensilsCrossed, Check, Star, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Pricing — MenuLink.page',
  description:
    'One link for your whole restaurant. Pro $14/mo, Locations $24/mo for up to 5 venues, or bundle with ReviewReply for $9. 14-day free trial. Featured on Curateria.',
  openGraph: {
    title: 'MenuLink Pricing — Pro, Locations, Bundle with ReviewReply',
    description:
      '14-day free trial. Pro $14/mo. Locations $24/mo (up to 5). Bundle with ReviewReply for just +$9/mo. Featured on Curateria.',
    type: 'website',
  },
}

type Plan = {
  name: string
  tagline: string
  price: string
  period: string
  desc: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted: boolean
  badge?: string
  badgeColor?: string
}

const plans: Plan[] = [
  {
    name: 'Pro',
    tagline: 'Single venue',
    price: '$14',
    period: '/month',
    desc: 'Everything one restaurant needs',
    features: [
      '1 published page',
      'All 3 templates',
      'Structured menu (prices, allergens, dietary tags)',
      'Custom domain',
      'QR poster PDF (A4 + A5)',
      'Analytics dashboard',
      'Photo gallery',
      'No MenuLink branding',
      'Featured on Curateria (AU)',
      '14-day free trial',
    ],
    cta: 'Start free trial',
    ctaHref: '/auth?plan=pro',
    highlighted: true,
    badge: 'MOST POPULAR',
    badgeColor: 'bg-orange-500',
  },
  {
    name: 'Locations',
    tagline: '2-5 venues',
    price: '$24',
    period: '/month',
    desc: 'For groups, chains & restaurant owners',
    features: [
      'Up to 5 published pages',
      'Everything in Pro',
      'Per-location menus & hours',
      'Per-location custom domains',
      'Multi-location dashboard',
      'Bulk poster export',
      '14-day free trial',
      'No per-location markup',
    ],
    cta: 'Start free trial',
    ctaHref: '/auth?plan=locations',
    highlighted: false,
    badge: 'BEST FOR GROUPS',
    badgeColor: 'bg-blue-500',
  },
  {
    name: 'Bundle',
    tagline: 'With ReviewReply',
    price: '+$9',
    period: '/month',
    desc: 'Add MenuLink to ReviewReply',
    features: [
      'Everything in Pro',
      'Bundled with ReviewReply',
      'One login, one bill',
      'Direct customers + reputation',
      'Save $5/mo vs Pro standalone',
      'For ReviewReply customers only',
    ],
    cta: 'Add to ReviewReply',
    ctaHref: 'https://reviewreply.app/pricing?bundle=menulink',
    highlighted: false,
    badge: 'BEST VALUE',
    badgeColor: 'bg-emerald-500',
  },
]

const faqs = [
  {
    q: 'How does the 14-day free trial work?',
    a: "Sign up, pick Pro or Locations, and get full access for 14 days — no charge until day 15. Cancel anytime in your dashboard before day 14 and you won't be billed. No credit-card-required tricks; we ask upfront so the transition is seamless.",
  },
  {
    q: "Why isn't there a free-forever tier?",
    a: "Restaurants need a real product, not a teaser. The 14-day full-Pro trial is a better deal: try every feature (menu items, custom domain, QR poster, analytics) instead of being stuck with a stripped-down page that doesn't represent your venue properly.",
  },
  {
    q: 'What does "Featured on Curateria" mean?',
    a: 'Curateria is Australia\'s curated restaurant discovery platform. MenuLink Pro pages are eligible for inclusion in Curateria\'s directory, which means your menu, photos, and links auto-syndicate to a high-intent audience already searching for places to eat. No other link-in-bio tool offers this.',
  },
  {
    q: 'How does the Bundle with ReviewReply work?',
    a: 'If you already pay for ReviewReply (AI-powered review responses), you can add MenuLink Pro for just $9/mo extra. One login, one invoice, both products. That\'s "Direct Customers + Reputation" in a single stack. Available only to active ReviewReply customers.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. One click in your dashboard. You keep Pro features until the end of your billing period. No phone calls, no retention scripts.',
  },
  {
    q: 'Do you offer refunds?',
    a: '14-day money-back guarantee on top of the 14-day trial. If you forgot to cancel and got billed, email hello@menulink.page within 14 days for a full refund.',
  },
  {
    q: 'Can I use a custom domain?',
    a: 'Yes — Pro and Locations tiers support any custom domain (e.g., menu.yourrestaurant.com). Free SSL included. Setup takes 5 minutes.',
  },
  {
    q: 'Locations tier — what counts as a location?',
    a: 'Each published MenuLink page = one location. The Locations plan ($24/mo) lets you publish up to 5. Compare to MustHaveMenus ($49/mo per location) and Popmenu ($300/mo per location). Yes, we know we are underpricing them.',
  },
  {
    q: 'What is the QR poster PDF?',
    a: 'A printable A4 or A5 PDF with your venue name, large QR code, and "scan for menu" CTA. Stick it on tables, windows, and receipts. Auto-generated from your live page — change your menu, reprint your poster.',
  },
  {
    q: 'Do I have to be a restaurant?',
    a: 'No, but MenuLink is built specifically for food businesses. Cafes, bars, food trucks, dark kitchens, and ghost brands all use it. If you sell food, this is for you.',
  },
]

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MenuLink',
  description:
    'Restaurant link-in-bio with structured menu items, custom domain, QR poster PDF, analytics, and Curateria integration.',
  brand: { '@type': 'Brand', name: 'MenuLink' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '14',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '14',
        priceCurrency: 'USD',
        billingIncrement: 1,
        unitText: 'MONTH',
      },
    },
    {
      '@type': 'Offer',
      name: 'Locations',
      price: '24',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '24',
        priceCurrency: 'USD',
        billingIncrement: 1,
        unitText: 'MONTH',
      },
    },
    {
      '@type': 'Offer',
      name: 'Bundle with ReviewReply',
      price: '9',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '9',
        priceCurrency: 'USD',
        billingIncrement: 1,
        unitText: 'MONTH',
      },
    },
  ],
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">
              MenuLink<span className="text-orange-400">.page</span>
            </span>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </nav>

      {/* Curateria moat headline */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
          <Star className="w-3 h-3" /> The only link-in-bio featured on Curateria
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Built for restaurants.<br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            {' '}Priced like you matter.
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Linktree is for influencers. Popmenu costs $179/mo. We&apos;re the one made for restaurants who want a real menu page without remortgaging the kitchen.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-4 pb-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            14-day free trial
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            14-day money-back guarantee
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-orange-400" />
            Cancel anytime, one click
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-orange-500/15 to-transparent border-orange-500/40 relative shadow-lg shadow-orange-500/10'
                  : 'bg-white/[0.02] border-white/10 relative'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap text-white ${plan.badgeColor}`}
                >
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.highlighted ? 'text-orange-400' : 'text-green-400'
                      }`}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaHref}>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Competitive context — soft */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-xl font-semibold mb-8">
            Honest pricing comparison
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="text-2xl font-bold text-orange-400">$14</div>
              <div className="text-xs text-white/60 mt-1">MenuLink Pro</div>
              <div className="text-xs text-white/40 mt-1">Restaurant-built</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="text-2xl font-bold text-white/40">$15</div>
              <div className="text-xs text-white/60 mt-1">Linktree Pro</div>
              <div className="text-xs text-white/40 mt-1">Generic</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="text-2xl font-bold text-white/40">$49</div>
              <div className="text-xs text-white/60 mt-1">MustHaveMenus</div>
              <div className="text-xs text-white/40 mt-1">Per location</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="text-2xl font-bold text-white/40">$179</div>
              <div className="text-xs text-white/60 mt-1">Popmenu</div>
              <div className="text-xs text-white/40 mt-1">+ $50 ordering</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white/[0.02] border border-white/10 rounded-lg p-5 open:bg-white/[0.04]"
            >
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <span className="text-orange-400 group-open:rotate-45 transition-transform text-xl">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 py-12 text-center">
        <p className="text-muted-foreground text-sm">
          All plans include SSL, fast CDN, and mobile-optimized pages.
          <br />
          Questions?{' '}
          <a
            href="mailto:hello@menulink.page"
            className="text-orange-400 hover:underline"
          >
            hello@menulink.page
          </a>
        </p>
      </section>
    </div>
  )
}
