<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'order_items';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'orderId',
        'productId',
        'productName',
        'sku',
        'variantName',
        'price',
        'quantity',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'quantity' => 'integer',
        ];
    }

    /**
     * Get the order that owns this item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'orderId', 'id');
    }

    /**
     * Get the product (if still available).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'productId', 'id');
    }

    /**
     * Get the variant (if still available).
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'sku', 'sku');
    }
}
