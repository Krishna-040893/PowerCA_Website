# Next.js Error Handling & Monitoring Audit Prompt for Claude Code

## Instructions for Claude Code

Please conduct a comprehensive error handling and monitoring audit of this Next.js application. Identify missing error boundaries, inadequate error handling, poor user experience during failures, and absent monitoring/logging implementations. For each issue, provide specific file locations, potential failure scenarios, user impact assessment, and production-ready error handling code.

## 1. React Error Boundaries Implementation

### Error Boundary Coverage:
- [ ] Missing global error boundary in app root
- [ ] No error boundaries around high-risk components
- [ ] Error boundaries without fallback UI
- [ ] Error boundaries without error logging
- [ ] Missing error recovery mechanisms
- [ ] No error boundaries for dynamic imports
- [ ] Third-party components without protection
- [ ] Async components without boundaries

### Error Boundary Implementation:
```tsx
// Comprehensive Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    // Log to custom analytics
    logErrorToService({
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error!} />;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <h2>Oops! Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in app/layout.tsx or _app.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

// Component-specific boundaries
<ErrorBoundary fallback={ChartErrorFallback}>
  <ComplexChart data={data} />
</ErrorBoundary>
```

### Check for Missing Boundaries Around:
- Data visualization components
- Third-party integrations
- Dynamic content areas
- Payment/checkout flows
- Form submissions
- Media players
- Rich text editors

## 2. API Route Error Handling

### API Route Issues:
- [ ] Unhandled promise rejections
- [ ] Missing try-catch blocks
- [ ] Generic error responses
- [ ] Sensitive error details exposed
- [ ] No rate limiting error handling
- [ ] Database connection errors not handled
- [ ] Missing request validation errors
- [ ] No timeout handling

### Proper API Route Error Handling:
```typescript
// app/api/users/[id]/route.ts or pages/api/users/[id].ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Input validation schema
const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// Error response helper
function errorResponse(
  message: string,
  status: number,
  details?: unknown
) {
  const errorId = crypto.randomUUID();
  
  // Log full error details server-side
  logger.error({
    errorId,
    message,
    status,
    details,
    timestamp: new Date().toISOString(),
  });

  // Return sanitized error to client
  return NextResponse.json(
    {
      error: {
        message,
        errorId, // For support reference
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req);
    if (!rateLimitResult.success) {
      return errorResponse(
        'Too many requests. Please try again later.',
        429,
        { retryAfter: rateLimitResult.retryAfter }
      );
    }

    // Validate params
    const validatedParams = paramsSchema.safeParse(params);
    if (!validatedParams.success) {
      return errorResponse(
        'Invalid request parameters',
        400,
        validatedParams.error.flatten()
      );
    }

    // Validate body
    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse('Invalid JSON body', 400);
    }

    const validatedBody = bodySchema.safeParse(body);
    if (!validatedBody.success) {
      return errorResponse(
        'Invalid request body',
        400,
        validatedBody.error.flatten()
      );
    }

    // Set timeout for database operations
    const updatePromise = updateUser(
      validatedParams.data.id,
      validatedBody.data
    );
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );

    const user = await Promise.race([updatePromise, timeoutPromise]);

    // Log successful operation
    logger.info({
      action: 'user_updated',
      userId: validatedParams.data.id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ data: user });

  } catch (error) {
    // Handle different error types
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.errors);
    }

    if (error?.code === 'P2002') { // Prisma unique constraint
      return errorResponse('Email already exists', 409);
    }

    if (error?.code === 'P2025') { // Prisma record not found
      return errorResponse('User not found', 404);
    }

    if (error?.message === 'Database timeout') {
      return errorResponse(
        'Request timeout. Please try again.',
        504
      );
    }

    if (error?.name === 'UnauthorizedError') {
      return errorResponse('Unauthorized', 401);
    }

    // Generic error fallback
    return errorResponse(
      'An unexpected error occurred',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    // Always log request metrics
    logger.metrics({
      path: `/api/users/${params.id}`,
      method: 'PUT',
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  }
}

// Global error handler for unhandled routes
export async function handleError(error: unknown, req: NextRequest) {
  logger.error({
    error: error instanceof Error ? error.message : 'Unknown error',
    url: req.url,
    method: req.method,
  });

  return errorResponse('Internal server error', 500);
}
```

## 3. Client-Side Error Handling

### Client-Side Issues:
- [ ] Unhandled promise rejections
- [ ] Network errors not caught
- [ ] Missing loading states
- [ ] No retry mechanisms
- [ ] Infinite error loops
- [ ] Silent failures
- [ ] Console errors in production
- [ ] Memory leaks from error states

