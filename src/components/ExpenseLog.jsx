import React, { useState } from 'react';
import { Upload, Plus, Trash2, DollarSign } from 'lucide-react';

const ExpenseLog = () => {
    const [expenses, setExpenses] = useState([
        { id: 1, type: 'Hôtel', amount: 8000, date: '2024-02-10', proof: 'facture_hotel.pdf' },
        { id: 2, type: 'Déjeuner', amount: 1500, date: '2024-02-10', proof: '' },
    ]);

    const [newExpense, setNewExpense] = useState({ type: 'Restoration', amount: '', date: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newExpense.amount) return;
        setExpenses([...expenses, { ...newExpense, id: Date.now(), amount: Number(newExpense.amount) }]);
        setNewExpense({ type: 'Restoration', amount: '', date: '' });
    };

    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="container-fluid p-0">
            <div className="card bg-primary text-white border-0 shadow mb-4">
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold mb-1">Notes de Frais</h2>
                        <p className="mb-0 text-white-50">Gestion des dépenses.</p>
                    </div>
                    <div className="text-end">
                        <span className="text-white-50 small text-uppercase fw-bold">Total à Rembourser</span>
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
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary mt-2">
                                    <Plus size={18} className="me-2" /> Ajouter
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Liste */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4 py-3">Description</th>
                                        <th className="py-3">Date</th>
                                        <th className="py-3">Justificatif</th>
                                        <th className="text-end pe-4 py-3">Montant</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td className="ps-4 fw-medium">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-light p-2 rounded-circle text-primary">
                                                        <DollarSign size={16} />
                                                    </div>
                                                    {expense.type}
                                                </div>
                                            </td>
                                            <td className="text-muted">{expense.date}</td>
                                            <td>
                                                {expense.proof ? (
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle">Reçu OK</span>
                                                ) : (
                                                    <button className="btn btn-sm btn-link text-decoration-none">
                                                        <Upload size={14} className="me-1" /> Ajouter
                                                    </button>
                                                )}
                                            </td>
                                            <td className="text-end pe-4 fw-bold text-dark">
                                                {expense.amount.toLocaleString()} DA
                                            </td>
                                            <td className="text-end pe-3">
                                                <button
                                                    onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                                                    className="btn btn-sm btn-outline-danger border-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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
