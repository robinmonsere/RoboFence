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
import { ChevronRight, Locate } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import type { ZonesData } from '@/types.ts';
import {Switch} from "@/components/ui/switch.tsx";

export function AppSidebar({
   zones,
   checkedStates,
   setCheckedStates,
   onZoneLocate,
   sliderEnabled,
   setSliderEnabled,
}: {
    zones: ZonesData;
    checkedStates: Record<string, boolean>;
    setCheckedStates: Dispatch<SetStateAction<Record<string, boolean>>>;
    onZoneLocate: (lat: number, lng: number, zoom: number) => void;
    sliderEnabled: boolean;
    setSliderEnabled: Dispatch<SetStateAction<boolean>>;
}) {
    // Helper to toggle a checkbox state
    const handleCheckedChange = (id: string, checked: boolean) => {
        setCheckedStates((prev) => ({ ...prev, [id]: checked }));
    };

    return (
        <Sidebar>
            <SidebarHeader>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="pl-5 pt-10">
                    <Collapsible
                        open={!sliderEnabled}
                        onOpenChange={(open) => setSliderEnabled(!open)}
                    >
                        <CollapsibleTrigger asChild>
                            <div className="flex flex-row align-center">
                                <Label
                                    className="pr-5"
                                    htmlFor={"enable_slider"}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Enable date slider
                                </Label>
                                <div className="flex align-center" onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                        id={"enable_slider"}
                                        checked={sliderEnabled}
                                        onCheckedChange={(checked) => setSliderEnabled(checked)}
                                    />
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
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
                                                                            <div
                                                                                className="group/locator flex items-center space-x-2">
                                                                                <div className="flex items-center">
                                                                                    <span
                                                                                        className="test">{zone.name}</span>
                                                                                    <Locate
                                                                                        className="ml-3 cursor-pointer size-4 hidden group-hover/locator:block"
                                                                                        onClick={(e) => {
                                                                                            onZoneLocate(zone.lat, zone.lng, zone.zoom);
                                                                                            e.preventDefault();
                                                                                        }}
                                                                                    />
                                                                                </div>
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
                                                                                            <div
                                                                                                className="flex items-center space-x-2">
                                                                                                <Checkbox
                                                                                                    id={historyId}
                                                                                                    checked={checkedStates[historyId] ?? false}
                                                                                                    onCheckedChange={(checked) => handleCheckedChange(historyId, checked as boolean)}
                                                                                                />
                                                                                                <Label
                                                                                                    htmlFor={historyId}>{history.name}</Label>
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
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarGroup>
                <SidebarGroup className="mt-auto">
                    <div className="mx-5 flex flex-row items-end justify-between">
                        <a className="text-3xl" target="_blank" href="https://x.com/xdnibor">𝕏</a>
                        <p className="underline">About</p>
                    </div>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}