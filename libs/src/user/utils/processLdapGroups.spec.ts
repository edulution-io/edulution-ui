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

import processLdapGroups from './processLdapGroups';

describe('processLdapGroups', () => {
  it('extracts school name from SCHOOLS path', () => {
    const result = processLdapGroups(['/SCHOOLS/s_testschool/']);
    expect(result.schools).toEqual(['testschool']);
  });

  it('extracts class from students path', () => {
    const result = processLdapGroups(['/SCHOOLS/s_testschool/students_class/10a']);
    expect(result.classes).toEqual(['10a']);
    expect(result.classPaths).toEqual(['/SCHOOLS/s_testschool/students_class/10a']);
  });

  it('extracts project name from PROJECTS path', () => {
    const result = processLdapGroups(['/p_myproject']);
    expect(result.projects).toEqual(['myproject']);
    expect(result.projectPaths).toEqual(['/p_myproject']);
  });

  it('extracts role from role path', () => {
    const result = processLdapGroups(['/role-teacher']);
    expect(result.roles).toEqual(['teacher']);
  });

  it('puts unmatched groups in others', () => {
    const result = processLdapGroups(['/some-random-group']);
    expect(result.others).toEqual(['/some-random-group']);
  });

  it('deduplicates schools', () => {
    const result = processLdapGroups(['/SCHOOLS/s_school1/', '/SCHOOLS/s_school1/students_class/10a']);
    expect(result.schools).toEqual(['school1']);
  });

  it('deduplicates roles', () => {
    const result = processLdapGroups(['/role-teacher', '/role-teacher']);
    expect(result.roles).toEqual(['teacher']);
  });

  it('returns empty arrays for empty input', () => {
    const result = processLdapGroups([]);
    expect(result.schools).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.projectPaths).toEqual([]);
    expect(result.classes).toEqual([]);
    expect(result.classPaths).toEqual([]);
    expect(result.roles).toEqual([]);
    expect(result.others).toEqual([]);
  });

  it('correctly categorizes a mix of all group types', () => {
    const groups = [
      '/SCHOOLS/s_myschool/',
      '/SCHOOLS/s_myschool/students_class/10a',
      '/p_project1',
      '/role-teacher',
      '/unknown-group',
    ];
    const result = processLdapGroups(groups);

    expect(result.schools).toEqual(['myschool']);
    expect(result.classes).toEqual(['10a']);
    expect(result.projects).toEqual(['project1']);
    expect(result.roles).toEqual(['teacher']);
    expect(result.others).toEqual(['/unknown-group']);
  });

  it('constructs projectPaths correctly from project names', () => {
    const result = processLdapGroups(['/p_alpha', '/p_beta']);
    expect(result.projectPaths).toEqual(['/p_alpha', '/p_beta']);
  });
});
