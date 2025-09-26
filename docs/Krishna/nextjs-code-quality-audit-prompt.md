# Next.js Code Quality & Maintainability Audit Prompt for Claude Code

## Instructions for Claude Code

Please conduct a comprehensive code quality and maintainability audit of this Next.js application. Identify code smells, architectural issues, testing gaps, documentation problems, and technical debt. For each issue, provide specific file locations, refactoring suggestions, best practice implementations, and measurable quality metrics. Focus on long-term maintainability, team scalability, and code health.

## 1. TypeScript Coverage & Type Safety

### TypeScript Issues to Check:
- [ ] Missing TypeScript or using JavaScript
- [ ] Any types used instead of proper types
- [ ] Missing return type annotations
- [ ] Implicit any in function parameters
- [ ] Type assertions (as) overuse
- [ ] Missing generic types where needed
- [ ] Inconsistent type definitions
- [ ] Missing strict mode configurations
- [ ] No type checking in build process
- [ ] Runtime errors that TypeScript could prevent

### TypeScript Best Practices:
```typescript
// ❌ Bad - Weak typing
export const fetchUser = async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
};

const processData = (data: any) => {
  return data.map((item: any) => item.value);
};

// ✅ Good - Strong typing
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    total: number;
  };
}

export const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  const res = await fetch(`/api/users/${id}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.statusText}`);
  }
  
  return res.json() as Promise<ApiResponse<User>>;
};

const processData = <T extends { value: number }>(
  data: T[]
): number[] => {
  return data.map(item => item.value);
};

// Utility types for common patterns
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;

// Const assertions for literals
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number];

// Discriminated unions for state
type LoadingState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

### tsconfig.json Strict Configuration:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  }
}
```

## 2. Component Architecture & Organization

### Component Issues:
- [ ] Components doing too much (God components)
- [ ] Business logic in presentation components
- [ ] Missing component composition
- [ ] Prop drilling instead of context/composition
- [ ] Inconsistent component structure
- [ ] Missing custom hooks for logic reuse
- [ ] Components with 200+ lines
- [ ] Mixed container/presentation components
- [ ] Direct DOM manipulation in React

### Component Best Practices:
```typescript
// ❌ Bad - God component with mixed concerns
export default function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetching logic
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        // Sorting logic
        const sorted = data.sort((a, b) => {
          if (sort === 'name') return a.name.localeCompare(b.name);
          if (sort === 'date') return new Date(b.date) - new Date(a.date);
        });
        // Filtering logic
        const filtered = sorted.filter(user => 
          user.name.toLowerCase().includes(filter.toLowerCase())
        );
        setUsers(filtered);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [filter, sort]);
  
  // 200+ more lines of mixed logic and UI...
  
  return (
    <div>
      {/* Complex JSX */}
    </div>
  );
}

// ✅ Good - Separated concerns with composition
// Custom hooks for logic
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  return { users, loading, error, refetch: fetchUsers };
};

const useFilter = <T>(items: T[], predicate: (item: T) => boolean) => {
  return useMemo(() => items.filter(predicate), [items, predicate]);
};

const useSort = <T>(items: T[], compareFn: (a: T, b: T) => number) => {
  return useMemo(() => [...items].sort(compareFn), [items, compareFn]);
};

// Presentation components
const UserList: React.FC<{ users: User[] }> = ({ users }) => (
  <ul className="user-list">
    {users.map(user => (
      <UserCard key={user.id} user={user} />
    ))}
  </ul>
);

const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <li className="user-card">
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </li>
);

// Container component (minimal logic)
export default function UserDashboard() {
  const { users, loading, error } = useUsers();
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  
  const filteredUsers = useFilter(users, user => 
    user.name.toLowerCase().includes(filterText.toLowerCase())
  );
  
  const sortedUsers = useSort(filteredUsers, (a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  if (loading) return <UserDashboardSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="user-dashboard">
      <UserFilters 
        filterText={filterText}
        onFilterChange={setFilterText}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <UserList users={sortedUsers} />
    </div>
  );
}
```

