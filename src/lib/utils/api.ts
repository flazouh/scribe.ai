
const URLS = {
    DEV: "http://localhost:3000",
    PROD: "https://api.scribeai.com"
}

export function getAPIEndpoint(endpoint: string): string {
    const env = import.meta.env;
    switch (env.MODE) {
        case 'development': return `${URLS.DEV}/${endpoint}`;
        case 'production': return `${URLS.PROD}/${endpoint}`;
        default: throw new Error(`Unknown environment: ${env.MODE}`);
    }
}