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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@edulution-io/ui-kit';
import { ContactIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import copyToClipboard from '@/utils/copyToClipboard';
import useLdapGroups from '@/hooks/useLdapGroups';
import useUserStore from '@/store/UserStore/useUserStore';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import getIsParent from '@libs/user/utils/getIsParent';
import PARENT_CHILD_PAIRING_QR_CONFIG from '@libs/parent-child-pairing/constants/parentChildPairingQrConfig';
import type ParentChildPairingQrPayload from '@libs/parent-child-pairing/types/parentChildPairingQrPayload';
import ParentChildPairingStatusBadge from '@/components/shared/ParentChildPairingStatusBadge';
import useParentChildPairingStore from './useParentChildPairingStore';
import ParentChildPairingFloatingButtons from './ParentChildPairingFloatingButtons';

const ParentChildPairingPage: React.FC = () => {
  const { t } = useTranslation();
  const { ldapGroups } = useLdapGroups();
  const user = useUserStore((s) => s.user);
  const [codeInput, setCodeInput] = useState('');
  const {
    pairingCodeResponse,
    relationships,
    isLoading,
    isSubmitting,
    fetchPairingCode,
    submitPairingCode,
    fetchRelationships,
    reset,
  } = useParentChildPairingStore();

  const isStudent = ldapGroups.includes(GroupRoles.STUDENT);
  const isParent = getIsParent(ldapGroups);

  const title = isStudent
    ? t('usersettings.parentChildPairing.myParents')
    : t('usersettings.parentChildPairing.myChildren');
  const description = isStudent
    ? t('usersettings.parentChildPairing.descriptionStudent')
    : t('usersettings.parentChildPairing.descriptionParent');

  const pairingCode: string = pairingCodeResponse?.code ?? '';

  const qrValue = useMemo(() => {
    if (!pairingCodeResponse) return null;

    const role = isStudent ? GroupRoles.STUDENT : GroupRoles.PARENT;

    const payload: ParentChildPairingQrPayload = {
      type: PARENT_CHILD_PAIRING_QR_CONFIG.TYPE,
      version: PARENT_CHILD_PAIRING_QR_CONFIG.VERSION,
      code: pairingCodeResponse.code,
      username: user?.username ?? '',
      role,
      expiresAt: pairingCodeResponse.expiresAt,
    };

    return JSON.stringify(payload);
  }, [pairingCodeResponse, isStudent, isParent, user]);

  useEffect(() => {
    void fetchPairingCode();
    void fetchRelationships();
    return () => reset();
  }, [fetchPairingCode, fetchRelationships, reset]);

  const handleSubmit = useCallback(async () => {
    if (!codeInput.trim()) return;
    const success = await submitPairingCode(codeInput.trim());
    if (success) {
      setCodeInput('');
      void fetchRelationships();
    }
  }, [codeInput, submitPairingCode, fetchRelationships]);

  if (isLoading && !pairingCodeResponse) {
    return (
      <PageLayout
        nativeAppHeader={{
          title,
          description,
          iconSrc: ContactIcon,
        }}
      >
        <div className="flex items-center justify-center py-12">
          <CircleLoader />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      nativeAppHeader={{
        title,
        description,
        iconSrc: ContactIcon,
      }}
    >
      <SectionAccordion defaultOpenAll>
        <SectionAccordionItem
          id="parent-child-pairing-code"
          label={t('usersettings.parentChildPairing.myCode')}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                isStudent
                  ? 'usersettings.parentChildPairing.myCodeDescriptionStudent'
                  : 'usersettings.parentChildPairing.myCodeDescriptionParent',
              )}
            </p>
            {pairingCode && qrValue ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <QRCodeDisplay
                  value={qrValue}
                  size="lg"
                  className="m-4"
                />
                <InputWithActionIcons
                  type="text"
                  variant="default"
                  value={pairingCode}
                  readOnly
                  className="max-w-[400px]"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    copyToClipboard(pairingCode);
                  }}
                  actionIcons={[
                    {
                      icon: faCopy,
                      onClick: () => copyToClipboard(pairingCode),
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <CircleLoader />
              </div>
            )}
          </div>
        </SectionAccordionItem>

        <SectionAccordionItem
          id="enter-code"
          label={t('usersettings.parentChildPairing.enterCode')}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t(
                isStudent
                  ? 'usersettings.parentChildPairing.enterCodeDescriptionStudent'
                  : 'usersettings.parentChildPairing.enterCodeDescriptionParent',
              )}
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                variant="default"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={t('usersettings.parentChildPairing.enterCodePlaceholder')}
                className="max-w-[400px]"
              />
              <Button
                type="button"
                variant="btn-infrastructure"
                size="lg"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={isSubmitting || !codeInput.trim()}
              >
                {t('usersettings.parentChildPairing.submitCode')}
              </Button>
            </div>
          </div>
        </SectionAccordionItem>

        <SectionAccordionItem
          id="relationships"
          label={t('usersettings.parentChildPairing.relationships')}
        >
          <div className="space-y-3">
            {relationships.length === 0 ? (
              <p className="text-muted-foreground">{t('usersettings.parentChildPairing.noRelationships')}</p>
            ) : (
              <div className="grid gap-2">
                {relationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between rounded-lg bg-accent p-3"
                  >
                    <span>
                      {isStudent
                        ? `${t('usersettings.parentChildPairing.parent')}: ${rel.parentFirstName && rel.parentLastName ? `${rel.parentFirstName} ${rel.parentLastName}` : rel.parent}`
                        : `${t('usersettings.parentChildPairing.student')}: ${rel.studentFirstName && rel.studentLastName ? `${rel.studentFirstName} ${rel.studentLastName}` : rel.student}`}
                    </span>
                    <ParentChildPairingStatusBadge status={rel.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionAccordionItem>
      </SectionAccordion>

      <ParentChildPairingFloatingButtons />
    </PageLayout>
  );
};

export default ParentChildPairingPage;
