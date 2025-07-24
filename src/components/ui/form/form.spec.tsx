import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '../input/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';

expect.extend(toHaveNoViolations);

type FormData = {
  email: string;
};

function TestForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const methods = useForm({
    defaultValues: { email: '' },
  });

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button type="submit">Submit</button>
        </form>
      </Form>
    </FormProvider>
  );
}

describe('Form component', () => {
  it('renders form fields and label', () => {
    const { getByLabelText } = render(<TestForm onSubmit={() => {}} />);
    expect(getByLabelText('Email')).toBeInTheDocument();
  });

  it('calls onSubmit with form values', async () => {
    const handleSubmit = jest.fn();
    const { getByLabelText, getByText } = render(<TestForm onSubmit={handleSubmit} />);
    await act(async () => {
      fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.click(getByText('Submit'));
    });
    expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' }, expect.anything());
  });

  it('shows validation error message', async () => {
    function RequiredForm() {
      const methods = useForm({
        defaultValues: { email: '' },
        mode: 'onSubmit',
      });
      return (
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(() => {})}>
              <FormField
                control={methods.control}
                name="email"
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="submit">Submit</button>
            </form>
          </Form>
        </FormProvider>
      );
    }
    const { getByText } = render(<RequiredForm />);
    await act(async () => {
      fireEvent.click(getByText('Submit'));
    });
    expect(await getByText((content) => content.includes('Email is required'))).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TestForm onSubmit={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
