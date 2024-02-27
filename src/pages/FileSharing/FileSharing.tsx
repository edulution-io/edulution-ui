import React from "react"
import {FiHome, FiLogOut, FiSettings, FiUser} from 'react-icons/fi';
import MenuBar from "@/components/shared/MenuBar";
import MenuItem from "../../../datatypes/types";

const FileSharing = () => {

    const demoMenuItems: MenuItem[] = [
        {
            label: 'Home',
            action: () => {
            },
            IconComponent: FiHome
        },
        {
            label: 'Profile',
            action: () => {
            },
            IconComponent: FiUser
        },
        {
            label: 'Settings',
            action: () => {
            },
            IconComponent: FiSettings
        },
        {
            label: 'Logout',
            action: () => {
            },
            IconComponent: FiLogOut
        }
    ];

    return (
        <MenuBar menuItems={demoMenuItems} title="MEINE DATEIEN"
                 logoImagePath="src/assets/icons/filesharing-light.svg"/>
    )
}

export default FileSharing