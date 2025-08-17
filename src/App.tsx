import './App.css';
import MapComponent from './components/Map.tsx';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { AppSidebar } from '@/components/AppSidebar.tsx';
import zonesData from './assets/zones.json';  // Direct import of JSON as object
import { useState, useRef } from 'react';
import type { ZonesData } from '@/types.ts';

function App() {
    // Lifted state for checkbox checked statuses
    const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        (zonesData as ZonesData).companies.forEach((company) => {
            company.zones.forEach((zone) => {
                if (zone.history.length > 0) {
                    const firstHistoryId = zone.history[0].id;
                    initial[firstHistoryId] = true;
                }
            });
        });
        return initial;
    });

    const mapRef = useRef<{ flyTo: (lat: number, lng: number, zoom: number) => void }>(null);

    const handleZoneLocate = (lat: number, lng: number, zoom: number) => {
        if (mapRef.current) {
            mapRef.current.flyTo(lat, lng, zoom);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar
                zones={zonesData as ZonesData}
                checkedStates={checkedStates}
                setCheckedStates={setCheckedStates}
                onZoneLocate={handleZoneLocate}
            />
            <main className="relative h-screen w-screen">
                <div className="absolute top-4 left-4 z-30">
                    <SidebarTrigger id="sidebarTrigger" />
                </div>
                <div className="map absolute inset-0 z-10">
                    <MapComponent ref={mapRef} checkedStates={checkedStates} />  {/* Pass checkedStates to MapComponent */}
                </div>
            </main>
        </SidebarProvider>
    );
}

export default App;