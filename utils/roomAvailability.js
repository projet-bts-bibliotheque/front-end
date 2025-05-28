/**
 * Utilitaires pour gérer la disponibilité des salles
 */

/**
 * Vérifie si une salle est disponible à une date donnée
 * @param {number} roomId - ID de la salle
 * @param {Date|string} date - Date à vérifier
 * @param {Array} reservations - Liste des réservations
 * @returns {boolean} - true si disponible, false sinon
 */
export const isRoomAvailable = (roomId, date, reservations) => {
    if (!date || !reservations) return true;

    const dateStr =
        typeof date === 'string' ? date : date.toISOString().split('T')[0];

    return !reservations.some(
        (reservation) =>
            reservation.room_id === roomId &&
            reservation.date.startsWith(dateStr)
    );
};

/**
 * Récupère les réservations d'une salle pour une période donnée
 * @param {number} roomId - ID de la salle
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @param {Array} reservations - Liste des réservations
 * @returns {Array} - Liste des réservations filtrées
 */
export const getRoomReservations = (
    roomId,
    startDate,
    endDate,
    reservations
) => {
    if (!reservations) return [];

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return reservations.filter((reservation) => {
        const reservationDate = reservation.date.split('T')[0];
        return (
            reservation.room_id === roomId &&
            reservationDate >= start &&
            reservationDate <= end
        );
    });
};

/**
 * Obtient le statut de disponibilité pour une salle sur plusieurs jours
 * @param {number} roomId - ID de la salle
 * @param {Array} dates - Liste des dates à vérifier
 * @param {Array} reservations - Liste des réservations
 * @returns {Object} - Objet avec les dates comme clés et le statut comme valeurs
 */
export const getRoomAvailabilityStatus = (roomId, dates, reservations) => {
    const status = {};

    dates.forEach((date) => {
        const dateStr = date.toISOString().split('T')[0];
        status[dateStr] = isRoomAvailable(roomId, dateStr, reservations);
    });

    return status;
};

/**
 * Génère une liste de dates pour un mois donné
 * @param {number} year - Année
 * @param {number} month - Mois (0-11)
 * @returns {Array} - Liste des dates du mois
 */
export const generateMonthDates = (year, month) => {
    const dates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        dates.push(new Date(year, month, day));
    }

    return dates;
};

/**
 * Vérifie si une date est dans le passé
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} - true si la date est passée
 */
export const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = typeof date === 'string' ? new Date(date) : date;
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
};

/**
 * Formate une date pour l'affichage
 * @param {Date|string} date - Date à formater
 * @param {string} locale - Locale pour le formatage (défaut: 'fr-FR')
 * @param {Object} options - Options de formatage
 * @returns {string} - Date formatée
 */
export const formatDate = (date, locale = 'fr-FR', options = {}) => {
    const defaultOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const formatOptions = { ...defaultOptions, ...options };
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString(locale, formatOptions);
};

/**
 * Calcule les statistiques de réservation pour une salle
 * @param {number} roomId - ID de la salle
 * @param {Array} reservations - Liste des réservations
 * @param {number} days - Nombre de jours à analyser (défaut: 30)
 * @returns {Object} - Statistiques de réservation
 */
export const getRoomReservationStats = (roomId, reservations, days = 30) => {
    if (!reservations) return { totalReservations: 0, occupancyRate: 0 };

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const roomReservations = getRoomReservations(
        roomId,
        startDate,
        endDate,
        reservations
    );
    const occupancyRate = (roomReservations.length / days) * 100;

    return {
        totalReservations: roomReservations.length,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averagePerWeek:
            Math.round((roomReservations.length / days) * 7 * 100) / 100
    };
};

/**
 * Trouve les créneaux disponibles pour une salle sur une période
 * @param {number} roomId - ID de la salle
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @param {Array} reservations - Liste des réservations
 * @returns {Array} - Liste des dates disponibles
 */
export const getAvailableSlots = (roomId, startDate, endDate, reservations) => {
    const availableSlots = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        if (
            !isPastDate(currentDate) &&
            isRoomAvailable(roomId, currentDate, reservations)
        ) {
            availableSlots.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots;
};

/**
 * Valide les données d'une réservation avant envoi
 * @param {Object} reservationData - Données de la réservation
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateReservation = (reservationData) => {
    const errors = [];

    if (!reservationData.room_id) {
        errors.push('ID de la salle requis');
    }

    if (!reservationData.date) {
        errors.push('Date de réservation requise');
    } else {
        const reservationDate = new Date(reservationData.date);
        if (isPastDate(reservationDate)) {
            errors.push('Impossible de réserver dans le passé');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Convertit une date au format ISO pour l'API
 * @param {Date} date - Date à convertir
 * @returns {string} - Date au format YYYY-MM-DD
 */
export const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * Génère un ID unique pour une réservation (côté client uniquement)
 * @returns {string} - ID unique
 */
export const generateReservationId = () => {
    return `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * Groupe les réservations par mois
 * @param {Array} reservations - Liste des réservations
 * @returns {Object} - Réservations groupées par mois (YYYY-MM)
 */
export const groupReservationsByMonth = (reservations) => {
    return reservations.reduce((groups, reservation) => {
        const monthKey = reservation.date.substring(0, 7); // YYYY-MM
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(reservation);
        return groups;
    }, {});
};

/**
 * Calcule la prochaine date disponible pour une salle
 * @param {number} roomId - ID de la salle
 * @param {Array} reservations - Liste des réservations
 * @param {number} maxDaysAhead - Nombre maximum de jours à chercher (défaut: 30)
 * @returns {Date|null} - Prochaine date disponible ou null si aucune trouvée
 */
export const getNextAvailableDate = (
    roomId,
    reservations,
    maxDaysAhead = 30
) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= maxDaysAhead; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        if (isRoomAvailable(roomId, checkDate, reservations)) {
            return checkDate;
        }
    }

    return null;
};
