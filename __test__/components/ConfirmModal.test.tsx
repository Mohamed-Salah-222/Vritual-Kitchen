import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/components/ConfirmModal";

describe("ConfirmModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<ConfirmModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} title="Test Title" message="Test Message" />);

    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<ConfirmModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} title="Test Title" message="Test Message" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("should call onClose when cancel is clicked", () => {
    render(<ConfirmModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} title="Test Title" message="Test Message" cancelText="Cancel" />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm is clicked", () => {
    render(<ConfirmModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} title="Test Title" message="Test Message" confirmText="Confirm" />);

    fireEvent.click(screen.getByText("Confirm"));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when isLoading is true", () => {
    render(<ConfirmModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} title="Test Title" message="Test Message" isLoading={true} confirmText="Confirm" cancelText="Cancel" />);

    const confirmButton = screen.getByText("Processing...");
    const cancelButton = screen.getByText("Cancel");

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
