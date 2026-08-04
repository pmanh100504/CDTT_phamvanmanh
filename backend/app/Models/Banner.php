<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'banners';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'title',
        'desktopImage',
        'mobileImage',
        'position',
        'targetUrl',
        'startDate',
        'endDate',
        'status',
        'impressions',
        'clicks',
        'sortOrder',
    ];

    protected function casts(): array
    {
        return [
            'impressions' => 'integer',
            'clicks' => 'integer',
            'sortOrder' => 'integer',
            'startDate' => 'datetime',
            'endDate' => 'datetime',
        ];
    }
}
