import type { Book, Category, Review } from "@/lib/mock-data"

export function mapDbBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    coverUrl: row.cover_url ?? "",
    category: row.category,
    language: row.language,
    publishedYear: row.published_year ?? 0,
    pages: row.pages ?? 0,
    rating: typeof row.rating === "number" ? row.rating : Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    downloadCount: row.download_count ?? 0,
    isAvailableOffline: row.is_available_offline ?? false,
  }
}

export function mapDbCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    nameAmharic: row.name_amharic,
    description: row.description ?? "",
    icon: row.icon,
    bookCount: row.book_count ?? 0,
  }
}

export function mapDbReview(row: any): Review {
  return {
    id: row.id,
    bookId: row.book_id,
    userId: row.user_id ?? "anonymous",
    userName: row.user_name ?? "Anonymous",
    rating: row.rating,
    comment: row.comment,
    sentiment: row.sentiment,
    createdAt: row.created_at,
  }
}

