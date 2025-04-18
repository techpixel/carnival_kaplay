import { Button, Card, Game, Hand, randomJoker, Tutorial } from "./lib/card";
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
    CARD_WIDTH,
} from "./lib/const";

import { 
    k,
    c,
    bg,
} from "./lib/kaplay";
import { API } from "./lib/api";
import { text } from "stream/consumers";

k.scene("game", async () => {
    k.add(bg);
    c[0] = k.rgb(66, 118, 98);
    c[1] = k.rgb(50, 100, 79);
    c[2] = k.rgb(36, 123, 71);

    const loading = k.add([
        k.pos(k.width() / 2, k.height() / 2),
        k.rect(1, 1),
        k.scale(1500),
        k.color(c[2]),
        k.z(10),
        k.anchor("center"),
        k.rotate(-15),
        k.timer(),
    ])

    const game = new Game();

    const userFlags = await API.user();
    console.log("user flags", userFlags);

    game.flags.remainingDiscards = userFlags.discards;

    const playerHand = game.hand;    

    const discardButton = new Button(
        game,
        'discard',
        k.rgb(186, 56, 56),
        k.vec2(DISCARD_BUTTON_X, BOTTOM),
    );

    const playHandButton = new Button(
        game,
        'stage hand',
        k.rgb(56, 138, 186),
        k.vec2(PLAY_HAND_BUTTON_X + BUTTON_WIDTH, BOTTOM),
    );

    k.add([k.z(-1)]).onDraw(() => {
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
            pos: k.vec2(WIDTH - LEFT_MARGIN - 30 - INFOBAR_WIDTH, BIG_SPACER * 4 + SPACER / 2),
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

    loading.tween(
        loading.scale,
        k.vec2(0),
        1.5,
        (val) => {
            loading.scale = val;
        },
        k.easings.linear
    ).onEnd(() => {
        loading.z = -10;
    })
    await k.wait(0.75);

    const tutorial = game.tutorial;

    const handData = await API.hand();
    const drawHand = handData.hand;
    
    console.log("draw hand", drawHand);

    if (handData.action === "existing_hand") {
        // don't do the draw animation
        await playerHand.addCardsDirectly(drawHand.map(joker => {
            const card = new Card(
                game, 
                joker, 
                k.vec2(DECK_X - CARD_WIDTH / 2, DECK_Y - CARD_HEIGHT / 2)
            );

            card.obj.sprite = "jokers";
            // card.obj.frame = k.randi(0, 10);

            return card;
        }));
    } else {        // draw the hand
        for (const joker of drawHand) {
            const card = new Card(
                game, 
                joker, 
                k.vec2(DECK_X - CARD_WIDTH / 2, DECK_Y - CARD_HEIGHT / 2)
            );

            Promise.all([
                (async () => {
                    await card.scale(k.vec2(0, 1.5), 1 / 8, k.easings.easeInSine);

                    card.obj.sprite = "jokers";
                    // card.obj.frame = k.randi(0, 10);

                    await card.scale(k.vec2(1.5, 1.5), 1 / 8, k.easings.easeOutExpo);
                })(),
                playerHand.addCard(card)
            ])

            await k.wait(0.1)
        }
    }

    if (game.flags.tutorial) await tutorial.start();

    discardButton.onClick(async () => {
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

    let error: string[] = [
        "need 4 cards!",
        "lol",
        "mayhaps no",
        "you wish"
    ]

    let readyToPlay = false;
    playHandButton.onClick(async () => {
        // if (game.table.cards.length !== 4) {
        //     playHandButton.text = error[k.randi(0, error.length)];

        //     return;
        // };

        if (!readyToPlay) {
            readyToPlay = true;
            playHandButton.text = "r u sure?";
            return;
        }

        playHandButton.text = "okie";
        playHandButton.disable();
        discardButton.disable();
        
        await k.wait(0.5);

        for (const card of game.hand.cards) {
            await card.discard();
        }

        await k.wait(0.3);

        await game.shop.moveUp();

        const data = await API.play(game.table.cards.map(card => card.joker.instance_id));

        game.shop.art.push(() => {
            k.drawText({
                text: "your prompt is:",
                size: 20,
                pos: k.vec2(20, -400 + 20),
                color: k.rgb(255, 255, 255),
                font: "font",
                // transform: (idx: number, ch: string) => {              
                //     // scale every 4th character
                //     const y = (Math.sin(idx / 1.3 + k.time()/2) ** 20) * -2;
                    
                //     return {
                //         pos: k.vec2(0, y)
                //     }
                // },
            });
        })

        await k.wait(0.3);

        let text = "";

        let initTime = k.time();
        game.shop.art.push(() => {
            k.drawText({
                text: text,
                size: 20,
                pos: k.vec2(20, -400 + 48),
                color: k.rgb(255, 255, 255),
                font: "font",
                width: HAND_WIDTH - 40,
            });
        });

        for (const char of data) {
            text += char;

            await k.wait(0.005);
        }

        const readyToShipButton = new Button(
            game,
            'ready to ship',            
            k.rgb(38, 112, 215),
            k.vec2(LEFT_MARGIN + INFOBAR_WIDTH + (WIDTH - LEFT_MARGIN - INFOBAR_WIDTH)/2 + BUTTON_WIDTH/2, BOTTOM - 8),
        );
        
        readyToShipButton.obj.onClick(async () => {
            loading.z = 100;

            loading.tween(
                loading.scale,
                k.vec2(1500),
                1.5,
                (val) => {
                    loading.scale = val;
                },
                k.easings.linear
            )
            //redirect
        });

        readyToShipButton.obj.z = 20;

        const pulseOn = k.rgb(38, 112, 215);
        const pulseOff = k.rgb(63, 171, 207);
        readyToShipButton.obj.onUpdate(() => {
            // loop between the two colors
            readyToShipButton.obj.color = k.lerp(
                pulseOff,
                pulseOn,
                Math.abs(Math.sin(k.time() * 2))
            );
        });
    })
});
