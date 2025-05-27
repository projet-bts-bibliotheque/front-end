export default defineNuxtRouteMiddleware(async (to, from) => {
    // Vérifier seulement côté client
    if (process.client) {
        const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token');

        if (!token) {
            // Pas de token, rediriger vers l'accueil
            return navigateTo('/');
        }

        try {
            // Vérifier les droits d'administration
            const api = (await import('@/services/api')).default;
            const userData = await api.get('/me');

            if (userData.role < 0) {
                // Pas les droits suffisants
                return navigateTo('/');
            }
        } catch (error) {
            console.error('Erreur vérification droits admin:', error);
            return navigateTo('/');
        }
    }
});
