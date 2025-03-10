import { time } from "console";
import { k } from "./kaplay";
import { Vec2, TweenController, MouseButton, Color } from "kaplay";

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
        k.z(0),
        // "card",
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
    // public animId: number = 0;
    // public anims: { [id: number]: TweenController } = {};

    async push(anim: TweenController): Promise<void> {
        // const newId = this.animId++;

        // this.anims[newId] = anim;

        return new Promise((resolve) => {
            anim.onEnd(() => {
                // delete this.anims[newId];
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

        selected: false,

        parentSlot: 0,
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
                k.vec2(x, y),
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

        return this.anims.push(
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