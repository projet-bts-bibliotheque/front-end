<template>
    <div class="library-app">
        <div class="book-page" v-if="book">
            <!-- Book Hero Section -->
            <div class="book-hero-section">
                <div class="container">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }"
                            >Accueil</el-breadcrumb-item
                        >
                        <el-breadcrumb-item :to="{ path: '/catalogue' }"
                            >Catalogue</el-breadcrumb-item
                        >
                        <el-breadcrumb-item>{{
                            book.title
                        }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
            </div>

            <div class="book-content container">
                <!-- Main Book Details -->
                <div class="book-details-content">
                    <div class="book-image-section">
                        <div
                            class="book-details-cover"
                            :style="{
                                backgroundImage: `url(${book.coverUrl})`
                            }"
                        >
                            <div
                                class="book-availability-badge"
                                :class="{ available: book.available }"
                            >
                                {{
                                    book.available
                                        ? 'Disponible'
                                        : 'Indisponible'
                                }}
                            </div>
                        </div>
                        <div class="book-actions-mobile">
                            <el-button
                                type="primary"
                                :disabled="!book.available"
                                @click="reserveBook"
                                :icon="Calendar"
                                class="reserve-button"
                            >
                                {{
                                    book.available ? 'Réserver' : 'Indisponible'
                                }}
                            </el-button>
                        </div>
                    </div>

                    <div class="book-details-info">
                        <h1>{{ book.title }}</h1>
                        <p class="book-author">
                            Par
                            <span class="author-name">{{ book.author }}</span>
                        </p>

                        <div class="book-rating">
                            <el-rate v-model="book.rating" disabled />
                            <span class="rating-text"
                                >{{ book.rating }} sur 5</span
                            >
                            <span class="reviews-count"
                                >({{ randomReviewCount }} avis)</span
                            >
                        </div>

                        <div class="book-status">
                            <span class="status-label">Statut:</span>
                            <span
                                class="status-value"
                                :class="{ available: book.available }"
                            >
                                {{
                                    book.available
                                        ? 'Disponible'
                                        : 'Indisponible'
                                }}
                            </span>
                            <span class="status-extra" v-if="book.available">
                                (1 exemplaire disponible)
                            </span>
                            <span class="status-extra" v-else>
                                (Retour prévu le {{ expectedReturnDate }})
                            </span>
                        </div>

                        <div class="book-description">
                            <p>
                                {{
                                    book.description ||
                                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
                                }}
                            </p>
                        </div>

                        <div class="book-meta">
                            <div class="meta-item">
                                <el-icon><Document /></el-icon>
                                <span class="meta-label">Catégorie:</span>
                                <span class="meta-value">{{
                                    book.category || ''
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon><Document /></el-icon>
                                <span class="meta-label">Pages:</span>
                                <span class="meta-value">{{
                                    book.pages || '0'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon><Calendar /></el-icon>
                                <span class="meta-label">Année:</span>
                                <span class="meta-value">{{
                                    book.year || '2020'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon><Document /></el-icon>
                                <span class="meta-label">ISBN:</span>
                                <span class="meta-value">{{
                                    book.isbn || '978-3-16-148410-0'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon><Document /></el-icon>
                                <span class="meta-label">Éditeur:</span>
                                <span class="meta-value">{{
                                    book.publisher || 'Éditions Gallimard'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon><Document /></el-icon>
                                <span class="meta-label">Langue:</span>
                                <span class="meta-value">{{
                                    book.language || 'Français'
                                }}</span>
                            </div>
                        </div>

                        <div class="book-actions-desktop">
                            <el-button
                                type="primary"
                                :disabled="!book.available"
                                @click="reserveBook"
                                :icon="Calendar"
                                class="reserve-button"
                            >
                                {{
                                    book.available ? 'Réserver' : 'Indisponible'
                                }}
                            </el-button>
                        </div>
                    </div>
                </div>

                <!-- Books of the same author -->
                <div class="author-books" v-if="booksByAuthor.length">
                    <h2 class="section-title">
                        <el-icon><Reading /></el-icon>
                        Du même auteur
                    </h2>
                    <div class="books-carousel">
                        <div class="carousel-container">
                            <div class="carousel-controls">
                                <button
                                    class="carousel-arrow prev-arrow"
                                    @click="slideAuthorBooksLeft"
                                    :disabled="authorBooksPosition <= 0"
                                >
                                    <el-icon><ArrowLeft /></el-icon>
                                </button>
                                <button
                                    class="carousel-arrow next-arrow"
                                    @click="slideAuthorBooksRight"
                                    :disabled="
                                        authorBooksPosition >=
                                        maxAuthorBooksPosition
                                    "
                                >
                                    <el-icon><ArrowRight /></el-icon>
                                </button>
                            </div>
                            <div class="carousel-track-container">
                                <div
                                    class="carousel-track"
                                    :style="{
                                        transform: `translateX(-${authorBooksPosition}px)`
                                    }"
                                >
                                    <NuxtLink
                                        v-for="authorBook in booksByAuthor"
                                        :key="authorBook.id"
                                        :to="`/book/${authorBook.id}`"
                                        class="carousel-slide"
                                    >
                                        <div
                                            class="related-book-cover"
                                            :style="{
                                                backgroundImage: `url(${authorBook.coverUrl})`
                                            }"
                                        >
                                            <div
                                                class="related-book-available"
                                                v-if="authorBook.available"
                                            >
                                                Disponible
                                            </div>
                                        </div>
                                        <div class="related-book-info">
                                            <h3>{{ authorBook.title }}</h3>
                                            <p class="year">
                                                {{ authorBook.year }}
                                            </p>
                                            <div class="related-book-rating">
                                                <el-rate
                                                    v-model="authorBook.rating"
                                                    disabled
                                                    :max="5"
                                                />
                                            </div>
                                        </div>
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Similar Books Section (by genre) -->
                <div class="similar-books" v-if="relatedBooks.length">
                    <h2 class="section-title">
                        <el-icon><Reading /></el-icon>
                        Vous pourriez aussi aimer ce genre
                    </h2>
                    <div class="related-books-carousel">
                        <div class="carousel-container">
                            <div class="carousel-controls">
                                <button
                                    class="carousel-arrow prev-arrow"
                                    @click="slideRelatedBooksLeft"
                                    :disabled="relatedBooksPosition <= 0"
                                >
                                    <el-icon><ArrowLeft /></el-icon>
                                </button>
                                <button
                                    class="carousel-arrow next-arrow"
                                    @click="slideRelatedBooksRight"
                                    :disabled="
                                        relatedBooksPosition >=
                                        maxRelatedBooksPosition
                                    "
                                >
                                    <el-icon><ArrowRight /></el-icon>
                                </button>
                            </div>
                            <div class="carousel-track-container">
                                <div
                                    class="carousel-track"
                                    :style="{
                                        transform: `translateX(-${relatedBooksPosition}px)`
                                    }"
                                >
                                    <NuxtLink
                                        v-for="relatedBook in relatedBooks"
                                        :key="relatedBook.id"
                                        :to="`/book/${relatedBook.id}`"
                                        class="carousel-slide"
                                    >
                                        <div
                                            class="related-book-cover"
                                            :style="{
                                                backgroundImage: `url(${relatedBook.coverUrl})`
                                            }"
                                        >
                                            <div
                                                class="related-book-available"
                                                v-if="relatedBook.available"
                                            >
                                                Disponible
                                            </div>
                                        </div>
                                        <div class="related-book-info">
                                            <h3>{{ relatedBook.title }}</h3>
                                            <p class="author">
                                                {{ relatedBook.author }}
                                            </p>
                                            <div class="related-book-rating">
                                                <el-rate
                                                    v-model="relatedBook.rating"
                                                    disabled
                                                    :max="5"
                                                />
                                            </div>
                                        </div>
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Trending Books Section -->
                <div class="trending-books">
                    <h2 class="section-title">
                        <el-icon><StarFilled /></el-icon>
                        Populaire en ce moment
                    </h2>
                    <div class="trending-books-carousel">
                        <div class="carousel-container">
                            <div class="carousel-controls">
                                <button
                                    class="carousel-arrow prev-arrow"
                                    @click="slideTrendingBooksLeft"
                                    :disabled="trendingBooksPosition <= 0"
                                >
                                    <el-icon><ArrowLeft /></el-icon>
                                </button>
                                <button
                                    class="carousel-arrow next-arrow"
                                    @click="slideTrendingBooksRight"
                                    :disabled="
                                        trendingBooksPosition >=
                                        maxTrendingBooksPosition
                                    "
                                >
                                    <el-icon><ArrowRight /></el-icon>
                                </button>
                            </div>
                            <div class="carousel-track-container">
                                <div
                                    class="carousel-track"
                                    :style="{
                                        transform: `translateX(-${trendingBooksPosition}px)`
                                    }"
                                >
                                    <NuxtLink
                                        v-for="trendingBook in trendingBooks"
                                        :key="trendingBook.id"
                                        :to="`/book/${trendingBook.id}`"
                                        class="carousel-slide"
                                    >
                                        <div
                                            class="related-book-cover"
                                            :style="{
                                                backgroundImage: `url(${trendingBook.coverUrl})`
                                            }"
                                        >
                                            <div class="trending-badge">
                                                <el-icon
                                                    ><StarFilled
                                                /></el-icon>
                                                Populaire
                                            </div>
                                            <div
                                                class="related-book-available"
                                                v-if="trendingBook.available"
                                            >
                                                Disponible
                                            </div>
                                        </div>
                                        <div class="related-book-info">
                                            <h3>{{ trendingBook.title }}</h3>
                                            <p class="author">
                                                {{ trendingBook.author }}
                                            </p>
                                            <div class="related-book-rating">
                                                <el-rate
                                                    v-model="
                                                        trendingBook.rating
                                                    "
                                                    disabled
                                                    :max="5"
                                                />
                                            </div>
                                        </div>
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="book-loading container">
            <!-- Skeleton Loader with better layout -->
            <div class="book-skeleton">
                <div class="skeleton-image">
                    <el-skeleton animated :rows="0" />
                </div>
                <div class="skeleton-content">
                    <el-skeleton animated :rows="10" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Section <script setup> corrigée pour pages/book/[id].vue

import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    Star,
    StarFilled,
    Calendar,
    ArrowLeft,
    ArrowRight,
    Document,
    Reading,
    Share
} from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

defineOptions({
    name: 'BookDetailsPage'
});

//récupération de l'id depuis l'URL
const route = useRoute();
const router = useRouter();
const bookId = route.params.id;

const loading = ref(true);
const book = ref(null);
const allBooks = ref([]);
const authors = ref([]);

// États pour les modales
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showShareDialog = ref(false);
const isFavorite = ref(false);

// Variables pour les carousels
const relatedBooksPosition = ref(0);
const authorBooksPosition = ref(0);
const trendingBooksPosition = ref(0);
const bookItemWidth = 220;
const bookGap = 20;
const visibleItems = ref(4);

// Données générées aléatoirement
const randomReviewCount = Math.floor(Math.random() * 500) + 50;
const randomAvailableCount = Math.floor(Math.random() * 5) + 1;
const expectedReturnDate = getRandomFutureDate();

// Chargement des données
const loadBookData = async () => {
    try {
        const api = (await import('@/services/api')).default;

        // Récupérer tous les livres, auteurs et réservations
        const [booksData, authorsData, reservations] = await Promise.all([
            api.get('/books'),
            api.get('/authors'),
            api.get('/reservation/books')
        ]);

        authors.value = authorsData;

        // Obtenir la liste des livres actuellement empruntés
        const borrowedBooks = reservations
            .filter((r) => !r.return_date)
            .map((r) => r.book_id);

        // Transformer les données
        allBooks.value = booksData.map((bookItem) => {
            const author = authorsData.find((a) => a.id === bookItem.author);

            return {
                id: bookItem.isbn, // Utiliser l'ISBN comme ID
                isbn: bookItem.isbn,
                title: bookItem.title,
                author: author
                    ? `${author.firstname} ${author.lastname}`
                    : 'Auteur inconnu',
                rating: bookItem.average_rating || 0,
                coverUrl: bookItem.thumbnails || '/api/placeholder/300/450',
                available: !borrowedBooks.includes(bookItem.isbn),
                category: Array.isArray(bookItem.keyword)
                    ? bookItem.keyword[0] || 'non-catégorisé'
                    : bookItem.keyword || 'non-catégorisé',
                pages: bookItem.pages || 0,
                year: bookItem.publish_year || 2020,
                description: bookItem.summary || 'Description non disponible.',
                publisher: 'Éditions Gallimard', // Valeur par défaut
                language: 'Français' // Valeur par défaut
            };
        });

        // Trouver le livre spécifique
        book.value = allBooks.value.find(
            (b) => b.id === bookId || b.isbn === bookId
        );

        if (!book.value) {
            // Redirection si le livre n'existe pas
            const router = useRouter();
            router.push('/catalog');
            ElNotification({
                title: 'Livre non trouvé',
                message:
                    "Le livre demandé n'existe pas dans notre bibliothèque.",
                type: 'error'
            });
            return;
        }

        // Mettre à jour le titre de la page
        useHead({
            title: `${book.value.title} - BibliothèqueNuxt`,
            meta: [
                {
                    name: 'description',
                    content:
                        book.value.description ||
                        `Découvrez "${book.value.title}" de ${book.value.author} dans notre bibliothèque.`
                }
            ]
        });
    } catch (error) {
        console.error('Erreur lors du chargement du livre:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de charger les informations du livre.',
            type: 'error'
        });
        const router = useRouter();
        router.push('/catalog');
    } finally {
        loading.value = false;
    }
};

// Nettoyage à la destruction du composant
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateVisibleItems);
});

