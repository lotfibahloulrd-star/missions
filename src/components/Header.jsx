import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
    const { user } = useAppContext();

    return (
        <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3 sticky-top">
            <div className="container-fluid p-0">
                <form className="d-flex flex-grow-1" role="search">
                    <div className="input-group" style={{ maxWidth: '400px' }}>
                        <span className="input-group-text bg-light border-end-0">
                            <Search size={18} className="text-muted" />
                        </span>
                        <input className="form-control bg-light border-start-0" type="search" placeholder="Rechercher..." aria-label="Search" />
                    </div>
                </form>

                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light position-relative rounded-circle p-2">
                        <Bell size={20} className="text-secondary" />
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                        </span>
                    </button>

                    <div className="vr h-100 mx-2 text-secondary"></div>

                    <div className="d-flex align-items-center gap-2">
                        <div className="text-end d-none d-sm-block">
                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{user.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.role}</div>
                        </div>
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '40px', height: '40px' }}>
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                            ) : (
                                <span className="fw-bold">{user.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
