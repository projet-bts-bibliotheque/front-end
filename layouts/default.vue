<template>
    <div class="library-app">
        <Navbar
            v-model:search-query="searchQuery"
            :querySearch="querySearch"
            @showLogin="showLoginModal = true"
            @logout="handleLogout"
            :isLoggedIn="isLoggedIn"
            :currentUser="currentUser"
        />

        <slot />

        <Footer />

        <LoginModal
            v-model:show="showLoginModal"
            v-model:loginForm="loginForm"
            @login="handleLogin"
            @switchToRegister="showRegisterModal = true"
            @switchToForgotPassword="showForgotPasswordModal = true"
        />

        <RegisterModal
            v-model:show="showRegisterModal"
            :registerForm="registerForm"
            @register="handleRegister"
            @switchToLogin="showLoginModal = true"
        />

        <ForgotPasswordModal
            v-model:show="showForgotPasswordModal"
            @switchToLogin="showLoginModal = true"
            @resetPasswordRequest="handleResetPasswordRequest"
        />
    </div>
</template>

<script setup>
import { useUsersStore } from '@/stores/user';
import Navbar from '../components/layouts/Navbar.vue';
import Footer from '../components/layouts/Footer.vue';
import LoginModal from '../components/modals/LoginModal.vue';
import RegisterModal from '../components/modals/RegisterModal.vue';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal.vue';

defineOptions({
    name: 'DefaultLayout'
});
import { ref, onMounted } from 'vue';
import { ElNotification } from 'element-plus';

const usersStore = useUsersStore();

// États UI pour les modales et les formulaires
const searchQuery = ref('');
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);
const loginForm = ref({
    email: '',
    password: ''
});

const registerForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    acceptTerms: false
});

// État de connexion de l'utilisateur
const isLoggedIn = ref(false);
const currentUser = ref({
    id: null,
    firstName: '',
    lastName: '',
    email: ''
});

// Vérifier l'état de connexion au chargement
onMounted(async () => {
    await checkLoginStatus();
});

// Vérifier si l'utilisateur est connecté en vérifiant le localStorage ou sessionStorage
const checkLoginStatus = async () => {
    // Ne vérifier que côté client pour éviter les erreurs SSR
    if (!process.client) {
        return;
    }

    const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token');

    if (token) {
        try {
            // Importer le service API
            const api = (await import('@/services/api')).default;

            // Récupérer les informations de l'utilisateur avec le token
            const userData = await api.get('/me');

            isLoggedIn.value = true;
            currentUser.value = {
                id: userData.id,
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,
                role: userData.role
            };
        } catch (error) {
            console.error(
                'Erreur lors de la récupération des informations utilisateur:',
                error
            );
            // Si erreur d'authentification, supprimer le token
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');

            isLoggedIn.value = false;
            currentUser.value = {
                id: null,
                firstName: '',
                lastName: '',
                email: '',
                role: 0
            };
        }
    } else {
        isLoggedIn.value = false;
        currentUser.value = {
            id: null,
            firstName: '',
            lastName: '',
            email: '',
            role: 0
        };
    }
};
// Sample books data for search autocomplete
const sampleBooks = [{}];

/**
 * Effectue une recherche de livres en fonction d'une chaîne de requête
 * @param {string} queryString - La chaîne de caractères à rechercher
 * @param {Function} cb - Fonction de callback qui recevra les résultats
 * @returns {void}
 */
const querySearch = (queryString, cb) => {
    const results = queryString
        ? sampleBooks.filter((book) => {
              return (
                  book.title
                      .toLowerCase()
                      .includes(queryString.toLowerCase()) ||
                  book.author.toLowerCase().includes(queryString.toLowerCase())
              );
          })
        : [];
    // Format uniforme pour les résultats de suggestion
    cb(results.map((book) => ({ value: book.title, book })));
};

/**
 * Gère l'action de connexion utilisateur
 * @param {Object} loginData - Données de connexion avec token
 * @returns {void}
 */
const handleLogin = (loginData) => {
    // Stockage du token déjà fait dans le composant LoginModal

    // Mise à jour de l'état de connexion et des informations utilisateur
    isLoggedIn.value = true;

    // Dans une app réelle, ces infos viendraient de l'API
    // Ici nous utilisons des valeurs fictives
    currentUser.value = {
        id: loginData.id,
        firstName: loginData.first_name,
        lastName: loginData.last_name,
        email: loginData.email
    };

    ElNotification({
        title: 'Connecté',
        message: 'Vous êtes maintenant connecté.',
        type: 'success'
    });

    showLoginModal.value = false;
};

/**
 * Gère l'enregistrement d'un nouvel utilisateur et ferme la modal d'inscription
 * @param {Object} userData - Données de l'utilisateur inscrit
 * @returns {void}
 */
const handleRegister = (userData) => {
    showRegisterModal.value = false;

    // Dans une application réelle, on attendrait que l'utilisateur confirme son email
    // Pour cette démo, on le connecte directement
    isLoggedIn.value = true;
    currentUser.value = {
        id: Date.now(), // ID simulé
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email
    };

    ElNotification({
        title: 'Compte créé',
        message: 'Votre compte a été créé avec succès.',
        type: 'success'
    });
};

/**
 * Gère la déconnexion de l'utilisateur
 * @returns {void}
 */
const handleLogout = async () => {
    try {
        // On pourrait ajouter un appel API pour invalider le token côté serveur
        // mais ce n'est pas strictement nécessaire avec Laravel Sanctum

        // Supprimer le token d'authentification seulement côté client
        if (process.client) {
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
        }

        // Réinitialiser l'état de connexion
        isLoggedIn.value = false;
        currentUser.value = {
            id: null,
            firstName: '',
            lastName: '',
            email: '',
            role: 0
        };

        ElNotification({
            title: 'Déconnecté',
            message: 'Vous avez été déconnecté avec succès.',
            type: 'success'
        });

        // Rediriger vers la page d'accueil si nous sommes dans une zone protégée
        const route = useRoute();
        if (
            route.path.startsWith('/admin') ||
            route.path.startsWith('/profile')
        ) {
            navigateTo('/');
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);

        ElNotification({
            title: 'Erreur',
            message: 'Une erreur est survenue lors de la déconnexion.',
            type: 'error'
        });
    }
};

/**
 * Traite une demande de réinitialisation de mot de passe
 * @param {string} email - Adresse email pour laquelle réinitialiser le mot de passe
 * @returns {void}
 */
const handleResetPasswordRequest = (email) => {
    console.log(`Demande de réinitialisation envoyée à: ${email}`);
    ElNotification({
        title: 'Email envoyé',
        message: `Un lien de réinitialisation a été envoyé à ${email}.`,
        type: 'success'
    });
};
</script>

<style scoped>
.library-app {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>
