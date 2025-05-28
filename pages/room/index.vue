<template>
    <div class="room-page">
        <div class="room-hero">
            <div class="overlay"></div>
            <div class="room-hero-content">
                <h1>Réservation de salles</h1>
                <p>
                    Réservez l'une de nos {{ rooms.length }} salles d'étude pour
                    vos projets et sessions de travail
                </p>
            </div>
        </div>

        <main class="room-content" v-if="!loading">
            <!-- Filtres et datepicker -->
            <div class="room-filters">
                <div class="filters-card">
                    <h2>Trouver une salle</h2>
                    <div class="filters-form">
                        <div class="form-row">
                            <div class="date-filter">
                                <h3>Date de réservation</h3>
                                <el-date-picker
                                    v-model="selectedDate"
                                    type="date"
                                    placeholder="Sélectionner une date"
                                    :disabled-date="disabledDate"
                                    format="DD/MM/YYYY"
                                    @change="onDateChange"
                                />
                            </div>
                            <div class="capacity-filter">
                                <h3>Capacité minimale</h3>
                                <el-slider
                                    v-model="minCapacity"
                                    :min="1"
                                    :max="getMaxCapacity()"
                                    :step="1"
                                    :marks="getCapacityMarks()"
                                    show-stops
                                    @change="filterRooms"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Liste des salles -->
            <div class="rooms-section">
                <div class="rooms-header">
                    <h2>{{ filteredRooms.length }} salles disponibles</h2>
                    <div class="view-controls">
                        <el-button-group>
                            <el-button
                                :type="viewMode === 'grid' ? 'primary' : ''"
                                @click="viewMode = 'grid'"
                            >
                                <el-icon><Grid /></el-icon>
                            </el-button>
                            <el-button
                                :type="viewMode === 'list' ? 'primary' : ''"
                                @click="viewMode = 'list'"
                            >
                                <el-icon><Menu /></el-icon>
                            </el-button>
                        </el-button-group>
                    </div>
                </div>

                <div v-if="loadingRooms" class="loading-container">
                    <el-skeleton :rows="5" animated />
                </div>

                <div v-else-if="filteredRooms.length === 0" class="no-results">
                    <el-empty
                        description="Aucune salle ne correspond à vos critères"
                    />
                    <el-button type="primary" @click="resetFilters">
                        Réinitialiser les filtres
                    </el-button>
                </div>

                <div
                    v-else
                    :class="[
                        'rooms-grid',
                        viewMode === 'list' ? 'list-view' : ''
                    ]"
                >
                    <div
                        v-for="room in filteredRooms"
                        :key="room.id"
                        class="room-card"
                        :class="{ 'list-card': viewMode === 'list' }"
                    >
                        <div class="room-image">
                            <div class="room-badge" v-if="isRoomPopular(room)">
                                Populaire
                            </div>
                        </div>
                        <div class="room-info">
                            <div class="room-header">
                                <h3 class="room-name">Salle n°{{ room.id }}</h3>
                                <div class="room-type">Salle d'étude</div>
                            </div>
                            <div class="room-details">
                                <div class="room-capacity">
                                    <el-icon><User /></el-icon>
                                    <span
                                        >{{ room.places }} personne{{
                                            room.places > 1 ? 's' : ''
                                        }}</span
                                    >
                                </div>
                                <div class="room-status">
                                    <el-icon><Calendar /></el-icon>
                                    <span v-if="selectedDate">
                                        {{
                                            isRoomAvailable(room)
                                                ? 'Disponible'
                                                : 'Réservée'
                                        }}
                                    </span>
                                    <span v-else>Sélectionnez une date</span>
                                </div>
                            </div>
                            <div
                                class="room-description"
                                v-if="viewMode === 'list'"
                            >
                                <p>
                                    Salle d'étude moderne équipée pour
                                    {{ room.places }} personne{{
                                        room.places > 1 ? 's' : ''
                                    }}. Idéale pour les sessions de travail et
                                    de révision.
                                </p>
                            </div>

                            <div class="room-actions">
                                <el-button
                                    type="primary"
                                    @click="openReservationModal(room)"
                                    :disabled="
                                        !selectedDate || !isRoomAvailable(room)
                                    "
                                >
                                    {{
                                        !selectedDate
                                            ? 'Choisir une date'
                                            : isRoomAvailable(room)
                                            ? 'Réserver'
                                            : 'Non disponible'
                                    }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div v-else class="loading-page">
            <el-skeleton :rows="10" animated />
        </div>

        <!-- Modal de réservation -->
        <el-dialog
            v-model="showReservationModal"
            title=""
            width="600px"
            custom-class="reservation-dialog"
            :show-close="false"
        >
            <div class="reservation-container" v-if="selectedRoom">
                <div class="reservation-header">
                    <h2 class="reservation-title">Réserver une salle</h2>
                    <el-button
                        class="close-button"
                        @click="showReservationModal = false"
                        circle
                        plain
                    >
                        <el-icon><Close /></el-icon>
                    </el-button>
                </div>

                <div class="reservation-room-info">
                    <div class="reservation-room-image">
                        <!-- Image placeholder pour la salle -->
                    </div>
                    <div class="reservation-room-details">
                        <h3>Salle n°{{ selectedRoom.id }}</h3>
                        <div class="reservation-room-type">Salle d'étude</div>
                        <div class="reservation-room-capacity">
                            <el-icon><User /></el-icon>
                            <span
                                >{{ selectedRoom.places }} personne{{
                                    selectedRoom.places > 1 ? 's' : ''
                                }}</span
                            >
                        </div>
                    </div>
                </div>

                <el-form
                    class="reservation-form"
                    :model="reservationForm"
                    :rules="reservationRules"
                    ref="reservationFormRef"
                    label-position="top"
                >
                    <el-form-item label="Date" prop="date">
                        <el-date-picker
                            v-model="reservationForm.date"
                            type="date"
                            placeholder="Sélectionner une date"
                            style="width: 100%"
                            :disabled-date="disabledDate"
                            format="DD/MM/YYYY"
                        />
                    </el-form-item>

                    <div class="reservation-terms">
                        <el-checkbox v-model="reservationForm.acceptTerms">
                            <span class="terms-text">
                                J'accepte les
                                <a href="#" class="terms-link"
                                    >règles d'utilisation</a
                                >
                                des salles de la bibliothèque
                            </span>
                        </el-checkbox>
                    </div>

                    <el-button
                        type="primary"
                        class="reservation-button"
                        @click="handleReservation"
                        :disabled="!reservationForm.acceptTerms"
                        :loading="isSubmitting"
                    >
                        Confirmer la réservation
                    </el-button>
                </el-form>
            </div>
        </el-dialog>

        <!-- Modal de confirmation de réservation -->
        <el-dialog
            v-model="showConfirmationModal"
            title=""
            width="500px"
            custom-class="confirmation-dialog"
            :show-close="false"
            :append-to-body="true"
        >
            <div class="confirmation-container">
                <div class="confirmation-icon">
                    <el-icon><CircleCheckFilled /></el-icon>
                </div>
                <h2 class="confirmation-title">Réservation confirmée !</h2>
                <p class="confirmation-message">
                    Votre réservation de la
                    <strong>Salle n°{{ selectedRoom?.id }}</strong> a été
                    confirmée pour le
                    <strong>{{ formatConfirmationDate }}</strong
                    >.
                </p>
                <div class="confirmation-instructions">
                    <h3>Rappel des règles:</h3>
                    <ul>
                        <li>Présentez-vous à l'accueil 5 minutes avant</li>
                        <li>Respectez les autres utilisateurs</li>
                        <li>Laissez la salle propre et rangée</li>
                    </ul>
                </div>
                <div class="confirmation-actions">
                    <el-button @click="showConfirmationModal = false">
                        Fermer
                    </el-button>
                    <el-button type="primary" @click="goToProfile">
                        Voir mes réservations
                    </el-button>
                </div>
            </div>
        </el-dialog>

        <!-- Modals de connexion -->
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    User,
    Grid,
    Menu,
    Location,
    Close,
    Calendar,
    CircleCheckFilled
} from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

