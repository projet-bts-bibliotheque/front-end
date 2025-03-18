<template>
    <el-dialog
        :modelValue="show"
        @update:modelValue="$emit('update:show', $event)"
        title="Connexion"
        width="30%"
    >
        <el-form>
            <el-form-item label="Email">
                <el-input
                    v-model="formData.email"
                    placeholder="Votre email"
                ></el-input>
            </el-form-item>
            <el-form-item label="Mot de passe">
                <el-input
                    v-model="formData.password"
                    type="password"
                    placeholder="Votre mot de passe"
                ></el-input>
            </el-form-item>
            <div class="form-footer">
                <a href="#" class="forgot-password">Mot de passe oublié?</a>
                <a href="#" class="register-link">Créer un compte</a>
            </div>
            <el-form-item>
                <el-button type="primary" @click="handleLogin">
                    Se connecter
                </el-button>
                <el-button @click="$emit('update:show', false)">
                    Annuler
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

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

const emit = defineEmits(['update:show', 'update:loginForm', 'login']);

// Clone les données du formulaire pour maintenir la réactivité locale
const formData = ref({
    email: props.loginForm.email,
    password: props.loginForm.password
});

// Surveille les changements dans les props pour les refléter dans l'état local
watch(
    () => props.loginForm,
    (newVal) => {
        formData.value.email = newVal.email;
        formData.value.password = newVal.password;
    },
    { deep: true }
);

// Surveille les changements locaux pour les émettre au parent
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
    emit('login');
};
</script>

<style scoped>
.form-footer {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-bottom: 16px;
}

.forgot-password,
.register-link {
    color: #1e88e5;
    text-decoration: none;
}
</style>
