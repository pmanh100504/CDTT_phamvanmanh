<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Cart;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Admin/Staff Login
     */
    public function adminLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa.'
            ], 403);
        }

        if (!in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập trang quản trị.'
            ], 403);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'phone' => $user->phone
            ]
        ]);
    }

    /**
     * Customer Registration
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'fullName' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6'
        ], [
            'email.unique' => 'Email này đã được sử dụng.',
            'phone.unique' => 'Số điện thoại này đã được sử dụng.',
            'email.required' => 'Vui lòng nhập email.',
            'phone.required' => 'Vui lòng nhập số điện thoại.',
            'fullName.required' => 'Vui lòng nhập họ tên.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.'
        ]);

        $userId = (string) Str::uuid();
        
        $user = User::create([
            'id' => $userId,
            'fullName' => $data['fullName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role' => 'customer',
            'status' => 'active',
            'points' => 0,
            'addressBook' => [],
            'createdAt' => now()
        ]);

        // Create initial cart in database for user
        Cart::create([
            'userId' => $userId,
            'updatedAt' => now()
        ]);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'fullName' => $user->fullName,
                'phone' => $user->phone,
                'points' => $user->points,
                'addressBook' => $user->addressBook,
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Customer Login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // Support login by email or phone
        $user = User::where('email', $credentials['email'])
            ->orWhere('phone', $credentials['email'])
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Tài khoản hoặc mật khẩu không đúng.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa.'
            ], 403);
        }

        // Ensure user has a cart
        if (!Cart::find($user->id)) {
            Cart::create([
                'userId' => $user->id,
                'updatedAt' => now()
            ]);
        }

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
