<template>
    <div class="library-app">
        <Navbar
            v-model:search-query="searchQuery"
            :querySearch="querySearch"
            @showLogin="showLoginModal = true"
        />

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
                            <el-button
                                @click="addToFavorites"
                                :icon="Star"
                                class="favorite-button"
                                :class="{ 'is-favorite': isFavorite }"
                            >
                                {{
                                    isFavorite
                                        ? 'Retiré des favoris'
                                        : 'Ajouter aux favoris'
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
                                ({{ randomAvailableCount }} exemplaires
                                disponibles)
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
                            <el-button
                                @click="addToFavorites"
                                :icon="Star"
                                class="favorite-button"
                                :class="{ 'is-favorite': isFavorite }"
                            >
                                {{
                                    isFavorite
                                        ? 'Retiré des favoris'
                                        : 'Ajouter aux favoris'
                                }}
                            </el-button>
                            <el-button
                                @click="shareBook"
                                :icon="Share"
                                class="share-button"
                            >
                                Partager
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

        <Footer />

        <!-- Modals -->
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
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import {
    Star,
    StarFilled,
    Calendar,
    ArrowLeft,
    ArrowRight,
    Document,
    User,
    Reading,
    Message,
    Link,
    Share,
    Notification
} from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import Navbar from '~/components/layouts/Navbar.vue';
import Footer from '~/components/layouts/Footer.vue';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

// Définir les options pour le composant
defineOptions({
    name: 'BookDetailsPage'
});

// Récupération de l'ID du livre depuis l'URL
const route = useRoute();
const router = useRouter();
const bookId = parseInt(route.params.id);

// État pour les modales et formulaires
const searchQuery = ref('');
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);
const showShareDialog = ref(false);
const isFavorite = ref(false);
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

// Données de livres (simulées, à remplacer par un appel API)
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
        language: 'Français',
        publisher: 'Éditions Gallimard',
        description:
            "L'Étranger est un roman d'Albert Camus, publié en 1942. Il prend place dans la tétralogie que Camus nommera « cycle de l'absurde » qui décrit les fondements de la philosophie camusienne : l'absurde. Ce roman met en scène un personnage indifférent à la société dans laquelle il vit, refusant de jouer le jeu et de mentir. Meursault, le personnage principal, refuse de simuler des sentiments et des émotions. Lorsqu'il se rend à l'enterrement de sa mère, il n'exprime ni tristesse ni chagrin."
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
        isbn: '978-2-07-054602-9',
        language: 'Français',
        publisher: 'Éditions Gallimard Jeunesse',
        description:
            "Le jour de ses onze ans, Harry Potter, un orphelin élevé par un oncle et une tante qui le détestent, voit son existence bouleversée. Un géant vient le chercher pour l'emmener à Poudlard, une école de sorcellerie! Voler en balai, jeter des sorts, combattre les trolls : Harry se révèle un sorcier doué. Mais un mystère entoure sa naissance et l'univers qu'il découvre est menacé par le retour de Voldemort, le mage noir dont personne ne doit prononcer le nom."
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
        isbn: '978-2-07-051328-4',
        language: 'Français',
        publisher: 'Éditions Gallimard',
        description:
            "Le narrateur, un aviateur, tombe en panne dans le désert du Sahara. Alors qu'il tente de réparer son avion, un petit garçon apparaît et lui demande de dessiner un mouton. Au fil des jours, le narrateur découvre l'histoire du Petit Prince qui vient d'une autre planète, l'astéroïde B 612, où il a laissé une rose. Avant d'arriver sur Terre, il a visité plusieurs autres planètes et rencontré des personnages symboliques. À travers ce conte poétique, Saint-Exupéry nous livre une réflexion profonde sur les relations humaines, l'amitié et le sens de la vie."
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
        isbn: '978-2-07-036822-8',
        language: 'Français',
        publisher: 'Éditions Gallimard',
        description:
            "Dans une Angleterre uchronique de 1984, le monde est divisé en trois grands blocs, constamment en guerre les uns contre les autres. À Londres, capitale de l'Océania, Winston Smith, employé au Commissariat aux Archives du Ministère de la Vérité, est chargé de réécrire l'Histoire. Dans cette société totalitaire dominée par Big Brother, la moindre pensée déviante est un crime. Mais Winston commence à tenir un journal intime, première étape d'une rébellion vouée à l'échec. Une dystopie glaçante sur les dérives du totalitarisme, qui n'a rien perdu de sa pertinence."
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
        isbn: '978-2-253-09634-8',
        language: 'Français',
        publisher: 'Le Livre de Poche',
        description:
            "Le destin de Jean Valjean, forçat libéré après dix-neuf ans de bagne pour avoir volé un pain, est au centre de ce roman monumental. Poursuivi par l'inspecteur Javert, il tentera de se racheter et deviendra tour à tour industriel, maire, puis père adoptif de Cosette. À travers cette fresque sociale et historique de la France du XIXe siècle, Victor Hugo dénonce la misère, l'ignorance et trace un tableau saisissant d'une époque troublée, des barricades de 1832 à la révolution de 1848."
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
        isbn: '978-2-221-50277-9',
        language: 'Français',
        publisher: 'Robert Laffont',
        description:
            "Sur la planète désertique Arrakis, aussi nommée Dune, le duc Leto Atréides reçoit en fief l'exploitation de l'épice, une substance aux propriétés uniques. Précieuse et convoitée, elle assure longévité et don de prescience. Mais l'attribution de ce fief est un piège tendu par l'empereur et les Harkonnens. Paul, fils du duc, échappe au massacre et se réfugie dans le désert avec sa mère. Recueilli par les Fremen, il deviendra leur chef religieux et conduira la révolte contre l'oppresseur. Chef-d'œuvre absolu de la science-fiction, Dune est un roman d'aventure, une réflexion politique et écologique."
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
        isbn: '978-2-253-09890-8',
        language: 'Français',
        publisher: 'Le Livre de Poche',
        description:
            "En 1815, Edmond Dantès, jeune marin de dix-neuf ans, débarque à Marseille pour y épouser sa fiancée Mercédès. Trois hommes jaloux de son bonheur, Danglars, Fernand et Caderousse, le dénoncent comme conspirateur bonapartiste. L'ambitieux procureur du roi, Villefort, le fait enfermer au château d'If. Après quatorze années de captivité, Dantès s'évade, découvre le trésor de l'île de Monte-Cristo et devient riche et puissant. Sous l'identité du comte de Monte-Cristo, il entreprend alors de se venger méthodiquement de ceux qui l'ont trahi."
    },
    // Livres additionnels pour enrichir les recommandations
    {
        id: 8,
        title: 'La Peste',
        author: 'Albert Camus',
        rating: 4.6,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Roman philosophique',
        pages: 336,
        year: 1947,
        isbn: '978-2-07-036042-0',
        language: 'Français',
        publisher: 'Éditions Gallimard',
        description:
            "Dans la ville d'Oran, soudain isolée du reste du monde par la peste et soumise à la loi impitoyable de la maladie, La Peste déroule le combat des hommes contre l'absurde, représenté ici sous la forme du fléau. C'est aussi une réflexion sur le mal et une référence à la montée des fascismes et à l'occupation allemande."
    },
    {
        id: 9,
        title: 'Le Mythe de Sisyphe',
        author: 'Albert Camus',
        rating: 4.4,
        coverUrl: '/api/placeholder/150/220',
        available: false,
        category: 'Essai philosophique',
        pages: 186,
        year: 1942,
        isbn: '978-2-07-032288-6',
        language: 'Français',
        publisher: 'Éditions Gallimard',
        description:
            "Dans cet essai philosophique, Camus développe sa philosophie de l'absurde. Il y présente le sentiment de l'absurdité de la condition humaine, examine les solutions proposées par d'autres philosophes et conclut par sa propre vision, où l'homme doit assumer l'absurde et se révolter contre lui."
    },
    {
        id: 10,
        title: 'Notre-Dame de Paris',
        author: 'Victor Hugo',
        rating: 4.5,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Roman historique',
        pages: 624,
        year: 1831,
        isbn: '978-2-253-00340-6',
        language: 'Français',
        publisher: 'Le Livre de Poche',
        description:
            "En 1482, Quasimodo, le sonneur de cloches bossu de Notre-Dame, s'éprend de la belle bohémienne Esmeralda. Mais l'archidiacre Claude Frollo, qui a recueilli et élevé Quasimodo, est lui aussi amoureux de la jeune femme. À travers cette histoire tragique, Victor Hugo livre un vibrant plaidoyer en faveur de la protection du patrimoine architectural médiéval et met en scène tout un peuple dans le Paris du XVe siècle."
    },
    {
        id: 11,
        title: 'Harry Potter et la Chambre des Secrets',
        author: 'J.K. Rowling',
        rating: 4.7,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Fantasy',
        pages: 368,
        year: 1998,
        isbn: '978-2-07-054603-6',
        language: 'Français',
        publisher: 'Éditions Gallimard Jeunesse',
        description:
            "Une rentrée fracassante en voiture volante, une étrange malédiction qui s'abat sur les élèves, cette deuxième année à l'école des sorciers ne s'annonce pas de tout repos! Entre les cours de potions magiques, les matches de Quidditch et les combats de mauvais sorts, Harry et ses amis Ron et Hermione trouveront-ils le temps de percer le mystère de la Chambre des Secrets?"
    },
    {
        id: 12,
        title: "Le Seigneur des Anneaux : La Communauté de l'Anneau",
        author: 'J.R.R. Tolkien',
        rating: 4.8,
        coverUrl: '/api/placeholder/150/220',
        available: true,
        category: 'Fantasy',
        pages: 704,
        year: 1954,
        isbn: '978-2-267-01901-7',
        language: 'Français',
        publisher: 'Christian Bourgois',
        description:
            "Dans ce premier tome de la trilogie, Frodon Sacquet hérite d'un anneau. Mais ce n'est pas un anneau ordinaire. C'est l'Anneau Unique, instrument de pouvoir absolu qui permettrait à Sauron, le Seigneur des ténèbres, de régner sur la Terre du Milieu. Frodon doit détruire l'Anneau en le jetant dans les flammes de la Montagne du Destin où il a été forgé."
    }
];

