<template>
    <div class="catalog-page">
        <div class="catalog-hero">
            <div class="overlay"></div>
            <div class="catalog-hero-content">
                <h1>Catalogue de la Bibliothèque</h1>
                <p>
                    Explorez notre collection de plus de 10 000 ouvrages dans
                    tous les domaines
                </p>
            </div>
        </div>

        <main class="catalog-content">
            <!-- Barre de recherche avancée -->
            <SearchBar
                v-model:searchText="searchQuery"
                :categories="categoriesList"
                :authors="authorsList"
                @search="handleSearch"
                @advancedSearch="handleAdvancedSearch"
                @reset="resetSearch"
            />

            <div class="catalog-layout">
                <!-- Sidebar de filtres pour desktop -->
                <div class="filters-sidebar">
                    <div class="filters-header">
                        <h2>Filtres</h2>
                    </div>

                    <div class="filter-section">
                        <h3>Catégories</h3>
                        <el-checkbox-group v-model="selectedCategories">
                            <el-checkbox
                                v-for="category in categoriesList"
                                :key="category.value"
                                :value="category.value"
                                size="large"
                            >
                                {{ category.label }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>

                    <div class="filter-section">
                        <h3>Disponibilité</h3>
                        <el-radio-group
                            v-model="availabilityFilter"
                            size="large"
                        >
                            <el-radio :value="'all'">Tous les livres</el-radio>
                            <el-radio :value="'available'"
                                >Disponibles uniquement</el-radio
                            >
                        </el-radio-group>
                    </div>

                    <div class="filter-section">
                        <h3>Note minimale</h3>
                        <el-rate
                            v-model="minRating"
                            allow-half
                            show-score
                            text-color="#ff9900"
                            score-template="{value}"
                        />
                    </div>

                    <div class="filter-section">
                        <h3>Année de publication</h3>
                        <div class="year-range">
                            <el-slider
                                v-model="yearRange"
                                range
                                :min="1900"
                                :max="2025"
                                :marks="yearMarks"
                            />
                        </div>
                    </div>

                    <div class="filter-actions">
                        <el-button type="primary" @click="applyFilters"
                            >Appliquer</el-button
                        >
                        <el-button @click="resetFilters"
                            >Réinitialiser</el-button
                        >
                    </div>
                </div>

                <!-- Drawer mobile pour les filtres -->
                <FiltersDrawer
                    v-model:show="showFiltersMobile"
                    :selectedCategories="selectedCategories"
                    :availabilityFilter="availabilityFilter"
                    :minRating="minRating"
                    :yearRange="yearRange"
                    :categories="categoriesList"
                    @apply="handleFilterDrawerApply"
                    @reset="resetFilters"
                />

                <!-- Contenu principal -->
                <div class="books-container">
                    <div class="catalog-controls">
                        <div class="catalog-stats">
                            {{ filteredBooks.length }} ouvrages trouvés
                        </div>

                        <div class="view-sort-controls">
                            <div class="view-controls">
                                <el-button-group>
                                    <el-button
                                        :type="
                                            viewMode === 'grid' ? 'primary' : ''
                                        "
                                        @click="viewMode = 'grid'"
                                    >
                                        <el-icon><Grid /></el-icon>
                                    </el-button>
                                    <el-button
                                        :type="
                                            viewMode === 'list' ? 'primary' : ''
                                        "
                                        @click="viewMode = 'list'"
                                    >
                                        <el-icon><Menu /></el-icon>
                                    </el-button>
                                </el-button-group>
                            </div>

                            <div class="sort-control">
                                <el-select
                                    v-model="sortMethod"
                                    placeholder="Trier par"
                                    size="large"
                                >
                                    <el-option
                                        v-for="option in sortOptions"
                                        :key="option.value"
                                        :label="option.label"
                                        :value="option.value"
                                    />
                                </el-select>
                            </div>

                            <el-button
                                class="show-filters-mobile"
                                @click="showFiltersMobile = true"
                            >
                                <el-icon><Filter /></el-icon>
                                Filtres
                            </el-button>
                        </div>
                    </div>

                    <div v-if="isLoading" class="loading-container">
                        <el-skeleton :rows="10" animated />
                    </div>

                    <div v-else>
                        <div
                            v-if="filteredBooks.length === 0"
                            class="no-results"
                        >
                            <el-empty
                                description="Aucun livre ne correspond à vos critères de recherche"
                            />
                            <el-button type="primary" @click="resetFilters"
                                >Réinitialiser les filtres</el-button
                            >
                        </div>

                        <div
                            v-else
                            :class="[
                                'books-grid',
                                viewMode === 'list' ? 'list-view' : ''
                            ]"
                        >
                            <NuxtLink
                                v-for="book in displayedBooks"
                                :key="book.id"
                                :to="`/book/${book.isbn}`"
                                class="book-card"
                                :class="{ 'list-card': viewMode === 'list' }"
                            >
                                <div
                                    class="book-availability"
                                    v-if="book.available"
                                >
                                    Disponible
                                </div>
                                <div
                                    class="book-availability unavailable"
                                    v-else
                                >
                                    Indisponible
                                </div>
                                <div
                                    class="book-cover"
                                    :style="{
                                        backgroundImage: `url(${book.thumbnail})`
                                    }"
                                ></div>
                                <div class="book-info">
                                    <h3>{{ book.title }}</h3>
                                    <p class="author">{{ book.author }}</p>
                                    <div class="rating">
                                        <el-rate
                                            v-model="book.rating"
                                            disabled
                                            show-score
                                            text-color="#ff9900"
                                        />
                                    </div>
                                    <div
                                        v-if="viewMode === 'list'"
                                        class="book-description"
                                    >
                                        {{
                                            book.description
                                                ? book.description.substring(
                                                      0,
                                                      180
                                                  ) + '...'
                                                : ''
                                        }}
                                    </div>
                                    <div
                                        class="book-details"
                                        v-if="viewMode === 'list'"
                                    >
                                        <span class="detail-item">
                                            <strong>Catégorie:</strong>
                                            {{ book.category }}
                                        </span>
                                        <span class="detail-item">
                                            <strong>Année:</strong>
                                            {{ book.year }}
                                        </span>
                                        <span class="detail-item">
                                            <strong>Pages:</strong>
                                            {{ book.pages }}
                                        </span>
                                    </div>
                                    <el-button
                                        class="reserve-button"
                                        size="small"
                                        type="primary"
                                        :disabled="!book.available"
                                        @click.stop="reserveBook(book)"
                                    >
                                        {{
                                            book.available
                                                ? 'Réserver'
                                                : 'Indisponible'
                                        }}
                                    </el-button>
                                </div>
                            </NuxtLink>
                        </div>

                        <div class="pagination-container">
                            <el-pagination
                                v-model:current-page="currentPage"
                                v-model:page-size="pageSize"
                                :page-sizes="[12, 24, 48, 96]"
                                layout="total, sizes, prev, pager, next, jumper"
                                :total="filteredBooks.length"
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <LoginModal
            v-model:show="showLoginModal"
            v-model:loginForm="loginForm"
            @login="login"
            @switchToRegister="showRegisterModal = true"
            @switchToForgotPassword="showForgotPasswordModal = true"
        />

        <RegisterModal
            v-model:show="showRegisterModal"
            :registerForm="registerForm"
            @register="handleRegister"
            @switchToLogin="showLoginModal = true"
        />

        <ForgotPasswordModal
            v-model:show="showForgotPasswordModal"
            @switchToLogin="showLoginModal = true"
            @resetPasswordRequest="handleResetPasswordRequest"
        />
    </div>
