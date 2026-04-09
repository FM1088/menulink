'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  UtensilsCrossed, ArrowLeft, Save, Eye, QrCode, Share2, FileDown,
  Plus, Trash2, GripVertical, Upload, Clock, Image as ImageIcon,
  Palette, ExternalLink, Phone, Mail, MapPin, CalendarCheck,
  Truck, Link2, ChevronDown, ChevronUp, Globe, BarChart3, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { RestaurantPage, RestaurantLink, Template, ThemeConfig, BusinessHours } from '@/lib/types'
import { DEFAULT_THEME, LINK_TYPE_CONFIG } from '@/lib/types'
import toast from 'react-hot-toast'
import { QRCodeCanvas } from 'qrcode.react'

const TEMPLATES: { id: Template; name: string; desc: string }[] = [
  { id: 'minimal', name: 'Minimal', desc: 'Clean, text-focused' },
  { id: 'photo-hero', name: 'Photo Hero', desc: 'Visual, photo-forward' },
  { id: 'elegant', name: 'Elegant', desc: 'Upscale, refined' },
]

const THEME_PRESETS = [
  { name: 'Dark Orange', bg: '#0a0a0a', primary: '#f97316', text: '#ffffff', accent: '#fb923c' },
  { name: 'Midnight Blue', bg: '#0f172a', primary: '#3b82f6', text: '#ffffff', accent: '#60a5fa' },
  { name: 'Forest Green', bg: '#052e16', primary: '#22c55e', text: '#ffffff', accent: '#4ade80' },
  { name: 'Wine Red', bg: '#1a0505', primary: '#ef4444', text: '#ffffff', accent: '#f87171' },
  { name: 'Light Cream', bg: '#faf7f2', primary: '#92400e', text: '#1a1a1a', accent: '#d97706' },
  { name: 'Rose Gold', bg: '#1a1018', primary: '#f472b6', text: '#ffffff', accent: '#fb7185' },
]

