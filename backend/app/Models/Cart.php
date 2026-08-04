<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $primaryKey = 'userId';

    protected $keyType = 'string';

    public $incrementing = false;

    const CREATED_AT = null;
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'userId',
        'updatedAt',
    ];

    protected function casts(): array
    {
        return [
            'updatedAt' => 'datetime',
        ];
    }

    /**
     * Get the user who owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }

    /**
     * Get the items in this cart.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'userId', 'userId');
    }
}
