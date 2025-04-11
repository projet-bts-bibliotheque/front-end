<template>
    <div class="library-app">
        <Navbar
            v-model:search-query="searchQuery"
            :querySearch="querySearch"
            @showLogin="showLoginModal = true"
        />

        <slot />

        <Footer />

        <LoginModal
            v-model:show="showLoginModal"
            v-model:loginForm="loginForm"
            @login="login"
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
import { ref } from 'vue';
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
 * Gère l'action de connexion utilisateur et ferme la modal de connexion
 * @returns {void}
 */
const login = () => {
    showLoginModal.value = false;
    ElNotification({
        title: 'Connecté',
        message: 'Vous êtes maintenant connecté.',
        type: 'success'
    });
};

/**
 * Gère l'enregistrement d'un nouvel utilisateur et ferme la modal d'inscription
 * @returns {void}
 */
const handleRegister = () => {
    showRegisterModal.value = false;
    ElNotification({
        title: 'Compte créé',
        message: 'Votre compte a été créé avec succès.',
        type: 'success'
    });
};

/**
 * Traite une demande de réinitialisation de mot de passe
 * @param {string} email - Adresse email pour laquelle réinitialiser le mot de passe
 * @returns {void}
 */
const handleResetPasswordRequest = (email) => {
    ElNotification({
        title: 'Email envoyé',
        message:
            'Un lien de réinitialisation a été envoyé à votre adresse email.',
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
