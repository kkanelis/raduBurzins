import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TermsPopup from './TermsPopup';
import RulesPopup from './RulesPopup';

function Register() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        nickname: '',
        date_of_birth: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
        rules: false,
    });
    const [error, setError] = useState('');
    const [showTerms, setShowTerms] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const [dob, setDob] = useState({ day: '', month: '', year: '' });

    const handleDobChange = (e) => {
        const { name, value } = e.target;
        const newDob = { ...dob, [name]: value };
        setDob(newDob);

        if (newDob.day && newDob.month && newDob.year) {
            setFormData({
                ...formData,
                date_of_birth: `${newDob.year}-${String(newDob.month).padStart(2, '0')}-${String(newDob.day).padStart(2, '0')}`,
            });
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
        'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/RegWelcome');
        } catch (err) {
            setError(err.response?.data?.message || 'Reģistrācijas kļūda. Lūdzu, mēģiniet vēlreiz.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="card w-full max-w-2xl">
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold">📝 Reģistrācija</h2>
                </div>

                {error && (
                    <div className="p-3 mb-4 bg-red-50 text-red-700 rounded">❌ {error}</div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Vārds *</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Jānis" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Uzvārds *</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Bērzs" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Iesauka</label>
                        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="JB2024" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Dzimšanas datums</label>
                        <div className="grid grid-cols-3 gap-2">
                            <select name="day" value={dob.day} onChange={handleDobChange} className="rounded-md border border-black/30 px-2 py-2 bg-white/80">
                                <option value="">Diena</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select name="month" value={dob.month} onChange={handleDobChange} className="rounded-md border border-black/30 px-2 py-2 bg-white/80">
                                <option value="">Mēnesis</option>
                                {months.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                            </select>
                            <select name="year" value={dob.year} onChange={handleDobChange} className="rounded-md border border-black/30 px-2 py-2 bg-white/80">
                                <option value="">Gads</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <p className="text-sm text-muted mt-2">💡 Ja pievienosiet savu dzimšanas datumu, tas tiks rādīts kopējā kalendārā.</p>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Telefona numurs *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+371 2X XXX XXX" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">E-pasts *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="tavs.epasts@example.com" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Parole *</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-muted mb-1">Apstipriniet paroli *</label>
                        <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required placeholder="••••••••" className="w-full rounded-md border border-black/30 px-3 py-2 bg-white/80" />
                    </div>

                    <div className="col-span-1 flex items-start gap-3 mt-2">
                        <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} required id="terms" className="mt-1" />
                        <label htmlFor="terms" className="text-sm">Es piekrītu <button type="button" className="text-accent-2 text-blue-400" onClick={() => setShowTerms(true)}>lietošanas noteikumiem</button></label>
                    </div>

                    <div className="col-span-1 flex items-start gap-3 mt-2">
                        <input type="checkbox" name="rules" checked={formData.rules} onChange={handleChange} required id="rules" className="mt-1" />
                        <label htmlFor="rules" className="text-sm">Es piekrītu <button type="button" className="text-accent-2 text-blue-400" onClick={() => setShowRules(true)}>mājaslapas noteikumiem</button></label>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <button type="submit" className="btn-primary w-full">✨ Reģistrēties</button>
                    </div>
                </form>

                <p className="mt-4 text-center text-sm">Jau esat reģistrējies? <a href="/login" className="text-accent-2">Pieslēdzieties</a></p>
            </div>

            {showTerms && <TermsPopup onClose={() => setShowTerms(false)} />}
            {showRules && <RulesPopup onClose={() => setShowRules(false)} />}
        </div>
    );
}

export default Register;