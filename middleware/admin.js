export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
        const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token');

        if (!token) {
            return navigateTo('/');
        }

        try {
            const api = (await import('@/services/api')).default;
            const userData = await api.get('/me');

            if (userData.role < 1) {
                return navigateTo('/');
            }
        } catch (error) {
            console.error('Erreur vérification droits admin:', error);
            return navigateTo('/');
        }
    }
});
