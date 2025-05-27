// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
    // Vérifier seulement côté client
    if (process.client) {
        const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token');

        if (!token) {
            // Rediriger vers la page de redirection profil si pas de token
            return navigateTo('/profile-redirect');
        }
    }
});
