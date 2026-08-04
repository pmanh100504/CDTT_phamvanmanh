<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'reviews';

    protected $keyType = 'string';

    public $incrementing = false;

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'productId',
        'userId',
        'userName',
        'userAvatar',
        'rating',
        'comment',
        'images',
        'createdAt',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'images' => 'array',
            'createdAt' => 'datetime',
        ];
    }

    /**
     * Get the product being reviewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'productId', 'id');
    }

    /**
     * Get the user who left the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }
}
