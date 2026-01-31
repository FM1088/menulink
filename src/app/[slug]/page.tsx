import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PublicPageClient } from './client'
import type { RestaurantPage } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getPage(slug: string): Promise<RestaurantPage | null> {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data as RestaurantPage | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug)
  if (!page) return { title: 'Not Found' }

  return {
    title: `${page.name} | MenuLink.page`,
    description: page.description,
    openGraph: {
      title: page.name,
      description: page.description,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${page.slug}`,
      images: page.hero_url ? [{ url: page.hero_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.name,
      description: page.description,
    },
  }
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug)
  if (!page) notFound()

  // Increment views
  await supabase
    .from('pages')
    .update({ views: (page.views || 0) + 1 })
    .eq('id', page.id)

  return <PublicPageClient page={page} />
}
