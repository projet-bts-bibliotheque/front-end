<template>
    <el-dialog
        :modelValue="show"
        @update:modelValue="$emit('update:show', $event)"
        title=""
        width="500px"
        custom-class="register-dialog"
        :show-close="false"
        :append-to-body="true"
    >
        <div class="register-container">
            <div class="register-header">
                <h2 class="register-title">Créer un compte</h2>
                <el-button
                    class="close-button"
                    @click="$emit('update:show', false)"
                    circle
                    plain
                >
                    <el-icon><Close /></el-icon>
                </el-button>
            </div>

            <div class="register-welcome">
                <p>Rejoignez la bibliothèque de l'ESNA</p>
            </div>

            <el-form
                class="register-form"
                :model="formData"
                :rules="rules"
                ref="formRef"
                label-position="top"
            >
                <div class="form-row">
                    <el-form-item label="Prénom" prop="first_name">
                        <el-input
                            v-model="formData.first_name"
                            placeholder="Votre prénom"
                            prefix-icon="User"
                        ></el-input>
                    </el-form-item>

                    <el-form-item label="Nom" prop="last_name">
                        <el-input
                            v-model="formData.last_name"
                            placeholder="Votre nom"
                            prefix-icon="User"
                        ></el-input>
                    </el-form-item>
                </div>

                <el-form-item label="Email" prop="email">
                    <el-input
                        v-model="formData.email"
                        placeholder="Votre adresse email"
                        prefix-icon="Message"
                    ></el-input>
                </el-form-item>

                <el-form-item label="Mot de passe" prop="password">
                    <el-input
                        v-model="formData.password"
                        type="password"
                        placeholder="Choisissez un mot de passe"
                        prefix-icon="Lock"
                        show-password
                    ></el-input>
                </el-form-item>

                <el-form-item
                    label="Confirmer le mot de passe"
                    prop="confirmPassword"
                >
                    <el-input
                        v-model="formData.confirmPassword"
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        prefix-icon="Lock"
                        show-password
                    ></el-input>
                </el-form-item>

                <el-form-item label="Adresse" prop="address">
                    <el-input
                        v-model="formData.address"
                        placeholder="Votre adresse"
                        prefix-icon="Location"
                    ></el-input>
                </el-form-item>

                <el-form-item label="Téléphone" prop="phone">
                    <el-input
                        v-model="formData.phone"
                        placeholder="Votre numéro de téléphone"
                        prefix-icon="Phone"
                    ></el-input>
                </el-form-item>

                <div class="terms-agreement">
                    <el-checkbox v-model="formData.acceptTerms">
                        <span class="terms-text">
                            J'accepte les
                            <a href="#" class="terms-link"
                                >conditions d'utilisation</a
                            >
                            et la
                            <a href="#" class="terms-link"
                                >politique de confidentialité</a
                            >
                        </span>
                    </el-checkbox>
                </div>

                <el-button
                    type="primary"
                    class="register-button"
                    @click="handleRegister"
                    :loading="isLoading"
                    :disabled="!formData.acceptTerms"
                >
                    S'inscrire
                </el-button>
            </el-form>

            <div class="login-prompt">
                <p>
                    Déjà inscrit?
                    <a href="#" class="login-link" @click="switchToLogin"
                        >Se connecter</a
                    >
                </p>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { useUsersStore } from '@/stores/user';
import { ref, reactive } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

const userStore = useUsersStore();

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    registerForm: {
        type: Object,
        default: () => ({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmPassword: '',
            address: '',
            phone: '',
            acceptTerms: false
        })
    }
});

const emit = defineEmits([
    'update:show',
    'update:registerForm',
    'register',
    'switchToLogin'
]);

const formRef = ref(null);
const isLoading = ref(false);

const formData = reactive({
    first_name: props.registerForm.first_name || '',
    last_name: props.registerForm.last_name || '',
    email: props.registerForm.email || '',
    password: props.registerForm.password || '',
    confirmPassword: props.registerForm.confirmPassword || '',
    address: props.registerForm.address || '',
    phone: props.registerForm.phone || '',
    acceptTerms: props.registerForm.acceptTerms || false
});

