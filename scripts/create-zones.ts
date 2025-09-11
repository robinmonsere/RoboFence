// import { promises as fs } from 'fs';  // For compatibility, but Bun has Bun.file/Bun.write

interface HistoryItem {
    name: string;
    id: string;
    date: string;
    status: string;
    type: string;
    area: string;
}

interface Zone {
    name: string;
    lat: number;
    lng: number;
    zoom: number;
    history: HistoryItem[];
}

interface Company {
    name: string;
    zones: Zone[];
}

interface ZonesData {
    companies: Company[];
}

const coords = {
    Tesla: {
        Austin: {
            lat: 30.26345,
            lng: -97.7431,
            zoom: 10
        },
        San_Francisco: {
            lat: 37.60255,
            lng: -122.1321,
            zoom: 9
        }
    },
    Waymo: {
        Atlanta: {
            lat: 33.7490,
            lng: -84.3880,
            zoom: 10
        },
        Phoenix: {
            lat: 33.4484,
            lng: -112.0740,
            zoom: 10
        },
        San_Francisco: {
            lat: 37.73855,
            lng: -122.41720,
            zoom: 9
        },
        Austin: {
            lat: 30.26345,
            lng: -97.74297,
            zoom: 10
        },
        Los_Angeles: {
            lat: 34.0522,
            lng: -118.2437,
            zoom: 10
        },
        Silicon_Valley: {
            lat: 37.3875,
            lng: -122.0575,
            zoom: 10
        }
    },
    Zoox: {
        Las_Vegas: {
            lat: 36.1238,
            lng: -115.1806,
            zoom: 10
        }
    }
}

async function main() {
    console.log("Generating zones.json from zones.geojson...");
    // Read the geojson file
    const geojson = await Bun.file('public/zones.geojson').json()

    if (!geojson || !geojson.features) {
        throw new Error("Invalid GeoJSON data");
    } else {
        console.log(`Found ${geojson.features.length} features in zones.geojson`);
    }

    const features = geojson.features;  // Assuming it's a FeatureCollection

    const companies: Record<string, Record<string, { history: HistoryItem[] }>> = {};

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    for (const feature of features) {
        const name = feature.properties.name;
        const parts = name.split(' - ').map((s: string) => s.trim());
        if (parts.length !== 3) continue;
        const [company, zone, dateStr] = parts;

        if (!companies[company]) companies[company] = {};
        if (!companies[company][zone]) companies[company][zone] = { history: [] };

        const dateParts = dateStr.split('/');
        if (dateParts.length !== 3) continue;
        const [day, month, year] = dateParts.map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) continue;

        const monthName = monthNames[month - 1];
        if (!monthName) continue;  // Invalid month

        const historyName = `${zone} ${monthName} ${day}, ${year}`;
        const historyDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const id = feature.id;

        let status = '';
        let type = '';
        let area = '';

        if (feature.properties.description) {
            let description = feature.properties.description;
            description = description.replace(/<br\s*\/?>|<\/?br>/gi, '\n');
            description = description.replace(/<[^>]+>/g, '').trim();
            const lines = description.split('\n').map((line: string) => line.trim()).filter((line: string) => line);

            const data: Record<string, string> = {};
            for (const line of lines) {
                if (line.includes(':')) {
                    const [key, value] = line.split(':').map((s: string) => s.trim());
                    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
                    data[normalizedKey] = value;
                }
            }

            status = data['status'] || '';
            type = data['type'] || '';
            area = data['area'] || '';
        }

        companies[company][zone].history.push({
            name: historyName,
            id,
            date: historyDate,
            status,
            type,
            area
        });
    }

    // Convert to the desired output format
    const output: ZonesData = {
        companies: Object.entries(companies)
            .sort(([a], [b]) => a.localeCompare(b))  // Optional: sort companies alphabetically
            .map(([name, zonesObj]) => ({
                name,
                zones: Object.entries(zonesObj)
                    .sort(([a], [b]) => a.localeCompare(b))  // Optional: sort zones alphabetically
                    .map(([zname, { history }]) => ({
                        name: zname,
                        lat: coords[name]?.[zname.replace(/ /g, '_')]?.lat || 0,
                        lng: coords[name]?.[zname.replace(/ /g, '_')]?.lng || 0,
                        zoom: coords[name]?.[zname.replace(/ /g, '_')]?.zoom || 8,
                        history: history.sort((a, b) => b.date.localeCompare(a.date))  // Optional: sort history by date
                    }))
            }))
    };

    // Write to zones.json
    await Bun.write('src/assets/zones.json', JSON.stringify(output, null, 2));
    console.log("Generated zones.json successfully!");
}

main().catch(console.error);