// Variables aléatoires pour l'expérience utilisateur
const randomReviewCount = ref(Math.floor(Math.random() * 500) + 50);
const randomAvailableCount = ref(Math.floor(Math.random() * 5) + 1);
const expectedReturnDate = ref(getRandomFutureDate());

// Recherche du livre avec l'ID correspondant
const book = ref(null);

// Variables pour les différents carousels
const relatedBooksPosition = ref(0);
const authorBooksPosition = ref(0);
const trendingBooksPosition = ref(0);
const bookItemWidth = 220;
const bookGap = 20;
const visibleItems = ref(4);

// Calcul du nombre de livres visibles en fonction de la taille de l'écran
onMounted(() => {
    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
});

// Nettoyage à la destruction du composant
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateVisibleItems);
});

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

// Calcul de la position maximale pour les carousels
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
    if (!book.value) return [];

    return sampleBooks
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
    if (!book.value) return [];

    return sampleBooks
        .filter((b) => b.id !== book.value.id && b.author === book.value.author)
        .slice(0, 6);
});

// Livres populaires en ce moment (simulés)
const trendingBooks = computed(() => {
    // Pour la démonstration, nous prenons les livres les mieux notés
    return [...sampleBooks]
        .sort((a, b) => b.rating - a.rating)
        .filter((b) => b.id !== book.value?.id)
        .slice(0, 6);
});

