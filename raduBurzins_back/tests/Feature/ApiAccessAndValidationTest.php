<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\ChristmasLottery;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAccessAndValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_directory_only_returns_approved_names(): void
    {
        $viewer = User::factory()->create(['is_approved' => true]);
        $approved = User::factory()->create(['is_approved' => true]);
        $pending = User::factory()->create(['is_approved' => false]);

        $this->actingAs($viewer)
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment([
                'id' => $approved->id,
                'first_name' => $approved->first_name,
                'last_name' => $approved->last_name,
            ])
            ->assertJsonMissing(['id' => $pending->id])
            ->assertJsonMissing(['email' => $approved->email])
            ->assertJsonMissing(['phone' => $approved->phone]);
    }

    public function test_existing_token_cannot_access_api_after_account_is_unapproved(): void
    {
        $user = User::factory()->create(['is_approved' => false]);
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/users')
            ->assertForbidden()
            ->assertJsonPath('message', 'Lietotāja konts nav apstiprināts.');
    }

    public function test_private_event_cannot_be_shared_with_unapproved_user(): void
    {
        $owner = User::factory()->create(['is_approved' => true]);
        $pendingUser = User::factory()->create(['is_approved' => false]);

        $this->actingAs($owner)
            ->postJson('/api/special-days', [
                'title' => 'Ģimenes vakars',
                'date' => now()->addWeek()->toDateString(),
                'is_public' => false,
                'shared_with_user_ids' => [$pendingUser->id],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('shared_with_user_ids.0');

        $this->assertDatabaseMissing('special_days', [
            'user_id' => $owner->id,
            'title' => 'Ģimenes vakars',
        ]);
    }

    public function test_album_cannot_be_shared_with_unapproved_user(): void
    {
        $owner = User::factory()->create(['is_approved' => true]);
        $pendingUser = User::factory()->create(['is_approved' => false]);

        $this->actingAs($owner)
            ->postJson('/api/albums', [
                'title' => 'Ģimenes foto',
                'is_public' => false,
                'shared_with_user_ids' => [$pendingUser->id],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('shared_with_user_ids.0');

        $this->assertDatabaseCount('albums', 0);
    }

    public function test_private_album_is_not_visible_to_unshared_user(): void
    {
        $owner = User::factory()->create(['is_approved' => true]);
        $otherUser = User::factory()->create(['is_approved' => true]);
        $album = Album::create([
            'user_id' => $owner->id,
            'title' => 'Privāts albums',
            'is_public' => false,
            'shared_with_user_ids' => [],
        ]);

        $this->actingAs($otherUser)
            ->getJson('/api/albums/'.$album->id)
            ->assertForbidden();
    }

    public function test_christmas_lottery_only_returns_the_current_users_assignment(): void
    {
        $giver = User::factory()->create(['is_approved' => true]);
        $recipient = User::factory()->create(['is_approved' => true]);
        $otherGiver = User::factory()->create(['is_approved' => true]);
        $otherRecipient = User::factory()->create(['is_approved' => true]);
        $year = now()->year;

        ChristmasLottery::create([
            'user_id' => $giver->id,
            'giving_to_user_id' => $recipient->id,
            'year' => $year,
        ]);
        ChristmasLottery::create([
            'user_id' => $otherGiver->id,
            'giving_to_user_id' => $otherRecipient->id,
            'year' => $year,
        ]);

        $this->actingAs($giver)
            ->getJson('/api/christmas-lottery')
            ->assertOk()
            ->assertJsonCount(1, 'assignments')
            ->assertJsonPath('assignments.0.giver.id', $giver->id)
            ->assertJsonPath('assignments.0.recipient.id', $recipient->id)
            ->assertJsonMissing(['name' => $otherRecipient->full_name]);
    }

    public function test_profile_form_method_override_updates_profile_fields(): void
    {
        $user = User::factory()->create(['is_approved' => true]);

        $this->actingAs($user)
            ->post('/api/profile', [
                '_method' => 'PUT',
                'first_name' => 'Jauns',
                'last_name' => 'Vārds',
                'nickname' => '',
                'phone' => '+37120000000',
                'date_of_birth' => '1990-01-01',
                'email' => $user->email,
            ])
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => 'Jauns',
            'last_name' => 'Vārds',
        ]);
    }

    public function test_registration_requires_accepting_both_policies(): void
    {
        $this->postJson('/api/register', [
            'first_name' => 'Jauns',
            'last_name' => 'Lietotājs',
            'phone' => '+37120000001',
            'email' => 'new@example.test',
            'password' => 'Secure-password-123',
            'password_confirmation' => 'Secure-password-123',
            'terms' => false,
            'rules' => true,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('terms');

        $this->assertDatabaseMissing('users', ['email' => 'new@example.test']);
    }
}
