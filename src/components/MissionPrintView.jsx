import React from 'react';

const MissionPrintView = ({ mission, user, settings }) => {
    const entity = mission.entity || 'ESCLAB';
    const companyName = entity === 'ECC' ? "SARL ECC" : "SARL ESCLAB";
    const destinations = mission.destinations || [mission.destination];
    const participantNames = mission.participants ? mission.participants.join(', ') : user.name;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            {/* En-tête */}
            <div style={{ marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>{companyName}</h1>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    {entity === 'ECC'
                        ? "Dispositifs médicaux — Matériel de laboratoire & Consommable"
                        : "Equipements Scientifiques de Contrôle et de Laboratoire"}
                </p>
            </div>

            {/* Titre */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>ORDRE DE MISSION</h2>
                <p style={{ margin: 0, fontSize: '14px' }}>Réf : #{mission.id} / {new Date().getFullYear()}</p>
            </div>

            {/* Informations */}
            <table style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold', width: '200px' }}>Nom et Prénom :</td>
                        <td style={{ padding: '10px 0' }}>{participantNames}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Fonction :</td>
                        <td style={{ padding: '10px 0' }}>{user.role === 'LOGISTIQUE' ? 'Logistique' : 'Technico-Commercial / Ingénieur'}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Objet de la mission :</td>
                        <td style={{ padding: '10px 0' }}>{mission.description || "Mission technique et commerciale"}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Lieu(x) de destination :</td>
                        <td style={{ padding: '10px 0' }}>{destinations.join(' - ')}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Période prévue :</td>
                        <td style={{ padding: '10px 0' }}>Du {mission.dateStart} Au {mission.dateEnd}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Moyen de transport :</td>
                        <td style={{ padding: '10px 0' }}>{mission.vehicle === 'service' ? "Véhicule de service" : "Véhicule personnel"}</td>
                    </tr>
                    {user.phone && (
                        <tr>
                            <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Contact :</td>
                            <td style={{ padding: '10px 0' }}>{user.phone}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Visa */}
            <div style={{ marginBottom: '40px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Visa des Organismes Visités :</p>
                <div style={{ border: '1px solid #333', height: '100px' }}></div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
                <div style={{ textAlign: 'center', width: '40%' }}>
                    <p style={{ fontWeight: 'bold' }}>Le(s) Missionnaire(s)</p>
                    <div style={{ marginTop: '60px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                        Signature
                    </div>
                </div>
                <div style={{ textAlign: 'center', width: '40%' }}>
                    <p style={{ fontWeight: 'bold' }}>La Direction Générale</p>
                    <div style={{ marginTop: '60px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                        Signature
                    </div>
                </div>
            </div>

            {/* Date */}
            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#666' }}>
                Fait à Alger, le {new Date().toLocaleDateString('fr-FR')}
            </div>

            {/* Boutons d'action */}
            <div style={{ marginTop: '40px', textAlign: 'center', pageBreakAfter: 'avoid' }} className="no-print">
                <button
                    onClick={() => window.print()}
                    style={{
                        padding: '10px 30px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Imprimer / Sauvegarder en PDF
                </button>
                <button
                    onClick={() => window.close()}
                    style={{
                        padding: '10px 30px',
                        fontSize: '16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Fermer
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default MissionPrintView;
