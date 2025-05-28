<template>
    <div class="room-details-page" v-if="room">
        <div class="room-hero">
            <div class="overlay"></div>
            <div class="room-hero-content">
                <h1>Salle n°{{ room.id }}</h1>
                <p>Salle d'étude</p>
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
                    <div class="room-details-image">
                        <!-- Image placeholder avec gradient -->
                    </div>
                </div>

                <div class="room-details-info">
                    <div class="details-section">
                        <h2>Informations générales</h2>
                        <div class="details-grid">
                            <div class="detail-item">
                                <el-icon><User /></el-icon>
                                <span class="detail-label">Capacité:</span>
                                <span class="detail-value"
                                    >{{ room.places }} personne{{
                                        room.places > 1 ? 's' : ''
                                    }}</span
                                >
                            </div>
                            <div class="detail-item">
                                <el-icon><OfficeBuilding /></el-icon>
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">Salle d'étude</span>
                            </div>
                            <div class="detail-item">
                                <el-icon><Location /></el-icon>
                                <span class="detail-label">Emplacement:</span>
                                <span class="detail-value"
                                    >Bibliothèque principale</span
                                >
                            </div>
                            <div class="detail-item">
                                <el-icon><Calendar /></el-icon>
                                <span class="detail-label">Statut:</span>
                                <span class="detail-value">
                                    <el-tag
                                        :type="
                                            isAvailableToday()
                                                ? 'success'
                                                : 'warning'
                                        "
                                    >
                                        {{
                                            isAvailableToday()
                                                ? "Disponible aujourd'hui"
                                                : "Réservée aujourd'hui"
                                        }}
                                    </el-tag>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="details-section">
                        <h2>Équipements</h2>
                        <div class="details-features">
                            <div class="feature-detail">
                                <el-icon><Connection /></el-icon>
                                <span>Wi-Fi gratuit</span>
                            </div>
                            <div class="feature-detail">
                                <el-icon><Edit /></el-icon>
                                <span>Tableau blanc</span>
                            </div>
                            <div class="feature-detail">
                                <el-icon><Monitor /></el-icon>
                                <span>Éclairage optimal</span>
                            </div>
                            <div class="feature-detail">
                                <el-icon><Phone /></el-icon>
                                <span>Silence requis</span>
                            </div>
                        </div>
                    </div>

                    <div class="details-section">
                        <h2>Description</h2>
                        <p class="room-details-description">
                            Salle d'étude moderne et confortable, équipée pour
                            accueillir {{ room.places }} personne{{
                                room.places > 1 ? 's' : ''
                            }}. Idéale pour les sessions de travail, révisions
                            et projets de groupe. L'espace bénéficie d'un
                            éclairage naturel optimal et d'un environnement
                            calme propice à la concentration.
                        </p>
                    </div>

                    <div class="details-section">
                        <h2>Disponibilité</h2>
                        <div class="availability-calendar">
                            <el-calendar
                                v-model="selectedDate"
                                @date-change="onDateChange"
                            >
                                <template #date-cell="{ data }">
                                    <div
                                        class="calendar-day"
                                        :class="getCalendarDayClass(data.day)"
                                    >
                                        <span class="day-number">{{
                                            data.day.getDate()
                                        }}</span>
                                        <span
                                            class="day-status"
                                            v-if="!isPastDate(data.day)"
                                        >
                                            {{
                                                isDateAvailable(data.day)
                                                    ? '✓'
                                                    : '✗'
                                            }}
                                        </span>
                                    </div>
                                </template>
                            </el-calendar>
                        </div>
                        <div class="calendar-legend">
                            <div class="legend-item">
                                <span class="legend-dot available"></span>
                                <span>Disponible</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot unavailable"></span>
                                <span>Réservée</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot past"></span>
                                <span>Passée</span>
                            </div>
                        </div>
                    </div>

                    <div class="details-section">
                        <h2>Règles d'utilisation</h2>
                        <ul class="room-rules">
                            <li>Réservation obligatoire à l'avance</li>
                            <li>Respecter les horaires de réservation</li>
                            <li>Maintenir le silence dans la salle</li>
                            <li>Laisser la salle propre et rangée</li>
                            <li>
                                Interdiction de manger (boissons autorisées)
                            </li>
                            <li>Signaler tout problème technique</li>
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

            <!-- Réservations récentes -->
            <div class="recent-reservations" v-if="roomReservations.length > 0">
                <h2>Réservations récentes</h2>
                <div class="reservations-list">
                    <div
                        v-for="reservation in roomReservations.slice(0, 5)"
                        :key="reservation.id"
                        class="reservation-item"
                    >
                        <div class="reservation-date">
                            {{ formatReservationDate(reservation.date) }}
                        </div>
                        <div class="reservation-status">
                            <el-tag
                                :type="
                                    isPastDate(new Date(reservation.date))
                                        ? 'info'
                                        : 'success'
                                "
                                size="small"
                            >
                                {{
                                    isPastDate(new Date(reservation.date))
                                        ? 'Terminée'
                                        : 'Programmée'
                                }}
                            </el-tag>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modal de réservation -->
        <el-dialog
            v-model="showReservationModal"
            title=""
            width="600px"
            custom-class="reservation-dialog"
            :show-close="false"
        >
            <div class="reservation-container">
                <div class="reservation-header">
                    <h2 class="reservation-title">Réserver la salle</h2>
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
                    <div class="reservation-room-image"></div>
                    <div class="reservation-room-details">
                        <h3>Salle n°{{ room.id }}</h3>
                        <div class="reservation-room-type">Salle d'étude</div>
                        <div class="reservation-room-capacity">
                            <el-icon><User /></el-icon>
                            <span
                                >{{ room.places }} personne{{
                                    room.places > 1 ? 's' : ''
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

                    <el-form-item
                        label="Commentaire (optionnel)"
                        prop="comment"
                    >
                        <el-input
                            v-model="reservationForm.comment"
                            type="textarea"
                            rows="3"
                            placeholder="Précisions supplémentaires..."
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

        <!-- Modal de confirmation -->
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
                    <strong>Salle n°{{ room.id }}</strong> a été confirmée pour
                    le <strong>{{ formatConfirmationDate() }}</strong
                    >.
                </p>
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
    Connection,
    Edit,
    Monitor,
    Phone,
    OfficeBuilding,
    Calendar,
    Close,
    CircleCheckFilled
} from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

defineOptions({
    name: 'RoomDetailPage'
});

const route = useRoute();
const router = useRouter();
const roomId = parseInt(route.params.id);

// États
const room = ref(null);
const roomReservations = ref([]);
const selectedDate = ref(new Date());
const showReservationModal = ref(false);
const showConfirmationModal = ref(false);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showForgotPasswordModal = ref(false);
const isSubmitting = ref(false);

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

const reservationForm = ref({
    date: null,
    comment: '',
    acceptTerms: false
});

const reservationFormRef = ref(null);

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
const loadRoomData = async () => {
    try {
        const api = (await import('@/services/api')).default;

        const [roomData, reservationsData] = await Promise.all([
            api.get(`/rooms/${roomId}`),
            api.get('/reservation/rooms')
        ]);

        if (!roomData) {
            router.push('/room');
            ElNotification({
                title: 'Salle introuvable',
                message: "La salle demandée n'existe pas.",
                type: 'error'
            });
            return;
        }

        room.value = {
            id: roomData.id,
            places: roomData.places
        };

        // Filtrer les réservations pour cette salle
        roomReservations.value = reservationsData
            .filter((r) => r.room_id === roomId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Erreur lors du chargement de la salle:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de charger les informations de la salle.',
            type: 'error'
        });
        router.push('/room');
    }
};

