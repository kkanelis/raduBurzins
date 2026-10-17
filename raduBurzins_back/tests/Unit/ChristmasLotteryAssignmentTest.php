<?php

namespace Tests\Unit;

use App\Services\ChristmasLotteryAssignmentGenerator;
use Tests\TestCase;

class ChristmasLotteryAssignmentTest extends TestCase
{
    public function test_each_lottery_participant_is_assigned_a_different_participant(): void
    {
        $participants = [3, 8, 13, 21, 34];
        $assignments = (new ChristmasLotteryAssignmentGenerator)->generate($participants, 2026);

        self::assertEqualsCanonicalizing($participants, array_column($assignments, 'user_id'));
        self::assertEqualsCanonicalizing($participants, array_column($assignments, 'giving_to_user_id'));

        foreach ($assignments as $assignment) {
            self::assertNotSame($assignment['user_id'], $assignment['giving_to_user_id']);
            self::assertSame(2026, $assignment['year']);
        }
    }
}