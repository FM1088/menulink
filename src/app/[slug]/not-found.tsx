import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">This restaurant page doesn&apos;t exist or isn&apos;t published yet.</p>
        <Link href="/">
          <Button className="bg-orange-500 hover:bg-orange-600">Create Your Own Page</Button>
        </Link>
      </div>
    </div>
  )
}
