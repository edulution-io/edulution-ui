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
 * * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(() => ({
    user: {
      profile: {
        ldapGroups: ['globaladmin'],
      },
    },
  })),
}));

vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(),
}));

describe('FileSharingPage', () => {
  it('should render the fields that are needed on the page', () => {
    render(
      <BrowserRouter>
        <FileSharingPage />
      </BrowserRouter>,
    );

    const dataTable = screen.getByTestId('test-id-file-sharing-page-data-table');

    expect(dataTable, 'When FileSharing page is opened the dataTable should be defined').toBeTruthy();
  });
});