</template>

<script setup>
defineOptions({
    name: 'CatalogPage'
});
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { Grid, Menu, Filter } from '@element-plus/icons-vue';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';
import SearchBar from '~/components/catalog/SearchBar.vue';
import FiltersDrawer from '~/components/catalog/FiltersDrawer.vue';

// État de l'UI pour les modales et les formulaires
const searchQuery = ref('');
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);
const loginForm = ref({
    email: '',
    password: ''
});
const route = useRoute();
const registerForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    acceptTerms: false
});

// État des filtres
const selectedCategories = ref([]);
const selectedAuthors = ref([]);
const availabilityFilter = ref('all');
const minRating = ref(0);
const yearRange = ref([1900, 2025]);
const sortMethod = ref('newest');
const viewMode = ref('grid');
const showFiltersMobile = ref(false);
const isLoading = ref(true);

// Pagination
const currentPage = ref(1);
const pageSize = ref(24);

// Liste des catégories disponibles
const categoriesList = [
    { value: 'roman', label: 'Romans' },
    { value: 'science-fiction', label: 'Science-fiction' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'policier', label: 'Policiers' },
    { value: 'biographie', label: 'Biographies' },
    { value: 'histoire', label: 'Histoire' },
    { value: 'philosophie', label: 'Philosophie' },
    { value: 'art', label: 'Art et Design' },
    { value: 'sciences', label: 'Sciences' },
    { value: 'informatique', label: 'Informatique' }
];

