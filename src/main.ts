import { Card, CARD_HEIGHT, CARD_WIDTH, createCard, randomJoker } from "./card";
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

k.scene("balatroui", () => {
    const bg = k.add([
        k.color(35, 15, 15),
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.area(),

        k.z(-2),
        
        k.shader("balatro", () => ({
            iTime: k.time(),
            iResolution: k.vec2(5, 5),
            SET_COLOR_1: k.rgb(66, 118, 98),
            SET_COLOR_2: k.rgb(50, 100, 79),
            SET_COLOR_3: k.rgb(36, 123, 71),
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
        k.drawRect({
            width: BUTTON_WIDTH,
            height: BUTTON_HEIGHT,

            pos: k.vec2(DISCARD_BUTTON_X, BOTTOM),

            radius: 10,

            color: k.rgb(186, 56, 56),

            anchor: "botright",
        });
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
        k.drawRect({
            width: 144,
            height: 48,
            pos: k.vec2(PLAY_HAND_BUTTON_X, BOTTOM),

            radius: 10,

            color: k.rgb(56, 138, 186),

            anchor: "botleft"
        });        
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
   
    const drawPile = k.add([
        k.sprite("backs", {
            frame: 0,
        }),
        k.anchor("botright"),
        k.pos(DECK_X, DECK_Y),
        k.area(),
        k.scale(1.25),
    ]);

    const flags = {
    };
    const hand = [];

    drawPile.onClick(async () => {
        let currentlyHovering: Card | null = null;

        for (let i = 0; i < 7; i++) {
            const card = new Card("Joker", k.vec2(DECK_X - CARD_WIDTH/2, DECK_Y - CARD_HEIGHT/2));

            card.flags.parentSlot = i;

            await Promise.all([
                card.move(
                    LEFT + INFOBAR_WIDTH + BIG_SPACER + (i * (CARD_WIDTH - 8)) + 16 + CARD_WIDTH/2, 
                    BOTTOM - BUTTON_HEIGHT - SPACER + (i - 3)**2 - CARD_HEIGHT/2,
                    0.5,
                    k.easings.easeOutExpo
                ),
                card.rotate((i - 3.5)*2, 0.5, k.easings.easeOutExpo),
                (async () => {
                    await card.scale(k.vec2(0, 1.5), 0.25, k.easings.easeInSine);
                    card.obj.sprite = "jokers";
                    // card.obj.frame = k.randi(0, 10);
                    await card.scale(k.vec2(1.5, 1.5), 0.25, k.easings.easeOutExpo);

                    return true;
                })()
            ])

            const focus = async () => {
                card.fade(k.rgb(200, 200, 200), 0.5, k.easings.easeOutExpo);
            };

            const unfocus = async () => {  
                card.fade(k.rgb(255, 255, 255), 0.5, k.easings.easeOutExpo);
            }

            // this is a really bad workaround - i don't want to have to do the math while it's hovering. but it's fine for now
            card.obj.onHoverUpdate(async () => {
                if (currentlyHovering) {
                    if (currentlyHovering === card) {
                        return;                
                    } else if (card.flags.parentSlot > currentlyHovering.flags.parentSlot) {
                        currentlyHovering = card;
                        await focus();
                    } else {
                        await unfocus();
                    }
                } else {
                    currentlyHovering = card;
                    await focus();
                }
            });

            card.obj.onHoverEnd(async () => {
                if (currentlyHovering === card) {
                    currentlyHovering = null;
                }

                await unfocus();
            });

            const click = async () => {
                if (card.flags.selected) {
                    card.flags.selected = false;

                    await card.move(card.obj.pos.x, card.obj.pos.y + 50, 0.5, k.easings.easeOutExpo);
                } else {
                    card.flags.selected = true;

                    await card.move(card.obj.pos.x, card.obj.pos.y - 50, 0.5, k.easings.easeOutExpo);
                }
            }

            card.onClick(async () => {
                console.log('click!');

                if (card === currentlyHovering) {
                    await click();
                }
            });
        }
    });

});

k.go("balatroui");
// k.go("cards");