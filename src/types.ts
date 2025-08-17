export interface HistoryItem {
    name: string;
    id: string;
    date: string;
}

export interface Zone {
    name: string;
    history: HistoryItem[];
    lat: number;
    lng: number;
    zoom: number;
}

export interface Company {
    name: string;
    zones: Zone[];
}

export interface ZonesData {
    companies: Company[];
}