import React, {useEffect} from 'react';
import useLmnUserStore from '@/store/lmnUserStore';
import {waitForToken} from '@/api/common';
import {useTranslation} from 'react-i18next';
import {Card, CardContent} from '@/components/shared/Card';
import {Button} from '@/components/shared/Button';

const AccountInformation = () => {
    const {user, getUser} = useLmnUserStore((state) => ({
        getUser: state.getUser,
        user: state.user,
    }));

    useEffect(() => {
        if (!user) {
            const getUserInfo = async () => {
                await waitForToken();
                getUser().catch(console.error);
            };

            getUserInfo().catch(console.error);
        }
    }, [user]);
    const {t} = useTranslation();
    const userInfoFields = [
        {label: t('accountPage.name'), value: user ? user.displayName : '...'},
        {label: t('accountPage.email'), value: user ? user?.mail && user?.mail.length > 0 && user.mail.at(0) : '...'},
        {label: t('accountPage.school'), value: user ? user.school : '...'},
        {label: t('accountPage.role'), value: user ? user.sophomorixRole : '...'},
        {label: t('accountPage.school_classes'), value: user ? user.schoolclasses : '...'},
    ];

    return (
        <Card
            variant="collaboration"
            className="min-h-[100%]"
        >
            <CardContent>
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold">{t('accountPage.account_info')}</h4>
                    {userInfoFields.map(({label, value}) => (
                        <div
                            key={label}
                            className="flex flex-col"
                        >
                            <p className="text-nowrap">
                                {label}: {value}
                            </p>
                        </div>
                    ))}

                    <Button
                        variant="btn-collaboration"
                        className="mt-4"
                        size="sm"
                    >
                        {t('accountPage.change_password')}
                    </Button>
                </div>

                <div className="mt-6">
                    <h4 className="font-bold">{t('accountPage.my_information')}</h4>
                    {
                        user?.mail && user?.mail.length > 1 &&
                        <>
                            <p>{t('accountPage.mail_alias')}</p>
                            {user?.mail.slice(1).map((mail) =>
                                <div key={mail}>
                                    <p>{mail}</p>
                                </div>
                            )}
                        </>
                    }
                    <Button
                        variant="btn-collaboration"
                        className="mt-4"
                        size="sm"
                    >
                        {t('accountPage.change_my_data')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountInformation;
