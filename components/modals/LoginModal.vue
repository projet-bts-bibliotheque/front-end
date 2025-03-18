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

            <el-form class="login-form">
                <el-form-item>
                    <el-input
                        v-model="formData.email"
                        placeholder="Email"
                        prefix-icon="Message"
                    ></el-input>
                </el-form-item>
                <el-form-item>
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
import { ref, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';

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

const formData = ref({
    email: props.loginForm.email,
    password: props.loginForm.password
});

const rememberMe = ref(false);
const isLoading = ref(false);

watch(
    () => props.loginForm,
    (newVal) => {
        formData.value.email = newVal.email;
        formData.value.password = newVal.password;
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

const handleLogin = () => {
    isLoading.value = true;
    // Simuler un délai pour montrer l'état de chargement
    setTimeout(() => {
        isLoading.value = false;
        emit('login');
    }, 1000);
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
