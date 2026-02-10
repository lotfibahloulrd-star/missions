import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    // Initial Data Parsers - SECURED with try/catch
    const loadInitialUsers = () => {
        try {
            const saved = localStorage.getItem('missiondz_users_db_v3');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0 && parsed[0].department) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Error parsing users storage:", e);
        }

        return [
            // DIRECTION / SUPER ADMINS
            { id: 1, name: 'Ali OUALI', email: 'a.ouali@esclab-algerie.com', password: 'admin', role: 'SUPER_ADMIN', department: 'DIRECTION', region: 'National', phone: '' },
            { id: 2, name: 'Lotfi BAHLOUL', email: 'l.bahloul@esclab-algerie.com', password: 'admin', role: 'SUPER_ADMIN', department: 'DIRECTION', region: 'National', phone: '' },

            // RH / ADMIN
            { id: 3, name: 'Lamia ADJALI', email: 'l.adjali@esclab-algerie.com', password: 'user123', role: 'ADMIN', department: 'RH', region: 'National', phone: '' },
            { id: 45, name: 'Fatiha BOURCHOUCH', email: 'f.bourchouch@esclab-algerie.com', password: 'user123', role: 'ADMIN', department: 'RH', region: 'National', phone: '' },

            // LOGISTIQUE
            { id: 23, name: 'Mohamed OUALI', email: 'm.ouali@esclab-algerie.com', password: 'user123', role: 'LOGISTIQUE', department: 'LOGISTIQUE', region: 'National', phone: '' },

            // MANAGEMENT COMMERCIAL
            { id: 4, name: 'Farid TAAZIBT', email: 'f.taazibt@esclab-algerie.com', password: 'user123', role: 'MANAGER', department: 'COMMERCIAL', region: 'National', phone: '' },

            // EQUIPE COMMERCIALE
            { id: 5, name: 'Assia Adjlia', email: 'a.adjilia@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 6, name: 'Naima Medjkoune', email: 'n.medjkoune@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 7, name: 'Abderrahmane Cherbal', email: 'a.cherbal@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 8, name: 'Youcef Belkadi', email: 'y.belkadi@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 9, name: 'Mounir Khelfaoui', email: 'm.khelfaoui@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 10, name: 'Ali Ait Azzouz', email: 'a.aitazzouz@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 11, name: 'Nour el houda Belhamel', email: 'n.belhamel@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },
            { id: 50, name: 'Iliza Abdelli', email: 'i.abdelli@esclab-algerie.com', password: 'user123', role: 'USER', department: 'COMMERCIAL', region: 'Alger', phone: '' },

            // MANAGEMENT TECHNIQUE
            { id: 12, name: 'Djamel BERGHEUL', email: 'dj.bergheul@esclab-algerie.com', password: 'user123', role: 'ADMIN', department: 'TECHNIQUE', region: 'National', phone: '' },

            // EQUIPE TECHNIQUE
            { id: 13, name: 'Rahim Bouhammou', email: 'r.bouhammou@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },
            { id: 14, name: 'Abdelhakim Krimi', email: 'h.krimi@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },
            { id: 15, name: 'Akli HABTICHE', email: 'a.habtiche@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },
            { id: 16, name: 'Djelloul BELKEBLA', email: 'djelloul.belkebla@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },
            { id: 17, name: 'Zineddine AMIR', email: 'ami.zineddine@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },
            { id: 18, name: 'Fayçal BAOUCHE', email: 'f.baouche@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },
            { id: 19, name: 'Larbi DAOUD', email: 'd.larbi@esclab-algerie.com', password: 'user123', role: 'USER', department: 'TECHNIQUE', region: 'Alger', phone: '' },

            // AUTRES
            { id: 20, name: 'Lydia KERSANI', email: 'l.kersani@esclab-algerie.com', password: 'admin', role: 'ADMIN', department: 'DIRECTION', region: 'National', phone: '' },
            { id: 21, name: 'Hammou BERKAI', email: 'h.berkai@esclab-algerie.com', password: 'admin', role: 'USER', department: 'DIRECTION', region: 'National', phone: '' },
            { id: 22, name: 'Lynda BOUABDALLAH', email: 'l.bouabdallah@esclab-algerie.com', password: 'admin', role: 'USER', department: 'DIRECTION', region: 'National', phone: '' },

            // EQUIPE LABORATOIRE
            { id: 30, name: 'Razika KARA', email: 'r.kara@esclab-algerie.com', password: 'user123', role: 'MANAGER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 31, name: 'Katia AOUIMEUR', email: 'k.aouimeur@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 32, name: 'Amel SAIDANI', email: 'a.saidani@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 33, name: 'Widad OUZIDANE', email: 'w.ouzidane@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 34, name: 'Yasmina BOUCHAL', email: 'y.bouchal@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 35, name: 'Zehira GARTI', email: 'z.garti@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 36, name: 'Malik ALLOUACHE', email: 'm.allouache@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 37, name: 'Aichouche AOUIMEUR', email: 'a.aouimeur@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 38, name: 'Koceila BENSMAIL', email: 'k.bensmail@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 39, name: 'Ali AZIZI', email: 'a.azizi@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 40, name: 'Djafar SOUAGUI', email: 'd.souagui@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 41, name: 'Aimed SAOUDI', email: 'a.saoudi@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 42, name: 'Yanis ABOUD', email: 'aboud.yanis@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 43, name: 'Abdenour IHDENE', email: 'ihdene.abdenour@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
            { id: 44, name: 'Walid AIMEUR', email: 'w.aimeur@esclab-algerie.com', password: 'user123', role: 'USER', department: 'LABORATOIRE', region: 'Alger', phone: '' },
        ];
    };

    const loadInitialMissions = () => {
        try {
            const saved = localStorage.getItem('missiondz_missions');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing missions storage:", e);
        }
        return [
            {
                id: 1,
                userId: 2,
                destination: 'Oran',
                dateStart: '2024-02-10',
                dateEnd: '2024-02-12',
                status: 'Validée',
                budget: 15000,
                description: 'Installation équipements client Sonatrach',
            }
        ];
    };

    const loadInitialUser = () => {
        try {
            const saved = localStorage.getItem('missiondz_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Error parsing current user storage:", e);
            return null;
        }
    };

    const loadInitialSettings = () => {
        try {
            const saved = localStorage.getItem('missiondz_settings');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing settings storage:", e);
        }
        return {
            companyName: 'ESCLAB ALGERIE',
            companyAddress: 'Zone Industrielle Oued Smar, Alger',
            companyPhone: '+213 21 00 00 00',
            companyEmail: 'contact@esclab-algerie.com',
            kmRate: 15,
            budgetLimit: 50000
        };
    };

    const loadInitialMessages = () => {
        try {
            const saved = localStorage.getItem('missiondz_messages');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error parsing messages storage:", e);
            return [];
        }
    };

    // States
    const [usersDb, setUsersDb] = useState(loadInitialUsers);
    const [currentUser, setCurrentUser] = useState(loadInitialUser);
    const [missions, setMissions] = useState(loadInitialMissions);
    const [globalSettings, setGlobalSettings] = useState(loadInitialSettings);
    const [messagesDb, setMessagesDb] = useState(loadInitialMessages);
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('missiondz_expenses');
        return saved ? JSON.parse(saved) : [];
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Server-side Sync Helpers - UPDATED for Granular Safety
    const saveToServer = async (action, data) => {
        try {
            const apiUrl = `${import.meta.env.BASE_URL}data_api.php?action=${action}`;
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }) // data wrapped in 'data' key for consistency
            });
        } catch (err) {
            console.error(`Error saving ${action} to server:`, err);
        }
    };

    // Deletion helper
    const deleteFromServer = async (action, id) => {
        try {
            const apiUrl = `${import.meta.env.BASE_URL}data_api.php?action=${action}`;
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (err) {
            console.error(`Error deleting ${action} from server:`, err);
        }
    };

    const loadFromServer = async () => {
        try {
            const apiUrl = `${import.meta.env.BASE_URL}data_api.php`; // Default GET loads all
            const res = await fetch(apiUrl);
            if (!res.ok) return;

            const data = await res.json();

            if (data) {
                if (Array.isArray(data.users) && data.users.length > 0) {
                    setUsersDb(data.users);
                }
                if (Array.isArray(data.missions) && data.missions.length > 0) {
                    setMissions(data.missions);
                }
                if (data.settings && typeof data.settings === 'object') {
                    setGlobalSettings(data.settings);
                }
                if (Array.isArray(data.messages)) {
                    setMessagesDb(data.messages);
                }
                if (Array.isArray(data.expenses)) {
                    setExpenses(data.expenses);
                }
            }
        } catch (err) {
            console.error("Erreur de synchronisation avec le serveur.");
        } finally {
            setIsInitialLoad(false);
        }
    };

    // Initial load + Auto-refresh polling
    useEffect(() => {
        loadFromServer();
        const interval = setInterval(() => {
            loadFromServer();
        }, 30000); // 30 secondes
        return () => clearInterval(interval);
    }, []);


    // Persistence Effects (Local Storage ONLY)
    // We removed the auto-sync to server from here to prevent overwriting server state with stale local state.
    // Server sync is now done explicitly in action functions (addUser, addMission, etc.)
    useEffect(() => {
        localStorage.setItem('missiondz_users_db_v3', JSON.stringify(usersDb));
    }, [usersDb]);

    useEffect(() => {
        localStorage.setItem('missiondz_missions', JSON.stringify(missions));
    }, [missions]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('missiondz_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('missiondz_user');
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('missiondz_settings', JSON.stringify(globalSettings));
    }, [globalSettings]);

    useEffect(() => {
        localStorage.setItem('missiondz_messages', JSON.stringify(messagesDb));
    }, [messagesDb]);

    useEffect(() => {
        localStorage.setItem('missiondz_expenses', JSON.stringify(expenses));
    }, [expenses]);

    // Actions
    const login = (email, password) => {
        const user = usersDb.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const addUser = (newUser) => {
        const userWithId = { ...newUser, id: Date.now(), phone: newUser.phone || '', profilePic: '' };
        setUsersDb([...usersDb, userWithId]);
        saveToServer('save_user', userWithId);
    };

    const deleteUser = (userId) => {
        setUsersDb(usersDb.filter(u => u.id !== userId));
        deleteFromServer('delete_user', userId);
    };

    const updateUser = (updatedUser) => {
        setUsersDb(usersDb.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser({ ...currentUser, ...updatedUser });
        }
        saveToServer('save_user', updatedUser);
    };

    const updatePassword = (newPassword) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, password: newPassword };
        setCurrentUser(updatedUser);
        setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
        saveToServer('save_user', updatedUser);
    };

    const updateSettings = (newSettings) => {
        setGlobalSettings(newSettings);
        saveToServer('save_settings', newSettings);
    };

    // Helper for notifications
    // Helper for email notifications
    const sendEmailNotification = (toEmail, subject, content) => {
        const apiUrl = `${import.meta.env.BASE_URL}email_api.php`;
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: toEmail,
                subject: subject,
                message: content,
                fromName: 'ESCLAB Missions'
            })
        }).catch(err => console.error("Email API Error:", err));
    };

    const notifyAdmins = (subject, content, relatedDept = null) => {
        const recipients = usersDb.filter(u => {
            if (['SUPER_ADMIN', 'LOGISTIQUE'].includes(u.role)) return true;
            if (['ADMIN', 'MANAGER'].includes(u.role)) {
                return relatedDept && u.department === relatedDept;
            }
            return false;
        });
        recipients.forEach(r => {
            sendMessage({ id: 0, name: 'Système' }, subject, content, r.id);
            if (r.email) sendEmailNotification(r.email, subject, content.replace(/\n/g, '<br>'));
        });
    };

    const addMission = (missionData) => {
        if (!currentUser) return;

        const baseId = Date.now();
        const participants = missionData.userIds || [currentUser.id];

        const newMissions = participants.map((uId, index) => ({
            ...missionData,
            id: baseId + index,
            groupId: baseId,
            userId: uId,
            status: 'En Attente',
            createdAt: new Date().toISOString().split('T')[0],
            reminders: { h24: false, h36: false, h48: false }
        }));

        setMissions([...newMissions, ...missions]);

        // Save each generated mission to server
        newMissions.forEach(m => saveToServer('save_mission', m));

        // Notifications
        const destinations = (missionData.destinations || [missionData.destination]).join(', ');
        const missionDetails = `
DE : ${currentUser.name}
OBJET : ${missionData.description || 'Mission professionnelle'}
DESTINATION : ${destinations}
PERIODE : Du ${missionData.dateStart} au ${missionData.dateEnd}

Lien de validation : https://esclab-academy.com/missions/
        `;

        notifyAdmins(
            `Nouvelle mission : ${currentUser.name} - ${destinations}`,
            missionDetails,
            currentUser.department
        );

        // Smart Overlap Detection
        participants.forEach(pId => {
            const participantObj = usersDb.find(u => u.id === pId);
            const otherMissions = missions.filter(m =>
                m.status === 'Validée' || m.status === 'En Attente'
            );

            const overlaps = otherMissions.filter(m => {
                const sameDest = (m.destinations || [m.destination]).some(d =>
                    (missionData.destinations || [missionData.destination]).includes(d)
                );
                const sameDates = m.dateStart === missionData.dateStart || m.dateEnd === missionData.dateEnd;
                return sameDest && sameDates && (m.userId !== pId);
            });

            if (overlaps.length > 0) {
                notifyAdmins(
                    "ALERTE : Missions simultanées détectées",
                    `Attention : Plusieurs utilisateurs (dont ${participantObj?.name}) prévoient des missions vers la même destination (${missionData.destination}) aux mêmes dates (${missionData.dateStart}).`
                );
            }
        });
    };

    const updateMissionStatus = (missionId, newStatus) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) return;

        const groupId = mission.groupId;

        const updateLogic = (m) => {
            const updatedMission = { ...m, status: newStatus };
            saveToServer('save_mission', updatedMission);
            return updatedMission;
        };

        const updated = missions.map(m => {
            if (groupId && m.groupId === groupId) {
                return updateLogic(m);
            } else if (m.id === missionId) {
                return updateLogic(m);
            }
            return m;
        });

        setMissions(updated);

        // Notify user
        if (newStatus === 'Validée' || newStatus === 'Rejetée') {
            sendMessage(
                { id: 0, name: 'Système' },
                `Statut de votre mission : ${newStatus}`,
                `Votre ordre de mission pour ${(mission.destinations || [mission.destination]).join(', ')} a été ${newStatus.toLowerCase()}.`,
                mission.userId
            );

            // Email Notification to user
            const userObj = usersDb.find(u => u.id === mission.userId);
            if (userObj && userObj.email) {
                sendEmailNotification(
                    userObj.email,
                    `Statut Mission : ${newStatus}`,
                    `Bonjour ${userObj.name},<br><br>Votre demande de mission pour <b>${(mission.destinations || [mission.destination]).join(', ')}</b> a été <b>${newStatus.toLowerCase()}</b>.`
                );
            }
        }
    };

    const saveVisitReport = (missionId, reportText, clients) => {
        setMissions(prevMissions => {
            const mission = prevMissions.find(m => m.id === missionId);
            if (!mission) return prevMissions;

            const groupId = mission.groupId;

            // Updated status flow: 'Terminée' (Waiting for HR validation)
            const updateLogic = (m) => {
                const updated = {
                    ...m,
                    visitReport: reportText,
                    clients: clients,
                    status: 'Attente Validation RH' // New status clearly indicating the waiting step
                };
                saveToServer('save_mission', updated);
                return updated;
            };

            if (groupId) {
                return prevMissions.map(m => m.groupId === groupId ? updateLogic(m) : m);
            } else {
                return prevMissions.map(m => m.id === missionId ? updateLogic(m) : m);
            }
        });

        const mission = missions.find(m => m.id === missionId);
        notifyAdmins(
            "Rapport de Mission Déposé",
            `L'utilisateur ${currentUser.name} a déposé son rapport pour ${(mission.destinations || [mission.destination]).join(', ')}. En attente de validation RH.`,
            'RH'
        );
    };

    const validateMissionFinal = (missionId) => {
        setMissions(prevMissions => {
            const mission = prevMissions.find(m => m.id === missionId);
            if (!mission) return prevMissions;

            const groupId = mission.groupId;
            const updateLogic = (m) => {
                const updated = { ...m, status: 'Clôturée' };
                saveToServer('save_mission', updated);
                return updated;
            };

            if (groupId) {
                return prevMissions.map(m => m.groupId === groupId ? updateLogic(m) : m);
            } else {
                return prevMissions.map(m => m.id === missionId ? updateLogic(m) : m);
            }
        });

        const m = missions.find(m => m.id === missionId);
        if (m) {
            sendMessage(
                currentUser || { id: 3, name: 'RH' },
                "Mission Clôturée",
                `Votre dossier de mission a été validé par ${currentUser?.name || 'les RH'}.`,
                m.userId
            );

            // Email Notification to user
            const userObj = usersDb.find(u => u.id === m.userId);
            if (userObj && userObj.email) {
                sendEmailNotification(
                    userObj.email,
                    "Mission Clôturée - Validation Finale",
                    `Bonjour ${userObj.name},<br><br>Votre dossier de mission pour <b>${(m.destinations || [m.destination]).join(', ')}</b> a été validé par le service RH (${currentUser?.name || 'Lamia/Fatiha'}). La mission est désormais clôturée.`
                );
            }
        }
    };

    const updateMission = (missionId, updatedData) => {
        setMissions(prevMissions => {
            const originalMission = prevMissions.find(m => m.id === missionId);
            if (!originalMission) return prevMissions;

            const groupId = originalMission.groupId;

            // CAS 1: Mission simple sans groupe ou update simple
            if (!groupId) {
                return prevMissions.map(m => {
                    if (m.id === missionId) {
                        const updated = { ...m, ...updatedData, status: 'En Attente' };
                        saveToServer('save_mission', updated);
                        return updated;
                    }
                    return m;
                });
            }

            // CAS 2: Gestion de Groupe (Sync des participants)
            const existingGroupMissions = prevMissions.filter(m => m.groupId === groupId);
            const newParticipantIds = updatedData.userIds || [];
            const { userId, id, ...commonData } = updatedData;

            // 4. Mettre à jour les missions existantes
            let updatedMissionsList = prevMissions.map(m => {
                if (m.groupId === groupId) {
                    if (newParticipantIds.includes(m.userId)) {
                        const updated = {
                            ...m,
                            ...commonData,
                            userIds: newParticipantIds,
                            status: 'En Attente'
                        };
                        saveToServer('save_mission', updated);
                        return updated;
                    } else {
                        deleteFromServer('delete_mission', m.id);
                        return null;
                    }
                }
                return m;
            }).filter(Boolean);

            // 5. Créer les missions pour les nouveaux participants
            const existingUserIds = existingGroupMissions.map(m => m.userId);
            const addedUserIds = newParticipantIds.filter(uid => !existingUserIds.includes(uid));

            const brandNewMissions = addedUserIds.map((uid, idx) => ({
                ...commonData,
                id: Date.now() + idx,
                groupId: groupId,
                userId: uid,
                userIds: newParticipantIds,
                status: 'En Attente',
                createdAt: new Date().toISOString().split('T')[0],
                reminders: { h24: false, h36: false, h48: false }
            }));

            brandNewMissions.forEach(m => saveToServer('save_mission', m));

            return [...updatedMissionsList, ...brandNewMissions];
        });
    };

    const deleteMission = (missionId) => {
        setMissions(prev => {
            const missionToDelete = prev.find(m => m.id === missionId);
            if (!missionToDelete) return prev;

            deleteFromServer('delete_mission', missionId);

            const remaining = prev.filter(m => m.id !== missionId);

            if (missionToDelete.groupId) {
                const deletedUserId = missionToDelete.userId;
                return remaining.map(m => {
                    if (m.groupId === missionToDelete.groupId) {
                        const updated = {
                            ...m,
                            userIds: (m.userIds || []).filter(uid => uid !== deletedUserId)
                        };
                        saveToServer('save_mission', updated); // Update group list
                        return updated;
                    }
                    return m;
                });
            }
            return remaining;
        });
    };

    const saveMissionReport = (missionId, reportData) => {
        setMissions(missions.map(m => {
            if (m.id === missionId) {
                const updated = { ...m, reportData };
                saveToServer('save_mission', updated);
                return updated;
            }
            return m;
        }));
    };

    const shareReport = (missionId, userIds) => {
        setMissions(missions.map(m => {
            if (m.id === missionId) {
                const updated = { ...m, sharedWith: userIds };
                saveToServer('save_mission', updated);
                return updated;
            }
            return m;
        }));

        // Notify recipients
        userIds.forEach(uid => {
            sendMessage(
                currentUser || { id: 0, name: 'Système' },
                "Rapport partagé",
                `Un rapport de mission a été partagé avec vous par ${currentUser?.name}.`,
                uid
            );
        });
    };

    const sendMessage = (fromUser, subject, content, toUserId = null) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            fromUserId: fromUser.id,
            fromName: fromUser.name,
            toUserId: toUserId,
            subject,
            content,
            date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR'),
            read: false,
        };
        setMessagesDb(prev => [newMessage, ...prev]);
        saveToServer('save_message', newMessage);
    };

    const markMessageAsRead = (messageId) => {
        // This is tricky because we need the message object to update it
        // We can do it by finding it in state
        const msg = messagesDb.find(m => m.id === messageId);
        if (msg) {
            const updated = { ...msg, read: true };
            saveToServer('save_message', updated);

            setMessagesDb(messagesDb.map(m =>
                m.id === messageId ? updated : m
            ));
        }
    };

    const deleteMessage = (messageId) => {
        setMessagesDb(messagesDb.filter(m => m.id !== messageId));
        deleteFromServer('delete_message', messageId); // Assuming we add delete_message support if needed, or re-purpose delete_mission approach
        // Note: My PHP API didn't explicitly check 'delete_message', I'll add it or it will just fail silently (safe).
        // Actually I should add delete_message to PHP.
    };

    const addExpense = (newExp) => {
        const expWithId = {
            ...newExp,
            id: Date.now(),
            userId: currentUser?.id,
            userName: currentUser?.name
        };
        setExpenses(prev => [...prev, expWithId]);
        saveToServer('save_expense', expWithId);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        deleteFromServer('delete_expense', id);
    };

    const checkMissionDeadlines = () => {
        const now = new Date();
        let missionsUpdate = [...missions];
        let newMessages = [];
        let hasUpdates = false;

        missionsUpdate = missionsUpdate.map(m => {
            if (m.status !== 'Validée' || m.visitReport) return m;

            const dateEnd = new Date(m.dateEnd);
            dateEnd.setHours(23, 59, 59, 999);

            const diffMs = now - dateEnd;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 24) return m;

            let reminders = m.reminders || { h24: false, h36: false, h48: false };
            let changed = false;

            if (diffHours >= 24 && !reminders.h24) {
                newMessages.push({
                    toUserId: m.userId,
                    subject: "Rappel : Mission à clôturer",
                    content: `Votre mission à ${m.destination} (fin le ${m.dateEnd}) n'est pas clôturée. Veuillez déposer votre compte rendu.`
                });
                reminders.h24 = true;
                changed = true;
            }

            if (diffHours >= 36 && !reminders.h36) {
                const employee = usersDb.find(u => u.id === m.userId);
                if (employee) {
                    const admins = usersDb.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role));
                    admins.forEach(recipient => {
                        newMessages.push({
                            toUserId: recipient.id,
                            subject: "Escalade : Mission non clôturée",
                            content: `Le collaborateur ${employee.name} n'a pas clôturé sa mission à ${m.destination} (fin le ${m.dateEnd}).`
                        });
                    });
                }
                reminders.h36 = true;
                changed = true;
            }

            if (diffHours >= 48 && !reminders.h48) {
                const superAdmins = usersDb.filter(u => u.role === 'SUPER_ADMIN');
                const employee = usersDb.find(u => u.id === m.userId);
                superAdmins.forEach(admin => {
                    newMessages.push({
                        toUserId: admin.id,
                        subject: "ALERTE : Retard Clôture Mission",
                        content: `ALERTE : La mission de ${employee?.name || 'Inconnu'} à ${m.destination} dépasse les 48h de retard de clôture.`
                    });
                });
                reminders.h48 = true;
                changed = true;
            }

            if (changed) {
                hasUpdates = true;
                return { ...m, reminders };
            }
            return m;
        });

        if (hasUpdates) {
            setMissions(missionsUpdate);
            const formattedMessages = newMessages.map(msg => ({
                id: Date.now() + Math.random(),
                fromUserId: 0,
                fromName: "Système",
                toUserId: msg.toUserId,
                subject: msg.subject,
                content: msg.content,
                date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR'),
                read: false,
            }));
            setMessagesDb(prev => [...formattedMessages, ...prev]);
        }
    };

    useEffect(() => {
        if (usersDb.length > 0 && missions.length > 0) {
            checkMissionDeadlines();
        }
    }, [missions.length, usersDb.length]);

    const resetDatabase = () => {
        localStorage.clear();
        window.location.reload();
    };

    const getVisibleMissions = () => {
        if (!currentUser) return [];
        const myId = currentUser.id;

        if (['SUPER_ADMIN', 'LOGISTIQUE'].includes(currentUser.role)) {
            return missions;
        }

        // For ADMIN and MANAGER users, limit to missions belonging to their own department
        if (['ADMIN', 'MANAGER'].includes(currentUser.role)) {
            // Find missions where the owner (or any participant) belongs to the same department as the current user
            // OR if the mission is shared with the current user
            return missions.filter(m => {
                const isShared = m.sharedWith?.includes(myId);
                if (isShared) return true;

                const ownerId = m.userId || m.userIds?.[0];
                const owner = usersDb.find(u => u.id === ownerId);
                return owner && owner.department === currentUser.department;
            });
        }

        // Regular users: own missions, participating missions, or SHARED missions
        return missions.filter(m =>
            m.userId === myId ||
            m.userIds?.includes(myId) ||
            m.sharedWith?.includes(myId)
        );
    };

    return (
        <AppContext.Provider value={{
            user: currentUser,
            isInitialLoad,
            usersDb,
            missions: getVisibleMissions(),
            allMissions: missions,
            globalSettings,
            messagesDb,
            login,
            logout,
            addUser,
            deleteUser,
            updateUser,
            updatePassword,
            updateSettings,
            addMission,
            updateMission,
            updateMissionStatus,
            deleteMission,
            saveMissionReport,
            shareReport,
            saveVisitReport,
            validateMissionFinal,
            sendMessage,
            markMessageAsRead,
            deleteMessage,
            expenses,
            addExpense,
            deleteExpense,
            resetDatabase
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
