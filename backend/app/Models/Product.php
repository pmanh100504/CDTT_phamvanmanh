<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'products';

    protected $keyType = 'string';

    public $incrementing = false;

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'categoryId',
        'name',
        'slug',
        'brand',
        'description',
        'specifications',
        'images',
        'status',
        'ratingAverage',
        'ratingCount',
        'createdAt',
    ];

    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'images' => 'array',
            'ratingAverage' => 'float',
            'ratingCount' => 'integer',
            'createdAt' => 'datetime',
        ];
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'categoryId', 'id');
    }

    /**
     * Get the variants for the product.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'productId', 'id');
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'productId', 'id');
    }
}
