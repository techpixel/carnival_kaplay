export interface Card {
    id: string;
    name: string;
    enabled: boolean | undefined;
    description: string | undefined;
    modifiers: string | undefined;
    tags: string[] | undefined;
    conflicting_tags: string[] | undefined;
    conflicting_cards: string[] | undefined;
    expiration: number | undefined;
    frameId: number;
}

export interface CardInstance extends Card {
    instance_id: string;
    drawn_at: string;
    data: string | undefined;
}

export interface Trade {
    id: string;
    cards_sender: string[];
    user_sender: string;
    user_receiver: string;
    cards_receiver: string[];
    accepted: boolean,
    transaction_over: boolean,
    timestamp: string;
}