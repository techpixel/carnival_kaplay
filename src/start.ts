import { k, bg, c } from "./lib/kaplay";

import "./main";

let params = new URLSearchParams(document.location.search);
let auth: string | undefined | null = params.get("auth"); 
let user: string | undefined | null = params.get("user"); 

if (auth === 'reset') {
    auth = null;
    document.cookie = ``;
} 

if (auth) {
    document.cookie = `auth=${auth}`;
} else if (user) {
    document.cookie = `user=${user}`;
} else {
    // check if auth is in cookie
    let findCookie = document.cookie.split('; ');

    for (let i = 0; i < findCookie.length; i++) {
        let [key, value] = findCookie[i].split('=');

        if (key === 'auth') {
            auth = value;
        }
        if (key === 'user') {
            user = value;
        }
    }
}

k.scene("start", async () => {
    k.add(bg);

    const text = k.add([
        k.text(">>> S T A R T <<<", {
            font: "font",            
        }),
        k.pos(k.width() / 2, k.height() - 100),
        k.color(255, 255, 255),
        k.anchor("center"),
        k.z(1),
        k.area(),
    ]);

    if (!auth) {
        text.text = "Log In On Slack with /wildcard";
    }

    k.onDraw(() => {
        k.drawText({
            text: "W I L D C A R D",
            font: "font",
            size: 96,
            color: k.rgb(255, 255, 255),
            pos: k.vec2(text.pos.x, k.height() / 2),
            anchor: "center",
        })

        k.drawText({
            text: text.text,
            font: "font",
            letterSpacing: -2.1,
            scale: 1.8,
            size: 24,
            color: k.rgb(0, 0, 0),
            pos: k.vec2(text.pos.x, text.pos.y - 9),
            anchor: "center",
        })
    });

    text.onHover(() => {
        text.color = k.rgb(240, 54, 54);
    })

    text.onHoverEnd(() => {
        text.color = k.rgb(255, 255, 255);
    })

    text.onClick(() => {
        k.tween(
            c[0],
            k.rgb(66, 118, 98),
            1.5,
            (v) => c[0] = v,
            k.easings.easeInSine
        )
        k.tween(
            c[1],
            k.rgb(50, 100, 79),
            1.5,
            (v) => c[1] = v,
            k.easings.easeInSine
        )
        k.tween(
            c[2],
            k.rgb(36, 123, 71),
            1.5,
            (v) => c[2] = v,
            k.easings.easeInSine
        )

        k.tween(
            text.pos.x,
            -1000,
            2,
            (v) => text.pos.x = v,
            k.easings.easeInSine
        )        
        k.tween(
            text.pos.x,
            -1000,
            2,
            (v) => text.pos.x = v,
            k.easings.easeInSine
        )
            .onEnd(() => {
                k.go("balatroui")
            });
    });

    while (true) {
        await new Promise((resolve) => {
            k.tween(
                text.pos.y,
                text.pos.y + 15,
                1,
                (v) => text.pos.y = v,
                k.easings.easeInOutSine
            ).onEnd(() => {
                k.tween(
                    text.pos.y,
                    text.pos.y - 15,
                    1,
                    (v) => text.pos.y = v,
                    k.easings.easeInOutSine
                ).onEnd(() => {
                    resolve(0);
                });
            });
        })
    }
});

k.go("balatroui");