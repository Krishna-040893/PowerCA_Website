/**
 * Common API types to replace any usage
 */

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number
  retry?: number
  retryDelay?: number
  withAuth?: boolean
}

export interface ApiResponseData<T = unknown> {
  data?: T
  error?: string
  status: number
  ok: boolean
}

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export interface JsonObject {
  [key: string]: JsonValue
}
export type JsonArray = JsonValue[]

export type UnknownObject = Record<string, unknown>
export type UnknownArray = unknown[]

export interface FormDataShape {
  [key: string]: string | number | boolean | File | null | undefined
}