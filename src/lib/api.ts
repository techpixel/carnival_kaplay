const API_URL = "https://carnival.preview.gus.ink";
const AUTH_TOKEN = "mvNDH1nGMhJixVtdDhHJeUa5TAJGCx5B";

export type JokerData = {
    id: string;
    name: string;
    enabled: boolean;
    description: string;
    tags: string[];
    conflicting_tags: string[];
    frameId: number;
}

async function drawHand(): Promise<JokerData[]> {
    return fetch(`${API_URL}/draw-hand`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${AUTH_TOKEN}`
        }
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function currentHand(): Promise<JokerData[]> {
    return fetch(`${API_URL}/hand`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${AUTH_TOKEN}`
        }
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function draw(hand: JokerData[]): Promise<JokerData> {
    return fetch(`${API_URL}/draw`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(hand)
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function play(hand: JokerData[]): Promise<string> {
    return fetch(`${API_URL}/play`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(hand)
    })
        .then((response) => response.json())
        .then((data) => data.project)
         .catch((error) => console.error(error));
}

async function discard(indexes: number[]): Promise<JokerData[]> {
    return fetch(`${API_URL}/redraw`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(indexes)
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

export const API = {
    drawHand,
    currentHand,
    draw,
    play,
    discard,
}