// Liste des auteurs pour la recherche avancée
const authorsList = ref([]);

// Options de tri
const sortOptions = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'oldest', label: 'Plus anciens' },
    { value: 'title_asc', label: 'Titre (A-Z)' },
    { value: 'title_desc', label: 'Titre (Z-A)' },
    { value: 'rating_desc', label: 'Mieux notés' },
    { value: 'author_asc', label: 'Auteur (A-Z)' }
];

// Marqueurs pour le slider d'années
const yearMarks = {
    1900: '1900',
    1950: '1950',
    2000: '2000',
    2025: '2025'
};

// Données de livres
const allBooks = ref([]);

// Chargement des livres depuis l'API
onMounted(async () => {
    isLoading.value = true;
    try {
        // Importer le service API
        const api = (await import('@/services/api')).default;

        // Récupérer les livres et les auteurs depuis l'API
        const [books, authors, reservations] = await Promise.all([
            api.get('/books'),
            api.get('/authors'),
            api.get('/reservation/books')
        ]);

        authorsList.value = authors.map(
            (author) => `${author.firstname} ${author.lastname}`
        );

        // Obtenir la liste des livres actuellement empruntés (pas encore retournés)
        const borrowedBooks = reservations
            .filter((r) => !r.return_date)
            .map((r) => r.book_id);

        // Transformer les données pour correspondre à notre structure frontend
        allBooks.value = books.map((book) => ({
            id: book.id || book.isbn,
            title: book.title,
            author: getAuthorName(book.author, authors),
            rating: book.average_rating || 0,
            thumbnail: book.thumbnail || '/api/placeholder/150/220',
            available: !borrowedBooks.includes(book.isbn), // Vérifier si le livre n'est pas emprunté
            category: Array.isArray(book.keyword)
                ? book.keyword[0] || 'non-catégorisé'
                : book.keyword || 'non-catégorisé',
            pages: book.pages || 0,
            year: book.publish_year || 0,
            isbn: book.isbn,
            description: book.summary || ''
        }));

        if (route.query.search) {
            searchQuery.value = route.query.search;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
        ElNotification({
            title: 'Erreur',
            message:
                'Impossible de charger les livres. Veuillez réessayer plus tard.',
            type: 'error'
        });

        // En cas d'erreur, utiliser des données vides
        allBooks.value = [];
    } finally {
        isLoading.value = false;
    }
});

watch(
    () => route.query.search,
    (newSearch) => {
        if (newSearch) {
            searchQuery.value = newSearch;
        }
    }
);

// Fonction pour déterminer si un livre est emprunté

// Fonction pour obtenir le nom de l'auteur à partir de son ID
const getAuthorName = (authorId, authors) => {
    if (!authors || !authorId) return 'Auteur inconnu';

    const author = authors.find((a) => a.id === authorId);
    return author ? `${author.firstname} ${author.lastname}` : 'Auteur inconnu';
};

// Livres filtrés selon les critères de recherche
const filteredBooks = computed(() => {
    let result = [...allBooks.value];

    // Filtrer par catégories
    if (selectedCategories.value.length > 0) {
        result = result.filter((book) =>
            selectedCategories.value.includes(book.category)
        );
    }

    // Filtrer par auteurs
    if (selectedAuthors.value.length > 0) {
        result = result.filter((book) =>
            selectedAuthors.value.includes(book.author)
        );
    }

    // Filtrer par disponibilité
    if (availabilityFilter.value === 'available') {
        result = result.filter((book) => book.available);
    }

    // Filtrer par note minimale
    if (minRating.value > 0) {
        result = result.filter((book) => book.rating >= minRating.value);
    }

    // Filtrer par plage d'années
    result = result.filter(
        (book) =>
            book.year >= yearRange.value[0] && book.year <= yearRange.value[1]
    );

    // Filtrer par recherche textuelle
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(
            (book) =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                (book.description &&
                    book.description.toLowerCase().includes(query))
        );
    }

    // Trier les résultats
    switch (sortMethod.value) {
        case 'newest':
            result.sort((a, b) => b.year - a.year);
            break;
        case 'oldest':
            result.sort((a, b) => a.year - b.year);
            break;
        case 'title_asc':
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title_desc':
            result.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'rating_desc':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'author_asc':
            result.sort((a, b) => a.author.localeCompare(b.author));
            break;
    }

    return result;
});

