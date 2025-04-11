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
onMounted(() => {
    checkLoginStatus();
});

// Vérifier si l'utilisateur est connecté en vérifiant le localStorage ou sessionStorage
const checkLoginStatus = () => {
    const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token');

    if (token) {
        // Dans une application réelle, vous pourriez faire une requête API pour
        // récupérer les informations de l'utilisateur avec le token
        // Ici, nous allons simuler un utilisateur connecté avec des données fictives
        isLoggedIn.value = true;
        currentUser.value = {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com'
        };
    } else {
        isLoggedIn.value = false;
        currentUser.value = {
            id: null,
            firstName: '',
            lastName: '',
            email: ''
        };
    }
};

// Sample books data for search autocomplete
const sampleBooks = [
    {
        id: 1,
        title: "L'Étranger",
        author: 'Albert Camus',
        rating: 4.5,
        coverUrl: '/api/placeholder/150/220',
        available: true
    },
    {
        id: 2,
        title: 'Harry Potter et la pierre philosophale',
        author: 'J.K. Rowling',
        rating: 4.8,
        coverUrl: '/api/placeholder/150/220',
        available: true
    },
    {
        id: 3,
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        rating: 4.9,
        coverUrl: '/api/placeholder/150/220',
        available: false
    }
    // Add more books as needed
];

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
const handleLogout = () => {
    // Supprimer le token d'authentification
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');

    // Réinitialiser l'état de connexion
    isLoggedIn.value = false;
    currentUser.value = {
        id: null,
        firstName: '',
        lastName: '',
        email: ''
    };

    ElNotification({
        title: 'Déconnecté',
        message: 'Vous avez été déconnecté avec succès.',
        type: 'success'
    });
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
