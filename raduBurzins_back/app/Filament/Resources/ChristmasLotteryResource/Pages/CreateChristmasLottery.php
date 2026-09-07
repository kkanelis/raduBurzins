<?php

namespace App\Filament\Resources\ChristmasLotteryResource\Pages;

use App\Filament\Resources\ChristmasLotteryResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class CreateChristmasLottery extends CreateRecord
{
    protected static string $resource = ChristmasLotteryResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        // Get participants
        $participants = collect($data['participants']);
        $year = $data['year'];
        
        // Create assignments ensuring no one gifts themselves
        $assignments = $this->createGiftAssignments($participants, $year);

        // Bulk insert all assignments
        \App\Models\ChristmasLottery::insert($assignments->toArray());

        // Return the first record for Filament
        return \App\Models\ChristmasLottery::where('year', $year)->first();
    }

    protected function createGiftAssignments(Collection $participants, $year): Collection
    {
        $assignments = collect();
        $available_recipients = $participants->toArray();
        
        foreach ($participants as $giver) {
            // Filter out the current giver from potential recipients
            $potential_recipients = array_values(array_filter($available_recipients, function($recipient) use ($giver) {
                return $recipient !== $giver;
            }));
            
            // If we're at the last person and they would get themselves, swap with a previous assignment
            if (empty($potential_recipients)) {
                // Get the last assignment and swap its recipient with this person
                $lastAssignment = $assignments->pop();
                $assignments->push([
                    'user_id' => $lastAssignment['user_id'],
                    'giving_to_user_id' => $giver,
                    'year' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $assignments->push([
                    'user_id' => $giver,
                    'giving_to_user_id' => $lastAssignment['giving_to_user_id'],
                    'year' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                continue;
            }
            
            // Randomly select a recipient from available options
            $recipient_index = array_rand($potential_recipients);
            $recipient = $potential_recipients[$recipient_index];
            
            // Remove the selected recipient from available recipients
            $available_recipients = array_values(array_filter($available_recipients, function($r) use ($recipient) {
                return $r !== $recipient;
            }));
            
            // Create the assignment
            $assignments->push([
                'user_id' => $giver,
                'giving_to_user_id' => $recipient,
                'year' => $year,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
        return $assignments;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    
}