// Calcul des livres à afficher avec pagination
const displayedBooks = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredBooks.value.slice(startIndex, startIndex + pageSize.value);
});

// Réinitialiser les filtres
const resetFilters = () => {
    selectedCategories.value = [];
    selectedAuthors.value = [];
    availabilityFilter.value = 'all';
    minRating.value = 0;
    yearRange.value = [1900, 2025];
    searchQuery.value = '';
    currentPage.value = 1;
};

// Appliquer les filtres
const applyFilters = () => {
    // Réinitialiser la pagination lors de l'application des filtres
    currentPage.value = 1;
    showFiltersMobile.value = false;
};

// Gestion des filtres depuis le drawer mobile
const handleFilterDrawerApply = (filters) => {
    selectedCategories.value = filters.selectedCategories;
    availabilityFilter.value = filters.availabilityFilter;
    minRating.value = filters.minRating;
    yearRange.value = filters.yearRange;
    currentPage.value = 1;
};

// Gestion de la pagination
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    currentPage.value = 1;
};

const handleCurrentChange = (newPage) => {
    currentPage.value = newPage;
    // Scroller en haut des résultats
    window.scrollTo({
        top: document.querySelector('.catalog-controls').offsetTop - 100,
        behavior: 'smooth'
    });
};

// Gérer la recherche standard
const handleSearch = (text) => {
    searchQuery.value = text;
    currentPage.value = 1;
};

// Gérer la recherche avancée
const handleAdvancedSearch = (filters) => {
    // Mettre à jour la recherche textuelle
    searchQuery.value = filters.text || '';

    // Traiter les catégories
    selectedCategories.value = filters.categories || [];

    // Traiter les auteurs
    selectedAuthors.value = filters.authors || [];

    // Traiter la plage d'années
    if (filters.yearRange && Array.isArray(filters.yearRange)) {
        const startYear =
            typeof filters.yearRange[0] === 'object'
                ? new Date(filters.yearRange[0]).getFullYear()
                : filters.yearRange[0];
        const endYear =
            typeof filters.yearRange[1] === 'object'
                ? new Date(filters.yearRange[1]).getFullYear()
                : filters.yearRange[1];

        yearRange.value = [startYear || 1900, endYear || 2025];
    } else {
        yearRange.value = [1900, 2025]; // Valeurs par défaut
    }

    // Traiter le filtre de disponibilité
    availabilityFilter.value = filters.availability || 'all';

    // Réinitialiser la pagination
    currentPage.value = 1;
};

// Réinitialiser la recherche
const resetSearch = () => {
    resetFilters();
};

// Réserver un livre
const reserveBook = async (book) => {
    if (!book.available) {
        ElNotification({
            title: 'Non disponible',
            message: "Ce livre n'est pas disponible actuellement.",
            type: 'warning'
        });
        return;
    }

    // Vérifier si l'utilisateur est connecté
    const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token');
    if (!token) {
        showLoginModal.value = true;
        ElNotification({
            title: 'Connexion requise',
            message: 'Veuillez vous connecter pour réserver un livre.',
            type: 'info'
        });
        return;
    }

    try {
        const api = (await import('@/services/api')).default;

        // Récupérer d'abord les informations de l'utilisateur connecté
        const userData = await api.get('/me');

        // Envoyer la réservation avec user_id et book_id
        await api.post('/reservation/books', {
            user_id: userData.id,
            book_id: book.isbn
        });

        // Mettre à jour l'état du livre en local
        const index = allBooks.value.findIndex((b) => b.isbn === book.isbn);
        if (index !== -1) {
            allBooks.value[index].available = false;
        }

        ElNotification({
            title: 'Réservation confirmée',
            message: `Livre "${book.title}" réservé avec succès!`,
            type: 'success',
            duration: 5000
        });
    } catch (error) {
        console.error('Erreur lors de la réservation du livre:', error);

        ElNotification({
            title: 'Erreur',
            message:
                error.message ||
                'Une erreur est survenue lors de la réservation.',
            type: 'error'
        });
    }
};

// Gestion de la connexion
const login = () => {
    showLoginModal.value = false;
};

// Gestion de l'inscription
const handleRegister = () => {
    showRegisterModal.value = false;
};

// Gestion de la réinitialisation du mot de passe
const handleResetPasswordRequest = (email) => {
    ElNotification({
        title: `Email envoyé à ${email}`,
        message:
            'Un lien de réinitialisation a été envoyé à votre adresse email.',
        type: 'success'
    });
};

