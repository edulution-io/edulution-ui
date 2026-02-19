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

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@edulution-io/ui-kit';
import { ContactIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import Input from '@/components/shared/Input';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import copyToClipboard from '@/utils/copyToClipboard';
import useLdapGroups from '@/hooks/useLdapGroups';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import usePairingStore from './usePairingStore';
import PairingFloatingButtons from './PairingFloatingButtons';

const PairingPage: React.FC = () => {
  const { t } = useTranslation();
  const { ldapGroups } = useLdapGroups();
  const [codeInput, setCodeInput] = useState('');
  const {
    pairingCode,
    relationships,
    isLoading,
    isSubmitting,
    fetchPairingCode,
    submitPairingCode,
    fetchRelationships,
    reset,
  } = usePairingStore();

  const isStudent = ldapGroups.includes(GroupRoles.STUDENT);

  const title = isStudent ? t('usersettings.pairing.myParents') : t('usersettings.pairing.myChildren');
  const description = t('usersettings.pairing.description');

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

  const getStatusLabel = (status: string) => {
    if (status === PAIRING_STATUS.PENDING) return t('usersettings.pairing.statusPending');
    if (status === PAIRING_STATUS.ACCEPTED) return t('usersettings.pairing.statusAccepted');
    if (status === PAIRING_STATUS.REJECTED) return t('usersettings.pairing.statusRejected');
    return status;
  };

  if (isLoading && !pairingCode) {
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
          id="pairing-code"
          label={t('usersettings.pairing.myCode')}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">{t('usersettings.pairing.myCodeDescription')}</p>
            {pairingCode ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <QRCodeDisplay
                  value={pairingCode}
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
          label={t('usersettings.pairing.enterCode')}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">{t('usersettings.pairing.enterCodeDescription')}</p>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                variant="default"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={t('usersettings.pairing.enterCodePlaceholder')}
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
                {t('usersettings.pairing.submitCode')}
              </Button>
            </div>
          </div>
        </SectionAccordionItem>

        <SectionAccordionItem
          id="relationships"
          label={t('usersettings.pairing.relationships')}
        >
          <div className="space-y-3">
            {relationships.length === 0 ? (
              <p className="text-muted-foreground">{t('usersettings.pairing.noRelationships')}</p>
            ) : (
              <div className="grid gap-2">
                {relationships.map((rel) => (
                  <div
                    key={`${rel.parent}-${rel.student}`}
                    className="flex items-center justify-between rounded-lg bg-accent p-3"
                  >
                    <span>
                      {isStudent
                        ? `${t('usersettings.pairing.parent')}: ${rel.parent}`
                        : `${t('usersettings.pairing.student')}: ${rel.student}`}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">{getStatusLabel(rel.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionAccordionItem>
      </SectionAccordion>

      <PairingFloatingButtons />
    </PageLayout>
  );
};

export default PairingPage;