defineOptions({
    name: 'RoomPage'
});

const router = useRouter();
const formatConfirmationDate = ref();

// État UI
const loading = ref(true);
const loadingRooms = ref(false);
const viewMode = ref('grid');
const isSubmitting = ref(false);

// Modales
const showReservationModal = ref(false);
const showConfirmationModal = ref(false);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);

// Formulaires
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

// Filtres
const selectedDate = ref(null);
const minCapacity = ref(1);

// Données
const rooms = ref([]);
const reservations = ref([]);
const selectedRoom = ref(null);
const reservationFormRef = ref(null);

// Formulaire de réservation
const reservationForm = ref({
    date: null,
    acceptTerms: false
});

// Règles de validation
const reservationRules = {
    date: [
        {
            required: true,
            message: 'Veuillez sélectionner une date',
            trigger: 'blur'
        }
    ]
};

// Chargement des données
const loadRooms = async () => {
    loadingRooms.value = true;
    try {
        const api = (await import('@/services/api')).default;
        const roomsData = await api.get('/rooms');

        rooms.value = roomsData.map((room) => ({
            id: room.id,
            places: room.places
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de charger les salles',
            type: 'error'
        });
    } finally {
        loadingRooms.value = false;
    }
};

const loadReservations = async () => {
    try {
        const api = (await import('@/services/api')).default;
        const reservationsData = await api.get('/reservation/rooms');
        reservations.value = reservationsData;
    } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        // On continue même si on ne peut pas charger les réservations
        reservations.value = [];
    }
};

