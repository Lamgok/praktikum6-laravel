import "../css/app.css";
import "./bootstrap";

// Import Trix (tidak perlu import JS karena sudah global)
import "trix/dist/trix.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
        // --- PERBAIKAN DIMULAI DI SINI ---
        // Dapatkan objek modul
        const pageModule = pages[`./pages/${name}.jsx`];

        // Cek dan kembalikan default export.
        // Jika pageModule adalah undefined (halaman tidak ada), maka akan mengembalikan undefined.
        return pageModule?.default;
        // --- PERBAIKAN SELESAI DI SINI ---
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
