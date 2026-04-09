import type { Metadata } from 'next'
import Link from 'next/link'
import { UtensilsCrossed, Check, Star, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Pricing — MenuLink.page',
  description:
    'Simple, transparent pricing for restaurant bio pages. Free forever, Pro at $9/mo, or bundle with ReviewReply for just $5/mo extra.',
  openGraph: {
    title: 'MenuLink Pricing — Free, Pro, or Bundle with ReviewReply',
    description:
      'Free forever for 1 page. Pro at $9/mo for unlimited pages, custom domain, QR poster PDF. Bundle with ReviewReply for just +$5/mo.',
    type: 'website',
  },
}

type Plan = {
  name: string
  price: string
  period: string
  desc: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted: boolean
  badge?: string
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for getting started',
    features: [
      '1 restaurant page',
      'Minimal template',
      'All 8 link types',
      'PNG QR code',
      'Basic SEO',
      'MenuLink branding',
    ],
    cta: 'Start Free',
    ctaHref: '/auth',
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
      'QR poster PDF (A4 + A5)',
      'Photo gallery',
      'Remove MenuLink branding',
      'Priority email support',
    ],
    cta: 'Start Pro',
    ctaHref: '/auth?plan=pro',
    highlighted: true,
    badge: 'MOST POPULAR',
  },
  {
    name: 'Bundle',
    price: '+$5',
    period: '/month',
    desc: 'Add to ReviewReply',
    features: [
      'Everything in Pro',
      'Bundled with ReviewReply',
      'Single login for both',
      'One unified bill',
      'Cancel either anytime',
      'Save $4/mo vs Pro standalone',
      'Best value for ReviewReply customers',
    ],
    cta: 'Get the Bundle',
    ctaHref: 'https://reviewreply.app/pricing?bundle=menulink',
    highlighted: false,
    badge: 'BEST VALUE',
  },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your dashboard with one click. You keep Pro features until the end of your billing period — no prorated nonsense.',
  },
  {
    q: 'Do you offer refunds?',
    a: '14-day money-back guarantee on Pro and Bundle. Email hello@menulink.page within 14 days of purchase for a full refund, no questions asked.',
  },
  {
    q: 'How does the Bundle with ReviewReply work?',
    a: 'If you already pay for ReviewReply, you can add MenuLink Pro for just $5/mo extra (instead of $9). One login, one invoice, both products. Cancel either independently.',
  },
  {
    q: 'Can I use a custom domain?',
    a: 'Yes — Pro plan supports any custom domain (e.g., menu.yourrestaurant.com). We provide setup instructions and free SSL.',
  },
  {
    q: 'What is the QR poster PDF?',
    a: 'A printable A4 or A5 PDF with your venue name, a large QR code, and a "scan for menu" call-to-action. Stick it on tables, windows, or include it on receipts.',
  },
  {
    q: 'Do I have to be a restaurant?',
    a: 'No, but we built MenuLink specifically for food businesses. Cafes, bars, food trucks, dark kitchens, and ghost brands all use it.',
  },
  {
    q: 'Is my data exportable?',
    a: 'Yes. You can export all your page data, links, and analytics as JSON from your dashboard at any time, even on the Free plan.',
  },
  {
    q: 'How do I switch plans?',
    a: 'Upgrade or downgrade from your dashboard. Changes take effect immediately and billing prorates automatically.',
  },
]

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MenuLink Pro',
  description:
    'Restaurant link-in-bio platform with unlimited pages, custom domain, QR poster PDF, and analytics.',
  brand: { '@type': 'Brand', name: 'MenuLink' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
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
    {
      '@type': 'Offer',
      name: 'Bundle with ReviewReply',
      price: '5',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '5',
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
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you need more power. Save more by bundling
            with ReviewReply.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60 mb-12">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            14-day money-back guarantee
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-orange-400" />
            Featured on Curateria
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-orange-400" />
            Cancel anytime
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-orange-500/15 to-transparent border-orange-500/40 relative shadow-lg shadow-orange-500/10'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    plan.highlighted
                      ? 'bg-orange-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
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

      <section className="max-w-3xl mx-auto px-4 pb-20">
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
