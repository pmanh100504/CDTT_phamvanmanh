<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    /**
     * Get Customers List & Lifetime Value (Admin)
     */
    public function getCustomers(Request $request)
    {
        $search = $request->query('search');
        $role = $request->query('role');

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('fullName', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('createdAt', 'desc')->get();

        // Calculate LTV (Lifetime Value) for customers based on completed orders
        $users = $users->map(function ($u) {
            $ltv = (float) Order::where('userId', $u->id)
                ->where('status', 'completed')
                ->sum('total');
            $u->ltv = $ltv;
            return $u;
        });

        return response()->json($users);
    }

    /**
     * Update Customer Account Status (Admin)
     */
    public function updateCustomerStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|string|in:active,blocked'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
        }

        $user->status = $data['status'];
        $user->save();

        return response()->json($user);
    }

    /**
     * Update Customer Role (Admin)
     */
    public function updateCustomerRole(Request $request, $id)
    {
        $data = $request->validate([
            'role' => 'required|string|in:customer,admin,staff'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng.'], 404);
        }

        $user->role = $data['role'];
        $user->save();

        return response()->json($user);
    }

    /**
     * Get Logged-in Customer Profile (Storefront)
     */
    public function getProfile(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        return response()->json($user);
    }

    /**
     * Update Logged-in Customer Profile & Address Book (Storefront)
     */
    public function updateProfile(Request $request)
    {
        $userId = $request->header('X-User-Id');
        if (!$userId) {
            return response()->json(['message' => 'Chưa đăng nhập'], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        $data = $request->validate([
            'fullName' => 'required|string|max:100',
            'phone' => 'required|string|max:20|unique:users,phone,' . $user->id,
            'avatar' => 'nullable|string',
            'addressBook' => 'nullable|array',
            'password' => 'nullable|string|min:6'
        ], [
            'phone.unique' => 'Số điện thoại này đã được đăng ký bởi tài khoản khác.',
            'phone.required' => 'Vui lòng nhập số điện thoại.',
            'fullName.required' => 'Vui lòng nhập họ tên.',
            'password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.'
        ]);

        $user->fullName = $data['fullName'];
        $user->phone = $data['phone'];
        if (isset($data['avatar'])) {
            $user->avatar = $data['avatar'];
        }
        if (isset($data['addressBook'])) {
            $user->addressBook = $data['addressBook'];
        }
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'points' => $user->points,
                'addressBook' => $user->addressBook ?? [],
                'role' => $user->role
            ]
        ]);
    }
}