// Fonctions utilitaires
function updateVisibleItems() {
    const width = window.innerWidth;
    if (width < 768) {
        visibleItems.value = 1;
    } else if (width < 1024) {
        visibleItems.value = 2;
    } else if (width < 1280) {
        visibleItems.value = 3;
    } else {
        visibleItems.value = 4;
    }
}

// Calcul des positions maximales pour les carousels
const maxRelatedBooksPosition = computed(() => {
    if (!relatedBooks.value.length) return 0;
    const totalWidth = relatedBooks.value.length * (bookItemWidth + bookGap);
    const visibleWidth = visibleItems.value * (bookItemWidth + bookGap);
    return Math.max(0, totalWidth - visibleWidth);
});

const maxAuthorBooksPosition = computed(() => {
    if (!booksByAuthor.value.length) return 0;
    const totalWidth = booksByAuthor.value.length * (bookItemWidth + bookGap);
    const visibleWidth = visibleItems.value * (bookItemWidth + bookGap);
    return Math.max(0, totalWidth - visibleWidth);
});

const maxTrendingBooksPosition = computed(() => {
    if (!trendingBooks.value.length) return 0;
    const totalWidth = trendingBooks.value.length * (bookItemWidth + bookGap);
    const visibleWidth = visibleItems.value * (bookItemWidth + bookGap);
    return Math.max(0, totalWidth - visibleWidth);
});

