import { k } from "./kaplay";
import { Vec2, TweenController, MouseButton, Color } from "kaplay";
import {
    HEIGHT,
    WIDTH,
    BIG_SPACER,
    SPACER,
    TOP_MARGIN,
    BOTTOM_MARGIN,
    LEFT_MARGIN,
    RIGHT_MARGIN,
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
    INFOBAR_WIDTH,
    INFOBAR_HEIGHT,
    HAND_WIDTH,
    HAND_HEIGHT,
    BUTTON_WIDTH,
    BUTTON_HEIGHT,
    DISCARD_BUTTON_X,
    PLAY_HAND_BUTTON_X,
    DECK_X,
    DECK_Y,
    HAND_SPACING,
    HAND_X,
    HAND_Y,
    CARD_HEIGHT,
    CARD_WIDTH
} from "../const";

import cardData from '../cards.json';
import { JokerData } from "./api";

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
        active: true, // whether the card can be interacted with

        selected: false,
        dragging: false,

        parentSlot: 0,

        anchor: k.vec2(0, 0),
        anchorRot: 0,
    };

    private createCard(
        frame: number,
        pos: Vec2,
    ) {
        return k.add([
            k.sprite("backs", {
                frame
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
        public game: Game,
        public joker: JokerData,
        pos: Vec2,
    ) {
        this.obj = this.createCard(joker.frameId, pos);

        const focus = async () => {
            await this.fade(k.rgb(200, 200, 200), 1 / 4, k.easings.easeOutExpo);
        };

        const unfocus = async () => {
            await this.fade(k.rgb(255, 255, 255), 1 / 4, k.easings.easeOutExpo);
        }

        // this is a really bad workaround - i don't want to have to do the math while it's hovering. but it's fine for now
        this.obj.onHoverUpdate(async () => {
            if (game.flags.currentlyHovering) {
                if (game.flags.currentlyHovering === this) {
                    return;
                } else if (this.obj.z > game.flags.currentlyHovering.obj.z) {
                    game.flags.currentlyHovering = this;
                    await focus();
                } else {
                    await unfocus();
                }
            } else {
                game.flags.currentlyHovering = this;
                await focus();
            }
        });

        this.obj.onHoverEnd(async () => {
            if (game.flags.currentlyHovering === this) {
                game.flags.currentlyHovering = null;
            }

            await unfocus();
        });
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
    public nextIndex = 0;

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

            const cardPos = this.getCardPos(i);
            const cardRot = this.getCardRot(i);

            card.move(
                cardPos.x,
                cardPos.y,
                1 / 4,
                k.easings.easeOutExpo
            )
            card.rotate(cardRot, 1 / 4, k.easings.easeOutExpo)

            card.obj.z = i / len;
            card.flags.parentSlot = i;

            card.flags.anchor = cardPos;
            card.flags.anchorRot = cardRot;
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

    getCardPos(slot: number) {
        const len = this.cards.length;

        // equally distribute the cards in the hand
        const spacing = (this.width - CARD_WIDTH * len) / (len + 1);

        // move all cards
        return k.vec2(
            this.pos.x + spacing * (slot + 1) + CARD_WIDTH / 2 + CARD_WIDTH * slot,
            this.pos.y - CARD_HEIGHT / 2 + (slot - len/2 + 0.5) ** 2,
        );
    }

    getCardRot(slot: number) {
        return (slot - this.cards.length/2) * 2;
    }

    async returnCardToHand(card: Card) {
        const cardPos = await this.getCardPos(card.flags.parentSlot);
        const cardRot = await this.getCardRot(card.flags.parentSlot);

        await Promise.all([       
            card.move(
                cardPos.x,
                cardPos.y  + (card.flags.selected ? -50 : 0),
                1 / 4,
                k.easings.easeOutExpo
            ),
            card.rotate(cardRot, 1 / 4, k.easings.easeOutExpo)
        ]);
    }
}

export class Game {
    public hand = new Hand(
        k.vec2(HAND_X, HAND_Y),
        HAND_WIDTH,
    );

    public flags = {
        hovering: null as Card | null,

        currentlyHovering: null as Card | null,
        remainingDiscards: 2,
        playHand: false,

        mouseHolding: null as Card | null,        
    };

    constructor() {
        k.onMousePress(async (mouse) => {
            const selectedCard = this.flags.currentlyHovering;

            if (!selectedCard) return;

            const pos = k.mousePos();

            if (!selectedCard.obj.hasPoint(pos)) return;

            this.flags.mouseHolding = selectedCard;
        });

        k.onMouseMove(async (mouse, delta) => {
            if (!this.flags.mouseHolding) return;

            if (this.flags.mouseHolding.obj.tags.includes("dragging")) {
                this.flags.mouseHolding.obj.pos = mouse;

                await this.flags.mouseHolding.rotate(delta.x / 2, 0.15, k.easings.easeOutExpo)
                
                return;
            } else {
                this.flags.mouseHolding.obj.tag("dragging");
                this.flags.mouseHolding.obj.pos = mouse;
                this.flags.mouseHolding.obj.z = 10;

                await this.flags.mouseHolding.rotate(delta.x / 2, 0.15, k.easings.easeOutExpo);
            }
        });

        let bouncer = false;
        const click = async () => {
            if (bouncer) return;
            const card = this.flags.currentlyHovering;
            if (!card) return;

            if (!this.hand.cards.includes(card)) return;

            bouncer = true;
            const cardPos = await this.hand.getCardPos(card.flags.parentSlot);

            if (card.flags.selected) {
                card.flags.selected = false;
                await card.move(cardPos.x, cardPos.y, 0.5, k.easings.easeOutExpo);
                card.flags.anchor.y = cardPos.y;
            } else {
                card.flags.selected = true;
                await card.move(cardPos.x, cardPos.y - 50, 0.5, k.easings.easeOutExpo);
                card.flags.anchor.y = cardPos.y - 50;
            }

            bouncer = false;
        }

        k.onMouseRelease(async (mouse) => {
            if (!this.flags.mouseHolding) return;

            if (this.flags.mouseHolding.obj.tags.includes("dragging")) {
                this.flags.mouseHolding.obj.untag("dragging");

                const card = this.flags.mouseHolding;

                card.move(
                    card.flags.anchor.x,
                    card.flags.anchor.y,  
                    1 / 4,
                    k.easings.easeOutExpo
                )
                card.rotate(card.flags.anchorRot, 1 / 4, k.easings.easeOutExpo)
                this.flags.mouseHolding.obj.z = this.flags.mouseHolding.flags.parentSlot / this.hand.cards.length;

                this.flags.mouseHolding = null;
            } else {
                this.flags.mouseHolding = null;
                await click();
            }
        });
    }
}