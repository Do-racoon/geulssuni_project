export interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  views: number
  category?: string
  pages?: number
  purchase_link?: string
  tags?: string[]
  is_published: boolean
  created_at?: string
  updated_at?: string
  sales_count?: number
  external_link?: string
}
