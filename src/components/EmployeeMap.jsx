import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, MapPin, Navigation } from 'lucide-react';

// Fix for default Leaflet icon not appearing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Algerian regions coordinates
const regionCoords = {
    'Alger': [36.7538, 3.0588],
    'Constantine': [36.3650, 6.6147],
    'Oran': [35.6987, -0.6329],
    'Annaba': [36.9000, 7.7667],
    'Setif': [36.1911, 5.4092],
    'Bechar': [31.6167, -2.2167],
    'Ouargla': [31.9493, 5.3250],
    'Tamanrasset': [22.7850, 5.5228],
    'Bouira': [36.3749, 3.9009],
    'Blida': [36.4700, 2.8300],
    'Tlemcen': [34.8783, -1.3150],
    'Bejaia': [36.7511, 5.0642],
    'Skikda': [36.8789, 6.9044],
    'Chlef': [36.1647, 1.3347],
    'Ghardaia': [32.4909, 3.6733],
    'Biskra': [34.8500, 5.7333],
};

const EmployeeMap = ({ employees, missions }) => {
    const activeMissions = useMemo(() => {
        return missions.filter(m => m.status === 'Validée');
    }, [missions]);

    const employeePositions = useMemo(() => {
        return employees.map(emp => {
            // Check if employee is currently on mission
            const today = new Date().toISOString().split('T')[0];
            const currentMission = activeMissions.find(m =>
                m.userId === emp.id &&
                today >= m.dateStart &&
                today <= m.dateEnd
            );

            let pos = regionCoords[emp.region] || [36.7538, 3.0588]; // Default to Alger
            let locationName = emp.region || 'Alger';
            let isOnMission = false;

            if (currentMission) {
                const dest = currentMission.destinations?.[0] || currentMission.destination;
                if (regionCoords[dest]) {
                    pos = regionCoords[dest];
                    locationName = dest;
                    isOnMission = true;
                }
            }

            // Jitter for multiple employees in same city
            const jitter = 0.005;
            pos = [pos[0] + (Math.random() - 0.5) * jitter, pos[1] + (Math.random() - 0.5) * jitter];

            return { ...emp, pos, locationName, isOnMission, currentMission };
        });
    }, [employees, activeMissions]);

    return (
        <div className="card border-0 shadow-sm overflow-hidden" style={{ height: '600px', borderRadius: '15px' }}>
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                    <Navigation size={18} className="text-primary" />
                    Suivi Géographique des Équipes (Algérie)
                </h6>
                <div className="d-flex gap-3 small">
                    <div className="d-flex align-items-center gap-1 text-success">
                        <div className="rounded-circle bg-success" style={{ width: 8, height: 8 }}></div> En Mission
                    </div>
                    <div className="d-flex align-items-center gap-1 text-muted">
                        <div className="rounded-circle bg-secondary" style={{ width: 8, height: 8 }}></div> Au Siège / Base
                    </div>
                </div>
            </div>
            <div className="card-body p-0 position-relative">
                <MapContainer center={[32.0, 3.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {employeePositions.map(emp => (
                        <Marker
                            key={emp.id}
                            position={emp.pos}
                            icon={L.divIcon({
                                className: 'custom-div-icon',
                                html: `
                                    <div class="marker-container ${emp.isOnMission ? 'on-mission' : ''}">
                                        <div class="marker-avatar shadow-sm">
                                            ${emp.name.charAt(0)}
                                        </div>
                                        <div class="marker-pulse"></div>
                                    </div>
                                `,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20]
                            })}
                        >
                            <Popup className="premium-popup">
                                <div className="p-1">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div className="bg-primary text-white rounded-circle p-1 fw-bold small" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div className="fw-bold text-dark">{emp.name}</div>
                                    </div>
                                    <div className="small text-muted mb-1">
                                        <MapPin size={12} className="me-1" /> {emp.locationName}
                                    </div>
                                    <div className={`badge ${emp.isOnMission ? 'bg-success' : 'bg-light text-muted border'} w-100 mb-2`} style={{ fontSize: '0.65rem' }}>
                                        {emp.isOnMission ? 'EN MISSION ACTIVE' : 'À SA BASE'}
                                    </div>
                                    {emp.isOnMission && (
                                        <div className="mt-2 pt-2 border-top">
                                            <div className="fw-bold small text-primary">{emp.currentMission.description || 'Mission Technique'}</div>
                                            <div className="text-muted" style={{ fontSize: '0.6rem' }}>Retour prévu : {emp.currentMission.dateEnd}</div>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <style>{`
                    .marker-container {
                        position: relative;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .marker-avatar {
                        width: 32px;
                        height: 32px;
                        background: #fff;
                        border: 2px solid #0d6efd;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #0d6efd;
                        z-index: 2;
                        font-size: 14px;
                    }
                    .on-mission .marker-avatar {
                        border-color: #198754;
                        color: #198754;
                        background: #e8f5e9;
                    }
                    .on-mission .marker-pulse {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        background: rgba(25, 135, 84, 0.4);
                        border-radius: 50%;
                        z-index: 1;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0% { transform: scale(0.6); opacity: 1; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                    .premium-popup .leaflet-popup-content-wrapper {
                        border-radius: 12px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    }
                    .premium-popup .leaflet-popup-content {
                        margin: 12px;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EmployeeMap;
