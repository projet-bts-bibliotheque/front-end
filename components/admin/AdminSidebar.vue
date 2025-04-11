<template>
    <div class="admin-sidebar" :class="{ collapsed: isCollapsed }">
        <div class="sidebar-header">
            <div class="logo-container">
                <h1 class="logo">BibliothèqueNuxt</h1>
                <span class="admin-badge">Admin</span>
            </div>
            <el-button
                class="collapse-button"
                :icon="isCollapsed ? ArrowRight : ArrowLeft"
                circle
                @click="toggleCollapse"
            />
        </div>

        <div class="sidebar-user">
            <el-avatar
                :size="isCollapsed ? 40 : 60"
                :src="currentUser.avatar"
            />
            <div v-if="!isCollapsed" class="user-info">
                <div class="user-name">{{ currentUser.name }}</div>
                <div class="user-role">{{ roleLabels[currentUser.role] }}</div>
            </div>
        </div>

        <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            :collapse="isCollapsed"
            @select="handleMenuSelect"
        >
            <el-menu-item index="dashboard">
                <el-icon><DataBoard /></el-icon>
                <template #title>Tableau de bord</template>
            </el-menu-item>

            <el-menu-item index="books" v-if="canManageBooks">
                <el-icon><Reading /></el-icon>
                <template #title>Livres</template>
            </el-menu-item>

            <el-menu-item index="rooms" v-if="canManageRooms">
                <el-icon><OfficeBuilding /></el-icon>
                <template #title>Salles</template>
            </el-menu-item>

            <el-menu-item index="users" v-if="canManageUsers">
                <el-icon><User /></el-icon>
                <template #title>Utilisateurs</template>
            </el-menu-item>

            <el-menu-item index="borrows" v-if="canManageBorrows">
                <el-icon><Files /></el-icon>
                <template #title>Emprunts</template>
            </el-menu-item>

            <el-menu-item index="reservations" v-if="canManageReservations">
                <el-icon><Calendar /></el-icon>
                <template #title>Réservations</template>
            </el-menu-item>

            <el-menu-item index="settings">
                <el-icon><Setting /></el-icon>
                <template #title>Paramètres</template>
            </el-menu-item>
        </el-menu>

        <div class="sidebar-footer">
            <el-button
                class="logout-button"
                type="danger"
                plain
                :icon="isCollapsed ? SwitchButton : ''"
                @click="logout"
            >
                <span v-if="!isCollapsed">Déconnexion</span>
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
    ArrowRight,
    ArrowLeft,
    DataBoard,
    Reading,
    OfficeBuilding,
    User,
    Files,
    Calendar,
    Setting,
    SwitchButton
} from '@element-plus/icons-vue';

const props = defineProps({
    currentUser: {
        type: Object,
        required: true
    },
    activeMenu: {
        type: String,
        default: 'dashboard'
    }
});

const emit = defineEmits(['update:activeMenu', 'logout']);

const isCollapsed = ref(false);

const roleLabels = {
    admin: 'Administrateur',
    librarian: 'Bibliothécaire',
    member: 'Membre'
};

// Computed properties pour les permissions
const isAdmin = computed(() => props.currentUser.role === 'admin');
const isLibrarian = computed(() =>
    ['admin', 'librarian'].includes(props.currentUser.role)
);

const canManageBooks = computed(() => isLibrarian.value);
const canManageRooms = computed(() => isLibrarian.value);
const canManageUsers = computed(() => isAdmin.value);
const canManageBorrows = computed(() => isLibrarian.value);
const canManageReservations = computed(() => isLibrarian.value);

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const handleMenuSelect = (index) => {
    emit('update:activeMenu', index);
};

const logout = () => {
    emit('logout');
};
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-sidebar {
    display: flex;
    flex-direction: column;
    width: 250px;
    height: 100vh;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: width 0.3s;
    overflow: hidden;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
}

.admin-sidebar.collapsed {
    width: 64px;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
}

.logo-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.logo {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
    white-space: nowrap;
}

.admin-badge {
    font-size: 0.7rem;
    color: #fff;
    background-color: #1e88e5;
    padding: 2px 5px;
    border-radius: 3px;
    margin-top: 4px;
    display: inline-block;
    align-self: flex-start;
}

.collapse-button {
    flex-shrink: 0;
}

.sidebar-user {
    display: flex;
    align-items: center;
    padding: 20px 16px;
    border-bottom: 1px solid #eee;
}

.user-info {
    margin-left: 12px;
    overflow: hidden;
}

.user-name {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-role {
    color: #999;
    font-size: 0.8rem;
}

.sidebar-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;
}

.sidebar-footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: center;
}

.logout-button {
    width: 100%;
}

/* Assure-toi que les icônes sont correctement alignées */
:deep(.el-menu-item) {
    display: flex;
    align-items: center;
}

:deep(.el-menu-item .el-icon) {
    margin-right: 10px;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
    margin-right: 0;
}
</style>
