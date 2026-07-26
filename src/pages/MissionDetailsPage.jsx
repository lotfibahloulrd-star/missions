import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MissionPreviewModal from '../components/MissionPreviewModal';

/**
 * MissionDetailsPage – Full page view for a mission.
 * Mirrors the UI of MissionPreviewModal but without the backdrop overlay.
 * Allows direct URL access (deep linking) to `/missions/:missionId`.
 */
const MissionDetailsPage = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { missions, usersDb, saveMissionReport, calculateMissionExpenses } = useAppContext();

  // Find the mission by ID (numeric comparison)
  const mission = missions.find((m) => Number(m.id) === Number(missionId));

  // If mission not found, redirect to mission list
  useEffect(() => {
    if (!mission) {
      navigate('/missions');
    }
  }, [mission, navigate]);

  if (!mission) return null; // Guard while redirecting

  // Resolve employee and participants similar to MissionPreviewModal
  const employee = usersDb.find((u) => u.id === (mission.userId || mission.userIds?.[0]));
  const participants = mission.participants || [];

  // Handlers passed down – they are defined in context (or can be no‑ops if not available)
  const onValidate = (id, status) => {
    if (typeof window.validateMission === 'function') window.validateMission(id, status);
  };
  const onReject = (id) => {
    if (typeof window.rejectMission === 'function') window.rejectMission(id);
  };
  const onEditExpenses = (m) => {
    if (typeof window.editExpenses === 'function') window.editExpenses(m);
  };

  return (
    <div className="container-fluid p-4">
      {/* Reuse the modal component but hide its backdrop by rendering only its inner content */}
      <MissionPreviewModal
        mission={mission}
        employee={employee}
        participants={participants}
        onValidate={onValidate}
        onReject={onReject}
        canValidate={true}
        canFinalValidate={true}
        onEditExpenses={onEditExpenses}
        // Provide a no‑op onClose that simply navigates back
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default MissionDetailsPage;
