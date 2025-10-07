import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card container', () => {
      render(<Card data-testid="card">Card Content</Card>)
      const card = screen.getByTestId('card')

      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
      expect(card).toHaveClass('flex')
      expect(card).toHaveClass('flex-col')
      expect(card).toHaveClass('gap-6')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('py-6')
      expect(card).toHaveClass('shadow-sm')
    })

    it('should accept custom className', () => {
      render(
        <Card className="custom-class" data-testid="custom-card">
          Content
        </Card>
      )
      const card = screen.getByTestId('custom-card')

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
      expect(header).toHaveClass('grid')
      expect(header).toHaveClass('items-start')
      expect(header).toHaveClass('gap-1.5')
      expect(header).toHaveClass('px-6')
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
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('font-semibold')
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
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-muted-foreground')
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
      expect(content).toHaveClass('px-6')
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
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('px-6')
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

