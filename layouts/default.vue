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
    email: '',
    role: 0
});

// Données pour la recherche
const allBooks = ref([]);
const allAuthors = ref([]);

// Vérifier l'état de connexion au chargement
onMounted(async () => {
    await checkLoginStatus();
    await loadBooksData();
});

// Charger les données des livres pour la recherche
const loadBooksData = async () => {
    try {
        const api = (await import('@/services/api')).default;
        const [books, authors] = await Promise.all([
            api.get('/books'),
            api.get('/authors')
        ]);

        allBooks.value = books;
        allAuthors.value = authors;
    } catch (error) {
        console.error(
            'Erreur lors du chargement des données de recherche:',
            error
        );
        // Les données de recherche ne sont pas critiques, on continue
        allBooks.value = [];
        allAuthors.value = [];
    }
};

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
                role: userData.role,
                avatar: userData.avatar || null
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

/**
 * Effectue une recherche de livres en fonction d'une chaîne de requête
 * @param {string} queryString - La chaîne de caractères à rechercher
 * @param {Function} cb - Fonction de callback qui recevra les résultats
 * @returns {void}
 */
const querySearch = (queryString, cb) => {
    if (!queryString || queryString.length < 2) {
        cb([]);
        return;
    }

    try {
        // Créer un map des auteurs pour un accès rapide
        const authorsMap = {};
        allAuthors.value.forEach((author) => {
            authorsMap[author.id] = `${author.firstname} ${author.lastname}`;
        });

        // Filtrer les livres qui correspondent à la recherche
        const results = allBooks.value
            .filter((book) => {
                const authorName = authorsMap[book.author] || '';
                const query = queryString.toLowerCase();
                return (
                    book.title.toLowerCase().includes(query) ||
                    authorName.toLowerCase().includes(query)
                );
            })
            .slice(0, 8) // Limiter à 8 résultats pour de meilleures performances
            .map((book) => ({
                value: book.title,
                label: book.title,
                author: authorsMap[book.author] || 'Auteur inconnu',
                book: {
                    id: book.isbn,
                    isbn: book.isbn,
                    title: book.title,
                    author: authorsMap[book.author] || 'Auteur inconnu'
                }
            }));

        cb(results);
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        cb([]);
    }
};

/**
 * Gère l'action de connexion utilisateur
 * @param {Object} loginData - Données de connexion avec token
 * @returns {void}
 */
const handleLogin = (loginData) => {
    isLoggedIn.value = true;

    currentUser.value = {
        id: loginData.id,
        firstName: loginData.first_name,
        lastName: loginData.last_name,
        email: loginData.email,
        role: loginData.role
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
        email: userData.email,
        role: 0 // Nouveau utilisateur = membre (rôle 0)
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
        if (process.client) {
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
        }

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
