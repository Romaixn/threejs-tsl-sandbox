import { defineConfig } from 'vite';
import threeUniformGui from 'tsl-uniform-ui-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [threeUniformGui()],
    resolve: {
        alias: {
        },
    },
    build: {
        sourcemap: true,
        emptyOutDir: true,
    },
    base: "/"
});
