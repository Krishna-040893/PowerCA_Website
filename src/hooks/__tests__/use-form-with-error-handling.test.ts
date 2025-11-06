/**
 * @fileoverview Tests for useFormWithErrorHandling custom hook
 *
 * Tests cover:
 * - Form initialization
 * - Field validation
 * - Error state management
 * - Form submission
 * - Form persistence
 * - Reset functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useFormWithErrorHandling } from '../use-form-with-error-handling'

interface TestFormData {
  name: string
  email: string
  age: number
}

describe('useFormWithErrorHandling', () => {
  const initialData: TestFormData = {
    name: '',
    email: '',
    age: 0,
  }

  const mockValidate = jest.fn((data: TestFormData) => {
    const errors: Partial<Record<keyof TestFormData, string>> = {}

    if (!data.name) errors.name = 'Name is required'
    if (!data.email) errors.email = 'Email is required'
    if (data.age < 18) errors.age = 'Must be 18 or older'

    return Promise.resolve(errors)
  })

  const mockOnSubmit = jest.fn((data: TestFormData) => {
    return Promise.resolve()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Initialization', () => {
    it('should initialize with provided initial data', () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      expect(result.current.data).toEqual(initialData)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.submitError).toBeNull()
    })

    it('should restore persisted data on mount', () => {
      const persistedData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      }

      localStorage.setItem('test_form', JSON.stringify(persistedData))

      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
          persistKey: 'test_form',
        })
      )

      expect(result.current.data).toEqual(persistedData)
    })
  })

  describe('Field Updates', () => {
    it('should update field value', () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      act(() => {
        const fieldProps = result.current.getFieldProps('name')
        fieldProps.onChange({ target: { value: 'John Doe' } } as any)
      })

      expect(result.current.data.name).toBe('John Doe')
    })

    it('should mark field as touched on blur', () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      act(() => {
        const fieldProps = result.current.getFieldProps('name')
        fieldProps.onBlur()
      })

      expect(result.current.touched.name).toBe(true)
    })

    it('should persist data to localStorage when persistKey is provided', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
          persistKey: 'test_form',
        })
      )

      act(() => {
        const fieldProps = result.current.getFieldProps('name')
        fieldProps.onChange({ target: { value: 'John Doe' } } as any)
      })

      await waitFor(() => {
        const saved = localStorage.getItem('test_form')
        expect(saved).toBeTruthy()

        if (saved) {
          const parsed = JSON.parse(saved)
          expect(parsed.name).toBe('John Doe')
        }
      })
    })
  })

  describe('Validation', () => {
    it('should validate all fields on submit', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockValidate).toHaveBeenCalledWith(initialData)
      expect(result.current.errors).toEqual({
        name: 'Name is required',
        email: 'Email is required',
        age: 'Must be 18 or older',
      })
    })

    it('should not submit form if validation fails', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should submit form if validation passes', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      }

      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData: validData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockValidate).toHaveBeenCalledWith(validData)
      expect(mockOnSubmit).toHaveBeenCalledWith(validData)
      expect(result.current.errors).toEqual({})
    })

    it('should provide isValid flag', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      expect(result.current.isValid).toBe(false)

      act(() => {
        result.current.getFieldProps('name').onChange({ target: { value: 'John' } } as any)
        result.current.getFieldProps('email').onChange({ target: { value: 'john@example.com' } } as any)
        result.current.getFieldProps('age').onChange({ target: { value: '25' } } as any)
      })

      await waitFor(() => {
        expect(result.current.isValid).toBe(true)
      })
    })
  })

  describe('Submission', () => {
    it('should set isSubmitting to true during submission', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData: {
            name: 'John Doe',
            email: 'john@example.com',
            age: 25,
          },
          validate: mockValidate,
          onSubmit: jest.fn().mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
          ),
        })
      )

      act(() => {
        result.current.handleSubmit()
      })

      expect(result.current.isSubmitting).toBe(true)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it('should handle submission errors', async () => {
      const submissionError = new Error('Submission failed')

      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData: {
            name: 'John Doe',
            email: 'john@example.com',
            age: 25,
          },
          validate: mockValidate,
          onSubmit: jest.fn().mockRejectedValue(submissionError),
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitError).toBe('Submission failed')
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should clear submit error on successful submission', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData: {
            name: 'John Doe',
            email: 'john@example.com',
            age: 25,
          },
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      // Set initial error
      act(() => {
        result.current.setSubmitError('Previous error')
      })

      expect(result.current.submitError).toBe('Previous error')

      // Submit successfully
      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitError).toBeNull()
    })
  })

  describe('Reset', () => {
    it('should reset form to initial data', () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      // Modify form
      act(() => {
        result.current.getFieldProps('name').onChange({ target: { value: 'John Doe' } } as any)
        result.current.getFieldProps('email').onChange({ target: { value: 'john@example.com' } } as any)
      })

      expect(result.current.data.name).toBe('John Doe')

      // Reset form
      act(() => {
        result.current.reset()
      })

      expect(result.current.data).toEqual(initialData)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.submitError).toBeNull()
    })

    it('should clear persisted data on reset', () => {
      localStorage.setItem('test_form', JSON.stringify({ name: 'Test' }))

      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
          persistKey: 'test_form',
        })
      )

      act(() => {
        result.current.reset()
      })

      expect(localStorage.getItem('test_form')).toBeNull()
    })
  })

  describe('getFieldProps', () => {
    it('should return correct field props', () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      const fieldProps = result.current.getFieldProps('name')

      expect(fieldProps).toHaveProperty('name', 'name')
      expect(fieldProps).toHaveProperty('value', '')
      expect(fieldProps).toHaveProperty('onChange')
      expect(fieldProps).toHaveProperty('onBlur')
      expect(fieldProps).toHaveProperty('error', undefined)
    })

    it('should include error when field has error', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      const fieldProps = result.current.getFieldProps('name')
      expect(fieldProps.error).toBe('Name is required')
    })
  })

  describe('Error Management', () => {
    it('should allow manually setting field errors', () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      act(() => {
        result.current.setSubmitError('Manual error')
      })

      expect(result.current.submitError).toBe('Manual error')
    })

    it('should clear errors when field value changes', async () => {
      const { result } = renderHook(() =>
        useFormWithErrorHandling({
          initialData,
          validate: mockValidate,
          onSubmit: mockOnSubmit,
        })
      )

      // Trigger validation to set errors
      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.errors.name).toBeTruthy()

      // Change field value
      act(() => {
        result.current.getFieldProps('name').onChange({ target: { value: 'John' } } as any)
      })

      // Error should be cleared
      await waitFor(() => {
        expect(result.current.errors.name).toBeUndefined()
      })
    })
  })
})