// Fonctions utilitaires
const disabledDate = (date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
};

const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

const isDateAvailable = (date) => {
    if (isPastDate(date)) return false;

    const dateStr = date.toISOString().split('T')[0];
    return !roomReservations.value.some((reservation) =>
        reservation.date.startsWith(dateStr)
    );
};

const isAvailableToday = () => {
    return isDateAvailable(new Date());
};

const getCalendarDayClass = (date) => {
    if (isPastDate(date)) return 'past-date';
    if (isDateAvailable(date)) return 'available-date';
    return 'unavailable-date';
};

const formatReservationDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatConfirmationDate = () => {
    if (!reservationForm.value.date) return '';
    return new Date(reservationForm.value.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Actions
const onDateChange = (date) => {
    selectedDate.value = date;
};

const openReservationModal = () => {
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

        const formattedDate = new Date(reservationForm.value.date)
            .toISOString()
            .split('T')[0];

        const reservationData = {
            room_id: room.value.id,
            date: formattedDate
        };

        await api.post('/reservation/rooms', reservationData);

        // Recharger les réservations
        await loadRoomData();

        showReservationModal.value = false;
        showConfirmationModal.value = true;

        reservationForm.value = {
            date: null,
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
    await loadRoomData();
});
</script>

<style scoped>
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
    margin-bottom: 30px;
}

.room-details-gallery {
    flex: 0 0 400px;
}

.room-details-image {
    width: 100%;
    height: 300px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: 600;
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

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-label {
    font-weight: 600;
    color: #555;
    min-width: 80px;
}

.detail-value {
    flex: 1;
    color: #333;
}

.details-features {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.feature-detail {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f0f6ff;
    color: #1e88e5;
    padding: 8px 12px;
    border-radius: 6px;
}

.room-details-description {
    line-height: 1.7;
    color: #555;
}

.availability-calendar {
    margin-bottom: 20px;
}

:deep(.el-calendar) {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
}

:deep(.el-calendar-day) {
    height: 60px;
}

.calendar-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-radius: 4px;
}

.day-number {
    font-weight: 600;
    margin-bottom: 2px;
}

.day-status {
    font-size: 0.8rem;
    font-weight: 600;
}

.calendar-day.available-date {
    background-color: #f0f9ff;
    color: #059669;
}

.calendar-day.unavailable-date {
    background-color: #fef2f2;
    color: #dc2626;
}

.calendar-day.past-date {
    background-color: #f9fafb;
    color: #9ca3af;
}

.calendar-legend {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.legend-dot.available {
    background-color: #059669;
}

.legend-dot.unavailable {
    background-color: #dc2626;
}

.legend-dot.past {
    background-color: #9ca3af;
}

.room-rules {
    padding-left: 20px;
    color: #555;
}

.room-rules li {
    margin-bottom: 8px;
}

.room-reservation-action {
    margin-top: 30px;
}

.recent-reservations {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 30px;
}

.recent-reservations h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #1e88e5;
}

.reservations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reservation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
}

.reservation-date {
    font-weight: 500;
    color: #333;
}

/* Modal styles */
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

.confirmation-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.loading-state {
    padding: 50px;
}

/* Responsive */
@media (max-width: 1024px) {
    .room-details-container {
        flex-direction: column;
    }

    .room-details-gallery {
        flex: none;
        margin-bottom: 20px;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .room-content {
        width: 95%;
    }

    .room-details-container {
        padding: 20px;
    }

    .calendar-legend {
        flex-direction: column;
        gap: 10px;
    }

    .recent-reservations {
        padding: 20px;
    }

    .reservation-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>
