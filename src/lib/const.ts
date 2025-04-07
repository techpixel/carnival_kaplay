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