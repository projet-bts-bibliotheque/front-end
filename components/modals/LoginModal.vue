<template>
    <el-dialog
        :modelValue="show"
        @update:modelValue="$emit('update:show', $event)"
        title=""
        width="400px"
        custom-class="login-dialog"
        :show-close="false"
        :append-to-body="true"
    >
        <div class="login-container">
            <div class="login-header">
                <h2 class="login-title">Connexion</h2>
                <el-button
                    class="close-button"
                    @click="$emit('update:show', false)"
                    circle
                    plain
                >
                    <el-icon><Close /></el-icon>
                </el-button>
            </div>

            <div class="login-welcome">
                <p>Bienvenue sur la bibliothèque de l'ESNA</p>
            </div>

            <el-form
                class="login-form"
                :model="formData"
                :rules="rules"
                ref="loginFormRef"
            >
                <el-form-item prop="email">
                    <el-input
                        v-model="formData.email"
                        placeholder="Email"
                        prefix-icon="Message"
                    ></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="formData.password"
                        type="password"
                        placeholder="Mot de passe"
                        prefix-icon="Lock"
                        show-password
                    ></el-input>
                </el-form-item>

                <div class="remember-me">
                    <div class="checkbox-wrapper">
                        <el-checkbox v-model="rememberMe"
                            >Se souvenir de moi</el-checkbox
                        >
                    </div>
                    <div class="forgot-password-wrapper">
                        <a
                            href="#"
                            class="forgot-password"
                            @click.prevent="switchToForgotPassword"
                            >Mot de passe oublié?</a
                        >
                    </div>
                </div>

                <el-button
                    type="primary"
                    class="login-button"
                    @click="handleLogin"
                    :loading="isLoading"
                >
                    Se connecter
                </el-button>
            </el-form>

            <div class="register-prompt">
                <p>
                    Pas encore de compte?
                    <a
                        href="#"
                        class="register-link"
                        @click.prevent="switchToRegister"
                        >S'inscrire</a
                    >
                </p>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { useUsersStore } from '@/stores/user';
import { ref, watch, reactive } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

const usersStore = useUsersStore();

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    loginForm: {
        type: Object,
        required: true
    }
});

const emit = defineEmits([
    'update:show',
    'update:loginForm',
    'login',
    'switchToRegister',
    'switchToForgotPassword'
]);

const formData = reactive({
    email: props.loginForm.email,
    password: props.loginForm.password
});

const loginFormRef = ref(null);
const rememberMe = ref(false);
const isLoading = ref(false);

// Règles de validation
const rules = {
    email: [
        {
            required: true,
            message: 'Veuillez saisir votre email',
            trigger: 'blur'
        },
        {
            type: 'email',
            message: 'Veuillez saisir un email valide',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: true,
            message: 'Veuillez saisir votre mot de passe',
            trigger: 'blur'
        }
    ]
};

watch(
    () => props.loginForm,
    (newVal) => {
        formData.email = newVal.email;
        formData.password = newVal.password;
    },
    { deep: true }
);

watch(
    formData,
    (newVal) => {
        emit('update:loginForm', {
            email: newVal.email,
            password: newVal.password
        });
    },
    { deep: true }
);

const handleLogin = async () => {
    try {
        // Valider le formulaire
        await loginFormRef.value.validate();

        isLoading.value = true;

        // Importer le service API
        const api = (await import('@/services/api')).default;

        // Appel à l'API d'authentification
        const authData = await api.post('/login', {
            email: formData.email,
            password: formData.password
        });

        if (!authData || !authData.access_token) {
            throw new Error(
                "Erreur de connexion: données d'authentification invalides"
            );
        }

        // Stocker le token dans le localStorage ou sessionStorage selon l'option "se souvenir de moi"
        const storage = rememberMe.value ? localStorage : sessionStorage;
        storage.setItem('auth_token', authData.access_token);
        storage.setItem('token_type', authData.token_type);

        // Récupérer les informations de l'utilisateur connecté
        const userData = await api.get('/me');

        // Émettre l'événement de connexion pour informer le composant parent
        emit('login', userData);

        // Afficher une notification de succès
        ElNotification({
            title: 'Connexion réussie',
            message: 'Vous êtes maintenant connecté',
            type: 'success'
        });

        // Fermer la fenêtre modale
        emit('update:show', false);
    } catch (error) {
        // Gérer les erreurs
        console.error('Erreur de connexion:', error);

        ElNotification({
            title: 'Échec de la connexion',
            message: error.message || 'Identifiants invalides',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
    }
};

const switchToRegister = () => {
    emit('update:show', false);
    emit('switchToRegister');
};

const switchToForgotPassword = () => {
    emit('update:show', false);
    emit('switchToForgotPassword');
};
</script>

<style scoped>
/* Style personnalisé pour le dialogue */
:deep(.login-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
}

:deep(.el-dialog__headerbtn) {
    display: none;
}

:deep(.el-dialog__body) {
    padding: 0;
}

.login-container {
    padding: 24px;
}

.login-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.login-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.close-button {
    color: #909399;
}

.login-welcome {
    margin-bottom: 24px;
}

.login-welcome p {
    color: #606266;
    font-size: 15px;
    margin: 0;
}

.login-form {
    margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
    padding: 0 15px;
    height: 50px;
    border-radius: 8px;
    box-shadow: 0 0 0 1px #dcdfe6;
    transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #a0cfff;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #1e88e5;
}

:deep(.el-input__prefix-inner) {
    display: flex;
    align-items: center;
    color: #909399;
}

.remember-me {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 14px;
    gap: 10px;
}

.checkbox-wrapper,
.forgot-password-wrapper {
    min-width: 120px;
}

.forgot-password-wrapper {
    text-align: right;
}

.forgot-password {
    color: #1e88e5;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
    white-space: nowrap;
}

.forgot-password:hover {
    color: #0d47a1;
    text-decoration: underline;
}

.login-button {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
    margin-bottom: 24px;
}

.register-prompt {
    text-align: center;
    font-size: 14px;
    color: #606266;
}

.register-link {
    color: #1e88e5;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
}

.register-link:hover {
    color: #0d47a1;
    text-decoration: underline;
}

/* Styles responsifs */
@media (max-width: 400px) {
    .remember-me {
        flex-direction: column;
        align-items: flex-start;
    }

    .forgot-password-wrapper {
        text-align: left;
        margin-top: -5px;
    }
}
</style>
