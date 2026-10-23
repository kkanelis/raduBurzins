import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import api from '../../services/api';

const ChristmasLottery = () => {
    const { user } = useAuth();
    const [lotteryData, setLotteryData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);
    const [shuffling, setShuffling] = useState(false);

    useEffect(() => {
        const fetchLotteryData = async () => {
            try {
                const lotteryResponse = await api.get('/api/christmas-lottery');

                setLotteryData(lotteryResponse.data.assignments);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load lottery data');
            } finally {
                setLoading(false);
            }
        };

        fetchLotteryData();
    }, []);

    if (loading) return (
        <div className="py-12 px-4">
            <div className="max-w-3xl mx-auto card text-center animate-pulse">🎄 Ielādējas...</div>
        </div>
    );

    const currentYear = new Date().getFullYear();

    const currentUserData = lotteryData?.find(data =>
        String(data.year) === String(currentYear) &&
        data.giver.id === user.id
    );

    const handleReveal = () => {
        setShuffling(true);

        // play sound
        const audio = new Audio('/sounds/jingle.mp3');
        audio.play();

        setTimeout(() => {
            setShuffling(false);
            setRevealed(true);
        }, 2500);
    };

    return (
        <div className="relative overflow-hidden px-4 py-8 sm:py-12">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-6 top-10 h-32 w-32 rounded-full bg-[#ffe3c2]/80 blur-2xl" />
                <div className="absolute right-8 top-16 h-40 w-40 rounded-full bg-[#e8ddff]/80 blur-2xl" />
                <div className="absolute bottom-8 left-1/3 h-36 w-36 rounded-full bg-[#fff1b8]/80 blur-2xl" />
            </div>

            <div className="relative mx-auto max-w-4xl">
                <div className="mb-7 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f0d8b0] bg-[#fffaf2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d653a]">
                        <span>🎄</span>
                        <span>Ziemassvētki</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-[#2c1c2d] sm:text-5xl">
                        {currentYear}
                    </h1>
                </div>

                {error && (
                    <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-[28px] border border-[#f2e3d2] bg-[#fffdf9] p-4 shadow-[0_18px_40px_rgba(86,65,82,0.08)] sm:p-6">
                    {currentUserData ? (
                        <div className="text-center">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#f5efe8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5d3f4d]">
                                <span>🎅</span>
                                <span>Slepenais vecītis</span>
                            </div>

                            {!revealed ? (
                                <div className="space-y-5 py-2">
                                    <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#7f5d84]">
                                        Uzspied uz dāvanas
                                    </p>
                                    <button
                                        onClick={handleReveal}
                                        role="button"
                                        tabIndex="0"
                                        onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
                                        className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#f0d8b8] bg-[linear-gradient(135deg,#fff7d9,#f9e4f5,#e8ecff)] text-5xl shadow-[0_12px_30px_rgba(117,93,143,0.18)] transition-all duration-300 sm:h-28 sm:w-28 ${
                                            shuffling
                                                ? 'animate-spin scale-110'
                                                : 'hover:-translate-y-1 hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        🎁
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2">
                                    <div className="mx-auto max-w-lg rounded-[24px] border border-[#ebddff] bg-[#f9f4ff] p-6 text-center shadow-sm">
                                        <h4 className="text-2xl font-black text-[#2d1d34] sm:text-3xl">
                                            {currentUserData.recipient.name}
                                        </h4>
                                        <p className="mt-4 text-sm text-[#5c4366]">
                                            Tu būsi viņa/viņš slepenais vecītis! 🎁
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-3 sm:py-5">
                            <div className="mb-5 flex items-center justify-center gap-3 text-[#2d1d34]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1a8] text-xl">⭐</div>
                                <h3 className="text-2xl font-bold">Mazā Zvaigznīte</h3>
                            </div>

                            <div className="space-y-4 rounded-[22px] border border-[#f2e7d3] bg-[#fffaf3] p-5 text-left text-base leading-relaxed text-[#4c3d4f] sm:p-6">
                                <p>
                                    Reiz, augstu debesīs, dzīvoja ļoti maza zvaigznīte. Tā bija tik maza, ka gandrīz neviens viņu neredzēja, kad spožākās zvaigznes spīdēja virs pasaules. Viņa bieži skuma un domāja: <span className="italic text-[#2d1d34]">“Kāda gan ir mana nozīme, ja visi skatās tikai uz lielajām?”</span>
                                </p>
                                <p>
                                    Tuvojās Ziemassvētki. Eņģeļi debesīs rosījās, lai sagatavotu nakti, kad cilvēki atceras par mīlestību. Un eņģeļi ievēroja mazo zvaigznīti.
                                </p>
                                <p>
                                    <span className="font-semibold text-[#2d1d34]">“Mēs tieši tevi gaidījām,”</span> smaidīja viņi. <span className="italic">“Zemē ir kāds mazs bērns, kurš jūtas vientuļš. Viņam nepieciešama tava gaismiņa.”</span>
                                </p>
                                <p>
                                    Zvaigznīte pārsteigumā iemirdzējās. Viņa nolaidās pie bērna loga, atstājot mazu gaismas stariņu.
                                </p>
                                <p className="border-t border-[#eadfc7] pt-3 text-[#2d1d34]">
                                    <span className="font-semibold">No tās nakts</span> mazā zvaigznīte saprata: svarīgi ir būt īstajā vietā, īstajā brīdī, un ar savu gaismiņu dāvāt prieku kādam. 💫
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChristmasLottery;
