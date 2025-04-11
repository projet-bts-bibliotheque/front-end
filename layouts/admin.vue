<template>
    <div class="admin-layout">
        <!-- Réutiliser la navbar standard du site -->
        <Navbar
            v-model:search-query="searchQuery"
            :querySearch="querySearch"
            @showLogin="showLoginModal = true"
        />

        <div class="admin-content">
            <slot />
        </div>

        <Footer />

        <!-- Modales communes -->
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
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import Navbar from '../components/layouts/Navbar.vue';
import Footer from '../components/layouts/Footer.vue';
import LoginModal from '../components/modals/LoginModal.vue';
import RegisterModal from '../components/modals/RegisterModal.vue';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal.vue';

const router = useRouter();

// État UI pour les modales et les formulaires
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

// Fonction pour la recherche dans la navbar
const querySearch = (queryString, cb) => {
    // Simuler une recherche avec des résultats vides
    cb([]);
};

// Fonctions pour les modales
const login = () => {
    showLoginModal.value = false;
};

const handleRegister = () => {
    showRegisterModal.value = false;
};

const handleResetPasswordRequest = (email) => {
    console.log(`Demande de réinitialisation envoyée à: ${email}`);
};
</script>

<style scoped>
.admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f5f7fa;
}

.admin-content {
    flex: 1;
    padding: 30px 0;
}
</style>
