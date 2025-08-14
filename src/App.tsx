import './App.css';
import MapComponent from './components/Map.tsx';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { AppSidebar } from '@/components/AppSidebar.tsx';
import zonesData from './assets/zones.json';  // Direct import of JSON as object
import { useState } from 'react';

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

    return (
        <SidebarProvider>
            <AppSidebar
                zones={zonesData}
                checkedStates={checkedStates}
                setCheckedStates={setCheckedStates}
            />
            <main className="relative h-screen w-screen">
                <div className="absolute top-4 left-4 z-30">
                    <SidebarTrigger id="sidebarTrigger" />
                </div>
                <div className="map absolute inset-0 z-10">
                    <MapComponent checkedStates={checkedStates} />  {/* Pass checkedStates to MapComponent */}
                </div>
            </main>
        </SidebarProvider>
    );
}

export default App;