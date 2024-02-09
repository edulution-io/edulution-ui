import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {useNavigate} from "react-router-dom";

const HorizontalMenuBar_sh = () => {
    const navigate = useNavigate()
    const handelNavigationToFileSharing = () => {
        navigate("/fileSharing")
    }

    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger onClick={handelNavigationToFileSharing}>File Sharing</MenubarTrigger>
                <MenubarTrigger onClick={() => console.log("Hallo Welt")}>Time Table</MenubarTrigger>
                <MenubarTrigger onClick={() => console.log("Hallo Welt")}>Chat</MenubarTrigger>
            </MenubarMenu>
        </Menubar>
    )
}

export default HorizontalMenuBar_sh;