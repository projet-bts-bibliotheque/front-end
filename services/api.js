// Service central pour les appels API

const API_URL = process.env.API_URL || 'http://localhost:1234/api';

/**
 * Service pour gérer toutes les requêtes API
 */
export default {
    /**
     * Options par défaut pour fetch
     */
    getDefaultOptions() {
        const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token');
        return {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        };
    },

    /**
     * Effectue une requête GET
     * @param {string} endpoint - Point d'accès API
     * @returns {Promise} - Promesse avec les données de la réponse
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                ...this.getDefaultOptions()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Une erreur est survenue');
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur API GET ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Effectue une requête POST
     * @param {string} endpoint - Point d'accès API
     * @param {Object} data - Données à envoyer
     * @returns {Promise} - Promesse avec les données de la réponse
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                ...this.getDefaultOptions(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Une erreur est survenue');
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur API POST ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Effectue une requête PUT
     * @param {string} endpoint - Point d'accès API
     * @param {Object} data - Données à envoyer
     * @returns {Promise} - Promesse avec les données de la réponse
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                ...this.getDefaultOptions(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Une erreur est survenue');
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur API PUT ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Effectue une requête DELETE
     * @param {string} endpoint - Point d'accès API
     * @returns {Promise} - Promesse avec les données de la réponse
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                ...this.getDefaultOptions()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Une erreur est survenue');
            }

            return await response.json();
        } catch (error) {
            console.error(`Erreur API DELETE ${endpoint}:`, error);
            throw error;
        }
    },

    // Services spécifiques
    auth: {
        register(userData) {
            return this.post('/register', userData);
        },
        login(credentials) {
            return this.post('/login', credentials);
        },
        me() {
            return this.get('/me');
        },
        forgotPassword(email) {
            return this.post('/forgot-password', { email });
        },
        resetPassword(data) {
            return this.post('/reset-password', data);
        },
        update(userData) {
            return this.put('/me', userData);
        }
    },

    books: {
        getAll() {
            return this.get('/books');
        },
        get(id) {
            return this.get(`/books/${id}`);
        },
        create(bookData) {
            return this.post('/books', bookData);
        },
        update(id, bookData) {
            return this.put(`/books/${id}`, bookData);
        },
        delete(id) {
            return this.delete(`/books/${id}`);
        }
    },

    authors: {
        getAll() {
            return this.get('/authors');
        },
        get(id) {
            return this.get(`/authors/${id}`);
        }
    },

    editors: {
        getAll() {
            return this.get('/editors');
        },
        get(id) {
            return this.get(`/editors/${id}`);
        }
    },

    rooms: {
        getAll() {
            return this.get('/rooms');
        },
        get(id) {
            return this.get(`/rooms/${id}`);
        },
        create(roomData) {
            return this.post('/rooms', roomData);
        },
        update(id, roomData) {
            return this.put(`/rooms/${id}`, roomData);
        },
        delete(id) {
            return this.delete(`/rooms/${id}`);
        }
    },

    bookReservations: {
        getAll() {
            return this.get('/reservation/books');
        },
        getMine() {
            return this.get('/reservation/books/me');
        },
        create(bookId) {
            return this.post('/reservation/books', { book_id: bookId });
        },
        returnBook(bookId) {
            return this.post('/reservation/books/return', { book_id: bookId });
        },
        delete(reservationId) {
            return this.delete(`/reservation/books/${reservationId}`);
        },
        getUserReservations(userId) {
            return this.get(`/reservation/books/${userId}`);
        }
    },

    roomReservations: {
        getAll() {
            return this.get('/reservation/rooms');
        },
        getMine() {
            return this.get('/reservation/rooms/me');
        },
        create(roomId, date) {
            return this.post('/reservation/rooms', { room_id: roomId, date });
        },
        delete(reservationId) {
            return this.delete(`/reservation/rooms/${reservationId}`);
        },
        getUserReservations(userId) {
            return this.get(`/reservation/rooms/${userId}`);
        }
    }
};
