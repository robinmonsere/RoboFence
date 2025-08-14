import './App.css';
import MapComponent from './components/Map.tsx';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { AppSidebar } from '@/components/AppSidebar.tsx';
import zonesData from './assets/zones.json';  // Direct import of JSON as object
import { useState } from 'react';

function App() {
    // Lifted state for checkbox checked statuses
    const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({});

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