### Comprehensive Client Error Handling:
```tsx
// Custom hook for API calls with error handling
function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options?: {
      retry?: number;
      retryDelay?: number;
      onError?: (error: Error) => void;
    }
  ) => {
    const maxRetries = options?.retry ?? 3;
    const retryDelay = options?.retryDelay ?? 1000;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Log to monitoring
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error);
      }

      // Retry logic for specific errors
      const isRetryable = 
        error.message.includes('Network') ||
        error.message.includes('Timeout') ||
        (error as any).status >= 500;

      if (isRetryable && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          execute(apiCall, options);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return;
      }

      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  return { data, error, loading, execute, retry: () => execute };
}

// Component with comprehensive error handling
function DataComponent() {
  const { data, error, loading, retry } = useApiCall<UserData>();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    execute(
      () => fetch('/api/user').then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      {
        retry: 3,
        onError: (error) => {
          // Custom error handling
          if (error.message.includes('401')) {
            router.push('/login');
          } else if (error.message.includes('403')) {
            setLocalError('You do not have permission to view this data');
          }
        }
      }
    );
  }, []);

  if (loading) {
    return <Skeleton />;
  }

  if (error || localError) {
    return (
      <ErrorDisplay
        error={error || new Error(localError!)}
        onRetry={retry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  return <DataDisplay data={data} />;
}
```

## 4. Form Validation & Error Display

### Form Error Handling Issues:
- [ ] Validation errors not user-friendly
- [ ] Errors disappear too quickly
- [ ] No inline validation feedback
- [ ] Submit errors not handled
- [ ] Lost form data on error
- [ ] No success confirmations
- [ ] Accessibility issues with errors

