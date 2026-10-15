import { SidebarContent, SidebarHeader, Sidebar as UISidebar } from "@repo/ui/components/sidebar";
import { Chats, PinnedChats } from "./chats";
import { Footer } from "./footer";
import { NavigationMenu } from "./navigation-menu";

export function Sidebar() {
  return (
    <UISidebar>
      <SidebarHeader>
        <h1>Cowork</h1>
      </SidebarHeader>

      <SidebarContent>
        <NavigationMenu />
        <PinnedChats />
        <Chats />
      </SidebarContent>

      <Footer />
    </UISidebar>
  );
}
