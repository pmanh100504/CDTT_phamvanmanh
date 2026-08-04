<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $table = 'coupons';

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'code',
        'type',
        'value',
        'minOrderValue',
        'maxDiscount',
        'maxUses',
        'usedCount',
        'startDate',
        'endDate',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'float',
            'minOrderValue' => 'float',
            'maxDiscount' => 'float',
            'maxUses' => 'integer',
            'usedCount' => 'integer',
            'startDate' => 'datetime',
            'endDate' => 'datetime',
        ];
    }

    /**
     * Get the orders that applied this coupon.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'couponCode', 'code');
    }
}
