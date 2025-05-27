// plugins/auth.js
import { defineNuxtPlugin, useState } from '#app';
import apiConfig from '~/config/api';

/**
 * Plugin pour gérer l'authentification à travers l'application
 */
export default defineNuxtPlugin(async (nuxtApp) => {
    // État global pour l'authentification
    const authState = useState('auth', () => ({
        isLoggedIn: false,
        user: null,
        token: null,
        loading: false,
        error: null
    }));

    // Vérifier si nous sommes côté client
    const isClient = process.client;

    // Importer le service API
    const apiModule = await import('~/services/api');
    const api = apiModule.default;

    /**
     * Vérifie si l'utilisateur est connecté et récupère ses informations
     */
    const checkAuth = async () => {
        // Ne pas vérifier l'authentification côté serveur
        if (!isClient) {
            return false;
        }

        // Récupérer le token du storage
        const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token');

        if (!token) {
            authState.value = {
                isLoggedIn: false,
                user: null,
                token: null,
                loading: false,
                error: null
            };
            return false;
        }

        try {
            authState.value.loading = true;
            authState.value.token = token;

            // Récupérer les informations de l'utilisateur
            const userData = await api.get('/me');

            // Mettre à jour l'état d'authentification
            authState.value = {
                isLoggedIn: true,
                user: userData,
                token,
                loading: false,
                error: null
            };

            return true;
        } catch (error) {
            console.error("Erreur de vérification d'authentification:", error);

            // Si erreur d'authentification, supprimer le token
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');

            authState.value = {
                isLoggedIn: false,
                user: null,
                token: null,
                loading: false,
                error: error.message || "Erreur d'authentification"
            };

            return false;
        }
    };

    /**
     * Connecte un utilisateur avec ses identifiants
     * @param {Object} credentials - Identifiants (email, password)
     * @param {boolean} rememberMe - Si true, stocke le token dans localStorage
     */
    const login = async (credentials, rememberMe = false) => {
        try {
            authState.value.loading = true;
            authState.value.error = null;

            // Appel à l'API d'authentification
            const authData = await api.post('/login', credentials);

            if (!authData || !authData.access_token) {
                throw new Error("Données d'authentification invalides");
            }

            // Stocker le token seulement côté client
            if (isClient) {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('auth_token', authData.access_token);
            }

            // Récupérer les informations de l'utilisateur
            const userData = await api.get('/me');

            // Mettre à jour l'état d'authentification
            authState.value = {
                isLoggedIn: true,
                user: userData,
                token: authData.access_token,
                loading: false,
                error: null
            };

            return userData;
        } catch (error) {
            console.error('Erreur de connexion:', error);

            authState.value = {
                ...authState.value,
                isLoggedIn: false,
                loading: false,
                error: error.message || 'Erreur de connexion'
            };

            throw error;
        }
    };

    /**
     * Déconnecte l'utilisateur courant
     */
    const logout = async () => {
        // On pourrait ajouter un appel API pour invalider le token côté serveur
        // mais ce n'est pas strictement nécessaire avec Laravel Sanctum

        // Supprimer le token du storage seulement côté client
        if (isClient) {
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
        }

        // Réinitialiser l'état d'authentification
        authState.value = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };
    };

    /**
     * Vérifie si l'utilisateur a les droits suffisants
     * @param {number} requiredRole - Niveau de rôle requis (0=membre, 1=staff, 2=admin)
     */
    const hasAccess = (requiredRole = 1) => {
        return apiConfig.hasAccess(authState.value.user, requiredRole);
    };

    /**
     * Vérifie si l'utilisateur est administrateur
     */
    const isAdmin = () => {
        return apiConfig.isAdmin(authState.value.user);
    };

    /**
     * Vérifie si l'utilisateur est membre du personnel
     */
    const isStaff = () => {
        return apiConfig.isStaff(authState.value.user);
    };

    // Vérifier l'authentification au chargement seulement côté client
    if (isClient) {
        await checkAuth();
    }

    // Fournir les fonctions d'authentification à l'application
    nuxtApp.provide('auth', {
        // État
        state: authState,

        // Actions
        login,
        logout,
        checkAuth,

        // Utilitaires
        hasAccess,
        isAdmin,
        isStaff
    });

    return {
        provide: {
            auth: {
                // État
                state: authState,

                // Actions
                login,
                logout,
                checkAuth,

                // Utilitaires
                hasAccess,
                isAdmin,
                isStaff
            }
        }
    };
});
