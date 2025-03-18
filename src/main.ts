import { Vec2 } from "kaplay";
import { Button, Card, Game, Hand, randomJoker } from "./lib/card";
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
    HAND_Y,
    CARD_HEIGHT,
    CARD_WIDTH
} from "./lib/const";

import { 
    k,
    c,
    bg,
} from "./lib/kaplay";
import { API } from "./lib/api";

k.scene("balatroui", async () => {
    k.add(bg);
    c[0] = k.rgb(66, 118, 98);
    c[1] = k.rgb(50, 100, 79);
    c[2] = k.rgb(36, 123, 71);

    const game = new Game();
    const playerHand = game.hand;    

    const discardButton = new Button(
        game,
        'discard',
        k.rgb(186, 56, 56),
        k.vec2(DISCARD_BUTTON_X, BOTTOM),
    );

    const playHandButton = new Button(
        game,
        'play hand',
        k.rgb(56, 138, 186),
        k.vec2(PLAY_HAND_BUTTON_X + BUTTON_WIDTH, BOTTOM),
    );

    k.onDraw(() => {
        //info bar
        k.drawRect({
            width: INFOBAR_WIDTH,
            height: INFOBAR_HEIGHT,
            pos: k.vec2(LEFT, 0),

            color: k.rgb(0, 0, 0),
            opacity: 0.25,
        });

        if (game.flags.currentlyHovering) {
            const currentCard = game.flags.currentlyHovering;
            const cardData = game.flags.currentlyHovering.joker;

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
            text: `remaining discards: ${game.flags.remainingDiscards}`,
            size: 24,
            width: INFOBAR_WIDTH,
            pos: k.vec2(LEFT + INFOBAR_WIDTH, BOTTOM - BIG_SPACER),
            color: k.rgb(255, 68, 68),
            anchor: "botright",
            align: "center",
            font: "font",
        });

        // card hand amt
        k.drawText({
            text: `${game.hand.cards.length}/7`,
            size: 16,
            width: BUTTON_WIDTH - 24,
            pos: k.vec2(WIDTH - LEFT_MARGIN - 30 - INFOBAR_WIDTH, discardButton.pos.y - 24),
            color: k.rgb(255, 255, 255),
            anchor: "right",
            align: "center",
            font: "font",
            scale: 1.5
        });

        // table hand amt
        k.drawText({
            text: `${game.table.cards.length}/4`,
            size: 16,
            width: BUTTON_WIDTH - 24,
            pos: k.vec2(WIDTH - LEFT_MARGIN - 30 - INFOBAR_WIDTH, BIG_SPACER * 5),
            color: k.rgb(255, 255, 255),
            anchor: "right",
            align: "center",
            font: "font",
            scale: 1.5
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

    const drawHand = await API.drawHand();
    console.log("draw hand", drawHand);

    for (const joker of drawHand) {
        const card = new Card(
            game, 
            joker, 
            k.vec2(DECK_X - CARD_WIDTH / 2, DECK_Y - CARD_HEIGHT / 2)
        );

        (async () => {
            await card.scale(k.vec2(0, 1.5), 1 / 8, k.easings.easeInSine);
            card.obj.sprite = "jokers";
            // card.obj.frame = k.randi(0, 10);
            await card.scale(k.vec2(1.5, 1.5), 1 / 8, k.easings.easeOutExpo);
        })()

        await playerHand.addCard(card)
    }

    discardButton.obj.onClick(async () => {
        if (game.flags.remainingDiscards <= 1) {
            discardButton.disable();
            return;
        }
        game.flags.remainingDiscards--;

        const selectedCards = playerHand.cards.filter((card) => card.flags.selected);

        const newCards = await API.discard(selectedCards.map(card => card.joker.instance_id));
        console.log("new cards", newCards);

        for (const oldCard of selectedCards) {
            console.log("discarding", oldCard.joker);

            playerHand.destroyCard(oldCard, k.vec2(DECK_X, DECK_Y));
        }

        for (const newCard of newCards) {
            const card = new Card(game, newCard, k.vec2(DECK_X - CARD_WIDTH / 2, DECK_Y - CARD_HEIGHT / 2));

            (async () => {
                await card.scale(k.vec2(0, 1.5), 1 / 8, k.easings.easeInSine);
                card.obj.sprite = "jokers";
                // card.obj.frame = k.randi(0, 10);
                await card.scale(k.vec2(1.5, 1.5), 1 / 8, k.easings.easeOutExpo);
            })()

            await playerHand.addCard(card);
        }
    })

    let cardsInPlay: Card[] = [];
    playHandButton.obj.onClick(async () => {
        cardsInPlay = playerHand.cards.filter((card) => card.flags.selected);

        if (cardsInPlay.length !== 4) return;

        k.tween(
            k.rgb(66, 118, 98),
            k.rgb(188, 2, 2),
            1.5,
            (val) => {
                if (!bg.uniform) return;
                c[0] = val;
            },
            k.easings.easeInOutSine
        ).onEnd(() => {
            game.flags.playHand = true;
        })
        k.tween(
            k.rgb(50, 100, 79),
            k.rgb(72, 25, 25),
            1.5,
            (val) => {
                if (!bg.uniform) return;
                c[1] = val;
            },
            k.easings.easeInOutSine
        )
        k.tween(
            k.rgb(36, 123, 71),
            k.rgb(96, 2, 2),
            1.5,
            (val) => {
                if (!bg.uniform) return;
                c[2] = val;
            },
            k.easings.easeInOutSine
        )

        for (const card of playerHand.cards) {
            if (card.flags.selected) continue;

            k.tween(
                card.obj.pos.y,
                800,
                3,
                (val) => {
                    card.obj.pos.y = val;
                },
                k.easings.easeInOutBack
            )
        }

        let i = -1;
        for (const card of cardsInPlay) {
            i++;
            await playerHand.removeCard(card);

            const LMARG = LEFT + INFOBAR_WIDTH + BIG_SPACER * 2;

            const CALCULATED_SPACER = (k.width() - LMARG - CARD_WIDTH * cardsInPlay.length - BIG_SPACER * 2) / (cardsInPlay.length - 1);

            card.move(
                LMARG + (i * (CARD_WIDTH + CALCULATED_SPACER)) + CARD_WIDTH / 2,
                TOP + SPACER + CARD_HEIGHT,
                1 / 4,
                k.easings.easeOutExpo
            )

            card.flags.anchor = k.vec2(LMARG + (i * (CARD_WIDTH + CALCULATED_SPACER)) + CARD_WIDTH / 2, TOP + SPACER + CARD_HEIGHT);
            card.flags.anchorRot = 0;

            card.rotate(
                0,
                1 / 4,
                k.easings.easeOutExpo
            )

            k.onMouseMove((pos) => {
                // swap card anchors as the card is being dragged
                if (!game.flags.mouseHolding) return;

                const selectedCard = game.flags.mouseHolding;
                if (!selectedCard) return;

                for (const card of cardsInPlay) {
                    if (selectedCard.obj.pos.x > card.obj.pos.x) {
                        if (cardsInPlay.indexOf(selectedCard) < cardsInPlay.indexOf(card)) {
                            const selectedCardIndex = cardsInPlay.indexOf(selectedCard);
                            const cardIndex = cardsInPlay.indexOf(card);

                            cardsInPlay[selectedCardIndex] = card;
                            cardsInPlay[cardIndex] = selectedCard;

                            //recalculate anchors
                            let i = -1;

                            for (const card of cardsInPlay) {
                                i++;

                                const LMARG = LEFT + INFOBAR_WIDTH + BIG_SPACER * 2;

                                const CALCULATED_SPACER = (k.width() - LMARG - CARD_WIDTH * cardsInPlay.length - BIG_SPACER * 2) / (cardsInPlay.length - 1);

                                card.flags.anchor = k.vec2(LMARG + (i * (CARD_WIDTH + CALCULATED_SPACER)) + CARD_WIDTH / 2, TOP + SPACER + CARD_HEIGHT);
                                card.flags.anchorRot = 0;

                                if (card === selectedCard) continue;

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

                            break;
                        }
                    }

                    if (selectedCard.obj.pos.x < card.obj.pos.x) {
                        if (cardsInPlay.indexOf(selectedCard) > cardsInPlay.indexOf(card)) {
                            const selectedCardIndex = cardsInPlay.indexOf(selectedCard);
                            const cardIndex = cardsInPlay.indexOf(card);

                            cardsInPlay[selectedCardIndex] = card;
                            cardsInPlay[cardIndex] = selectedCard;

                            //recalculate anchors
                            let i = -1;

                            for (const card of cardsInPlay) {
                                i++;

                                const LMARG = LEFT + INFOBAR_WIDTH + BIG_SPACER * 2;

                                const CALCULATED_SPACER = (k.width() - LMARG - CARD_WIDTH * cardsInPlay.length - BIG_SPACER * 2) / (cardsInPlay.length - 1);

                                card.flags.anchor = k.vec2(LMARG + (i * (CARD_WIDTH + CALCULATED_SPACER)) + CARD_WIDTH / 2, TOP + SPACER + CARD_HEIGHT);
                                card.flags.anchorRot = 0;

                                if (card === selectedCard) continue;

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

                            break;
                        }
                    }
                }
            })
        }
    })
});
