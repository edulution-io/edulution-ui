/**
 * @jest-environment jsdom
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { vi, describe, beforeAll, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { userEvent } from '@testing-library/user-event';
import LoginPage from './LoginPage';

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn().mockImplementation(() => ({
    auth: {
      isLoading: false,
      error: null,
      isAuthenticated: false,
      signinResourceOwnerCredentials: () =>
        vi.fn().mockResolvedValue(() => ({ data: { access_token: '', token_type: '', profile: {} } })),
    },
  })),
}));

describe('LoginPage', () => {
  beforeAll(() => {
    render(<LoginPage />);
  });

  it('1 should render the fields that are needed on the page', () => {
    const userNameInput = screen.getByTestId('test-id-login-page-user-name-input');
    const passwordInput = screen.getByTestId('test-id-login-page-password-input');
    const submitButton = screen.getByTestId('test-id-login-page-submit-button');

    expect(userNameInput, 'When LoginPage is open the userNameInput should be defined').toBeDefined();
    expect(userNameInput, 'When LoginPage is open the userNameInput should not be null').not.equal(null);
    expect(passwordInput, 'When LoginPage is open the passwordInput should be defined').toBeDefined();
    expect(passwordInput, 'When LoginPage is open the passwordInput should not be null').not.equal(null);
    expect(submitButton, 'When LoginPage is open the submitButton should be defined').toBeDefined();
    expect(submitButton, 'When LoginPage is open the submitButton should not be null').not.equal(null);
  });

  it('2 should be able to change the values for the input of the input components', () => {
    const userNameInput = screen.getByTestId('test-id-login-page-user-name-input');
    const passwordInput = screen.getByTestId('test-id-login-page-password-input');

    userNameInput.setAttribute('value', 'success');
    passwordInput.setAttribute('value', 'success');

    expect(userNameInput.getAttribute('value'), 'When changing the value it should update the value').equal('success');
    expect(passwordInput.getAttribute('value'), 'When changing the value it should update the value').equal('success');
  });

  it('3 should be able to execute the functions for the form to change the values of the input components', () => {
    const { result } = renderHook(() => useForm());
    const spyOnSubmit = vi.spyOn(result.current, 'handleSubmit');

    act(() => {
      result.current.setValue('username', 'success');
      result.current.setValue('password', 'success');
      result.current.handleSubmit(
        () => {},
        () => {},
      );
    });

    expect(result.current.getValues('username'), 'When changing the value it should update the value').toBe('success');
    expect(result.current.getValues('password'), 'When changing the value it should update the value').toBe('success');
    expect(spyOnSubmit, 'When submitting the handle submit function should have been called ').toHaveBeenCalledTimes(1);
  });

  it('4 ensure, that changing the values using the form functions, updates the component', async () => {
    const { result } = renderHook(() => useForm());

    const userNameInput = screen.getByTestId('test-id-login-page-user-name-input');
    const passwordInput = screen.getByTestId('test-id-login-page-password-input');
    const submitButton = screen.getByTestId('test-id-login-page-submit-button');

    await userEvent.type(userNameInput, 'success');
    await userEvent.type(passwordInput, 'success');

    expect(userNameInput.getAttribute('value'), 'When changing the value it should update the value').to.equal(
      'success',
    );
    expect(passwordInput.getAttribute('value'), 'When changing the value it should update the value').to.equal(
      'success',
    );

    await userEvent.click(submitButton);
    expect(result.error).toBeUndefined();
  });
});
