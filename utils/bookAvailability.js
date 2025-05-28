/**
 * Vérifie la disponibilité d'un livre en consultant les réservations actives
 * @param {string} isbn - ISBN du livre à vérifier
 * @returns {Promise<boolean>} - true si disponible, false sinon
 */
export const checkBookAvailability = async (isbn) => {
    try {
        const api = (await import('@/services/api')).default;

        // Récupérer toutes les réservations
        const reservations = await api.get('/reservation/books');

        // Vérifier s'il y a une réservation active pour ce livre (pas encore retourné)
        const activeReservation = reservations.find(
            (reservation) =>
                reservation.book_id === isbn && !reservation.return_date
        );

        return !activeReservation; // Disponible si pas de réservation active
    } catch (error) {
        console.error(
            'Erreur lors de la vérification de disponibilité:',
            error
        );
        return false; // En cas d'erreur, considérer comme non disponible
    }
};

/**
 * Met à jour le statut de disponibilité pour une liste de livres
 * @param {Array} books - Liste des livres à mettre à jour
 * @returns {Promise<Array>} - Liste des livres avec statut mis à jour
 */
export const updateBooksAvailability = async (books) => {
    try {
        const api = (await import('@/services/api')).default;

        // Récupérer toutes les réservations actives
        const reservations = await api.get('/reservation/books');
        const borrowedBooks = reservations
            .filter((r) => !r.return_date)
            .map((r) => r.book_id);

        // Mettre à jour le statut de chaque livre
        return books.map((book) => ({
            ...book,
            available: !borrowedBooks.includes(book.isbn)
        }));
    } catch (error) {
        console.error(
            'Erreur lors de la mise à jour des disponibilités:',
            error
        );
        return books; // Retourner les livres sans modification en cas d'erreur
    }
};
