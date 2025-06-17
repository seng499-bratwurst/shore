import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from './textarea';

expect.extend(toHaveNoViolations);

describe('Textarea component', () => {
  it('renders the textarea with placeholder', () => {
    const { getByPlaceholderText } = render(<Textarea placeholder="Type here..." />);
    expect(getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Textarea onChange={handleChange} />);
    fireEvent.change(getByRole('textbox'), { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { getByRole } = render(<Textarea className="custom-class" />);
    expect(getByRole('textbox')).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Textarea disabled />);
    expect(getByRole('textbox')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Textarea placeholder="Accessible" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
