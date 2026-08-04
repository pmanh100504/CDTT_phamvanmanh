<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'product_variants';

    protected $primaryKey = 'sku';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'sku',
        'productId',
        'attributes',
        'price',
        'promoPrice',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'price' => 'float',
            'promoPrice' => 'float',
            'stock' => 'integer',
        ];
    }

    /**
     * Get the product that owns the variant.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'productId', 'id');
    }
}
