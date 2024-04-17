/**
 * @jest-environment jsdom
 */
import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FileSharingPage from './FileSharing';

vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(),
}));

describe('FileSharing', () => {
  it('should render the fields that are needed on the page', () => {
    const { getAllByTestId } = render(<FileSharingPage />);

    const dataTable = getAllByTestId('test-id-file-sharing-page-data-table')[0];

    expect(dataTable).toBeDefined();
    expect(dataTable).to.not.equal(null);
  });
});
