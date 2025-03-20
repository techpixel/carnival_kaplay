import { k, bg, c } from "./lib/kaplay";

k.scene("start", async () => {
    k.add(bg);

    const text = k.add([
            k.text("W I L D C A R D", {
                size: 96,
                font: "font",
            }),            
            k.color(k.rgb(255, 255, 255)),
            k.pos(k.width()/2, k.height() / 2),
            k.anchor("center")
    ]);

    // text.onHover(() => {
    //     text.color = k.rgb(240, 54, 54);
    // })

    // text.onHoverEnd(() => {
    //     text.color = k.rgb(255, 255, 255);
    // })

    text.onDraw(() => {
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