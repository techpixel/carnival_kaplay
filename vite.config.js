import { config } from "dotenv";
config({
    path: '../.env'
});
import { resolve } from "path";
import { defineConfig } from "vite";

const kaplayCongrats = () => {
    return {
        name: "vite-plugin-kaplay-hello",
        buildEnd() {
            const line =
                "---------------------------------------------------------";
            const PORT = process.env.PORT || 3000;
            const msg = `Open here: http://localhost:${PORT}/auth?auth_key=${process.env.PERSONAL_AUTH_KEY}`;

            process.stdout.write(`\n${line}\n${msg}\n${line}\n`);
        },
    };
};

export default defineConfig({
    // index.html out file will start with a relative path for script
    base: "/",    
    server: {
        port: 3001,
        allowedHosts: true,
    },
    build: {
        // disable this for low bundle sizes
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    kaplay: ["kaplay"],
                },
            },
        },
    },
    plugins: [
        // Disable messages removing this line
        kaplayCongrats(),
    ],
});