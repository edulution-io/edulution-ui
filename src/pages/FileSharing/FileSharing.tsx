import {MenubarTrigger, VerticalMenubar} from "@/components/ui/menubar.tsx";
import MainLayout from "@/components/layout/MainLayout.tsx";
import {MenubarMenu} from "@radix-ui/react-menubar";
import Icon from "@/components/ui/Icon.tsx";

const FileSharing = () => {
    return (
        <MainLayout>

            <VerticalMenubar>
                <div className="flex justify-center items-center  w-full h-full">
                    <Icon.SideBarImageIcon src="src/assets/icons/House.png" alt="Home"/>
                </div>
                <div className="text-white font-bold">
                    <MenubarMenu>
                        <MenubarTrigger
                            icon={<Icon.ItemImageIcon src={"src/assets/icons/House.png"}/>}>Home</MenubarTrigger>
                        <MenubarTrigger
                            icon={<Icon.ItemImageIcon src={"src/assets/icons/House.png"}/>}>Programs</MenubarTrigger>
                        <MenubarTrigger
                            icon={<Icon.ItemImageIcon src={"src/assets/icons/House.png"}/>}>Share</MenubarTrigger>
                        <MenubarTrigger
                            icon={<Icon.ItemImageIcon src={"src/assets/icons/House.png"}/>}>Students</MenubarTrigger>
                    </MenubarMenu>
                </div>
            </VerticalMenubar>
        </MainLayout>
    )
}

export default FileSharing;