// Navigation dans les carousels
function slideRelatedBooksLeft() {
    relatedBooksPosition.value = Math.max(
        0,
        relatedBooksPosition.value - (bookItemWidth + bookGap)
    );
}

function slideRelatedBooksRight() {
    relatedBooksPosition.value = Math.min(
        maxRelatedBooksPosition.value,
        relatedBooksPosition.value + (bookItemWidth + bookGap)
    );
}

function slideAuthorBooksLeft() {
    authorBooksPosition.value = Math.max(
        0,
        authorBooksPosition.value - (bookItemWidth + bookGap)
    );
}

function slideAuthorBooksRight() {
    authorBooksPosition.value = Math.min(
        maxAuthorBooksPosition.value,
        authorBooksPosition.value + (bookItemWidth + bookGap)
    );
}

function slideTrendingBooksLeft() {
    trendingBooksPosition.value = Math.max(
        0,
        trendingBooksPosition.value - (bookItemWidth + bookGap)
    );
}

function slideTrendingBooksRight() {
    trendingBooksPosition.value = Math.min(
        maxTrendingBooksPosition.value,
        trendingBooksPosition.value + (bookItemWidth + bookGap)
    );
}

// Recherche des livres associés (même catégorie, mais auteur différent)
const relatedBooks = computed(() => {
    if (!book.value || !allBooks.value.length) return [];

    return allBooks.value
        .filter(
            (b) =>
                b.id !== book.value.id &&
                b.category === book.value.category &&
                b.author !== book.value.author
        )
        .slice(0, 6);
});
// Livres du même auteur
const booksByAuthor = computed(() => {
    if (!book.value || !allBooks.value.length) return [];

    return allBooks.value
        .filter((b) => b.id !== book.value.id && b.author === book.value.author)
        .slice(0, 6);
});

