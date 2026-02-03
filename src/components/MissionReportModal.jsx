import { X, Save, Car, Hotel } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateMissionOrder } from '../utils/pdfGenerator';

const MissionReportModal = ({ mission, onClose, onSave }) => {
    const { user, globalSettings, usersDb } = useAppContext();
    const [formData, setFormData] = useState({
        // Transport
        transportEsclab: { depart: '', retour: '', km: '', carburant: '', immatriculation: '' },
        transportPerso: { depart: '', retour: '', km: '', carburant: '' },
        transportTaxi: { depart: '', retour: '', km: '' }, // dates/times for taxi/avion usually implied by mission dates or specific entries
        transportAvion: { depart: '', retour: '' },

        // Expenses
        hebergement: { adresse: '', nuitee: 0, frais: 0 },
        repas: { frais: 0 },
        divers: { frais: 0 },
        avance: 0,
        observation: ''
    });

    useEffect(() => {
        if (mission.reportData) {
            setFormData(mission.reportData);
        }

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [mission, onClose]);

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSimpleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(mission.id, formData);

        // PDF désactivé - Utiliser le bouton d'impression HTML dans la liste des missions
        // generateMissionOrder({ ...mission, reportData: formData, participants: participantNames }, owner, globalSettings, 2);

        onClose();
    };

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3"
            style={{ zIndex: 1050 }}
            onClick={onClose}
        >
            <div
                className="card border-0 shadow-lg"
                style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center sticky-top">
                    <h5 className="mb-0 fw-bold">Rapport de Mission (Interne)</h5>
                    <button onClick={onClose} className="btn btn-sm btn-light rounded-circle p-2"><X size={20} /></button>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>

                        {/* SECTION TRANSPORT */}
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 d-flex align-items-center gap-2"><Car size={18} /> Moyens de Transport</h6>

                            {/* ESCLAB */}
                            <div className="row g-2 mb-3 align-items-center bg-light p-2 rounded">
                                <div className="col-md-2 fw-semibold small">Véhicule ESCLAB</div>
                                <div className="col-md-2"><input type="datetime-local" className="form-control form-control-sm" value={formData.transportEsclab.depart} onChange={e => handleChange('transportEsclab', 'depart', e.target.value)} /></div>
                                <div className="col-md-2"><input type="datetime-local" className="form-control form-control-sm" value={formData.transportEsclab.retour} onChange={e => handleChange('transportEsclab', 'retour', e.target.value)} /></div>
                                <div className="col-md-2"><input type="text" className="form-control form-control-sm" placeholder="Km" value={formData.transportEsclab.km} onChange={e => handleChange('transportEsclab', 'km', e.target.value)} /></div>
                                <div className="col-md-2"><input type="text" className="form-control form-control-sm" placeholder="Carburant" value={formData.transportEsclab.carburant} onChange={e => handleChange('transportEsclab', 'carburant', e.target.value)} /></div>
                                <div className="col-md-2"><input type="text" className="form-control form-control-sm" placeholder="Matricule" value={formData.transportEsclab.immatriculation} onChange={e => handleChange('transportEsclab', 'immatriculation', e.target.value)} /></div>
                            </div>

                            {/* PERSO */}
                            <div className="row g-2 mb-3 align-items-center bg-light p-2 rounded">
                                <div className="col-md-2 fw-semibold small">Véhicule PERSO</div>
                                <div className="col-md-2"><input type="datetime-local" className="form-control form-control-sm" value={formData.transportPerso.depart} onChange={e => handleChange('transportPerso', 'depart', e.target.value)} /></div>
                                <div className="col-md-2"><input type="datetime-local" className="form-control form-control-sm" value={formData.transportPerso.retour} onChange={e => handleChange('transportPerso', 'retour', e.target.value)} /></div>
                                <div className="col-md-2"><input type="text" className="form-control form-control-sm" placeholder="Km" value={formData.transportPerso.km} onChange={e => handleChange('transportPerso', 'km', e.target.value)} /></div>
                                <div className="col-md-2"><input type="text" className="form-control form-control-sm" placeholder="Carburant" value={formData.transportPerso.carburant} onChange={e => handleChange('transportPerso', 'carburant', e.target.value)} /></div>
                                <div className="col-md-2 text-muted small pe-0">Indemnité selon barème</div>
                            </div>
                        </div>

                        {/* SECTION SEJOUR */}
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 d-flex align-items-center gap-2"><Hotel size={18} /> Frais de Séjour & Divers</h6>

                            <div className="row g-3">
                                {/* Hebergement */}
                                <div className="col-md-12">
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text fw-semibold" style={{ width: 120 }}>Hébergement</span>
                                        <input type="text" className="form-control" placeholder="Adresse complète" value={formData.hebergement.adresse} onChange={e => handleChange('hebergement', 'adresse', e.target.value)} />
                                        <input type="number" className="form-control" placeholder="Nuitées" style={{ maxWidth: 80 }} value={formData.hebergement.nuitee} onChange={e => handleChange('hebergement', 'nuitee', e.target.value)} />
                                        <input type="number" className="form-control" placeholder="Montant (DA)" style={{ maxWidth: 120 }} value={formData.hebergement.frais} onChange={e => handleChange('hebergement', 'frais', e.target.value)} />
                                    </div>
                                </div>

                                {/* Repas */}
                                <div className="col-md-12">
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text fw-semibold" style={{ width: 120 }}>Repas</span>
                                        <input type="text" className="form-control bg-light" disabled value="Forfait / Frais réels selon justificatifs" />
                                        <input type="number" className="form-control" placeholder="Montant Global (DA)" style={{ maxWidth: 150 }} value={formData.repas.frais} onChange={e => handleChange('repas', 'frais', e.target.value)} />
                                    </div>
                                </div>

                                {/* Divers & Avance */}
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Frais Divers (DA)</label>
                                    <input type="number" className="form-control form-control-sm" value={formData.divers.frais} onChange={e => handleChange('divers', 'frais', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Avance Perçue (DA)</label>
                                    <input type="number" className="form-control form-control-sm" value={formData.avance} onChange={e => handleSimpleChange('avance', e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold">Observation (Optionnel)</label>
                                    <textarea className="form-control form-control-sm" rows="2" value={formData.observation} onChange={e => handleSimpleChange('observation', e.target.value)}></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                            <button type="button" onClick={onClose} className="btn btn-light">Annuler</button>
                            <button type="submit" className="btn btn-success d-flex align-items-center gap-2"><Save size={18} /> Enregistrer pour impression</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MissionReportModal;
