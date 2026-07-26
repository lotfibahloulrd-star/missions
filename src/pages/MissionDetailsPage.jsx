import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MissionPreviewModal from '../components/MissionPreviewModal';
import MissionReportModal from '../components/MissionReportModal';

/**
 * MissionDetailsPage – Full page view for a mission.
 * Mirrors the UI of MissionPreviewModal but respects user role validation rules.
 */
const MissionDetailsPage = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { missions, usersDb, user, updateMissionStatus, validateMissionFinal, saveMissionReport } = useAppContext();
  const [editingExpensesMission, setEditingExpensesMission] = useState(null);

  // Find the mission by ID (numeric comparison)
  const mission = missions.find((m) => Number(m.id) === Number(missionId));

  // If mission not found, redirect to mission list
  useEffect(() => {
    if (!mission) {
      navigate('/missions');
    }
  }, [mission, navigate]);

  if (!mission) return null; // Guard while redirecting

  // Resolve employee and participants
  const employee = usersDb.find((u) => u.id === (mission.userId || mission.userIds?.[0]));
  const participants = (mission.userIds || [])
    .filter((id) => id !== (mission.userId || mission.userIds?.[0]))
    .map((id) => usersDb.find((u) => u.id === id))
    .filter(Boolean);

  // User permission logic for validation:
  // 1. Users 20 (Lydia) & 21 (Hammou) cannot validate.
  // 2. Only SUPER_ADMIN, ADMIN, and MANAGER can validate initial missions.
  // 3. Only SUPER_ADMIN can validate their own mission; others cannot self-validate.
  const currentUserId = Number(user?.id);
  const missionOwnerId = Number(mission.userId || mission.userIds?.[0]);

  const canValidate = Boolean(
    user &&
      ![20, 21].includes(currentUserId) &&
      ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role) &&
      (user.role === 'SUPER_ADMIN' || missionOwnerId !== currentUserId)
  );

  const canFinalValidate = Boolean(
    user &&
      ![20, 21].includes(currentUserId) &&
      (user.role === 'SUPER_ADMIN' || (user.role === 'ADMIN' && user.department === 'RH'))
  );

  return (
    <div className="container-fluid p-4">
      <MissionPreviewModal
        mission={mission}
        employee={employee}
        participants={participants}
        onValidate={updateMissionStatus}
        onFinalValidate={validateMissionFinal}
        canValidate={canValidate}
        canFinalValidate={canFinalValidate}
        onReject={(id) => updateMissionStatus(id, 'Rejetée')}
        onEditExpenses={(m) => setEditingExpensesMission(m)}
        onClose={() => navigate(-1)}
      />

      {editingExpensesMission && (
        <MissionReportModal
          mission={editingExpensesMission}
          onClose={() => setEditingExpensesMission(null)}
          onSave={(reportData) => {
            saveMissionReport(editingExpensesMission.id, reportData);
            setEditingExpensesMission(null);
          }}
        />
      )}
    </div>
  );
};

export default MissionDetailsPage;
