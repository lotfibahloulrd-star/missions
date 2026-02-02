import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Phone, Mail, MapPin, Building, User } from 'lucide-react';

const ClientList = () => {
    const { allMissions, usersDb } = useAppContext();
    const [searchTerm, setSearchTerm] = React.useState('');

    const clientsDb = React.useMemo(() => {
        const map = new Map();
        (allMissions || []).forEach(mission => {
            if (mission.clients && Array.isArray(mission.clients)) {
                mission.clients.forEach(client => {
                    const key = client.name.trim().toLowerCase();
                    const entry = {
                        name: client.name,
                        contact: client.contact,
                        region: client.region || mission.destination,
                        visitedBy: mission.userId,
                        lastVisited: mission.dateEnd
                    };

                    // Keep the most recent visit
                    if (!map.has(key) || new Date(entry.lastVisited) > new Date(map.get(key).lastVisited)) {
                        map.set(key, entry);
                    }
                });
            }
        });
        return Array.from(map.values());
    }, [allMissions]);

    const filteredClients = clientsDb.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.region?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">Annuaire des Clients</h2>
                    <p className="text-muted mb-0">Liste complète des contacts visités durant les missions.</p>
                </div>
                <div className="position-relative" style={{ width: '300px' }}>
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <input
                        type="text"
                        className="form-control ps-5 border-0 shadow-sm"
                        placeholder="Rechercher un client or ville..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Client / Entreprise</th>
                                <th>Wilaya</th>
                                <th>Coordonnées</th>
                                <th>Dernière Visite</th>
                                <th>Par</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client, idx) => {
                                const visitor = usersDb.find(u => u.id === client.visitedBy);
                                return (
                                    <tr key={idx}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-primary-subtle text-primary rounded p-2">
                                                    <Building size={20} />
                                                </div>
                                                <div className="fw-bold">{client.name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1 text-muted small">
                                                <MapPin size={14} />
                                                {client.region || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                <div className="small d-flex align-items-center gap-1">
                                                    <Phone size={12} className="text-muted" /> {client.contact}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="small text-muted">{client.lastVisited}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2 small">
                                                <div className="bg-light rounded-circle p-1" title={visitor?.name}>
                                                    <User size={12} />
                                                </div>
                                                <span>{visitor?.name.split(' ')[0]}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <div className="mb-2"><Search size={32} strokeWidth={1} /></div>
                                        Aucun client trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientList;
