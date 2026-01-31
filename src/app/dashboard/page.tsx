'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UtensilsCrossed, Plus, ExternalLink, Eye, MousePointer,
  MoreVertical, Trash2, Copy, QrCode, LogOut, Settings, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { RestaurantPage } from '@/lib/types'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [pages, setPages] = useState<RestaurantPage[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)

      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setPages(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const createNewPage = async () => {
    if (!user) return
    const slug = `restaurant-${Date.now().toString(36)}`
    const { data, error } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        slug,
        name: 'My Restaurant',
        description: 'Welcome to our restaurant!',
        template: 'minimal',
        theme: { primaryColor: '#f97316', backgroundColor: '#0a0a0a', textColor: '#ffffff', accentColor: '#fb923c', fontFamily: 'Inter' },
        links: [],
        hours: [
          { day: 'Monday', open: '11:00', close: '22:00', closed: false },
          { day: 'Tuesday', open: '11:00', close: '22:00', closed: false },
          { day: 'Wednesday', open: '11:00', close: '22:00', closed: false },
          { day: 'Thursday', open: '11:00', close: '22:00', closed: false },
          { day: 'Friday', open: '11:00', close: '23:00', closed: false },
          { day: 'Saturday', open: '11:00', close: '23:00', closed: false },
          { day: 'Sunday', open: '11:00', close: '21:00', closed: false },
        ],
        gallery: [],
        published: false,
        views: 0,
        clicks: 0,
      })
      .select()
      .single()

    if (error) { toast.error('Failed to create page'); return }
    router.push(`/editor/${data.id}`)
  }

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return
    await supabase.from('pages').delete().eq('id', id)
    setPages(pages.filter(p => p.id !== id))
    toast.success('Page deleted')
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    toast.success('Link copied!')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Nav */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">MenuLink<span className="text-orange-400">.page</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button variant="ghost" size="sm">Upgrade</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Pages</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pages.length} page{pages.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Button onClick={createNewPage} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" /> New Page
          </Button>
        </div>

        {/* Pages Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48 bg-white/[0.02] border-white/5 animate-pulse" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <Card className="p-12 text-center bg-white/[0.02] border-white/5 border-dashed">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No pages yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first restaurant bio page</p>
            <Button onClick={createNewPage} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" /> Create Page
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map(page => (
              <Card key={page.id} className="bg-white/[0.02] border-white/5 hover:border-orange-500/30 transition overflow-hidden group">
                <div className="h-24 bg-gradient-to-br from-orange-600/20 to-amber-600/10 relative">
                  {page.hero_url && (
                    <img src={page.hero_url} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-black/50">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                        <DropdownMenuItem onClick={() => copyLink(page.slug)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/${page.slug}`, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" /> View Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deletePage(page.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{page.name}</h3>
                    <Badge variant={page.published ? 'default' : 'secondary'} className={page.published ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>
                      {page.published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 truncate">menulink.page/{page.slug}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {page.views || 0}</span>
                    <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" /> {page.clicks || 0}</span>
                    <span>{page.links?.length || 0} links</span>
                  </div>
                  <Link href={`/editor/${page.id}`}>
                    <Button size="sm" variant="outline" className="w-full border-white/10 text-sm">
                      Edit Page
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
