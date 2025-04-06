import { c, k } from "./kaplay";
import { Vec2, TweenController, MouseButton, Color, CharTransform, CharTransformFunc } from "kaplay";
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
import { API, JokerData } from "./api";

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

            this.game.tutorial.flags.cardsHovered++;

            if (this.game.tutorial.flags.cardsHovered >= 10 && this.game.tutorial.flags.step === 2) {
                this.game.tutorial.flags.cardsHovered = 0;
                this.game.tutorial.steps[++this.game.tutorial.flags.step]();
            }
        };

        const unfocus = async () => {
            await this.fade(k.rgb(255, 255, 255), 1 / 4, k.easings.easeOutExpo);
        }

        // this is a really bad workaround - i don't want to have to do the math while it's hovering. but it's fine for now
        this.obj.onHoverUpdate(async () => {
            if (this.game.tutorial.flags.disableCards) return;

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

    async discard() {
        Promise.all([
            (async () => {
                await this.scale(k.vec2(0, 1.5), 1 / 8, k.easings.easeInSine);

                this.obj.sprite = "backs";

                await this.scale(k.vec2(1.5, 1.5), 1 / 8, k.easings.easeOutExpo);
            })(),
            this.move(WIDTH + 100, HEIGHT + 100, 1 / 4, k.easings.easeOutExpo),
        ])

        await k.wait(0.1)
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
    public layerOffset = 0;

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

        // this.obj.onUpdate(() => {
        //     for (const card of this.cards) {
        //         // check if the card is idle
        //         if (!card.flags.animLock && !card.flags.dragging && !card.flags.selected && !card.obj.tags.includes("dragging")) {
        //             // use sine to make the card bob up and down. use x position to make it unique for each card
        //             card.flags.anchor.y = card.flags.anchor.y + Math.sin(card.obj.pos.x / 10 + k.time() * 2) / 30;
        //             card.obj.pos.y = card.flags.anchor.y;
        //         }
        //     }
        // })
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

            card.obj.z = i / len + this.layerOffset;
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
            this.pos.y - CARD_HEIGHT / 2 + (slot - len / 2 + 0.5) ** 2,
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
                pos.sub(k.vec2(0, SPACER / 2))
            ),
            k.rect(HAND_WIDTH, HAND_HEIGHT + SPACER, {
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
            this.pos.y + CARD_HEIGHT * 0.75,
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
            k.scale(1),
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
                width: BUTTON_WIDTH - 12,
                pos: k.vec2(-6, -18),
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

    hide() {
        this.obj.scale = k.vec2(0);
    }

    show() {
        this.obj.scale = k.vec2(1);
    }
    
    onClick(cb: () => void) {
        this.obj.onClick(() => {
            if (this.game.tutorial.flags.disableButtons) return;

            cb();
        });
    }
}

const THIN_PAD = 4;
const PAD = 8;
const DOUBLE_PAD = PAD * 2;
export class InfoBar {
    public obj: ReturnType<typeof this.createInfoBar>;

    public themeColor: Color = k.rgb(3, 107, 164);
    public accentColor: Color = k.rgb(1, 59, 91);
    public bgColor: Color = k.rgb(20, 34, 37);

    private balatroTextAnim(len: number = 8): CharTransformFunc {
        return (idx: number, ch: string) => {
            return {
                angle: Math.sin((k.time() + idx) / 2) * 1.5 + (idx - (len / 2)),
                pos: k.vec2(0, Math.sin((k.time() + idx)) + 1.5),
            } as CharTransform
        }
    }

    private createInfoBar() {
        return k.add([
            k.rect(INFOBAR_WIDTH, INFOBAR_HEIGHT),
            k.color(k.rgb(0, 0, 0)),
            k.pos(LEFT, 0),
            k.anchor("topleft"),
            k.z(-1),
            k.area(),
            k.opacity(0.25)
        ]);
    }

    private drawBox(opt: {
        pos: Vec2,
        width: number,
        height: number,
        color?: Color,
        z?: number
    }) {
        //draw shadow first
        k.drawRect({
            width: opt.width,
            height: opt.height,
            anchor: "topleft",
            pos: opt.pos.add(k.vec2(0, 3)),
            // automatically calculate the radius depending on what layer it is (outer layer? inner layer? etc.)
            // outer r = inner r + padding; inner r = 12
            radius: 4 + (THIN_PAD) * (opt.z ?? 1),
            color: k.rgb(0, 0, 0),
            opacity: 0.25
        })

        k.drawRect({
            width: opt.width,
            height: opt.height,
            anchor: "topleft",
            pos: opt.pos,
            radius: 4 + (THIN_PAD) * (opt.z ?? 1),
            color: opt.color ?? this.themeColor,
            // outline: {
            //     width: 4,
            //     color: this.accentColor,
            //     opacity: 0.5,
            // }
        });
    }

    constructor(public game: Game) {
        this.obj = this.createInfoBar();

        this.obj.onDraw(() => {
            // pos irt to info bar

            // grouper 1
            const g1anchor = k.vec2(DOUBLE_PAD, 48);

            this.drawBox({
                width: INFOBAR_WIDTH - 32,
                height: 24+PAD+64+PAD+THIN_PAD,
                pos: g1anchor,
                color: this.bgColor,
                z: 2
            })

            // title
            this.drawBox({
                width: INFOBAR_WIDTH - 32 - PAD,
                height: 24+PAD,
                pos: g1anchor.add(THIN_PAD, THIN_PAD),
                z: 1
            });
            k.drawText({
                width: INFOBAR_WIDTH - 32,
                size: 24,
                text: "tutorial",
                pos: g1anchor.add(0, PAD),
                anchor: "topleft",
                align: "center",
                color: k.rgb(255, 255, 255),
                font: "font",
                letterSpacing: 1.5,
                transform: this.balatroTextAnim("tutorial".length)
            })

            // goal
            this.drawBox({
                width: INFOBAR_WIDTH - 32 - PAD,
                height: 64,
                pos: g1anchor.add(THIN_PAD, 24 + DOUBLE_PAD),
                z: 1,
                color: this.accentColor
            })
            k.drawText({
                width: INFOBAR_WIDTH - 32 - DOUBLE_PAD,
                size: 16,
                text: "complete the tutorial to gain a sticker",
                pos: g1anchor.add(PAD, 24 + DOUBLE_PAD + PAD),
                anchor: "topleft",
                align: "center",
                color: k.rgb(255, 255, 255),
                font: "font",
                letterSpacing: 1.5,
            })

            // card preview
            const cpanchor = k.vec2(16, 48+24+PAD+64+PAD+THIN_PAD+PAD);

            this.drawBox({
                width: INFOBAR_WIDTH - 32,
                height: PAD+20+PAD+96+PAD,
                color: this.bgColor,
                pos: cpanchor,
                z: 2,
            })

            k.drawSprite({
                sprite: "jokers",
                frame: 0,
                color: k.rgb(0, 0, 0),
                opacity: 0.35,
                pos: cpanchor.add(k.vec2(PAD, PAD+20+PAD)),
                anchor: "topleft",
            })

            if (this.game.flags.currentlyHovering) {
                const currentCard = this.game.flags.currentlyHovering;
                const cardData = this.game.flags.currentlyHovering.joker;

                k.drawText({
                    text: cardData.name,
                    size: 20,
                    width: INFOBAR_WIDTH - 32,
                    pos: cpanchor.add(k.vec2(PAD+THIN_PAD, PAD)),
                    anchor: "topleft",
                    align: "left",
                    color: k.rgb(255, 255, 255),
                    font: "font",
                    transform: this.balatroTextAnim(cardData.name.length)
                })

                k.drawSprite({
                    sprite: "jokers",
                    frame: currentCard.obj.frame,
                    pos: cpanchor.add(k.vec2(PAD, PAD+20+PAD)),
                    anchor: "topleft",
                })

                k.drawText({
                    text: cardData.description ?? 'uhm... it does something. probably.',
                    size: 16,
                    width: 120,
                    // pos: k.vec2(16 + 8 + 72, 96 + 32 + 16 + 8 + 8),
                    pos: cpanchor.add(k.vec2(PAD+64+PAD, PAD+20+PAD)),
                    color: k.rgb(255, 255, 255),
                    anchor: "topleft",
                    align: "center",
                    font: "font",
                })
            } else {
                k.drawText({
                    text: "card preview",
                    size: 20,
                    width: INFOBAR_WIDTH - 32,
                    pos: cpanchor.add(k.vec2(PAD+THIN_PAD, PAD)),
                    anchor: "topleft",
                    align: "left",
                    color: k.rgb(255, 255, 255),
                    font: "font",
                    transform: this.balatroTextAnim("card preview".length)
                })
            }

            // discards
            const tutanchor = k.vec2(16, 48+24+PAD+64+PAD+THIN_PAD+PAD+PAD+20+PAD+96+PAD+PAD);

            this.drawBox({
                width: INFOBAR_WIDTH - 32,
                height: PAD+32+PAD,
                color: this.accentColor,
                pos: tutanchor,
                z: 2,
            })

            this.drawBox({
                width: 32,
                height: 32,
                color: this.bgColor,
                pos: tutanchor.add(INFOBAR_WIDTH - 64 - PAD, PAD)
            })

            k.drawText({
                text: 'discards',
                size: 18,
                font: 'font',
                pos: tutanchor.add(PAD, DOUBLE_PAD)
            })

            k.drawText({
                text: `${this.game.flags.remainingDiscards}`,
                size: 24,
                width: 32,
                pos: tutanchor.add(INFOBAR_WIDTH - 64 - PAD + 1, PAD + THIN_PAD + 1),
                color: k.rgb(255, 68, 68),
                anchor: "topleft",
                align: "center",
                font: "font",
                transform: this.balatroTextAnim(`${this.game.flags.remainingDiscards}`.length)
            });
        });
    }
}

export class Tutorial {
    public overlay: ReturnType<typeof this.createOverlay>;
    public jimbo: ReturnType<typeof this.createJimbo>;

    public text: ReturnType<typeof this.createText>;

    public nextButton: ReturnType<typeof this.createNextButton>;

    public flags = {
        disableCards: false,
        disableButtons: false,
        step: 0,
        cardsHovered: 0
    };

    public steps: Function[] = [];

    private createOverlay() {
        return k.add([
            k.rect(k.width(), k.height()),
            k.color(0, 0, 0),
            k.opacity(0),
            k.pos(0, 0),
            k.z(5),
            k.anchor("topleft"),
            k.area(),
        ])
    }

    private createJimbo() {
        // jimbo must be alive
        return k.add([
            {
                draw() {
                    k.drawSprite({
                        sprite: "jokers",
                        frame: 0,
                        color: k.rgb(255, 255, 255),
                        opacity: 0.25,
                        pos: k.vec2(0, 3),
                        anchor: "center",
                    })
                }
            },
            k.sprite("jokers", {
                frame: 0
            }),
            k.anchor("center"),
            k.pos(k.width() / 2, k.height() / 2),
            k.scale(0),
            k.z(11),
            k.rotate(0),
            k.timer(),
        ]);
    }

    private createText() {
        return k.add([
            {
                draw() {
                    k.drawRect({
                        width: 128,
                        height: 16 + this.height,
                        anchor: "bot",
                        pos: k.vec2(0, 8),
                        color: k.rgb(255, 255, 255),
                        radius: 12,
                        outline: {
                            color: k.rgb(195, 202, 210),
                            // opacity: 0.25,
                            width: 2.5,
                        },
                    })
                }
            },
            k.text("n/a", {
                size: 16,
                width: 112,
                font: "font",
                align: "center",
                styles: {
                    "blue": {
                        color: k.rgb(25, 162, 230),
                        override: true,
                    },
                    "yellow": {
                        color: k.rgb(241, 167, 21),
                        override: true,
                    },
                    "red": {
                        color: k.rgb(216, 75, 65),
                        override: true,
                    },
                    "balatro": (idx: number, ch: string) => {
                        return {
                            pos: k.vec2(0, Math.sin((k.time() * 5 + idx)) + 1),
                        } as CharTransform
                    }
                }
            }),
            k.color(k.rgb(101, 110, 110)),
            k.pos(k.width() / 2, k.height() / 2 - 100),
            k.anchor("bot"),
            k.z(10),
            k.scale(0),
        ])
    }

    private updateText(text: string) {
        this.text.text = text;
        this.text.scale = k.vec2(1);
    }

    private createNextButton() {
        const button = k.add([
            {
                draw() {
                    k.drawRect({
                        width: CARD_WIDTH,
                        height: BUTTON_HEIGHT,
                        anchor: "center",
                        pos: k.vec2(0, -20),
                        radius: 10,
                        color: k.rgb(0, 0, 0),
                        opacity: 0.25,
                    });
                }
            },
            k.rect(CARD_WIDTH, BUTTON_HEIGHT, {
                radius: 10,
            }),
            k.color(186, 56, 56),
            k.pos(this.jimbo.pos.add(k.vec2(0, 140))),
            k.anchor("bot"),
            k.z(10),
            k.area(),
            k.scale(0),
        ]);

        button.onDraw(() => {
            k.drawText({
                text: "next",
                size: 16,
                width: BUTTON_WIDTH - 24,
                pos: k.vec2(0, -18),
                color: k.rgb(255, 255, 255),
                anchor: "bot",
                align: "center",
                font: "font",
                scale: 1.5
            });
        });

        button.onHover(async () => {
            button.color = button.color.lighten(20);
        });

        button.onHoverEnd(async () => {
            button.color = k.rgb(186, 56, 56);
        });

        button.onClick(async () => {
            this.text.scale = k.vec2(0);            
            this.nextButton.scale = k.vec2(0);

            this.flags.step++;
            if (this.flags.step < this.steps.length) this.steps[this.flags.step]();
        })

        return button;
    }

    constructor(public game: Game) {
        this.game = game;

        this.overlay = this.createOverlay();
        this.jimbo = this.createJimbo();
        this.text = this.createText();

        this.nextButton = this.createNextButton();
    }

    async start() {
        this.game.flags.inTutorial = true;

        this.flags.disableButtons = true;
        this.flags.disableCards = true;

        await k.wait(0.25);

        await waitTween(
            this.jimbo.tween(
                this.overlay.opacity,
                0.5,
                1,
                (val) => this.overlay.opacity = val,
                k.easings.easeOutSine,
            )
        )

        await waitTween(
            this.jimbo.tween(
                k.vec2(0, 0),
                k.vec2(1.5, 1.5),
                0.5,
                (val) => this.jimbo.scale = val,
                k.easings.easeOutSine,
            )
        )

        await this.chatter("Hello there! My name is [balatro][blue]Jimbo[/blue][/balatro]. I'm here to help you learn how to play!");

        this.steps[0] = async () => {
            await k.wait(0.125);
            console.log("step 0");
            await this.chatter("Your goal is to build a project based on the [yellow]Jokers[/yellow] you play.");
        }

        this.steps[1] = async () => {
            await k.wait(0.125);
            console.log("step 1");
            await this.chatter("You can hover over the jokers to see what they do. Try it out!");            
        }

        this.steps[2] = async () => {
            this.overlay.opacity = 0;
            this.jimbo.scale = k.vec2(0);
            this.text.scale = k.vec2(0);
            this.game.tutorial.flags.disableCards = false;
        }

        this.steps[3] = async () => {
            this.game.tutorial.flags.disableCards = true;
            this.overlay.opacity = 0.5;
            console.log("step 3");
            await this.chatter("You can [red]discard[/red] jokers you don't want to play for new jokers.");
        }

        this.steps[4] = async () => {  
            await k.wait(0.125);
            console.log("step 4");
            await this.chatter("When you are ready, you can [blue]play[/blue] jokers to the table. The jokers you play will be used to build your project.");
        }

        this.steps[5] = async () => {
            this.overlay.opacity = 0;
            this.jimbo.scale = k.vec2(0);
            this.text.scale = k.vec2(0);
            this.game.tutorial.flags.disableCards = false;
        }        
    }

    async chatter(text: string) {
        this.updateText(text);

        for (let i = 0; i < 5; i++) {
            await Promise.all([
                waitTween(
                    this.jimbo.tween(
                        this.jimbo.angle,
                        k.randi(-10, 10),
                        0.125,
                        (val) => this.jimbo.angle = val,
                        k.easings.easeInSine,
                    )
                ),
                waitTween(
                    this.jimbo.tween(
                        this.jimbo.scale,
                        k.vec2(1.75, 1.75),
                        0.125,
                        (val) => this.jimbo.scale = val,
                        k.easings.easeOutSine,
                    )
                )
            ])
            
            await Promise.all([
                waitTween(
                    this.jimbo.tween(
                        this.jimbo.angle,
                        0,
                        0.125,
                        (val) => this.jimbo.angle = val,
                        k.easings.easeOutSine,
                    )
                ),
                waitTween(
                    this.jimbo.tween(
                        this.jimbo.scale,
                        k.vec2(1.5, 1.5),
                        0.125,
                        (val) => this.jimbo.scale = val,
                        k.easings.easeOutSine,
                    )
                )
            ])
        }
        await k.wait(0.125);
        this.nextButton.scale = k.vec2(1);
    }
}

export class Shop {
    public obj = k.add([
        k.rect(HAND_WIDTH, 400, {
            radius: 8,
        }),
        k.color(k.rgb(40, 49, 51)),
        k.outline(5, k.rgb(31, 41, 41), 0.5),
        k.z(2),
        k.anchor("botleft"),
        k.pos(HAND_X, HEIGHT + 100 + 400)
    ])

    public art: Function[] = [];

    constructor() {
        const initTime = k.time();
        
        this.obj.onDraw(() => {
            console.log("drawing shop");
            
            for (const art of this.art) {
                art();
            }
        })
    }

    async moveUp() {
        return waitTween(
            k.tween(
                this.obj.pos,
                k.vec2(HAND_X, HEIGHT + 20 + 400 - 320),
                0.35,
                (val) => { 
                    this.obj.pos = val
                },
                k.easings.easeOutBack,
            )
        )
    }
}

export class Game {
    public flags = {
        hovering: null as Card | null,

        currentlyHovering: null as Card | null,
        remainingDiscards: 0,
        playHand: false,

        mouseHolding: null as Card | null,

        tutorial: false,
        inTutorial: false,
    };

    public hand = new Hand(
        k.vec2(HAND_X, HAND_Y),
        HAND_WIDTH,
    );

    public table = new Table(
        k.vec2(HAND_X, BIG_SPACER),
        HAND_WIDTH,
    );

    public shop = new Shop();

    public tutorial = new Tutorial(this);

    public infoBar = new InfoBar(this);

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
            if (this.tutorial.flags.disableCards) return;
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
            if (this.tutorial.flags.disableCards) return;
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
                this.flags.mouseHolding.obj.z = this.flags.mouseHolding.flags.parentSlot / this.hand.cards.length + this.hand.layerOffset;

                this.flags.mouseHolding = null;
            } else {
                this.flags.mouseHolding = null;
                await click();
            }
        });
    }
}