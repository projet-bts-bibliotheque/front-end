<template>
    <div class="library-app">
        <Navbar
            v-model:search-query="searchQuery"
            :querySearch="querySearch"
            @showLogin="showLoginModal = true"
        />

        <HeroSection />

        <FeaturesSection />

        <main class="content">
            <section
                v-for="(category, index) in categories"
                :key="index"
                class="category-section"
            >
                <div class="section-header">
                    <h2>{{ category.title }}</h2>
                    <el-button text type="primary">
                        Voir tout <el-icon><ArrowRight /></el-icon>
                    </el-button>
                </div>
                <BookSlider
                    :books="category.books"
                    :categoryIndex="index"
                    :sliderPosition="sliderPositions[index]"
                    @slideLeft="slideLeft(index)"
                    @slideRight="slideRight(index)"
                    @showBookDetails="showBookDetails"
                    @reserveBook="reserveBook"
                />
            </section>

            <StatsSection />

            <NewsletterSection v-model:newsletterEmail="newsletterEmail" />
        </main>

        <Footer />

        <LoginModal
            v-model:show="showLoginModal"
            v-model:loginForm="loginForm"
            @login="login"
        />

        <BookDetailModal v-model:show="showBookModal" :book="selectedBook" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import Navbar from '~/components/layouts/Navbar.vue';
import HeroSection from '~/components/home/HeroSection.vue';
import FeaturesSection from '~/components/home/FeaturesSection.vue';
import BookSlider from '~/components/home/BookSlider.vue';
import StatsSection from '~/components/home/StatsSection.vue';
import NewsletterSection from '~/components/home/NewsletterSection.vue';
import Footer from '~/components/layouts/Footer.vue';
import LoginModal from '~/components/modals/LoginModal.vue';
import BookDetailModal from '../components/modals/BookDetailModal.vue';

// État et données
const searchQuery = ref('');
const showLoginModal = ref(false);
const showBookModal = ref(false);
const selectedBook = ref(null);
const newsletterEmail = ref('');
const loginForm = ref({
    email: '',
    password: ''
});

// Données de livres
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

// Catégories
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

// Configuration du slider
const sliderPositions = ref([]);
const itemWidth = ref(200);
const gapWidth = ref(16);
const visibleItems = ref(4);

onMounted(() => {
    sliderPositions.value = categories.value.map(() => 0);
    updateItemWidth();
    window.addEventListener('resize', updateItemWidth);
});

// Fonction de recherche
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

// Fonctions de slider
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

const slideStep = () => {
    return itemWidth.value + gapWidth.value;
};

const maxSlidePosition = (booksCount) => {
    const totalWidth = booksCount * (itemWidth.value + gapWidth.value);
    const visibleWidth =
        visibleItems.value * (itemWidth.value + gapWidth.value);
    return Math.max(0, totalWidth - visibleWidth);
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

// Handlers
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

/* Responsive Styles */
@media (max-width: 1024px) {
    .content {
        max-width: 90vw;
    }
}

@media (max-width: 768px) {
    .content {
        padding: 0 15px 30px;
    }
}
</style>