// Fonctions utilitaires
const disabledDate = (date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
};

const getMaxCapacity = () => {
    if (rooms.value.length === 0) return 10;
    return Math.max(...rooms.value.map((room) => room.places));
};

const getCapacityMarks = () => {
    const max = getMaxCapacity();
    const marks = { 1: '1' };

    if (max >= 4) marks[4] = '4';
    if (max >= 8) marks[8] = '8';
    if (max >= 12) marks[12] = '12';
    if (max > 12) marks[max] = max.toString();

    return marks;
};

const isRoomPopular = (room) => {
    // Une salle est "populaire" si elle a une capacité élevée
    return room.places >= 6;
};

const isRoomAvailable = (room) => {
    if (!selectedDate.value) return true;

    const dateStr = selectedDate.value.toISOString().split('T')[0];

    // Vérifier si la salle est déjà réservée à cette date
    return !reservations.value.some(
        (reservation) =>
            reservation.room_id === room.id &&
            reservation.date.startsWith(dateStr)
    );
};

// Filtrage des salles
const filteredRooms = computed(() => {
    let result = [...rooms.value];

    // Filtre par capacité minimale
    if (minCapacity.value > 1) {
        result = result.filter((room) => room.places >= minCapacity.value);
    }

    return result;
});

// Actions
const filterRooms = () => {
    // Le filtrage est fait automatiquement via le computed
};

const resetFilters = () => {
    selectedDate.value = null;
    minCapacity.value = 1;
};

const onDateChange = (date) => {
    selectedDate.value = date;
    // Recharger les réservations pour cette date
    loadReservations();
};

const openReservationModal = (room) => {
    // Vérifier si l'utilisateur est connecté
    if (!isUserLoggedIn()) {
        showLoginModal.value = true;
        ElNotification({
            title: 'Connexion requise',
            message: 'Veuillez vous connecter pour réserver une salle.',
            type: 'info'
        });
        return;
    }

    selectedRoom.value = room;
    reservationForm.value.date = selectedDate.value;
    showReservationModal.value = true;
};

const handleReservation = async () => {
    if (!reservationForm.value.acceptTerms) {
        ElNotification({
            title: 'Conditions non acceptées',
            message:
                "Veuillez accepter les règles d'utilisation pour continuer.",
            type: 'warning'
        });
        return;
    }

    try {
        await reservationFormRef.value.validate();
        isSubmitting.value = true;

        const api = (await import('@/services/api')).default;

        // Formater la date pour l'API (YYYY-MM-DD)
        const formattedDate = new Date(reservationForm.value.date)
            .toISOString()
            .split('T')[0];

        // Créer une nouvelle date avec un jour en plus
        const nextDay = new Date(reservationForm.value.date);
        nextDay.setDate(nextDay.getDate() + 1);
        formatConfirmationDate.value = nextDay.toISOString().split('T')[0];

        const reservationData = {
            room_id: selectedRoom.value.id,
            date: formattedDate
        };

        await api.post('/reservation/rooms', reservationData);

        // Recharger les réservations
        await loadReservations();

        // Fermer la modal de réservation et ouvrir la confirmation
        showReservationModal.value = false;
        showConfirmationModal.value = true;

        // Réinitialiser le formulaire
        reservationForm.value = {
            date: null,
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
};

const goToProfile = () => {
    showConfirmationModal.value = false;
    router.push('/profile?tab=rooms');
};

// Fonctions d'authentification
const isUserLoggedIn = () => {
    const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token');
    return !!token;
};

const login = () => {
    showLoginModal.value = false;
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
        message: `Un lien de réinitialisation a été envoyé à ${email}`,
        type: 'success'
    });
};

