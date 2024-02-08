import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

const MenuBar_sh = () => {
    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>New Window</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Share</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Print</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default MenuBar_sh