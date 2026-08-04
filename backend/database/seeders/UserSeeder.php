<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'admin@example.com',
            'phone' => '0987654321',
            'password' => 'password', // will be hashed automatically by user model cast
            'fullName' => 'Quản trị viên Hệ thống',
            'avatar' => 'https://ui-avatars.com/api/?name=Admin+System&background=0D8ABC&color=fff',
            'role' => 'admin',
            'status' => 'active',
            'points' => 0,
            'addressBook' => null,
            'createdAt' => now(),
        ]);

        // Staff
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'staff@example.com',
            'phone' => '0987654322',
            'password' => 'password',
            'fullName' => 'Nguyễn Thị Nhân Viên',
            'avatar' => 'https://ui-avatars.com/api/?name=Staff+Member&background=28a745&color=fff',
            'role' => 'staff',
            'status' => 'active',
            'points' => 0,
            'addressBook' => null,
            'createdAt' => now(),
        ]);

        // Customer 1
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'customer1@example.com',
            'phone' => '0987654323',
            'password' => 'password',
            'fullName' => 'Nguyễn Văn A',
            'avatar' => 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=f0ad4e&color=fff',
            'role' => 'customer',
            'status' => 'active',
            'points' => 500,
            'addressBook' => [
                [
                    'id' => 'addr_1',
                    'receiverName' => 'Nguyễn Văn A',
                    'receiverPhone' => '0987654323',
                    'province' => 'Hành chính Hà Nội',
                    'district' => 'Quận Cầu Giấy',
                    'ward' => 'Phường Dịch Vọng Hậu',
                    'detailAddress' => 'Số 12, Duy Tân',
                    'isDefault' => true
                ],
                [
                    'id' => 'addr_2',
                    'receiverName' => 'Nguyễn Văn A (Văn phòng)',
                    'receiverPhone' => '0912345678',
                    'province' => 'Hành chính Hà Nội',
                    'district' => 'Quận Hoàn Kiếm',
                    'ward' => 'Phường Tràng Tiền',
                    'detailAddress' => 'Tầng 5, Tòa nhà Opera',
                    'isDefault' => false
                ]
            ],
            'createdAt' => now()->subDays(30),
        ]);

        // Customer 2
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'customer2@example.com',
            'phone' => '0987654324',
            'password' => 'password',
            'fullName' => 'Trần Thị B',
            'avatar' => 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=6f42c1&color=fff',
            'role' => 'customer',
            'status' => 'active',
            'points' => 1200,
            'addressBook' => [
                [
                    'id' => 'addr_3',
                    'receiverName' => 'Trần Thị B',
                    'receiverPhone' => '0987654324',
                    'province' => 'Thành phố Hồ Chí Minh',
                    'district' => 'Quận 1',
                    'ward' => 'Phường Bến Nghé',
                    'detailAddress' => '72 Lê Thánh Tôn',
                    'isDefault' => true
                ]
            ],
            'createdAt' => now()->subDays(25),
        ]);

        // Customer 3
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'customer3@example.com',
            'phone' => '0987654325',
            'password' => 'password',
            'fullName' => 'Lê Hoàng C',
            'avatar' => 'https://ui-avatars.com/api/?name=Le+Hoang+C&background=17a2b8&color=fff',
            'role' => 'customer',
            'status' => 'active',
            'points' => 80,
            'addressBook' => [
                [
                    'id' => 'addr_4',
                    'receiverName' => 'Lê Hoàng C',
                    'receiverPhone' => '0987654325',
                    'province' => 'Thành phố Đà Nẵng',
                    'district' => 'Quận Hải Châu',
                    'ward' => 'Phường Hòa Cường Bắc',
                    'detailAddress' => '156 Nguyễn Hữu Thọ',
                    'isDefault' => true
                ]
            ],
            'createdAt' => now()->subDays(15),
        ]);

        // Customer 4
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'customer4@example.com',
            'phone' => '0987654326',
            'password' => 'password',
            'fullName' => 'Phạm Minh D',
            'avatar' => 'https://ui-avatars.com/api/?name=Pham+Minh+D&background=e83e8c&color=fff',
            'role' => 'customer',
            'status' => 'active',
            'points' => 0,
            'addressBook' => [
                [
                    'id' => 'addr_5',
                    'receiverName' => 'Phạm Minh D',
                    'receiverPhone' => '0987654326',
                    'province' => 'Thành phố Hải Phòng',
                    'district' => 'Quận Ngô Quyền',
                    'ward' => 'Phường Lạch Tray',
                    'detailAddress' => '92 Lạch Tray',
                    'isDefault' => true
                ]
            ],
            'createdAt' => now()->subDays(5),
        ]);

        // Customer 5 (Blocked)
        User::create([
            'id' => (string) Str::uuid(),
            'email' => 'customer5@example.com',
            'phone' => '0987654327',
            'password' => 'password',
            'fullName' => 'Vũ Thu E (Blocked)',
            'avatar' => 'https://ui-avatars.com/api/?name=Vu+Thu+E&background=dc3545&color=fff',
            'role' => 'customer',
            'status' => 'blocked',
            'points' => 10,
            'addressBook' => [
                [
                    'id' => 'addr_6',
                    'receiverName' => 'Vũ Thu E',
                    'receiverPhone' => '0987654327',
                    'province' => 'Thành phố Cần Thơ',
                    'district' => 'Quận Ninh Kiều',
                    'ward' => 'Phường An Khánh',
                    'detailAddress' => 'Đại học Cần Thơ',
                    'isDefault' => true
                ]
            ],
            'createdAt' => now()->subDays(2),
        ]);
    }
}
