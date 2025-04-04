const API_URL = "http://localhost:3000"

export type JokerData = {
    id: string;
    instance_id: string;
    name: string;
    enabled: boolean;
    description: string;
    tags: string[];
    conflicting_tags: string[];
    frameId: number;
}

async function drawHand(): Promise<JokerData[]> {
    return fetch(`${API_URL}/draw-hand`, {
        method: "POST",
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function currentHand(): Promise<JokerData[]> {
    return fetch(`${API_URL}/hand`, {
        method: "POST",
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

async function discard(indexes: string[]): Promise<JokerData[]> {
    return fetch(`${API_URL}/redraw`, {
        method: "POST",
        headers: {
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