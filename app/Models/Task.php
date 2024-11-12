<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    const STATUS = [
        "1" => "未着手",
        "2" => "着手中",
        "3" => "完了",
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // public function status(): Attribute
    // {
    //     return Attribute::make(
    //         get: fn (string $value) => self::STATUS[$value],
    //     );
    // }

    // public function getPlainStatus()
    // {
    //     return $this->attributes['status'];
    // }
}
