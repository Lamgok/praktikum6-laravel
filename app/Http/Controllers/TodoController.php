<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia; // Tambahkan ini jika belum ada, untuk fungsi inertia()

class TodoController extends Controller
{
    /**
     * Menampilkan daftar todo (beranda).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Memanggil relasi todos() yang harus sudah didefinisikan di model User
        $query = $user->todos()->latest();

        // Fitur Pencarian
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Fitur Filter Status
        if ($request->has('status') && $request->status !== 'all') {
            // 'finished' (true) atau 'unfinished' (false)
            $query->where('is_finished', $request->status === 'finished'); 
        }

        // Pagination 20 item per halaman
        $todos = $query->paginate(20)->withQueryString();

        // Menambahkan URL cover ke setiap item todo
        // CATATAN: Karena $todos adalah Paginator, kita harus menggunakan getCollection() 
        // untuk mengakses item yang sebenarnya.
        $todos->getCollection()->transform(function ($todo) {
            // Asumsi ada accessor/mutator cover_url di model Todo
            // Atau Anda menggunakan Storage facade untuk membuat URL secara manual
            // Contoh sederhana:
            $todo->cover_url = $todo->cover 
                ? Storage::disk('public')->url($todo->cover) 
                : null;
            return $todo;
        });

        // Statistik untuk Diagram Bulat
        $stats = [
            'finished' => $user->todos()->where('is_finished', true)->count(),
            'unfinished' => $user->todos()->where('is_finished', false)->count(),
        ];

        // Pastikan nama halaman Inertia sesuai dengan file JSX Anda (HomePage.jsx)
        return inertia('app/HomePage', [ 
            'auth' => ['name' => $user->name], // Kirim data user yang diperlukan saja
            'todos' => $todos,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Menyimpan todo baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|image|max:2048', // Maks 2MB
        ]);

        $data = $request->only('title', 'description');
        $data['user_id'] = Auth::id();
        $data['is_finished'] = false; // Default: belum selesai

        if ($request->hasFile('cover')) {
            // Simpan file di direktori 'todos' pada disk 'public'
            $data['cover'] = $request->file('cover')->store('todos', 'public');
        }

        Todo::create($data);

        return redirect()->back()->with('success', 'Todo berhasil ditambahkan.');
    }

    /**
     * Memperbarui todo.
     */
    public function update(Request $request, Todo $todo)
    {
        // Otorisasi: Pastikan user hanya bisa edit punya sendiri
        if ($todo->user_id !== Auth::id()) abort(403);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'boolean',
            'cover' => 'nullable|image|max:2048',
        ]);

        // Ambil data yang dikirim, termasuk is_finished
        $data = $request->only('title', 'description', 'is_finished');

        if ($request->hasFile('cover')) {
            // Hapus cover lama jika ada
            if ($todo->cover) {
                Storage::disk('public')->delete($todo->cover);
            }
            $data['cover'] = $request->file('cover')->store('todos', 'public');
        }

        $todo->update($data);

        return redirect()->back()->with('success', 'Todo berhasil diperbarui.');
    }

    /**
     * Menghapus todo.
     */
    public function destroy(Todo $todo)
    {
        // Otorisasi
        if ($todo->user_id !== Auth::id()) abort(403);

        // Hapus file cover dari storage
        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $todo->delete();

        return redirect()->back()->with('success', 'Todo berhasil dihapus.');
    }
}