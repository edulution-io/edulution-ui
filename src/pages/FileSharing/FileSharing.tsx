import React from "react"
import BasicPageLayout from "@/components/layout/BasicLayout";
import {FiHome, FiLogOut, FiSettings, FiUser} from 'react-icons/fi';
import MenuItem from "../../../datatypes/types";

const FileSharing = () => {


    const demoMenuItems: MenuItem[] = [
        {
            label: 'Home',
            action: () => {
                console.log('Home clicked');
            },
            IconComponent: FiHome
        },
        {
            label: 'Profile',
            action: () => {
                console.log('Profile clicked');
            },
            IconComponent: FiUser
        },
        {
            label: 'Settings',
            action: () => {
                console.log('Settings clicked');
            },
            IconComponent: FiSettings
        },
        {
            label: 'Logout',
            action: () => {
                console.log('Logout clicked');
            },
            IconComponent: FiLogOut
        }
    ];


    return (
        <BasicPageLayout menuItems={demoMenuItems} title="MEINE DATEIEN"
                         logoImagePath="src/assets/icons/filesharing-light.svg">
            <div className="">
                <div className="pt-10 p-4 mr-20 flex-col md:flex-row">
                    <div className="flex justify-between pt-3 pb-3">
                        <div className="flex flex-col ">
                            <div className="flex space-x-2">
                                <p className="text-white mr-2">Current Directory:</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BasicPageLayout>
    )
}

export default FileSharing