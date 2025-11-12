import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
            // Perbaikan: Mengganti '/resources/js/Components' menjadi '/resources/js/components'
            // agar sesuai dengan struktur folder Anda yang menggunakan huruf kecil.
            "@/components": "/resources/js/components",
            "@/lib": "/resources/js/lib",
        },
    },
    optimizeDeps: {
        include: ["lucide-react"],
    },
});