// Chargement initial
onMounted(async () => {
    try {
        await Promise.all([loadRooms(), loadReservations()]);
    } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.room-page {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    background-color: #f5f7fa;
    min-height: 100vh;
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

.room-hero-content p {
    font-size: 1.2rem;
    font-weight: 300;
}

.room-content {
    width: 90%;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 60px;
}

/* Filtres */
.room-filters {
    margin-bottom: 30px;
}

.filters-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 30px;
}

.filters-card h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #1e88e5;
}

.filters-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-row {
    display: flex;
    gap: 30px;
}

.date-filter,
.capacity-filter {
    flex: 1;
}

.form-row h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #555;
}

/* Liste des salles */
.rooms-section {
    margin-top: 40px;
}

.rooms-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.rooms-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
}

.rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

.rooms-grid.list-view {
    grid-template-columns: 1fr;
}

.room-card {
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
}

.room-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.room-card.list-card {
    flex-direction: row;
    height: 220px;
}

.room-image {
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: 600;
}

.list-card .room-image {
    flex: 0 0 280px;
    height: auto;
}

.room-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ff9800;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.8rem;
}

.room-info {
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.room-header {
    margin-bottom: 12px;
}

.room-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 6px 0;
    color: #1e88e5;
}

.room-type {
    color: #666;
    font-size: 0.9rem;
}

.room-details {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
}

.room-capacity,
.room-status {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #555;
    font-size: 0.9rem;
}

.room-description {
    color: #666;
    margin-bottom: 20px;
    font-size: 0.95rem;
    line-height: 1.5;
}

.room-actions {
    margin-top: auto;
    display: flex;
    gap: 10px;
}

.loading-container,
.loading-page {
    padding: 30px;
}

.no-results {
    text-align: center;
    padding: 50px 0;
}

/* Modals */
:deep(.reservation-dialog),
:deep(.confirmation-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

.reservation-container,
.confirmation-container {
    padding: 24px;
}

.reservation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.reservation-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.reservation-room-info {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    background-color: #f7f9fc;
    padding: 15px;
    border-radius: 8px;
}

.reservation-room-image {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 6px;
    flex-shrink: 0;
}

.reservation-room-details {
    flex: 1;
}

.reservation-room-details h3 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
}

.reservation-room-type {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 6px;
}

.reservation-room-capacity {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: #555;
}

.reservation-form {
    margin-bottom: 20px;
}

.reservation-terms {
    margin: 16px 0 24px;
    font-size: 0.9rem;
    color: #555;
}

.terms-text {
    display: inline-block;
    line-height: 1.4;
}

.terms-link {
    color: #1e88e5;
    text-decoration: none;
}

.terms-link:hover {
    text-decoration: underline;
}

.reservation-button {
    width: 100%;
    height: 44px;
    font-weight: 600;
}

/* Modal de confirmation */
.confirmation-container {
    text-align: center;
}

.confirmation-icon {
    font-size: 4rem;
    color: #4caf50;
    margin-bottom: 20px;
}

.confirmation-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #4caf50;
    margin-bottom: 16px;
}

.confirmation-message {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 24px;
    line-height: 1.6;
}

.confirmation-instructions {
    text-align: left;
    margin-bottom: 24px;
    padding: 15px;
    background-color: #fffde7;
    border-radius: 8px;
    border-left: 4px solid #ffc107;
}

.confirmation-instructions h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
}

.confirmation-instructions ul {
    padding-left: 20px;
    color: #555;
}

.confirmation-instructions li {
    margin-bottom: 6px;
}

.confirmation-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

/* Responsive */
@media (max-width: 1024px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .rooms-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
}

@media (max-width: 768px) {
    .room-hero-content h1 {
        font-size: 2rem;
    }

    .room-card.list-card {
        flex-direction: column;
        height: auto;
    }

    .list-card .room-image {
        width: 100%;
        height: 200px;
    }

    .room-content {
        width: 95%;
    }
}

@media (max-width: 480px) {
    .rooms-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .view-controls {
        align-self: flex-end;
    }
}
</style>
