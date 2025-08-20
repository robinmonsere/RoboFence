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

export interface MapComponentProps {
    checkedStates?: Record<string, boolean>
}

interface GeoJsonProperties {
    name: string;
    styleUrl?: string;
    styleMapHash?: {
        normal: string;
        highlight: string;
    };
    description?: string;
    visibility?: string;
}

interface GeoJsonGeometry {
    type: 'Polygon';
    coordinates: number[][][];
}

export interface GeoJsonFeature {
    type: 'Feature';
    geometry: GeoJsonGeometry;
    properties: GeoJsonProperties;
    id: string;
}

export interface GeoJson {
    type: 'FeatureCollection';
    features: GeoJsonFeature[];
}