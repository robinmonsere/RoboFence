// import { promises as fs } from 'fs';  // For compatibility, but Bun has Bun.file/Bun.write

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

async function main() {
    // Read the geojson file
    const geojson = await Bun.file('src/assets/zones.geojson').json();
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

        companies[company][zone].history.push({
            name: historyName,
            id,
            date: historyDate
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
                        history: history.sort((a, b) => b.date.localeCompare(a.date))  // Optional: sort history by date
                    }))
            }))
    };

    // Write to zones.json
    await Bun.write('src/assets/zones.json', JSON.stringify(output, null, 2));
    console.log("Generated zones.json successfully!");
}

main().catch(console.error);