import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { NewIcon } from "@repo/ui/icons";
import { Link } from "@tanstack/react-router";

export function NavigationMenu() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link to="/new">
            <SidebarMenuButton>
              <NewIcon className="rounded-md bg-primary text-primary-foreground" />
              <span>New Chat</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
