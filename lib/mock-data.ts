export interface Book {
  id: string
  title: string
  author: string
  description: string
  coverUrl: string
  category: string
  language: string
  publishedYear: number
  pages: number
  rating: number
  reviewCount: number
  downloadCount: number
  isAvailableOffline: boolean
}

export interface Category {
  id: string
  name: string
  nameAmharic: string
  description: string
  bookCount: number
  icon: string
}

export interface Review {
  id: string
  bookId: string
  userId: string
  userName: string
  rating: number
  comment: string
  sentiment: 'positive' | 'neutral' | 'negative'
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  bookId?: string
  timestamp: string
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Ethiopian History',
    nameAmharic: 'የኢትዮጵያ ታሪክ',
    description: 'Books about Ethiopian history, culture, and heritage',
    bookCount: 156,
    icon: 'scroll'
  },
  {
    id: '2',
    name: 'Science & Technology',
    nameAmharic: 'ሳይንስ እና ቴክኖሎጂ',
    description: 'Scientific research and technological innovations',
    bookCount: 234,
    icon: 'flask'
  },
  {
    id: '3',
    name: 'Literature',
    nameAmharic: 'ስነ ጽሁፍ',
    description: 'Ethiopian and world literature',
    bookCount: 312,
    icon: 'book-open'
  },
  {
    id: '4',
    name: 'Economics',
    nameAmharic: 'ኢኮኖሚክስ',
    description: 'Economic studies and financial literacy',
    bookCount: 89,
    icon: 'trending-up'
  },
  {
    id: '5',
    name: 'Medicine & Health',
    nameAmharic: 'ህክምና እና ጤና',
    description: 'Medical research and health sciences',
    bookCount: 178,
    icon: 'heart-pulse'
  },
  {
    id: '6',
    name: 'Agriculture',
    nameAmharic: 'ግብርና',
    description: 'Agricultural sciences and farming practices',
    bookCount: 145,
    icon: 'wheat'
  },
  {
    id: '7',
    name: 'Law & Politics',
    nameAmharic: 'ህግ እና ፖለቲካ',
    description: 'Legal studies and political science',
    bookCount: 112,
    icon: 'scale'
  },
  {
    id: '8',
    name: 'Education',
    nameAmharic: 'ትምህርት',
    description: 'Educational materials and pedagogy',
    bookCount: 267,
    icon: 'graduation-cap'
  }
]

export const books: Book[] = [
  {
    id: '1',
    title: 'History of Ethiopian Civilization',
    author: 'Dr. Taddesse Tamrat',
    description: 'A comprehensive study of Ethiopian civilization from ancient times to the modern era. This book explores the rich cultural heritage, political developments, and social transformations that shaped Ethiopia.',
    coverUrl: '/books/history-ethiopia.jpg',
    category: 'Ethiopian History',
    language: 'English',
    publishedYear: 2019,
    pages: 456,
    rating: 4.8,
    reviewCount: 234,
    downloadCount: 12500,
    isAvailableOffline: true
  },
  {
    id: '2',
    title: 'Modern Ethiopian Agriculture',
    author: 'Prof. Belay Kassa',
    description: 'An in-depth analysis of agricultural practices in Ethiopia, covering sustainable farming methods, crop management, and the future of food security in the Horn of Africa.',
    coverUrl: '/books/agriculture.jpg',
    category: 'Agriculture',
    language: 'English',
    publishedYear: 2021,
    pages: 312,
    rating: 4.5,
    reviewCount: 156,
    downloadCount: 8900,
    isAvailableOffline: true
  },
  {
    id: '3',
    title: 'Ethiopian Medical Traditions',
    author: 'Dr. Asnake Getaneh',
    description: 'Explores the intersection of traditional Ethiopian medicine and modern healthcare practices, documenting centuries-old remedies and their scientific validation.',
    coverUrl: '/books/medicine.jpg',
    category: 'Medicine & Health',
    language: 'Amharic',
    publishedYear: 2020,
    pages: 278,
    rating: 4.6,
    reviewCount: 189,
    downloadCount: 7600,
    isAvailableOffline: false
  },
  {
    id: '4',
    title: 'Introduction to Computer Science',
    author: 'Prof. Mekonnen Haile',
    description: 'A foundational textbook covering programming concepts, algorithms, and data structures designed specifically for Ethiopian university students.',
    coverUrl: '/books/cs.jpg',
    category: 'Science & Technology',
    language: 'English',
    publishedYear: 2022,
    pages: 520,
    rating: 4.7,
    reviewCount: 412,
    downloadCount: 23400,
    isAvailableOffline: true
  },
  {
    id: '5',
    title: 'Ethiopian Economic Development',
    author: 'Dr. Alemayehu Geda',
    description: 'Analysis of Ethiopian economic policies, growth strategies, and challenges in achieving sustainable development in the 21st century.',
    coverUrl: '/books/economics.jpg',
    category: 'Economics',
    language: 'English',
    publishedYear: 2021,
    pages: 345,
    rating: 4.4,
    reviewCount: 98,
    downloadCount: 5600,
    isAvailableOffline: false
  },
  {
    id: '6',
    title: 'Amharic Literature Anthology',
    author: 'Various Authors',
    description: 'A collection of classic and contemporary Amharic poetry, short stories, and essays showcasing the depth of Ethiopian literary tradition.',
    coverUrl: '/books/literature.jpg',
    category: 'Literature',
    language: 'Amharic',
    publishedYear: 2018,
    pages: 489,
    rating: 4.9,
    reviewCount: 567,
    downloadCount: 34200,
    isAvailableOffline: true
  },
  {
    id: '7',
    title: 'Constitutional Law of Ethiopia',
    author: 'Dr. Assefa Fiseha',
    description: 'A detailed examination of the Ethiopian constitution, federal structure, and the evolution of legal systems in the country.',
    coverUrl: '/books/law.jpg',
    category: 'Law & Politics',
    language: 'English',
    publishedYear: 2020,
    pages: 398,
    rating: 4.3,
    reviewCount: 76,
    downloadCount: 4500,
    isAvailableOffline: false
  },
  {
    id: '8',
    title: 'Teaching Methods in Ethiopian Schools',
    author: 'Prof. Tirussew Teferra',
    description: 'Innovative pedagogical approaches for Ethiopian educators, focusing on student-centered learning and inclusive education practices.',
    coverUrl: '/books/education.jpg',
    category: 'Education',
    language: 'English',
    publishedYear: 2022,
    pages: 267,
    rating: 4.6,
    reviewCount: 234,
    downloadCount: 11800,
    isAvailableOffline: true
  }
]

