import { HandResponse } from "../../../src/lib/types";
import { CardInstance } from "./types";

const API_URL = "http://localhost:3000"

type UserPayload = {
    discards: number;
    completed_tutorial: boolean;
}
async function user(): Promise<UserPayload> {
    return fetch(`${API_URL}/user`, {
        method: "GET",
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function hand(): Promise<HandResponse> {
    return fetch(`${API_URL}/hand`, {
        method: "POST",
    })
        .then((response) => response.json())
        .catch((error) => console.error(error));
}

async function draw(hand: CardInstance[]): Promise<CardInstance> {
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

async function play(hand: string[]): Promise<string> {
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

async function discard(indexes: string[]): Promise<CardInstance[]> {
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
    hand,
    draw,
    play,
    discard,
    user
}