### Comprehensive Form Error Handling:
```tsx
// Form with complete error handling
function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Preserve form data in sessionStorage
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('contactFormData');
      return saved ? JSON.parse(saved) : { name: '', email: '', message: '' };
    }
    return { name: '', email: '', message: '' };
  });

  // Save form data on change
  useEffect(() => {
    sessionStorage.setItem('contactFormData', JSON.stringify(formData));
  }, [formData]);

  // Field validation
  const validateField = (name: string, value: string) => {
    const fieldErrors: Record<string, string> = {};

    switch (name) {
      case 'email':
        if (!value) {
          fieldErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          fieldErrors.email = 'Please enter a valid email address';
        }
        break;
      case 'name':
        if (!value) {
          fieldErrors.name = 'Name is required';
        } else if (value.length < 2) {
          fieldErrors.name = 'Name must be at least 2 characters';
        }
        break;
      case 'message':
        if (!value) {
          fieldErrors.message = 'Message is required';
        } else if (value.length < 10) {
          fieldErrors.message = 'Message must be at least 10 characters';
        }
        break;
    }

    return fieldErrors;
  };

  // Handle field change with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Debounced validation
    const timeoutId = setTimeout(() => {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate all fields
    const validationErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      Object.assign(validationErrors, validateField(key, value));
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Server error: ${response.status}`);
      }

      // Success handling
      setSubmitSuccess(true);
      sessionStorage.removeItem('contactFormData');
      setFormData({ name: '', email: '', message: '' });

      // Show success message with auto-dismiss
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      // Error handling
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );

      // Log to monitoring
      console.error('Form submission error:', error);
      
      // Don't clear form data on error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {/* Success message */}
      {submitSuccess && (
        <div 
          role="alert" 
          aria-live="polite"
          className="success-message"
        >
          <CheckIcon /> Your message has been sent successfully!
        </div>
      )}

      {/* Global error message */}
      {submitError && (
        <div 
          role="alert" 
          aria-live="assertive"
          className="error-message"
        >
          <ErrorIcon /> {submitError}
          <button 
            type="button"
            onClick={() => setSubmitError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Form fields with inline errors */}
      <div className="form-group">
        <label htmlFor="name">
          Name <span aria-label="required">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          disabled={submitting}
        />
        {errors.name && (
          <span id="name-error" className="field-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email <span aria-label="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          disabled={submitting}
        />
        {errors.email && (
          <span id="email-error" className="field-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <button 
        type="submit" 
        disabled={submitting || Object.keys(errors).length > 0}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            <Spinner /> Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
```

## 5. Network & Async Error Handling

### Network Error Issues:
- [ ] No offline detection
- [ ] Missing timeout handling
- [ ] No retry logic
- [ ] Network errors not user-friendly
- [ ] No request cancellation
- [ ] Race conditions not handled

### Network Error Handling Implementation:
```typescript
// Advanced fetch wrapper with error handling
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private controller: AbortController | null = null;

  constructor(config: {
    baseURL: string;
    timeout?: number;
    retries?: number;
  }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    this.controller = new AbortController();
    
    const timeoutId = setTimeout(() => {
      this.controller?.abort();
    }, this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: this.controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error | null = null;

    // Check network status
    if (!navigator.onLine) {
      throw new NetworkError('No internet connection');
    }

    // Retry logic with exponential backoff
    for (let i = 0; i <= this.retries; i++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // Handle different response statuses
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(
            `Rate limited. Retry after ${retryAfter} seconds`,
            parseInt(retryAfter || '60')
          );
        }

        if (response.status === 401) {
          // Handle authentication error
          await refreshToken();
          // Retry request with new token
          continue;
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new ApiError(
            error.message || `HTTP ${response.status}`,
            response.status,
            error
          );
        }

        const data = await response.json();
        return data;

      } catch (error) {
        lastError = error as Error;

        // Don't retry for client errors (4xx)
        if (error instanceof ApiError && error.status < 500) {
          throw error;
        }

        // Exponential backoff for retries
        if (i < this.retries) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  // Cancel ongoing requests
  cancel() {
    this.controller?.abort();
  }
}

// Custom error classes
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
```

## 6. Error Logging & Monitoring Setup

### Monitoring Issues:
- [ ] No error tracking service
- [ ] Console.log in production
- [ ] Missing performance monitoring
- [ ] No user session tracking
- [ ] Missing custom error events
- [ ] No error aggregation
- [ ] Missing alerting rules

### Comprehensive Monitoring Setup:
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry
export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        
        // Don't send events in development
        if (window.location.hostname === 'localhost') {
          return null;
        }
        
        return event;
      },
    });
  }
}

// Custom error logger
class ErrorLogger {
  private queue: ErrorLog[] = [];
  private flushInterval: number = 5000;
  private maxQueueSize: number = 50;

  constructor() {
    // Batch send errors
    setInterval(() => this.flush(), this.flushInterval);
    
    // Send errors before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  log(error: ErrorLog) {
    this.queue.push({
      ...error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
    });

    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors }),
      });
    } catch (err) {
      // Re-queue errors if sending fails
      this.queue.unshift(...errors);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}

interface ErrorLog {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  sessionId?: string;
}

export const errorLogger = new ErrorLogger();

// Performance monitoring
export function trackPerformance() {
  if (typeof window === 'undefined') return;

  // Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        errorLogger.log({
          message: 'LCP',
          level: 'info',
          context: { value: entry.startTime },
        });
      }
    }
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });

  // Track long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        errorLogger.log({
          message: 'Long Task',
          level: 'warning',
          context: {
            duration: entry.duration,
            name: entry.name,
          },
        });
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task observer not supported
    }
  }
}
```

## 7. Loading States & Optimistic Updates

### Loading State Issues:
- [ ] No loading indicators
- [ ] Loading states blocking UI
- [ ] No skeleton screens
- [ ] Missing progress indicators
- [ ] Jarring loading transitions
- [ ] No optimistic updates

### Loading State Implementation:
```tsx
// Skeleton loader component
function Skeleton({ 
  width, 
  height, 
  variant = 'rectangular' 
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton skeleton-${variant}`}
      style={{ width, height }}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

// Data component with loading states
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Optimistic update handler
  const updateUser = async (field: string, value: any) => {
    setUpdating(field);
    
    // Optimistic update
    const previousValue = user?.[field];
    setUser(prev => prev ? { ...prev, [field]: value } : null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Show success toast
      showToast('Profile updated successfully', 'success');
      
    } catch (error) {
      // Revert optimistic update
      setUser(prev => prev ? { ...prev, [field]: previousValue } : null);
      setError(error as Error);
      showToast('Failed to update profile', 'error');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="user-profile">
        <Skeleton variant="circular" width={80} height={80} />
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="rectangular" width="100%" height={200} />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchUser} />;
  }

  return (
    <div className="user-profile">
      <img 
        src={user.avatar} 
        alt={user.name}
        loading="lazy"
      />
      <h1>
        {user.name}
        {updating === 'name' && <Spinner size="small" />}
      </h1>
      <p>
        {user.bio}
        {updating === 'bio' && <Spinner size="small" />}
      </p>
    </div>
  );
}
```

## 8. Error Recovery Strategies

### Recovery Issues:
- [ ] No retry mechanisms
- [ ] Missing fallback data
- [ ] No offline support
- [ ] Lost user work
- [ ] No graceful degradation
- [ ] Missing circuit breakers

### Error Recovery Implementation:
```typescript
// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime! > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        if (fallback) return fallback();
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Offline support with service worker
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open('v1').then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          }
        );
      })
      .catch(() => {
        // Offline fallback
        return caches.match('/offline.html');
      })
  );
});

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) break;
      
      const delay = baseDelay * Math.pow(2, i);
      const jitter = Math.random() * 1000;
      
      await new Promise(resolve => 
        setTimeout(resolve, delay + jitter)
      );
    }
  }

  throw lastError!;
}
```

## 9. Custom Error Pages

### Error Page Issues:
- [ ] Generic 404/500 pages
- [ ] No helpful error messages
- [ ] Missing navigation options
- [ ] No error reporting option
- [ ] Not brand consistent
- [ ] Missing search functionality

### Custom Error Pages Implementation:
```tsx
// app/error.tsx or pages/_error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { errorLogger } from '@/lib/monitoring';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to monitoring service
    errorLogger.log({
      message: error.message,
      stack: error.stack,
      level: 'error',
      context: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-content">
        <h1>Oops! Something went wrong</h1>
        <p>We're sorry, but something unexpected happened.</p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Error details</summary>
            <pre>{error.stack}</pre>
          </details>
        )}

        <div className="error-actions">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <button onClick={() => router.push('/')} className="btn-secondary">
            Go home
          </button>
          <button 
            onClick={() => reportError(error)}
            className="btn-tertiary"
          >
            Report issue
          </button>
        </div>

        <div className="error-suggestions">
          <h2>Here are some things you can try:</h2>
          <ul>
            <li>Refresh the page</li>
            <li>Clear your browser cache</li>
            <li>Check your internet connection</li>
            <li>Try again in a few minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// app/not-found.tsx or pages/404.tsx
