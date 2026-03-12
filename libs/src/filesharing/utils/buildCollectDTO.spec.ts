/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import buildCollectDTO from './buildCollectDTO';
import buildCollectPath from '@libs/filesharing/utils/buildCollectPath';

vi.mock('@libs/filesharing/utils/buildCollectPath', () => ({
  default: vi.fn(),
}));

const mockedBuildCollectPath = vi.mocked(buildCollectPath);

describe('buildCollectDTO', () => {
  const mockStudent = {
    cn: 'student1',
    dn: 'cn=student1,ou=users',
    displayName: 'Student One',
    givenName: 'Student',
    mail: 'student1@test.com',
    memberOf: [],
    school: 'testschool',
    sn: 'One',
    sophomorixAdminClass: '10a',
    sophomorixRole: 'student',
    homeDirectory: '/home/students/student1',
  };

  const mockCurrentUser = {
    cn: 'teacher1',
    dn: 'cn=teacher1,ou=users',
    displayName: 'Teacher One',
    givenName: 'Teacher',
    mail: 'teacher1@test.com',
    memberOf: [],
    school: 'testschool',
    sn: 'One',
    sophomorixAdminClass: 'teachers',
    sophomorixRole: 'teacher',
    homeDirectory: '/home/teachers/teacher1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedBuildCollectPath.mockReturnValue({
      destinationPath: '/dest/path',
      originPath: '/origin/path',
      userName: 'student1',
      newFolderName: 'collected_10a',
    });
  });

  it('returns undefined when students is null', () => {
    expect(buildCollectDTO(null, mockCurrentUser, '10a', '/home/teacher1')).toBeUndefined();
  });

  it('returns undefined when currentUser is null', () => {
    expect(buildCollectDTO([mockStudent], null, '10a', '/home/teacher1')).toBeUndefined();
  });

  it('returns array of CollectFileRequestDTO when valid inputs provided', () => {
    const result = buildCollectDTO([mockStudent], mockCurrentUser, '10a', '/home/teacher1');

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      destinationPath: '/dest/path',
      originPath: '/origin/path',
      userName: 'student1',
      newFolderName: 'collected_10a',
    });
  });

  it('maps each student through buildCollectPath', () => {
    const students = [mockStudent, { ...mockStudent, cn: 'student2' }];
    buildCollectDTO(students, mockCurrentUser, '10a', '/home/teacher1');

    expect(mockedBuildCollectPath).toHaveBeenCalledTimes(2);
    expect(mockedBuildCollectPath).toHaveBeenCalledWith('teacher1', '/home/teacher1', '10a', students[0]);
    expect(mockedBuildCollectPath).toHaveBeenCalledWith('teacher1', '/home/teacher1', '10a', students[1]);
  });

  it('returns empty array when students array is empty', () => {
    const result = buildCollectDTO([], mockCurrentUser, '10a', '/home/teacher1');

    expect(result).toEqual([]);
    expect(mockedBuildCollectPath).not.toHaveBeenCalled();
  });
});
