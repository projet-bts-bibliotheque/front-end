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
        <el-button
            type="primary"
            class="auth-button"
            @click="$emit('showLogin')"
        >
            Se connecter
        </el-button>
    </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRoute, navigateTo } from 'nuxt/app';

const props = defineProps({
    searchQuery: {
        type: String,
        required: true
    },
    querySearch: {
        type: Function,
        required: true
    }
});

defineEmits(['update:searchQuery', 'showLogin']);

const route = useRoute();
const activeIndex = ref('/');

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
}
</style>
