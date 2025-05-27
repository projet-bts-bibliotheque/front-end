<template>
    <el-dialog
        :modelValue="show"
        @update:modelValue="$emit('update:show', $event)"
        title=""
        width="400px"
        custom-class="forgot-password-dialog"
        :show-close="false"
        :append-to-body="true"
    >
        <div class="forgot-password-container">
            <div class="forgot-password-header">
                <h2 class="forgot-password-title">
                    Récupération de mot de passe
                </h2>
                <el-button
                    class="close-button"
                    @click="$emit('update:show', false)"
                    circle
                    plain
                >
                    <el-icon><Close /></el-icon>
                </el-button>
            </div>

            <div class="forgot-password-instructions">
                <p>
                    Entrez votre adresse email pour recevoir un lien de
                    réinitialisation de votre mot de passe.
                </p>
            </div>

            <el-form
                class="forgot-password-form"
                :model="formData"
                :rules="rules"
                ref="forgotPasswordForm"
            >
                <el-form-item prop="email">
                    <el-input
                        v-model="formData.email"
                        placeholder="Votre adresse email"
                        prefix-icon="Message"
                    ></el-input>
                </el-form-item>

                <el-button
                    type="primary"
                    class="submit-button"
                    @click="handleSubmit"
                    :loading="isLoading"
                >
                    Envoyer le lien de réinitialisation
                </el-button>
            </el-form>

            <div class="back-to-login">
                <p>
                    <a
                        href="#"
                        class="login-link"
                        @click.prevent="switchToLogin"
                        >Retour à la connexion</a
                    >
                </p>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Close } from '@element-plus/icons-vue';

defineProps({
    show: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits([
    'update:show',
    'switchToLogin',
    'resetPasswordRequest'
]);

const forgotPasswordForm = ref(null);
const isLoading = ref(false);

const formData = reactive({
    email: ''
});

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
    ]
};
const handleSubmit = async () => {
    forgotPasswordForm.value.validate(async (valid) => {
        if (valid) {
            isLoading.value = true;

            try {
                // Importer le service API
                const api = (await import('@/services/api')).default;

                // Appel à l'API pour la réinitialisation du mot de passe
                await api.post('/forgot-password', { email: formData.email });

                // Émettre un événement pour indiquer que la demande a été envoyée
                emit('resetPasswordRequest', formData.email);

                // Afficher une notification de succès
                ElNotification({
                    title: 'Email envoyé',
                    message:
                        'Un lien de réinitialisation de mot de passe a été envoyé à votre adresse email.',
                    type: 'success'
                });

                // Fermer la modal
                emit('update:show', false);
            } catch (error) {
                // Afficher une notification d'erreur
                ElNotification({
                    title: 'Erreur',
                    message:
                        error.message ||
                        "Une erreur est survenue lors de l'envoi de l'email de réinitialisation",
                    type: 'error'
                });
                console.error(
                    'Erreur de réinitialisation de mot de passe:',
                    error
                );
            } finally {
                isLoading.value = false;
            }
        }
    });
};
const switchToLogin = () => {
    emit('update:show', false);
    emit('switchToLogin');
};
</script>

<style scoped>
/* Style personnalisé pour le dialogue */
:deep(.forgot-password-dialog) {
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

.forgot-password-container {
    padding: 24px;
}

.forgot-password-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.forgot-password-title {
    font-size: 22px;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.close-button {
    color: #909399;
}

.forgot-password-instructions {
    margin-bottom: 24px;
}

.forgot-password-instructions p {
    color: #606266;
    font-size: 15px;
    line-height: 1.5;
    margin: 0;
}

.forgot-password-form {
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

.submit-button {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
    margin-top: 24px;
    margin-bottom: 24px;
}

.back-to-login {
    text-align: center;
    font-size: 14px;
    color: #606266;
}

.login-link {
    color: #1e88e5;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
}

.login-link:hover {
    color: #0d47a1;
    text-decoration: underline;
}
</style>
