import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card container', () => {
      render(<Card data-testid="card">Card Content</Card>)
      const card = screen.getByTestId('card')

      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm')
    })

    it('should accept custom className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content').parentElement

      expect(card).toHaveClass('custom-class')
    })

    it('should forward ref correctly', () => {
      const ref = jest.fn()
      render(<Card ref={ref}>Card with ref</Card>)

      expect(ref).toHaveBeenCalled()
    })
  })

  describe('CardHeader', () => {
    it('should render card header with correct styles', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header Content</CardHeader>
        </Card>
      )

      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex flex-col space-y-1.5 p-6')
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
        </Card>
      )

      const title = screen.getByText('Test Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight')
    })
  })

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
        </Card>
      )

      const description = screen.getByText('Test Description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm text-muted-foreground')
    })
  })

  describe('CardContent', () => {
    it('should render card content with correct padding', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content Area</CardContent>
        </Card>
      )

      const content = screen.getByTestId('content')
      expect(content).toHaveClass('p-6 pt-0')
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Footer Content</CardFooter>
        </Card>
      )

      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex items-center p-6 pt-0')
    })
  })

  describe('Complete Card', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description goes here')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should maintain proper structure and hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      const card = container.firstChild
      expect(card?.childNodes).toHaveLength(3) // Header, Content, Footer
    })
  })
})