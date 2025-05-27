/**
 * Configuration de l'API
 */
export default {
    /**
     * URL de base de l'API
     * En production, utilisez une variable d'environnement
     */
    baseURL: process.env.API_URL || 'http://localhost:8000/api',

    /**
     * Timeout des requêtes en millisecondes
     */
    timeout: 30000,

    /**
     * Configuration des messages d'erreur par défaut
     */
    errorMessages: {
        default: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        network:
            'Erreur de connexion. Veuillez vérifier votre connexion internet.',
        unauthorized: "Vous n'êtes pas autorisé à effectuer cette action.",
        forbidden: "Vous n'avez pas les droits nécessaires pour cette action.",
        notFound: "La ressource demandée n'existe pas.",
        serverError:
            'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
        timeout:
            'La requête a pris trop de temps. Veuillez réessayer plus tard.'
    },

    /**
     * Configuration des endpoints
     * Centralise les URLs pour faciliter les mises à jour
     */
    endpoints: {
        // Authentification
        auth: {
            login: '/login',
            register: '/register',
            me: '/me',
            forgotPassword: '/forgot-password',
            resetPassword: '/reset-password'
        },

        // Livres
        books: {
            all: '/books',
            single: (id) => `/books/${id}`
        },

        // Auteurs
        authors: {
            all: '/authors',
            single: (id) => `/authors/${id}`
        },

        // Éditeurs
        editors: {
            all: '/editors',
            single: (id) => `/editors/${id}`
        },

        // Salles
        rooms: {
            all: '/rooms',
            single: (id) => `/rooms/${id}`
        },

        // Réservations de livres
        bookReservations: {
            all: '/reservation/books',
            mine: '/reservation/books/me',
            return: '/reservation/books/return',
            user: (userId) => `/reservation/books/${userId}`,
            delete: (id) => `/reservation/books/${id}`
        },

        // Réservations de salles
        roomReservations: {
            all: '/reservation/rooms',
            mine: '/reservation/rooms/me',
            user: (userId) => `/reservation/rooms/${userId}`,
            delete: (id) => `/reservation/rooms/${id}`
        },

        // Utilisateurs (admin seulement)
        users: {
            all: '/users',
            single: (id) => `/users/${id}`
        }
    },

    /**
     * Vérifier si un utilisateur a le droit d'accéder à une fonctionnalité admin
     * @param {Object} user - L'utilisateur courant
     * @param {number} requiredRole - Le niveau de rôle requis (0=membre, 1=staff, 2=admin)
     * @returns {boolean} True si l'utilisateur a le droit
     */
    hasAccess(user, requiredRole = 1) {
        if (!user) return false;
        return user.role >= requiredRole;
    },

    /**
     * Vérifier si un utilisateur est administrateur
     * @param {Object} user - L'utilisateur courant
     * @returns {boolean} True si l'utilisateur est administrateur
     */
    isAdmin(user) {
        return this.hasAccess(user, 2);
    },

    /**
     * Vérifier si un utilisateur est membre du personnel
     * @param {Object} user - L'utilisateur courant
     * @returns {boolean} True si l'utilisateur est membre du personnel
     */
    isStaff(user) {
        return this.hasAccess(user, 1);
    }
};
