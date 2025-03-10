import { time } from "console";
import { k } from "./kaplay";
import { Vec2, TweenController, MouseButton, Color } from "kaplay";

import cardData from './cards.json';

export const CARD_WIDTH = 71;
export const CARD_HEIGHT = 95;

export const jokers: {
    [key: string]: typeof cardData.cards[0];
} = {};

for (const card of cardData.cards) {
    jokers[card.name] = card;
}

export function randomJoker() {
    const card = cardData.cards[Math.floor(Math.random() * cardData.cards.length)];
    return card;
}

function waitTween(tween: TweenController): Promise<void> {
    return new Promise((resolve) => tween.onEnd(() => resolve()));
}

export class Card {
    public obj: ReturnType<typeof this.createCard>;

    public flags = {
        animLock: false,
        active: false, // card can be used in the game space

        selected: false,
        dragging: false,

        parentSlot: 0,
    };

    private createCard(
        joker: string,
        pos: Vec2,
    ) {
        return k.add([
            k.sprite("backs", {
                frame: jokers[joker].frame,
            }),
            k.scale(1.25),
            k.pos(pos),
            k.rotate(0),
            k.area(),
            k.color(),
            k.timer(),
            k.anchor("center"),
            k.z(0),
            // "card",
        ]);
    }

    constructor(
        public joker: string,
        pos: Vec2,
    ) {
        this.obj = this.createCard(joker, pos);
    }

    async move(x: number, y: number, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        return waitTween(
            this.obj.tween(
                this.obj.pos,
                k.vec2(x, y),
                time,
                (val) => this.obj.pos = val,
                easing,
            )
        );
    }

    async scale(scale: Vec2, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        return waitTween(
            this.obj.tween(
                this.obj.scale,
                scale,
                time,
                (val) => this.obj.scale = val,
                easing
            )
        )
    }

    async rotate(angle: number, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        return waitTween(
            this.obj.tween(
                this.obj.angle,
                angle,
                time,
                (val) => this.obj.angle = val,
                easing,
            )
        );
    }

    async pulse(color: Color, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        const initColor = this.obj.color;

        return new Promise((resolve) =>
            this.obj.tween(
                this.obj.color,
                color,
                time,
                (val) => this.obj.color = val,
                easing,
            ).onEnd(() => {
                this.obj.tween(
                    this.obj.color,
                    initColor,
                    time,
                    (val) => this.obj.color = val,
                    easing,
                );

                resolve();
            })
        );
    }

    async fade(color: Color, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        const initColor = this.obj.color;

        return waitTween(
            this.obj.tween(
                this.obj.color,
                color,
                time,
                (val) => this.obj.color = val,
                easing,
            )
        );
    }

    //event wrappers

    onHover(cb: () => void) {
        this.obj.onHover(() => {
            if (this.flags.animLock) return;

            cb();
        });
    }

    onHoverEnd(cb: () => void) {
        this.obj.onHoverEnd(() => {
            if (this.flags.animLock) return;

            cb();
        });
    }

    onClick(cb: () => void) {
        this.obj.onClick(() => {
            if (this.flags.animLock) return;
            // if (!this.flags.active) return;

            cb();
        });
    }

    onMouseDown(cb: (mouse: MouseButton) => void) {
        this.obj.onMouseDown((mouse) => {
            if (this.flags.animLock) return;
            if (!this.flags.active) return;

            cb(mouse);
        });
    }

    onMouseRelease(cb: (mouse: MouseButton) => void) {
        this.obj.onMouseRelease((mouse) => {
            if (this.flags.animLock) return;
            if (!this.flags.active) return;

            cb(mouse);
        });
    }
}

// do the math to automatically determine the position of the cards within the hand
export class Hand {
    public cards: Card[] = [];

    constructor(
        public pos: Vec2,
        public width: number,
    ) {}

    async moveCards() {
        const len = this.cards.length;

        // equally distribute the cards in the hand
        const spacing = (this.width - CARD_WIDTH * len) / (len + 1);

        // move all cards
        for (let i = 0; i < len; i++) {
            const card = this.cards[i];

            card.move(
                this.pos.x + spacing * (i + 1) + CARD_WIDTH / 2 + CARD_WIDTH * i,
                this.pos.y - CARD_HEIGHT / 2 + (i - len/2 + 0.5) ** 2,
                1 / 4,
                k.easings.easeOutExpo
            )
            card.rotate((i - len/2) * 2, 1 / 4, k.easings.easeOutExpo)

            card.obj.z = i / len;
            card.flags.parentSlot = i;
        }
    }

    async addCard(card: Card, slot: number = -1) {
        if (slot !== -1) {
            this.cards.splice(slot, 0, card);
        } else {
            this.cards.push(card);
        }

        await this.moveCards();
    }

    async removeCard(card: Card, dest: Vec2, destroy: boolean = true) {
        // remove the card from the hand
        this.cards = this.cards.filter((c) => c !== card);

        if (destroy) {
            // move the card to the pile
            await Promise.all([
                card.move(
                    dest.x - CARD_WIDTH / 2,
                    dest.y - CARD_HEIGHT / 2,
                    1 / 4, 
                    k.easings.easeOutExpo
                ),
                card.rotate(0, 1 / 4, k.easings.easeOutExpo),
                (async () => {
                    await card.scale(k.vec2(0, 1.25), 1 / 8, k.easings.easeInSine);
                    card.obj.sprite = "backs";
                    // card.obj.frame = k.randi(0, 10);
                    await card.scale(k.vec2(1.25, 1.25), 1 / 8, k.easings.easeOutExpo);
                })()
            ])

            card.obj.destroy();
        }

        await this.moveCards();
    }
}