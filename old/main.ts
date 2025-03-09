import { k } from "./kaplay";
import { Card } from "./card";

import cardData from './cards.json';

const cardNames = Object.keys(cardData.themes);


let numOfCards = 4;
let cardWidth = 71;
let cardSpacer = (400 - cardWidth * numOfCards) / (numOfCards - 1);
let lock = false;

let usedCards: string[] = [];

function randomCard(): string {
    if (usedCards.length === cardNames.length) {
        usedCards = [];
    }

    const selRandomCard = cardNames[Math.floor(Math.random() * cardNames.length)];

    if (!usedCards.includes(selRandomCard)) {
        usedCards.push(selRandomCard);
        return selRandomCard;
    } else {
        return randomCard();
    }
}

k.scene("cards", async () => {
    const bg = k.add([
        k.color(35, 15, 15),
        k.rect(k.width(), k.height()),
        k.layer("bg"),
        k.pos(0, 0),
    ]);

    const text = k.add([
        k.text(""),
        k.pos(50, 50),
        k.layer("ui"),
        k.scale(0.75)
    ]);

    const desc = k.add([
        k.text("Click a card to see its theme", {
            width: 750
        }),
        k.pos(50, 100),
        k.layer("ui"),
        k.scale(0.5),
        k.color(200, 200, 200),
    ]);

    async function cardRound(bvb: number) {
        let cards: Card[] = [];

        if (bvb > 400) { return }
    
        for (let i = 0; i < numOfCards; i++) {
            let x = 125 + i * (cardWidth + cardSpacer);
    
            const newCard = new Card("theme", randomCard());
            cards.push(newCard);
    
            await Promise.all([
                newCard.move(new k.Vec2(x, 300)),
                newCard.rotate(k.rand(-45, 45))
            ]);
    
            newCard.onHover(async () => {       
                text.text = newCard.card;
                desc.text = cardData.themes[newCard.card].description;
    
                if (newCard.flipping) return;
                if (newCard.flipped) {
                    newCard.scale(new k.Vec2(2, 2));
                    return;
                }
    
                newCard.flipCard();
                newCard.rotate(0);
            });
    
            newCard.onHoverEnd(() => {
                if (newCard.flipping) return;
    
                text.text = "";
                desc.text = "";
    
                newCard.scale(new k.Vec2(1.5, 1.5));
            });
    
            newCard.onClick(() => {
                if (lock) return;
                lock = true;
                
                newCard.move(new k.Vec2(bvb, 500));
                text.text = newCard.card;
    
                for (const card of cards) {
                    if (card === newCard) continue;
                    card.move(new k.Vec2(-100, 300));
                }
    
                k.wait(1, () => {
                    lock = false;
                    cardRound(bvb+100);
                });
            });
        }
    }

    const pile = new Card("pile", "pile");

    let cards: Card[] = [];

    for (let i = 0; i < numOfCards; i++) {
        let x = 125 + i * (cardWidth + cardSpacer);

        const newCard = new Card("theme", randomCard());
        cards.push(newCard);

        await Promise.all([
            newCard.move(new k.Vec2(x, 300)),
            newCard.rotate(k.rand(-45, 45))
        ]);

        newCard.onHover(async () => {       
            text.text = newCard.card;
            desc.text = cardData.themes[newCard.card].description;

            if (newCard.flipping) return;
            if (newCard.flipped) {
                newCard.scale(new k.Vec2(2, 2));
                return;
            }

            newCard.flipCard();
            newCard.rotate(0);
        });

        newCard.onHoverEnd(() => {
            if (newCard.flipping) return;

            text.text = "";
            desc.text = "";

            newCard.scale(new k.Vec2(1.5, 1.5));
        });

        newCard.onClick(() => {
            if (lock) return;
            lock = true;
            
            newCard.move(new k.Vec2(100, 500));
            text.text = newCard.card;

            for (const card of cards) {
                if (card === newCard) continue;
                card.move(new k.Vec2(-100, 300));
            }

            k.wait(1, () => {
                lock = false;
                text.text = "";
                desc.text = "";
                cardRound(200);
            });
        });
    }
});


k.go("cards");