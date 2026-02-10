import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateMissionOrder } from '../utils/pdfGenerator';
import MissionReportModal from './MissionReportModal';
import VisitReportModal from './VisitReportModal';
import { Calendar, MapPin, Plus, Printer, FileText, Share2, Edit2, Users as UsersIcon, Building, Eye, CheckCircle, XCircle, User, Trash2, DollarSign } from 'lucide-react';
import MissionPreviewModal from './MissionPreviewModal';

const ShareModal = ({ mission, users, onShare, onClose }) => {
    const [selectedUsers, setSelectedUsers] = useState(mission.sharedWith || []);

    const toggleUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(u => u !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3">
            <div className="card border-0 shadow-lg" style={{ width: '400px' }}>
                <div className="card-header bg-white py-3">
                    <h6 className="mb-0 fw-bold">Partager le Rapport de Visite</h6>
                </div>
                <div className="card-body">
                    <p className="small text-muted mb-3">Sélectionnez les collaborateurs qui pourront consulter ce rapport.</p>
                    <div className="list-group list-group-flush mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {users.map(u => (
                            <label key={u.id} className="list-group-item d-flex align-items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedUsers.includes(u.id)}
                                    onChange={() => toggleUser(u.id)}
                                />
                                <span className="small">{u.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-end gap-2 py-3">
                    <button onClick={onClose} className="btn btn-light btn-sm px-3">Annuler</button>
                    <button onClick={() => onShare(mission.id, selectedUsers)} className="btn btn-primary btn-sm px-3">Partager</button>
                </div>
            </div>
        </div>
    );
};

const MissionList = ({ type = 'my' }) => {
    const { missions, usersDb, user: currentUser, globalSettings, saveMissionReport, shareReport, updateMissionStatus, deleteMission } = useAppContext();
    const [selectedMission, setSelectedMission] = useState(null);
    const [visitReportMission, setVisitReportMission] = useState(null);
    const [shareingMission, setShareingMission] = useState(null);
    const [previewingMission, setPreviewingMission] = useState(null);

    const displayMissions = type === 'my'
        ? missions.filter(m => m.userId === currentUser?.id || m.userIds?.includes(currentUser?.id) || m.sharedWith?.includes(currentUser?.id))
        : missions;
    const title = type === 'my' ? 'Mes Missions' : 'Missions Équipe';
    const subtitle = type === 'my' ? 'Suivi détaillé de vos déplacements.' : 'Surveillance des missions de vos collaborateurs.';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Validée': return 'badge bg-success';
            case 'Rejetée': return 'badge bg-danger';
            default: return 'badge bg-warning text-dark';
        }
    };

    const handleShare = (mId, uIds) => {
        shareReport(mId, uIds);
        setShareingMission(null);
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">{title}</h2>
                    <p className="text-muted">{subtitle}</p>
                </div>
                {type === 'my' && (
                    <Link to="/new-mission" className="btn btn-primary d-flex align-items-center gap-2">
                        <Plus size={18} /> Nouvelle demande
                    </Link>
                )}
            </div>

            <div className="row g-3">
                {displayMissions.map((mission) => {
                    const ownerId = mission.userId || mission.userIds?.[0];
                    const missionOwner = usersDb.find(u => u.id === ownerId) || currentUser;
                    const participants = (mission.userIds || []).map(id => usersDb.find(u => u.id === id)).filter(Boolean);
                    const destinations = mission.destinations || [mission.destination];
                    const entityLabel = mission.entity === 'ECC' ? 'SARL ECC' : 'SARL ESCLAB';

                    return (
                        <div key={mission.id} className="col-12">
                            <div className="card border-0 shadow-sm hover-shadow transition">
                                <div className="card-body d-flex align-items-center flex-wrap gap-3 p-4">
                                    <div className="p-3 bg-light rounded shadow-sm text-center" style={{ minWidth: '80px' }}>
                                        <Building className="text-primary mb-1" size={20} />
                                        <div className="small fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>{mission.entity || 'ESCLAB'}</div>
                                    </div>

                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <h5 className="mb-0 fw-bold">{destinations.join(' • ')}</h5>
                                            <span className={`badge ${mission.entity === 'ECC' ? 'bg-primary' : 'bg-dark'} ms-2`} style={{ fontSize: '0.65rem' }}>{mission.entity || 'ESCLAB'}</span>
                                            <span className={`${getStatusBadge(mission.status)} ms-auto`} style={{ fontSize: '0.7rem' }}>
                                                {mission.status || 'En Attente'}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 text-muted small">
                                            <div className="d-flex align-items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{mission.dateStart} au {mission.dateEnd}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1">
                                                <User size={14} />
                                                <span>Initiateur : <span className="fw-bold text-dark">{missionOwner?.name || 'Inconnu'}</span></span>
                                                {mission.sharedWith?.includes(currentUser.id) && (
                                                    <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>Partagé avec vous</span>
                                                )}
                                            </div>
                                            {participants.length > 0 && (
                                                <div className="d-flex align-items-center gap-1">
                                                    <UsersIcon size={14} />
                                                    <span className="badge bg-info-subtle text-info">+{participants.length} Binôme(s)</span>
                                                </div>
                                            )}
                                        </div>
                                        {participants.length > 0 && (
                                            <div className="mt-2 d-flex gap-1 flex-wrap">
                                                {participants.map(p => (
                                                    <span key={p.id} className="badge bg-light text-dark border small fw-normal" style={{ fontSize: '0.7rem' }}>{p.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-end ps-lg-4 border-lg-start" style={{ minWidth: '180px' }}>
                                        <div className="h4 fw-bold mb-0 text-primary">{mission.budget ? mission.budget.toLocaleString() : '-'} <small className="fs-6 text-muted">DA</small></div>
                                        <small className="text-muted text-uppercase fw-semibold d-block mb-3" style={{ fontSize: '0.7rem' }}>Budget Estimé</small>

                                        <div className="d-flex gap-2 justify-content-end flex-wrap">
                                            <button
                                                onClick={() => setPreviewingMission(mission)}
                                                className="btn btn-sm btn-outline-info"
                                                title="Aperçu rapide"
                                            >
                                                <Eye size={14} />
                                            </button>

                                            {/* Buttons for Active Missions (Validée / Attente RH / Clôturée) */}
                                            {['Validée', 'Attente Validation RH', 'Clôturée'].includes(mission.status) && (
                                                <>
                                                    {/* 1. Compte Rendu (Visit Report) */}
                                                    <button
                                                        onClick={() => setVisitReportMission(mission)}
                                                        className={`btn btn-sm ${mission.visitReport ? 'btn-success text-white' : 'btn-outline-success'}`}
                                                        title={mission.visitReport ? "Consulter le Compte Rendu" : "Rédiger le Compte Rendu"}
                                                    >
                                                        <FileText size={14} />
                                                    </button>

                                                    {/* 2. Seconde Partie (Frais & Logistique) */}
                                                    <button
                                                        onClick={() => setSelectedMission(mission)}
                                                        className={`btn btn-sm ${mission.reportData ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
                                                        title={mission.reportData ? "Consulter Note de Frais" : "Saisir Note de Frais"}
                                                    >
                                                        <DollarSign size={14} />
                                                    </button>

                                                    {/* Share Button (Owner only) */}
                                                    {mission.userId === currentUser.id && (
                                                        <button onClick={() => setShareingMission(mission)} className="btn btn-sm btn-outline-primary" title="Partager le rapport">
                                                            <Share2 size={14} />
                                                        </button>
                                                    )}

                                                    {/* 3. Validation RH (Lamia/Fatiha/Admin only) */}
                                                    {mission.status === 'Attente Validation RH' && ([3, 45].includes(currentUser.id) || currentUser.role === 'SUPER_ADMIN') && (
                                                        <button
                                                            onClick={() => {
                                                                if (mission.visitReport && mission.reportData) {
                                                                    if (window.confirm("Confirmer la validation finale et la clôture de ce dossier ?")) {
                                                                        validateMissionFinal(mission.id);
                                                                    }
                                                                } else {
                                                                    alert("Le dossier est incomplet (Manque Rapport ou Note de Frais).");
                                                                }
                                                            }}
                                                            className={`btn btn-sm ${mission.visitReport && mission.reportData ? 'btn-danger text-white' : 'btn-secondary'}`}
                                                            title="Valider Clôture RH"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Edit Button */}
                                            {mission.status === 'En Attente' && (mission.userId === currentUser?.id || ['SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role)) && (
                                                <Link
                                                    to={`/new-mission?edit=${mission.id}`}
                                                    className="btn btn-sm btn-outline-warning text-dark"
                                                    title="Modifier la mission"
                                                >
                                                    <Edit2 size={14} />
                                                </Link>
                                            )}

                                            {/* Delete Button (Admins only, or Owner if pending) */}
                                            {(['SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role) || (mission.userId === currentUser?.id && mission.status === 'En Attente')) && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Voulez-vous vraiment supprimer cette mission ? Action irréversible.')) {
                                                            deleteMission(mission.id);
                                                        }
                                                    }}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Supprimer la mission"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}

                                            {/* Bouton d'impression HTML - Uniquement si validée (ou étape suivante) */}
                                            {['Validée', 'Attente Validation RH', 'Clôturée'].includes(mission.status) && (
                                                <button
                                                    onClick={() => {
                                                        const printWindow = window.open('', '_blank');
                                                        const entity = mission.entity || 'ESCLAB';
                                                        const companyName = entity === 'ECC' ? "SARL ECC" : "SARL ESCLAB";
                                                        const destinations = mission.destinations || [mission.destination];
                                                        const participantNames = participants.map(p => p.name).join(', ');
                                                        const logoUrl = entity === 'ECC' ? '/missions/logo_ecc.png' : '/missions/logo.jpg';

                                                        printWindow.document.write(`
                                                            <!DOCTYPE html>
                                                            <html>
                                                            <head>
                                                                <title>Ordre de Mission #${mission.id}</title>
                                                                <style>
                                                                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                                                                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
                                                                    .header-text h1 { font-size: 24px; margin: 0; }
                                                                    .header-text .subtitle { font-size: 12px; color: #666; margin: 5px 0; }
                                                                    .header-logo img { height: 60px; }
                                                                    h2 { font-size: 28px; text-align: center; margin: 30px 0 10px; }
                                                                    .ref { text-align: center; font-size: 14px; margin-bottom: 30px; }
                                                                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                                                    td { padding: 10px 0; }
                                                                    .label { font-weight: bold; width: 200px; }
                                                                    .visa-box { border: 1px solid #333; height: 100px; margin: 10px 0 40px; }
                                                                    .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
                                                                    .sig-box { text-align: center; width: 40%; }
                                                                    .sig-line { margin-top: 60px; border-top: 1px solid #333; padding-top: 5px; }
                                                                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                                                                    .no-print { text-align: center; margin-top: 40px; }
                                                                    button { padding: 10px 30px; font-size: 16px; margin: 0 5px; cursor: pointer; border: none; border-radius: 5px; }
                                                                    .btn-print { background-color: #007bff; color: white; }
                                                                    .btn-close { background-color: #6c757d; color: white; }
                                                                    @media print { .no-print { display: none; } }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div class="header">
                                                                    <div class="header-text">
                                                                        <h1>${companyName}</h1>
                                                                        <p class="subtitle">${entity === 'ECC' ? 'Dispositifs médicaux — Matériel de laboratoire & Consommable' : 'Equipements Scientifiques de Contrôle et de Laboratoire'}</p>
                                                                    </div>
                                                                    <div class="header-logo">
                                                                        <img src="${window.location.origin}${logoUrl}" alt="${companyName} Logo" />
                                                                    </div>
                                                                </div>
                                                                <h2>ORDRE DE MISSION</h2>
                                                                <p class="ref">Réf : #${mission.id} / ${new Date().getFullYear()}</p>
                                                                <table>
                                                                    <tr><td class="label">Nom et Prénom :</td><td>${participantNames}</td></tr>
                                                                    <tr><td class="label">Fonction :</td><td>${missionOwner.role === 'LOGISTIQUE' ? 'Logistique' : 'Technico-Commercial / Ingénieur'}</td></tr>
                                                                    <tr><td class="label">Objet de la mission :</td><td>${mission.description || 'Mission technique et commerciale'}</td></tr>
                                                                    <tr><td class="label">Lieu(x) de destination :</td><td>${destinations.join(' - ')}</td></tr>
                                                                    <tr><td class="label">Période prévue :</td><td>Du ${mission.dateStart} Au ${mission.dateEnd}</td></tr>
                                                                    <tr><td class="label">Moyen de transport :</td><td>${mission.vehicle === 'service' ? 'Véhicule de service' : 'Véhicule personnel'}</td></tr>
                                                                    ${missionOwner.phone ? `<tr><td class="label">Contact :</td><td>${missionOwner.phone}</td></tr>` : ''}
                                                                </table>
                                                                <p style="font-weight: bold;">Visa des Organismes Visités :</p>
                                                                <div class="visa-box"></div>
                                                                <div class="signatures">
                                                                    <div class="sig-box">
                                                                        <p style="font-weight: bold;">Le(s) Missionnaire(s)</p>
                                                                        <div class="sig-line">Signature</div>
                                                                    </div>
                                                                    <div class="sig-box">
                                                                        <p style="font-weight: bold;">La Direction Générale</p>
                                                                        <div class="sig-line">Signature</div>
                                                                    </div>
                                                                </div>
                                                                <p class="footer">Fait à Alger, le ${new Date().toLocaleDateString('fr-FR')}</p>
                                                                <div class="no-print">
                                                                    <button class="btn-print" onclick="window.print()">Imprimer / Sauvegarder en PDF</button>
                                                                    <button class="btn-close" onclick="window.close()">Fermer</button>
                                                                </div>
                                                            </body>
                                                            </html>
                                                        `);
                                                        printWindow.document.close();
                                                    }}
                                                    className="btn btn-sm btn-outline-dark"
                                                    title="Imprimer Ordre de Mission"
                                                >
                                                    <Printer size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedMission && (
                <MissionReportModal
                    mission={selectedMission}
                    onClose={() => setSelectedMission(null)}
                    onSave={saveMissionReport}
                />
            )}

            {visitReportMission && (
                <VisitReportModal
                    mission={visitReportMission}
                    onClose={() => setVisitReportMission(null)}
                />
            )}

            {shareingMission && (
                <ShareModal
                    mission={shareingMission}
                    users={usersDb.filter(u => u.id !== currentUser.id)}
                    onShare={handleShare}
                    onClose={() => setShareingMission(null)}
                />
            )}

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
        </div>
    );
};

export default MissionList;
