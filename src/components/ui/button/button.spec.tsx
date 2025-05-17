import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";
import { Button } from "./button";

describe("Button component", () => {
  it("renders the button with children", () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    expect(getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    const { getByRole } = render(
      <Button className="custom-class">Test</Button>
    );
    expect(getByRole("button")).toHaveClass("custom-class");
  });
});
