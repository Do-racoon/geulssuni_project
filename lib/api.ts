"use client"

/**
 * API Client for Creative Agency Platform
 *
 * This module provides functions to interact with the backend API.
 * Replace the placeholder implementations with actual API calls when ready.
 */

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // Add authentication headers here when implemented
      // 'Authorization': `Bearer ${getToken()}`,
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    // Handle different error status codes appropriately
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Authentication API
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: any) => {
    return fetchAPI<{ success: boolean; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  logout: async () => {
    return fetchAPI<{ success: boolean }>("/auth/logout", {
      method: "POST",
    })
  },
}

/**
 * Authors API
 */
export const authorsAPI = {
  getAll: async () => {
    return fetchAPI<any[]>("/authors")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/authors/${id}`)
  },

  create: async (authorData: any) => {
    return fetchAPI<any>("/authors", {
      method: "POST",
      body: JSON.stringify(authorData),
    })
  },

  update: async (id: string, authorData: any) => {
    return fetchAPI<any>(`/authors/${id}`, {
      method: "PUT",
      body: JSON.stringify(authorData),
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/authors/${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * Books API
 */
export const booksAPI = {
  getAll: async () => {
    return fetchAPI<any[]>("/books")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/books/${id}`)
  },

  create: async (bookData: any) => {
    return fetchAPI<any>("/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    })
  },

  update: async (id: string, bookData: any) => {
    return fetchAPI<any>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookData),
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/books/${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * Lectures API
 */
export const lecturesAPI = {
  getAll: async () => {
    return fetchAPI<any[]>("/lectures")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/lectures/${id}`)
  },

  create: async (lectureData: any) => {
    return fetchAPI<any>("/lectures", {
      method: "POST",
      body: JSON.stringify(lectureData),
    })
  },

  update: async (id: string, lectureData: any) => {
    return fetchAPI<any>(`/lectures/${id}`, {
      method: "PUT",
      body: JSON.stringify(lectureData),
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/lectures/${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * Board Posts API
 */
export const boardAPI = {
  getPosts: async (type: "free" | "assignment") => {
    return fetchAPI<any[]>(`/board/${type}`)
  },

  getPostById: async (type: "free" | "assignment", id: string) => {
    return fetchAPI<any>(`/board/${type}/${id}`)
  },

  createPost: async (type: "free" | "assignment", postData: any) => {
    return fetchAPI<any>(`/board/${type}`, {
      method: "POST",
      body: JSON.stringify(postData),
    })
  },

  updatePost: async (type: "free" | "assignment", id: string, postData: any) => {
    return fetchAPI<any>(`/board/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    })
  },

  deletePost: async (type: "free" | "assignment", id: string) => {
    return fetchAPI<{ success: boolean }>(`/board/${type}/${id}`, {
      method: "DELETE",
    })
  },

  // Assignment specific endpoints
  completeAssignment: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/board/assignment/${id}/complete`, {
      method: "POST",
    })
  },

  addReviewerMemo: async (id: string, memo: string) => {
    return fetchAPI<any>(`/board/assignment/${id}/memo`, {
      method: "POST",
      body: JSON.stringify({ memo }),
    })
  },
}

/**
 * Portfolio API
 */
export const portfolioAPI = {
  getAll: async () => {
    return fetchAPI<any[]>("/portfolio")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/portfolio/${id}`)
  },

  create: async (portfolioData: any) => {
    return fetchAPI<any>("/portfolio", {
      method: "POST",
      body: JSON.stringify(portfolioData),
    })
  },

  update: async (id: string, portfolioData: any) => {
    return fetchAPI<any>(`/portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(portfolioData),
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/portfolio/${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * FAQ API
 */
export const faqAPI = {
  getAll: async () => {
    return fetchAPI<any[]>("/faq")
  },

  getByCategory: async (category: string) => {
    return fetchAPI<any[]>(`/faq/category/${category}`)
  },

  create: async (faqData: any) => {
    return fetchAPI<any>("/faq", {
      method: "POST",
      body: JSON.stringify(faqData),
    })
  },

  update: async (id: string, faqData: any) => {
    return fetchAPI<any>(`/faq/${id}`, {
      method: "PUT",
      body: JSON.stringify(faqData),
    })
  },

  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/faq/${id}`, {
      method: "DELETE",
    })
  },
}

/**
 * File Upload API
 */
export const fileAPI = {
  upload: async (file: File, type: "image" | "document" | "attachment") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    return fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header when using FormData
      // The browser will set it automatically with the correct boundary
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }
      return response.json()
    })
  },

  delete: async (fileId: string) => {
    return fetchAPI<{ success: boolean }>(`/upload/${fileId}`, {
      method: "DELETE",
    })
  },
}

/**
 * Admin API
 */
export const adminAPI = {
  getDashboardStats: async () => {
    return fetchAPI<any>("/admin/stats")
  },

  getSystemSettings: async () => {
    return fetchAPI<any>("/admin/settings")
  },

  updateSystemSettings: async (settings: any) => {
    return fetchAPI<any>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  },

  exportData: async (type: "users" | "books" | "lectures" | "posts") => {
    return fetchAPI<{ url: string }>(`/admin/export/${type}`)
  },
}

/**
 * Helper function to handle API errors in components
 */
export function handleApiError(error: any, setError?: (message: string) => void) {
  console.error("API Error:", error)

  const errorMessage = error.message || "An unexpected error occurred"

  if (setError) {
    setError(errorMessage)
  }

  // You could also use a toast notification here
  // toast.error(errorMessage);

  return errorMessage
}

/**
 * API Usage Guide:
 *
 * 1. Import the API modules you need:
 *    import { authorsAPI, booksAPI } from '@/lib/api';
 *
 * 2. Use in async functions or useEffect:
 *
 *    // Example with React Query
 *    const { data, isLoading, error } = useQuery('authors', authorsAPI.getAll);
 *
 *    // Example with useState and useEffect
 *    const [authors, setAuthors] = useState([]);
 *    const [loading, setLoading] = useState(true);
 *    const [error, setError] = useState(null);
 *
 *    useEffect(() => {
 *      async function fetchData() {
 *        try {
 *          setLoading(true);
 *          const data = await authorsAPI.getAll();
 *          setAuthors(data);
 *        } catch (err) {
 *          handleApiError(err, setError);
 *        } finally {
 *          setLoading(false);
 *        }
 *      }
 *
 *      fetchData();
 *    }, []);
 *
 * 3. For mutations (create, update, delete):
 *
 *    // Example with React Query
 *    const mutation = useMutation(
 *      (newAuthor) => authorsAPI.create(newAuthor),
 *      {
 *        onSuccess: () => {
 *          queryClient.invalidateQueries('authors');
 *          toast.success('Author created successfully');
 *        },
 *        onError: (error) => {
 *          handleApiError(error);
 *        }
 *      }
 *    );
 *
 *    // Usage
 *    mutation.mutate(newAuthorData);
 *
 * 4. For Server Actions, see the separate file:
 *    import { createAuthor } from '@/lib/server-actions';
 */
