import { defineConfig } from 'vite';

export default defineConfig({
    root: "./",
    publicDir: "public", // Оставляем public как корневую директорию для статических файлов
    build: {
        outDir: "dist"
    },
    base: "/car-game/"
});