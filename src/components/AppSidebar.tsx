import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { Checkbox } from "@/components/ui/checkbox.tsx"
import { Label } from "@/components/ui/label.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.tsx";
import { ChevronRight } from "lucide-react";
import type {Dispatch, SetStateAction} from "react";

interface HistoryItem {
    name: string;
    id: string;
    date: string;
}

interface Zone {
    name: string;
    history: HistoryItem[];
}

interface Company {
    name: string;
    zones: Zone[];
}

interface ZonesData {
    companies: Company[];
}

export function AppSidebar({
   zones,
   checkedStates,
   setCheckedStates,
}: {
    zones: ZonesData;
    checkedStates: Record<string, boolean>;
    setCheckedStates: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
    // Helper to toggle a checkbox state
    const handleCheckedChange = (id: string, checked: boolean) => {
        setCheckedStates((prev) => ({ ...prev, [id]: checked }));
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <p>Zones</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {zones.companies.map((company) => {
                            return (
                                <Collapsible
                                    key={company.name}
                                    defaultOpen={true}
                                    className="group/collapsible mb-5"
                                >
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton asChild tooltip={company.name}>
                                            <div className="flex items-center space-x-2">
                                                <span>{company.name}</span>
                                                <ChevronRight
                                                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                                                />
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                        {company.zones.map((zone) => {
                                                const zoneId = `zone-${company.name}-${zone.name}`;
                                                return zone.history.length > 0 ? (
                                                    <SidebarMenuSubItem key={zone.name}>
                                                        <Collapsible
                                                            key={zone.name}
                                                            defaultOpen={false}
                                                            className="group/collapsible-sub"
                                                        >
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuSubButton asChild>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span>{zone.name}</span>
                                                                        <ChevronRight
                                                                            className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-sub:rotate-90"
                                                                        />
                                                                    </div>
                                                                </SidebarMenuSubButton>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <SidebarMenuSub>
                                                                    {zone.history.map((history) => {
                                                                        const historyId = history.id;  // Assuming history.id is unique
                                                                        return (
                                                                            <SidebarMenuSubItem key={history.id}>
                                                                                <SidebarMenuSubButton asChild>
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <Checkbox
                                                                                            id={historyId}
                                                                                            checked={checkedStates[historyId] ?? false}
                                                                                            onCheckedChange={(checked) => handleCheckedChange(historyId, checked as boolean)}
                                                                                        />
                                                                                        <Label htmlFor={historyId}>{history.name}</Label>
                                                                                    </div>
                                                                                </SidebarMenuSubButton>
                                                                            </SidebarMenuSubItem>
                                                                        );
                                                                    })}
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    </SidebarMenuSubItem>
                                                ) : (
                                                    <SidebarMenuSubItem key={zone.name}>
                                                        <SidebarMenuSubButton asChild>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={zoneId}
                                                                    checked={checkedStates[zoneId] ?? false}
                                                                    onCheckedChange={(checked) => handleCheckedChange(zoneId, checked as boolean)}
                                                                />
                                                                <Label htmlFor={zoneId}>{zone.name}</Label>
                                                            </div>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}