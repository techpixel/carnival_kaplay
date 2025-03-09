import { time } from "console";
import { k } from "./kaplay";
import { KAPLAYCtx, Vec2, TweenController, MouseButton } from "kaplay";

import cardData from './cards.json';

export const CARD_WIDTH = 71;
export const CARD_HEIGHT = 95;

export function createCard(pos: Vec2) {
    return k.add([
        k.sprite("backs", {
            frame: 0
        }),
        k.scale(1.25),
        k.pos(pos),
        k.rotate(0),
        k.area(),
        k.color(),
        k.timer(),
        k.anchor("center"),
        "card",
    ]);
}

export function randomJoker() {
    const card = cardData.cards[Math.floor(Math.random() * cardData.cards.length)];
    return card;
}

/*

Pretty much:
- i want to allow multiple animations to be queued or run at the same time
- i want to be able to wait for an animation to finish before doing something else
- i want to be able to stop a playing animation

*/
export class AnimationManager {
    public animId: number = 0;
    public anims: { [id: number]: TweenController } = {};

    async push(anim: TweenController): Promise<void> {
        const newId = this.animId++;

        this.anims[newId] = anim;


        return new Promise((resolve) => {
            anim.onEnd(() => {
                delete this.anims[newId];
                resolve();
            });
        });
    }
}

export class Card {
    public obj: ReturnType<typeof createCard>;

    public flags = {
        animLock: false,
        active: false, // card can be used in the game space

        flipped: false,
        held: false,
        location: "draw" as "draw" | "deck"
    };

    public anims: AnimationManager = new AnimationManager();

    constructor(
        public card: string,
        pos: Vec2,
    ) {
        this.obj = createCard(pos);
    }

    async move(x: number, y: number, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        return this.anims.push(
            this.obj.tween(
                this.obj.pos,
                k.vec2(x + CARD_WIDTH/2, y - CARD_HEIGHT/2),
                time,
                (val) => this.obj.pos = val,
                easing,
            )
        );
    }

    async scale(scale: Vec2, time = 1, easing = k.easings.easeOutSine): Promise<void> {
        return this.anims.push(
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
        return this.anims.push(
            this.obj.tween(
                this.obj.angle,
                angle,
                time,
                (val) => this.obj.angle = val,
                easing,
            )
        );
    }

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
            if (!this.flags.active) return;

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