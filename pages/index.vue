<template>
    <div class="library-app">
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
    </div>
</template>

<script setup>
defineOptions({
    name: 'LibraryIndex'
});
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import HeroSection from '~/components/home/HeroSection.vue';
import FeaturesSection from '~/components/home/FeaturesSection.vue';
import BookSlider from '~/components/home/BookSlider.vue';
import StatsSection from '~/components/home/StatsSection.vue';
import NewsletterSection from '~/components/home/NewsletterSection.vue';

// États UI pour les modales et les formulaires
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const newsletterEmail = ref('');

// États pour les données
const isLoading = ref(true);
const allBooks = ref([]);
const authors = ref([]);

// Variables pour la réservation
const showReservationModal = ref(false);
const showConfirmationModal = ref(false);
const selectedRoom = ref(null);
const reservationId = ref('');
const isSubmitting = ref(false);
const reservationFormRef = ref(null);
const reservationForm = ref({
    date: new Date(),
    timeSlot: '',
    participants: 1,
    purpose: '',
    comment: '',
    acceptTerms: false
});

// Configuration des catégories de livres (initialement vides)
const categories = ref([
    {
        title: 'Dernières acquisitions',
        books: []
    },
    {
        title: 'Les mieux notés',
        books: []
    },
    {
        title: 'Classiques de la littérature',
        books: []
    }
]);

// Configuration et état du slider
const sliderPositions = ref([]);
const maxPositions = ref([]);
const itemWidth = ref(200);
const gapWidth = ref(16);
const visibleItems = ref(4);

/**
 * Charge les livres depuis l'API et les organise par catégories
 */
const loadBooksData = async () => {
    try {
        isLoading.value = true;

        // Importer le service API
        const api = (await import('@/services/api')).default;

        // Récupérer les livres, auteurs et réservations
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

        // Transformer les données pour notre interface
        allBooks.value = booksData.map((bookItem) => {
            const author = authorsData.find((a) => a.id === bookItem.author);

            return {
                id: bookItem.isbn,
                isbn: bookItem.isbn,
                title: bookItem.title,
                author: author
                    ? `${author.firstname} ${author.lastname}`
                    : 'Auteur inconnu',
                rating: bookItem.average_rating || 0,
                coverUrl: bookItem.thumbnail || '/api/placeholder/300/450',
                available: !borrowedBooks.includes(bookItem.isbn),
                category: Array.isArray(bookItem.keywords)
                    ? bookItem.keywords[0] || 'non-catégorisé'
                    : bookItem.keywords || 'non-catégorisé',
                pages: bookItem.pages || 0,
                year: bookItem.publish_year || 2020,
                description: bookItem.summary || 'Description non disponible.',
                publisher: 'Éditions Gallimard',
                language: 'Français'
            };
        });

        // Organiser les livres par catégories
        organizeBooksIntoCategories();
    } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
        ElNotification({
            title: 'Erreur',
            message:
                'Impossible de charger les livres. Veuillez réessayer plus tard.',
            type: 'error'
        });

        // En cas d'erreur, utiliser des tableaux vides
        allBooks.value = [];
        organizeBooksIntoCategories();
    } finally {
        isLoading.value = false;
    }
};

/**
 * Organise les livres chargés dans les différentes catégories
 */
const organizeBooksIntoCategories = () => {
    if (allBooks.value.length === 0) {
        // Si pas de livres, laisser les tableaux vides
        categories.value = [
            { title: 'Dernières acquisitions', books: [] },
            { title: 'Les mieux notés', books: [] },
            { title: 'Classiques de la littérature', books: [] }
        ];
        return;
    }

    // Mélanger les livres pour les dernières acquisitions (simuler de nouveaux livres)
    const shuffledBooks = [...allBooks.value].sort(() => 0.5 - Math.random());

    // Trier par note pour les mieux notés
    const topRatedBooks = [...allBooks.value]
        .filter((book) => book.rating > 0)
        .sort((a, b) => b.rating - a.rating);

    // Filtrer les classiques (auteurs classiques français)
    const classicAuthors = [
        'Victor Hugo',
        'Albert Camus',
        'Antoine de Saint-Exupéry',
        'Alexandre Dumas',
        'Gustave Flaubert',
        'Marcel Proust',
        'Jean-Paul Sartre',
        'Simone de Beauvoir'
    ];

    const classicBooks = allBooks.value.filter((book) =>
        classicAuthors.some((author) =>
            book.author.toLowerCase().includes(author.toLowerCase())
        )
    );

    // Mettre à jour les catégories avec les vrais livres
    categories.value = [
        {
            title: 'Dernières acquisitions',
            books: shuffledBooks.slice(0, 12) // Prendre les 12 premiers
        },
        {
            title: 'Les mieux notés',
            books: topRatedBooks.slice(0, 12) // Prendre les 12 mieux notés
        },
        {
            title: 'Classiques de la littérature',
            books:
                classicBooks.length > 0
                    ? classicBooks.slice(0, 12)
                    : shuffledBooks.slice(0, 12)
        }
    ];

    console.log('📚 Catégories organisées:', {
        dernieresAcquisitions: categories.value[0].books.length,
        mieuxNotes: categories.value[1].books.length,
        classiques: categories.value[2].books.length
    });
};

