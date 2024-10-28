
const URLS = {
    DEV: "http://localhost:3000",
    PROD: "https://scribe-ai-back.fly.dev"
}

export function getAPIEndpoint(endpoint: string): string {
    const env = import.meta.env;
    let fullURL: string;
    switch (env.MODE) {
        case 'development': fullURL = URLS.DEV;
            break;
        case 'production': fullURL = URLS.PROD;
            break;
        default: throw new Error(`Unknown environment: ${env.MODE}`);
    }
    console.log(`${fullURL}/${endpoint}`);
    return `${fullURL}/${endpoint}`;
}