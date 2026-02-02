import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Save, ArrowLeft, Plus, Trash2, Users as UsersIcon, MapPin, Building2 } from 'lucide-react';
import { generateMissionOrder } from '../utils/pdfGenerator';

const wilayas = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", "06 - Béjaïa", "07 - Biskra", "08 - Béchar",
    "09 - Blida", "10 - Bouira", "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger",
    "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma",
    "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", "31 - Oran", "32 - El Bayadh",
    "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued",
    "40 - Khenchela", "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent",
    "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar", "51 - Ouled Djellal", "52 - Béni Abbès",
    "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", "56 - Djanet", "57 - Inames", "58 - El Meniaa"
];

const MissionForm = () => {
    const navigate = useNavigate();
    const { addMission, updateMission, usersDb, user, missions, globalSettings } = useAppContext();

    // Check if we are editing (via URL state)
    const editingId = new URLSearchParams(window.location.search).get('edit');
    const existingMission = editingId ? missions.find(m => m.id === parseInt(editingId)) : null;

    const [formData, setFormData] = useState(existingMission ? {
        ...existingMission
    } : {
        entity: 'ESCLAB',
        destinations: [],
        userIds: [user?.id],
        dateStart: '',
        dateEnd: '',
        vehicle: 'service',
        description: '',
        budget: 0,
        clients: [{ name: '', contact: '', region: '' }]
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (formData.destinations.length === 0) {
            alert("Veuillez sélectionner au moins une wilaya.");
            return;
        }

        // Prepare submission data
        const submissionData = {
            ...formData,
            userId: user.id, // Explicitly set the initiator ID
        };

        if (editingId) {
            updateMission(parseInt(editingId), submissionData);
        } else {
            addMission(submissionData);
            // TEMPORAIREMENT DÉSACTIVÉ POUR DEBUG
            // Print only page 1 for new missions
            // const participantNames = (submissionData.userIds || []).map(id => usersDb.find(u => u.id === id)?.name).filter(Boolean);
            // generateMissionOrder({ ...submissionData, participants: participantNames, id: 'NOUVEAU' }, user, globalSettings, 1);
        }
        navigate('/missions');
    };

    const toggleWilaya = (w) => {
        const current = formData.destinations;
        if (current.includes(w)) {
            setFormData({ ...formData, destinations: current.filter(x => x !== w) });
        } else {
            setFormData({ ...formData, destinations: [...current, w] });
        }
    };

    const toggleParticipant = (uId) => {
        const current = formData.userIds || [];
        if (current.includes(uId)) {
            // Primary user (creator) cannot be removed
            if (uId === user.id) return;
            setFormData({ ...formData, userIds: current.filter(id => id !== uId) });
        } else {
            setFormData({ ...formData, userIds: [...current, uId] });
        }
    };

    const addClient = () => {
        setFormData({ ...formData, clients: [...formData.clients, { name: '', contact: '', region: '' }] });
    };

    const updateClient = (index, field, value) => {
        const newClients = [...formData.clients];
        newClients[index][field] = value;
        setFormData({ ...formData, clients: newClients });
    };

    const removeClient = (index) => {
        if (formData.clients.length <= 1) return;
        setFormData({ ...formData, clients: formData.clients.filter((_, i) => i !== index) });
    };

    return (
        <div className="container-fluid p-0 max-w-lg mx-auto pb-5" style={{ maxWidth: '900px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2 shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="fw-bold mb-0">{editingId ? 'Modifier la Mission' : 'Nouvelle Mission'}</h2>
                    <p className="text-muted mb-0">{editingId ? 'Mise à jour d\'une mission existante.' : 'Planification d\'un nouveau déplacement.'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* SECTION 1: ENTITY & DESTINATIONS */}
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white py-3">
                                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <Building2 size={18} className="text-primary" /> Entité & Destinations
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Au nom de :</label>
                                    <div className="d-flex gap-3">
                                        {['ESCLAB', 'ECC'].map(ent => (
                                            <div key={ent}
                                                className={`flex-grow-1 p-3 border rounded text-center cursor-pointer transition ${formData.entity === ent ? 'border-primary bg-primary-subtle' : 'bg-light'}`}
                                                onClick={() => setFormData({ ...formData, entity: ent })}
                                            >
                                                <div className={`fw-bold ${formData.entity === ent ? 'text-primary' : ''}`}>SARL {ent}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <label className="form-label fw-semibold">Wilayas Visitées (Plusieurs possibles)</label>
                                <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <div className="row g-2">
                                        {wilayas.map(w => (
                                            <div key={w} className="col-md-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`w-${w}`}
                                                        checked={formData.destinations.includes(w)}
                                                        onChange={() => toggleWilaya(w)}
                                                    />
                                                    <label className="form-check-label small" htmlFor={`w-${w}`}>{w}</label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {formData.destinations.length > 0 && (
                                    <div className="mt-2 d-flex flex-wrap gap-1">
                                        {formData.destinations.map(w => (
                                            <span key={w} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: TEAM & DATES */}
                    <div className="col-md-7">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white py-3">
                                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <UsersIcon size={18} className="text-primary" /> Équipe de Mission
                                </h6>
                            </div>
                            <div className="card-body">
                                <label className="form-label fw-semibold small">Collaborateurs (Binôme / Trinôme)</label>
                                <div className="list-group mb-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    {usersDb.map(u => (
                                        <label key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    className="form-check-input me-1"
                                                    type="checkbox"
                                                    checked={formData.userIds.includes(u.id)}
                                                    disabled={u.id === user.id} // Creator always included
                                                    onChange={() => toggleParticipant(u.id)}
                                                />
                                                <span className="small">{u.name}</span>
                                            </div>
                                            <span className="badge bg-light text-dark small">{u.department}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Date de début</label>
                                        <input type="date" className="form-control" required value={formData.dateStart} onChange={e => setFormData({ ...formData, dateStart: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Date de fin</label>
                                        <input type="date" className="form-control" required value={formData.dateEnd} onChange={e => setFormData({ ...formData, dateEnd: e.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small">Moyen de Transport</label>
                                        <select className="form-select" value={formData.vehicle} onChange={e => setFormData({ ...formData, vehicle: e.target.value })}>
                                            <option value="service">Véhicule de Service</option>
                                            <option value="personnel">Véhicule Personnel</option>
                                            <option value="transport">Transport Public (Taxi/Train/Avion)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: CLIENTS (MANDATORY) */}
                    <div className="col-md-5">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <MapPin size={18} className="text-primary" /> Clients Visités
                                </h6>
                                <button type="button" onClick={addClient} className="btn btn-sm btn-outline-primary p-1"><Plus size={16} /></button>
                            </div>
                            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {formData.clients.map((client, idx) => (
                                    <div key={idx} className="p-3 bg-light rounded mb-3 position-relative border border-dashed border-primary-subtle">
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <input
                                                    className="form-control form-control-sm mb-2"
                                                    placeholder="Nom du Client / Entreprise"
                                                    value={client.name}
                                                    onChange={e => updateClient(idx, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <input
                                                    className="form-control form-control-sm mb-2"
                                                    placeholder="Contact (Tél / Email)"
                                                    value={client.contact}
                                                    onChange={e => updateClient(idx, 'contact', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <input
                                                    className="form-control form-control-sm"
                                                    placeholder="Wilaya / Ville"
                                                    value={client.region}
                                                    onChange={e => updateClient(idx, 'region', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {formData.clients.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeClient(idx)}
                                                className="btn btn-sm text-danger position-absolute top-0 end-0 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <label className="form-label fw-semibold">Objectif & Détails Supplémentaires</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    required
                                    placeholder="Décrivez précisément l'objet de la visite..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 d-flex justify-content-center gap-3 mt-2">
                        <button type="button" onClick={() => navigate('/')} className="btn btn-light px-5 shadow-sm">Annuler</button>
                        <button type="submit" className="btn btn-primary px-5 shadow-sm d-flex align-items-center gap-2 py-2 fw-bold">
                            <Save size={20} /> {editingId ? 'Valider les Modifications' : 'Lancer la Demande'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MissionForm;
