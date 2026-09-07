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
                            Šeit vari ātri pārvaldīt lietotājus, svarīgos notikumus, namedays, surnamedays un Ziemassvētku loteriju.
                            Viss svarīgais vienā sakārtotā admin lapā.
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <x-filament::button tag="a" href="{{ \App\Filament\Resources\UserResource::getUrl() }}" color="primary">
                            <x-heroicon-o-users class="mr-2 h-4 w-4" />
                            Lietotāji
                        </x-filament::button>

                        <x-filament::button tag="a" href="{{ \App\Filament\Resources\SpecialDayResource::getUrl() }}" color="gray">
                            <x-heroicon-o-calendar-days class="mr-2 h-4 w-4" />
                            Kalendārs
                        </x-filament::button>

                        <x-filament::button tag="a" href="{{ \App\Filament\Resources\ChristmasLotteryResource::getUrl() }}" color="gray">
                            <x-heroicon-o-gift class="mr-2 h-4 w-4" />
                            Loterija
                        </x-filament::button>
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
                        <p class="text-sm text-gray-500 dark:text-gray-400">Apstiprināti</p>
                        <h3 class="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{{ \App\Models\User::where('is_approved', true)->count() }}</h3>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Aktīvie lietotāji</p>
                    </div>
                    <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                        <x-heroicon-o-check-badge class="h-6 w-6" />
                    </div>
                </div>
            </x-filament::section>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <x-filament::section>
                <x-slot name="heading">Ātrās darbības</x-slot>
                <x-slot name="description">Biežākie admin soļi, bez liekas navigācijas.</x-slot>

                <div class="grid gap-4 sm:grid-cols-2">
                    <a href="{{ \App\Filament\Resources\UserResource::getUrl('create') }}" class="group flex items-start gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/10 dark:hover:bg-white/5">
                        <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                            <x-heroicon-o-user-plus class="h-6 w-6" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-950 dark:text-white">Pievienot lietotāju</h3>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Izveido jaunu kontu ar vienu klikšķi.</p>
                        </div>
                    </a>

                    <a href="{{ \App\Filament\Resources\SpecialDayResource::getUrl('create') }}" class="group flex items-start gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/10 dark:hover:bg-white/5">
                        <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                            <x-heroicon-o-calendar-days class="h-6 w-6" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-950 dark:text-white">Pievienot notikumu</h3>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Jauna svarīga diena kalendāram.</p>
                        </div>
                    </a>

                    <a href="{{ \App\Filament\Resources\ChristmasLotteryResource::getUrl('create') }}" class="group flex items-start gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/10 dark:hover:bg-white/5">
                        <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                            <x-heroicon-o-gift class="h-6 w-6" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-950 dark:text-white">Ģenerēt loteriju</h3>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Sagatavo jaunu dāvanu pāru sadali.</p>
                        </div>
                    </a>

                    <a href="{{ url('/calendar') }}" class="group flex items-start gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/10 dark:hover:bg-white/5">
                        <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
                            <x-heroicon-o-eye class="h-6 w-6" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-950 dark:text-white">Skatīt publisko kalendāru</h3>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Pārbaudi, kā front-end redz lietotāji.</p>
                        </div>
                    </a>
                </div>
            </x-filament::section>

            <x-filament::section>
                <x-slot name="heading">Ko darīt šodien</x-slot>
                <x-slot name="description">Īss admin darbību ceļvedis.</x-slot>

                <div class="space-y-4">
                    <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">1. Pārbaudi lietotājus</p>
                        <p class="mt-1 text-sm text-gray-700 dark:text-gray-200">Skaties profilus, statusus un apstiprinājumus.</p>
                    </div>

                    <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">2. Uzturi kalendāru</p>
                        <p class="mt-1 text-sm text-gray-700 dark:text-gray-200">Namedays, surnamedays un īpašie notikumi vienā sistēmā.</p>
                    </div>

                    <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">3. Pārvaldi loteriju</p>
                        <p class="mt-1 text-sm text-gray-700 dark:text-gray-200">Ētri skaties vai ģenerē Ziemassvētku pārus.</p>
                    </div>
                </div>
            </x-filament::section>
        </div>
    </div>
</x-filament::page>
