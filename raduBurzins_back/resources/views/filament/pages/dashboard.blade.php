<x-filament::page>
    <div class="space-y-6">
        <x-filament::section>
            <div class="space-y-4">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div class="max-w-3xl space-y-3">
                        <div class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
                            <x-heroicon-o-sparkles class="h-4 w-4" />
                            Administrācijas panelis
                        </div>

                        <h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                            Sveiks, {{ auth()->user()->first_name ?? 'Admin' }}.
                        </h1>

                        <p class="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                            Viss svarīgais vienā sakārtotā admin lapā.
                        </p>
                    </div>
                </div>
            </div>
        </x-filament::section>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <x-filament::section>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Lietotāji</p>
                        <h3 class="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{{ \App\Models\User::count() }}</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Reģistrētie profili</p>
                    </div>
                    <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        <x-heroicon-o-user-group class="h-6 w-6" />
                    </div>
                </div>
            </x-filament::section>

            <x-filament::section>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Notikumi</p>
                        <h3 class="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{{ \App\Models\SpecialDay::count() }}</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Svarīgās dienas</p>
                    </div>
                    <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        <x-heroicon-o-bell-alert class="h-6 w-6" />
                    </div>
                </div>
            </x-filament::section>

            <x-filament::section>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Loterija</p>
                        <h3 class="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{{ \App\Models\ChristmasLottery::count() }}</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Pāru ieraksti</p>
                    </div>
                    <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        <x-heroicon-o-gift class="h-6 w-6" />
                    </div>
                </div>
            </x-filament::section>

            <x-filament::section>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Neapstiprināti</p>
                        <h3 class="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{{ \App\Models\User::where('is_approved', false)->count() }}</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">lietotāji</p>
                    </div>
                    <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        <x-heroicon-o-x-mark class="h-6 w-6" />
                    </div>
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament::page>