/**
 * Initialise les positions des sliders et configure les dimensions responsives
 */
onMounted(async () => {
    await loadBooksData();
    sliderPositions.value = categories.value.map(() => 0);
    maxPositions.value = categories.value.map(() => 0);
    updateItemWidth();
    window.addEventListener('resize', updateItemWidth);
});

/**
 * Nettoie les listeners d'événements avant le démontage du composant
 */
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateItemWidth);
});

/**
 * Met à jour la largeur des éléments et le nombre d'éléments visibles
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
 */
const updateMaxPosition = ({ categoryIndex, maxPosition }) => {
    maxPositions.value[categoryIndex] = maxPosition;
};

/**
 * Calcule la distance de déplacement pour chaque clic sur les boutons du slider
 */
const slideStep = () => {
    return itemWidth.value + gapWidth.value;
};

/**
 * Déplace le slider vers la gauche pour une catégorie spécifique
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
 */
const slideRight = (categoryIndex) => {
    const newPosition = Math.min(
        maxPositions.value[categoryIndex],
        sliderPositions.value[categoryIndex] + slideStep()
    );
    sliderPositions.value[categoryIndex] = newPosition;
};

/**
 * Gère la réservation d'un livre si celui-ci est disponible
 */
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
        ElNotification({
            title: 'Connexion requise',
            message: 'Veuillez vous connecter pour réserver un livre.',
            type: 'info'
        });
        return;
    }

    try {
        const api = (await import('@/services/api')).default;

        // Récupérer les informations de l'utilisateur connecté
        const userData = await api.get('/me');

        // Envoyer la demande de réservation avec l'ISBN du livre
        await api.post('/reservation/books', {
            user_id: userData.id,
            book_id: book.isbn
        });

        // Mettre à jour l'état du livre dans toutes les catégories
        categories.value.forEach((category) => {
            const bookIndex = category.books.findIndex(
                (b) => b.isbn === book.isbn
            );
            if (bookIndex !== -1) {
                category.books[bookIndex].available = false;
            }
        });

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

const handleReservation = async () => {
    reservationFormRef.value.validate(async (valid) => {
        if (valid) {
            if (!reservationForm.value.acceptTerms) {
                ElNotification({
                    title: 'Conditions non acceptées',
                    message:
                        "Veuillez accepter les conditions d'utilisation pour continuer.",
                    type: 'warning'
                });
                return;
            }

            try {
                isSubmitting.value = true;

                const api = (await import('@/services/api')).default;

                const reservationData = {
                    room_id: selectedRoom.value.id,
                    date:
                        new Date(reservationForm.value.date)
                            .toISOString()
                            .split('T')[0] +
                        ' ' +
                        reservationForm.value.timeSlot.replace('-', ':')
                };

                await api.post('/reservation/rooms', reservationData);

                reservationId.value = `RES-${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, '0')}`;

                showReservationModal.value = false;
                showConfirmationModal.value = true;

                reservationForm.value = {
                    date: new Date(),
                    timeSlot: '',
                    participants: 1,
                    purpose: '',
                    comment: '',
                    acceptTerms: false
                };

                ElNotification({
                    title: 'Succès',
                    message: 'Votre réservation a été enregistrée avec succès.',
                    type: 'success'
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
            } finally {
                isSubmitting.value = false;
            }
        }
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
