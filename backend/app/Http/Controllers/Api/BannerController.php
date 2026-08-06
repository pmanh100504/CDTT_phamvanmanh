<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    /**
     * Get All Banners for Admin
     */
    public function getAdminBanners()
    {
        $banners = Banner::orderBy('sortOrder', 'asc')->get();
        return response()->json($banners);
    }

    /**
     * Create or Update Banner (Admin)
     */
    public function saveBanner(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|string',
            'title' => 'required|string|max:150',
            'desktopImage' => 'required|string|max:255',
            'mobileImage' => 'required|string|max:255',
            'position' => 'required|string|in:HOME_SLIDER,SIDEBAR,POPUP',
            'targetUrl' => 'required|string|max:255',
            'startDate' => 'required|string',
            'endDate' => 'required|string',
            'status' => 'nullable|string|in:active,inactive',
            'sortOrder' => 'nullable|integer'
        ]);

        if (empty($data['id'])) {
            $data['id'] = (string) Str::uuid();
            $data['impressions'] = 0;
            $data['clicks'] = 0;
            $banner = Banner::create($data);
        } else {
            $banner = Banner::find($data['id']);
            if (!$banner) {
                return response()->json(['message' => 'Không tìm thấy banner.'], 404);
            }
            $banner->update($data);
        }

        return response()->json($banner);
    }

    /**
     * Delete Banner (Admin)
     */
    public function deleteBanner($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }
        $banner->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Track Banner Impression or Click from Admin Actions
     */
    public function trackBanner(Request $request, $id)
    {
        $type = $request->validate([
            'type' => 'required|string|in:impression,click'
        ])['type'];

        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Không tìm thấy banner.'], 404);
        }

        if ($type === 'impression') {
            $banner->increment('impressions');
        } else {
            $banner->increment('clicks');
        }

        return response()->json(['success' => true]);
    }

    /**
     * Get Active Banners List (Storefront)
     */
    public function getStorefrontBanners()
    {
        $banners = Banner::where('status', 'active')
            ->orderBy('sortOrder', 'asc')
            ->get();
        return response()->json($banners);
    }

    /**
     * Track Customer Click on Banner (Storefront)
     */
    public function trackBannerClick($id)
    {
        $banner = Banner::find($id);
        if ($banner) {
            $banner->increment('clicks');
            return response()->json(['success' => true]);
        }
        return response()->json(['message' => 'Không tìm thấy banner'], 404);
    }
}
