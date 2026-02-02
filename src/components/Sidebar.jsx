import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, Map, FileText, Settings, LogOut, Hexagon, ShieldCheck, Users } from 'lucide-react';

const Sidebar = () => {
    const { user, logout, messagesDb } = useAppContext();
    const navigate = useNavigate();

    const myMessages = user ? messagesDb.filter(m => m.toUserId === user.id && !m.read) : [];
    const unreadCount = myMessages.length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isPrivileged = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role);
    const isLogistique = user?.role === 'LOGISTIQUE';

    const navItems = [
        {
            icon: isPrivileged ? ShieldCheck : LayoutDashboard,
            label: isPrivileged ? 'Supervision' : 'Tableau de Bord',
            path: '/'
        },
        { icon: Map, label: 'Mes Missions', path: '/missions' },
        { icon: Users, label: 'Annuaire Clients', path: '/clients' },
    ];

    if (isPrivileged || isLogistique) {
        navItems.splice(2, 0, {
            icon: Hexagon,
            label: 'Suivi Logistique',
            path: '/logistique'
        });

        if (isPrivileged) {
            navItems.splice(3, 0, {
                icon: Users,
                label: 'Missions Équipe',
                path: '/team-missions'
            });
        }
    }

    navItems.push(
        { icon: FileText, label: 'Notes de Frais', path: '/expenses' },
        { icon: Settings, label: 'Paramètres', path: '/settings' }
    );

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-white sidebar" style={{ width: '280px' }}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none text-dark gap-2">
                <div className="d-flex flex-column align-items-center gap-1">
                    <div className="d-flex align-items-center gap-2">
                        <img src="/missions/logo.jpg" alt="ESCLAB Logo" style={{ height: '35px' }} />
                        <div style={{ width: '1px', height: '25px', background: '#dee2e6' }}></div>
                        <img src="/missions/logo_ecc.png" alt="ECC Logo" style={{ height: '35px' }} />
                    </div>
                </div>
            </a>
            <hr />
            <div className="mb-3 px-2">
                <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Menu Principal</small>
            </div>
            <ul className="nav nav-pills flex-column mb-auto">
                {navItems.map((item) => (
                    <li className="nav-item mb-1" key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 ${isActive ? 'active bg-primary text-white' : 'link-dark hover-bg-light'}`
                            }
                        >
                            <div className="position-relative">
                                <item.icon size={20} />
                                {item.path === '/' && unreadCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                        <span className="visually-hidden">New alerts</span>
                                    </span>
                                )}
                            </div>
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <hr />

            <div className="mt-auto">
                {user && (
                    <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                        <div className="d-flex align-items-center gap-2">
                            <div className={`rounded-circle p-1 d-flex justify-content-center align-items-center text-white ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? 'bg-danger' : 'bg-primary'}`} style={{ width: 32, height: 32 }}>
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="Profile" className="rounded-circle w-100 h-100" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <span className="fw-bold small">{user.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-truncate fw-bold small text-dark">{user.name}</div>
                                <div className="text-truncate text-muted" style={{ fontSize: '0.7rem' }}>
                                    {user.role === 'SUPER_ADMIN' ? 'Super Administrateur' :
                                        user.role === 'ADMIN' ? 'Administrateur' :
                                            user.role === 'LOGISTIQUE' ? 'Logistique' : 'Utilisateur'}
                                </div>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <span className="badge rounded-pill bg-danger">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                )}
                <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                    <LogOut size={18} /> Déconnexion
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