export const reviews: Review[] = [
  {
    id: '1',
    bookId: '1',
    userId: 'user1',
    userName: 'Yohannes Bekele',
    rating: 5,
    comment: 'An excellent and comprehensive book that every Ethiopian should read. The author presents history in an engaging and accessible way.',
    sentiment: 'positive',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    bookId: '1',
    userId: 'user2',
    userName: 'Sara Tesfaye',
    rating: 4,
    comment: 'Very informative but some sections could use more primary sources. Overall a great resource for students.',
    sentiment: 'positive',
    createdAt: '2024-02-20T14:15:00Z'
  },
  {
    id: '3',
    bookId: '4',
    userId: 'user3',
    userName: 'Daniel Hailu',
    rating: 5,
    comment: 'Perfect for beginners! The examples are clear and the exercises help reinforce the concepts.',
    sentiment: 'positive',
    createdAt: '2024-03-10T09:45:00Z'
  },
  {
    id: '4',
    bookId: '6',
    userId: 'user4',
    userName: 'Meron Alemu',
    rating: 5,
    comment: 'Beautiful collection that showcases the richness of Amharic literature. Highly recommended!',
    sentiment: 'positive',
    createdAt: '2024-01-28T16:00:00Z'
  }
]

export const sampleChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you summarize the main themes of Ethiopian history?',
    timestamp: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Ethiopian history is characterized by several key themes:\n\n1. **Ancient Civilization**: Ethiopia is one of the oldest nations in the world, with the Aksumite Empire being one of the great ancient civilizations.\n\n2. **Religious Heritage**: Ethiopia has deep religious roots, being one of the first nations to adopt Christianity and having a significant Islamic heritage.\n\n3. **Independence**: Ethiopia is notable for never being colonized (except for a brief Italian occupation 1936-1941), maintaining its sovereignty throughout the colonial era.\n\n4. **Cultural Diversity**: With over 80 ethnic groups and languages, Ethiopia has a rich tapestry of cultures and traditions.\n\n5. **Modern Transformation**: From the imperial era through the Derg regime to the current federal system, Ethiopia has undergone significant political and social changes.',
    timestamp: '2024-03-15T10:00:30Z'
  }
]

export const stats = {
  totalBooks: 1493,
  totalUsers: 45678,
  totalDownloads: 234567,
  totalCategories: 8,
  activeResearchers: 1234,
  universitiesConnected: 42
}