// Observer les changements de filtre pour la mise à jour automatique des résultats
watch(
    [
        searchQuery,
        availabilityFilter,
        selectedCategories,
        selectedAuthors,
        minRating,
        yearRange,
        sortMethod
    ],
    () => {
        // Réinitialiser la pagination lorsque les filtres changent
        currentPage.value = 1;
    }
);
</script>

<style scoped>
.catalog-page {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.catalog-hero {
    height: 30vh;
    position: relative;
    background-image: url('/photo.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8));
    z-index: 1;
}

.catalog-hero-content {
    text-align: center;
    z-index: 2;
    color: white;
    max-width: 800px;
    padding: 0 20px;
}

.catalog-hero-content h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.catalog-hero-content p {
    font-size: 1.2rem;
    font-weight: 300;
}

.catalog-content {
    flex-grow: 1;
    width: 90%;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 60px;
}

.catalog-layout {
    display: flex;
    gap: 30px;
}

.filters-sidebar {
    flex: 0 0 280px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 100px;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.filters-header h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: #1e88e5;
}

.filter-section {
    margin-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 20px;
}

.filter-section:last-child {
    border-bottom: none;
}

.filter-section h3 {
    font-size: 1.1rem;
    margin-bottom: 12px;
    font-weight: 600;
    color: #333;
}

.year-range {
    padding: 0 10px;
    margin-top: 20px;
}

.filter-actions {
    margin-top: 30px;
    display: flex;
    gap: 10px;
}

.books-container {
    flex: 1;
}

.catalog-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 24px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.catalog-stats {
    font-weight: 600;
    color: #666;
}

.view-sort-controls {
    display: flex;
    align-items: center;
    gap: 16px;
}

.show-filters-mobile {
    display: none;
}

.books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

.books-grid.list-view {
    grid-template-columns: 1fr;
}

.loading-container {
    margin-top: 30px;
}

.no-results {
    text-align: center;
    padding: 50px 0;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Styles des cartes de livre */
.book-card {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
}

@media (hover: hover) {
    .book-card:hover {
        transform: translateY(-8px) scale(1.03);
        z-index: 1;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
}

.book-availability {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #4caf50;
    color: white;
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 600;
    z-index: 2;
}

.book-availability.unavailable {
    background-color: #f44336;
}

.book-cover {
    height: 260px;
    background-size: cover;
    background-position: center;
    position: relative;
}

.book-info {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

.book-info h3 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}

.author {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 0.85rem;
}

.rating {
    margin-top: auto;
    margin-bottom: 12px;
}

.reserve-button {
    width: 100%;
    margin-top: 8px;
    font-weight: 600;
}

/* Style carte en mode liste */
.book-card.list-card {
    flex-direction: row;
    height: 200px;
}

.list-card .book-cover {
    width: 130px;
    height: 100%;
    min-width: 130px;
    flex-shrink: 0;
}

.list-card .book-info {
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
}

.list-card .book-info h3 {
    font-size: 1.2rem;
    white-space: normal;
    margin-bottom: 8px;
}

.list-card .author {
    font-size: 1rem;
    margin-bottom: 8px;
}

.list-card .book-description {
    color: #666;
    font-size: 0.9rem;
    margin: 10px 0;
    line-height: 1.5;
    overflow: hidden;
    flex-grow: 1;
}

.list-card .book-details {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 12px;
    font-size: 0.85rem;
}

.list-card .detail-item {
    color: #666;
}

.list-card .reserve-button {
    width: auto;
    align-self: flex-start;
}

@media (max-width: 1200px) {
    .catalog-content {
        width: 95%;
    }

    .books-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
    }
}

@media (max-width: 960px) {
    .filters-sidebar {
        display: none;
    }

    .show-filters-mobile {
        display: flex;
    }
}

@media (max-width: 768px) {
    .catalog-hero-content h1 {
        font-size: 2rem;
    }

    .catalog-hero-content p {
        font-size: 1rem;
    }

    .catalog-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .view-sort-controls {
        width: 100%;
        justify-content: space-between;
    }

    .books-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
    }

    .book-card.list-card {
        height: auto;
        flex-direction: column;
    }

    .list-card .book-cover {
        width: 100%;
        height: 200px;
    }
}

@media (max-width: 480px) {
    .view-controls {
        display: none;
    }

    .sort-control {
        flex-grow: 1;
    }
}
</style>
