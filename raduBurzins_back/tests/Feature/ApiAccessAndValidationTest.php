<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\AlbumPhoto;
use App\Models\ChristmasLottery;
use App\Models\SpecialDay;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
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

    public function test_expired_bearer_token_cannot_access_the_api(): void
    {
        $user = User::factory()->create(['is_approved' => true]);
        $newToken = $user->createToken('test-token');
        $newToken->accessToken->forceFill(['created_at' => now()->subDays(8)])->save();

        $this->withToken($newToken->plainTextToken)
            ->getJson('/api/users')
            ->assertUnauthorized();
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

    public function test_special_day_time_accepts_hh_mm_and_rejects_free_text_on_create(): void
    {
        $user = User::factory()->create(['is_approved' => true]);
        $payload = [
            'title' => 'Vakariņas',
            'date' => now()->addWeek()->toDateString(),
            'event_time' => 'rīt vakarā',
        ];

        $this->actingAs($user)
            ->postJson('/api/special-days', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('event_time');

        $this->assertDatabaseCount('special_days', 0);

        $this->postJson('/api/special-days', array_merge($payload, ['event_time' => '18:30']))
            ->assertCreated()
            ->assertJsonPath('special_day.event_time', '18:30');
    }

    public function test_special_day_time_rejects_invalid_format_on_update(): void
    {
        $user = User::factory()->create(['is_approved' => true]);
        $specialDay = SpecialDay::create([
            'user_id' => $user->id,
            'title' => 'Vakariņas',
            'date' => now()->addWeek()->toDateString(),
            'event_time' => '18:30',
            'repeats' => false,
            'is_public' => true,
        ]);

        $this->actingAs($user)
            ->putJson('/api/special-days/'.$specialDay->id, ['event_time' => '25:99'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('event_time');

        $this->assertDatabaseHas('special_days', [
            'id' => $specialDay->id,
            'event_time' => '18:30',
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

    public function test_user_can_create_an_album_with_a_photo(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['is_approved' => true]);

        $response = $this->actingAs($owner)
            ->post('/api/albums', [
                'title' => 'Vasaras svētki',
                'description' => 'Kopīgās ģimenes atmiņas',
                'is_public' => true,
                'photos' => [[
                    'title' => 'Kopbilde',
                    'note' => 'Pie ezera',
                    'image' => UploadedFile::fake()->image('family.jpg'),
                ]],
            ])
            ->assertOk()
            ->assertJsonPath('album.title', 'Vasaras svētki')
            ->assertJsonPath('album.photos.0.title', 'Kopbilde');

        $photo = AlbumPhoto::query()->firstOrFail();

        $this->assertDatabaseHas('albums', [
            'id' => $response->json('album.id'),
            'user_id' => $owner->id,
            'title' => 'Vasaras svētki',
        ]);
        $this->assertDatabaseCount('album_photos', 1);
        Storage::disk('public')->assertExists($photo->image_path);
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

    public function test_profile_rejects_values_that_exceed_registration_limits(): void
    {
        $user = User::factory()->create(['is_approved' => true]);

        $this->actingAs($user)
            ->putJson('/api/profile', [
                'first_name' => str_repeat('a', 51),
                'last_name' => str_repeat('b', 51),
                'phone' => '+371200000001',
                'email' => $user->email,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['first_name', 'last_name', 'phone']);
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

    public function test_registration_creates_a_pending_account_without_authentication_credentials(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Jauns',
            'last_name' => 'Lietotājs',
            'phone' => '+37120000002',
            'email' => 'pending@example.test',
            'password' => 'Secure-password-123',
            'password_confirmation' => 'Secure-password-123',
            'terms' => true,
            'rules' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonMissingPath('token')
            ->assertJsonMissingPath('user');

        $this->assertDatabaseHas('users', [
            'email' => 'pending@example.test',
            'is_approved' => false,
        ]);
        self::assertStringContainsString('nosūtīts apstiprināšanai', $response->json('message'));
    }

    public function test_user_birthday_is_not_duplicated_as_a_special_day(): void
    {
        $user = User::factory()->create([
            'date_of_birth' => '1990-05-12',
        ]);

        $this->assertDatabaseMissing('special_days', [
            'user_id' => $user->id,
            'title' => $user->name.' svin dzimšanas dienu!',
        ]);

        $user->update(['date_of_birth' => '1991-06-13']);

        $this->assertDatabaseCount('special_days', 0);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'date_of_birth' => '1991-06-13',
        ]);
    }

    public function test_special_days_do_not_have_an_unused_approval_column(): void
    {
        self::assertFalse(Schema::hasColumn('special_days', 'is_approved'));
    }
}
