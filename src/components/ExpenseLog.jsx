import React, { useState } from 'react';
import { Upload, Plus, Trash2, DollarSign } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ExpenseLog = () => {
    const { expenses, addExpense, deleteExpense, user } = useAppContext();
    const [newExpense, setNewExpense] = useState({ type: 'Restoration', amount: '', date: new Date().toISOString().split('T')[0] });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.date) return;
        addExpense({
            ...newExpense,
            amount: Number(newExpense.amount)
        });
        setNewExpense({ type: 'Restoration', amount: '', date: new Date().toISOString().split('T')[0] });
    };

    // Filter expenses if not admin? User probably only wants to see their own OR admins see all.
    // Based on user request, "toutes les equipes soit a jour", admins should see everything.
    const isPrivileged = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
    const displayedExpenses = isPrivileged ? expenses : expenses.filter(e => e.userId === user?.id);

    const total = displayedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

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
                        <span className="text-white-50 small text-uppercase fw-bold">Total {isPrivileged ? "Général" : "à Rembourser"}</span>
                        <div className="display-6 fw-bold">{total.toLocaleString()} DA</div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
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
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Historique des Frais</h5>
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
            </div>
        </div>
    );
};

export default ExpenseLog;
