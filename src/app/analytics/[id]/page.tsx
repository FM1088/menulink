'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, MousePointer, TrendingUp, Calendar, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { RestaurantPage } from '@/lib/types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface AnalyticsData {
  date: string
  views: number
  clicks: number
}

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  
  const [page, setPage] = useState<RestaurantPage | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [days, setDays] = useState('30')

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data: pageData } = await supabase
      .from('pages')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!pageData) { router.push('/dashboard'); return }
    setPage(pageData as RestaurantPage)

    // Fetch analytics
    const res = await fetch(`/api/analytics?pageId=${params.id}&days=${days}`)
    const { data: analyticsData } = await res.json()
    setAnalytics(analyticsData || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadData()
  }, [params.id, days])

  const refresh = () => {
    setRefreshing(true)
    loadData()
  }

  const totalViews = analytics.reduce((sum, d) => sum + (d.views || 0), 0)
  const totalClicks = analytics.reduce((sum, d) => sum + (d.clicks || 0), 0)
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'

  // Find trend (compare last 7 days to previous 7 days)
  const last7 = analytics.slice(-7)
  const prev7 = analytics.slice(-14, -7)
  const last7Views = last7.reduce((s, d) => s + (d.views || 0), 0)
  const prev7Views = prev7.reduce((s, d) => s + (d.views || 0), 0)
  const trend = prev7Views > 0 ? (((last7Views - prev7Views) / prev7Views) * 100).toFixed(0) : '0'

  if (loading || !page) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  const chartData = analytics.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <nav className="border-b border-white/5 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/editor/${page.id}`}>
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Editor</Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">Analytics: {page.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
          </Card>

          <Card className="p-5 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Link Clicks</span>
            </div>
            <div className="text-3xl font-bold">{totalClicks.toLocaleString()}</div>
          </Card>

          <Card className="p-5 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-sm text-muted-foreground">Click Rate</span>
            </div>
            <div className="text-3xl font-bold">{ctr}%</div>
          </Card>

          <Card className="p-5 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground">7-day Trend</span>
            </div>
            <div className="text-3xl font-bold">
              <span className={Number(trend) >= 0 ? 'text-green-400' : 'text-red-400'}>
                {Number(trend) >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-6 bg-white/[0.02] border-white/5">
          <h3 className="text-lg font-semibold mb-6">Views & Clicks Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  tick={{ fill: '#888', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#666" 
                  tick={{ fill: '#888', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#888' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  name="Page Views"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  name="Link Clicks"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* All-time stats */}
        <Card className="p-6 bg-white/[0.02] border-white/5 mt-6">
          <h3 className="text-lg font-semibold mb-4">All-Time Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Page Views</span>
              <span className="font-medium">{(page.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Link Clicks</span>
              <span className="font-medium">{(page.clicks || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Links</span>
              <span className="font-medium">{page.links?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Page Status</span>
              <span className={`font-medium ${page.published ? 'text-green-400' : 'text-yellow-400'}`}>
                {page.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
