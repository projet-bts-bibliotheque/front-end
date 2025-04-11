<template>
    <div class="room-details-page" v-if="room">
        <div class="room-hero">
            <div class="overlay"></div>
            <div class="room-hero-content">
                <h1>{{ room.name }}</h1>
                <p>{{ room.type }}</p>
            </div>
        </div>

        <main class="room-content">
            <div class="section-navigation">
                <NuxtLink to="/room" class="back-link">
                    <el-icon><ArrowLeft /></el-icon> Retour aux salles
                </NuxtLink>
            </div>

            <div class="room-details-container">
                <div class="room-details-gallery">
                    <div
                        class="room-details-image"
                        :style="{ backgroundImage: `url(${room.imageUrl})` }"
                    ></div>
                </div>

                <div class="room-details-info">
                    <div class="details-section">
                        <h2>Informations générales</h2>
                        <div class="details-grid">
                            <div class="detail-item">
                                <el-icon><User /></el-icon>
                                <span class="detail-label">Capacité:</span>
                                <span class="detail-value"
                                    >{{ room.capacity }} personnes</span
                                >
                            </div>
                            <div class="detail-item">
                                <el-icon><OfficeBuilding /></el-icon>
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">{{
                                    room.type
                                }}</span>
                            </div>
                            <div class="detail-item" v-if="room.dimension">
                                <el-icon><FullScreen /></el-icon>
                                <span class="detail-label">Superficie:</span>
                                <span class="detail-value"
                                    >{{ room.dimension }}m²</span
                                >
                            </div>
                            <div class="detail-item">
                                <el-icon><Location /></el-icon>
                                <span class="detail-label">Emplacement:</span>
                                <span class="detail-value">{{
                                    room.floor
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="details-section">
                        <h2>Équipements</h2>
                        <div class="details-features">
                            <div
                                v-for="(feature, index) in room.features"
                                :key="index"
                                class="feature-detail"
                            >
                                <el-icon v-if="feature === 'wifi'"
                                    ><Connection
                                /></el-icon>
                                <el-icon v-else-if="feature === 'projector'"
                                    ><VideoPlay
                                /></el-icon>
                                <el-icon v-else-if="feature === 'whiteboard'"
                                    ><Edit
                                /></el-icon>
                                <el-icon v-else-if="feature === 'computer'"
                                    ><Monitor
                                /></el-icon>
                                <span>{{ getFeatureLabel(feature) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="details-section">
                        <h2>Description</h2>
                        <p class="room-details-description">
                            {{ room.description }}
                        </p>
                    </div>

                    <div class="details-section">
                        <h2>Règles d'utilisation</h2>
                        <ul class="room-rules">
                            <li>Réservation obligatoire à l'avance</li>
                            <li>Priorité aux groupes du nombre indiqué</li>
                            <li>Durée maximale de réservation: 4 heures</li>
                            <li>
                                Les salles doivent être laissées propres et
                                rangées
                            </li>
                            <li>Interdiction de manger ou boire (sauf eau)</li>
                        </ul>
                    </div>

                    <div class="room-reservation-action">
                        <el-button
                            type="primary"
                            @click="openReservationModal"
                            size="large"
                        >
                            Réserver cette salle
                        </el-button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modal de réservation (conserver la même que dans l'index) -->
        <el-dialog
            v-model="showReservationModal"
            title=""
            width="600px"
            custom-class="reservation-dialog"
            :show-close="false"
        >
            <!-- Même contenu que dans votre page d'index -->
        </el-dialog>

        <!-- Modal de confirmation (conserver la même que dans l'index) -->
        <el-dialog
            v-model="showConfirmationModal"
            title=""
            width="500px"
            custom-class="confirmation-dialog"
            :show-close="false"
            :append-to-body="true"
        >
            <!-- Même contenu que dans votre page d'index -->
        </el-dialog>

        <!-- Modaux de connexion, inscription, etc. (conserver les mêmes) -->
    </div>
    <div v-else class="loading-state">
        <el-skeleton :rows="10" animated />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    User,
    ArrowLeft,
    Location,
    FullScreen,
    Connection,
    VideoPlay,
    Edit,
    Monitor,
    OfficeBuilding
} from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

defineOptions({
    name: 'RoomDetailPage'
});

// Récupérer l'ID de la salle depuis la route
const route = useRoute();
const roomId = parseInt(route.params.id);

// État
const room = ref(null);
const showReservationModal = ref(false);
const showConfirmationModal = ref(false);
const showLoginModal = ref(false);

// Réutiliser les autres états et fonctions de votre page index.vue
// (timeSlots, reservationForm, reservationRules, etc.)

// Fonctions pour les étiquettes des équipements
const getFeatureLabel = (feature) => {
    switch (feature) {
        case 'wifi':
            return 'Wi-Fi';
        case 'projector':
            return 'Vidéoprojecteur';
        case 'whiteboard':
            return 'Tableau blanc';
        case 'computer':
            return 'Ordinateurs';
        default:
            return feature;
    }
};

// Charger les données de la salle
onMounted(async () => {
    // Simuler un appel API pour récupérer les données de la salle
    // Dans un environnement réel, vous feriez un appel API ici
    setTimeout(() => {
        // Ces données devraient venir de votre API ou d'un store partagé
        const roomsData = [
            // Copiez ici vos données de salles de l'index.vue
            // allRooms.value depuis votre composant d'origine
        ];

        room.value = roomsData.find((r) => r.id === roomId) || null;

        if (!room.value) {
            // Rediriger vers la liste des salles si la salle n'existe pas
            const router = useRouter();
            router.push('/room');
            ElNotification({
                title: 'Salle introuvable',
                message: "La salle demandée n'existe pas.",
                type: 'error'
            });
        }
    }, 500);
});

// Fonction pour ouvrir la modale de réservation
const openReservationModal = () => {
    // Vérifier si l'utilisateur est connecté (simulé)
    if (!isUserLoggedIn()) {
        showLoginModal.value = true;
        ElNotification({
            title: 'Connexion requise',
            message: 'Veuillez vous connecter pour réserver une salle.',
            type: 'info'
        });
        return;
    }

    // Préremplir le formulaire
    reservationForm.value = {
        date: new Date(),
        timeSlot: '',
        participants: 1,
        purpose: '',
        comment: '',
        acceptTerms: false
    };

    showReservationModal.value = true;
};

// Fonction pour vérifier si l'utilisateur est connecté (simulée)
const isUserLoggedIn = () => {
    return false; // À remplacer par votre logique d'authentification
};

// Ajoutez ici les autres fonctions nécessaires pour la réservation
// handleReservation, login, handleRegister, etc.
</script>

<style scoped>
/* Styles pour la page détails */
.room-details-page {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.room-hero {
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

.room-hero-content {
    text-align: center;
    z-index: 2;
    color: white;
    max-width: 800px;
    padding: 0 20px;
}

.room-hero-content h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.room-content {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
    flex-grow: 1;
}

.section-navigation {
    margin-bottom: 20px;
}

.back-link {
    display: inline-flex;
    align-items: center;
    color: #1e88e5;
    text-decoration: none;
    font-weight: 500;
    gap: 6px;
}

.back-link:hover {
    text-decoration: underline;
}

.room-details-container {
    display: flex;
    gap: 40px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 30px;
}

.room-details-gallery {
    flex: 0 0 400px;
}

.room-details-image {
    width: 100%;
    height: 300px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-details-info {
    flex: 1;
}

.details-section {
    margin-bottom: 30px;
}

.details-section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #1e88e5;
    position: relative;
    padding-bottom: 8px;
}

.details-section h2:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 50px;
    height: 3px;
    background-color: #1e88e5;
}

/* Réutilisez les autres styles de votre page d'index */
/* details-grid, detail-item, details-features, etc. */

.room-reservation-action {
    margin-top: 30px;
}

/* Media queries */
@media (max-width: 1024px) {
    .room-details-container {
        flex-direction: column;
    }

    .room-details-gallery {
        flex: none;
        margin-bottom: 20px;
    }
}

/* Vous pouvez copier d'autres styles depuis votre page d'index.vue */
</style>
