// PDF Generator - Désactivé
// L'impression se fait maintenant via HTML (voir MissionList.jsx)

export const generateMissionOrder = (mission, user, settings, pages = 2) => {
    // Cette fonction n'est plus utilisée
    // L'impression se fait via window.open() avec du HTML
    console.warn("generateMissionOrder est obsolète. Utilisez le bouton d'impression HTML.");
    return true;
};

export const generateVisitReportPDF = (mission, user, settings, reportText) => {
    // Cette fonction n'est plus utilisée
    console.warn("generateVisitReportPDF est obsolète.");
    return true;
};
