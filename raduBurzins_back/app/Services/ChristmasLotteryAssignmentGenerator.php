<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class ChristmasLotteryAssignmentGenerator
{
    /** @return array<int, array{user_id: int, giving_to_user_id: int, year: int, created_at: mixed, updated_at: mixed}> */
    public function generate(array $participantIds, int $year, array $previousAssignments = []): array
    {
        $participants = array_values(array_unique(array_map('intval', $participantIds)));

        if (count($participants) < 2 || min($participants) < 1) {
            throw ValidationException::withMessages([
                'participants' => 'Loterijai nepieciešami vismaz divi derīgi dalībnieki.',
            ]);
        }

        $participantSet = array_fill_keys($participants, true);
        $previousPairs = [];

        foreach ($previousAssignments as $assignment) {
            $giver = (int) ($assignment['user_id'] ?? 0);
            $recipient = (int) ($assignment['giving_to_user_id'] ?? 0);

            if (isset($participantSet[$giver], $participantSet[$recipient])) {
                $previousPairs[$giver][$recipient] = true;
            }
        }

        $recipientsByGiver = [];
        foreach ($participants as $giver) {
            $recipients = array_values(array_filter(
                $participants,
                fn (int $recipient): bool => $recipient !== $giver && ! isset($previousPairs[$giver][$recipient]),
            ));

            shuffle($recipients);
            $recipientsByGiver[$giver] = $recipients;
        }

        $givers = $participants;
        shuffle($givers);
        usort(
            $givers,
            fn (int $first, int $second): int => count($recipientsByGiver[$first]) <=> count($recipientsByGiver[$second]),
        );

        $giverByRecipient = [];
        foreach ($givers as $giver) {
            $visitedRecipients = [];
            if (! $this->assignRecipient($giver, $recipientsByGiver, $giverByRecipient, $visitedRecipients)) {
                throw ValidationException::withMessages([
                    'participants' => 'Ar šiem dalībniekiem nav iespējams izveidot jaunu izlozi bez iepriekšējo gadu pāru atkārtošanas.',
                ]);
            }
        }

        $recipientByGiver = array_flip($giverByRecipient);
        $timestamp = now();

        return array_map(
            fn (int $giver): array => [
                'user_id' => $giver,
                'giving_to_user_id' => $recipientByGiver[$giver],
                'year' => $year,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            $participants,
        );
    }

    private function assignRecipient(int $giver, array $recipientsByGiver, array &$giverByRecipient, array &$visitedRecipients): bool
    {
        foreach ($recipientsByGiver[$giver] as $recipient) {
            if (isset($visitedRecipients[$recipient])) {
                continue;
            }

            $visitedRecipients[$recipient] = true;
            if (! isset($giverByRecipient[$recipient]) || $this->assignRecipient(
                $giverByRecipient[$recipient],
                $recipientsByGiver,
                $giverByRecipient,
                $visitedRecipients,
            )) {
                $giverByRecipient[$recipient] = $giver;

                return true;
            }
        }

        return false;
    }
}
