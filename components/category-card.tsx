import Link from "next/link"
import { 
  Scroll, 
  FlaskConical, 
  BookOpen, 
  TrendingUp, 
  HeartPulse, 
  Wheat, 
  Scale, 
  GraduationCap 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { type Category } from "@/lib/mock-data"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'scroll': Scroll,
  'flask': FlaskConical,
  'book-open': BookOpen,
  'trending-up': TrendingUp,
  'heart-pulse': HeartPulse,
  'wheat': Wheat,
  'scale': Scale,
  'graduation-cap': GraduationCap,
}

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || BookOpen

  return (
    <Link href={`/books?category=${encodeURIComponent(category.name)}`}>
      <Card className="group h-full border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
        <CardContent className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.nameAmharic}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {category.bookCount} books
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
