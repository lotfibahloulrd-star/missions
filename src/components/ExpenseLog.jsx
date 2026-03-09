import React, { useState } from 'react';
import { Upload, Plus, Trash2, DollarSign, Briefcase, FileText, Calendar, MapPin, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ExpenseLog = () => {
    const { expenses, addExpense, deleteExpense, user, allMissions, usersDb } = useAppContext();
    const [newExpense, setNewExpense] = useState({ type: 'Restoration', amount: '', date: new Date().toISOString().split('T')[0] });
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'missions'

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.date) return;
        addExpense({
            ...newExpense,
            amount: Number(newExpense.amount)
        });
        setNewExpense({ type: 'Restoration', amount: '', date: new Date().toISOString().split('T')[0] });
    };

    const isRH = user?.role === 'ADMIN' && user?.department === 'RH';
    const isPrivileged = user?.role === 'SUPER_ADMIN' || isRH;

    if (!isPrivileged) {
        return (
            <div className="container-fluid p-4 text-center">
                <div className="alert alert-danger shadow-sm border-0 d-inline-block px-5 py-4">
                    <h4 className="fw-bold mb-3">Accès Restreint</h4>
                    <p className="mb-0">Seuls les Super-Administrateurs et les Ressources Humaines peuvent accéder aux notes de frais globales.</p>
                </div>
            </div>
        );
    }

    const displayedExpenses = expenses;
    const manualTotal = displayedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate Mission Expenses History
    const calculateMissionTotal = (reportData, dateStart, dateEnd) => {
        if (!dateStart || !dateEnd) return 0;
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const days = diffDays + 1;
        const nights = diffDays;

        const perDiem = (days * 2000) + (nights * 800);
        const hotel = Number(reportData.hebergement?.frais || 0);
        const repas = Number(reportData.repas?.frais || 0);
        const divers = Number(reportData.divers?.frais || 0);
        // We subtract the advance to show the "Restant à Payer" or just show the total? 
        // Usually, the history shows the Total incurred.
        return perDiem + hotel + repas + divers;
    };

    const missionExpenses = allMissions
        .filter(m => m.reportData && m.status === 'Clôturée')
        .map(m => ({
            id: m.id,
            userId: m.userId,
            userName: usersDb.find(u => u.id === m.userId)?.name || 'Inconnu',
            destination: (m.destinations || [m.destination]).join(', '),
            date: m.dateEnd,
            period: `${m.dateStart} au ${m.dateEnd}`,
            amount: calculateMissionTotal(m.reportData, m.dateStart, m.dateEnd),
            reportData: m.reportData
        }));

    const missionTotal = missionExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const globalTotal = manualTotal + missionTotal;

    return (
        <div className="container-fluid p-0">
            <div className="card bg-primary text-white border-0 shadow mb-4">
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold mb-1">Notes de Frais</h2>
                        <p className="mb-0 text-white-50">
                            {isPrivileged ? "Suivi global des dépenses de l'entreprise." : "Suivi de vos dépenses personnelles."}
                        </p>
                    </div>
                    <div className="text-end">
                        <span className="text-white-50 small text-uppercase fw-bold">Total {activeTab === 'manual' ? "Frais Divers" : "Frais Missions"}</span>
                        <div className="display-6 fw-bold">{(activeTab === 'manual' ? manualTotal : missionTotal).toLocaleString()} DA</div>
                    </div>
                </div>
            </div>

            {/* TABS SELECTION */}
            <ul className="nav nav-pills mb-4 gap-2">
                <li className="nav-item">
                    <button
                        className={`nav-link px-4 fw-bold ${activeTab === 'manual' ? 'active shadow-sm' : 'bg-white text-dark border'}`}
                        onClick={() => setActiveTab('manual')}
                    >
                        <DollarSign size={18} className="me-2" /> Frais Divers (Petite Caisse)
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link px-4 fw-bold ${activeTab === 'missions' ? 'active shadow-sm' : 'bg-white text-dark border'}`}
                        onClick={() => setActiveTab('missions')}
                    >
                        <Briefcase size={18} className="me-2" /> Historique Notes de Mission
                    </button>
                </li>
            </ul>

            <div className="row g-4">
                {activeTab === 'manual' ? (
                    <>
                        {/* Formulaire */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-bold border-bottom py-3">Ajouter une dépense</div>
                                <div className="card-body">
                                    <form onSubmit={handleAdd} className="d-flex flex-column gap-3">
                                        <div>
                                            <label className="form-label small text-muted text-uppercase fw-bold">Type</label>
                                            <select
                                                className="form-select"
                                                value={newExpense.type}
                                                onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                                            >
                                                <option value="Restoration">Restoration</option>
                                                <option value="Hôtel">Hôtel</option>
                                                <option value="Transport">Transport / Taxi</option>
                                                <option value="Carburant">Carburant</option>
                                                <option value="Autre">Autre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label small text-muted text-uppercase fw-bold">Montant (DA)</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="0.00"
                                                    required
                                                    value={newExpense.amount}
                                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                />
                                                <span className="input-group-text">DA</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label small text-muted text-uppercase fw-bold">Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={newExpense.date}
                                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary mt-2 shadow-sm fw-bold">
                                            <Plus size={18} className="me-2" /> Enregistrer la dépense
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Liste */}
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">Frais Divers Enregistrés</h5>
                                    <span className="badge bg-light text-primary border">Total : {manualTotal.toLocaleString()} DA</span>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4 py-3">Collaborateur</th>
                                                <th className="py-3">Type</th>
                                                <th className="py-3">Date</th>
                                                <th className="text-end pe-4 py-3">Montant</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedExpenses.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted fst-italic">
                                                        Aucune dépense enregistrée.
                                                    </td>
                                                </tr>
                                            ) : (
                                                [...displayedExpenses].reverse().map((expense) => (
                                                    <tr key={expense.id}>
                                                        <td className="ps-4">
                                                            <div className="fw-bold small">{expense.userName || 'Moi'}</div>
                                                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>#{expense.id.toString().slice(-4)}</div>
                                                        </td>
                                                        <td className="fw-medium">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="bg-light p-2 rounded-circle text-primary">
                                                                    <DollarSign size={16} />
                                                                </div>
                                                                {expense.type}
                                                            </div>
                                                        </td>
                                                        <td className="text-muted small">{new Date(expense.date).toLocaleDateString('fr-FR')}</td>
                                                        <td className="text-end pe-4 fw-bold text-dark">
                                                            {expense.amount.toLocaleString()} DA
                                                        </td>
                                                        <td className="text-end pe-3">
                                                            {(isPrivileged || expense.userId === user?.id) && (
                                                                <button
                                                                    onClick={() => deleteExpense(expense.id)}
                                                                    className="btn btn-sm btn-outline-danger border-0"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Historique Global des Missions Clôturées</h5>
                                <span className="badge bg-success shadow-sm">Audit RH : {missionTotal.toLocaleString()} DA</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Mission / Collaborateur</th>
                                            <th>Destination</th>
                                            <th>Période</th>
                                            <th>Dépenses Validées</th>
                                            <th className="text-end pe-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missionExpenses.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    Aucune mission clôturée avec frais n'a été trouvée.
                                                </td>
                                            </tr>
                                        ) : (
                                            missionExpenses.map(mission => (
                                                <tr key={mission.id}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="bg-success bg-opacity-10 text-success rounded p-2">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold small text-uppercase">{mission.userName}</div>
                                                                <div className="text-muted small" style={{ fontSize: '0.65rem' }}>ID Mission: #{mission.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2 small fw-medium">
                                                            <MapPin size={12} className="text-muted" /> {mission.destination}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2 small text-muted">
                                                            <Calendar size={12} /> {mission.period}
                                                        </div>
                                                    </td>
                                                    <td className="fw-bold text-success">
                                                        {mission.amount.toLocaleString()} DA
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <button
                                                            className="btn btn-sm btn-outline-dark"
                                                            title="Voir Note de Frais"
                                                            onClick={() => alert(`Détails Mission ${mission.id}:\n- JF (2000 DA/j)\n- Nuitée (800 DA/n)\n- Hébergement: ${mission.reportData?.hebergement?.frais} DA\n- Repas: ${mission.reportData?.repas?.frais} DA`)}
                                                        >
                                                            <Eye size={14} className="me-1" /> Détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseLog;
