import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuSkeleton,
} from "@repo/ui/components/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Search, SlidersVertical } from "lucide-react";
import { useState } from "react";
import { ChatListItem } from "./chat-list-item";

type ChatSummary = {
  id: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  updatedAt: string;
  createdAt: string;
};

function useChats() {
  return {
    data: [
      {
        id: "1",
        title: "Hey",
        pinned: false,
        archived: false,
        updatedAt: "",
      },
    ] as ChatSummary[],
    isPending: false,
  } as const;
}

export function PinnedChats() {
  const [open, setOpen] = useState(true);
  const { data: chats = [] } = useChats();

  const pinned = sortChats(
    chats.filter((chat) => chat.pinned && !chat.archived),
    DEFAULT_FILTERS.sortBy,
  );

  // Nothing to show until a chat is pinned
  if (pinned.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarGroup>
        <div className="flex items-center justify-between gap-2">
          <SidebarGroupLabel className="w-fit cursor-pointer gap-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <CollapsibleTrigger className="group flex items-center gap-1">
              Pinned
              <ChevronDown className="size-4 -rotate-90 transition-transform duration-200 group-data-panel-open:rotate-0" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
        </div>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {pinned.map((chat) => (
                <ChatListItem key={chat.id} chat={chat} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function Chats() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ChatFilters>(DEFAULT_FILTERS);
  const { data: chats, isPending } = useChats();

  const visibleChats = chats ? filterChats(chats, query, filters) : [];

  const toggleSearch = () => {
    setOpen(true); // make sure the list is visible while searching
    setSearchOpen((prev) => !prev);
    if (searchOpen) setQuery("");
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarGroup>
        <div className="flex items-center justify-between gap-2">
          <SidebarGroupLabel className="w-fit cursor-pointer gap-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <CollapsibleTrigger className="group flex items-center gap-1">
              Chats
              <ChevronDown className="size-4 -rotate-90 transition-transform duration-200 group-data-panel-open:rotate-0" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <div className="flex items-center gap-0.5 group-data-[collapsible=icon]:hidden">
            <HeaderAction
              label="View all"
              onClick={() =>
                router.navigate({
                  to: "/chats",
                })
              }
            >
              <ArrowUpRight />
            </HeaderAction>

            <HeaderAction
              label={searchOpen ? "Close search" : "Search"}
              onClick={toggleSearch}
              className={cn(searchOpen && "bg-sidebar-ring text-sidebar-primary-foreground")}
            >
              <Search />
            </HeaderAction>
            <FilterMenu filters={filters} onChange={setFilters} />
          </div>
        </div>

        <CollapsibleContent>
          {searchOpen && (
            <div className="px-2 pt-1 pb-2">
              <SidebarInput
                autoFocus
                placeholder="Search chats"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") toggleSearch();
                }}
              />
            </div>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => <SidebarMenuSkeleton key={i} />)
              ) : visibleChats.length > 0 ? (
                // TODO: group by `filters.groupBy`
                visibleChats.map((chat) => <ChatListItem key={chat.id} chat={chat} />)
              ) : (
                <p className="px-2 py-1.5 text-sidebar-foreground/70 text-xs group-data-[collapsible=icon]:hidden">
                  {query || chats?.length ? "No matching chats" : "No chats yet"}
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Filters                                  */
/* -------------------------------------------------------------------------- */

type FilterKey = "type" | "status" | "lastActivity" | "groupBy" | "sortBy";
export type ChatFilters = Record<FilterKey, string>;

const FILTER_OPTIONS: Record<FilterKey, { label: string; options: string[] }> = {
  type: { label: "Type", options: ["All", "Chats", "Tasks"] },
  status: { label: "Status", options: ["Active", "Archived", "All"] },
  lastActivity: {
    label: "Last activity",
    options: ["All", "Today", "Past 7 days", "Past 30 days"],
  },
  groupBy: { label: "Group by", options: ["None", "Type", "Status", "Date"] },
  sortBy: { label: "Sort by", options: ["Last activity", "Created", "Title"] },
};

// Each inner array is a section; sections are split by a separator
const FILTER_SECTIONS: FilterKey[][] = [
  ["type", "status", "lastActivity"],
  ["groupBy", "sortBy"],
];

export const DEFAULT_FILTERS: ChatFilters = {
  type: "All",
  status: "Active",
  lastActivity: "All",
  groupBy: "None",
  sortBy: "Last activity",
};

const DAY_MS = 24 * 60 * 60 * 1000;

const LAST_ACTIVITY_MS: Record<string, number> = {
  "Past 7 days": 7 * DAY_MS,
  "Past 30 days": 30 * DAY_MS,
};

function filterChats(chats: ChatSummary[], query: string, filters: ChatFilters): ChatSummary[] {
  const search = query.trim().toLowerCase();
  const startOfToday = new Date().setHours(0, 0, 0, 0);

  const filtered = chats.filter((chat) => {
    // Pinned chats have their own section
    if (chat.pinned) return false;
    // Every chat is a chat until tasks exist
    if (filters.type === "Tasks") return false;
    if (filters.status === "Active" && chat.archived) return false;
    if (filters.status === "Archived" && !chat.archived) return false;

    const updatedAt = Date.parse(chat.updatedAt);
    if (filters.lastActivity === "Today" && updatedAt < startOfToday) {
      return false;
    }
    const maxAge = LAST_ACTIVITY_MS[filters.lastActivity];
    if (maxAge && Date.now() - updatedAt > maxAge) return false;

    return !search || chat.title.toLowerCase().includes(search);
  });

  return sortChats(filtered, filters.sortBy);
}

function sortChats(chats: ChatSummary[], sortBy: string): ChatSummary[] {
  return [...chats].sort((a, b) => {
    if (sortBy === "Title") return a.title.localeCompare(b.title);
    // ISO 8601 strings sort as dates; newest first
    const key = sortBy === "Created" ? "createdAt" : "updatedAt";
    return b[key].localeCompare(a[key]);
  });
}

/* -------------------------------------------------------------------------- */
/*                               Header actions                               */
/* -------------------------------------------------------------------------- */

const actionButtonClass =
  "size-6 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

function HeaderAction({
  label,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className={cn(actionButtonClass, className)}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function FilterMenu({
  filters,
  onChange,
}: {
  filters: ChatFilters;
  onChange: (filters: ChatFilters) => void;
}) {
  const isFiltered = (Object.keys(DEFAULT_FILTERS) as FilterKey[]).some(
    (key) => filters[key] !== DEFAULT_FILTERS[key],
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Filter and sort"
              className={cn(actionButtonClass, "relative")}
            >
              <SlidersVertical />
              {isFiltered && (
                <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Filter and sort</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        className="w-56"
        // Stops the tooltip from popping up again when the menu closes
        // onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {FILTER_SECTIONS.map((section, i) => (
          <div key={i}>
            {i > 0 && <DropdownMenuSeparator />}
            {section.map((key) => (
              <DropdownMenuSub key={key}>
                <DropdownMenuSubTrigger>
                  <span>{FILTER_OPTIONS[key].label}</span>
                  <span className="ml-auto text-muted-foreground text-xs">{filters[key]}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={filters[key]}
                    onValueChange={(value) => onChange({ ...filters, [key]: value })}
                  >
                    {FILTER_OPTIONS[key].options.map((option) => (
                      <DropdownMenuRadioItem key={option} value={option}>
                        {option}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