### Folder Structure:
```
src/
├── components/
│   ├── common/           # Shared components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── Modal/
│   ├── features/        # Feature-specific components
│   │   ├── user/
│   │   │   ├── UserList/
│   │   │   ├── UserCard/
│   │   │   └── hooks/
│   │   │       ├── useUsers.ts
│   │   │       └── useUserFilters.ts
│   └── layouts/         # Layout components
├── lib/                 # Utilities and helpers
├── services/           # API services
├── types/              # TypeScript types
├── hooks/              # Global custom hooks
└── utils/              # Utility functions
```

## 3. State Management Architecture

### State Management Issues:
- [ ] Global state for local data
- [ ] Props drilling through multiple levels
- [ ] Missing state normalization
- [ ] Duplicated state in multiple places
- [ ] No clear state management strategy
- [ ] Mixing different state solutions
- [ ] Client state mixed with server state
- [ ] Missing optimistic updates

### State Management Best Practices:
```typescript
// ❌ Bad - Mixed state management
function App() {
  // Server state in component state
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // Global state for local UI
  const { setTheme } = useGlobalContext();
  
  // Props drilling
  return <DeepComponent users={users} posts={posts} />;
}

// ✅ Good - Clear state separation
// Server state with React Query/SWR
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onMutate: async (updatedUser) => {
      // Optimistic update
      await queryClient.cancelQueries(['users']);
      const previousUsers = queryClient.getQueryData(['users']);
      
      queryClient.setQueryData(['users'], (old: User[]) => 
        old.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      
      return { previousUsers };
    },
    onError: (err, updatedUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['users'], context.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

// Client state with Zustand/Jotai
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        toggleSidebar: () => set((state) => ({ 
          sidebarOpen: !state.sidebarOpen 
        })),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({ theme: state.theme }),
      }
    )
  )
);

// Form state with React Hook Form
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18'),
});

type UserFormData = z.infer<typeof userSchema>;

function UserForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
    },
  });
  
  const onSubmit = (data: UserFormData) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <input {...field} placeholder="Name" />
        )}
      />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

## 4. Code Duplication & DRY Violations

### Duplication Issues:
- [ ] Copy-pasted code blocks
- [ ] Similar functions with slight variations
- [ ] Repeated API calls patterns
- [ ] Duplicated validation logic
- [ ] Similar component structures
- [ ] Repeated error handling
- [ ] Duplicated types/interfaces
- [ ] Repeated CSS/styling patterns

### DRY Implementation:
```typescript
// ❌ Bad - Duplicated patterns
// UserList.tsx
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* render users */}</div>;
};

// PostList.tsx (duplicate pattern)
const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* render posts */}</div>;
};

// ✅ Good - Reusable abstractions
// Generic data fetching hook
function useApiData<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, options]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
}

// Higher-order component for data fetching
function withDataFetching<T, P extends { data: T }>(
  Component: React.ComponentType<P>,
  fetchUrl: string
) {
  return function WithDataFetchingComponent(props: Omit<P, 'data'>) {
    const { data, loading, error } = useApiData<T>(fetchUrl);
    
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;
    if (!data) return null;
    
    return <Component {...(props as P)} data={data} />;
  };
}

// Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

function List<T>({ 
  items, 
  renderItem, 
  keyExtractor, 
  emptyMessage = 'No items',
  className = ''
}: ListProps<T>) {
  if (items.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }
  
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage - no duplication
const UserList = () => {
  const { data: users, loading, error } = useApiData<User[]>('/api/users');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <List
      items={users || []}
      renderItem={(user) => <UserCard user={user} />}
      keyExtractor={(user) => user.id}
      emptyMessage="No users found"
    />
  );
};

