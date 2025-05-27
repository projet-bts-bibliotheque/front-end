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
const rooms = ref([]);

async function loadRooms() {
    isLoading.value = true;
    try {
        // Importer le service API
        const api = (await import('@/services/api')).default;

        // Récupérer les salles depuis l'API
        const roomsData = await api.get('/rooms');

        // Transformer les données pour notre interface
        rooms.value = roomsData.map((room) => ({
            id: room.id,
            name: room.name,
            type: room.type || 'Standard', // Valeur par défaut si non spécifiée
            capacity: room.places,
            dimension: room.dimension || 0,
            floor: room.floor || 'Étage non spécifié',
            features: room.features || ['wifi'], // Par défaut, wifi disponible
            popular: room.popular || false,
            imageUrl: room.image_url || '/api/placeholder/400/250?text=Salle',
            description: room.description || 'Aucune description disponible.'
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);

        ElNotification({
            title: 'Erreur',
            message:
                'Impossible de charger les salles. Veuillez réessayer plus tard.',
            type: 'error'
        });

        // En cas d'erreur, utiliser un tableau vide
        rooms.value = [];
    } finally {
        isLoading.value = false;
    }
}

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
onMounted(async () => {
    await loadRooms();
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

                // Importer le service API
                const api = (await import('@/services/api')).default;

                // Préparer les données pour l'API
                const reservationData = {
                    room_id: selectedRoom.value.id,
                    date:
                        new Date(reservationForm.value.date)
                            .toISOString()
                            .split('T')[0] +
                        ' ' +
                        reservationForm.value.timeSlot.replace('-', ':')
                };

                // Envoyer la demande de réservation
                await api.post('/reservation/rooms', reservationData);

                // Générer un ID de réservation aléatoire (pour l'UI seulement, le vrai ID vient du backend)
                reservationId.value = `RES-${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, '0')}`;

                // Fermer la modal de réservation et ouvrir la confirmation
                showReservationModal.value = false;
                showConfirmationModal.value = true;

                // Réinitialiser le formulaire pour une prochaine réservation
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
