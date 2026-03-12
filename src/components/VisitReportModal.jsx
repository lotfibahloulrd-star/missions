import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Download, Plus, Trash2, MapPin, User, Car } from 'lucide-react';
import { generateVisitReportPDF } from '../utils/pdfGenerator';
import { useAppContext } from '../context/AppContext';

const VisitReportModal = ({ mission, onClose }) => {
    const { saveVisitReport, user, globalSettings } = useAppContext();
    const [reportText, setReportText] = useState('');
    const [clients, setClients] = useState(mission.clients || [{ name: '', contact: '', region: '' }]);
    const [extraInfo, setExtraInfo] = useState({
        departureTime: mission.departureTime || '',
        returnTime: mission.returnTime || '',
        licensePlate: mission.licensePlate || '',
        vehicleMake: mission.vehicleMake || ''
    });

    useEffect(() => {
        if (mission.visitReport) {
            setReportText(mission.visitReport);
        }
        if (mission.clients && mission.clients.length > 0) {
            setClients(mission.clients);
        }
        if (mission.departureTime || mission.licensePlate) {
            setExtraInfo({
                departureTime: mission.departureTime || '',
                returnTime: mission.returnTime || '',
                licensePlate: mission.licensePlate || '',
                vehicleMake: mission.vehicleMake || ''
            });
        }

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [mission, onClose]);

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
        if (!extraInfo.departureTime || !extraInfo.returnTime || !extraInfo.licensePlate || !extraInfo.vehicleMake) {
            alert("Veuillez renseigner tous les champs obligatoires : Heures de départ/retour, Matricule et Marque du véhicule.");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;
        saveVisitReport(mission.id, reportText, clients, extraInfo);
        alert("Rapport enregistré avec succès !");
        onClose(); // Fermer après enregistrement
    };

    const handlePrint = () => {
        if (!validate()) return;
        saveVisitReport(mission.id, reportText, clients, extraInfo);
        
        const printWindow = window.open('', '_blank');
        const entity = mission.entity || 'ESCLAB';
        const companyName = entity === 'ECC' ? "SARL ECC" : "SARL ESCLAB";
        const logoUrl = entity === 'ECC' ? '/missions/logo_ecc.png' : '/missions/logo.jpg';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Compte Rendu de Visite #${mission.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .header-logo img { height: 60px; }
                    h1 { font-size: 22px; text-align: center; text-transform: uppercase; margin: 20px 0; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .info-item b { display: inline-block; width: 150px; }
                    .section-title { background: #333; color: white; padding: 5px 10px; font-size: 14px; font-weight: bold; margin-top: 25px; margin-bottom: 10px; }
                    .client-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .client-table th, .client-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
                    .client-table th { background: #eee; }
                    .report-content { white-space: pre-wrap; line-height: 1.6; font-size: 14px; border: 1px solid #eee; padding: 20px; min-height: 300px; }
                    .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                    .sig-box { width: 45%; text-align: center; }
                    .sig-line { margin-top: 60px; border-top: 1px solid #333; padding-top: 5px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h2 style="margin:0">${companyName}</h2>
                        <small>${entity === 'ECC' ? 'Dispositifs médicaux — Matériel de laboratoire & Consommable' : 'Equipements Scientifiques de Contrôle et de Laboratoire'}</small>
                    </div>
                    <div class="header-logo">
                        <img src="${window.location.origin}${logoUrl}" />
                    </div>
                </div>
                <h1>COMPTE RENDU DE VISITE</h1>
                
                <div class="info-grid">
                    <div class="info-item"><b>Mission N° :</b> #${mission.id}</div>
                    <div class="info-item"><b>Collaborateur :</b> ${user.name}</div>
                    <div class="info-item"><b>Période :</b> Du ${mission.dateStart} au ${mission.dateEnd}</div>
                    <div class="info-item"><b>Destination(s) :</b> ${(mission.destinations || [mission.destination]).join(', ')}</div>
                </div>

                <div class="section-title">LOGISTIQUE VÉHICULE</div>
                <div class="info-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr">
                    <div class="info-item"><b>Véhicule :</b> ${extraInfo.vehicleMake}</div>
                    <div class="info-item"><b>Matricule :</b> ${extraInfo.licensePlate}</div>
                    <div class="info-item"><b>Départ :</b> ${extraInfo.departureTime}</div>
                    <div class="info-item"><b>Retour :</b> ${extraInfo.returnTime}</div>
                </div>

                <div class="section-title">CLIENTS VISITÉS</div>
                <table class="client-table">
                    <thead>
                        <tr><th>Client / Entreprise</th><th>Contact / Interlocuteur</th><th>Région</th></tr>
                    </thead>
                    <tbody>
                        ${clients.map(c => `<tr><td>${c.name}</td><td>${c.contact}</td><td>${c.region}</td></tr>`).join('')}
                    </tbody>
                </table>

                <div class="section-title">COMPTE RENDU DÉTAILLÉ</div>
                <div class="report-content">${reportText}</div>

                <div class="footer">
                    <div class="sig-box">
                        <p><b>Le Missionnaire</b></p>
                        <div class="sig-line">Signature</div>
                    </div>
                    <div class="sig-box">
                        <p><b>Visa Client / Cachet</b></p>
                        <div class="sig-line">Signature</div>
                    </div>
                </div>

                <div class="no-print" style="text-align:center; margin-top:40px;">
                    <button onclick="window.print()" style="padding:10px 30px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer;">Imprimer en PDF</button>
                    <button onclick="window.close()" style="padding:10px 30px; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer; margin-left:10px;">Fermer</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        onClose();
    };

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3"
            style={{ zIndex: 1050 }}
            onClick={onClose}
        >
            <div
                className="card border-0 shadow-lg position-relative animate-fade-in"
                style={{ width: '95%', maxWidth: '1000px', height: '90vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <FileText className="text-primary" /> Édition du Compte Rendu
                    </h5>
                    <button onClick={onClose} className="btn btn-sm btn-light rounded-circle p-2"><X size={20} /></button>
                </div>
                <div className="card-body d-flex flex-column overflow-auto">
                    <div className="row g-4 flex-grow-1">
                        {/* Left: Info & Clients & Vehicle */}
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
                                <div className="pe-2 mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
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

                            <div className="mb-4 pt-3 border-top">
                                <h6 className="fw-bold mb-2 small"><Car size={14} className="me-1" /> Logistique Véhicule <span className="text-danger">*</span></h6>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="small text-muted" style={{ fontSize: '0.7rem' }}>Heure Départ</label>
                                        <input type="time" className="form-control form-control-sm" value={extraInfo.departureTime} onChange={e => setExtraInfo({ ...extraInfo, departureTime: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <label className="small text-muted" style={{ fontSize: '0.7rem' }}>Heure Retour</label>
                                        <input type="time" className="form-control form-control-sm" value={extraInfo.returnTime} onChange={e => setExtraInfo({ ...extraInfo, returnTime: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <input type="text" className="form-control form-control-sm" placeholder="Marque Véhicule" value={extraInfo.vehicleMake} onChange={e => setExtraInfo({ ...extraInfo, vehicleMake: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <input type="text" className="form-control form-control-sm" placeholder="Matricule (Plaque)" value={extraInfo.licensePlate} onChange={e => setExtraInfo({ ...extraInfo, licensePlate: e.target.value })} />
                                    </div>
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
                    <button onClick={onClose} className="btn btn-light d-flex align-items-center gap-2 border">
                        <X size={18} /> Fermer
                    </button>
                    <button onClick={handleSave} className="btn btn-success d-flex align-items-center gap-2 border text-white">
                        <Save size={18} /> Enregistrer
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary d-flex align-items-center gap-2">
                        <Download size={18} /> Valider & Imprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisitReportModal;

