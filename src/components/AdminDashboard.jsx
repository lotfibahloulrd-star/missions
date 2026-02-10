import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateMissionOrder, generateVisitReportPDF } from '../utils/pdfGenerator';
import { Users, ClipboardCheck, TrendingUp, AlertCircle, UserPlus, Trash2, Mail, CheckCircle, Edit, Save, X, FileText, Download, Archive, Printer, Eye } from 'lucide-react';
import MissionPreviewModal from './MissionPreviewModal';
import EmployeeMap from './EmployeeMap';
import { Map as MapIcon, Navigation } from 'lucide-react';

const AdminDashboard = () => {
    const { user, allMissions, usersDb, updateMissionStatus, addUser, updateUser, deleteUser, messagesDb, markMessageAsRead, deleteMessage, deleteMission, globalSettings } = useAppContext();

    // Form & UI States
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' });
    const [previewingMission, setPreviewingMission] = useState(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('missions'); // 'missions', 'messages', 'team', 'analytics', 'archive', 'map'

    // Monthly Analytics Logic
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentMonthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const monthlyMissions = allMissions.filter(m => {
        const d = new Date(m.dateStart);
        return d.getMonth() === currentMonth && d.getFullYear() === now.getFullYear();
    });

    const monthlyBudget = monthlyMissions.reduce((acc, m) => acc + (m.budget || 0), 0);
    const missionsByDept = monthlyMissions.reduce((acc, m) => {
        const ownerId = m.userId || m.userIds?.[0];
        const emp = usersDb.find(u => u.id === ownerId);
        const dept = emp?.department || 'AUTRE';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    // BASIC STATS
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.department === 'RH';
    // Strictly restrict Map to Lotfi only as requested
    const isLotfi = user?.email === 'l.bahloul@esclab-algerie.com' || user?.email === 'lotfi.bahloul@esclab-algerie.com' || user?.email === 'l.bahloul@esclab-academy.com';
    const isBoss = user.role === 'SUPER_ADMIN' || user.department === 'RH'; // used for analytics tab
    const isPrivileged = ['ADMIN', 'MANAGER'].includes(user.role); // limited view for admins/managers
    const relevantMissions = isSuperAdmin
        ? allMissions
        : allMissions.filter(m => {
            const ownerId = m.userId || m.userIds?.[0];
            const missionUser = usersDb.find(u => u.id === ownerId);
            return missionUser?.department === user.department;
        });

    const relevantUsers = isSuperAdmin
        ? usersDb
        : usersDb.filter(u => u.role !== 'SUPER_ADMIN' && u.department === user.department);

    const totalMissions = relevantMissions.length;
    const pendingValidation = relevantMissions.filter(m => m.status === 'En Attente').length;
    const totalBudgetParams = allMissions.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    const myMessages = messagesDb.filter(m => m.toUserId === user.id);
    const unreadMessages = myMessages.filter(m => !m.read).length;

    // HANDLERS
    const handleAddUser = (e) => {
        e.preventDefault();
        addUser(userForm);
        resetUserForm();
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        const updatedUser = { ...userForm, id: editingUserId };
        updateUser(updatedUser);
        resetUserForm();
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ? Cette action est irréversible.')) {
            deleteUser(userId);
        }
    };

    const startEditUser = (user) => {
        setUserForm(user);
        setIsEditing(true);
        setEditingUserId(user.id);
        setShowUserForm(true);
        setActiveTab('team');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetUserForm = () => {
        setUserForm({ name: '', email: '', password: '', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' });
        setIsEditing(false);
        setEditingUserId(null);
        setShowUserForm(false);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Supervision Globale</h2>
                    <p className="text-muted">Vue d'ensemble de la flotte technique.</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`btn btn-outline-dark d-flex align-items-center gap-2 ${activeTab === 'team' ? 'active' : ''}`}
                    >
                        <Users size={18} /> Équipe
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`btn btn-outline-dark d-flex align-items-center gap-2 position-relative ${activeTab === 'messages' ? 'active' : ''}`}
                    >
                        <Mail size={18} /> Messagerie
                        {unreadMessages > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {unreadMessages}
                            </span>
                        )}
                    </button>
                    {isLotfi && (
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`btn btn-outline-dark d-flex align-items-center gap-2 ${activeTab === 'map' ? 'active' : ''}`}
                        >
                            <MapIcon size={18} /> Carte
                        </button>
                    )}
                    {isBoss && (
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`btn btn-outline-primary d-flex align-items-center gap-2 ${activeTab === 'analytics' ? 'active' : ''}`}
                        >
                            <TrendingUp size={18} /> Récap Mensuel
                        </button>
                    )}
                </div>
            </div>

            {/* KPI ADMIN */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 cursor-pointer" onClick={() => setActiveTab('team')}>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-2 text-primary">
                                <Users className="me-2" size={20} />
                                <span className="fw-bold small text-uppercase">Effectif</span>
                            </div>
                            <h3 className="fw-bold mb-0">{relevantUsers.length}</h3>
                            <small className="text-muted">Technico-Comm.</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 cursor-pointer" onClick={() => setActiveTab('missions')}>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-2 text-warning">
                                <ClipboardCheck className="me-2" size={20} />
                                <span className="fw-bold small text-uppercase">À Valider</span>
                            </div>
                            <h3 className="fw-bold mb-0">{pendingValidation}</h3>
                            <small className="text-muted">Demandes en attente</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    {/* Clickable KPI for Messages */}
                    <div className="card border-0 shadow-sm h-100 cursor-pointer" onClick={() => setActiveTab('messages')}>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-2 text-info">
                                <Mail className="me-2" size={20} />
                                <span className="fw-bold small text-uppercase">Messagerie</span>
                            </div>
                            <h3 className="fw-bold mb-0">{unreadMessages}</h3>
                            <small className="text-muted">Non lus</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-success text-white cursor-pointer" onClick={() => setActiveTab('archive')}>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-2 text-white-50">
                                <Archive className="me-2" size={20} />
                                <span className="fw-bold small text-uppercase">Missions Clôturées</span>
                            </div>
                            <h3 className="fw-bold mb-0">{relevantMissions.filter(m => m.status === 'Clôturée').length}</h3>
                            <small className="text-white-50">Voir l'historique</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB: MISSIONS (DEFAULT) */}
            {activeTab === 'missions' && (
                <div className="card border-0 shadow-sm animate-fade-in">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">Dernières Demandes de Mission</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Employé</th>
                                    <th>Destination</th>
                                    <th>Dates</th>
                                    <th>Justificatif</th>
                                    <th>Statut</th>
                                    <th className="text-end pe-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantMissions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            Aucune mission à afficher pour le moment.
                                        </td>
                                    </tr>
                                )}
                                {relevantMissions.map(mission => {
                                    const employee = usersDb.find(u => u.id === mission.userId);
                                    return (
                                        <tr key={mission.id} style={{ cursor: 'pointer' }} onClick={() => setPreviewingMission(mission)}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-light rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                        <span className="fw-bold small text-primary">{employee?.name ? employee.name.charAt(0) : '?'}</span>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold small">{employee?.name || 'Inconnu'}</div>
                                                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                                            {employee?.region}
                                                            {mission.userIds?.length > 1 && <span className="badge bg-info-subtle text-info ms-1" style={{ fontSize: '0.6rem' }}>ÉQUIPE</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="fw-medium small">
                                                    {(mission.destinations || [mission.destination || 'Non spécifié']).join(' • ')}
                                                </span>
                                            </td>
                                            <td className="small text-muted">{mission.dateStart} - {mission.dateEnd}</td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {mission.budget > 10000 ? '⚠️ Budget Élevé' : 'Standard'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${mission.status === 'Validée' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {mission.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="d-flex justify-content-end gap-2 align-items-center">
                                                    <button
                                                        onClick={() => setPreviewingMission(mission)}
                                                        className="btn btn-sm btn-outline-info"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {mission.status === 'En Attente' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateMissionStatus(mission.id, 'Validée')}
                                                                className="btn btn-sm btn-success text-white d-flex align-items-center gap-1"
                                                            >
                                                                Valider
                                                            </button>
                                                            <button
                                                                onClick={() => updateMissionStatus(mission.id, 'Rejetée')}
                                                                className="btn btn-sm btn-outline-danger"
                                                            >
                                                                Rejeter
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            const mOwner = usersDb.find(u => u.id === (mission.userId || mission.userIds?.[0])) || user;
                                                            const pNames = (mission.userIds || []).map(id => usersDb.find(u => u.id === id)?.name).filter(Boolean);
                                                            generateMissionOrder({ ...mission, participants: pNames }, mOwner, globalSettings);
                                                        }}
                                                        className="btn btn-sm btn-outline-dark"
                                                        title="Imprimer Ordre de Mission"
                                                    >
                                                        <Printer size={14} />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Voulez-vous vraiment supprimer cette mission ?')) {
                                                                deleteMission(mission.id);
                                                            }
                                                        }}
                                                        className="btn btn-sm btn-outline-secondary text-danger border-0"
                                                        title="Supprimer la mission"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
                <div className="card border-0 shadow-sm animate-fade-in">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold text-info">Boîte de Réception</h5>
                        <span className="badge bg-light text-dark border">{myMessages.length} messages</span>
                    </div>
                    <div className="list-group list-group-flush">
                        {myMessages.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                <Mail size={48} className="mb-3 opacity-25" />
                                <p>Aucun message reçu pour le moment.</p>
                            </div>
                        )}
                        {myMessages.map(msg => (
                            <div key={msg.id} className={`list-group-item list-group-item-action p-4 ${!msg.read ? 'bg-light border-start border-4 border-info' : ''}`}>
                                <div className="d-flex w-100 justify-content-between mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="fw-bold">{msg.fromName}</div>
                                        {!msg.read && <span className="badge bg-info text-white">Nouveau</span>}
                                    </div>
                                    <small className="text-muted">{msg.date}</small>
                                </div>
                                <h6 className="mb-2 fw-bold">{msg.subject}</h6>
                                <p className="mb-3 text-muted" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>

                                <div className="d-flex gap-2">
                                    {!msg.read && (
                                        <button onClick={() => markMessageAsRead(msg.id)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                                            <CheckCircle size={14} /> Marquer comme lu
                                        </button>
                                    )}
                                    <button onClick={() => deleteMessage(msg.id)} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: TEAM (EDIT / DELETE) */}
            {activeTab === 'team' && (
                <div className="animate-fade-in">
                    {/* Add/Edit User Toggle Button */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Gestion de l'Équipe</h5>
                        <button onClick={() => {
                            if (showUserForm) resetUserForm();
                            else setShowUserForm(true);
                        }} className={`btn btn-sm d-flex align-items-center gap-2 ${showUserForm ? 'btn-secondary' : 'btn-primary'}`}>
                            {showUserForm ? <><X size={16} /> Annuler</> : <><UserPlus size={16} /> Ajouter Collaborateur</>}
                        </button>
                    </div>

                    {/* Add/Edit User Form */}
                    {showUserForm && (
                        <div className={`card border-0 shadow-sm mb-4 animate-fade-in ${isEditing ? 'bg-warning-subtle' : 'bg-slate-50'}`}>
                            <div className={`card-header py-2 ${isEditing ? 'bg-warning text-dark' : 'bg-transparent border-0'}`}>
                                {isEditing && <span className="fw-bold small d-flex align-items-center gap-2"><Edit size={14} /> Mode Modification : {userForm.name}</span>}
                            </div>
                            <div className="card-body">
                                <form onSubmit={isEditing ? handleUpdateUser : handleAddUser} className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Nom Complet</label>
                                        <input type="text" className="form-control" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Email</label>
                                        <input type="email" className="form-control" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Mot de Passe</label>
                                        <input type="text" className="form-control" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Département</label>
                                        <select className="form-select" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })}>
                                            <option value="COMMERCIAL">Commercial</option>
                                            <option value="TECHNIQUE">Technique</option>
                                            <option value="RH">Ressources Humaines</option>
                                            <option value="DIRECTION">Direction</option>
                                            <option value="LABORATOIRE">Laboratoire</option>
                                            <option value="LOGISTIQUE">Logistique</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Région</label>
                                        <input type="text" className="form-control" required value={userForm.region} onChange={e => setUserForm({ ...userForm, region: e.target.value })} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Rôle</label>
                                        <select className="form-select" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="USER">Utilisateur</option>
                                            <option value="LOGISTIQUE">Logistique</option>
                                            <option value="ADMIN">Administrateur</option>
                                            {user.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Administrateur</option>}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Téléphone</label>
                                        <input type="text" className="form-control" value={userForm.phone || ''} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button type="submit" className={`btn w-100 text-white fw-bold ${isEditing ? 'btn-warning text-dark' : 'btn-success'}`}>
                                            {isEditing ? 'Mettre à Jour' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Users List - Grouped or Flat */}
                    {isSuperAdmin ? (
                        <div className="d-flex flex-column gap-4">
                            {['COMMERCIAL', 'TECHNIQUE', 'RH', 'DIRECTION', 'LABORATOIRE'].map(dept => {
                                const deptUsers = usersDb.filter(u => u.department === dept);
                                if (deptUsers.length === 0) return null;
                                return (
                                    <div key={dept} className="card border-0 shadow-sm">
                                        <div className="card-header bg-light py-2">
                                            <h6 className="mb-0 fw-bold text-primary">ÉQUIPE {dept}</h6>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="ps-4">Collaborateur</th>
                                                        <th>Email</th>
                                                        <th>Rôle</th>
                                                        <th>Région</th>
                                                        <th>Mot de Passe</th>
                                                        <th className="text-end pe-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {deptUsers.map(u => (
                                                        <tr key={u.id}>
                                                            <td className="ps-4">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: 38, height: 38 }}>
                                                                        {u.name.charAt(0)}
                                                                    </div>
                                                                    <div className="fw-medium text-dark">{u.name}</div>
                                                                </div>
                                                            </td>
                                                            <td className="text-muted">{u.email}</td>
                                                            <td>
                                                                <span className={`badge ${u.role === 'SUPER_ADMIN' ? 'bg-danger' : u.role === 'ADMIN' ? 'bg-dark' : u.role === 'LOGISTIQUE' ? 'bg-info text-dark' : 'bg-light text-dark border'}`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="text-muted">{u.region}</td>
                                                            <td className="font-monospace text-muted small">{u.password}</td>
                                                            <td className="text-end pe-4">
                                                                <div className="d-flex justify-content-end gap-2">
                                                                    <button
                                                                        onClick={() => startEditUser(u)}
                                                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                                        title="Modifier"
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    {u.role !== 'SUPER_ADMIN' && (
                                                                        <button
                                                                            onClick={() => handleDeleteUser(u.id)}
                                                                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                            title="Supprimer"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Collaborateur</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                            <th>Région</th>
                                            <th>Mot de Passe</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relevantUsers.map(u => (
                                            <tr key={u.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: 38, height: 38 }}>
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div className="fw-medium text-dark">{u.name}</div>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{u.email}</td>
                                                <td>
                                                    <span className={`badge ${u.role === 'ADMIN' ? 'bg-dark' : 'bg-light text-dark border'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{u.region}</td>
                                                <td className="font-monospace text-muted small">{user.role === 'ADMIN' ? u.password : '••••••••'}</td>
                                                <td className="text-end pe-4">
                                                    {u.role !== 'ADMIN' && (
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button
                                                                onClick={() => startEditUser(u)}
                                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                                title="Modifier"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {u.role === 'ADMIN' && <span className="text-muted small fst-italic">Admin Principal</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* TAB: ARCHIVE / CLOSED MISSIONS */}
            {activeTab === 'archive' && (
                <div className="card border-0 shadow-sm animate-fade-in">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold text-success">Historique des Missions Clôturées</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Employé</th>
                                    <th>Destination</th>
                                    <th>Dates</th>
                                    <th>Statut</th>
                                    <th>Documents Disponibles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantMissions.filter(m => m.status === 'Clôturée').map(mission => {
                                    const ownerId = mission.userId || mission.userIds?.[0];
                                    const employee = usersDb.find(u => u.id === ownerId);
                                    const destinations = mission.destinations || [mission.destination];
                                    return (
                                        <tr key={mission.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-light rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                        <span className="fw-bold small text-primary">{employee?.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold small">{employee?.name}</div>
                                                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{employee?.region}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="fw-medium small">{destinations.join(' • ')}</span></td>
                                            <td className="small text-muted">{mission.dateStart} - {mission.dateEnd}</td>
                                            <td>
                                                <span className="badge bg-success">Clôturée</span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        onClick={() => setPreviewingMission(mission)}
                                                        className="btn btn-sm btn-outline-info"
                                                        title="Aperçu rapide"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const pNames = (mission.userIds || []).map(id => usersDb.find(u => u.id === id)?.name).filter(Boolean);
                                                            generateMissionOrder({ ...mission, participants: pNames }, employee || user, globalSettings);
                                                        }}
                                                        className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                                        title="Télécharger Ordre de Mission"
                                                    >
                                                        <Printer size={14} /> OM
                                                    </button>
                                                    {mission.visitReport ? (
                                                        <button
                                                            onClick={() => {
                                                                const pNames = (mission.userIds || []).map(id => usersDb.find(u => u.id === id)?.name).filter(Boolean);
                                                                generateVisitReportPDF({ ...mission, participants: pNames }, employee || user, globalSettings, mission.visitReport);
                                                            }}
                                                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                            title="Télécharger Rapport de Visite"
                                                        >
                                                            <Download size={14} /> Rapport
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted small fst-italic ms-2">Pas de rapport</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {relevantMissions.filter(m => m.status === 'Clôturée').length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            Aucune mission clôturée pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: ANALYTICS / MONTHLY RECAP */}
            {activeTab === 'analytics' && isBoss && (
                <div className="animate-fade-in">
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100 overflow-hidden">
                                <div className="card-header bg-white py-3 border-0">
                                    <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                                        <TrendingUp size={18} className="text-primary" />
                                        Répartition par Département ({currentMonthLabel})
                                    </h6>
                                </div>
                                <div className="card-body p-4 pt-2">
                                    <div className="d-flex flex-column gap-4 mt-2">
                                        {Object.entries(missionsByDept).sort((a, b) => b[1] - a[1]).map(([dept, count], idx) => {
                                            const colors = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'];
                                            const color = colors[idx % colors.length];
                                            const percentage = (count / monthlyMissions.length) * 100;

                                            return (
                                                <div key={dept} className="group">
                                                    <div className="d-flex justify-content-between align-items-end mb-2">
                                                        <div>
                                                            <span className="fw-bold d-block text-dark small" style={{ letterSpacing: '0.3px' }}>{dept}</span>
                                                            <small className="text-muted" style={{ fontSize: '0.65rem' }}>{Math.round(percentage)}% de l'activité globale</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <span className="h5 fw-bold mb-0" style={{ color: color }}>{count}</span>
                                                            <small className="text-muted ms-1 small">missions</small>
                                                        </div>
                                                    </div>
                                                    <div className="progress overflow-visible" style={{ height: '10px', backgroundColor: '#f0f2f5', borderRadius: '20px' }}>
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: color,
                                                                borderRadius: '20px',
                                                                boxShadow: `0 4px 12px ${color}44`,
                                                                transition: 'width 1s cubic-bezier(0.1, 0.5, 0.5, 1.0)'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(missionsByDept).length === 0 && (
                                            <div className="text-center py-5">
                                                <div className="bg-light rounded-circle p-3 d-inline-block mb-3">
                                                    <AlertCircle size={32} className="text-muted opacity-50" />
                                                </div>
                                                <p className="text-muted fw-medium py-0 mb-0">Aucune donnée pour ce mois-ci.</p>
                                                <small className="text-muted small">Les statistiques apparaîtront après validation des premières missions.</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white py-3">
                                    <h6 className="mb-0 fw-bold text-success">Indicateurs de Performance</h6>
                                </div>
                                <div className="card-body">
                                    <div className="list-group list-group-flush">
                                        <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">Budget Global Consommé</div>
                                                <small className="text-muted">Total des budgets estimés pour {currentMonthLabel}</small>
                                            </div>
                                            <div className="h4 fw-bold text-success mb-0">{monthlyBudget.toLocaleString()} DA</div>
                                        </div>
                                        <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">Volume de Sorties</div>
                                                <small className="text-muted">Nombre total de missions ce mois</small>
                                            </div>
                                            <div className="h4 fw-bold text-primary mb-0">{monthlyMissions.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h6 className="mb-0 fw-bold">Détails des Missions du Mois ({currentMonthLabel})</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Employé</th>
                                        <th>Destination</th>
                                        <th>Budget</th>
                                        <th>Période</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyMissions.map(m => {
                                        const ownerId = m.userId || m.userIds?.[0];
                                        const emp = usersDb.find(u => u.id === ownerId);
                                        const destinations = m.destinations || [m.destination];
                                        return (
                                            <tr key={m.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold small">{emp?.name}</div>
                                                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{emp?.department}</div>
                                                </td>
                                                <td><span className="small">{destinations.join(' • ')}</span></td>
                                                <td className="fw-bold">{m.budget?.toLocaleString()} DA</td>
                                                <td className="small text-muted">{m.dateStart} - {m.dateEnd}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Mission Preview Modal */}
            {previewingMission && (
                <MissionPreviewModal
                    mission={previewingMission}
                    employee={usersDb.find(u => u.id === (previewingMission.userId || previewingMission.userIds?.[0]))}
                    participants={(previewingMission.userIds || [])
                        .filter(id => id !== (previewingMission.userId || previewingMission.userIds?.[0]))
                        .map(id => usersDb.find(u => u.id === id))
                        .filter(Boolean)}
                    onValidate={updateMissionStatus}
                    onReject={(id) => updateMissionStatus(id, 'Rejetée')}
                    onClose={() => setPreviewingMission(null)}
                />
            )}
            {/* TAB: MAP / GEOGRAPHIC FOLLOW-UP */}
            {activeTab === 'map' && (
                <div className="animate-fade-in">
                    <EmployeeMap employees={relevantUsers} missions={relevantMissions} />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