const ICON_MAP: Record<string, any> = {
  menu: UtensilsCrossed,
  booking: CalendarCheck,
  delivery: Truck,
  social: Share2,
  maps: MapPin,
  phone: Phone,
  email: Mail,
  custom: Link2,
}

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [page, setPage] = useState<RestaurantPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (!data) { router.push('/dashboard'); return }
      setPage(data as RestaurantPage)
      setLoading(false)
    }
    load()
  }, [params.id])

  const save = async () => {
    if (!page) return
    setSaving(true)
    const { error } = await supabase
      .from('pages')
      .update({
        name: page.name,
        slug: page.slug,
        description: page.description,
        template: page.template,
        theme: page.theme,
        links: page.links,
        hours: page.hours,
        gallery: page.gallery,
        published: page.published,
        logo_url: page.logo_url,
        hero_url: page.hero_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id)

    setSaving(false)
    if (error) toast.error('Failed to save')
    else toast.success('Saved!')
  }

  const update = (updates: Partial<RestaurantPage>) => {
    if (!page) return
    setPage({ ...page, ...updates })
  }

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    if (!page) return
    setPage({ ...page, theme: { ...page.theme, ...updates } })
  }

  const addLink = (type: string) => {
    if (!page) return
    const config = LINK_TYPE_CONFIG[type as keyof typeof LINK_TYPE_CONFIG]
    const newLink: RestaurantLink = {
      id: crypto.randomUUID(),
      type: type as any,
      label: config?.label || 'Link',
      url: '',
      order: page.links.length,
    }
    update({ links: [...page.links, newLink] })
  }

  const updateLink = (id: string, updates: Partial<RestaurantLink>) => {
    if (!page) return
    update({ links: page.links.map(l => l.id === id ? { ...l, ...updates } : l) })
  }

  const removeLink = (id: string) => {
    if (!page) return
    update({ links: page.links.filter(l => l.id !== id).map((l, i) => ({ ...l, order: i })) })
  }

  const moveLink = (from: number, to: number) => {
    if (!page) return
    const links = [...page.links]
    const [moved] = links.splice(from, 1)
    links.splice(to, 0, moved)
    update({ links: links.map((l, i) => ({ ...l, order: i })) })
  }

  const updateHours = (index: number, updates: Partial<BusinessHours>) => {
    if (!page) return
    const hours = [...page.hours]
    hours[index] = { ...hours[index], ...updates }
    update({ hours })
  }

  const uploadImage = async (file: File, type: 'logo' | 'hero' | 'gallery') => {
    const path = `${page!.user_id}/${page!.id}/${type}-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('uploads').upload(path, file)
    if (error) { toast.error('Upload failed'); return null }
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
    return publicUrl
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, type)
    if (!url) return
    if (type === 'logo') update({ logo_url: url })
    else if (type === 'hero') update({ hero_url: url })
    else update({ gallery: [...(page?.gallery || []), url] })
    toast.success(`${type} uploaded!`)
  }

  const downloadQR = useCallback(() => {
    if (!qrRef.current || !page) return
    const canvas = qrRef.current
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${page.slug}-qr.png`
    link.href = url
    link.click()
  }, [page])

  const getPageUrl = () => page ? `${window.location.origin}/${page.slug}` : ''

  if (loading || !page) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <nav className="border-b border-white/5 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">Editing: {page.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Label htmlFor="published" className="text-xs text-muted-foreground">Published</Label>
              <Switch
                id="published"
                checked={page.published}
                onCheckedChange={(published) => update({ published })}
              />
            </div>
            <Link href={`/analytics/${page.id}`}>
              <Button variant="ghost" size="sm" title="Analytics">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setShowQr(true)} title="QR Code">
              <QrCode className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!page.published) {
                  toast.error('Publish the page first to download a poster')
                  return
                }
                window.open(`/api/poster/${page.slug}?format=a4`, '_blank')
              }}
              title="Download poster PDF (A4)"
            >
              <FileDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open(`/${page.slug}`, '_blank')} title="Preview">
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 w-full justify-start">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="hours">Hours</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="theme">Theme</TabsTrigger>
              </TabsList>

              {/* Basics Tab */}
              <TabsContent value="basics" className="space-y-4 mt-4">
                <Card className="p-6 bg-white/[0.02] border-white/5 space-y-4">
                  <div>
                    <Label>Restaurant Name</Label>
                    <Input
                      value={page.name}
                      onChange={e => update({ name: e.target.value })}
                      className="mt-1.5 bg-white/5 border-white/10"
                      placeholder="Your Restaurant Name"
                    />
                  </div>
                  <div>
                    <Label>URL Slug</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm text-muted-foreground">menulink.page/</span>
                      <Input
                        value={page.slug}
                        onChange={e => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={page.description}
                      onChange={e => update({ description: e.target.value })}
                      className="mt-1.5 bg-white/5 border-white/10"
                      placeholder="Authentic Italian cuisine in the heart of downtown..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => update({ template: t.id })}
                          className={`p-3 rounded-lg border text-left transition ${
                            page.template === t.id
                              ? 'border-orange-500 bg-orange-500/10'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                          }`}
                        >
                          <div className="text-sm font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-4 mt-4">
                <Card className="p-6 bg-white/[0.02] border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base">Links ({page.links.length})</Label>
                    <Select onValueChange={addLink}>
                      <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                        <div className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Link</div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10">
                        {Object.entries(LINK_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {page.links.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No links yet. Add your first link above.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {page.links.map((link, index) => {
                        const Icon = ICON_MAP[link.type] || Link2
                        return (
                          <div
                            key={link.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01]"
                          >
                            <div className="flex flex-col gap-1 pt-2">
                              <button
                                onClick={() => index > 0 && moveLink(index, index - 1)}
                                disabled={index === 0}
                                className="text-muted-foreground hover:text-white disabled:opacity-30"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => index < page.links.length - 1 && moveLink(index, index + 1)}
                                disabled={index === page.links.length - 1}
                                className="text-muted-foreground hover:text-white disabled:opacity-30"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="pt-2">
                              <Icon className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input
                                value={link.label}
                                onChange={e => updateLink(link.id, { label: e.target.value })}
                                className="bg-white/5 border-white/10 h-9 text-sm"
                                placeholder="Label"
                              />
                              <Input
                                value={link.url}
                                onChange={e => updateLink(link.id, { url: e.target.value })}
                                className="bg-white/5 border-white/10 h-9 text-sm"
                                placeholder={LINK_TYPE_CONFIG[link.type as keyof typeof LINK_TYPE_CONFIG]?.placeholder || 'URL'}
                              />
                            </div>
                            <button
                              onClick={() => removeLink(link.id)}
                              className="pt-2 text-muted-foreground hover:text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Hours Tab */}
              <TabsContent value="hours" className="space-y-4 mt-4">
                <Card className="p-6 bg-white/[0.02] border-white/5">
                  <Label className="text-base mb-4 block">Business Hours</Label>
                  <div className="space-y-3">
                    {page.hours.map((h, i) => (
                      <div key={h.day} className="flex items-center gap-3">
                        <span className="w-24 text-sm">{h.day}</span>
                        <Switch
                          checked={!h.closed}
                          onCheckedChange={(open) => updateHours(i, { closed: !open })}
                        />
                        {!h.closed ? (
                          <>
                            <Input
                              type="time"
                              value={h.open}
                              onChange={e => updateHours(i, { open: e.target.value })}
                              className="w-32 bg-white/5 border-white/10 h-9 text-sm"
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <Input
                              type="time"
                              value={h.close}
                              onChange={e => updateHours(i, { close: e.target.value })}
                              className="w-32 bg-white/5 border-white/10 h-9 text-sm"
                            />
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-4 mt-4">
                <Card className="p-6 bg-white/[0.02] border-white/5 space-y-6">
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {page.logo_url ? (
                        <img src={page.logo_url} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" className="border-white/10" asChild>
                          <span><Upload className="w-3 h-3 mr-1" /> Upload Logo</span>
                        </Button>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label>Hero Image</Label>
                    <div className="mt-2">
                      {page.hero_url ? (
                        <div className="relative">
                          <img src={page.hero_url} alt="Hero" className="w-full h-40 rounded-lg object-cover" />
                          <button onClick={() => update({ hero_url: undefined })} className="absolute top-2 right-2 bg-black/50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition">
                          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload hero image</p>
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'hero')} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Gallery</Label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {page.gallery?.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt="" className="w-full aspect-square rounded-lg object-cover" />
                          <button
                            onClick={() => update({ gallery: page.gallery.filter((_, j) => j !== i) })}
                            className="absolute top-1 right-1 bg-black/50 p-1 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="cursor-pointer border-2 border-dashed border-white/10 rounded-lg aspect-square flex items-center justify-center hover:border-white/20 transition">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'gallery')} />
                      </label>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Theme Tab */}
              <TabsContent value="theme" className="space-y-4 mt-4">
                <Card className="p-6 bg-white/[0.02] border-white/5 space-y-6">
                  <div>
                    <Label className="text-base mb-3 block">Preset Themes</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {THEME_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => updateTheme({
                            primaryColor: preset.primary,
                            backgroundColor: preset.bg,
                            textColor: preset.text,
                            accentColor: preset.accent,
                          })}
                          className="p-3 rounded-lg border border-white/10 hover:border-white/20 transition text-left"
                        >
                          <div className="flex gap-1 mb-2">
                            {[preset.bg, preset.primary, preset.accent, preset.text].map((c, i) => (
                              <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <div className="text-xs">{preset.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'primaryColor', label: 'Primary' },
                      { key: 'backgroundColor', label: 'Background' },
                      { key: 'textColor', label: 'Text' },
                      { key: 'accentColor', label: 'Accent' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label className="text-sm">{label}</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <input
                            type="color"
                            value={page.theme[key as keyof typeof page.theme]}
                            onChange={e => updateTheme({ [key]: e.target.value })}
                            className="w-9 h-9 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={page.theme[key as keyof typeof page.theme]}
                            onChange={e => updateTheme({ [key]: e.target.value })}
                            className="bg-white/5 border-white/10 h-9 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Preview
              </div>
              <div className="rounded-[2rem] border-4 border-zinc-800 overflow-hidden bg-black" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                  <PreviewPage page={page} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeCanvas
                ref={qrRef}
                value={getPageUrl()}
                size={256}
                level="H"
                includeMargin
                imageSettings={{
                  src: page.logo_url || '',
                  height: page.logo_url ? 40 : 0,
                  width: page.logo_url ? 40 : 0,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan to visit: {getPageUrl()}
            </p>
            <Button onClick={downloadQR} className="bg-orange-500 hover:bg-orange-600 w-full">
              <Download className="w-4 h-4 mr-2" /> Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PreviewPage({ page }: { page: RestaurantPage }) {
  const { theme, template } = page
  
  if (template === 'photo-hero') {
    return (
      <div style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }} className="min-h-[600px]">
        <div className="relative h-48">
          {page.hero_url ? (
            <img src={page.hero_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-600/30 to-amber-600/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {page.logo_url && <img src={page.logo_url} alt="" className="w-14 h-14 rounded-full border-2 border-white mb-2" />}
            <h1 className="font-bold text-xl">{page.name}</h1>
            <p className="text-sm opacity-80">{page.description}</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {page.links.map(link => (
            <div
              key={link.id}
              className="rounded-xl py-3 px-4 text-sm font-medium text-center border transition"
              style={{ borderColor: theme.primaryColor + '40', backgroundColor: theme.primaryColor + '15' }}
            >
              {link.label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (template === 'elegant') {
    return (
      <div style={{ backgroundColor: '#faf7f2', color: '#1a1a1a' }} className="min-h-[600px] p-6">
        <div className="text-center space-y-3 mb-8 pt-4">
          {page.logo_url && <img src={page.logo_url} alt="" className="w-16 h-16 rounded-full mx-auto" />}
          <h1 className="font-serif text-2xl" style={{ fontFamily: 'var(--font-playfair)' }}>{page.name}</h1>
          <p className="text-sm text-gray-600">{page.description}</p>
          <div className="w-16 h-px bg-gray-300 mx-auto" />
        </div>
        <div className="space-y-2.5">
          {page.links.map(link => (
            <div
              key={link.id}
              className="rounded-lg py-3 px-4 text-sm font-medium text-center border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              {link.label}
            </div>
          ))}
        </div>
        {page.hours.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-center mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Hours</h3>
            <div className="space-y-1">
              {page.hours.filter(h => !h.closed).map(h => (
                <div key={h.day} className="flex justify-between text-xs text-gray-600">
                  <span>{h.day}</span>
                  <span>{h.open} – {h.close}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Minimal (default)
  return (
    <div style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }} className="min-h-[600px] p-6">
      <div className="text-center space-y-3 mb-8 pt-4">
        {page.logo_url ? (
          <img src={page.logo_url} alt="" className="w-16 h-16 rounded-full mx-auto" />
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl" style={{ backgroundColor: theme.primaryColor + '20' }}>
            🍽️
          </div>
        )}
        <h1 className="font-bold text-xl">{page.name}</h1>
        <p className="text-sm opacity-70">{page.description}</p>
      </div>
      <div className="space-y-3">
        {page.links.map(link => (
          <div
            key={link.id}
            className="rounded-xl py-3 px-4 text-sm font-medium text-center border transition cursor-pointer"
            style={{ borderColor: theme.primaryColor + '40', backgroundColor: theme.primaryColor + '10' }}
          >
            {link.label}
          </div>
        ))}
      </div>
    </div>
  )
}
