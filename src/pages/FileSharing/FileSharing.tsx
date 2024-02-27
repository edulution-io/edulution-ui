import {BasicPageLayout} from "@/components/layout/BasicLayout.tsx";
import {MenuItem} from "../../../datatypes/types.ts";
import { FiHome, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
export const FileSharing = () => {


    const demoMenuItems: MenuItem[] = [
    {
        label: 'Home',
        action: () => { console.log('Home clicked'); },
        IconComponent: FiHome
    },
    {
        label: 'Profile',
        action: () => { console.log('Profile clicked'); },
        IconComponent: FiUser
    },
    {
        label: 'Settings',
        action: () => { console.log('Settings clicked'); },
        IconComponent: FiSettings
    },
    {
        label: 'Logout',
        action: () => { console.log('Logout clicked'); },
        IconComponent: FiLogOut
    }
];


    return (
        <BasicPageLayout menuItems={demoMenuItems} title={"DEMO"} logoImagePath={"/"}>
            <p>This is just a Demo</p>
        </BasicPageLayout>
    )

}