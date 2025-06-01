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
                <el-menu-item
                    index="/admin"
                    v-if="canAccessAdmin"
                    route="/admin"
                    >Administration</el-menu-item
                >
            </el-menu>
        </div>
        <div class="search-container">
            <el-autocomplete
                v-model="localSearchQuery"
                :fetch-suggestions="handleQuerySearch"
                placeholder="Rechercher un livre..."
                class="search-input"
                @select="handleSelect"
                @input="handleSearchInput"
                @keyup.enter="handleSearchEnter"
                clearable
            >
                <template #suffix>
                    <el-icon class="search-icon" @click="handleSearchEnter">
                        <Search />
                    </el-icon>
                </template>
            </el-autocomplete>
        </div>

        <!-- Affichage conditionnel pour l'utilisateur connecté ou le bouton de connexion -->
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
                        <el-dropdown-item v-if="canAccessAdmin" command="admin">
                            <el-icon><Setting /></el-icon>
                            Administration
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
import { ref, onMounted, computed, watch } from 'vue';
import {
    Search,
    ArrowDown,
    User,
    Reading,
    Calendar,
    Setting,
    SwitchButton
} from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    searchQuery: {
        type: String,
        default: ''
    },
    querySearch: {
        type: Function,
        default: () => {}
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
            role: 0
        })
    }
});

const emit = defineEmits(['update:searchQuery', 'showLogin', 'logout']);

const route = useRoute();
const router = useRouter();
const activeIndex = ref('/');

// État local pour la recherche
const localSearchQuery = ref(props.searchQuery);
const searchSuggestions = ref([]);

// Vérifier si l'utilisateur peut accéder à l'administration
const canAccessAdmin = computed(() => {
    return props.currentUser && props.currentUser.role >= 1;
});

// Synchroniser la valeur locale avec la prop
watch(
    () => props.searchQuery,
    (newVal) => {
        localSearchQuery.value = newVal;
    }
);

// Émettre les changements vers le parent
watch(localSearchQuery, (newVal) => {
    emit('update:searchQuery', newVal);
});

onMounted(() => {
    // Mettre à jour l'index actif en fonction de la route
    activeIndex.value = route.path;
    localSearchQuery.value = props.searchQuery;
});

// Fonction pour gérer les suggestions de recherche
const handleQuerySearch = async (queryString, callback) => {
    try {
        if (!queryString || queryString.length < 2) {
            callback([]);
            return;
        }

        // Charger les livres depuis l'API pour les suggestions
        const api = (await import('@/services/api')).default;
        const books = await api.get('/books');
        const authors = await api.get('/authors');

        // Créer un map des auteurs pour un accès rapide
        const authorsMap = {};
        authors.forEach((author) => {
            authorsMap[author.id] = `${author.firstname} ${author.lastname}`;
        });

        // Filtrer les livres qui correspondent à la recherche
        const results = books
            .filter((book) => {
                const authorName = authorsMap[book.author] || '';
                return (
                    book.title
                        .toLowerCase()
                        .includes(queryString.toLowerCase()) ||
                    authorName.toLowerCase().includes(queryString.toLowerCase())
                );
            })
            .slice(0, 10) // Limiter à 10 résultats
            .map((book) => ({
                value: book.title,
                label: book.title,
                author: authorsMap[book.author] || 'Auteur inconnu',
                book: {
                    id: book.isbn,
                    isbn: book.isbn,
                    title: book.title,
                    author: authorsMap[book.author] || 'Auteur inconnu'
                }
            }));

        callback(results);
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        callback([]);
    }
};

// Gestion de la sélection dans l'autocomplete
const handleSelect = (item) => {
    if (item.book && item.book.isbn) {
        router.push(`/book/${item.book.isbn}`);
    }
};

// Gestion de la saisie dans la search bar
const handleSearchInput = (value) => {
    localSearchQuery.value = value;
};

// Gestion de la touche Entrée
const handleSearchEnter = () => {
    if (localSearchQuery.value && localSearchQuery.value.trim()) {
        // Rediriger vers la page catalogue avec la recherche
        router.push({
            path: '/catalog',
            query: { search: localSearchQuery.value.trim() }
        });
    }
};

// Gérer les commandes du menu déroulant
const handleCommand = (command) => {
    switch (command) {
        case 'profile':
            router.push('/profile');
            break;
        case 'borrows':
            router.push('/profile?tab=books');
            break;
        case 'reservations':
            router.push('/profile?tab=rooms');
            break;
        case 'admin':
            router.push('/admin');
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

.search-icon {
    cursor: pointer;
    transition: color 0.3s;
}

.search-icon:hover {
    color: #1e88e5;
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

/* Custom autocomplete styling */
:deep(.el-autocomplete-suggestion__wrap) {
    max-height: 300px;
}

:deep(.el-autocomplete-suggestion__list) {
    padding: 0;
}

:deep(.el-autocomplete-suggestion li) {
    padding: 10px 15px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.3s;
}

:deep(.el-autocomplete-suggestion li:hover) {
    background-color: #f5f7fa;
}

:deep(.el-autocomplete-suggestion li:last-child) {
    border-bottom: none;
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
