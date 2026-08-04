<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $keyType = 'string';

    public $incrementing = false;

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'userId',
        'createdAt',
        'status',
        'shippingAddress',
        'shippingMethod',
        'shippingFee',
        'paymentMethod',
        'paymentStatus',
        'couponCode',
        'discountAmount',
        'pointsUsed',
        'pointsEarned',
        'subtotal',
        'total',
        'timeline',
    ];

    protected function casts(): array
    {
        return [
            'shippingAddress' => 'array',
            'timeline' => 'array',
            'shippingFee' => 'float',
            'discountAmount' => 'float',
            'pointsUsed' => 'integer',
            'pointsEarned' => 'integer',
            'subtotal' => 'float',
            'total' => 'float',
            'createdAt' => 'datetime',
        ];
    }

    /**
     * Auto-generate order ID matching the pattern "HD" + "YYMMDD" + "XXXX"
     */
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            if (empty($order->id)) {
                $order->id = 'HD' . date('ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the customer who placed the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }

    /**
     * Get the coupon applied to the order.
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'couponCode', 'code');
    }

    /**
     * Get the detailed items of the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'orderId', 'id');
    }
}
