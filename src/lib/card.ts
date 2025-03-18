import { c, k } from "./kaplay";
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
} from "./const";

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

        shadowOffset: k.vec2(5, 5),
    };

    private createCard(
        frame: number,
        pos: Vec2,
    ) {
        return k.add([
            k.sprite("backs", {
                frame
            }),
            k.scale(1.5),
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

        // this.obj.onUpdate(() => {
        //     // check if the card is idle
        //     if (!this.flags.animLock && !this.flags.dragging && !this.flags.selected && !this.obj.tags.includes("dragging")) {
        //         // use sine to make the card bob up and down. use x position to make it unique for each card
        //         this.flags.anchor.y = this.flags.anchor.y + Math.sin(this.obj.pos.x / 10 + k.time() * 2) / 30;
        //         this.obj.pos.y = this.flags.anchor.y;
        //     }
        // })
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

    public obj = k.add([
        k.rect(HAND_WIDTH, HAND_HEIGHT, {
            radius: 10,
        }),
        k.color(0, 0, 0),
        k.opacity(0.10),
        k.area(),
        k.z(-1),
        k.anchor("botleft"),
        k.pos()
    ])

    constructor(
        public pos: Vec2,
        public width: number,
    ) { 
        this.obj.pos.x = this.pos.x;
        this.obj.pos.y = this.pos.y + SPACER;
    }

    async moveCards() {
        const len = this.cards.length;

        // move all cards
        for (let i = 0; i < len; i++) {
            const card = this.cards[i];

            const cardPos = this.getCardPos(i);
            const cardRot = this.getCardRot(i);

            if (card.obj.pos !== cardPos) {
                card.move(
                    cardPos.x,
                    cardPos.y,
                    1 / 4,
                    k.easings.easeOutExpo
                )
            }

            if (card.obj.angle !== cardRot) {
                card.rotate(cardRot, 1 / 4, k.easings.easeOutExpo)
            }

            card.obj.z = i / len;
            card.flags.parentSlot = i;

            card.flags.anchor = cardPos;
            card.flags.anchorRot = cardRot;
        }
    }

    // async makeSpace(i) {
    //     // move all the cards, providing a space for i where the card can be inserted
    //     const len = this.cards.length + 1;

    //     for (let j = 0; j < i; j++) {
    //         const card = this.cards[j];

    //         const cardPos = this.getCardPos(j);
    //         const cardRot = this.getCardRot(j);

    //         card.move(
    //             cardPos.x,
    //             cardPos.y,
    //             1 / 4,
    //             k.easings.easeOutExpo
    //         )
    //         card.rotate(cardRot, 1 / 4, k.easings.easeOutExpo)

    //         card.obj.z = j / len;
    //         card.flags.parentSlot = j;

    //         card.flags.anchor = cardPos;
    //         card.flags.anchorRot = cardRot;
    //     }

    //     for (let j = i + 1; j < len; j++) {
    //         const card = this.cards[j];

    //         const cardPos = this.getCardPos(j);
    //         const cardRot = this.getCardRot(j);

    //         card.move(
    //             cardPos.x,
    //             cardPos.y,
    //             1 / 4,
    //             k.easings.easeOutExpo
    //         )
    //         card.rotate(cardRot, 1 / 4, k.easings.easeOutExpo)

    //         card.obj.z = j / len;
    //         card.flags.parentSlot = j;

    //         card.flags.anchor = cardPos;
    //         card.flags.anchorRot = cardRot;
    //     }
    // }

    async addCard(card: Card, slot: number = -1) {
        if (slot !== -1) {
            this.cards.splice(slot, 0, card);
        } else {
            this.cards.push(card);
        }

        await this.moveCards();
    }

    async removeCard(card: Card, anim = true) {
        // remove the card from the hand
        this.cards = this.cards.filter((c) => c !== card);

        if (anim) {
            await this.moveCards();
        }
    }

    async destroyCard(card: Card, dest: Vec2) {
        // remove the card from the hand
        this.cards = this.cards.filter((c) => c !== card);

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

        await this.moveCards();    
    }

    getCardPos(slot: number) {
        const len = this.cards.length;

        // equally distribute the cards in the hand
        const spacing = (this.width - CARD_WIDTH * len) / (len + 1);

        // move all cards
        return k.vec2(
            this.pos.x + spacing * (slot + 1) + CARD_WIDTH / 2 + CARD_WIDTH * slot,
            this.pos.y - CARD_HEIGHT / 2 + (slot - len / 2 + 0.5) ** 2 ,
        );
    }

    getCardRot(slot: number) {
        return (slot - this.cards.length / 2) * 2;
    }

    async returnCardToHand(card: Card) {
        const cardPos = await this.getCardPos(card.flags.parentSlot);
        const cardRot = await this.getCardRot(card.flags.parentSlot);

        await Promise.all([
            card.move(
                cardPos.x,
                cardPos.y + (card.flags.selected ? -50 : 0),
                1 / 4,
                k.easings.easeOutExpo
            ),
            card.rotate(cardRot, 1 / 4, k.easings.easeOutExpo)
        ]);
    }
}

export class Table extends Hand {
    constructor(
        pos: Vec2,
        width: number,
    ) {
        super(pos, width);

        this.obj.destroy();

        this.obj = k.add([
            k.pos(
                HAND_X,
                BIG_SPACER
            ),
            k.rect(HAND_WIDTH, 200, {
                radius: 10,
            }),
            k.color(0, 0, 0),
            k.opacity(0.10),
            k.area(),
            k.z(-1),
            k.anchor("topleft"),
            k.timer()
        ]);
    }

    // modify getCardRot and getCardPos to fit the table
    getCardPos(slot: number) {
        const len = this.cards.length;

        // equally distribute the cards in the hand
        const CARD_SPACER = 60;
        const BODY = CARD_WIDTH * len + CARD_SPACER * (len - 1);
        const LSPACE = (this.width - BODY) / 2;

        // move all cards
        return k.vec2(
            this.pos.x + LSPACE + CARD_SPACER * (slot + 1) + CARD_WIDTH * slot - CARD_WIDTH / 2,
            this.pos.y + CARD_HEIGHT,
        );
    }

    getCardRot(slot: number) {
        return 0;
    } 
}

export class Button {
    public obj: ReturnType<typeof this.createButton>;
    public hoverColor: Color;
    public disabled = false;

    private createButton() {
        return k.add([
            {
                draw() {
                    k.drawRect({
                        width: BUTTON_WIDTH,
                        height: BUTTON_HEIGHT,
                        anchor: "botright",
    
                        pos: k.vec2(0, 3),
                        radius: 10,
    
                        color: k.rgb(0, 0, 0),
                        opacity: 0.25,
                    });
                }
            },
            k.rect(BUTTON_WIDTH, BUTTON_HEIGHT, {
                radius: 10,
            }),
            // k.pos(DISCARD_BUTTON_X, BOTTOM),
            k.pos(this.pos),            
            k.color(this.color),
            k.anchor("botright"),
            k.z(-1),
            k.area(),
        ]);
    }

    constructor(
        public game: Game,
        public text: string,
        public color: Color,
        public pos: Vec2,
    ) {
        this.obj = this.createButton();

        this.hoverColor = k.rgb(
            this.color.r + 20,
            this.color.g + 20,
            this.color.b + 20
        )

        this.obj.onDraw(() => {
            k.drawText({
                text: this.text,
                size: 16,
                width: BUTTON_WIDTH - 24,
                pos: k.vec2(-12, -18),
                color: k.rgb(255, 255, 255),
                anchor: "botright",
                align: "center",
                font: "font",
                scale: 1.5
            });
        });

        this.obj.onHover(async () => {
            this.obj.color = this.hoverColor
        })
        this.obj.onHoverEnd(async () => {
            this.obj.color = this.color;
        })
    }

    disable() {
        this.disabled = true;
        this.color = k.rgb(97, 97, 97);
        this.hoverColor = k.rgb(108, 108, 108);
        this.obj.color = this.color;
    }
}

export class Game {
    public hand = new Hand(
        k.vec2(HAND_X, HAND_Y),
        HAND_WIDTH,
    );

    public table = new Table(
        k.vec2(HAND_X, BIG_SPACER),
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
        // Card movement
        k.onMousePress(async (mouse) => {
            const selectedCard = this.flags.currentlyHovering;

            if (!selectedCard) return;

            const pos = k.mousePos();

            if (!selectedCard.obj.hasPoint(pos)) return;

            this.flags.mouseHolding = selectedCard;
        });

        k.onMouseMove(async (mouse, delta) => {
            // dragging
            if (!this.flags.mouseHolding) return;

            if (this.flags.mouseHolding.obj.tags.includes("dragging")) {
                this.flags.mouseHolding.obj.pos = mouse;

                this.flags.mouseHolding.rotate(delta.x / 2, 0.15, k.easings.easeOutExpo)

                return;
            } else {
                this.flags.mouseHolding.obj.tag("dragging");

                this.flags.mouseHolding.obj.pos = mouse;
                this.flags.mouseHolding.obj.z = 10;

                this.flags.mouseHolding.rotate(delta.x / 2, 0.15, k.easings.easeOutExpo);
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
                await card.move(cardPos.x, cardPos.y, 0.5, k.easings.easeOutBack);
                card.flags.anchor.y = cardPos.y;
            } else {
                card.flags.selected = true;
                await card.move(cardPos.x, cardPos.y - 50, 0.5, k.easings.easeOutBack);
                card.flags.anchor.y = cardPos.y - 50;
            }

            bouncer = false;
        }

        // let cardsInPlay: Card[] = [];
        const drop = async (card: Card) => {
            card.flags.selected = false;

            if (this.table.obj.hasPoint(card.obj.pos) && 
                ((this.table.cards.length < 4 && !this.table.cards.includes(card)) || this.table.cards.includes(card))
            ) {
                if (this.hand.cards.includes(card)) {
                    await this.hand.removeCard(card);
                } else if (this.table.cards.includes(card)) {
                    await this.table.removeCard(card, false);
                }

                for (const cardInTable of this.table.cards) {
                    if (cardInTable.obj.pos.x > card.obj.pos.x) {
                        await this.table.addCard(card, this.table.cards.indexOf(cardInTable));
                        return;
                    }
                }

                await this.table.addCard(card);     
            }

            if (this.hand.obj.hasPoint(card.obj.pos)) {// && !this.hand.cards.includes(card)) {
                if (this.hand.cards.includes(card)) {
                    await this.hand.removeCard(card, false);
                } else if (this.table.cards.includes(card)) {
                    await this.table.removeCard(card);
                }

                for (const cardInHand of this.hand.cards) {
                    if (cardInHand.obj.pos.x > card.obj.pos.x) {
                        await this.hand.addCard(card, this.hand.cards.indexOf(cardInHand));
                        return;
                    }
                }

                await this.hand.addCard(card);
            }
        }

        k.onMouseRelease(async (mouse) => {
            if (!this.flags.mouseHolding) return;

            if (this.flags.mouseHolding.obj.tags.includes("dragging")) {
                this.flags.mouseHolding.obj.untag("dragging");

                const card = this.flags.mouseHolding;

                await drop(card);

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