// Fonction pour effectuer une recherche de livres
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

// Chargement du livre lors du montage du composant
onMounted(() => {
    // Simulation d'une requête API
    setTimeout(() => {
        book.value = sampleBooks.find((book) => book.id === bookId) || null;

        if (!book.value) {
            // Redirection si le livre n'existe pas
            router.push('/');
            ElNotification({
                title: 'Livre non trouvé',
                message:
                    "Le livre demandé n'existe pas dans notre bibliothèque.",
                type: 'error'
            });
        }

        // Mettre à jour le titre de la page
        if (book.value) {
            useHead({
                title: `${book.value.title} - BibliothèqueNuxt`
            });
        }
    }, 800);
});

// Fonctions pour les actions utilisateurs
const reserveBook = () => {
    if (!book.value?.available) {
        ElNotification({
            title: 'Non disponible',
            message: "Ce livre n'est pas disponible actuellement.",
            type: 'warning'
        });
        return;
    }

    if (!isUserLoggedIn()) {
        showLoginModal.value = true;
        ElNotification({
            title: 'Connexion requise',
            message: 'Veuillez vous connecter pour réserver un livre.',
            type: 'info'
        });
        return;
    }

    ElNotification({
        title: 'Réservation confirmée',
        message: `Livre "${book.value.title}" réservé avec succès!`,
        type: 'success',
        duration: 5000
    });
};

const addToFavorites = () => {
    if (!isUserLoggedIn()) {
        showLoginModal.value = true;
        ElNotification({
            title: 'Connexion requise',
            message:
                'Veuillez vous connecter pour ajouter un livre à vos favoris.',
            type: 'info'
        });
        return;
    }

    isFavorite.value = !isFavorite.value;

    ElNotification({
        title: isFavorite.value ? 'Ajouté aux favoris' : 'Retiré des favoris',
        message: isFavorite.value
            ? `"${book.value.title}" a été ajouté à vos favoris`
            : `"${book.value.title}" a été retiré de vos favoris`,
        type: 'success'
    });
};

const shareBook = () => {
    showShareDialog.value = true;
};

const copyLink = () => {
    // Simulation de la copie du lien
    navigator.clipboard.writeText(window.location.href).then(() => {
        ElNotification({
            title: 'Lien copié',
            message: 'Le lien du livre a été copié dans le presse-papier.',
            type: 'success'
        });
        showShareDialog.value = false;
    });
};

// Fonctions d'authentification simulées
const isUserLoggedIn = () => {
    // Simulation - à remplacer par une vraie vérification d'authentification
    return false; // Pour tester le flux de connexion
};

const login = () => {
    showLoginModal.value = false;
    // Rediriger vers la page précédente ou continuer l'action
    ElNotification({
        title: 'Connecté',
        message: 'Vous êtes maintenant connecté.',
        type: 'success'
    });
};

const handleRegister = () => {
    showRegisterModal.value = false;
    ElNotification({
        title: 'Compte créé',
        message: 'Votre compte a été créé avec succès.',
        type: 'success'
    });
};

const handleResetPasswordRequest = (email) => {
    ElNotification({
        title: 'Email envoyé',
        message:
            'Un lien de réinitialisation a été envoyé à votre adresse email.',
        type: 'success'
    });
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
