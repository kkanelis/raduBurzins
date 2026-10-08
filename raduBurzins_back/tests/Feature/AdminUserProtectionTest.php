<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AdminUserProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_cannot_remove_their_own_approval(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'is_approved' => true,
        ]);
        $this->actingAs($admin);

        try {
            $admin->update(['is_approved' => false]);
            self::fail('Expected self-approval removal to be rejected.');
        } catch (ValidationException $exception) {
            self::assertArrayHasKey('is_approved', $exception->errors());
        }

        self::assertTrue($admin->fresh()->is_approved);
    }

    public function test_last_approved_administrator_cannot_be_demoted_or_deleted(): void
    {
        $actor = User::factory()->create(['is_approved' => true]);
        $admin = User::factory()->create([
            'is_admin' => true,
            'is_approved' => true,
        ]);
        $this->actingAs($actor);

        try {
            $admin->update(['is_approved' => false]);
            self::fail('Expected last administrator demotion to be rejected.');
        } catch (ValidationException $exception) {
            self::assertArrayHasKey('is_approved', $exception->errors());
        }

        try {
            $admin->delete();
            self::fail('Expected last administrator deletion to be rejected.');
        } catch (ValidationException $exception) {
            self::assertArrayHasKey('user', $exception->errors());
        }

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'is_admin' => true,
            'is_approved' => true,
        ]);
    }

    public function test_administrator_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'is_approved' => true,
        ]);
        $this->actingAs($admin);

        try {
            $admin->delete();
            self::fail('Expected self deletion to be rejected.');
        } catch (ValidationException $exception) {
            self::assertArrayHasKey('user', $exception->errors());
        }

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