// Livres populaires
const trendingBooks = computed(() => {
    if (!allBooks.value.length) return [];

    return [...allBooks.value]
        .sort((a, b) => b.rating - a.rating)
        .filter((b) => b.id !== book.value?.id)
        .slice(0, 6);
});

// Fonction pour générer une date future aléatoire
function getRandomFutureDate(minDays = 3, maxDays = 30) {
    const today = new Date();
    const futureDate = new Date(today);
    const randomDays =
        Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    futureDate.setDate(today.getDate() + randomDays);

    return futureDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

const reserveBook = async () => {
    if (!book.value?.available) {
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
            book_id: book.value.isbn
        });

        book.value.available = false;

        ElNotification({
            title: 'Réservation confirmée',
            message: `Livre "${book.value.title}" réservé avec succès!`,
            type: 'success',
            duration: 5000
        });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        ElNotification({
            title: 'Erreur',
            message:
                error.message ||
                'Une erreur est survenue lors de la réservation.',
            type: 'error'
        });
    }
};

const shareBook = () => {
    showShareDialog.value = true;
};

onMounted(async () => {
    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    await loadBookData();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateVisibleItems);
});
</script>

<style scoped>
.library-app {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 30px;
    width: 100%;
}

/* Hero Section */
.book-hero-section {
    padding: 20px 0;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    margin-bottom: 30px;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.book-content {
    margin-bottom: 60px;
}

/* Main Book Details */
.book-details-content {
    display: flex;
    gap: 40px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 40px;
    margin-bottom: 40px;
}

.book-image-section {
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.book-details-cover {
    width: 300px;
    height: 450px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-details-cover:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.book-availability-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: #f44336;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.book-availability-badge.available {
    background-color: #4caf50;
}

.book-actions-mobile {
    display: none;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.book-details-info {
    flex: 1;
}

.book-details-info h1 {
    font-size: 2.25rem;
    margin: 0 0 12px 0;
    font-weight: 700;
    color: #1e88e5;
    line-height: 1.2;
}

.book-author {
    color: #555;
    font-size: 1.25rem;
    margin-bottom: 20px;
}

.author-name {
    font-weight: 600;
    color: #333;
}

.book-rating {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 5px;
}

.rating-text {
    margin-left: 10px;
    color: #666;
    font-weight: 600;
}

.reviews-count {
    color: #888;
    margin-left: 5px;
}

.book-status {
    margin-bottom: 20px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
}

.status-label {
    font-weight: 600;
    margin-right: 5px;
}

.status-value {
    color: #f44336;
    font-weight: 600;
}

.status-value.available {
    color: #4caf50;
}

.status-extra {
    color: #666;
    margin-left: 5px;
    font-style: italic;
}

.book-description {
    line-height: 1.8;
    margin-bottom: 30px;
    color: #333;
    font-size: 1.05rem;
}

.book-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
}

.meta-item .el-icon {
    color: #1e88e5;
}

.meta-label {
    font-weight: 600;
    margin-right: 5px;
    color: #555;
}

.meta-value {
    color: #333;
}

.book-actions-desktop {
    display: flex;
    gap: 15px;
}

.book-actions-desktop .el-button,
.book-actions-mobile .el-button {
    padding: 12px 24px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.favorite-button.is-favorite {
    color: #ff9800;
    border-color: #ff9800;
}

/* Author Section */
.author-section,
.author-books,
.similar-books,
.trending-books {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 40px;
    margin-bottom: 40px;
}

.author-profile {
    display: flex;
    gap: 30px;
    align-items: flex-start;
}

.author-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #e0e0e0;
    background-image: url('/api/placeholder/120/120');
    background-size: cover;
    flex-shrink: 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.author-info {
    flex: 1;
}

.author-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 15px 0;
    color: #333;
}

.author-bio {
    line-height: 1.8;
    color: #333;
    margin-bottom: 20px;
}

.view-all-books {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    color: #1e88e5;
}

.section-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 30px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-title .el-icon {
    color: #1e88e5;
}

/* Carousel Styling */
.books-carousel,
.related-books-carousel,
.trending-books-carousel {
    position: relative;
}

.carousel-container {
    position: relative;
    overflow: hidden;
    padding: 20px 0;
}

.carousel-controls {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.carousel-arrow {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: #1e88e5;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    opacity: 0.9;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.carousel-arrow:hover {
    opacity: 1;
    transform: scale(1.05);
}

.carousel-arrow:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
}

.prev-arrow {
    margin-left: -22px;
}

.next-arrow {
    margin-right: -22px;
}

.carousel-track-container {
    overflow: hidden;
}

.carousel-track {
    display: flex;
    gap: 20px;
    transition: transform 0.5s ease;
}

.carousel-slide {
    flex: 0 0 auto;
    width: 220px;
    text-decoration: none;
    color: inherit;
}

.related-book-cover {
    height: 330px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.carousel-slide:hover .related-book-cover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.related-book-available {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #4caf50;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.trending-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #ff9800;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
}

.related-book-info h3 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.related-book-info .author,
.related-book-info .year {
    margin: 0 0 8px 0;
    color: #666;
    font-size: 0.85rem;
}

.related-book-rating {
    font-size: 0.85rem;
}

/* Skeleton Loader */
.book-skeleton {
    display: flex;
    gap: 40px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 40px;
    margin-bottom: 40px;
}

.skeleton-image {
    width: 300px;
    height: 450px;
    flex-shrink: 0;
    background-color: #f0f0f0;
    border-radius: 8px;
}

.skeleton-content {
    flex: 1;
}

/* Share Dialog */
.share-dialog {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid #eee;
}

:deep(.el-dialog__title) {
    font-weight: 700;
    color: #1e88e5;
}

:deep(.el-dialog__body) {
    padding: 20px;
}

.share-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.share-book-info {
    display: flex;
    gap: 15px;
}

.share-book-cover {
    width: 80px;
    height: 120px;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    flex-shrink: 0;
}

.share-book-details {
    flex: 1;
}

.share-book-details h3 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    color: #333;
}

.share-book-details p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

.share-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.share-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.share-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.share-buttons .share-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    color: white;
}

.share-button.facebook {
    background-color: #3b5998;
}

.share-button.twitter {
    background-color: #1da1f2;
}

.share-button.email {
    background-color: #ea4335;
}

.share-button.link {
    background-color: #1e88e5;
}

.share-button:hover {
    opacity: 0.9;
}

/* Responsive Styles */
@media (max-width: 1280px) {
    .book-details-cover {
        width: 250px;
        height: 375px;
    }

    .book-meta {
        grid-template-columns: 1fr;
    }

    .carousel-slide {
        width: 200px;
    }

    .related-book-cover {
        height: 300px;
    }
}

@media (max-width: 1024px) {
    .book-details-content {
        flex-direction: column;
        align-items: center;
        padding: 30px;
    }

    .book-details-cover {
        width: 220px;
        height: 330px;
    }

    .book-image-section {
        margin-bottom: 20px;
    }

    .book-actions-mobile {
        display: flex;
        margin-top: 20px;
    }

    .book-actions-desktop {
        display: none;
    }

    .book-details-info {
        width: 100%;
        text-align: center;
    }

    .book-rating,
    .book-status {
        justify-content: center;
    }

    .carousel-slide {
        width: 180px;
    }

    .related-book-cover {
        height: 270px;
    }

    .author-profile {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .author-section,
    .author-books,
    .similar-books,
    .trending-books {
        padding: 30px;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }

    .book-details-content {
        padding: 20px;
    }

    .book-actions-mobile {
        flex-direction: column;
    }

    .book-skeleton {
        flex-direction: column;
        align-items: center;
    }

    .similar-books .carousel-arrow,
    .author-books .carousel-arrow,
    .trending-books .carousel-arrow {
        width: 36px;
        height: 36px;
    }

    .prev-arrow {
        margin-left: 5px;
    }

    .next-arrow {
        margin-right: 5px;
    }

    .share-buttons {
        grid-template-columns: 1fr;
    }

    .author-section,
    .author-books,
    .similar-books,
    .trending-books {
        padding: 20px;
    }

    .section-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .book-meta {
        grid-template-columns: 1fr;
        padding: 15px;
    }

    .carousel-slide {
        width: 160px;
    }

    .related-book-cover {
        height: 240px;
    }
}
</style>
