/**
 * @jest-environment jsdom
 */
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import LoginPage from './LoginPage';
import { useForm } from 'react-hook-form';

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn().mockImplementation(() => ({
    auth: {
      isLoading: false,
      error: null,
      isAuthenticated: false,
      signinResourceOwnerCredentials: () => vi.fn().mockResolvedValue(() =>
        ({ data: { access_token: '', token_type: '', profile: {} }})
      ),
    },
  })),
}));

describe('LoginPage', () => {
  it('1 should render the fields that are needed on the page', () => {
    const { getAllByTestId } = render(<LoginPage />);

    const userNameInput = getAllByTestId('test-id-login-page-user-name-input')[0];
    const passwordInput = getAllByTestId('test-id-login-page-password-input')[0];
    const submitButton = getAllByTestId('test-id-login-page-submit-button')[0];

    expect(userNameInput).toBeDefined();
    expect(userNameInput).not.equal(null);
    expect(passwordInput).toBeDefined();
    expect(passwordInput).not.equal(null);
    expect(submitButton).toBeDefined();
    expect(submitButton).not.equal(null);
  })

  it('2 should be able to change the values for the input of the input components', () => {
    const { getAllByTestId } = render(<LoginPage />);

    const userNameInput = getAllByTestId('test-id-login-page-user-name-input')[0];
    const passwordInput = getAllByTestId('test-id-login-page-password-input')[0];

    userNameInput.setAttribute('value', 'success');
    passwordInput.setAttribute('value', 'success');

    expect(userNameInput.getAttribute('value')).equal('success');
    expect(passwordInput.getAttribute('value')).equal('success');
  })

  it('3 should be able to execute the functions for the form to change the values of the input components', () => {
    render(<LoginPage />);

    const { result } = renderHook(() => useForm())
    const spyOnSubmit = vi.spyOn(result.current, 'handleSubmit')

    act(() => {
      result.current.setValue('username', 'success');
      result.current.setValue('password', 'success');
      result.current.handleSubmit();
    })

    expect(result.current.getValues('username')).toBe('success')
    expect(result.current.getValues('password')).toBe('success')
    expect(spyOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('4 ensure, that changing the values using the form functions, updates the component', () => {
    const { getAllByTestId } = render(<LoginPage />);

    const { result } = renderHook(() => useForm())

    const userNameInput = getAllByTestId('test-id-login-page-user-name-input')[0];
    const passwordInput = getAllByTestId('test-id-login-page-password-input')[0];

    act(() => {
      result.current.setValue('username', 'success');
      result.current.setValue('password', 'success');
    })

    expect(userNameInput.getAttribute('value')).to.equal('success');
    expect(passwordInput.getAttribute('value')).to.equal('success');
  })
})
