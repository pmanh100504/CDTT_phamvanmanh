<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'cart_items';

    protected $keyType = 'string';

    public $incrementing = false;

    const CREATED_AT = 'addedAt';
    const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'userId',
        'productId',
        'sku',
        'quantity',
        'addedAt',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'addedAt' => 'datetime',
        ];
    }

    /**
     * Get the cart that contains this item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'userId', 'userId');
    }

    /**
     * Get the product details.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'productId', 'id');
    }

    /**
     * Get the specific product variant.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'sku', 'sku');
    }
}
