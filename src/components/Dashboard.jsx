import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Briefcase, CheckCircle, Clock, TrendingUp, Plus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="card h-100 border-0 shadow-sm">
        <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className={`p-3 rounded-3 ${bgClass} ${colorClass}`}>
                    <Icon size={24} />
                </div>
                <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1">
                    <TrendingUp size={12} /> +12%
                </span>
            </div>
            <h6 className="card-subtitle text-muted mb-1">{title}</h6>
            <h2 className="card-title fw-bold mb-0">{value}</h2>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, missions, messagesDb, markMessageAsRead } = useAppContext();
    const myMessages = messagesDb.filter(m => m.toUserId === user.id);
    const activeMissions = missions.filter(m => m.status === 'Validée').length;
    const pendingMissions = missions.filter(m => m.status === 'En Attente').length;

    return (
        <div className="container-fluid p-0">
            {/* Welcome Banner */}
            <div className="card bg-primary text-white mb-4 border-0 shadow">
                <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 className="fw-bold">Bon retour, {user.name} !</h2>
                        <p className="mb-0 text-white-50">Vous avez {pendingMissions} missions en attente de traitement.</p>
                    </div>
                    <Link to="/new-mission" className="btn btn-light text-primary fw-bold d-flex align-items-center gap-2">
                        <Plus size={18} /> Nouvelle Mission
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <StatCard
                        title="Missions Actives"
                        value={activeMissions}
                        icon={Briefcase}
                        colorClass="text-primary"
                        bgClass="bg-primary-subtle"
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        title="En Attente"
                        value={pendingMissions}
                        icon={Clock}
                        colorClass="text-warning"
                        bgClass="bg-warning-subtle"
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        title="Missions Terminées"
                        value="14"
                        icon={CheckCircle}
                        colorClass="text-success"
                        bgClass="bg-success-subtle"
                    />
                </div>
            </div>


            {/* ALERTS / MESSAGES */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 fw-bold text-danger">Notifications & Rappels</h5>
                </div>
                <div className="list-group list-group-flush">
                    {missions.filter(m => m.status === 'Validée' && !m.visitReport && (new Date() - new Date(m.dateEnd)) > 0).length > 0 && (
                        <div className="list-group-item bg-warning-subtle text-dark border-0 p-3 mb-2 rounded-3 mx-3 mt-3">
                            <strong>Attention :</strong> Vous avez des missions terminées sans rapport. Veuillez les régulariser.
                        </div>
                    )}

                    {myMessages.length === 0 ? (
                        <div className="p-4 text-center text-muted">Aucun nouveau message.</div>
                    ) : (
                        myMessages.map(msg => (
                            <div key={msg.id} className={`list-group-item p-3 ${!msg.read ? 'bg-light fw-bold' : ''}`}>
                                <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1">{msg.subject}</h6>
                                    <small>{msg.date}</small>
                                </div>
                                <p className="mb-1 small text-muted">{msg.content}</p>
                                {!msg.read && (
                                    <button onClick={() => markMessageAsRead(msg.id)} className="btn btn-sm btn-link text-decoration-none p-0">Marquer comme lu</button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Missions */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Missions Récentes</h5>
                    <Link to="/missions" className="btn btn-sm btn-outline-primary">Tout voir</Link>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="py-3 ps-4">Destination</th>
                                <th className="py-3">Période</th>
                                <th className="py-3">Budget</th>
                                <th className="py-3 pe-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions.map((mission) => (
                                <tr key={mission.id}>
                                    <td className="ps-4 fw-medium">{(mission.destinations || [mission.destination || 'N/A']).join(', ')}</td>
                                    <td className="text-muted">{mission.dateStart} au {mission.dateEnd}</td>
                                    <td className="fw-bold text-dark">{mission.budget ? mission.budget.toLocaleString() : '0'} DA</td>
                                    <td className="pe-4">
                                        <span className={`badge rounded-pill ${mission.status === 'Validée' ? 'bg-success' : 'bg-warning text-dark'
                                            }`}>
                                            {mission.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
