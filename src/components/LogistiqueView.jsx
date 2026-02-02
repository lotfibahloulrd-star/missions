import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Truck, MapPin, User, Calendar, CheckCircle2, Clock, FastForward, Filter } from 'lucide-react';

const LogistiqueView = () => {
    const { allMissions, usersDb, user } = useAppContext();
    const [activeTab, setActiveTab] = useState('ongoing');

    // Date calculations for "Saturday to Thursday"
    const getWeekBounds = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const day = now.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat

        // Get the nearest preceding Saturday
        const diffToSat = (day === 6) ? 0 : -(day + 1);
        const start = new Date(now);
        start.setDate(now.getDate() + diffToSat);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 5); // Sat + 5 = Thu
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    const bounds = getWeekBounds();
    const satStr = bounds.start.toISOString().split('T')[0];
    const thuStr = bounds.end.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    // Role-based filtering
    let scopeMissions = [];
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'LOGISTIQUE' || user?.name === 'Mohamed OUALI') {
        scopeMissions = allMissions;
    } else if (user?.role === 'ADMIN') {
        // Filter missions for the manager's team
        scopeMissions = allMissions.filter(m => {
            const employee = usersDb.find(u => u.id === m.userId);
            return employee?.department === user.department;
        });
    }

    // Grouping
    const closedMissions = scopeMissions.filter(m => m.status === 'Terminée');

    const ongoingMissions = scopeMissions.filter(m => {
        // Must be validated and within the Sat-Thu window or active today
        const isValidated = m.status === 'Validée';
        const inWeek = (m.dateStart <= thuStr && m.dateEnd >= satStr);
        return isValidated && inWeek;
    });

    const upcomingMissions = scopeMissions.filter(m => {
        return m.status === 'Validée' && m.dateStart > thuStr;
    });

    const getDisplayMissions = () => {
        switch (activeTab) {
            case 'ongoing': return ongoingMissions;
            case 'upcoming': return upcomingMissions;
            case 'closed': return closedMissions;
            default: return ongoingMissions;
        }
    };

    const currentMissions = getDisplayMissions();

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Suivi Logistique</h2>
                    <p className="text-muted mb-0">
                        {user.role === 'ADMIN' ? `Suivi des missions de l'équipe ${user.department}` : 'Vue d\'ensemble des déplacements et de la flotte.'}
                    </p>
                </div>
                <div className="text-end">
                    <span className="badge bg-light text-dark border p-2">
                        <Calendar size={14} className="me-2 text-primary" />
                        Semaine du {bounds.start.toLocaleDateString('fr-FR')} au {bounds.end.toLocaleDateString('fr-FR')}
                    </span>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-2">
                    <ul className="nav nav-pills nav-fill gap-2">
                        <li className="nav-item">
                            <button
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 py-2 ${activeTab === 'ongoing' ? 'active shadow-sm' : 'text-dark'}`}
                                onClick={() => setActiveTab('ongoing')}
                            >
                                <Clock size={18} />
                                <span className="d-none d-md-inline">Missions en cours (Semaine)</span>
                                <span className="badge bg-white text-primary ms-1">{ongoingMissions.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 py-2 ${activeTab === 'upcoming' ? 'active shadow-sm' : 'text-dark'}`}
                                onClick={() => setActiveTab('upcoming')}
                            >
                                <FastForward size={18} />
                                <span className="d-none d-md-inline">Missions à venir</span>
                                <span className="badge bg-white text-primary ms-1">{upcomingMissions.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 py-2 ${activeTab === 'closed' ? 'active shadow-sm' : 'text-dark'}`}
                                onClick={() => setActiveTab('closed')}
                            >
                                <CheckCircle2 size={18} />
                                <span className="d-none d-md-inline">Missions clôturées</span>
                                <span className="badge bg-white text-primary ms-1">{closedMissions.length}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4 border-0">Collaborateur</th>
                                <th className="border-0">Destinations</th>
                                <th className="border-0">Véhicule</th>
                                <th className="border-0">Période</th>
                                <th className="pe-4 border-0 text-end">État</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMissions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <div className="d-flex flex-column align-items-center gap-3">
                                            <Filter size={48} className="opacity-25" />
                                            <p>Aucune mission trouvée pour cette catégorie.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentMissions.map(m => {
                                    const employee = usersDb.find(u => u.id === m.userId);
                                    const isCurrentlyActive = todayStr >= m.dateStart && todayStr <= m.dateEnd;

                                    return (
                                        <tr key={m.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{employee?.name || 'Collaborateur inconnu'}</div>
                                                        <div className="small text-muted">{employee?.department || 'Département non spécifié'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(m.destinations || [m.destination]).map((dest, i) => (
                                                        <span key={i} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                                                            <MapPin size={12} className="text-danger" />
                                                            {dest}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Truck size={16} className="text-muted" />
                                                    <span className="small fw-medium">
                                                        {m.vehicle === 'service' ? 'Véhicule de service' :
                                                            m.vehicle === 'personal' ? 'Véhicule personnel' :
                                                                m.vehicle || 'Non spécifié'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="small">
                                                    <div className="fw-medium text-dark">Du {new Date(m.dateStart).toLocaleDateString('fr-FR')}</div>
                                                    <div className="text-muted">Au {new Date(m.dateEnd).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end">
                                                {activeTab === 'closed' ? (
                                                    <span className="badge bg-secondary-subtle text-secondary px-3 py-2 border">Terminée</span>
                                                ) : activeTab === 'upcoming' ? (
                                                    <span className="badge bg-info-subtle text-info px-3 py-2 border">Prévue</span>
                                                ) : (
                                                    <span className={`badge ${isCurrentlyActive ? 'bg-success shadow-sm' : 'bg-warning-subtle text-warning border border-warning'} px-3 py-2`}>
                                                        {isCurrentlyActive ? 'Sur le terrain' : 'Programmé'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="row g-3 mt-3">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm bg-primary text-white">
                        <div className="card-body">
                            <h6 className="small text-uppercase opacity-75">Scope Actuel</h6>
                            <h4 className="fw-bold mb-0">{currentMissions.length} Missions</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="small text-uppercase text-muted">Total Toutes Catégories</h6>
                            <h4 className="fw-bold mb-0 text-dark">{scopeMissions.length}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogistiqueView;
