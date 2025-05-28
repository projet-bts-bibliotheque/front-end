// services/api.js - Version corrigée

const API_URL = process.env.API_URL || 'http://localhost:1234/api';

/**
 * Service pour gérer toutes les requêtes API
 */
const apiService = {
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
    }
};

// Ajouter les services spécifiques à l'objet principal
apiService.auth = {
    register(userData) {
        return apiService.post('/register', userData);
    },
    login(credentials) {
        return apiService.post('/login', credentials);
    },
    me() {
        return apiService.get('/me');
    },
    forgotPassword(email) {
        return apiService.post('/forgot-password', { email });
    },
    resetPassword(data) {
        return apiService.post('/reset-password', data);
    },
    update(userData) {
        return apiService.put('/me', userData);
    }
};

apiService.books = {
    getAll() {
        return apiService.get('/books');
    },
    get(id) {
        return apiService.get(`/books/${id}`);
    },
    create(bookData) {
        return apiService.post('/books', bookData);
    },
    update(id, bookData) {
        return apiService.put(`/books/${id}`, bookData);
    },
    delete(id) {
        return apiService.delete(`/books/${id}`);
    }
};

apiService.authors = {
    getAll() {
        return apiService.get('/authors');
    },
    get(id) {
        return apiService.get(`/authors/${id}`);
    }
};

apiService.editors = {
    getAll() {
        return apiService.get('/editors');
    },
    get(id) {
        return apiService.get(`/editors/${id}`);
    }
};

apiService.rooms = {
    getAll() {
        return apiService.get('/rooms');
    },
    get(id) {
        return apiService.get(`/rooms/${id}`);
    },
    create(roomData) {
        return apiService.post('/rooms', roomData);
    },
    update(id, roomData) {
        return apiService.put(`/rooms/${id}`, roomData);
    },
    delete(id) {
        return apiService.delete(`/rooms/${id}`);
    }
};

apiService.bookReservations = {
    getAll() {
        return apiService.get('/reservation/books');
    },
    getMine() {
        return apiService.get('/reservation/books/me');
    },
    create(bookId) {
        return apiService.post('/reservation/books', { book_id: bookId });
    },
    returnBook(bookId) {
        return apiService.post('/reservation/books/return', {
            book_id: bookId
        });
    },
    delete(reservationId) {
        return apiService.delete(`/reservation/books/${reservationId}`);
    },
    getUserReservations(userId) {
        return apiService.get(`/reservation/books/${userId}`);
    }
};

apiService.roomReservations = {
    getAll() {
        return apiService.get('/reservation/rooms');
    },
    getMine() {
        return apiService.get('/reservation/rooms/me');
    },
    create(roomId, date) {
        return apiService.post('/reservation/rooms', { room_id: roomId, date });
    },
    delete(reservationId) {
        return apiService.delete(`/reservation/rooms/${reservationId}`);
    },
    getUserReservations(userId) {
        return apiService.get(`/reservation/rooms/${userId}`);
    }
};

export default apiService;
