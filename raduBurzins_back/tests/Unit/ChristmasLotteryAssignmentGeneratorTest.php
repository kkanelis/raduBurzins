<?php

namespace Tests\Unit;

use App\Services\ChristmasLotteryAssignmentGenerator;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ChristmasLotteryAssignmentGeneratorTest extends TestCase
{
    public function test_assignments_are_a_derangement_of_all_participants(): void
    {
        $participants = [3, 8, 13, 21, 34];
        $assignments = (new ChristmasLotteryAssignmentGenerator)->generate($participants, 2026);

        $givers = array_column($assignments, 'user_id');
        $recipients = array_column($assignments, 'giving_to_user_id');

        self::assertCount(count($participants), $assignments);
        self::assertEqualsCanonicalizing($participants, $givers);
        self::assertEqualsCanonicalizing($participants, $recipients);

        foreach ($assignments as $assignment) {
            self::assertNotSame($assignment['user_id'], $assignment['giving_to_user_id']);
            self::assertSame(2026, $assignment['year']);
        }
    }

    public function test_requires_at_least_two_distinct_participants(): void
    {
        $this->expectException(ValidationException::class);

        (new ChristmasLotteryAssignmentGenerator)->generate([7, 7], 2026);
    }

    public function test_assignments_do_not_repeat_previous_year_pairs(): void
    {
        $participants = [3, 8, 13, 21, 34];
        $previousAssignments = [
            ['user_id' => 3, 'giving_to_user_id' => 8],
            ['user_id' => 8, 'giving_to_user_id' => 13],
            ['user_id' => 13, 'giving_to_user_id' => 21],
            ['user_id' => 21, 'giving_to_user_id' => 34],
            ['user_id' => 34, 'giving_to_user_id' => 3],
        ];

        $assignments = (new ChristmasLotteryAssignmentGenerator)->generate($participants, 2027, $previousAssignments);

        foreach ($assignments as $assignment) {
            self::assertNotContains([
                'user_id' => $assignment['user_id'],
                'giving_to_user_id' => $assignment['giving_to_user_id'],
            ], $previousAssignments);
        }

        self::assertEqualsCanonicalizing($participants, array_column($assignments, 'giving_to_user_id'));
    }

    public function test_rejects_a_draw_when_all_valid_pairs_were_used_before(): void
    {
        $this->expectException(ValidationException::class);

        (new ChristmasLotteryAssignmentGenerator)->generate(
            [3, 8],
            2027,
            [
                ['user_id' => 3, 'giving_to_user_id' => 8],
                ['user_id' => 8, 'giving_to_user_id' => 3],
            ],
        );
    }
}
