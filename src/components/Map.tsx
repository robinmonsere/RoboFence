import Map, {Source, Layer, AttributionControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useEffect, useMemo, useState, forwardRef, useImperativeHandle, useRef} from "react";
import type {GeoJson, GeoJsonFeature, MapComponentProps} from "@/types.ts";
import {Slider} from "@/components/ui/slider.tsx";

function parseDate(str: string): Date | null {
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
}

const MapComponent = forwardRef(({checkedStates = {}, sliderEnabled = false}: MapComponentProps & { sliderEnabled?: boolean }, ref) => {
    const [geojson, setGeojson] = useState<GeoJson | null>(null);
    const [popupInfo, setPopupInfo] = useState<{ lngLat: {lng: number, lat: number}, feature: GeoJsonFeature } | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [sliderValue, setSliderValue] = useState<number>(100);

    const companyColors: Record<string, string> = {
        'Tesla': '#E31937',
        'Waymo': '#01eba7',
    };

    const startDate = new Date(2023, 0, 7);
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const selectedTime = startDate.getTime() + (sliderValue / 100) * (endDate.getTime() - startDate.getTime());
    const selectedDate = new Date(selectedTime);
    selectedDate.setHours(0, 0, 0, 0);

    const formattedDate = `${selectedDate.toLocaleDateString('en-US', { month: 'short' })} ${selectedDate.getDate()} ${selectedDate.getFullYear()}`;

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

    // Compute grouped and filtered features based on checkedStates or slider
    const grouped = useMemo(() => {
        if (!geojson || !geojson.features) return {};

        if (!sliderEnabled) {
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
        } else {
            // Slider enabled: group by company and zone, select active history based on date
            const zonesByCompany: Record<string, Record<string, GeoJsonFeature[]>> = {};

            geojson.features.forEach((feature: GeoJsonFeature) => {
                const name = feature.properties?.name;
                if (!name) return;

                const parts = name.split(' - ').map((s: string) => s.trim());
                if (parts.length !== 3) return;

                const [company, zone] = parts;

                if (!zonesByCompany[company]) zonesByCompany[company] = {};
                if (!zonesByCompany[company][zone]) zonesByCompany[company][zone] = [];
                zonesByCompany[company][zone].push(feature);
            });

            const acc: Record<string, { features: GeoJsonFeature[]; color: string }> = {};

            Object.entries(zonesByCompany).forEach(([company, zones]) => {
                const color = companyColors[company] || '#000000';
                acc[company] = { features: [], color };

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.entries(zones).forEach(([_, histories]) => {
                    const datedHistories = histories
                        .map((f) => {
                            const parts = f.properties.name.split(' - ').map((s) => s.trim());
                            const dateStr = parts[2];
                            const startDateParsed = parseDate(dateStr);
                            return { f, startDate: startDateParsed };
                        })
                        .filter((dh): dh is { f: GeoJsonFeature; startDate: Date } => dh.startDate !== null)
                        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

                    if (datedHistories.length === 0) return;

                    for (let i = 0; i < datedHistories.length; i++) {
                        const isActive =
                            i < datedHistories.length - 1
                                ? selectedDate >= datedHistories[i].startDate && selectedDate < datedHistories[i + 1].startDate
                                : selectedDate >= datedHistories[i].startDate;

                        if (isActive) {
                            acc[company].features.push(datedHistories[i].f);
                            break;
                        }
                    }
                });
            });
            return acc;
        }

    }, [geojson, checkedStates, companyColors, sliderEnabled, sliderValue]);

    const interactiveLayerIds = useMemo(() => Object.keys(grouped).map(company => `${company.toLowerCase()}-layer`), [grouped]);

    const handleMapClick = (e: any) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            setPopupInfo({ 
                lngLat: e.lngLat,
                feature 
            });
            setSelectedName(feature.properties.name);
        } else {
            setPopupInfo(null);
            setSelectedName(null);
        }
    };

    return (
        <div className="w-full h-screen relative">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: -97.73,
                    latitude: 30.266,
                    zoom: 8
                }}
                onClick={handleMapClick}
                style={{width: '100%', height: '100%'}}
                attributionControl={false}
                interactiveLayerIds={interactiveLayerIds}
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
                            <Layer
                                id={`${company.toLowerCase()}-outline-layer`}
                                type="line"
                                paint={{
                                    'line-color': color,
                                    'line-width': 2,
                                    'line-opacity': 0.8,
                                }}
                            />
                            <Layer
                                id={`${company.toLowerCase()}-highlight`}
                                type="line"
                                paint={{
                                    'line-color': color,
                                    'line-width': 3,
                                    'line-opacity': 1,
                                }}
                                filter={['==', ['get', 'name'], selectedName || '']}
                            />
                        </Source>
                    );
                })}
                {popupInfo && (
                    <Popup
                        longitude={popupInfo.lngLat.lng}
                        latitude={popupInfo.lngLat.lat}
                        closeOnClick={false}
                        onClose={() => {
                            setPopupInfo(null);
                        }}
                    >
                        {(() => {
                            const description = popupInfo.feature.properties.description || '';
                            return (
                                <div dangerouslySetInnerHTML={{__html: description}}/>
                            )
                        })()}
                    </Popup>
                )}
                <AttributionControl style={{
                    backgroundColor: '#FFFFFF',
                    color: 'rgba(0, 0, 0, .75)',
                    padding: '2px 28px 2px 8px',
                    borderRadius: '25px',
                    margin: '10px',
                }} customAttribution='<span style="font-weight: bold;">Created and maintained by <a href="https://x.com/xdnibor" target="_blank">@xdnibor</a></span>'  />
            </Map>
            {sliderEnabled && (
                <div className="bg-(--card)/50 px-5 pb-5 pt-3 rounded-2xl absolute bottom-15 md:w-100 w-4/5 right-1/2 translate-x-1/2">
                    <div className="text-center">
                        <p>Showing zones for date:</p>
                        <div className="flex flex-row justify-between items-end pb-2 ">
                            <p>Jul 2023</p>
                            <div className="text-center">
                                <p>{formattedDate}</p>
                            </div>
                            <p>Today</p>
                        </div>
                    </div>
                    <Slider
                        className={""}
                        value={[sliderValue]}
                        onValueChange={(value) => setSliderValue(value[0])}
                        max={100}
                        step={1}
                    />
                </div>
            )}


        </div>
    );
});

export default MapComponent;