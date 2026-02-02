import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Shield, Save, Building, CheckCircle, AlertCircle, MessageSquare, Send, RefreshCw, AlertTriangle } from 'lucide-react';

const Settings = () => {
    const { user, updateUser, updatePassword, globalSettings, updateSettings, sendMessage, resetDatabase } = useAppContext();

    // Local states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState(user?.phone || '');
    const [profilePic, setProfilePic] = useState(user?.profilePic || '');
    const [message, setMessage] = useState({ type: '', text: '' });

    const [settingsForm, setSettingsForm] = useState(globalSettings || {});

    // Contact Admin state
    const [contactSubject, setContactSubject] = useState('Remarque');
    const [contactMessage, setContactMessage] = useState('');

    // Sync form with global settings if they change externally or on load
    useEffect(() => {
        if (globalSettings) {
            setSettingsForm(globalSettings);
        }
    }, [globalSettings]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();

        // Update profile (phone, pic)
        updateUser({ ...user, phone, profilePic });

        // Update password if fields are filled
        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                showMessage('danger', 'Les mots de passe ne correspondent pas.');
                return;
            }
            updatePassword(password);
            showMessage('success', 'Profil et mot de passe mis à jour.');
            setPassword('');
            setConfirmPassword('');
        } else {
            showMessage('success', 'Profil mis à jour avec succès.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSettingsUpdate = (e) => {
        e.preventDefault();
        updateSettings(settingsForm);
        showMessage('success', 'Configuration de l\'entreprise enregistrée avec succès.');
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // Using INTERNAL MESSAGING SYSTEM instead of mailto
        sendMessage(user, contactSubject, contactMessage);

        showMessage('success', 'Message envoyé à l\'administration avec succès.');
        setContactMessage('');
    };

    const handleResetDatabase = () => {
        if (window.confirm("⚠️ ATTENTION : Cette action va effacer toutes les données locales (Missions, Utilisateurs ajoutés manuellement, Messages) pour restaurer la base initiale.\n\nÊtes-vous sûr de vouloir continuer ?")) {
            resetDatabase();
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="fw-bold mb-0">Paramètres</h2>
                {/* Global Feedback Toast */}
                {message.text && (
                    <div className={`fade-in d-flex align-items-center gap-2 px-3 py-2 rounded shadow-sm text-white ${message.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="fw-medium small">{message.text}</span>
                    </div>
                )}
            </div>

            <div className="row g-4">
                {/* PROFIL PERSO */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                            <User size={20} className="text-primary" />
                            <h5 className="mb-0 fw-bold">Mon Profil</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordChange}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Utilisateur</label>
                                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded shadow-sm border">
                                        <div className="position-relative">
                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold overflow-hidden" style={{ width: 64, height: 64 }}>
                                                {profilePic ? (
                                                    <img src={profilePic} alt="Profile" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <span className="display-6">{user.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <label htmlFor="pic-upload" className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 shadow-sm border cursor-pointer hover-scale" title="Changer la photo">
                                                <RefreshCw size={14} className="text-primary" />
                                                <input id="pic-upload" type="file" className="d-none" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark fs-5">{user.name}</div>
                                            <div className="text-muted small">{user.email}</div>
                                            <span className="badge bg-primary-subtle text-primary mt-1 small">{user.role}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Numéro de Téléphone</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="+213 XX XX XX XX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    <small className="text-muted">Généralement utilisé pour les ordres de mission.</small>
                                </div>

                                <hr className="my-4 text-muted opacity-25" />

                                <h6 className="fw-bold mb-3 text-dark">Sécurité</h6>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        minLength={5}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold">Confirmer</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        minLength={5}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 fw-bold d-flex justify-content-center align-items-center gap-2 transition-transform hover-scale">
                                    <Save size={18} /> Enregistrer
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* SETTINGS ADMIN (Uniquement visible pour les ADMINS) */}
                {['SUPER_ADMIN', 'ADMIN'].includes(user.role) && (
                    <div className="col-md-7">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                                <Building size={20} className="text-warning" />
                                <h5 className="mb-0 fw-bold">Configuration Entreprise</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSettingsUpdate}>
                                    <p className="text-muted small mb-4">Ces informations apparaîtront sur tous les documents officiels générés.</p>

                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Nom de l'Entreprise</label>
                                            <input
                                                type="text" className="form-control" required
                                                value={settingsForm.companyName || ''}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Adresse du Siège</label>
                                            <input
                                                type="text" className="form-control" required
                                                value={settingsForm.companyAddress || ''}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, companyAddress: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Téléphone</label>
                                            <input
                                                type="text" className="form-control"
                                                value={settingsForm.companyPhone || ''}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, companyPhone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Email Contact</label>
                                            <input
                                                type="email" className="form-control"
                                                value={settingsForm.companyEmail || ''}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, companyEmail: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border rounded-3 mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-3 text-dark">
                                            <Shield size={18} className="text-success" />
                                            <h6 className="mb-0 fw-bold">Politique de Frais</h6>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Indemnité Kilométrique</label>
                                                <div className="input-group">
                                                    <input
                                                        type="number" className="form-control"
                                                        value={settingsForm.kmRate || ''}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, kmRate: Number(e.target.value) })}
                                                    />
                                                    <span className="input-group-text bg-white text-muted small">DA/km</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-dark">Alerte Budget (Seuil)</label>
                                                <div className="input-group">
                                                    <input
                                                        type="number" className="form-control"
                                                        value={settingsForm.budgetLimit || ''}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, budgetLimit: Number(e.target.value) })}
                                                    />
                                                    <span className="input-group-text bg-white text-muted small">DA</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <button type="button" onClick={handleResetDatabase} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
                                            <AlertTriangle size={16} /> Réinitialiser Données
                                        </button>

                                        <button type="submit" className="btn btn-warning text-dark fw-bold px-4 d-flex align-items-center gap-2 transition-transform hover-scale">
                                            <Save size={18} /> Enregistrer Modifications
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* FEEDBACK USER (Uniquement visible pour les UTILISATEURS) */}
                {!['SUPER_ADMIN', 'ADMIN'].includes(user.role) && (
                    <div className="col-md-7">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center gap-2">
                                <MessageSquare size={20} className="text-info" />
                                <h5 className="mb-0 fw-bold">Contacter l'Administration</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleContactSubmit}>
                                    <p className="text-muted small mb-4">Utilisez ce formulaire pour envoyer une remarque, signaler un problème ou faire une demande spéciale directement à M. Bahloul.</p>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Objet</label>
                                        <select
                                            className="form-select"
                                            value={contactSubject}
                                            onChange={(e) => setContactSubject(e.target.value)}
                                        >
                                            <option value="Remarque">Remarque ou Suggestion</option>
                                            <option value="Problème">Signalement de Problème</option>
                                            <option value="Demande">Demande Spéciale</option>
                                            <option value="Urgent">Urgence / Blocage</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">Votre Message</label>
                                        <textarea
                                            className="form-control"
                                            rows="6"
                                            placeholder="Écrivez votre message ici..."
                                            required
                                            value={contactMessage}
                                            onChange={(e) => setContactMessage(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="d-flex justify-content-end">
                                        <button type="submit" className="btn btn-info text-white fw-bold px-4 d-flex align-items-center gap-2 transition-transform hover-scale">
                                            <Send size={18} /> Envoyer à M. Bahloul
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
