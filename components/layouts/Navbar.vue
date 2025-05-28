<template>
    <header class="navbar">
        <NuxtLink to="/" class="logo">BibliothèqueNuxt</NuxtLink>
        <div class="menu">
            <el-menu
                :default-active="activeIndex"
                class="el-menu"
                mode="horizontal"
                router
            >
                <el-menu-item index="/" route="/">Accueil</el-menu-item>
                <el-menu-item index="/catalog" route="/catalog"
                    >Catalogue</el-menu-item
                >
                <el-menu-item index="/room" route="/room">Salles</el-menu-item>
                <el-menu-item index="/admin" v-if="isAdmin" route="/admin"
                    >Administration</el-menu-item
                >
            </el-menu>
        </div>
        <div class="search-container">
            <el-autocomplete
                :modelValue="searchQuery"
                @update:modelValue="$emit('update:searchQuery', $event)"
                :fetch-suggestions="querySearch"
                placeholder="Rechercher un livre..."
                class="search-input"
                @select="handleSelect"
            >
                <template #suffix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-autocomplete>
        </div>

        <!-- Nouvel affichage conditionnel pour l'utilisateur connecté ou le bouton de connexion -->
        <div v-if="isLoggedIn" class="user-profile">
            <el-dropdown trigger="click" @command="handleCommand">
                <div class="user-dropdown-link">
                    <el-avatar
                        :size="32"
                        :src="currentUser.avatar || '/api/placeholder/100/100'"
                    ></el-avatar>
                    <span class="user-name"
                        >{{ currentUser.firstName }}
                        {{ currentUser.lastName }}</span
                    >
                    <el-icon><arrow-down /></el-icon>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="profile">
                            <el-icon><User /></el-icon>
                            Mon profil
                        </el-dropdown-item>
                        <el-dropdown-item command="borrows">
                            <el-icon><Reading /></el-icon>
                            Mes emprunts
                        </el-dropdown-item>
                        <el-dropdown-item command="reservations">
                            <el-icon><Calendar /></el-icon>
                            Mes réservations
                        </el-dropdown-item>
                        <el-dropdown-item divided command="logout">
                            <el-icon><SwitchButton /></el-icon>
                            Se déconnecter
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <el-button
            v-else
            type="primary"
            class="auth-button"
            @click="$emit('showLogin')"
        >
            Se connecter
        </el-button>
    </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Search, ArrowDown } from '@element-plus/icons-vue';
import { useRoute, navigateTo } from 'nuxt/app';

const props = defineProps({
    searchQuery: {
        type: String,
        required: true
    },
    querySearch: {
        type: Function,
        required: true
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    currentUser: {
        type: Object,
        default: () => ({
            id: null,
            firstName: '',
            lastName: '',
            email: '',
            avatar: null,
            role: 0 // Ajout du rôle dans les props
        })
    }
});

const emit = defineEmits(['update:searchQuery', 'showLogin', 'logout']);

const route = useRoute();
const activeIndex = ref('/');

// ✅ Correction: Utiliser les props au lieu d'appeler l'API
const isAdmin = computed(() => {
    // Vérifier si l'utilisateur est connecté ET a un rôle >= 1 (bibliothécaire ou admin)
    return props.isLoggedIn && props.currentUser.role >= 1;
});

const isLibrarian = computed(() => {
    // Vérifier si l'utilisateur est connecté ET a un rôle >= 1 (bibliothécaire ou admin)
    return props.isLoggedIn && props.currentUser.role >= 1;
});

onMounted(() => {
    // Mettre à jour l'index actif en fonction de la route
    activeIndex.value = route.path;
});

// Gestion de la sélection dans l'autocomplete
const handleSelect = (item) => {
    // Rediriger vers la page du livre
    if (item.book && item.book.id) {
        navigateTo(`/book/${item.book.id}`);
    }
};

// Gérer les commandes du menu déroulant
const handleCommand = (command) => {
    switch (command) {
        case 'profile':
            navigateTo('/profile');
            break;
        case 'borrows':
            navigateTo('/profile?tab=books');
            break;
        case 'reservations':
            navigateTo('/profile?tab=rooms');
            break;
        case 'logout':
            emit('logout');
            break;
    }
};
</script>

<style scoped>
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 30px;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: #1e88e5;
    letter-spacing: -0.5px;
    text-decoration: none;
    transition: color 0.3s;
}

.logo:hover {
    color: #1565c0;
}

.menu {
    width: 50%;
    display: flex;
    flex-direction: column;
}

.menu .el-menu {
    border: none;
}

.search-container {
    width: 25%;
}

.search-input {
    width: 100%;
}

.auth-button {
    font-weight: 600;
}

/* Style pour l'utilisateur connecté */
.user-profile {
    display: flex;
    align-items: center;
}

.user-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 20px;
    transition: background-color 0.3s;
}

.user-dropdown-link:hover {
    background-color: #f5f7fa;
}

.user-name {
    margin: 0 8px;
    font-weight: 600;
    color: #333;
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        padding: 15px;
    }

    .logo {
        margin-bottom: 10px;
    }

    .menu {
        width: 100%;
        margin: 10px 0;
    }

    .search-container {
        width: 100%;
        margin: 10px 0;
    }

    .auth-button {
        width: 100%;
    }

    .user-profile {
        width: 100%;
        margin-top: 10px;
    }

    .user-dropdown-link {
        width: 100%;
        justify-content: center;
    }
}
</style>
