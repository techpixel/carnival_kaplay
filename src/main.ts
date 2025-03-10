import { Vec2 } from "kaplay";
import { Card, CARD_HEIGHT, CARD_WIDTH, Hand, jokers, randomJoker } from "./card";
import { k } from "./kaplay";

// k.scene("cards", async () => {
//     const bg = k.add([
//         k.color(35, 15, 15),
//         k.rect(k.width(), k.height()),
//         k.pos(0, 0),
//         k.area(),

//         k.z(-2),

//         k.shader("balatro", () => ({
//             iTime: k.time(),
//             iResolution: k.vec2(5, 5),
//             SET_COLOR_1: k.rgb(66, 118, 98),
//             SET_COLOR_2: k.rgb(50, 100, 79),
//             SET_COLOR_3: k.rgb(36, 123, 71),
//         }))
//     ]);

//     const uiOverlay = k.add([
//         k.rect(600, 600),
//         k.pos(0, 0),
//         k.z(-1),
//         k.color(35, 15, 15),
//     ]);
//     uiOverlay.hidden = true;
//     uiOverlay.onDraw(() => {
//         k.drawRect({
//             width: 200,
//             height: 200,
//             color: k.rgb(114, 48, 48),
//             pos: k.vec2(400, 0),
//         })

//         k.drawText({
//             text: "discard",
//             size: 24,
//             width: 120,
//             pos: k.vec2(410, 10),
//             color: k.rgb(238, 163, 142),
//         })

//         k.drawRect({
//             width: 600,
//             height: 200,
//             color: k.rgb(114, 48, 48),

//             pos: k.vec2(0, 400),
//         });

//         k.drawText({
//             text: "deck",
//             size: 24,
//             width: 120,
//             pos: k.vec2(10, 410),
//             color: k.rgb(238, 163, 142),
//         })
//     });

//     const drawPile = createCard(drawVec);
//     const discardPile = createCard(discardVec);

//     const cardTitle = k.add([
//         k.text("Cards"),
//         k.pos(380, 250),

//         k.scale(0.5),        
//         k.z(-1),
//     ]);
//     cardTitle.hidden = true;

//     const cardDesc = k.add([
//         k.text("Click and drag to move the card around. Click on the card to flip it.", {
//             width: 600,
//         }),
//         k.pos(380, 280),

//         k.scale(0.3),        
//         k.z(-1),
//     ]);
//     cardDesc.hidden = true;

//     let deck: Card[] = [];
//     let cardOnTable = false;

//     drawPile.onClick(async () => {
//         if (cardOnTable) return;
//         cardOnTable = true;

//         const joker = randomJoker();

//         cardTitle.text = joker.name;
//         cardDesc.text = joker.description ?? 'uhm... it does something. probably.';

//         const newCard = new Card(joker.name, drawVec);

//         await newCard.move(new k.Vec2(300, 300));

//         newCard.onHover(async () => {
//             if (newCard.flags.animLock) return;

//             if (!newCard.flags.flipped) {
//                 newCard.flags.animLock = true;

//                 await newCard.scale(new k.Vec2(0, 1.5), 0.5, k.easings.easeInSine);

//                 newCard.obj.sprite = "jokers";
//                 newCard.obj.frame = k.randi(0, 10);
//                 cardTitle.hidden = false;
//                 cardDesc.hidden = false;

//                 await newCard.scale(new k.Vec2(2, 2), 0.5, k.easings.easeOutSine);

//                 if (!newCard.obj.isHovering()) {
//                     await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo);
//                 }

//                 newCard.flags.animLock = false;
//                 newCard.flags.flipped = true;
//                 newCard.flags.active = true;

//                 return;
//             }

//             cardTitle.hidden = false;
//             cardDesc.hidden = false;            

//             await newCard.scale(new k.Vec2(2, 2), 1, k.easings.easeOutExpo);
//         });

//         newCard.onHoverEnd(async () => {
//             cardTitle.hidden = true;
//             cardDesc.hidden = true;

//             await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo);
//         });

//         newCard.onMouseDown(async (mouse) => {
//             if (!newCard.flags.flipped) return;
//             if (!newCard.obj.isHovering()) return;

//             const mousePos = k.mousePos();

