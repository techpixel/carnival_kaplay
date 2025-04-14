import { CharTransform, CharTransformFunc } from "kaplay";
import { k } from "./kaplay";

export const HEIGHT = k.height();
export const WIDTH = k.width();

// Card

export const CARD_WIDTH = 71;
export const CARD_HEIGHT = 95;

// Spacers

export const BIG_SPACER = 56;
export const SPACER = 24;

// Margins

export const TOP_MARGIN = 32;
export const BOTTOM_MARGIN = 32;
export const LEFT_MARGIN = 32;
export const RIGHT_MARGIN = 24;

export const TOP = TOP_MARGIN;
export const BOTTOM = HEIGHT - BOTTOM_MARGIN;
export const LEFT = LEFT_MARGIN;
export const RIGHT = WIDTH - RIGHT_MARGIN;

// Info Bar

export const INFOBAR_WIDTH = 240;
export const INFOBAR_HEIGHT = WIDTH;

// Buttons

export const BUTTON_WIDTH = 144;
export const BUTTON_HEIGHT = 48;

export const BUTTON_SPACING = (WIDTH - LEFT - INFOBAR_WIDTH - BUTTON_WIDTH * 2 - BIG_SPACER) / 2;

export const DISCARD_BUTTON_X = LEFT + INFOBAR_WIDTH + BUTTON_SPACING + BUTTON_WIDTH;

export const PLAY_HAND_BUTTON_X = LEFT + INFOBAR_WIDTH + BUTTON_SPACING + BUTTON_WIDTH + BIG_SPACER;

// Hand

export const HAND_WIDTH = 480 + BIG_SPACER * 2;
export const HAND_HEIGHT = CARD_HEIGHT * 1.5;

export const HAND_SPACING = (WIDTH - LEFT - INFOBAR_WIDTH - HAND_WIDTH) / 2;

export const HAND_X = LEFT + INFOBAR_WIDTH + HAND_SPACING;
export const HAND_Y = BOTTOM - BUTTON_HEIGHT - BIG_SPACER;

// Deck

export const DECK_X = RIGHT + CARD_WIDTH + SPACER;
export const DECK_Y = BOTTOM + CARD_HEIGHT + SPACER;

export const ACCENT_COLOR = k.rgb(1, 59, 91);
export const BG_COLOR = k.rgb(20, 34, 37);

export function balatroTextAnim(len: number = 8): CharTransformFunc {
    return (idx: number, ch: string) => {
        return {
            angle: Math.sin((k.time() + idx) / 2) * 1.5 + (idx - (len / 2)),
            pos: k.vec2(0, Math.sin((k.time() + idx)) + 1.5),
        } as CharTransform
    }
}

export function fourCharacterLift(i: number): CharTransformFunc {
    return (idx: number, ch: string) => {
        // use a function like
        // sin((k.time() + idx) / 2)^i
        // lift the first character of four

        const lift = -i * Math.sin(1/2 * Math.PI / 2 * (k.time() * -0.75 + idx)) ** 32 + 1;

        return {
            angle: 0,
            pos: k.vec2(0, lift),
        } as CharTransform
    }
}