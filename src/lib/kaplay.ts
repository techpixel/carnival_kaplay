import kaplay, { Vec2 } from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

export const k = kaplay({
    width: 1000, 
    height: 600,
    crisp: false,
    letterbox: true,
    background: [0, 0, 0, 0],
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

k.loadSprite("jokers", "/sprites/jokers.png", {
    sliceX: 10,
    sliceY: 16,
})

k.loadSprite("backs", "/sprites/backs.png", {
    sliceX: 7,
    sliceY: 5,
})

k.loadSprite("lines", "/sprites/lines.png");

k.loadFont("font", "/fonts/m6x11.ttf");

k.loadShader(
    "balatro",
    null,
`#define SPIN_ROTATION -2.0
#define SPIN_SPEED 2.0
#define OFFSET vec2(0.0)
#define COLOUR_1 vec4(0.40784313725490196, 0.6729411764705884, 0.5607843137254902, 1.0)
#define COLOUR_2 vec4(0.21960784313725487, 0.3623529411764706, 0.30196078431372547, 1.0)
#define COLOUR_3 vec4(0.2823529411764706, 0.4658823529411765, 0.38823529411764707, 1.0)
#define CONTRAST 1.0
#define LIGTHING 0.0
#define SPIN_AMOUNT 0.0
#define PIXEL_FILTER 745.0
#define SPIN_EASE 0.5
#define PI 3.14159265359
#define IS_ROTATE false

#define SCALE 2.0
#define DARKEN 0.65
#define SATURATION 0.9

uniform float iTime;
uniform vec2 iResolution;

vec4 saturateColor(vec4 color) {
    float gray = 0.2989 * color.r + 0.5870 * color.g + 0.1140 * color.b;
    vec3 saturated = -gray * SATURATION + color.rgb * (1.0 + SATURATION);
    return vec4(clamp(saturated, 0.0, 1.0), color.a);
}

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
    vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
    float uv_len = length(uv);
    
    float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
    if(IS_ROTATE){
       speed = iTime * speed;
    }
    speed += 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
    vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
    uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
    
    uv *= 30.;
    speed = iTime*(SPIN_SPEED);
    vec2 uv2 = vec2(uv.x+uv.y);
    
    for(int i=0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
        uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
    }
    
    float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
    float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
    float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
    float c2p = max(0.,1. - contrast_mod*abs(paint_res));
    float c3p = 1. - min(1., c1p + c2p);
    float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
    vec4 color = (0.3/CONTRAST)*COLOUR_1 + (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a));
    
    return saturateColor(color);
}

vec4 frag(vec2 pos, vec2 uva, vec4 color, sampler2D tex) {
    vec2 uv = pos/iResolution.xy;
    
    return effect(iResolution.xy, uv * iResolution.xy * vec2(SCALE, SCALE)) * vec4(DARKEN, DARKEN, DARKEN, 1.0);
}
`
)

// export let c1 = k.rgb(0, 46, 139);
// export let c2 = k.rgb(0, 21, 255);
// export let c3 = k.rgb(32, 0, 192);
export let c = [
    k.rgb(0, 46, 139),
    k.rgb(0, 21, 255),
    k.rgb(32, 0, 192),
]

export const bg = k.add([
    k.color(35, 15, 15),
    k.rect(k.width(), k.height()),
    k.pos(0, 0),
    k.area(),

    k.z(-3),

    k.shader("balatro", () => ({
        iTime: k.time(),
        iResolution: k.vec2(5, 5),
        SET_COLOR_1: c[0],
        SET_COLOR_2: c[1],
        SET_COLOR_3: c[2],
    }))
]);