//             uiOverlay.hidden = false;
//             cardTitle.hidden = true;
//             cardDesc.hidden = true;

//             newCard.obj.pos = mousePos;

//             if (mousePos.x > 400 && mousePos.y < 200) {
//                 newCard.flags.animLock = true;

//                 newCard.move(discardVec)
//                 await newCard.scale(new k.Vec2(0, 1.5), 1, k.easings.easeInSine)

//                 newCard.obj.sprite = "backs"
//                 newCard.obj.frame = 0;

//                 await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo)

//                 newCard.flags.animLock = false;

//                 newCard.obj.destroy();
//                 uiOverlay.hidden = true;
//                 cardOnTable = false;

//                 return;
//             }

//             if (mousePos.y > 400) {
//                 newCard.flags.animLock = true;

//                 deck.push(newCard);

//                 const cardWidth = 71;
//                 const cardBIG_SPACER = 10;
//                 const posDisplacement = cardWidth / 2;

//                 const deckWidth = deck.length * (cardWidth + cardBIG_SPACER) - cardBIG_SPACER;

//                 let i = 0;

//                 console.log((600 - deckWidth)/2);

//                 for (const card of deck) {
//                     card.move(new k.Vec2( 
//                         (600 - deckWidth)/2 + (cardWidth + cardBIG_SPACER) * i + posDisplacement,
//                         500));
//                     i++;
//                 }

//                 await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo);

//                 cardOnTable = false;

//                 newCard.flags.animLock = false;

//                 uiOverlay.hidden = true;
//                 cardOnTable = false;

//                 return;
//             }

//             newCard.move(mousePos);
//         });

//         newCard.onMouseRelease(async (mouse) => {
//             if (newCard.flags.animLock) return;
//             if (!newCard.flags.flipped) return;
//             if (!newCard.obj.isHovering()) return;

//             uiOverlay.hidden = true;

//             newCard.flags.animLock = true;
//             await Promise.all([
//                 newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo),
//                 newCard.move(new k.Vec2(300, 300))
//             ]);

//             newCard.flags.animLock = false;
//         });
//     });
// });

const BIG_SPACER = 56;
const SPACER = 24;

const TOP_MARGIN = 32;
const BOTTOM_MARGIN = 32;
const LEFT_MARGIN = 32;
const RIGHT_MARGIN = 24;

const TOP = TOP_MARGIN;
const BOTTOM = k.height() - BOTTOM_MARGIN;
const LEFT = LEFT_MARGIN;
const RIGHT = k.width() - RIGHT_MARGIN;

const INFOBAR_WIDTH = 240;
const INFOBAR_HEIGHT = k.width();

const HAND_WIDTH = 480;
const HAND_HEIGHT = 100;

const BUTTON_WIDTH = 144;
const BUTTON_HEIGHT = 48;

const DISCARD_BUTTON_X = LEFT + INFOBAR_WIDTH + BIG_SPACER + (HAND_WIDTH / 2) - SPACER;

const PLAY_HAND_BUTTON_X = LEFT + INFOBAR_WIDTH + BIG_SPACER + (HAND_WIDTH / 2) + SPACER;

const DECK_X = RIGHT - BIG_SPACER;
const DECK_Y = BOTTOM - SPACER;

