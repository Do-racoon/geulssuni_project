"use client"

import { useState, useEffect } from "react"
import { handleApiError } from "./api"

/**
 * Custom hook for fetching data from the API
 *
 * @param fetchFunction - The API function to call
 * @param dependencies - Dependencies array for useEffect
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useFetch<T>(fetchFunction: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err: any) {
      handleApiError(err, setError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

/**
 * Custom hook for creating data through the API
 *
 * @returns Object containing create function, loading state, and error
 */
export function useCreate<T, U>(createFunction: (data: T) => Promise<U>, onSuccess?: (data: U) => void) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<U | null>(null)

  async function create(data: T) {
    try {
      setLoading(true)
      setError(null)
      const result = await createFunction(data)
      setData(result)
      if (onSuccess) onSuccess(result)
      return result
    } catch (err: any) {
      handleApiError(err, setError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error, data }
}

/**
 * Custom hook for updating data through the API
 *
 * @returns Object containing update function, loading state, and error
 */
export function useUpdate<T, U>(updateFunction: (id: string, data: T) => Promise<U>, onSuccess?: (data: U) => void) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<U | null>(null)

  async function update(id: string, data: T) {
    try {
      setLoading(true)
      setError(null)
      const result = await updateFunction(id, data)
      setData(result)
      if (onSuccess) onSuccess(result)
      return result
    } catch (err: any) {
      handleApiError(err, setError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error, data }
}

/**
 * Custom hook for deleting data through the API
 *
 * @returns Object containing delete function, loading state, and error
 */
export function useDelete<T>(deleteFunction: (id: string) => Promise<T>, onSuccess?: (data: T) => void) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  async function remove(id: string) {
    try {
      setLoading(true)
      setError(null)
      const result = await deleteFunction(id)
      setData(result)
      if (onSuccess) onSuccess(result)
      return result
    } catch (err: any) {
      handleApiError(err, setError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { remove, loading, error, data }
}

/**
 * Example usage:
 *
 * import { useFetch, useCreate, useUpdate, useDelete } from '@/lib/api-hooks';
 * import { authorsAPI } from '@/lib/api';
 *
 * // In your component:
 * const { data: authors, loading, error, refetch } = useFetch(authorsAPI.getAll);
 *
 * const { create, loading: createLoading } = useCreate(
 *   authorsAPI.create,
 *   () => {
 *     toast.success('Author created successfully');
 *     refetch();
 *   }
 * );
 *
 * const { update, loading: updateLoading } = useUpdate(
 *   authorsAPI.update,
 *   () => {
 *     toast.success('Author updated successfully');
 *     refetch();
 *   }
 * );
 *
 * const { remove, loading: deleteLoading } = useDelete(
 *   authorsAPI.delete,
 *   () => {
 *     toast.success('Author deleted successfully');
 *     refetch();
 *   }
 * );
 *
 * // Then use these functions in your component:
 * const handleCreate = async (formData) => {
 *   await create(formData);
 * };
 *
 * const handleUpdate = async (id, formData) => {
 *   await update(id, formData);
 * };
 *
 * const handleDelete = async (id) => {
 *   await remove(id);
 * };
 */
