import { SidebarContent, Sidebar as UISidebar } from "@repo/ui/components/sidebar";
import { Chats, PinnedChats } from "./chats";
import { Footer } from "./footer";
import { Header } from "./header";
import { NavigationMenu } from "./navigation-menu";

export function Sidebar() {
  return (
    <UISidebar>
      <Header />

      <SidebarContent>
        <NavigationMenu />
        <PinnedChats />
        <Chats />
      </SidebarContent>

      <Footer />
    </UISidebar>
  );
}
