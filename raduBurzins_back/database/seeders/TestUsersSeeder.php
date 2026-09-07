<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'first_name' => 'Anna',
                'last_name' => 'Bērziņa',
                'nickname' => 'Anna',
                'phone' => '20000001',
                'date_of_birth' => '1992-03-14',
                'email' => 'anna@example.com',
                'password' => 'pass123',
                'is_approved' => true,
                'is_admin' => false,
                'terms' => true,
                'rules' => true,
            ],
            [
                'first_name' => 'Jānis',
                'last_name' => 'Kalniņš',
                'nickname' => 'Janka',
                'phone' => '20000002',
                'date_of_birth' => '1988-07-22',
                'email' => 'janis@example.com',
                'password' => 'pass123',
                'is_approved' => true,
                'is_admin' => false,
                'terms' => true,
                'rules' => true,
            ],
            [
                'first_name' => 'Līga',
                'last_name' => 'Ozola',
                'nickname' => 'Liga',
                'phone' => '20000003',
                'date_of_birth' => '1995-11-05',
                'email' => 'liga@example.com',
                'password' => 'pass123',
                'is_approved' => true,
                'is_admin' => false,
                'terms' => true,
                'rules' => true,
            ],
            [
                'first_name' => 'Mārtiņš',
                'last_name' => 'Liepa',
                'nickname' => 'Martins',
                'phone' => '20000004',
                'date_of_birth' => '1990-01-19',
                'email' => 'martins@example.com',
                'password' => 'pass123',
                'is_approved' => true,
                'is_admin' => true,
                'terms' => true,
                'rules' => true,
            ],
            [
                'first_name' => 'Elīna',
                'last_name' => 'Krūmiņa',
                'nickname' => 'Eli',
                'phone' => '20000005',
                'date_of_birth' => '2000-09-30',
                'email' => 'elina@example.com',
                'password' => 'pass123',
                'is_approved' => true,
                'is_admin' => false,
                'terms' => true,
                'rules' => true,
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'nickname' => $data['nickname'],
                    'phone' => $data['phone'],
                    'date_of_birth' => $data['date_of_birth'],
                    'password' => Hash::make($data['password']),
                    'is_approved' => $data['is_approved'],
                    'is_admin' => $data['is_admin'],
                    'terms' => $data['terms'],
                    'rules' => $data['rules'],
                ]
            );
        }
    }
}
