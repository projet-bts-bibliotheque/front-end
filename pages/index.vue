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
                    :itemWidth="itemWidth"
                    :gapWidth="gapWidth"
                    :visibleItems="visibleItems"
                    @slideLeft="slideLeft(index)"
                    @slideRight="slideRight(index)"
                    @reserveBook="reserveBook"
                    @maxPositionChange="updateMaxPosition"
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
    name: 'LibraryIndex'
});
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import Navbar from '~/components/layouts/Navbar.vue';
import HeroSection from '~/components/home/HeroSection.vue';
import FeaturesSection from '~/components/home/FeaturesSection.vue';
import BookSlider from '~/components/home/BookSlider.vue';
import StatsSection from '~/components/home/StatsSection.vue';
import NewsletterSection from '~/components/home/NewsletterSection.vue';
import Footer from '~/components/layouts/Footer.vue';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

// États UI pour les modales et les formulaires
const searchQuery = ref('');
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);
const newsletterEmail = ref('');
const loginForm = ref({
    email: '',
    password: ''
});

const registerForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    acceptTerms: false
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

// Configuration des catégories de livres
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

// Configuration et état du slider
const sliderPositions = ref([]);
const maxPositions = ref([]);
const itemWidth = ref(200);
const gapWidth = ref(16);
const visibleItems = ref(4);

/**
 * Initialise les positions des sliders et configure les dimensions responsives
 * @returns {void}
 */
onMounted(() => {
    sliderPositions.value = categories.value.map(() => 0);
    maxPositions.value = categories.value.map(() => 0);
    updateItemWidth();
    window.addEventListener('resize', updateItemWidth);
});

/**
 * Nettoie les listeners d'événements avant le démontage du composant
 * @returns {void}
 */
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateItemWidth);
});

/**
 * Effectue une recherche de livres en fonction d'une chaîne de requête
 * @param {string} queryString - La chaîne de caractères à rechercher
 * @param {Function} cb - Fonction de callback qui recevra les résultats
 * @returns {void}
 */
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
    // Format uniforme pour les résultats de suggestion
    cb(results.map((book) => ({ value: book.title, book })));
};

/**
 * Met à jour la largeur des éléments et le nombre d'éléments visibles
 * @returns {void}
 */
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

/**
 * Met à jour la position maximale pour un slider de catégorie spécifique
 * @param {Object} params - Paramètres de mise à jour
 * @param {Number} params.categoryIndex - Index de la catégorie à mettre à jour
 * @param {Number} params.maxPosition - Position maximale calculée pour ce slider
 * @returns {void}
 */
const updateMaxPosition = ({ categoryIndex, maxPosition }) => {
    maxPositions.value[categoryIndex] = maxPosition;
};

/**
 * Calcule la distance de déplacement pour chaque clic sur les boutons du slider
 * @returns {Number} La taille totale d'un élément (largeur + écart)
 */
const slideStep = () => {
    return itemWidth.value + gapWidth.value;
};

/**
 * Déplace le slider vers la gauche pour une catégorie spécifique
 * @param {Number} categoryIndex - Index de la catégorie à faire défiler
 * @returns {void}
 */
const slideLeft = (categoryIndex) => {
    const newPosition = Math.max(
        0,
        sliderPositions.value[categoryIndex] - slideStep()
    );
    sliderPositions.value[categoryIndex] = newPosition;
};

/**
 * Déplace le slider vers la droite pour une catégorie spécifique
 * @param {Number} categoryIndex - Index de la catégorie à faire défiler
 * @returns {void}
 */
const slideRight = (categoryIndex) => {
    const newPosition = Math.min(
        maxPositions.value[categoryIndex],
        sliderPositions.value[categoryIndex] + slideStep()
    );
    sliderPositions.value[categoryIndex] = newPosition;
};

/**
 * Gère l'action de connexion utilisateur et ferme la modal de connexion
 * @returns {void}
 */
const login = () => {
    showLoginModal.value = false;
};

/**
 * Traite une demande de réinitialisation de mot de passe
 * @param {string} email - Adresse email pour laquelle réinitialiser le mot de passe
 * @returns {void}
 */
const handleResetPasswordRequest = (email) => {
    console.log('Demande de réinitialisation du mot de passe pour:', email);
    // Logique d'envoi d'email de réinitialisation...

    ElNotification({
        title: 'Email envoyé',
        message:
            'Un lien de réinitialisation a été envoyé à votre adresse email.',
        type: 'success'
    });
};

/**
 * Gère l'enregistrement d'un nouvel utilisateur et ferme la modal d'inscription
 * @returns {void}
 */
const handleRegister = () => {
    showRegisterModal.value = false;
};

/**
 * Gère la réservation d'un livre si celui-ci est disponible
 * @param {Object} book - Le livre à réserver
 * @returns {void}
 */
const reserveBook = (book) => {
    if (book.available) {
        // Logique de réservation
        ElNotification({
            title: 'Réservation confirmée',
            message: `Livre "${book.title}" réservé avec succès!`,
            type: 'success'
        });
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
