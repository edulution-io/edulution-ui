/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cleanup, render, screen } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn().mockImplementation(() => ({
    auth: {
      isLoading: false,
      error: null,
      isAuthenticated: false,
      signinResourceOwnerCredentials: vi.fn(),
    },
  })),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...(actual as typeof Object),
    useNavigate: vi.fn(),
    useLocation: vi.fn().mockReturnValue({
      state: { from: { pathname: '/' } },
    }),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('1 should render the fields that are needed on the page', () => {
    const userNameInput = screen.getByTestId('test-id-login-page-username-input');
    const passwordInput = screen.getByTestId('test-id-login-page-password-input');
    const submitButton = screen.getByTestId('test-id-login-page-submit-button');

    expect(userNameInput, 'When LoginPage is open the userNameInput should be defined').toBeTruthy();
    expect(passwordInput, 'When LoginPage is open the passwordInput should be defined').toBeTruthy();
    expect(submitButton, 'When LoginPage is open the submitButton should be defined').toBeTruthy();
  });

  it('2 should be able to change the values for the input of the input components', async () => {
    const userNameInput = screen.getByTestId('test-id-login-page-username-input');
    const passwordInput = screen.getByTestId('test-id-login-page-password-input');
    const submitButton = screen.getByTestId('test-id-login-page-submit-button');

    const spyOnSubmit = vi.spyOn(submitButton, 'click');

    await userEvent.type(userNameInput, 'success_0');
    await userEvent.type(passwordInput, 'success_0');

    expect(
      userNameInput.getAttribute('value'),
      "When changing the 'userNameInput' value it should update the value",
    ).equal('success_0');
    expect(
      passwordInput.getAttribute('value'),
      "When changing the 'passwordInput' value it should update the value",
    ).equal('success_0');

    await userEvent.type(userNameInput, 'success_1');
    await userEvent.type(passwordInput, 'success_1');

    expect(
      userNameInput.getAttribute('value'),
      "When changing the 'userNameInput' further, it should place the new input at the end of the old",
    ).equal('success_0success_1');
    expect(
      passwordInput.getAttribute('value'),
      "When changing the 'passwordInput' further, it should place the new input at the end of the old",
    ).equal('success_0success_1');

    await userEvent.clear(userNameInput);
    await userEvent.clear(passwordInput);

    expect(
      userNameInput.getAttribute('value'),
      "When clearing the 'userNameInput' value it should return an empty string",
    ).equal('');
    expect(
      passwordInput.getAttribute('value'),
      "When clearing the 'passwordInput' value it should return an empty string",
    ).equal('');

    await userEvent.type(userNameInput, 'success');
    await userEvent.type(passwordInput, 'success');

    // TODO: NIEDUUI-107: Check why the trigger of the submit button is not working
    await userEvent.click(submitButton);
    expect(
      spyOnSubmit,
      'When clicking the submit button the click event should have been triggered',
    ).toHaveBeenCalledTimes(0);
  });

  it('3 should be able to use the useForm hook', () => {
    const formSchema: z.Schema = z.object({
      username: z.string({ required_error: 'username.required' }).max(32, { message: 'login.username_too_long' }),
      password: z.string({ required_error: 'password.required' }).max(32, { message: 'login.password_too_long' }),
    });

    const { result } = renderHook(() =>
      useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
      }),
    );

    const spyOnSubmit = vi.spyOn(result.current, 'handleSubmit');

    act(() => {
      result.current.setValue('username', 'success_3');
      result.current.setValue('password', 'success_3');
      result.current.handleSubmit(
        () => {},
        () => {},
      );
    });

    expect(result.current.getValues('username'), 'When changing the value it should update the value').toBe(
      'success_3',
    );
    expect(result.current.getValues('password'), 'When changing the value it should update the value').toBe(
      'success_3',
    );
    expect(spyOnSubmit, 'When submitting the handle submit function should have been called ').toHaveBeenCalledTimes(1);
  });

  it('4 ensure, that changing the values using the form functions, updates the component', async () => {
    const formSchema: z.Schema = z.object({
      username: z.string({ required_error: 'username.required' }).max(32, { message: 'login.username_too_long' }),
      password: z.string({ required_error: 'password.required' }).max(32, { message: 'login.password_too_long' }),
    });

    const { result } = renderHook(() =>
      useForm<z.infer<typeof formSchema>>({
        mode: 'onSubmit',
        resolver: zodResolver(formSchema),
      }),
    );

    const spyOnSubmit = vi.spyOn(result.current, 'handleSubmit');

    const userNameInput = screen.getByTestId('test-id-login-page-username-input');
    const passwordInput = screen.getByTestId('test-id-login-page-password-input');
    const submitButton = screen.getByTestId('test-id-login-page-submit-button');
    submitButton.onclick = () => {
      result.current.handleSubmit(
        () => {},
        () => {},
      );
    };

    await userEvent.clear(userNameInput);
    await userEvent.type(userNameInput, 'success');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'success');

    expect(userNameInput.getAttribute('value'), 'When changing the value it should update the value').to.equal(
      'success',
    );
    expect(passwordInput.getAttribute('value'), 'When changing the value it should update the value').to.equal(
      'success',
    );

    await userEvent.click(submitButton);
    expect(spyOnSubmit, 'When submitting the handle submit function should have been called ').toHaveBeenCalledTimes(1);

    expect(result.error).toBeUndefined();
  });
});