// Utility functions to reduce duplication
const apiHelpers = {
  handleResponse: async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  
  buildUrl: (base: string, params: Record<string, any>) => {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  },
  
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
  },
};
```

## 5. Testing Coverage & Quality

### Testing Issues:
- [ ] No tests or very low coverage
- [ ] Testing implementation details
- [ ] Missing integration tests
- [ ] No E2E tests
- [ ] Brittle tests that break often
- [ ] Missing edge case testing
- [ ] No accessibility testing
- [ ] Tests with no assertions
- [ ] Snapshot tests without review
- [ ] Missing performance tests

### Comprehensive Testing Strategy:
```typescript
// ❌ Bad - Testing implementation details
describe('UserComponent', () => {
  it('should call setState', () => {
    const wrapper = shallow(<UserComponent />);
    wrapper.instance().setState({ name: 'John' });
    expect(wrapper.state('name')).toBe('John');
  });
});

// ✅ Good - Testing behavior and user interactions
// Unit test with React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from './UserForm';

describe('UserForm', () => {
  it('should submit valid user data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<UserForm onSubmit={handleSubmit} />);
    
    // Test user interactions
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.selectOptions(screen.getByLabelText(/role/i), 'admin');
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Test behavior, not implementation
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      });
    });
  });
  
  it('should display validation errors', async () => {
    const user = userEvent.setup();
    
    render(<UserForm onSubmit={jest.fn()} />);
    
    // Submit without filling form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Check error messages
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
  
  it('should be accessible', async () => {
    const { container } = render(<UserForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Integration test
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserDashboard Integration', () => {
  it('should fetch and display users', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserDashboard />
      </QueryClientProvider>
    );
    
    // Wait for data to load
    expect(await screen.findByText('John')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
  
  it('should handle server errors gracefully', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserDashboard />
      </QueryClientProvider>
    );
    
    expect(await screen.findByText(/error loading users/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});

// E2E test with Playwright
import { test, expect } from '@playwright/test';

test.describe('User Dashboard E2E', () => {
  test('should complete user workflow', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="user-list"]');
    
    // Search for user
    await page.fill('[placeholder="Search users..."]', 'John');
    await expect(page.locator('.user-card')).toHaveCount(1);
    
    // Click on user
    await page.click('.user-card:has-text("John")');
    await expect(page).toHaveURL(/\/users\/\d+/);
    
    // Edit user
    await page.click('button:has-text("Edit")');
    await page.fill('[name="name"]', 'John Updated');
    await page.click('button:has-text("Save")');
    
    // Verify update
    await expect(page.locator('h1')).toContainText('John Updated');
    
    // Test responsive behavior
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.mobile-menu')).toBeVisible();
  });
  
  test('should handle errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/users/*', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    await page.goto('/dashboard');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });
});

// Performance test
test('should load dashboard within performance budget', async ({ page }) => {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    };
  });
  
  expect(metrics.domContentLoaded).toBeLessThan(1000);
  expect(metrics.loadComplete).toBeLessThan(3000);
});
```

## 6. Error Handling Patterns

### Error Handling Issues:
- [ ] Unhandled promise rejections
- [ ] Generic catch blocks
- [ ] No error recovery strategies
- [ ] Missing error boundaries
- [ ] Swallowing errors silently
- [ ] No error logging
- [ ] Inconsistent error formats
- [ ] Missing user feedback

### Error Handling Best Practices:
```typescript
// ❌ Bad - Poor error handling
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    return res.json();
  } catch (e) {
    console.log(e);
    return null;
  }
}

// ✅ Good - Comprehensive error handling
// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

