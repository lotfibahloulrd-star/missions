import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Users, Building, Info, CheckCircle, XCircle, User } from 'lucide-react';

const MissionPreviewModal = ({ mission, employee, participants, onValidate, onReject, onClose }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!mission) return null;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3"
            style={{ zIndex: 1060 }}
            onClick={onClose}
        >
            <div
                className="card border-0 shadow-lg animate-fade-in"
                style={{ width: '90%', maxWidth: '600px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <Info className="text-primary" /> Détails de la Mission
                    </h5>
                    <button onClick={onClose} className="btn btn-sm btn-light rounded-circle p-2"><X size={20} /></button>
                </div>
                <div className="card-body p-4 scroll-y" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <div className="row g-4 mb-4">
                        <div className="col-12">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h6 className="text-muted small text-uppercase fw-bold mb-0">Entité</h6>
                                    <p className="fw-bold mb-0 fs-5">{mission.entity || 'ESCLAB'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <h6 className="text-muted small text-uppercase fw-bold mb-2"><User size={14} className="me-1" /> Employé</h6>
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-light rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                    <span className="fw-bold small text-primary">{employee?.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="fw-bold small">{employee?.name}</div>
                                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{employee?.department}</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <h6 className="text-muted small text-uppercase fw-bold mb-2"><Calendar size={14} className="me-1" /> Période</h6>
                            <p className="small mb-0 fw-medium">{mission.dateStart} au {mission.dateEnd}</p>
                        </div>

                        <div className="col-12">
                            <h6 className="text-muted small text-uppercase fw-bold mb-2"><MapPin size={14} className="me-1" /> Destinations</h6>
                            <div className="d-flex flex-wrap gap-1">
                                {(mission.destinations || [mission.destination]).map((d, i) => (
                                    <span key={i} className="badge bg-light text-dark border fw-normal">{d}</span>
                                ))}
                            </div>
                        </div>

                        {participants && participants.length > 0 && (
                            <div className="col-12">
                                <h6 className="text-muted small text-uppercase fw-bold mb-2"><Users size={14} className="me-1" /> Accompagnateurs</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {participants.map(p => (
                                        <span key={p.id} className="badge bg-info-subtle text-info fw-normal">{p.name || p}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="col-12">
                            <h6 className="text-muted small text-uppercase fw-bold mb-2">Description / Objectif</h6>
                            <div className="p-3 bg-light rounded-3 small text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                                {mission.description || 'Aucune description fournie.'}
                            </div>
                        </div>

                        <div className="col-12 text-center">
                            <div className="h4 fw-bold text-primary mb-0">{mission.budget?.toLocaleString()} DA</div>
                            <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Budget Estimé</small>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-2">
                        {mission.status === 'En Attente' ? (
                            <>
                                <button
                                    onClick={() => { onValidate(mission.id); onClose(); }}
                                    className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                                >
                                    <CheckCircle size={18} /> Valider
                                </button>
                                <button
                                    onClick={() => { onReject(mission.id); onClose(); }}
                                    className="btn btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                                >
                                    <XCircle size={18} /> Rejeter
                                </button>
                            </>
                        ) : (
                            <button onClick={onClose} className="btn btn-light border w-100 py-2 fw-bold">Fermer</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionPreviewModal;
