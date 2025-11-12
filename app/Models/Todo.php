<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Todo extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'is_finished',
        'cover',
    ];

    protected $casts = [
        'is_finished' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    // Aksesor untuk mendapatkan URL lengkap gambar cover
    public function getCoverUrlAttribute()
    {
        return $this->cover ? asset('storage/' . $this->cover) : null;
    }
}