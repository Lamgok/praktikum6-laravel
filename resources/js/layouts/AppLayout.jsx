import React from "react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react"; // Import ikon baru

export default function AppLayout({ children }) {
    const onLogout = () => {
        router.get("/auth/logout");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation - Dibuat lebih menonjol dengan shadow dan warna primary */}
            <nav className="border-b bg-card shadow-lg sticky top-0 z-10">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Nama Aplikasi dengan Ikon */}
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-xl font-extrabold text-primary transition-colors hover:text-primary/80"
                            >
                                <ListTodo className="h-6 w-6" />
                                <span>TaskFlow</span>
                            </Link>
                        </div>

                        {/* Tombol Logout */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="transition-transform hover:scale-[1.02] hover:bg-red-50 dark:hover:bg-red-900/10 text-destructive border-destructive"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content: flex-1 akan memastikan konten ini mengambil semua ruang vertikal yang tersedia. */}
            {/* Ditambahkan padding bawah (pb-12) agar elemen pagination tidak tertutup footer. */}
            <main className="flex-1 pb-12">{children}</main>

            {/* Footer - Dibuat lebih minimalis */}
            <footer className="border-t bg-muted py-4">
                {/* Ditebalkan menggunakan class font-bold */}
                <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-bold">
                    &copy; {new Date().getFullYear()} TaskFlow | Built with
                    Laravel and React (Zero To Heroes)
                </div>
            </footer>
        </div>
    );
}
