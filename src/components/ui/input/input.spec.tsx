import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Input } from './input';

expect.extend(toHaveNoViolations);

describe('Input component', () => {
  it('renders the input with type and value', () => {
    const { getByDisplayValue } = render(<Input type="text" value="test value" readOnly />);
    expect(getByDisplayValue('test value')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Input type="text" onChange={handleChange} />);
    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Input disabled />);
    expect(getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    const { getByRole } = render(<Input className="custom-class" />);
    expect(getByRole('textbox')).toHaveClass('custom-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Input aria-label="test input" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
