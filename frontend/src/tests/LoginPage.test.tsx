import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
    error: null,
    clearError: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    user: null,
    checkAuth: vi.fn(),
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
      checkAuth: vi.fn(),
    });
  });

  it('renders login form correctly', () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByLabelText(/البريد الإلكتروني/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/كلمة المرور/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithRouter(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/البريد الإلكتروني غير صحيح/i)).toBeInTheDocument();
    });
  });

  it('calls login with correct credentials', async () => {
    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByLabelText(/البريد الإلكتروني/i);
    const passwordInput = screen.getByLabelText(/كلمة المرور/i);
    const submitButton = screen.getByRole('button', { name: /تسجيل الدخول/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message when login fails', async () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      clearError: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
      checkAuth: vi.fn(),
    });

    renderWithRouter(<LoginPage />);

    expect(screen.getByText(/البريد الإلكتروني أو كلمة المرور غير صحيحة/i)).toBeInTheDocument();
  });
});
