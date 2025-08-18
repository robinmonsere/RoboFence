// Using Maplibre
import Map, {Source, Layer, AttributionControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useEffect, useMemo, useState, forwardRef, useImperativeHandle, useRef} from "react";
import type {GeoJson, GeoJsonFeature, MapComponentProps} from "@/types.ts";



const MapComponent = forwardRef(({checkedStates = {}}: MapComponentProps, ref) => {
    const [geojson, setGeojson] = useState<GeoJson | null>(null);

    const companyColors: Record<string, string> = {
        'Tesla': '#E31937',
        'Waymo': '#01eba7',
        // Add more companies as needed
    };

    // Expose flyTo method via ref
    const mapRef = useRef<any>(null);
    useImperativeHandle(ref, () => ({
        flyTo: (lat: number, lng: number, zoom: number) => {
            if (mapRef.current) {
                mapRef.current.flyTo({ center: [lng, lat], zoom });
            }
        }
    }));

    // Fetch GeoJSON file on mount
    useEffect(() => {
        fetch('/zones.geojson')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setGeojson(data);
            })
            .catch((error) => console.error('Zones fetch error:', error));
    }, []);

    // Compute grouped and filtered features based on checkedStates
    const grouped = useMemo(() => {
        if (!geojson || !geojson.features) return {};

        const acc: Record<string, { features: GeoJsonFeature[]; color: string }> = {};

        geojson.features.forEach((feature: GeoJsonFeature) => {
            const name = feature.properties?.name;
            if (!name) return;

            const parts = name.split(' - ').map((s: string) => s.trim());
            if (parts.length !== 3) return;

            const [company, zone] = parts;
            const historyId = feature.id;
            const companyId = `company-${company}`;
            const zoneId = `zone-${company}-${zone}`;

            const historyChecked = checkedStates[historyId];
            const zoneChecked = checkedStates[zoneId];
            const companyChecked = checkedStates[companyId];

            let isChecked: boolean;
            if (historyChecked !== undefined) {
                isChecked = historyChecked;
            } else if (zoneChecked !== undefined) {
                isChecked = zoneChecked;
            } else {
                isChecked = companyChecked ?? false;
            }

            if (!isChecked) return;

            if (!acc[company]) {
                acc[company] = { features: [], color: companyColors[company] || '#000000' };
            }
            acc[company].features.push(feature);
        });

        return acc;
    }, [geojson, checkedStates, companyColors]);

    return (
        <div className="w-full h-screen">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: -97.73,
                    latitude: 30.266,
                    zoom: 8
                }}
                style={{width: '100%', height: '100%'}}
                attributionControl={false}
                mapStyle={`https://api.maptiler.com/maps/01988899-dc29-76ac-83bf-41c0d1bbffc2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
            >
                {Object.entries(grouped).map(([company, { features, color }]) => {
                    if (features.length === 0) return null;

                    const data = { type: 'FeatureCollection' as const, features };

                    return (
                        <Source key={company} id={`${company.toLowerCase()}-source`} type="geojson" data={data}>
                            <Layer
                                id={`${company.toLowerCase()}-layer`}
                                type="fill"
                                paint={{
                                    'fill-color': color,
                                    'fill-opacity': 0.5,
                                }}
                            />
                        </Source>
                    );
                })}
                <AttributionControl style={{
                    backgroundColor: '#FFFFFF',
                    color: 'rgba(0, 0, 0, .75)',
                    padding: '2px 28px 2px 8px',
                    borderRadius: '25px',
                    margin: '10px',
                }} customAttribution='<span style="font-weight: bold;">Created and maintained by <a href="https://x.com/xdnibor" target="_blank">@xdnibor</a></span>'  />
            </Map>
        </div>
    );
});

export default MapComponent;