k.scene("balatroui", async () => {
    const gameFlags = {
        currentlyHovering: null as Card | null,
        remainingDiscards: 2,
        playHand: false,

        mouseHolding: null as Card | null,
    };

    let c1 = k.rgb(66, 118, 98);
    let c2 = k.rgb(50, 100, 79);
    let c3 = k.rgb(36, 123, 71);
    const bg = k.add([
        k.color(35, 15, 15),
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.area(),

        k.z(-2),

        k.shader("balatro", () => ({
            iTime: k.time(),
            iResolution: k.vec2(5, 5),
            SET_COLOR_1: c1,
            SET_COLOR_2: c2,
            SET_COLOR_3: c3,
        }))
    ]);

    k.onDraw(() => {
        //info bar
        k.drawRect({
            width: INFOBAR_WIDTH,
            height: INFOBAR_HEIGHT,
            pos: k.vec2(LEFT, 0),

            color: k.rgb(0, 0, 0),
            opacity: 0.25,
        });

        if (gameFlags.currentlyHovering) {
            const currentCard = gameFlags.currentlyHovering;
            const cardData = jokers[currentCard.joker];

            k.drawSprite({
                sprite: "jokers",
                frame: currentCard.obj.frame,
                pos: k.vec2(LEFT + INFOBAR_WIDTH / 2, TOP + BIG_SPACER),
                anchor: "center",
            })

            k.drawText({
                text: cardData.name,
                size: 24,
                width: INFOBAR_WIDTH - 48,
                pos: k.vec2(LEFT + INFOBAR_WIDTH / 2, TOP + BIG_SPACER + CARD_HEIGHT),
                color: k.rgb(255, 255, 255),
                anchor: "center",
                align: "center",
                font: "font",
            })

            k.drawText({
                text: cardData.description ?? 'uhm... it does something. probably.',
                size: 16,
                width: INFOBAR_WIDTH - 48,
                pos: k.vec2(LEFT + INFOBAR_WIDTH / 2, TOP + BIG_SPACER + CARD_HEIGHT + 32),
                color: k.rgb(255, 255, 255),
                anchor: "center",
                align: "center",
                font: "font",
            })
        }

        k.drawText({
            text: `remaining discards: ${gameFlags.remainingDiscards}`,
            size: 24,
            width: INFOBAR_WIDTH,
            pos: k.vec2(LEFT + INFOBAR_WIDTH, BOTTOM - BIG_SPACER),
            color: k.rgb(255, 68, 68),
            anchor: "botright",
            align: "center",
            font: "font",
        });

        // hand
        k.drawRect({
            width: HAND_WIDTH,
            height: HAND_HEIGHT,

            pos: k.vec2(LEFT + INFOBAR_WIDTH + BIG_SPACER, BOTTOM - BUTTON_HEIGHT - SPACER),
            anchor: "botleft",

            radius: 10,

            color: k.rgb(0, 0, 0),
            opacity: 0.10,
        });

        // discard button
        k.drawText({
            text: "discard",
            size: 16,
            width: BUTTON_WIDTH - 24,
            pos: k.vec2(DISCARD_BUTTON_X - 12, BOTTOM - 18),
            color: k.rgb(255, 255, 255),
            anchor: "botright",
            align: "center",
            font: "font",
            scale: 1.5
        });

        // play hand button
        k.drawText({
            text: "play hand",
            size: 16,
            width: BUTTON_WIDTH - 24,
            pos: k.vec2(PLAY_HAND_BUTTON_X + 12, BOTTOM - 18),
            color: k.rgb(255, 255, 255),
            anchor: "botleft",
            align: "center",
            font: "font",
            scale: 1.5,
        });

        k.drawSprite({
            sprite: "lines",
            pos: k.vec2(0, 0),
            width: 1000,
            height: 600,
            tiled: true,
            opacity: 0.15,
        })
    });

    const discardButton = k.add([
        k.rect(BUTTON_WIDTH, BUTTON_HEIGHT, {
            radius: 10,
        }),
        k.pos(DISCARD_BUTTON_X, BOTTOM),
        k.color(186, 56, 56),
        k.anchor("botright"),
        k.z(-1),
        k.area(),
    ]);

    discardButton.onHover(async () => {
        if (gameFlags.remainingDiscards <= 0) {
            discardButton.color = k.rgb(108, 108, 108);
            return;
        }
        discardButton.color = k.rgb(255, 68, 68);
    })
    discardButton.onHoverEnd(async () => {
        if (gameFlags.remainingDiscards <= 0) {
            discardButton.color = k.rgb(97, 97, 97);
            return;
        }
        discardButton.color = k.rgb(186, 56, 56);
    })

    const playHandButton = k.add([
        k.rect(BUTTON_WIDTH, BUTTON_HEIGHT, {
            radius: 10,
        }),
        k.pos(PLAY_HAND_BUTTON_X, BOTTOM),
        k.color(56, 138, 186),
        k.anchor("botleft"),
        k.z(-1),
        k.area(),
    ]);
    playHandButton.onHover(async () => {
        playHandButton.color = k.rgb(55, 178, 255);
    })
    playHandButton.onHoverEnd(async () => {
        playHandButton.color = k.rgb(56, 138, 186);
    })

    const drawPile = k.add([
        k.sprite("backs", {
            frame: 0,
        }),
        k.anchor("botright"),
        k.pos(DECK_X, DECK_Y),
        k.area(),
        k.scale(1.25),
    ]);

    const hand = new Hand(
        k.vec2(LEFT + INFOBAR_WIDTH + BIG_SPACER, BOTTOM - BUTTON_HEIGHT - SPACER),
        HAND_WIDTH,
    );

    for (let i = 0; i < 7; i++) {
        const card = new Card(randomJoker().name, k.vec2(DECK_X - CARD_WIDTH / 2, DECK_Y - CARD_HEIGHT / 2));

        card.flags.parentSlot = i;

        (async () => {
            await card.scale(k.vec2(0, 1.5), 1 / 8, k.easings.easeInSine);
            card.obj.sprite = "jokers";
            // card.obj.frame = k.randi(0, 10);
            await card.scale(k.vec2(1.5, 1.5), 1 / 8, k.easings.easeOutExpo);
        })()

        await hand.addCard(card)

        const focus = async () => {
            card.fade(k.rgb(200, 200, 200), 0.5, k.easings.easeOutExpo);
        };

        const unfocus = async () => {
            card.fade(k.rgb(255, 255, 255), 0.5, k.easings.easeOutExpo);
        }

        // this is a really bad workaround - i don't want to have to do the math while it's hovering. but it's fine for now
        card.obj.onHoverUpdate(async () => {
            if (gameFlags.currentlyHovering) {
                if (gameFlags.currentlyHovering === card) {
                    return;
                } else if (card.obj.z > gameFlags.currentlyHovering.obj.z) {
                    gameFlags.currentlyHovering = card;
                    await focus();
                } else {
                    await unfocus();
                }
            } else {
                gameFlags.currentlyHovering = card;
                await focus();
            }
        });

        card.obj.onHoverEnd(async () => {
            if (gameFlags.currentlyHovering === card) {
                gameFlags.currentlyHovering = null;
            }

            await unfocus();
        });
    }

    k.onMousePress(async (mouse) => {
        const selectedCard = gameFlags.currentlyHovering;

        if (!selectedCard) return;

        const pos = k.mousePos();

        if (!selectedCard.obj.hasPoint(pos)) return;

        gameFlags.mouseHolding = selectedCard;

    });

    k.onMouseMove(async (mouse, delta) => {
        if (!gameFlags.mouseHolding) return;

        if (gameFlags.mouseHolding.obj.tags.includes("dragging")) {
            gameFlags.mouseHolding.obj.pos = mouse;
            await gameFlags.mouseHolding.rotate(delta.x / 2, 0.15, k.easings.easeOutExpo)
            
            return;
        } else {
            gameFlags.mouseHolding.obj.tag("dragging");
            gameFlags.mouseHolding.obj.pos = mouse;

            await gameFlags.mouseHolding.rotate(delta.x / 2, 0.15, k.easings.easeOutExpo);
        }
    });

    let bouncer = false;
    const click = async () => {
        if (bouncer) return;
        const card = gameFlags.currentlyHovering;
        if (!card) return;

        bouncer = true;

        if (card.flags.selected) {
            card.flags.selected = false;

            await card.move(card.obj.pos.x, DECK_Y - CARD_HEIGHT, 0.5, k.easings.easeOutExpo);
        } else {
            card.flags.selected = true;

            await card.move(card.obj.pos.x, DECK_Y - CARD_HEIGHT - 50, 0.5, k.easings.easeOutExpo);
        }

        bouncer = false;
    }

    k.onMouseRelease(async (mouse) => {
        if (!gameFlags.mouseHolding) return;

        if (gameFlags.mouseHolding.obj.tags.includes("dragging")) {
            gameFlags.mouseHolding.obj.untag("dragging");
            gameFlags.mouseHolding = null;

            await hand.moveCards();
        } else {
            gameFlags.mouseHolding = null;
            await click();
        }
    });

    discardButton.onClick(async () => {
        if (gameFlags.remainingDiscards <= 0) {
            discardButton.color = k.rgb(97, 97, 97);
            return;
        }
        gameFlags.remainingDiscards--;

        const selectedCards = hand.cards.filter((card) => card.flags.selected);

        for (const oldCard of selectedCards) {
            console.log("discarding", oldCard.joker);

            await hand.removeCard(oldCard, drawPile.pos);

            const card = new Card(randomJoker().name, k.vec2(DECK_X - CARD_WIDTH / 2, DECK_Y - CARD_HEIGHT / 2));

            card.flags.parentSlot = oldCard.flags.parentSlot;

            (async () => {
                await card.scale(k.vec2(0, 1.5), 1 / 8, k.easings.easeInSine);
                card.obj.sprite = "jokers";
                // card.obj.frame = k.randi(0, 10);
                await card.scale(k.vec2(1.5, 1.5), 1 / 8, k.easings.easeOutExpo);
            })()

            await hand.addCard(card, card.flags.parentSlot);

            const focus = async () => {
                card.fade(k.rgb(200, 200, 200), 0.5, k.easings.easeOutExpo);
            };

            const unfocus = async () => {
                card.fade(k.rgb(255, 255, 255), 0.5, k.easings.easeOutExpo);
            }

            // this is a really bad workaround - i don't want to have to do the math while it's hovering. but it's fine for now
            card.obj.onHoverUpdate(async () => {
                if (gameFlags.currentlyHovering) {
                    if (gameFlags.currentlyHovering === card) {
                        return;
                    } else if (card.flags.parentSlot > gameFlags.currentlyHovering.flags.parentSlot) {
                        gameFlags.currentlyHovering = card;
                        await focus();
                    } else {
                        await unfocus();
                    }
                } else {
                    gameFlags.currentlyHovering = card;
                    await focus();
                }
            });

            card.obj.onHoverEnd(async () => {
                if (gameFlags.currentlyHovering === card) {
                    gameFlags.currentlyHovering = null;
                }

                await unfocus();
            });

            let bouncer = false;
            const click = async () => {
                if (bouncer) return;
                bouncer = true;

                if (card.flags.selected) {
                    card.flags.selected = false;

                    await card.move(card.obj.pos.x, card.obj.pos.y + 50, 0.5, k.easings.easeOutExpo);
                } else {
                    card.flags.selected = true;

                    await card.move(card.obj.pos.x, card.obj.pos.y - 50, 0.5, k.easings.easeOutExpo);
                }

                bouncer = false;
            }

            card.onClick(async () => {
                if (card === gameFlags.currentlyHovering) {
                    await click();
                }
            });
        }
    })

    playHandButton.onClick(async () => {
        const selectedCards = hand.cards.filter((card) => card.flags.selected);

        k.tween(
            k.rgb(66, 118, 98),
            k.rgb(188, 2, 2),
            1.5,
            (val) => {
                if (!bg.uniform) return;
                c1 = val;
            },
            k.easings.easeInOutSine
        ).onEnd(() => {
            gameFlags.playHand = true;
        })
        k.tween(
            k.rgb(50, 100, 79),
            k.rgb(72, 25, 25),
            1.5,
            (val) => {
                if (!bg.uniform) return;
                c2 = val;
            },
            k.easings.easeInOutSine
        )
        k.tween(
            k.rgb(36, 123, 71),
            k.rgb(96, 2, 2),
            1.5,
            (val) => {
                if (!bg.uniform) return;
                c3 = val;
            },
            k.easings.easeInOutSine
        )

        let i = -1;
        for (const card of selectedCards) {
            i++;
            console.log("playing", card.joker);

            await hand.removeCard(card, drawPile.pos, false);

            const LMARG = LEFT + INFOBAR_WIDTH + BIG_SPACER * 2;

            const CALCULATED_SPACER = (k.width() - LMARG - CARD_WIDTH * selectedCards.length - BIG_SPACER * 2) / (selectedCards.length - 1);

            card.move(
                LMARG + (i * (CARD_WIDTH + CALCULATED_SPACER)) + CARD_WIDTH / 2,
                TOP + SPACER + CARD_HEIGHT,
                1 / 4,
                k.easings.easeOutExpo
            )

            card.rotate(
                0,
                1 / 4,
                k.easings.easeOutExpo
            )
        }
    })
});

k.go("balatroui");
// k.go("cards");