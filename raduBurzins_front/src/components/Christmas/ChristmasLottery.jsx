import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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
                const lotteryResponse = await axios.get('http://127.0.0.1:8000/api/christmas-lottery', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });

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
        data.year === currentYear.toString() &&
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
        <div className="py-8 sm:py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-5xl font-bold mb-2">
                        🎄 Ziemassvētki {currentYear} 🎄
                    </h1>
                </div>

                <div className="card backdrop-blur-sm border border-medium-purple/30 shadow-2xl">
                    {currentUserData ? (
                        <div className="text-center py-6 sm:py-8">
                            <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-dark-purple">
                                🎅 Kam tu diez būsi slepenais vecīts? 🎅
                            </h3>

                            {!revealed ? (
                                <div className="space-y-6">
                                    <p className="text-sm sm:text-base text-medium-purple font-semibold">Spied uz dāvanu! ✨</p>
                                    <button
                                        onClick={handleReveal}
                                        role="button"
                                        tabIndex="0"
                                        onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
                                        className={`text-6xl sm:text-7xl p-6 sm:p-8 rounded-full mx-auto block transition-all ${
                                            shuffling 
                                                ? 'animate-spin scale-110 drop-shadow-2xl' 
                                                : 'hover:scale-125 hover:drop-shadow-2xl active:scale-95'
                                        }`}
                                    >
                                        🎁
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-gradient-to-r from-medium-purple/20 to-light-purple/20 rounded-lg p-6 sm:p-8 border border-medium-purple/50">
                                        <p className="text-xs sm:text-sm text-light-purple mb-3 font-semibold">TAV SLEPENAIS SAŅĒMĒJS:</p>
                                        <h4 className="text-2xl sm:text-3xl font-bold text-dark-purple mb-4">
                                            {currentUserData.recipient.name}
                                        </h4>
                                        <p className="text-sm sm:text-base text-medium-purple mb-2">
                                            ✨ Tu būsi viņa/viņš slepenais vecīts! ✨
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-left py-6 sm:py-8">
                            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-dark-purple flex items-center gap-2">
                                ⭐ Mazā Zvaigznīte
                            </h3>
                            <div className="space-y-4 text-medium-purple leading-relaxed text-sm sm:text-base bg-warm-beige/30 rounded-lg p-4 sm:p-6 border border-warm-beige/50">
                                <p>Reiz, augstu debesīs, dzīvoja ļoti maza zvaigznīte. Tā bija tik maza, ka gandrīz neviens viņu neredzēja, kad spožākās zvaigznes spīdēja virs pasaules. Viņa bieži skuma un domāja: <span className="italic">"Kāda gan ir mana nozīme, ja visi skatās tikai uz lielajām?"</span></p>
                                <p>Tuvojās Ziemassvētki. Eņģeļi debesīs rosījās, lai sagatavotu nakti, kad cilvēki atceras par mīlestību. Un eņģeļi ievēroja mazo zvaigznīti.</p>
                                <p><span className="font-semibold text-dark-purple">"Mēs tieši tevi gaidījām,"</span> smaidīja viņi. <span className="italic">"Zemē ir kāds mazs bērns, kurš jūtas vientuļš. Viņam nepieciešama tava gaismiņa."</span></p>
                                <p>Zvaigznīte pārsteigumā iemirdzējās. Viņa nolaidās pie bērna loga, atstājot mazu gaismas stariņu.</p>
                                <p className="pt-2 border-t border-warm-beige/40">
                                    <span className="font-semibold text-dark-purple">No tās nakts</span> mazā zvaigznīte saprata: svarīgi ir būt īstajā vietā, īstajā brīdī, un ar savu gaismiņu dāvāt prieku kādam. 💫
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