// Error handling utilities
const errorHandler = {
  handle: (error: Error): AppError => {
    if (error instanceof AppError) {
      return error;
    }
    
    // Convert known errors
    if (error.message.includes('Network')) {
      return new AppError('Network error', 'NETWORK_ERROR', 503);
    }
    
    // Unknown errors
    console.error('Unexpected error:', error);
    return new AppError(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500,
      false
    );
  },
  
  isRetryable: (error: AppError): boolean => {
    return ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE']
      .includes(error.code);
  },
  
  getUserMessage: (error: AppError): string => {
    const messages: Record<string, string> = {
      'NETWORK_ERROR': 'Please check your internet connection',
      'VALIDATION_ERROR': 'Please check your input and try again',
      'NOT_FOUND': 'The requested resource was not found',
      'UNAUTHORIZED': 'Please log in to continue',
      'FORBIDDEN': 'You do not have permission to perform this action',
    };
    
    return messages[error.code] || 'Something went wrong. Please try again.';
  },
};

// Result type for explicit error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchDataSafely<T>(url: string): Promise<Result<T, AppError>> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { 
          success: false, 
          error: new NotFoundError('Resource') 
        };
      }
      
      throw new AppError(
        `HTTP ${response.status}`,
        'HTTP_ERROR',
        response.status
      );
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    const appError = errorHandler.handle(error as Error);
    return { success: false, error: appError };
  }
}

// Usage with explicit error handling
async function useUserData(userId: string) {
  const result = await fetchDataSafely<User>(`/api/users/${userId}`);
  
  if (!result.success) {
    if (errorHandler.isRetryable(result.error)) {
      // Retry logic
      return retryWithBackoff(() => fetchDataSafely(`/api/users/${userId}`));
    }
    
    // Show user-friendly message
    showNotification({
      type: 'error',
      message: errorHandler.getUserMessage(result.error),
    });
    
    // Log to monitoring
    logError(result.error);
    
    return null;
  }
  
  return result.data;
}
```

## 7. Code Documentation & Comments

### Documentation Issues:
- [ ] Missing JSDoc for public APIs
- [ ] No README files
- [ ] Outdated comments
- [ ] Missing type documentation
- [ ] No architecture documentation
- [ ] Missing setup instructions
- [ ] No API documentation
- [ ] Complex logic without explanation
- [ ] Missing examples

### Documentation Best Practices:
```typescript
// ❌ Bad - No documentation
function calc(a: number, b: number, t: string) {
  // complicated logic
  if (t === 'p') return a * b;
  if (t === 'd') return a / b;
}

// ✅ Good - Well documented
/**
 * Calculates a mathematical operation between two numbers.
 * 
 * @param a - The first operand
 * @param b - The second operand
 * @param operation - The operation to perform
 * @returns The result of the operation
 * @throws {Error} When division by zero is attempted
 * @throws {Error} When an unknown operation is provided
 * 
 * @example
 * ```typescript
 * calculate(10, 5, 'multiply'); // Returns 50
 * calculate(10, 5, 'divide');   // Returns 2
 * ```
 */
function calculate(
  a: number, 
  b: number, 
  operation: 'add' | 'subtract' | 'multiply' | 'divide'
): number {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) {
        throw new Error('Division by zero is not allowed');
      }
      return a / b;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Custom hook for managing paginated data fetching.
 * 
 * @template T - The type of data being fetched
 * @param fetchFn - Function to fetch data for a given page
 * @param options - Configuration options
 * 
 * @example
 * ```typescript
 * const { 
 *   data, 
 *   loading, 
 *   error, 
 *   page, 
 *   nextPage, 
 *   prevPage 
 * } = usePagination(
 *   (page) => fetchUsers({ page, limit: 10 }),
 *   { initialPage: 1, cachePages: true }
 * );
 * ```
 */
interface PaginationOptions {
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Whether to cache fetched pages (default: true) */
  cachePages?: boolean;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
}

function usePagination<T>(
  fetchFn: (page: number) => Promise<PaginatedResponse<T>>,
  options: PaginationOptions = {}
) {
  // Implementation with inline comments for complex logic
  
  // Cache pages to avoid refetching
  const pageCache = useRef<Map<number, T[]>>(new Map());
  
  // Prefetch next page for better UX
  useEffect(() => {
    if (options.cachePages && data) {
      void fetchFn(page + 1).then(result => {
        pageCache.current.set(page + 1, result.data);
      });
    }
  }, [page, data]);
  
  // ... rest of implementation
}

