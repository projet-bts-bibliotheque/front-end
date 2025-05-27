<template>
    <div class="profile-redirect-page">
        <div class="redirect-container">
            <div class="redirect-content">
                <el-icon class="redirect-icon" :size="80">
                    <Lock />
                </el-icon>
                <h1>Connexion requise</h1>
                <p>Vous devez être connecté pour accéder à votre profil.</p>

                <div class="redirect-actions">
                    <el-button
                        type="primary"
                        size="large"
                        @click="showLoginModal = true"
                    >
                        Se connecter
                    </el-button>
                    <el-button size="large" @click="$router.push('/')">
                        Retour à l'accueil
                    </el-button>
                </div>
            </div>
        </div>

        <!-- Modal de connexion -->
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Lock } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

const router = useRouter();

// États des modales
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);

// Formulaires
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

// Gestion des actions
const handleLogin = (userData) => {
    showLoginModal.value = false;
    ElNotification({
        title: 'Connexion réussie',
        message: 'Redirection vers votre profil...',
        type: 'success'
    });

    // Rediriger vers le profil après connexion
    setTimeout(() => {
        router.push('/profile');
    }, 1000);
};

const handleRegister = (userData) => {
    showRegisterModal.value = false;
    ElNotification({
        title: 'Inscription réussie',
        message: 'Redirection vers votre profil...',
        type: 'success'
    });

    // Rediriger vers le profil après inscription
    setTimeout(() => {
        router.push('/profile');
    }, 1000);
};

const handleResetPasswordRequest = (email) => {
    ElNotification({
        title: 'Email envoyé',
        message: `Un lien de réinitialisation a été envoyé à ${email}`,
        type: 'success'
    });
};
</script>

<style scoped>
.profile-redirect-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.redirect-container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-width: 500px;
    width: 100%;
}

.redirect-content {
    padding: 60px 40px;
    text-align: center;
}

.redirect-icon {
    color: #1e88e5;
    margin-bottom: 30px;
}

.redirect-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 15px;
}

.redirect-content p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 40px;
    line-height: 1.6;
}

.redirect-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

@media (min-width: 480px) {
    .redirect-actions {
        flex-direction: row;
        justify-content: center;
    }
}
</style>
