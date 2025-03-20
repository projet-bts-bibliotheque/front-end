<template>
    <header class="navbar">
        <div class="logo">BibliothèqueNuxt</div>
        <div class="menu">
            <el-menu
                :default-active="activeIndex"
                class="el-menu"
                mode="horizontal"
            >
                <el-menu-item index="1"
                    ><NuxtLink class="menu-links" to="/"
                        >Accueil</NuxtLink
                    ></el-menu-item
                >
                <el-menu-item index="2">
                    <NuxtLink class="menu-links" to="/catalog"
                        >Catalogue</NuxtLink
                    ></el-menu-item
                >
                <el-menu-item index="3">Salles</el-menu-item>
            </el-menu>
        </div>
        <div class="search-container">
            <el-autocomplete
                :modelValue="searchQuery"
                @update:modelValue="$emit('update:searchQuery', $event)"
                :fetch-suggestions="querySearch"
                placeholder="Rechercher un livre..."
                class="search-input"
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
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

defineProps({
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

const activeIndex = ref('1');
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
}

.menu {
    width: 50%;
    display: flex;
    flex-direction: column;
}
.menu-links {
    color: black;
    text-decoration: none;
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
