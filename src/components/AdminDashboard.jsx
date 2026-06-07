import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateMissionOrder, generateVisitReportPDF } from '../utils/pdfGenerator';
import { Users, ClipboardCheck, TrendingUp, AlertCircle, UserPlus, Trash2, Mail, CheckCircle, Edit, Save, X, FileText, Download, Archive, Printer, Eye, DollarSign } from 'lucide-react';
import MissionPreviewModal from './MissionPreviewModal';
import MissionReportModal from './MissionReportModal';
import EmployeeMap from './EmployeeMap';
import { Map as MapIcon, Navigation } from 'lucide-react';

const AdminDashboard = () => {
    const { user, allMissions, usersDb, updateMissionStatus, validateMissionFinal, addUser, updateUser, deleteUser, messagesDb, markMessageAsRead, deleteMessage, deleteMission, globalSettings, calculateMissionExpenses, saveMissionReport } = useAppContext();

    // Form & UI States
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' });
    const [previewingMission, setPreviewingMission] = useState(null);
    const [selectedMissionReport, setSelectedMissionReport] = useState(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('missions'); // add new tab option 'employeeStatus'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [analyticsSubTab, setAnalyticsSubTab] = useState('dashboard'); // 'dashboard' or 'archive'

    // Dynamic Month Selection
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return {
            month: now.getMonth(),
            year: now.getFullYear()
        };
    });

    const getMonthsSinceStart = () => {
        const months = [];
        let startYear = 2024;
        let startMonth = 1; // Février (0-indexed)

        // Trouver la date de mission la plus ancienne
        if (allMissions && allMissions.length > 0) {
            let earliestDate = null;
            allMissions.forEach(m => {
                if (m.dateStart) {
                    const d = new Date(m.dateStart);
                    if (!isNaN(d.getTime())) {
                        if (!earliestDate || d < earliestDate) {
                            earliestDate = d;
                        }
                    }
                }
            });
            if (earliestDate) {
                startYear = earliestDate.getFullYear();
                startMonth = earliestDate.getMonth();
            }
        }

        const now = new Date();
        const endYear = now.getFullYear();
        const endMonth = now.getMonth();

        let currentY = startYear;
        let currentM = startMonth;

        while (currentY < endYear || (currentY === endYear && currentM <= endMonth)) {
            months.push({
                month: currentM,
                year: currentY,
                label: new Date(currentY, currentM, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            });
            currentM++;
            if (currentM > 11) {
                currentM = 0;
                currentY++;
            }
        }

        return months.reverse();
    };

    const getGroupedMissions = (missionsList) => {
        const groupedMap = new Map();
        [...missionsList].sort((a, b) => a.id - b.id).forEach(m => {
            const key = m.groupId || m.id;
            if (!groupedMap.has(key)) {
                groupedMap.set(key, m);
            }
        });
        return Array.from(groupedMap.values()).sort((a, b) => b.id - a.id);
    };

    const monthlyMissions = getGroupedMissions(allMissions).filter(m => {
        if (!m.dateStart) return false;
        const d = new Date(m.dateStart);
        return d.getMonth() === selectedMonth.month && d.getFullYear() === selectedMonth.year;
    });

    const currentMonthLabel = new Date(selectedMonth.year, selectedMonth.month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const monthlyBudget = monthlyMissions.reduce((acc, m) => {
        const indemnity = (m.reportData?.manualIndemnity !== undefined && m.reportData?.manualIndemnity !== null)
            ? parseFloat(m.reportData.manualIndemnity)
            : calculateMissionExpenses(m.dateStart, m.dateEnd);
        return acc + indemnity;
    }, 0);
    const missionsByDept = monthlyMissions.reduce((acc, m) => {
        const ownerId = m.userId || m.userIds?.[0];
        const emp = usersDb.find(u => u.id === ownerId);
        const dept = emp?.department || 'AUTRE';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    // BASIC STATS
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.department === 'RH';
    // Strictly restrict Map via multiple identifiers (ID, Name or specific Emails)
    const isLotfi = user?.id === 2 ||
        user?.email?.toLowerCase().includes('l.bahloul') ||
        user?.email?.toLowerCase().includes('lotfi.bahloul') ||
        user?.name?.toLowerCase().includes('lotfi bahloul');
    const isBoss = user.role === 'SUPER_ADMIN' || user.department === 'RH'; // used for analytics tab
    const isPrivileged = ['ADMIN', 'MANAGER'].includes(user.role); // limited view for admins/managers

    const relevantMissions = isSuperAdmin
        ? getGroupedMissions(allMissions)
        : getGroupedMissions(allMissions.filter(m => {
            const ownerId = m.userId || m.userIds?.[0];
            const missionUser = usersDb.find(u => u.id === ownerId);
            return missionUser?.department === user.department;
        }));

    const relevantUsers = isSuperAdmin
        ? usersDb
        : usersDb.filter(u => u.role !== 'SUPER_ADMIN' && u.department === user.department);

    const totalMissions = relevantMissions.length;
    const pendingValidation = relevantMissions.filter(m => m.status === 'En Attente').length;
    const totalBudgetParams = allMissions.reduce((acc, curr) => {
        const indemnity = (curr.reportData?.manualIndemnity !== undefined && curr.reportData?.manualIndemnity !== null)
            ? parseFloat(curr.reportData.manualIndemnity)
            : calculateMissionExpenses(curr.dateStart, curr.dateEnd);
        return acc + indemnity;
    }, 0);
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

    const exportMonthlyExpenses = (targetMonth = selectedMonth) => {
        const targetMissions = getGroupedMissions(allMissions).filter(m => {
            if (!m.dateStart) return false;
            const d = new Date(m.dateStart);
            return d.getMonth() === targetMonth.month && d.getFullYear() === targetMonth.year;
        });

        if (targetMissions.length === 0) {
            alert("Aucune mission à exporter pour ce mois-ci.");
            return;
        }

        const headers = ["ID", "Initiateur", "Departement", "Destinations", "Date Debut", "Date Fin", "Statut", "Frais Mission (DA)", "Avance (DA)", "Frais Divers (DA)", "Observation"];
        const rows = targetMissions.map(m => {
            const owner = usersDb.find(u => u.id === (m.userId || m.userIds?.[0]));
            const indemnity = (m.reportData?.manualIndemnity !== undefined && m.reportData?.manualIndemnity !== null)
                ? parseFloat(m.reportData.manualIndemnity)
                : calculateMissionExpenses(m.dateStart, m.dateEnd);
            const divers = parseFloat(m.reportData?.divers?.frais || 0);
            const avance = parseFloat(m.reportData?.avance || 0);
            const obs = (m.reportData?.observation || '').replace(/,/g, ';').replace(/\n/g, ' ');

            return [
                m.id,
                owner?.name || 'N/A',
                owner?.department || 'N/A',
                (m.destinations || [m.destination]).join('; '),
                m.dateStart,
                m.dateEnd,
                m.status,
                indemnity,
                avance,
                divers,
                obs
            ];
        });

        const csvContent = "\uFEFF" + headers.join(",") + "\n"
            + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");

        const targetLabel = new Date(targetMonth.year, targetMonth.month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `missions_frais_${targetLabel.replace(/ /g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        onClick={() => setActiveTab('employeeStatus')}
                        className={`btn btn-outline-dark d-flex align-items-center gap-2 ${activeTab === 'employeeStatus' ? 'active' : ''}`}
                    >
                        <UserPlus size={18} /> Missions par Employé
                    </button>
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
                        <div className="btn-group">
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`btn btn-outline-primary d-flex align-items-center gap-2 ${activeTab === 'analytics' ? 'active' : ''}`}
                            >
                                <TrendingUp size={18} /> Récap Mensuel
                            </button>
                            <button
                                onClick={exportMonthlyExpenses}
                                className="btn btn-outline-success d-flex align-items-center gap-2"
                                title="Exporter les frais du mois en CSV"
                            >
                                <Download size={18} /> Exporter
                            </button>
                        </div>
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
                                    {isSuperAdmin && <th>Frais (Barème)</th>}
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
                                            {isSuperAdmin && (
                                                <td className="fw-bold text-primary">
                                                    {((mission.reportData?.manualIndemnity !== undefined && mission.reportData?.manualIndemnity !== null)
                                                        ? parseFloat(mission.reportData.manualIndemnity)
                                                        : calculateMissionExpenses(mission.dateStart, mission.dateEnd)).toLocaleString()} DA
                                                    {mission.reportData?.manualIndemnity && <div className="text-muted" style={{ fontSize: '0.6rem' }}>RH</div>}
                                                </td>
                                            )}
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {mission.visitReport ? '📄 Rapport Présent' : '⏳ En attente'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${mission.status === 'Clôturée' ? 'bg-success' :
                                                    mission.status === 'Attente Validation RH' ? 'bg-danger' :
                                                        mission.status === 'Validée' ? 'bg-primary' :
                                                            mission.status === 'En Attente' ? 'bg-warning text-dark' : 'bg-secondary'
                                                    }`}>
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

                                                    {/* New: Quick Edit Amounts for RH (Lamia) and Super Admin */}
                                                    {['Validée', 'Attente Validation RH', 'Clôturée'].includes(mission.status) && (user.role === 'SUPER_ADMIN' || (user.role === 'ADMIN' && user.department === 'RH')) && (
                                                        <button
                                                            onClick={() => setSelectedMissionReport(mission)}
                                                            className={`btn btn-sm ${mission.reportData ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
                                                            title={mission.reportData ? "Consulter/Modifier Frais" : "Saisir Frais de Mission"}
                                                        >
                                                            <DollarSign size={14} />
                                                        </button>
                                                    )}

                                                    {mission.status === 'Attente Validation RH' && (user.role === 'SUPER_ADMIN' || (user.role === 'ADMIN' && user.department === 'RH')) && (
                                                        <button
                                                            onClick={() => {
                                                                if (mission.visitReport) {
                                                                    if (window.confirm("Confirmer la validation finale et la clôture de ce dossier ?")) {
                                                                        validateMissionFinal(mission.id);
                                                                    }
                                                                } else {
                                                                    alert("Le dossier est incomplet : Manque Rapport de visite (Compte rendu)");
                                                                }
                                                            }}
                                                            className={`btn btn-sm ${mission.visitReport ? 'btn-danger text-white' : 'btn-secondary'} d-flex align-items-center gap-1`}
                                                            title="Valider Clôture RH"
                                                        >
                                                            <CheckCircle size={14} /> Clôturer
                                                        </button>
                                                    )}

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
            {activeTab === 'employeeStatus' && (
                <div className="card border-0 shadow-sm animate-fade-in">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">Missions par Employé</h5>
                    </div>
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Employé</label>
                                <select className="form-select" value={selectedEmployeeId || ''} onChange={e => setSelectedEmployeeId(e.target.value)}>
                                    <option value="">Tous</option>
                                    {usersDb.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Date Début</label>
                                <input type="date" className="form-control" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold">Date Fin</label>
                                <input type="date" className="form-control" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Employé</th>
                                        <th>Destination</th>
                                        <th>Dates</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relevantMissions
                                        .filter(m => {
                                            if (selectedEmployeeId && (m.userId || m.userIds?.[0]) !== parseInt(selectedEmployeeId)) return false;
                                            if (dateRange.start) {
                                                const dStart = new Date(m.dateStart);
                                                if (dStart < new Date(dateRange.start)) return false;
                                            }
                                            if (dateRange.end) {
                                                const dEnd = new Date(m.dateEnd);
                                                if (dEnd > new Date(dateRange.end)) return false;
                                            }
                                            return true;
                                        })
                                        .map(mission => {
                                            const employee = usersDb.find(u => u.id === (mission.userId || mission.userIds?.[0]));
                                            return (
                                                <tr key={mission.id} style={{ cursor: 'pointer' }} onClick={() => setPreviewingMission(mission)}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="bg-light rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                                <span className="fw-bold small text-primary">{employee?.name ? employee.name.charAt(0) : '?'}</span>
                                                            </div>
                                                            <div>{employee?.name || 'Inconnu'}</div>
                                                        </div>
                                                    </td>
                                                    <td>{(mission.destinations || [mission.destination]).join(' • ')}</td>
                                                    <td className="small text-muted">{mission.dateStart} - {mission.dateEnd}</td>
                                                    <td>
                                                        <span className={`badge ${mission.status === 'Clôturée' ? 'bg-success' : mission.status === 'Attente Validation RH' ? 'bg-danger' : mission.status === 'Validée' ? 'bg-primary' : mission.status === 'En Attente' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{mission.status}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

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
                                                        <span className="fw-bold small text-primary">{employee?.name?.charAt(0) || '?'}</span>
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
                                                    {/* Display Frais de Mission Button if mission is closed and user is SuperAdmin/RH */}
                                                    {isSuperAdmin && (
                                                        <button
                                                            onClick={() => {
                                                                const ind = (mission.reportData?.manualIndemnity !== undefined && mission.reportData?.manualIndemnity !== null)
                                                                    ? parseFloat(mission.reportData.manualIndemnity)
                                                                    : calculateMissionExpenses(mission.dateStart, mission.dateEnd);
                                                                alert(`Détails Frais de Mission #${mission.id}:\n- Type: ${mission.reportData?.manualIndemnity ? 'Saisie Manuelle RH' : 'Barème Automatique'}\n- Montant: ${ind.toLocaleString()} DA`);
                                                            }}
                                                            className="btn btn-sm btn-outline-warning text-dark d-flex align-items-center gap-1"
                                                            title="Consulter Frais de Mission"
                                                        >
                                                            <DollarSign size={14} /> Frais
                                                        </button>
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
                    {/* Sub-tabs Navigation */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
                        <div className="nav nav-pills gap-2 bg-light p-1 rounded" style={{ alignSelf: 'flex-start' }}>
                            <button
                                className={`nav-link px-3 py-2 fw-medium d-flex align-items-center gap-2 border-0 ${analyticsSubTab === 'dashboard' ? 'active shadow-sm bg-white text-primary' : 'text-secondary bg-transparent'}`}
                                onClick={() => setAnalyticsSubTab('dashboard')}
                                style={{ transition: 'all 0.2s' }}
                            >
                                <TrendingUp size={16} />
                                Tableau de Bord Mensuel
                            </button>
                            <button
                                className={`nav-link px-3 py-2 fw-medium d-flex align-items-center gap-2 border-0 ${analyticsSubTab === 'archive' ? 'active shadow-sm bg-white text-primary' : 'text-secondary bg-transparent'}`}
                                onClick={() => setAnalyticsSubTab('archive')}
                                style={{ transition: 'all 0.2s' }}
                            >
                                <Archive size={16} />
                                Archive des Récaps
                            </button>
                        </div>

                        {analyticsSubTab === 'dashboard' && (
                            <div className="d-flex flex-wrap align-items-center gap-3">
                                {/* Month Selector */}
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-semibold text-muted text-nowrap">Période :</span>
                                    <select
                                        className="form-select form-select-sm fw-bold border-dark-subtle cursor-pointer"
                                        style={{ minWidth: '180px', borderRadius: '8px' }}
                                        value={`${selectedMonth.year}-${selectedMonth.month}`}
                                        onChange={(e) => {
                                            const [y, m] = e.target.value.split('-').map(Number);
                                            setSelectedMonth({ year: y, month: m });
                                        }}
                                    >
                                        {getMonthsSinceStart().map(m => (
                                            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                                                {m.label.charAt(0).toUpperCase() + m.label.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Export CSV button */}
                                <button
                                    onClick={() => exportMonthlyExpenses(selectedMonth)}
                                    className="btn btn-sm btn-success d-flex align-items-center gap-2 px-3"
                                    style={{ borderRadius: '8px' }}
                                    title="Exporter ce mois en CSV"
                                    disabled={monthlyMissions.length === 0}
                                >
                                    <Download size={16} />
                                    Exporter CSV
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SUB-TAB: MONTHLY DASHBOARD */}
                    {analyticsSubTab === 'dashboard' && (
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
                                            <h6 className="mb-0 fw-bold text-success">Indicateurs de Performance ({currentMonthLabel})</h6>
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
                                                const indemnity = (m.reportData?.manualIndemnity !== undefined && m.reportData?.manualIndemnity !== null)
                                                    ? parseFloat(m.reportData.manualIndemnity)
                                                    : calculateMissionExpenses(m.dateStart, m.dateEnd);
                                                return (
                                                    <tr key={m.id}>
                                                        <td className="ps-4">
                                                            <div className="fw-bold small">{emp?.name}</div>
                                                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{emp?.department}</div>
                                                        </td>
                                                        <td><span className="small">{destinations.join(' • ')}</span></td>
                                                        <td className="fw-bold">{indemnity.toLocaleString()} DA</td>
                                                        <td className="small text-muted">{m.dateStart} - {m.dateEnd}</td>
                                                    </tr>
                                                );
                                            })}
                                            {monthlyMissions.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-muted">
                                                        Aucune mission enregistrée pour cette période.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUB-TAB: HISTORICAL ARCHIVE */}
                    {analyticsSubTab === 'archive' && (
                        <div className="card border-0 shadow-sm animate-fade-in">
                            <div className="card-header bg-white py-3 border-0">
                                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                                    <Archive size={20} className="text-success" />
                                    Archive Historique des Récaps Mensuels
                                </h5>
                                <p className="text-muted small mb-0 mt-1">
                                    Consultez et exportez les rapports financiers consolidés de chaque mois depuis la création de l'application.
                                </p>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Période</th>
                                            <th>Volume de Sorties</th>
                                            <th>Budget Consommé</th>
                                            <th>Départements Actifs</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getMonthsSinceStart().map(m => {
                                            const targetMissions = getGroupedMissions(allMissions).filter(mission => {
                                                if (!mission.dateStart) return false;
                                                const d = new Date(mission.dateStart);
                                                return d.getMonth() === m.month && d.getFullYear() === m.year;
                                            });
                                            const count = targetMissions.length;
                                            const budget = targetMissions.reduce((acc, curr) => {
                                                const indemnity = (curr.reportData?.manualIndemnity !== undefined && curr.reportData?.manualIndemnity !== null)
                                                    ? parseFloat(curr.reportData.manualIndemnity)
                                                    : calculateMissionExpenses(curr.dateStart, curr.dateEnd);
                                                return acc + indemnity;
                                            }, 0);
                                            const depts = targetMissions.reduce((acc, curr) => {
                                                const ownerId = curr.userId || curr.userIds?.[0];
                                                const emp = usersDb.find(u => u.id === ownerId);
                                                const dept = emp?.department || 'AUTRE';
                                                if (!acc.includes(dept)) acc.push(dept);
                                                return acc;
                                            }, []);

                                            const capitalizedLabel = m.label.charAt(0).toUpperCase() + m.label.slice(1);

                                            return (
                                                <tr key={`${m.year}-${m.month}`} style={{ transition: 'background-color 0.2s' }}>
                                                    <td className="ps-4 py-3">
                                                        <span className="fw-bold text-dark mb-0 d-block">{capitalizedLabel}</span>
                                                    </td>
                                                    <td className="py-3">
                                                        {count > 0 ? (
                                                            <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill">
                                                                {count} mission{count > 1 ? 's' : ''}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted small">Aucune mission</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 fw-bold text-success">
                                                        {budget > 0 ? `${budget.toLocaleString()} DA` : '0 DA'}
                                                    </td>
                                                    <td className="py-3">
                                                        {depts.length > 0 ? (
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {depts.map(d => (
                                                                    <span key={d} className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10 small">
                                                                        {d}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">-</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end pe-4 py-3">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMonth({ year: m.year, month: m.month });
                                                                    setAnalyticsSubTab('dashboard');
                                                                }}
                                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                                title="Consulter le Tableau de Bord"
                                                            >
                                                                <Eye size={14} /> Consulter
                                                            </button>
                                                            <button
                                                                onClick={() => exportMonthlyExpenses(m)}
                                                                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                                                title="Exporter ce mois en CSV"
                                                                disabled={count === 0}
                                                            >
                                                                <Download size={14} /> Exporter
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
                    onFinalValidate={validateMissionFinal}
                    canFinalValidate={user.role === 'SUPER_ADMIN' || (user.role === 'ADMIN' && user.department === 'RH')}
                    onReject={(id) => updateMissionStatus(id, 'Rejetée')}
                    onClose={() => setPreviewingMission(null)}
                    onEditExpenses={(m) => { setSelectedMissionReport(m); setPreviewingMission(null); }}
                />
            )}
            {/* Modal de saisie des frais (RH / Lamia) */}
            {selectedMissionReport && (
                <MissionReportModal
                    mission={selectedMissionReport}
                    onClose={() => setSelectedMissionReport(null)}
                    onSave={saveMissionReport}
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
