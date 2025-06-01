<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminEditors from '~/components/admin/AdminEditors.vue';
import AdminAuthors from '~/components/admin/AdminAuthors.vue';
import AdminDashboard from '~/components/admin/AdminDashboard.vue';
import AdminBooks from '~/components/admin/AdminBooks.vue';
import AdminRooms from '~/components/admin/AdminRooms.vue';
import AdminUsers from '~/components/admin/AdminUsers.vue';
import AdminSettings from '~/components/admin/AdminSettings.vue';
import { useRouter } from 'vue-router';
import { ElNotification } from 'element-plus';

// Middleware de protection admin
definePageMeta({
    middleware: 'admin'
});

const router = useRouter();

// État de l'onglet actif
const activeTab = ref('dashboard');

// État de l'utilisateur courant
const currentUser = ref({
    id: null,
    name: '',
    email: '',
    role: 0,
    avatar: null
});

const loading = ref(true);

// Computed properties pour les permissions
const isAdmin = computed(() => currentUser.value.role >= 2);
const isLibrarian = computed(() => currentUser.value.role >= 1);

// Chargement des données utilisateur
const loadCurrentUser = async () => {
    try {
        const api = (await import('@/services/api')).default;
        const userData = await api.get('/me');

        currentUser.value = {
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            role: userData.role,
            avatar: `/api/placeholder/100/100?text=${userData.first_name.charAt(
                0
            )}${userData.last_name.charAt(0)}`
        };

        // Vérifier si l'utilisateur a les droits d'administration
        if (userData.role < 1) {
            ElNotification({
                title: 'Accès refusé',
                message: "Vous n'avez pas les droits d'administration",
                type: 'error'
            });
            router.push('/');
            return;
        }
    } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        ElNotification({
            title: 'Erreur',
            message: "Impossible de vérifier vos droits d'accès",
            type: 'error'
        });
        router.push('/');
    } finally {
        loading.value = false;
    }
};

// Fonction pour retourner à la page d'accueil
const goToHome = () => {
    router.push('/');
};

// Chargement initial
onMounted(async () => {
    await loadCurrentUser();
});

// Labels des rôles
const roleLabels = {
    0: 'Membre',
    1: 'Bibliothécaire',
    2: 'Administrateur'
};
</script>

<template>
    <div class="admin-page" v-if="!loading">
        <div class="admin-header">
            <h1>Administration de la bibliothèque</h1>
            <div class="user-container">
                <el-button
                    type="primary"
                    size="default"
                    @click="goToHome"
                    class="back-button"
                >
                    <el-icon class="el-icon--left"><Back /></el-icon>
                    Retour à la bibliothèque
                </el-button>
                <div class="user-info">
                    <span class="user-name">{{ currentUser.name }}</span>
                    <span class="user-role">{{
                        roleLabels[currentUser.role]
                    }}</span>
                </div>
            </div>
        </div>

        <div class="admin-container">
            <el-tabs v-model="activeTab" type="border-card" class="admin-tabs">
                <!-- Tableau de bord -->
                <el-tab-pane label="Tableau de bord" name="dashboard">
                    <AdminDashboard />
                </el-tab-pane>

                <!-- Gestion des livres - Accessible aux bibliothécaires et admins -->
                <el-tab-pane label="Livres" name="books" v-if="isLibrarian">
                    <AdminBooks />
                </el-tab-pane>

                <!-- Gestion des salles - Accessible aux bibliothécaires et admins -->
                <el-tab-pane label="Salles" name="rooms" v-if="isLibrarian">
                    <AdminRooms />
                </el-tab-pane>

                <!-- Gestion des utilisateurs - Accessible UNIQUEMENT aux admins -->
                <el-tab-pane label="Utilisateurs" name="users" v-if="isAdmin">
                    <AdminUsers />
                </el-tab-pane>

                <!-- Gestion des Auteurs - Accessible aux bibliothécaires et admins -->
                <el-tab-pane label="Auteurs" name="authors" v-if="isLibrarian">
                    <AdminAuthors />
                </el-tab-pane>

                <!-- Gestion des Editeurs - Accessible aux bibliothécaires et admins -->
                <el-tab-pane label="Editeurs" name="editors" v-if="isLibrarian">
                    <AdminEditors />
                </el-tab-pane>

                <!-- Paramètres -->
                <el-tab-pane label="Paramètres" name="settings">
                    <AdminSettings :currentUser="currentUser" />
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>

    <div v-else class="admin-loading">
        <el-skeleton :rows="10" animated />
    </div>
</template>

<script>
import { Back } from '@element-plus/icons-vue';

export default {
    components: { Back }
};
</script>

<style scoped>
.admin-page {
    background-color: #f5f7fa;
    min-height: 100vh;
}

.admin-header {
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 16px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.admin-header h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.user-container {
    display: flex;
    align-items: center;
    gap: 20px;
}

.back-button {
    display: flex;
    align-items: center;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
}

.user-name {
    font-weight: 600;
    color: #333;
}

.user-role {
    background-color: #1e88e5;
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
}

.admin-container {
    width: 90%;
    max-width: 1400px;
    margin: 30px auto;
}

.admin-tabs {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
}

.admin-loading {
    padding: 50px;
}

/* Styles pour les onglets */
:deep(.el-tabs__header) {
    margin-bottom: 0;
}

:deep(.el-tabs__nav-wrap) {
    padding: 0 20px;
}

:deep(.el-tabs__content) {
    padding: 20px;
}

:deep(.el-tabs__item) {
    font-size: 1rem;
    height: 56px;
    line-height: 56px;
}

:deep(.el-tabs__item.is-active) {
    font-weight: 600;
}

/* Responsive */
@media (max-width: 1200px) {
    .admin-container {
        width: 95%;
    }
}

@media (max-width: 768px) {
    .admin-header {
        flex-direction: column;
        gap: 15px;
        padding: 16px 20px;
        text-align: center;
    }

    .user-container {
        flex-direction: column;
        gap: 10px;
    }

    .user-info {
        align-items: center;
    }

    .admin-container {
        width: 95%;
        margin: 20px auto;
    }

    :deep(.el-tabs__nav) {
        width: 100%;
    }

    :deep(.el-tabs__item) {
        flex: 1;
        text-align: center;
    }
}
</style>
