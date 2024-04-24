/**
 * @jest-environment jsdom
 */
import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FileSharingPage from './FileSharing';

vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(),
}));

describe('FileSharing', () => {
  it('should render the fields that are needed on the page', () => {
    render(<FileSharingPage />);

    const dataTable = screen.getByTestId('test-id-file-sharing-page-data-table');

    expect(dataTable, 'When FileSharing page is opened the dataTable should be defined').toBeTruthy();
  });
});
