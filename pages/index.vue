<template>
    <div class="library-app">
        <header class="navbar">
            <div class="logo">BibliothèqueNuxt</div>
            <div class="menu">
                <el-menu
                    :default-active="activeIndex"
                    class="el-menu"
                    mode="horizontal"
                >
                    <el-menu-item index="1">Accueil</el-menu-item>
                    <el-menu-item index="2">Catalogue</el-menu-item>
                    <el-menu-item index="3">Salles</el-menu-item>
                    <el-menu-item index="4">Événements</el-menu-item>
                </el-menu>
            </div>
            <div class="search-container">
                <el-autocomplete
                    v-model="searchQuery"
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
                @click="showLoginModal = true"
            >
                Se connecter
            </el-button>
        </header>

        <div class="hero-section">
            <div class="overlay"></div>
            <div class="hero-content">
                <h1 class="main-title">BIBLIOTHÈQUE DE L'ESNA</h1>
                <p class="hero-subtitle">
                    Découvrez notre collection de plus de 10 000 ouvrages
                </p>
                <div class="cta-buttons">
                    <el-button type="primary" size="large"
                        >Explorer le catalogue</el-button
                    >
                    <el-button size="large">Réserver une salle</el-button>
                </div>
            </div>
        </div>

        <div class="features-section">
            <div class="feature-card">
                <el-icon size="36"><Calendar /></el-icon>
                <h3>Réservez en ligne</h3>
                <p>
                    Empruntez des livres ou réservez une salle d'étude en
                    quelques clics
                </p>
            </div>
            <div class="feature-card">
                <el-icon size="36"><Reading /></el-icon>
                <h3>Plus de 10 000 livres</h3>
                <p>
                    Accédez à notre vaste collection d'ouvrages dans tous les
                    domaines
                </p>
            </div>
            <div class="feature-card">
                <el-icon size="36"><ChatLineRound /></el-icon>
                <h3>Assistance 24/7</h3>
                <p>
                    Notre équipe est à votre disposition pour vous aider dans
                    vos recherches
                </p>
            </div>
        </div>

        <main class="content">
            <section
                v-for="(category, index) in categories"
                :key="index"
                class="category-section"
            >
                <div class="section-header">
                    <h2>{{ category.title }}</h2>
                    <el-button text type="primary"
                        >Voir tout <el-icon><ArrowRight /></el-icon
                    ></el-button>
                </div>
                <div class="netflix-slider">
                    <div class="slider-controls">
                        <button
                            class="slider-arrow prev"
                            @click="slideLeft(index)"
                            :disabled="sliderPositions[index] <= 0"
                        >
                            <el-icon><ArrowLeft /></el-icon>
                        </button>
                        <button
                            class="slider-arrow next"
                            @click="slideRight(index)"
                            :disabled="
                                sliderPositions[index] >=
                                maxSlidePosition(category.books.length)
                            "
                        >
                            <el-icon><ArrowRight /></el-icon>
                        </button>
                    </div>
                    <div class="slider-container">
                        <div
                            class="slider-content"
                            :style="{
                                transform: `translateX(-${sliderPositions[index]}px)`
                            }"
                        >
                            <div
                                v-for="(book, bookIndex) in category.books"
                                :key="bookIndex"
                                class="book-card"
                                @click="showBookDetails(book)"
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
                                        backgroundImage: `url(${book.coverUrl})`
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
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="stats-section">
                <h2>Notre bibliothèque en chiffres</h2>
                <div class="stats-container">
                    <div class="stat-item">
                        <div class="stat-number">10,000+</div>
                        <div class="stat-label">Livres</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">5,000+</div>
                        <div class="stat-label">Membres</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">15</div>
                        <div class="stat-label">Salles d'étude</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">24/7</div>
                        <div class="stat-label">Accessible</div>
                    </div>
                </div>
            </section>

            <section class="newsletter-section">
                <div class="newsletter-content">
                    <h2>Restez informé</h2>
                    <p>
                        Inscrivez-vous à notre newsletter pour être informé des
                        nouvelles acquisitions et des événements à venir
                    </p>
                    <div class="newsletter-form">
                        <el-input
                            v-model="newsletterEmail"
                            placeholder="Votre adresse email"
                        />
                        <el-button type="primary">S'inscrire</el-button>
                    </div>
                </div>
            </section>
        </main>

        <footer class="site-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>BibliothèqueNuxt</h3>
                    <p>
                        Votre bibliothèque moderne et accessible 24/7 pour tous
                        vos besoins littéraires et académiques.
                    </p>
                </div>
                <div class="footer-section">
                    <h3>Liens rapides</h3>
                    <ul class="footer-links">
                        <li><a href="#">Accueil</a></li>
                        <li><a href="#">Catalogue</a></li>
                        <li><a href="#">Salles</a></li>
                        <li><a href="#">Événements</a></li>
                        <li><a href="#">À propos</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <address>
                        123 Rue de la Connaissance<br />
                        75000 Paris<br />
                        Tél: 01 23 45 67 89<br />
                        Email: contact@bibliothequeesna.fr
                    </address>
                </div>
                <div class="footer-section">
                    <h3>Horaires</h3>
                    <ul class="hours-list">
                        <li>Lundi - Vendredi: 9h - 22h</li>
                        <li>Samedi: 10h - 20h</li>
                        <li>Dimanche: 10h - 18h</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 BibliothèqueNuxt. Tous droits réservés.</p>
            </div>
        </footer>

        <el-dialog v-model="showLoginModal" title="Connexion" width="30%">
            <el-form>
                <el-form-item label="Email">
                    <el-input
                        v-model="loginForm.email"
                        placeholder="Votre email"
                    ></el-input>
                </el-form-item>
                <el-form-item label="Mot de passe">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="Votre mot de passe"
                    ></el-input>
                </el-form-item>
                <div class="form-footer">
                    <a href="#" class="forgot-password">Mot de passe oublié?</a>
                    <a href="#" class="register-link">Créer un compte</a>
                </div>
                <el-form-item>
                    <el-button type="primary" @click="login"
                        >Se connecter</el-button
                    >
                    <el-button @click="showLoginModal = false"
                        >Annuler</el-button
                    >
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog
            v-model="showBookModal"
            :title="selectedBook ? selectedBook.title : ''"
            width="50%"
        >
            <div class="book-details" v-if="selectedBook">
                <div class="book-details-content">
                    <div
                        class="book-details-cover"
                        :style="{
                            backgroundImage: `url(${selectedBook.coverUrl})`
                        }"
                    ></div>
                    <div class="book-details-info">
                        <h2>{{ selectedBook.title }}</h2>
                        <p class="book-author">Par {{ selectedBook.author }}</p>
                        <div class="book-rating">
                            <el-rate v-model="selectedBook.rating" disabled />
                            <span class="rating-text"
                                >{{ selectedBook.rating }} sur 5</span
                            >
                        </div>
                        <div class="book-status">
                            <span class="status-label">Statut:</span>
                            <span
                                class="status-value"
                                :class="{ available: selectedBook.available }"
                            >
                                {{
                                    selectedBook.available
                                        ? 'Disponible'
                                        : 'Indisponible'
                                }}
                            </span>
                        </div>
                        <p class="book-description">
                            {{
                                selectedBook.description ||
                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
                            }}
                        </p>
                        <div class="book-meta">
                            <div class="meta-item">
                                <span class="meta-label">Catégorie:</span>
                                <span class="meta-value">{{
                                    selectedBook.category || 'Fiction'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Pages:</span>
                                <span class="meta-value">{{
                                    selectedBook.pages || '256'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Année:</span>
                                <span class="meta-value">{{
                                    selectedBook.year || '2020'
                                }}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">ISBN:</span>
                                <span class="meta-value">{{
                                    selectedBook.isbn || '978-3-16-148410-0'
                                }}</span>
                            </div>
                        </div>
                        <div class="book-actions">
                            <el-button
                                type="primary"
                                :disabled="!selectedBook.available"
                                >Réserver</el-button
                            >
                            <el-button>Ajouter aux favoris</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    Search,
    ArrowLeft,
    ArrowRight,
    Calendar,
    Reading,
    ChatLineRound
} from '@element-plus/icons-vue';

const searchQuery = ref('');
const showLoginModal = ref(false);
const showBookModal = ref(false);
const selectedBook = ref(null);
const newsletterEmail = ref('');
const loginForm = ref({
    email: '',
    password: ''
});

const activeIndex = ref('1');

const sampleBooks = [
    {
        id: 1,
        title: "L'Étranger",
        author: 'Albert Camus',
        rating: 4.5,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Roman philosophique',
        pages: 185,
        year: 1942,
        isbn: '978-2-07-036002-4',
        description:
            "L'Étranger est un roman d'Albert Camus, publié en 1942. Il prend place dans la tétralogie que Camus nommera « cycle de l'absurde » qui décrit les fondements de la philosophie camusienne : l'absurde."
    },
    {
        id: 2,
        title: 'Harry Potter et la pierre philosophale',
        author: 'J.K. Rowling',
        rating: 4.8,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Fantasy',
        pages: 320,
        year: 1997,
        isbn: '978-2-07-054602-9'
    },
    {
        id: 3,
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        rating: 4.9,
        coverUrl: '/api/placeholder/150/220',
        available: false,
        category: 'Conte philosophique',
        pages: 96,
        year: 1943,
        isbn: '978-2-07-051328-4'
    },
    {
        id: 4,
        title: '1984',
        author: 'George Orwell',
        rating: 4.7,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Science-fiction',
        pages: 328,
        year: 1949,
        isbn: '978-2-07-036822-8'
    },
    {
        id: 5,
        title: 'Les Misérables',
        author: 'Victor Hugo',
        rating: 4.6,
        coverUrl: '/api/placeholder/150/220',
        available: false,
        category: 'Roman historique',
        pages: 1900,
        year: 1862,
        isbn: '978-2-253-09634-8'
    },
    {
        id: 6,
        title: 'Dune',
        author: 'Frank Herbert',
        rating: 4.7,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Science-fiction',
        pages: 912,
        year: 1965,
        isbn: '978-2-221-50277-9'
    },
    {
        id: 7,
        title: 'Le Comte de Monte-Cristo',
        author: 'Alexandre Dumas',
        rating: 4.8,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: "Roman d'aventure",
        pages: 1088,
        year: 1844,
        isbn: '978-2-253-09890-8'
    }
];

const categories = ref([
    {
        title: 'Dernières acquisitions',
        books: [...sampleBooks].sort(() => 0.5 - Math.random())
    },
    {
        title: 'Les mieux notés',
        books: [...sampleBooks].sort((a, b) => b.rating - a.rating)
    },
    {
        title: 'Classiques de la littérature',
        books: [...sampleBooks].filter((book) =>
            [
                'Victor Hugo',
                'Albert Camus',
                'Antoine de Saint-Exupéry',
                'Alexandre Dumas'
            ].includes(book.author)
        )
    }
]);

const querySearch = (queryString, cb) => {
    const results = queryString
        ? sampleBooks.filter((book) => {
              return (
                  book.title
                      .toLowerCase()
                      .includes(queryString.toLowerCase()) ||
                  book.author.toLowerCase().includes(queryString.toLowerCase())
              );
          })
        : [];
    cb(results.map((book) => ({ value: book.title, book })));
};

const sliderPositions = ref([]);
const itemWidth = ref(200);
const gapWidth = ref(16);
const visibleItems = ref(4);

onMounted(() => {
    sliderPositions.value = categories.value.map(() => 0);
    updateItemWidth();
    window.addEventListener('resize', updateItemWidth);
});

const updateItemWidth = () => {
    const width = window.innerWidth;
    if (width < 768) {
        itemWidth.value = 150;
        visibleItems.value = 2;
    } else if (width < 1024) {
        itemWidth.value = 180;
        visibleItems.value = 3;
    } else {
        itemWidth.value = 200;
        visibleItems.value = 5;
    }
};

const slideLeft = (categoryIndex) => {
    const newPosition = Math.max(
        0,
        sliderPositions.value[categoryIndex] - slideStep()
    );
    sliderPositions.value[categoryIndex] = newPosition;
};

const slideRight = (categoryIndex) => {
    const categoryBooks = categories.value[categoryIndex].books.length;
    const newPosition = Math.min(
        maxSlidePosition(categoryBooks),
        sliderPositions.value[categoryIndex] + slideStep()
    );
    sliderPositions.value[categoryIndex] = newPosition;
};

const slideStep = () => {
    return itemWidth.value + gapWidth.value;
};

const maxSlidePosition = (booksCount) => {
    const totalWidth = booksCount * (itemWidth.value + gapWidth.value);
    const visibleWidth =
        visibleItems.value * (itemWidth.value + gapWidth.value);
    return Math.max(0, totalWidth - visibleWidth);
};

const login = () => {
    showLoginModal.value = false;
};

const showBookDetails = (book) => {
    selectedBook.value = book;
    showBookModal.value = true;
};

const reserveBook = (book) => {
    if (book.available) {
        // Logique de réservation
        alert(`Livre "${book.title}" réservé avec succès!`);
    }
};
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

/* Hero Section */
.hero-section {
    height: 70vh;
    position: relative;
    background-image: url('../public/photo.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 40px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7));
    z-index: 1;
}

.hero-content {
    text-align: center;
    z-index: 2;
    max-width: 800px;
    padding: 0 20px;
}

.main-title {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-weight: 300;
}

.cta-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
}

/* Features Section */
.features-section {
    display: flex;
    justify-content: space-between;
    padding: 0 30px 40px;
    max-width: 70vw;
    margin: 0 auto;
    gap: 20px;
}

.feature-card {
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
    margin: 16px 0 8px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e88e5;
}

.feature-card p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
}

.feature-card .el-icon {
    color: #1e88e5;
}

/* Main Content */
.content {
    padding: 0 30px 40px;
    max-width: 70vw;
    margin: 0 auto;
    width: 100%;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.category-section {
    margin-bottom: 50px;
}

.category-section h2 {
    color: #333;
    margin-bottom: 8px;
    font-size: 1.75rem;
    font-weight: 700;
}

/* Netflix-style Slider */
.netflix-slider {
    position: relative;
    margin-bottom: 40px;
}

.slider-container {
    width: 100%;
    overflow: hidden;
    padding: 10px 0;
}

.slider-content {
    display: flex;
    transition: transform 0.5s ease;
}

.slider-controls {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
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
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.netflix-slider:hover .slider-arrow {
    opacity: 1;
}

.slider-arrow.prev {
    left: -22px;
}

.slider-arrow.next {
    right: -22px;
}

.slider-arrow:hover {
    background-color: #1976d2;
    transform: translateY(-50%) scale(1.05);
}

.slider-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background-color: #ccc;
}

/* Book Card */
.book-card {
    flex: 0 0 auto;
    width: 200px;
    margin-right: 16px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    cursor: pointer;
}

.book-card:hover {
    transform: translateY(-8px) scale(1.03);
    z-index: 1;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
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
    color: #333;
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

/* Stats Section */
.stats-section {
    margin: 60px 0;
    text-align: center;
    padding: 40px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats-section h2 {
    font-size: 1.75rem;
    margin-bottom: 30px;
    font-weight: 700;
    color: #333;
}

.stats-container {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px;
}

.stat-item {
    padding: 20px;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e88e5;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 1rem;
    color: #666;
}

/* Newsletter Section */
.newsletter-section {
    margin: 60px 0;
    padding: 60px 20px;
    background-color: #1e88e5;
    border-radius: 8px;
    color: white;
}

.newsletter-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.newsletter-section h2 {
    font-size: 1.75rem;
    margin-bottom: 16px;
    font-weight: 700;
}

.newsletter-section p {
    margin-bottom: 24px;
    font-size: 1rem;
    line-height: 1.6;
}

.newsletter-form {
    display: flex;
    gap: 10px;
}

.newsletter-form .el-input {
    flex: 1;
}

/* Footer */
.site-footer {
    background-color: #263238;
    color: #fff;
    padding: 60px 30px 20px;
    margin-top: auto;
}

.footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    gap: 40px;
}

.footer-section {
    flex: 1;
    min-width: 200px;
}

.footer-section h3 {
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 20px;
    position: relative;
    padding-bottom: 12px;
}

.footer-section h3:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background-color: #1e88e5;
}

.footer-section p {
    color: #b0bec5;
    line-height: 1.6;
    margin-bottom: 20px;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-links li {
    margin-bottom: 10px;
}

.footer-links a {
    color: #b0bec5;
    text-decoration: none;
    transition: color 0.3s;
}

.footer-links a:hover {
    color: #1e88e5;
}

address {
    font-style: normal;
    color: #b0bec5;
    line-height: 1.6;
}

.hours-list {
    list-style: none;
    padding: 0;
    margin: 0;
    color: #b0bec5;
}

.hours-list li {
    margin-bottom: 8px;
}

.footer-bottom {
    text-align: center;
    padding-top: 30px;
    margin-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #b0bec5;
}

/* Login Modal */
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

/* Book Details Modal */
.book-details {
    padding: 10px;
}

.book-details-content {
    display: flex;
    gap: 30px;
}

.book-details-cover {
    width: 200px;
    height: 300px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
}

.book-details-info {
    flex: 1;
}

.book-details-info h2 {
    font-size: 1.5rem;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.book-author {
    color: #666;
    margin-bottom: 12px;
    font-size: 1rem;
}

.book-rating {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.rating-text {
    margin-left: 10px;
    color: #666;
}

.book-status {
    margin-bottom: 16px;
    font-size: 0.95rem;
}

.status-label {
    font-weight: 600;
    margin-right: 5px;
}

.status-value {
    color: #f44336;
}

.status-value.available {
    color: #4caf50;
}

.book-description {
    line-height: 1.6;
    margin-bottom: 24px;
    color: #333;
}

.book-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}

.meta-item {
    font-size: 0.9rem;
}

.meta-label {
    font-weight: 600;
    margin-right: 5px;
    color: #666;
}

.book-actions {
    display: flex;
    gap: 12px;
}

/* Responsive Styles */
@media (max-width: 1024px) {
    .features-section {
        flex-direction: column;
        max-width: 600px;
    }

    .book-card {
        width: 180px;
    }

    .book-cover {
        height: 240px;
    }

    .footer-content {
        flex-direction: column;
        gap: 30px;
    }

    .slider-arrow.prev {
        left: 10px;
    }

    .slider-arrow.next {
        right: 10px;
    }

    .book-details-content {
        flex-direction: column;
        align-items: center;
    }

    .book-details-info {
        text-align: center;
    }

    .book-meta {
        grid-template-columns: 1fr;
    }

    .newsletter-form {
        flex-direction: column;
    }
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

    .main-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .cta-buttons {
        flex-direction: column;
    }

    .stats-container {
        grid-template-columns: 1fr 1fr;
    }

    .book-card {
        width: 150px;
        margin-right: 12px;
    }

    .book-cover {
        height: 180px;
    }
}
</style>
