const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export interface InspirationImage {
    id: string;
    url: string;
    authorName: string;
    authorLink: string;
    downloadLocation: string; // Used to track "downloads" as per API guidelines
    queryLabel: string; // The search term that generated it
}

export const unsplashService = {
    getInspiration: async (query: string, label: string, count: number = 3): Promise<InspirationImage[]> => {
        if (!UNSPLASH_API_KEY) {
            console.warn('No Unsplash API Key found in .env');
            return [];
        }

        try {
            // Append fashion context to the query to ensure we get clothing/outfits
            const searchQuery = `woman fashion ${query}`;

            const response = await fetch(
                `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&count=${count}&orientation=portrait`,
                {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_API_KEY}`
                    }
                }
            );

            if (!response.ok) {
                console.error('Unsplash request failed:', response.statusText);
                return [];
            }

            const data = await response.json();

            // Handle both array and single object return from random endpoint
            const items = Array.isArray(data) ? data : [data];

            return items.map((item: any) => ({
                id: item.id,
                url: item.urls.regular,
                authorName: item.user.name,
                authorLink: item.user.links.html,
                downloadLocation: item.links.download_location,
                queryLabel: label
            }));
        } catch (e) {
            console.error('Error fetching from Unsplash', e);
            return [];
        }
    },

    trackDownload: async (downloadLocationUrl: string) => {
        if (!UNSPLASH_API_KEY) return;
        try {
            // Unsplash requires to hit the download_location endpoint when a user performs an action similar to downloading
            await fetch(downloadLocationUrl, {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_API_KEY}`
                }
            });
        } catch (e) {
            console.error('Error tracking Unsplash download', e);
        }
    }
};
