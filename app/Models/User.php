<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- Tambahkan import ini!

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    // ... (metode-metode lain)

    /**
     * Get the todos for the user (Relasi one-to-many ke model Todo).
     */
    public function todos(): HasMany // <-- TAMBAHKAN METODE RELASI INI
    {
        return $this->hasMany(Todo::class);
    }
}