export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="search"
            placeholder="Search our site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="suggestions">
          <h2>Popular pages:</h2>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <Link href="/" className="btn-home">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
```

## 10. Testing Error Scenarios

### Testing Coverage:
- [ ] Error boundary tests
- [ ] API error response tests
- [ ] Network failure tests
- [ ] Timeout scenario tests
- [ ] Validation error tests
- [ ] Loading state tests

### Error Testing Implementation:
```typescript
// __tests__/error-handling.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('Error Handling', () => {
  it('should display error message on API failure', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: { message: 'Server error' } })
        );
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i }))
      .toBeInTheDocument();
  });

  it('should retry failed requests', async () => {
    let attemptCount = 0;
    
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        attemptCount++;
        if (attemptCount < 3) {
          return res(ctx.status(500));
        }
        return res(ctx.json({ users: [] }));
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/users/i)).toBeInTheDocument();
    });

    expect(attemptCount).toBe(3);
  });

  it('should handle network timeouts', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.delay(10000)); // Delay longer than timeout
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/timeout/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should preserve form data on submission error', async () => {
    server.use(
      rest.post('/api/contact', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Form data should be preserved
    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
  });
});
```

## Output Format

For each error handling issue found, provide:

```markdown
### Issue: [Brief description]
**Severity**: Critical/High/Medium/Low
**Category**: [Error Boundaries/API/Forms/Network/etc.]
**File(s)**: [Specific file paths]
**User Impact**: [What happens when error occurs]

**Current Implementation**:
```[current code or "Missing"]```

**Recommended Implementation**:
```[complete error handling code]```

**Test Coverage**:
```[test code to verify error handling]```

**Monitoring Integration**:
[How to track this error in production]

**Additional Considerations**:
- [Related improvements]
- [Performance impact]
- [User experience notes]
```

## Priority Classification

### Critical (User Data Loss):
- Missing error boundaries on payment flows
- Form data loss on errors
- No error handling in data mutations
- Infinite error loops

### High (Feature Broken):
- API errors not handled
- Missing loading states
- No retry mechanisms
- Network errors crashing app

### Medium (Poor UX):
- Generic error messages
- No offline support
- Missing validation feedback
- Console errors in production

### Low (Enhancement):
- Missing error analytics
- No progressive enhancement
- Basic error pages
- Limited retry strategies

## Questions to Answer

1. Are error boundaries implemented globally and on risky components?
2. Do all API calls have proper error handling?
3. Are errors logged to a monitoring service?
4. Do forms preserve data on submission errors?
5. Are network failures handled gracefully?
6. Do users receive helpful error messages?
7. Are there retry mechanisms for transient failures?
8. Is there offline support or graceful degradation?
9. Are loading states shown during async operations?
10. Are custom error pages informative and helpful?

Please provide a comprehensive error handling audit with prioritized recommendations for improving reliability, user experience during failures, and debugging capabilities in production.