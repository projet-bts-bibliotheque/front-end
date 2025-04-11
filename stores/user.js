import { defineStore } from 'pinia';

export const useUsersStore = defineStore('user', {
    state: () => ({
        user: {
            id: null,
            name: '',
            email: ''
        },
        access_token: null,
        token_type: null
    }),

    getters: {
        isLoggedIn: (state) => !!state.access_token
    },

    actions: {
        async login(email, password) {
            try {
                const response = await fetch(
                    'http://localhost:1234/api/login',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || 'Échec de la connexion'
                    );
                }

                const data = await response.json();
                console.log('Login response:', data);

                // Stockez le token au niveau du store (pas dans user)
                this.access_token = data.access_token;
                this.token_type = data.token_type;

                // Stockez le token dans le stockage approprié également
                const storage = localStorage; // ou sessionStorage selon votre cas
                storage.setItem('auth_token', data.access_token);
                storage.setItem('token_type', data.token_type);

                return data;
            } catch (error) {
                console.error('Error:', error);
                throw error; // Propagez l'erreur pour que le composant puisse la gérer
            }
        },

        async fetchUserData() {
            try {
                // Vérifiez d'abord si un token est disponible
                if (!this.access_token) {
                    // Essayez de récupérer le token du stockage
                    const token =
                        localStorage.getItem('auth_token') ||
                        sessionStorage.getItem('auth_token');
                    if (!token) {
                        throw new Error(
                            "Aucun token d'authentification disponible"
                        );
                    }
                    this.access_token = token;
                    this.token_type =
                        localStorage.getItem('token_type') ||
                        sessionStorage.getItem('token_type') ||
                        'Bearer';
                }

                console.log('Using token:', this.access_token);

                const response = await fetch('http://localhost:1234/api/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${this.token_type} ${this.access_token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(
                        `Erreur lors de la récupération des données utilisateur: ${response.status}`
                    );
                }

                const userData = await response.json();
                console.log('User data:', userData);

                // Mettre à jour les informations utilisateur
                this.user = userData;

                return userData;
            } catch (error) {
                console.error('Error fetching user data:', error);
                throw error;
            }
        },

        async register(userData) {
            try {
                const response = await fetch(
                    'http://localhost:1234/api/register',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData)
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Échec de l'inscription"
                    );
                }

                return await response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },

        logout() {
            // Effacer les données utilisateur et les tokens
            this.user = {
                id: null,
                name: '',
                email: ''
            };
            this.access_token = null;
            this.token_type = null;

            // Supprimer les tokens du stockage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token_type');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('token_type');
        }
    }
});
