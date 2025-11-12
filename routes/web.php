<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController; // Ubah HomeController ke TodoController
use Illuminate\Support\Facades\Route;

Route::middleware(['handle.inertia'])->group(function () {
    // Auth Routes (Biarkan tetap sama)
    Route::group(['prefix' => 'auth'], function () {
        Route::get('/login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('/login/post', [AuthController::class, 'postLogin'])->name('auth.login.post');
        Route::get('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/register/post', [AuthController::class, 'postRegister'])->name('auth.register.post');
        Route::get('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });

    // Route Utama Dashboard Todo
    Route::group(['middleware' => 'check.auth'], function () {
        // Ganti HomeController dengan TodoController@index
        Route::get('/', [TodoController::class, 'index'])->name('home');
        
        // Route CRUD Todo
        Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
        // Menggunakan POST dengan _method: PUT untuk mengakomodasi upload file di Inertia
       Route::match(['put', 'patch', 'post'], '/todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
        Route::delete('/todos/{todo}', [TodoController::class, 'destroy'])->name('todos.destroy');
    });
});