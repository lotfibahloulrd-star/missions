import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
    const { login } = useAppContext();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulation d'un petit délai pour l'effet premium
        setTimeout(() => {
            if (login(email, password)) {
                navigate('/');
            } else {
                setError('Email ou mot de passe incorrect.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logos-container">
                        <img src="/logo.jpg" alt="ESCLAB Logo" className="logo-item" />
                        <div style={{ width: '2px', height: '40px', background: '#e2e8f0' }}></div>
                        <img src="/logo_ecc.png" alt="ECC Logo" className="logo-item" />
                    </div>
                    <h1 className="login-title">MissionDz</h1>
                    <p className="login-subtitle">Plateforme de Gestion de Missions</p>
                </div>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="custom-input-group">
                        <label className="form-label">Email Professionnel</label>
                        <div className="position-relative">
                            <i><Mail size={20} /></i>
                            <input
                                type="email"
                                className="custom-form-control"
                                placeholder="votre.email@esclab-algerie.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="custom-input-group">
                        <label className="form-label">Mot de Passe</label>
                        <div className="position-relative">
                            <i><Lock size={20} /></i>
                            <input
                                type="password"
                                className="custom-form-control"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button d-flex align-items-center justify-content-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <>
                                Se Connecter <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-4 text-xs text-slate-400" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    © {new Date().getFullYear()} SARL ESCLAB & ECC. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};

export default Login;