// Validation personnalisée pour comparer les mots de passe
const validatePasswordMatch = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('Veuillez confirmer votre mot de passe'));
    } else if (value !== formData.password) {
        callback(new Error('Les mots de passe ne correspondent pas'));
    } else {
        callback();
    }
};

// Règles de validation du formulaire
const rules = {
    first_name: [
        {
            required: true,
            message: 'Veuillez saisir votre prénom',
            trigger: 'blur'
        },
        {
            min: 2,
            message: 'Le prénom doit contenir au moins 2 caractères',
            trigger: 'blur'
        }
    ],
    last_name: [
        {
            required: true,
            message: 'Veuillez saisir votre nom',
            trigger: 'blur'
        },
        {
            min: 2,
            message: 'Le nom doit contenir au moins 2 caractères',
            trigger: 'blur'
        }
    ],
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
            message: 'Veuillez saisir un mot de passe',
            trigger: 'blur'
        },
        {
            min: 6,
            message: 'Le mot de passe doit contenir au moins 6 caractères',
            trigger: 'blur'
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: 'Veuillez confirmer votre mot de passe',
            trigger: 'blur'
        },
        {
            validator: validatePasswordMatch,
            trigger: 'blur'
        }
    ],
    address: [
        {
            required: true,
            message: 'Veuillez saisir votre adresse',
            trigger: 'blur'
        }
    ],
    phone: [
        {
            required: true,
            message: 'Veuillez saisir votre numéro de téléphone',
            trigger: 'blur'
        },
        {
            pattern: /^(\+\d{1,3})?\s*\d{9,10}$/,
            message: 'Veuillez saisir un numéro de téléphone valide',
            trigger: 'blur'
        }
    ]
};

const handleRegister = () => {
    formRef.value.validate(async (valid) => {
        if (valid) {
            isLoading.value = true;

            // Préparer les données pour l'API
            const apiData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                address: formData.address,
                phone: formData.phone
            };

            try {
                // Importer le service API
                const api = (await import('@/services/api')).default;

                // Appel à l'API d'inscription
                const result = await api.post('/register', apiData);

                if (!result || !result.access_token) {
                    throw new Error(
                        "Erreur lors de l'inscription: pas de token reçu"
                    );
                }

                // Stocker automatiquement le token pour permettre une connexion immédiate
                sessionStorage.setItem('auth_token', result.access_token);
                sessionStorage.setItem('token_type', result.token_type);

                // Afficher un message de succès
                ElNotification({
                    title: 'Succès',
                    message: 'Votre compte a été créé avec succès',
                    type: 'success'
                });

                // Émettre l'événement register avec les données
                emit('register', apiData);

                // Fermer la modal
                emit('update:show', false);
            } catch (error) {
                // Afficher une notification d'erreur
                ElNotification({
                    title: 'Erreur',
                    message:
                        error.message ||
                        "Une erreur est survenue lors de l'inscription",
                    type: 'error'
                });
                console.error("Erreur d'inscription:", error);
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
:deep(.register-dialog) {
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

.register-container {
    padding: 24px;
}

.register-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.register-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.close-button {
    color: #909399;
}

.register-welcome {
    margin-bottom: 24px;
}

.register-welcome p {
    color: #606266;
    font-size: 15px;
    margin: 0;
}

.register-form {
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-row .el-form-item {
    flex: 1;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
    padding-bottom: 4px;
}

:deep(.el-input__wrapper) {
    padding: 0 15px;
    height: 44px;
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

.terms-agreement {
    margin: 16px 0 24px;
    font-size: 14px;
    color: #606266;
}

.terms-text {
    display: inline-block;
    line-height: 1.4;
    max-width: 100%;
    word-wrap: break-word;
}

:deep(.el-checkbox__label) {
    white-space: normal;
    line-height: 1.4;
}

.terms-link {
    color: #1e88e5;
    text-decoration: none;
    transition: color 0.3s;
}

.terms-link:hover {
    color: #0d47a1;
    text-decoration: underline;
}

.register-button {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
    margin-bottom: 24px;
}

.login-prompt {
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

@media (max-width: 600px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }
}
</style>
