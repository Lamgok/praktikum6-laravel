import React, { useState, useEffect, useRef } from "react";
import { usePage, useForm, router, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";
import {
    CheckCircle2,
    Circle,
    Trash2,
    Edit,
    Plus,
    Search,
    ImageIcon,
    ListTodo,
    Gauge,
    Save, // Ikon baru untuk tombol simpan
    X, // Ikon baru untuk tombol batal
} from "lucide-react";

// Import Trix Editor CSS dan JS
import "trix/dist/trix.css";
import "trix";

// ===================================
// === Komponen Sub: Todo Item ===
// ===================================
const TodoItem = ({ todo, onEdit, onDelete, onToggleStatus }) => {
    return (
        <div className="flex items-start justify-between p-4 border rounded-xl bg-background shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Tombol Toggle Status */}
                <button
                    onClick={() => onToggleStatus(todo)}
                    className="mt-1 flex-shrink-0"
                    aria-label={
                        todo.is_finished
                            ? "Tandai Belum Selesai"
                            : "Tandai Selesai"
                    }
                >
                    {todo.is_finished ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500 hover:text-green-600 transition-colors" />
                    ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                </button>

                <div className="flex gap-4 flex-1 min-w-0">
                    {/* Gambar Cover */}
                    {todo.cover_url && (
                        <img
                            src={todo.cover_url}
                            alt={todo.title}
                            className="w-16 h-16 object-cover rounded-lg border flex-shrink-0 aspect-square"
                        />
                    )}
                    {/* Detail Tugas */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className={`text-lg font-semibold truncate ${
                                todo.is_finished
                                    ? "line-through text-muted-foreground/70"
                                    : "text-foreground"
                            }`}
                        >
                            {todo.title}
                        </h3>
                        {todo.description && (
                            <div
                                className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none mt-1"
                                dangerouslySetInnerHTML={{
                                    __html: todo.description,
                                }}
                            />
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Dibuat pada:{" "}
                            {new Date(todo.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}{" "}
                            pukul{" "}
                            {new Date(todo.created_at).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" }
                            )}
                        </p>
                    </div>
                </div>
            </div>
            {/* Tombol Aksi */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(todo)}
                >
                    <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(todo.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

// ===========================================
// === Komponen Sub: Trix Editor Wrapper ===
// ===========================================
const TrixEditor = ({ value, onChange, placeholder, ...props }) => {
    const trixRef = useRef(null);
    const lastValueRef = useRef(value);

    // Effect for trix-change listener and initial load
    useEffect(() => {
        const trixEditor = trixRef.current;

        const handleTrixChange = () => {
            if (trixEditor) {
                const newValue = trixEditor.value;
                if (newValue !== lastValueRef.current) {
                    lastValueRef.current = newValue;
                    onChange(newValue);
                }
            }
        };

        if (trixEditor) {
            trixEditor.addEventListener("trix-change", handleTrixChange);

            if (value !== lastValueRef.current) {
                trixEditor.editor.loadHTML(value || "");
                lastValueRef.current = value;
            }
        }

        return () => {
            if (trixEditor) {
                trixEditor.removeEventListener("trix-change", handleTrixChange);
            }
        };
    }, [onChange]);

    // Effect for updating value from parent
    useEffect(() => {
        if (
            trixRef.current &&
            trixRef.current.editor &&
            value !== lastValueRef.current
        ) {
            const selection = trixRef.current.editor.getSelectedRange();
            trixRef.current.editor.loadHTML(value || "");
            lastValueRef.current = value;
            if (selection) {
                setTimeout(() => {
                    trixRef.current.editor.setSelectedRange(selection);
                }, 0);
            }
        }
    }, [value]);

    return (
        <div className="border border-input rounded-md overflow-hidden transition-colors focus-within:ring-1 focus-within:ring-ring">
            <trix-editor
                ref={trixRef}
                input="trix-input"
                placeholder={placeholder}
                className="trix-content min-h-[150px] p-4 text-sm focus:outline-none bg-background"
                {...props}
            />
            <input id="trix-input" type="hidden" value={value || ""} />
        </div>
    );
};

// ===========================================
// === Komponen Sub: Modal Form (Add/Edit) ===
// ===========================================
const TodoModal = ({ isOpen, onClose, todoToEdit = null }) => {
    // State untuk preview gambar cover
    const [coverPreview, setCoverPreview] = useState(null);

    const { data, setData, post, processing, reset, errors, clearErrors } =
        useForm({
            title: todoToEdit?.title || "",
            description: todoToEdit?.description || "",
            is_finished: todoToEdit?.is_finished || false,
            cover: null,
            _method: todoToEdit ? "PUT" : "POST",
        });

    useEffect(() => {
        // Reset form dan set nilai awal modal
        if (todoToEdit) {
            setData({
                title: todoToEdit.title,
                description: todoToEdit.description || "",
                is_finished: todoToEdit.is_finished,
                cover: null,
                _method: "PUT",
            });
            // Set preview dari URL yang sudah ada
            setCoverPreview(todoToEdit.cover_url || null);
        } else {
            reset();
            setData("_method", "POST");
            setCoverPreview(null);
        }
        clearErrors();
    }, [todoToEdit, isOpen]);

    // Handle perubahan file cover
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        setData("cover", file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setCoverPreview(todoToEdit?.cover_url || null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = todoToEdit ? `/todos/${todoToEdit.id}` : "/todos";

        post(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
            forceFormData: true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95 shadow-2xl">
                <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
                        <Plus className="h-6 w-6 p-1 rounded-full bg-primary text-primary-foreground" />
                        {todoToEdit ? "Ubah Detail Tugas" : "Tambah Tugas Baru"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Judul Tugas */}
                        <div>
                            <label className="text-sm font-medium block mb-1">
                                Judul Tugas
                            </label>
                            <Input
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                placeholder="Tulis nama tugas yang jelas dan spesifik"
                                required
                                className="h-11 text-base focus:border-blue-500"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="text-sm font-medium block mb-1">
                                Deskripsi Detail (Opsional)
                            </label>
                            <TrixEditor
                                value={data.description}
                                onChange={(value) =>
                                    setData("description", value)
                                }
                                placeholder="Gunakan rich text editor ini untuk detail, sub-tugas, atau catatan penting..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Cover Gambar */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">
                                Cover Gambar (Opsional)
                            </label>

                            {/* Preview Area */}
                            <div className="w-full h-32 border-2 border-dashed border-input rounded-lg flex items-center justify-center relative overflow-hidden">
                                {coverPreview ? (
                                    <img
                                        src={coverPreview}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-muted-foreground flex flex-col items-center">
                                        <ImageIcon className="h-6 w-6 mb-1" />
                                        <p className="text-sm">
                                            Gambar akan tampil di sini
                                        </p>
                                        <p className="text-xs"></p>
                                    </div>
                                )}
                            </div>

                            {/* Tombol Upload */}
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="cover-upload"
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors shadow-sm"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    <span>
                                        {data.cover
                                            ? "Ubah Gambar"
                                            : "Pilih Gambar"}
                                    </span>
                                </label>
                                <input
                                    id="cover-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleCoverChange}
                                />
                                {/* Tampilkan nama file yang sedang diunggah */}
                                {data.cover instanceof File && (
                                    <span className="text-sm text-primary font-medium truncate max-w-[200px]">
                                        {data.cover.name}
                                    </span>
                                )}
                                {/* Tampilkan nama file lama saat mode edit */}
                                {todoToEdit &&
                                    !data.cover &&
                                    todoToEdit.cover_url && (
                                        <span className="text-sm text-muted-foreground italic truncate max-w-[200px]">
                                            Menggunakan cover lama
                                        </span>
                                    )}
                            </div>

                            {errors.cover && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.cover}
                                </p>
                            )}
                        </div>

                        {/* Status (Hanya muncul saat Edit) */}
                        {todoToEdit && (
                            <div className="flex items-center pt-2 pb-4 border-t">
                                <input
                                    type="checkbox"
                                    id="is_finished"
                                    className="rounded border-gray-300 h-4 w-4 text-primary focus:ring-primary"
                                    checked={data.is_finished}
                                    onChange={(e) =>
                                        setData("is_finished", e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="is_finished"
                                    className="text-sm ml-2 font-medium"
                                >
                                    Tandai Selesai
                                </label>
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={processing}
                                className="text-muted-foreground hover:bg-gray-100"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing
                                    ? todoToEdit
                                        ? "Memperbarui..."
                                        : "Menyimpan..."
                                    : "Simpan Tugas"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// ... (Komponen HomePage tetap sama)
// ======================================
// === Komponen Utama: HomePage/Dashboard ===
// ======================================
export default function HomePage() {
    const { auth, todos, stats, filters, flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);

    // State untuk search & filter
    const [search, setSearch] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");

    // Debounce search agar tidak reload setiap ketikan
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || "")) {
                router.get(
                    "/",
                    { search, status: statusFilter },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Handle filter change
    const handleFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get(
            "/",
            { search, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    // Chart Data preparation and calculations
    const totalTodos = stats.finished + stats.unfinished;
    const completionPercentage =
        totalTodos > 0 ? ((stats.finished / totalTodos) * 100).toFixed(0) : 0;
    const totalCompleted = stats.finished;

    const chartData = [
        { name: "Selesai", value: stats.finished, color: "#10b981" }, // emerald-500
        { name: "Belum Selesai", value: stats.unfinished, color: "#ef4444" }, // red-500
    ];

    // Handlers
    const handleAdd = () => {
        setEditingTodo(null);
        setIsModalOpen(true);
    };
    const handleEdit = (todo) => {
        setEditingTodo(todo);
        setIsModalOpen(true);
    };
    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus todo ini?")) {
            router.delete(`/todos/${id}`);
        }
    };
    const handleToggleStatus = (todo) => {
        router.post(
            `/todos/${todo.id}`,
            {
                _method: "PUT",
                is_finished: !todo.is_finished,
                title: todo.title,
                description: todo.description,
            },
            { preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header & Greeting */}
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                    Halo, {auth.name}! 👋
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Kelola tugas harianmu. Berikut ringkasan progresmu.
                </p>

                {/* === Stats Cards (4-Column Layout) === */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Card 1: Total Progress - Span 2 columns */}
                    <Card className="md:col-span-2 p-6 flex flex-col justify-between border-l-4 border-primary shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl font-bold mb-1">
                                    Total Progres Tugas
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Pekerjaanmu sejauh ini.
                                </p>
                            </div>
                            <div className="text-4xl font-extrabold text-primary">
                                {completionPercentage}%
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                    <div
                                        className="h-2 bg-green-500 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${completionPercentage}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                **{totalCompleted}** dari **{totalTodos}** tugas
                                telah diselesaikan.
                            </p>
                        </div>
                    </Card>

                    {/* Card 2: Finished Tasks */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Tugas Selesai
                            </CardTitle>
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold mt-2">
                            {stats.finished}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tugas yang sudah selesai.
                        </p>
                    </Card>

                    {/* Card 3: Unfinished Tasks */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Belum Selesai
                            </CardTitle>
                            <Circle className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="text-3xl font-bold mt-2">
                            {stats.unfinished}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tugas yang perlu diselesaikan.
                        </p>
                    </Card>
                </div>

                {/* === Main Content: Todo List & Chart (Grid 8/12) === */}
                <div className="grid md:grid-cols-12 gap-6">
                    {/* Todo List and Toolbar (Span 8/12 columns) */}
                    <div className="md:col-span-8">
                        <Card className="p-6 h-full">
                            <CardTitle className="mb-4 flex items-center gap-2">
                                <ListTodo className="h-5 w-5" /> Daftar Tugas
                            </CardTitle>

                            {/* Toolbar (Search, Filter, Add) */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
                                <div className="flex w-full md:w-auto gap-2 flex-1">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari tugas..."
                                            className="pl-9 h-10"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                    </div>
                                    <select
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            handleFilterChange(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            Semua Status
                                        </option>
                                        <option value="unfinished">
                                            Belum Selesai
                                        </option>
                                        <option value="finished">
                                            Selesai
                                        </option>
                                    </select>
                                </div>
                                <Button
                                    onClick={handleAdd}
                                    className="w-full md:w-auto h-10"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tambah
                                    Tugas
                                </Button>
                            </div>

                            {/* Flash Message */}
                            {flash?.success && (
                                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                    <AlertDescription>
                                        {flash.success}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Todo List */}
                            <div className="space-y-3">
                                {todos.data.length > 0 ? (
                                    todos.data.map((todo) => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                        Belum ada tugas yang ditemukan.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center gap-2">
                            {todos.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? "bg-primary text-primary-foreground font-semibold shadow-md"
                                                : "bg-card hover:bg-accent border text-muted-foreground"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm text-muted-foreground border rounded-md opacity-50 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </div>

                    {/* Pie Chart Card (Span 4/12 columns) */}
                    <div className="md:col-span-4">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5" /> Distribusi
                                    Tugas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px] flex items-center justify-center">
                                {totalTodos > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={3}
                                                dataKey="value"
                                                labelLine={false}
                                            >
                                                {chartData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            stroke={entry.color}
                                                            strokeWidth={1}
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value} Tugas`,
                                                    name,
                                                ]}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        Tidak ada data tugas untuk ditampilkan.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Modal Component */}
                <TodoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    todoToEdit={editingTodo}
                />
            </div>
        </AppLayout>
    );
}
