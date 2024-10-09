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
