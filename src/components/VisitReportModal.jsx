import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Download, Plus, Trash2, MapPin, User } from 'lucide-react';
import { generateVisitReportPDF } from '../utils/pdfGenerator';
import { useAppContext } from '../context/AppContext';

const VisitReportModal = ({ mission, onClose }) => {
    const { saveVisitReport, user, globalSettings } = useAppContext();
    const [reportText, setReportText] = useState('');
    const [clients, setClients] = useState(mission.clients || [{ name: '', contact: '', region: '' }]);

    useEffect(() => {
        if (mission.visitReport) {
            setReportText(mission.visitReport);
        }
        if (mission.clients && mission.clients.length > 0) {
            setClients(mission.clients);
        }
    }, [mission]);

    const addClient = () => {
        setClients([...clients, { name: '', contact: '', region: '' }]);
    };

    const updateClient = (index, field, value) => {
        const newClients = [...clients];
        newClients[index][field] = value;
        setClients(newClients);
    };

    const removeClient = (index) => {
        if (clients.length <= 1) return;
        setClients(clients.filter((_, i) => i !== index));
    };

    const validate = () => {
        if (!reportText.trim()) {
            alert("Veuillez saisir le contenu du rapport.");
            return false;
        }
        const validClients = clients.filter(c => c.name.trim() && c.contact.trim());
        if (validClients.length === 0) {
            alert("Veuillez saisir au moins un client visité (Nom et Contact sont obligatoires).");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;
        saveVisitReport(mission.id, reportText, clients);
        alert("Rapport enregistré avec succès !");
    };

    const handlePrint = () => {
        if (!validate()) return;
        handleSave(); // Save first
        try {
            generateVisitReportPDF({ ...mission, clients }, user, globalSettings, reportText);
        } catch (error) {
            alert("Erreur PDF: " + error.message);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3" style={{ zIndex: 1050 }}>
            <div className="card border-0 shadow-lg position-relative" style={{ width: '95%', maxWidth: '1000px', height: '90vh' }}>
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <FileText className="text-primary" /> Édition du Compte Rendu
                    </h5>
                    <button onClick={onClose} className="btn btn-sm btn-light rounded-circle p-2"><X size={20} /></button>
                </div>
                <div className="card-body d-flex flex-column overflow-auto">
                    <div className="row g-4 flex-grow-1">
                        {/* Left: Info & Clients */}
                        <div className="col-md-4 d-flex flex-column">
                            <div className="alert alert-primary-subtle border-0 mb-3 bg-primary bg-opacity-10">
                                <h6 className="fw-bold mb-1 small">Détails Mission</h6>
                                <div className="small">
                                    <strong>Lieu :</strong> {(mission.destinations || [mission.destination]).join(', ')}<br />
                                    <strong>Date :</strong> {mission.dateStart} au {mission.dateEnd}
                                </div>
                            </div>

                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold mb-0 small"><User size={14} className="me-1" /> Clients Visités <span className="text-danger">*</span></h6>
                                    <button onClick={addClient} className="btn btn-xs btn-outline-primary py-0 px-1"><Plus size={14} /></button>
                                </div>
                                <div className="pe-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {clients.map((c, idx) => (
                                        <div key={idx} className="p-2 border rounded mb-2 position-relative bg-light">
                                            <input
                                                className="form-control form-control-sm mb-1"
                                                placeholder="Nom Client/Entreprise"
                                                value={c.name}
                                                onChange={e => updateClient(idx, 'name', e.target.value)}
                                            />
                                            <input
                                                className="form-control form-control-sm mb-1"
                                                placeholder="Contact (Tél/Email)"
                                                value={c.contact}
                                                onChange={e => updateClient(idx, 'contact', e.target.value)}
                                            />
                                            <input
                                                className="form-control form-control-sm"
                                                placeholder="Région/Ville"
                                                value={c.region}
                                                onChange={e => updateClient(idx, 'region', e.target.value)}
                                            />
                                            {clients.length > 1 && (
                                                <button onClick={() => removeClient(idx)} className="btn btn-sm text-danger position-absolute top-0 end-0 p-1"><Trash2 size={12} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Textarea */}
                        <div className="col-md-8 d-flex flex-column">
                            <h6 className="fw-bold mb-2 small">Contenu du Rapport <span className="text-danger">*</span></h6>
                            <textarea
                                className="form-control flex-grow-1 p-3 shadow-sm border-light"
                                style={{ minHeight: '300px', fontSize: '0.95rem', lineHeight: '1.6' }}
                                placeholder="Détaillez ici le déroulement de la mission, les résultats obtenus et les prochaines étapes..."
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div className="card-footer bg-white py-3 d-flex justify-content-end gap-2">
                    <button onClick={handleSave} className="btn btn-light d-flex align-items-center gap-2 border">
                        <Save size={18} /> Enregistrer
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary d-flex align-items-center gap-2">
                        <Download size={18} /> Valider & Imprimer PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisitReportModal;