// README.md example
```

## 8. Performance & Optimization

### Performance Issues:
- [ ] Unnecessary re-renders
- [ ] Missing React.memo/useMemo/useCallback
- [ ] Large bundle sizes
- [ ] Unoptimized images
- [ ] No code splitting
- [ ] Memory leaks
- [ ] Inefficient algorithms
- [ ] N+1 queries

### Performance Optimizations:
```typescript
// ❌ Bad - Performance issues
function ExpensiveComponent({ data, filter }) {
  // Recreated every render
  const processedData = data.map(item => ({
    ...item,
    computed: heavyComputation(item),
  }));
  
  // Recreated every render, causes child re-renders
  const handleClick = () => {
    console.log('clicked');
  };
  
  // Inefficient filtering
  const filtered = processedData.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      {filtered.map(item => (
        <ChildComponent 
          key={item.id} 
          item={item} 
          onClick={handleClick}
        />
      ))}
    </div>
  );
}

// ✅ Good - Optimized performance
const ExpensiveComponent = React.memo(({ data, filter }) => {
  // Memoize expensive computations
  const processedData = useMemo(() => 
    data.map(item => ({
      ...item,
      computed: heavyComputation(item),
    })),
    [data]
  );
  
  // Stable function reference
  const handleClick = useCallback((id: string) => {
    console.log('clicked', id);
  }, []);
  
  // Optimized filtering with early return
  const filtered = useMemo(() => {
    const lowerFilter = filter.toLowerCase();
    return processedData.filter(item => 
      item.name.toLowerCase().includes(lowerFilter)
    );
  }, [processedData, filter]);
  
  // Virtual scrolling for large lists
  const rowVirtualizer = useVirtual({
    size: filtered.length,
    parentRef,
    estimateSize: useCallback(() => 80, []),
  });
  
  return (
    <div ref={parentRef} className="list-container">
      <div style={{ height: `${rowVirtualizer.totalSize}px` }}>
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <ChildComponent
            key={filtered[virtualRow.index].id}
            item={filtered[virtualRow.index]}
            onClick={handleClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.data === nextProps.data &&
    prevProps.filter === nextProps.filter
  );
});

// Optimize child components
const ChildComponent = React.memo(({ item, onClick, style }) => {
  // Only re-render if item changes
  return (
    <div style={style} onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  );
});
```

## 9. Linting & Code Standards

### Code Quality Issues:
- [ ] No linting configuration
- [ ] Inconsistent code style
- [ ] Missing prettier configuration
- [ ] No pre-commit hooks
- [ ] Unused variables/imports
- [ ] Console.logs in production
- [ ] No naming conventions
- [ ] Mixed formatting

### ESLint & Prettier Configuration:
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'jest-dom',
    'testing-library',
    'import',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // React
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // General
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Import organization
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // Complexity
    'complexity': ['error', 10],
    'max-lines': ['error', 300],
    'max-lines-per-function': ['error', 50],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
  },
};

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}

// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged

// .lintstagedrc
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "jest --bail --findRelatedTests"
  ],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

## 10. Technical Debt Tracking

### Technical Debt Indicators:
- [ ] TODO comments without tracking
- [ ] Temporary workarounds
- [ ] Deprecated dependencies
- [ ] Legacy code patterns
- [ ] Missing migrations
- [ ] Outdated documentation
- [ ] Performance bottlenecks
- [ ] Security vulnerabilities

### Technical Debt Management:
```typescript
// Technical debt tracking with annotations
/**
 * @deprecated Use `useApiData` hook instead
 * @removal-date 2024-Q2
 * @migration-guide https://docs.example.com/migrations/use-api-data
 * @tech-debt TECH-1234
 */
export function legacyFetchData() {
  // Legacy implementation
}

// TODO tracking with actionable items
// TODO: [TECH-456] Refactor to use React Query - Priority: High - Due: 2024-03
// FIXME: [BUG-789] Race condition when rapid clicking - Priority: Critical
// HACK: Temporary workaround for Safari bug, remove when fixed in v16
// NOTE: This is intentionally synchronous for compatibility

// Technical debt documentation
interface TechDebtItem {
  id: string;
  type: 'bug' | 'refactor' | 'performance' | 'security' | 'upgrade';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'small' | 'medium' | 'large' | 'xlarge';
  description: string;
  impact: string;
  solution: string;
  blockers?: string[];
  relatedIssues?: string[];
  estimatedHours?: number;
  addedDate: Date;
  targetDate?: Date;
}

// tech-debt.json
{
  "items": [
    {
      "id": "TECH-001",
      "type": "refactor",
      "priority": "high",
      "effort": "large",
      "description": "Migrate from Redux to Zustand",
      "impact": "Reduce bundle size by 40KB, simplify state management",
      "solution": "Gradually migrate features to Zustand",
      "estimatedHours": 40,
      "addedDate": "2024-01-15",
      "targetDate": "2024-Q2"
    }
  ]
}
```

## Output Format

For each code quality issue found, provide:

```markdown
### Issue: [Code quality problem]
**Category**: [Architecture/Testing/Performance/Documentation/etc.]
**Severity**: Critical/High/Medium/Low
**Technical Debt Score**: [1-10]
**File(s)**: [Specific file paths]

**Current Implementation**:
```[problematic code]```

**Refactored Solution**:
```[improved code]```

**Benefits**:
- [List of improvements]
- [Performance impact]
- [Maintainability gains]

**Migration Path**:
1. [Step-by-step refactoring plan]
2. [Testing requirements]
3. [Rollback strategy]

**Estimated Effort**: [Hours/Days]
**Related Issues**: [Links to related problems]
```

## Code Metrics to Report

```markdown
## Code Quality Metrics

### Coverage
- Line Coverage: X%
- Branch Coverage: X%
- Function Coverage: X%
- Statement Coverage: X%

### Complexity
- Average Cyclomatic Complexity: X
- Files over complexity threshold: X
- Deepest nesting level: X

### Duplication
- Duplicated lines: X%
- Duplicated blocks: X
- Files with duplication: X

### Size
- Average file size: X lines
- Largest file: X lines
- Total LOC: X

### Dependencies
- Total dependencies: X
- Outdated dependencies: X
- Security vulnerabilities: X

### Type Safety
- TypeScript coverage: X%
- Files with 'any': X
- Files without types: X

### Documentation
- Functions with JSDoc: X%
- Public APIs documented: X%
- README completeness: X/10
```

## Priority Classification

### Critical (Immediate Fix):
- Security vulnerabilities
- Memory leaks
- Performance bottlenecks blocking users
- Complete lack of error handling

### High (This Sprint):
- No tests for critical paths
- Technical debt blocking features
- Major code duplication
- Missing TypeScript

### Medium (This Quarter):
- Low test coverage
- Documentation gaps
- Code organization issues
- Performance optimizations

### Low (When Time Allows):
- Code style inconsistencies
- Nice-to-have refactoring
- Additional test coverage
- Enhanced documentation

## Questions to Answer

1. What is the current test coverage percentage?
2. How many TypeScript errors/warnings exist?
3. Are there any circular dependencies?
4. What is the average component complexity?
5. How much code duplication exists?
6. Are coding standards consistently followed?
7. Is the architecture scalable for team growth?
8. What technical debt needs immediate attention?
9. Are performance best practices followed?
10. Is the codebase ready for production?

Please provide a comprehensive code quality audit with specific refactoring recommendations, prioritized by impact on maintainability, team velocity, and application reliability.