import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';

expect.extend(toHaveNoViolations);

describe('Card component', () => {
  it('renders Card with children', () => {
    const { getByText } = render(<Card>Card Content</Card>);
    expect(getByText('Card Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <Card className="custom-class" data-testid="card" />
    );
    expect(getByTestId('card')).toHaveClass('custom-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Card>Accessible Card</Card>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Card subcomponents', () => {
  it('renders CardHeader', () => {
    const { getByText } = render(<CardHeader>Header</CardHeader>);
    expect(getByText('Header')).toBeInTheDocument();
  });

  it('renders CardTitle', () => {
    const { getByText } = render(<CardTitle>Title</CardTitle>);
    expect(getByText('Title')).toBeInTheDocument();
  });

  it('renders CardDescription', () => {
    const { getByText } = render(<CardDescription>Description</CardDescription>);
    expect(getByText('Description')).toBeInTheDocument();
  });

  it('renders CardAction', () => {
    const { getByText } = render(<CardAction>Action</CardAction>);
    expect(getByText('Action')).toBeInTheDocument();
  });

  it('renders CardContent', () => {
    const { getByText } = render(<CardContent>Content</CardContent>);
    expect(getByText('Content')).toBeInTheDocument();
  });

  it('renders CardFooter', () => {
    const { getByText } = render(<CardFooter>Footer</CardFooter>);
    expect(getByText('Footer')).toBeInTheDocument();
  });
});