<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminDashboard from '~/components/admin/AdminDashboard.vue';
import AdminBooks from '~/components/admin/AdminBooks.vue';
import AdminRooms from '~/components/admin/AdminRooms.vue';
import AdminUsers from '~/components/admin/AdminUsers.vue';
import AdminBorrows from '~/components/admin/AdminBorrows.vue';
import AdminReservations from '~/components/admin/AdminReservations.vue';
import AdminSettings from '~/components/admin/AdminSettings.vue';
import { useRouter } from 'vue-router';

// Définir le layout pour cette page
definePageMeta({
    layout: 'admin'
});

const router = useRouter();

// État de l'onglet actif
const activeTab = ref('dashboard');

// État de l'utilisateur courant
const currentUser = ref({
    id: 1,
    name: 'Admin Test',
    email: 'admin@bibliotheque.fr',
    role: 'admin', // 'admin' ou 'librarian'
    avatar: '/api/placeholder/100/100?text=Admin'
});

// Computed properties pour les permissions
const isAdmin = computed(() => currentUser.value.role === 'admin');
const isLibrarian = computed(() =>
    ['admin', 'librarian'].includes(currentUser.value.role)
);

const canManageBooks = computed(() => isLibrarian.value);
const canManageRooms = computed(() => isLibrarian.value);
const canManageUsers = computed(() => isAdmin.value);
const canManageBorrows = computed(() => isLibrarian.value);
const canManageReservations = computed(() => isLibrarian.value);

// Fonction pour retourner à la page d'accueil
const goToHome = () => {
    router.push('/');
};

onMounted(() => {
    // Récupérer des données initiales si nécessaire
});
</script>

<template>
    <div class="admin-page">
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

                <!-- Gestion des livres -->
                <el-tab-pane label="Livres" name="books" v-if="canManageBooks">
                    <AdminBooks />
                </el-tab-pane>

                <!-- Gestion des salles -->
                <el-tab-pane label="Salles" name="rooms" v-if="canManageRooms">
                    <AdminRooms />
                </el-tab-pane>

                <!-- Gestion des utilisateurs -->
                <el-tab-pane
                    label="Utilisateurs"
                    name="users"
                    v-if="canManageUsers"
                >
                    <AdminUsers />
                </el-tab-pane>

                <!-- Gestion des emprunts -->
                <el-tab-pane
                    label="Emprunts"
                    name="borrows"
                    v-if="canManageBorrows"
                >
                    <AdminBorrows />
                </el-tab-pane>

                <!-- Gestion des réservations -->
                <el-tab-pane
                    label="Réservations"
                    name="reservations"
                    v-if="canManageReservations"
                >
                    <AdminReservations />
                </el-tab-pane>

                <!-- Paramètres -->
                <el-tab-pane label="Paramètres" name="settings">
                    <AdminSettings :currentUser="currentUser" />
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import { Back } from '@element-plus/icons-vue';

export default {
    components: { Back },
    data() {
        return {
            roleLabels: {
                admin: 'Administrateur',
                librarian: 'Bibliothécaire',
                member: 'Membre'
            }
        };
    }
};
</script>

<style scoped>
.admin-page {
    background-color: #f5f7fa;
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
    width: 70%;
    max-width: 1400px;
    margin: 30px auto;
}

.admin-tabs {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
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
        width: 85%;
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
