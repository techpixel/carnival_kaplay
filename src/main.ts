import { Card, createCard, discardVec, drawVec, randomJoker } from "./card";
import { k } from "./kaplay";

k.scene("cards", async () => {
    const bg = k.add([
        k.color(35, 15, 15),
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.area(),

        k.z(-2),
        
        // k.shader("balatro", () => ({
        //     iTime: k.time(),
        //     iResolution: k.vec2(1.9,1.9),
        // }))

    ]);

    const uiOverlay = k.add([
        k.rect(600, 600),
        k.pos(0, 0),
        k.z(-1),
        k.color(35, 15, 15),
    ]);
    uiOverlay.hidden = true;
    uiOverlay.onDraw(() => {
        k.drawRect({
            width: 200,
            height: 200,
            color: k.rgb(114, 48, 48),
            pos: k.vec2(400, 0),
        })
        
        k.drawText({
            text: "discard",
            size: 24,
            width: 120,
            pos: k.vec2(410, 10),
            color: k.rgb(238, 163, 142),
        })

        k.drawRect({
            width: 600,
            height: 200,
            color: k.rgb(114, 48, 48),

            pos: k.vec2(0, 400),
        });

        k.drawText({
            text: "deck",
            size: 24,
            width: 120,
            pos: k.vec2(10, 410),
            color: k.rgb(238, 163, 142),
        })
    });

    const drawPile = createCard(drawVec);
    const discardPile = createCard(discardVec);

    const cardTitle = k.add([
        k.text("Cards"),
        k.pos(380, 250),
        
        k.scale(0.5),        
        k.z(-1),
    ]);
    cardTitle.hidden = true;

    const cardDesc = k.add([
        k.text("Click and drag to move the card around. Click on the card to flip it.", {
            width: 600,
        }),
        k.pos(380, 280),
        
        k.scale(0.3),        
        k.z(-1),
    ]);
    cardDesc.hidden = true;

    let deck: Card[] = [];
    let cardOnTable = false;

    drawPile.onClick(async () => {
        if (cardOnTable) return;
        cardOnTable = true;

        const joker = randomJoker();
        
        cardTitle.text = joker.name;
        cardDesc.text = joker.description ?? 'uhm... it does something. probably.';

        const newCard = new Card(joker.name, drawVec);

        await newCard.move(new k.Vec2(300, 300));

        newCard.onHover(async () => {
            if (newCard.flags.animLock) return;

            if (!newCard.flags.flipped) {
                newCard.flags.animLock = true;

                await newCard.scale(new k.Vec2(0, 1.5), 0.5, k.easings.easeInSine);

                newCard.obj.sprite = "jokers";
                newCard.obj.frame = k.randi(0, 10);
                cardTitle.hidden = false;
                cardDesc.hidden = false;

                await newCard.scale(new k.Vec2(2, 2), 0.5, k.easings.easeOutSine);

                if (!newCard.obj.isHovering()) {
                    await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo);
                }

                newCard.flags.animLock = false;
                newCard.flags.flipped = true;
                newCard.flags.active = true;

                return;
            }

            cardTitle.hidden = false;
            cardDesc.hidden = false;            

            await newCard.scale(new k.Vec2(2, 2), 1, k.easings.easeOutExpo);
        });

        newCard.onHoverEnd(async () => {
            cardTitle.hidden = true;
            cardDesc.hidden = true;

            await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo);
        });

        newCard.onMouseDown(async (mouse) => {
            if (!newCard.flags.flipped) return;
            if (!newCard.obj.isHovering()) return;

            const mousePos = k.mousePos();

            uiOverlay.hidden = false;
            cardTitle.hidden = true;
            cardDesc.hidden = true;

            newCard.obj.pos = mousePos;
            
            if (mousePos.x > 400 && mousePos.y < 200) {
                newCard.flags.animLock = true;
   
                newCard.move(discardVec)
                await newCard.scale(new k.Vec2(0, 1.5), 1, k.easings.easeInSine)

                newCard.obj.sprite = "backs"
                newCard.obj.frame = 0;

                await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo)

                newCard.flags.animLock = false;

                newCard.obj.destroy();
                uiOverlay.hidden = true;
                cardOnTable = false;

                return;
            }

            if (mousePos.y > 400) {
                newCard.flags.animLock = true;

                deck.push(newCard);

                const cardWidth = 71;
                const cardSpacer = 10;
                const posDisplacement = cardWidth / 2;

                const deckWidth = deck.length * (cardWidth + cardSpacer) - cardSpacer;
                
                let i = 0;

                console.log((600 - deckWidth)/2);

                for (const card of deck) {
                    card.move(new k.Vec2( 
                        (600 - deckWidth)/2 + (cardWidth + cardSpacer) * i + posDisplacement,
                        500));
                    i++;
                }

                await newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo);

                cardOnTable = false;

                newCard.flags.animLock = false;

                uiOverlay.hidden = true;
                cardOnTable = false;

                return;
            }

            newCard.move(mousePos);
        });

        newCard.onMouseRelease(async (mouse) => {
            if (newCard.flags.animLock) return;
            if (!newCard.flags.flipped) return;
            if (!newCard.obj.isHovering()) return;

            uiOverlay.hidden = true;

            newCard.flags.animLock = true;
            await Promise.all([
                newCard.scale(new k.Vec2(1, 1), 1, k.easings.easeOutExpo),
                newCard.move(new k.Vec2(300, 300))
            ]);
            
            newCard.flags.animLock = false;
        });
    });
});


k.go("cards");