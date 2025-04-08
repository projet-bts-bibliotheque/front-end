<template>
    <div class="room-page">
        <div class="room-hero">
            <div class="overlay"></div>
            <div class="room-hero-content">
                <h1>Réservation de salles</h1>
                <p>
                    Réservez l'une de nos 10 salles d'étude pour vos travaux de
                    groupe, sessions de révision ou réunions
                </p>
            </div>
        </div>

        <main class="room-content">
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
                            <div class="time-filter">
                                <h3>Créneau horaire</h3>
                                <el-select
                                    v-model="selectedTimeSlot"
                                    placeholder="Choisir un horaire"
                                    style="width: 100%"
                                    @change="onTimeSlotChange"
                                >
                                    <el-option
                                        v-for="slot in timeSlots"
                                        :key="slot.value"
                                        :label="slot.label"
                                        :value="slot.value"
                                    />
                                </el-select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="capacity-filter">
                                <h3>Capacité minimale</h3>
                                <el-slider
                                    v-model="minCapacity"
                                    :min="1"
                                    :max="12"
                                    :step="1"
                                    :marks="capacityMarks"
                                    show-stops
                                    @change="filterRooms"
                                />
                            </div>
                            <div class="type-filter">
                                <h3>Type de salle</h3>
                                <el-select
                                    v-model="selectedRoomType"
                                    placeholder="Tous les types"
                                    style="width: 100%"
                                    @change="filterRooms"
                                >
                                    <el-option
                                        v-for="type in roomTypes"
                                        :key="type.value"
                                        :label="type.label"
                                        :value="type.value"
                                    />
                                </el-select>
                            </div>
                        </div>
                        <div class="form-row features-filter">
                            <h3>Équipements</h3>
                            <el-checkbox-group
                                v-model="selectedFeatures"
                                @change="filterRooms"
                            >
                                <el-checkbox label="wifi">Wi-Fi</el-checkbox>
                                <el-checkbox label="projector"
                                    >Vidéoprojecteur</el-checkbox
                                >
                                <el-checkbox label="whiteboard"
                                    >Tableau blanc</el-checkbox
                                >
                                <el-checkbox label="computer"
                                    >Ordinateurs</el-checkbox
                                >
                            </el-checkbox-group>
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

                <div v-if="isLoading" class="loading-container">
                    <el-skeleton :rows="10" animated />
                </div>

                <div v-else-if="filteredRooms.length === 0" class="no-results">
                    <el-empty
                        description="Aucune salle ne correspond à vos critères de recherche"
                    />
                    <el-button type="primary" @click="resetFilters"
                        >Réinitialiser les filtres</el-button
                    >
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
                        <div
                            class="room-image"
                            :style="{
                                backgroundImage: `url(${room.imageUrl})`
                            }"
                        >
                            <div class="room-badge" v-if="room.popular">
                                Populaire
                            </div>
                        </div>
                        <div class="room-info">
                            <div class="room-header">
                                <h3 class="room-name">{{ room.name }}</h3>
                                <div class="room-type">{{ room.type }}</div>
                            </div>
                            <div class="room-details">
                                <div class="room-capacity">
                                    <el-icon><User /></el-icon>
                                    <span>{{ room.capacity }} personnes</span>
                                </div>
                                <div
                                    class="room-dimension"
                                    v-if="room.dimension"
                                >
                                    <el-icon><FullScreen /></el-icon>
                                    <span>{{ room.dimension }}m²</span>
                                </div>
                                <div class="room-floor">
                                    <el-icon><Location /></el-icon>
                                    <span>{{ room.floor }}</span>
                                </div>
                            </div>
                            <div class="room-features">
                                <div
                                    v-for="(feature, index) in room.features"
                                    :key="index"
                                    class="feature-tag"
                                >
                                    <el-icon v-if="feature === 'wifi'"
                                        ><Connection
                                    /></el-icon>
                                    <el-icon v-else-if="feature === 'projector'"
                                        ><VideoPlay
                                    /></el-icon>
                                    <el-icon
                                        v-else-if="feature === 'whiteboard'"
                                        ><Edit
                                    /></el-icon>
                                    <el-icon v-else-if="feature === 'computer'"
                                        ><Monitor
                                    /></el-icon>
                                    <span>{{ getFeatureLabel(feature) }}</span>
                                </div>
                            </div>
                            <div
                                class="room-description"
                                v-if="viewMode === 'list'"
                            >
                                <p>{{ room.description }}</p>
                            </div>

                            <div class="room-actions">
                                <el-button
                                    type="primary"
                                    @click="openReservationModal(room)"
                                >
                                    Réserver
                                </el-button>
                                <NuxtLink :to="`/room/${room.id}`">
                                    <el-button>Détails</el-button>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modal de détails de salle -->
        <el-dialog
            v-model="showDetailsModal"
            title=""
            width="800px"
            custom-class="room-details-dialog"
            :show-close="false"
        >
            <div class="room-details-container" v-if="selectedRoom">
                <div class="room-details-header">
                    <h2 class="room-details-title">{{ selectedRoom.name }}</h2>
                    <el-button
                        class="close-button"
                        @click="showDetailsModal = false"
                        circle
                        plain
                    >
                        <el-icon><Close /></el-icon>
                    </el-button>
                </div>

                <div class="room-details-content">
                    <div class="room-details-gallery">
                        <div
                            class="room-details-image"
                            :style="{
                                backgroundImage: `url(${selectedRoom.imageUrl})`
                            }"
                        ></div>
                    </div>

                    <div class="room-details-info">
                        <div class="details-section">
                            <h3>Informations générales</h3>
                            <div class="details-grid">
                                <div class="detail-item">
                                    <el-icon><User /></el-icon>
                                    <span class="detail-label">Capacité:</span>
                                    <span class="detail-value"
                                        >{{
                                            selectedRoom.capacity
                                        }}
                                        personnes</span
                                    >
                                </div>
                                <div class="detail-item">
                                    <el-icon><OfficeBuilding /></el-icon>
                                    <span class="detail-label">Type:</span>
                                    <span class="detail-value">{{
                                        selectedRoom.type
                                    }}</span>
                                </div>
                                <div
                                    class="detail-item"
                                    v-if="selectedRoom.dimension"
                                >
                                    <el-icon><FullScreen /></el-icon>
                                    <span class="detail-label"
                                        >Superficie:</span
                                    >
                                    <span class="detail-value"
                                        >{{ selectedRoom.dimension }}m²</span
                                    >
                                </div>
                                <div class="detail-item">
                                    <el-icon><Location /></el-icon>
                                    <span class="detail-label"
                                        >Emplacement:</span
                                    >
                                    <span class="detail-value">{{
                                        selectedRoom.floor
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h3>Équipements</h3>
                            <div class="details-features">
                                <div
                                    v-for="(
                                        feature, index
                                    ) in selectedRoom.features"
                                    :key="index"
                                    class="feature-detail"
                                >
                                    <el-icon v-if="feature === 'wifi'"
                                        ><Connection
                                    /></el-icon>
                                    <el-icon v-else-if="feature === 'projector'"
                                        ><VideoPlay
                                    /></el-icon>
                                    <el-icon
                                        v-else-if="feature === 'whiteboard'"
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
                            <h3>Description</h3>
                            <p class="room-details-description">
                                {{ selectedRoom.description }}
                            </p>
                        </div>

                        <div class="details-section">
                            <h3>Règles d'utilisation</h3>
                            <ul class="room-rules">
                                <li>Réservation obligatoire à l'avance</li>
                                <li>Priorité aux groupes du nombre indiqué</li>
                                <li>Durée maximale de réservation: 4 heures</li>
                                <li>
                                    Les salles doivent être laissées propres et
                                    rangées
                                </li>
                                <li>
                                    Interdiction de manger ou boire (sauf eau)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="room-details-actions">
                    <el-button
                        type="primary"
                        @click="openReservationModal(selectedRoom)"
                    >
                        Réserver cette salle
                    </el-button>
                </div>
            </div>
        </el-dialog>

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
                    <div
                        class="reservation-room-image"
                        :style="{
                            backgroundImage: `url(${selectedRoom.imageUrl})`
                        }"
                    ></div>
                    <div class="reservation-room-details">
                        <h3>{{ selectedRoom.name }}</h3>
                        <div class="reservation-room-type">
                            {{ selectedRoom.type }}
                        </div>
                        <div class="reservation-room-capacity">
                            <el-icon><User /></el-icon>
                            <span>{{ selectedRoom.capacity }} personnes</span>
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
                    <div class="form-row">
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

                        <el-form-item label="Créneau horaire" prop="timeSlot">
                            <el-select
                                v-model="reservationForm.timeSlot"
                                placeholder="Choisir un horaire"
                                style="width: 100%"
                            >
                                <el-option
                                    v-for="slot in timeSlots"
                                    :key="slot.value"
                                    :label="slot.label"
                                    :value="slot.value"
                                />
                            </el-select>
                        </el-form-item>
                    </div>

                    <el-form-item
                        label="Nombre de personnes"
                        prop="participants"
                    >
                        <el-input-number
                            v-model="reservationForm.participants"
                            :min="1"
                            :max="selectedRoom.capacity"
                            style="width: 100%"
                        />
                    </el-form-item>

                    <el-form-item
                        label="Motif de la réservation"
                        prop="purpose"
                    >
                        <el-select
                            v-model="reservationForm.purpose"
                            placeholder="Sélectionner un motif"
                            style="width: 100%"
                        >
                            <el-option
                                label="Travail de groupe"
                                value="group"
                            />
                            <el-option label="Réunion" value="meeting" />
                            <el-option label="Session d'étude" value="study" />
                            <el-option
                                label="Présentation"
                                value="presentation"
                            />
                            <el-option label="Autre" value="other" />
                        </el-select>
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
                                    >conditions d'utilisation</a
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
                    Votre réservation de la salle
                    <strong>{{ selectedRoom?.name }}</strong> a été confirmée
                    pour le <strong>{{ formatConfirmationDate() }}</strong
                    >, de
                    <strong>{{
                        formatTimeSlot(reservationForm.timeSlot)
                    }}</strong
                    >.
                </p>
                <p class="confirmation-id">
                    Numéro de réservation: <strong>{{ reservationId }}</strong>
                </p>
                <div class="confirmation-instructions">
                    <h3>Rappel des règles:</h3>
                    <ul>
                        <li>
                            Arrivez 5 minutes avant l'heure de votre réservation
                        </li>
                        <li>Présentez votre carte d'étudiant à l'accueil</li>
                        <li>La salle doit être libérée à l'heure indiquée</li>
                    </ul>
                </div>
                <div class="confirmation-actions">
                    <el-button @click="showConfirmationModal = false"
                        >Fermer</el-button
                    >
                    <el-button type="primary" @click="downloadReservation">
                        <el-icon><Download /></el-icon>
                        Télécharger le récapitulatif
                    </el-button>
                </div>
            </div>
        </el-dialog>

        <!-- Modal de connexion -->
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
import {
    User,
    Grid,
    Menu,
    Location,
    Close,
    FullScreen,
    Connection,
    VideoPlay,
    Edit,
    Monitor,
    OfficeBuilding,
    CircleCheckFilled,
    Download
} from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import ForgotPasswordModal from '~/components/modals/ForgotPasswordModal.vue';

defineOptions({
    name: 'RoomPage'
});

// État UI
const viewMode = ref('grid');
const isLoading = ref(true);
const isSubmitting = ref(false);

// Modales
const showDetailsModal = ref(false);
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
const selectedDate = ref(new Date());
const selectedTimeSlot = ref('');
const minCapacity = ref(1);
const selectedRoomType = ref('');
const selectedFeatures = ref([]);
const reservationFormRef = ref(null);

// Données de réservation
const selectedRoom = ref(null);
const reservationId = ref('');
const reservationForm = ref({
    date: new Date(),
    timeSlot: '',
    participants: 1,
    purpose: '',
    comment: '',
    acceptTerms: false
});

// Options et configurations
const timeSlots = [
    { value: '09-11', label: '9h - 11h' },
    { value: '11-13', label: '11h - 13h' },
    { value: '13-15', label: '13h - 15h' },
    { value: '15-17', label: '15h - 17h' },
    { value: '17-19', label: '17h - 19h' },
    { value: '19-21', label: '19h - 21h' }
];

const roomTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'Individuelle', label: 'Individuelle' },
    { value: 'Groupe', label: 'Groupe' },
    { value: 'Réunion', label: 'Réunion' },
    { value: 'Présentation', label: 'Présentation' },
    { value: 'Informatique', label: 'Informatique' },
    { value: 'Multimédia', label: 'Multimédia' }
];

const capacityMarks = {
    1: '1',
    4: '4',
    8: '8',
    12: '12'
};

// Règles de validation pour le formulaire de réservation
const reservationRules = {
    date: [
        {
            required: true,
            message: 'Veuillez sélectionner une date',
            trigger: 'blur'
        }
    ],
    timeSlot: [
        {
            required: true,
            message: 'Veuillez sélectionner un créneau horaire',
            trigger: 'change'
        }
    ],
    participants: [
        {
            required: true,
            message: 'Veuillez indiquer le nombre de participants',
            trigger: 'blur'
        }
    ],
    purpose: [
        {
            required: true,
            message: 'Veuillez sélectionner un motif',
            trigger: 'change'
        }
    ]
};

// Données de salles (10 salles)
const allRooms = ref([
    {
        id: 1,
        name: "Salle d'étude A1",
        type: 'Individuelle',
        capacity: 2,
        dimension: 8,
        floor: '1er étage, aile Est',
        features: ['wifi', 'whiteboard'],
        popular: true,
        imageUrl: '/api/placeholder/400/250?text=Salle+A1',
        description:
            "Petite salle individuelle idéale pour un travail au calme ou des entretiens en tête-à-tête. Équipée d'une table spacieuse, de prises électriques et d'un tableau blanc."
    },
    {
        id: 2,
        name: 'Salle de groupe B2',
        type: 'Groupe',
        capacity: 6,
        dimension: 18,
        floor: '1er étage, aile Ouest',
        features: ['wifi', 'whiteboard', 'projector'],
        popular: false,
        imageUrl: '/api/placeholder/400/250?text=Salle+B2',
        description:
            "Salle de taille moyenne pour les travaux de groupe et les projets collaboratifs. Elle dispose d'un grand tableau blanc et d'un vidéoprojecteur pour faciliter les présentations et les discussions en groupe."
    },
    {
        id: 3,
        name: 'Salle de conférence C1',
        type: 'Présentation',
        capacity: 12,
        dimension: 30,
        floor: '2ème étage, aile centrale',
        features: ['wifi', 'projector', 'whiteboard'],
        popular: true,
        imageUrl: '/api/placeholder/400/250?text=Salle+C1',
        description:
            "Grande salle de conférence adaptée aux présentations et aux séminaires. Équipée d'un vidéoprojecteur haute définition, d'un système audio et d'un grand tableau blanc. Parfaite pour les soutenances de projets ou les réunions importantes."
    },
    {
        id: 4,
        name: 'Laboratoire informatique D1',
        type: 'Informatique',
        capacity: 8,
        dimension: 24,
        floor: 'Rez-de-chaussée, aile Nord',
        features: ['wifi', 'computer', 'projector'],
        popular: false,
        imageUrl: '/api/placeholder/400/250?text=Salle+D1',
        description:
            "Salle informatique équipée de 8 postes de travail performants avec les principaux logiciels professionnels installés. Idéale pour les cours d'informatique, les ateliers de programmation ou les sessions de recherche nécessitant des ressources informatiques."
    },
    {
        id: 5,
        name: 'Espace créatif E1',
        type: 'Multimédia',
        capacity: 6,
        dimension: 20,
        floor: '3ème étage, aile Sud',
        features: ['wifi', 'computer', 'whiteboard'],
        popular: true,
        imageUrl: '/api/placeholder/400/250?text=Salle+E1',
        description:
            "Espace créatif conçu pour les projets multimédias et artistiques. Équipé d'ordinateurs avec logiciels de design et de montage, et d'un espace de travail modulable pour faciliter la collaboration et la créativité."
    },
    {
        id: 6,
        name: 'Salle de réunion F1',
        type: 'Réunion',
        capacity: 10,
        dimension: 25,
        floor: '2ème étage, aile Est',
        features: ['wifi', 'projector', 'whiteboard'],
        popular: false,
        imageUrl: '/api/placeholder/400/250?text=Salle+F1',
        description:
            "Salle de réunion professionnelle avec une grande table centrale et des sièges confortables. Équipée d'un système de vidéoconférence et d'un vidéoprojecteur pour faciliter les réunions à distance et les présentations."
    },
    {
        id: 7,
        name: "Cabine d'étude G1",
        type: 'Individuelle',
        capacity: 1,
        dimension: 4,
        floor: '1er étage, section périodiques',
        features: ['wifi'],
        popular: false,
        imageUrl: '/api/placeholder/400/250?text=Salle+G1',
        description:
            "Petite cabine individuelle parfaite pour un travail en toute tranquillité. Équipée d'un bureau, d'une lampe de travail et de prises électriques. Idéale pour les longues sessions d'étude nécessitant une concentration maximale."
    },
    {
        id: 8,
        name: 'Salle collaborative H1',
        type: 'Groupe',
        capacity: 8,
        dimension: 22,
        floor: '3ème étage, aile Ouest',
        features: ['wifi', 'whiteboard', 'projector'],
        popular: true,
        imageUrl: '/api/placeholder/400/250?text=Salle+H1',
        description:
            "Salle polyvalente conçue pour favoriser la collaboration. Mobilier modulable, grands tableaux blancs sur plusieurs murs et technologie de partage d'écran. Parfaite pour les séances de brainstorming et les projets créatifs en groupe."
    },
    {
        id: 9,
        name: 'Laboratoire de langues I1',
        type: 'Informatique',
        capacity: 6,
        dimension: 18,
        floor: '2ème étage, aile Nord',
        features: ['wifi', 'computer', 'whiteboard'],
        popular: false,
        imageUrl: '/api/placeholder/400/250?text=Salle+I1',
        description:
            "Laboratoire spécialisé pour l'apprentissage des langues. Équipé d'ordinateurs avec logiciels linguistiques, casques audio et microphones. Idéal pour les sessions de pratique linguistique en autonomie ou en petits groupes."
    },
    {
        id: 10,
        name: 'Salle silencieuse J1',
        type: 'Individuelle',
        capacity: 4,
        dimension: 12,
        floor: '4ème étage, section',
        features: ['wifi'],
        popular: false,
        imageUrl: '/api/placeholder/400/250?text=Salle+J1',
        description:
            "Salle dédiée au travail silencieux avec quatre postes individuels séparés par des cloisons. Parfaite pour les étudiants qui ont besoin d'un environnement sans distractions. Strictement réservée au travail individuel."
    }
]);
// Filtrage des salles
const filteredRooms = computed(() => {
    let result = [...allRooms.value];

    // Filtre par capacité minimale
    if (minCapacity.value > 1) {
        result = result.filter((room) => room.capacity >= minCapacity.value);
    }

    // Filtre par type de salle
    if (selectedRoomType.value) {
        result = result.filter((room) => room.type === selectedRoomType.value);
    }

    // Filtre par équipements
    if (selectedFeatures.value.length > 0) {
        result = result.filter((room) => {
            return selectedFeatures.value.every((feature) =>
                room.features.includes(feature)
            );
        });
    }

    return result;
});

// Désactiver les dates passées pour le datepicker
const disabledDate = (date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
};

// Fonctions utilitaires
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

// Formater le créneau horaire pour l'affichage
const formatTimeSlot = (slot) => {
    const found = timeSlots.find((item) => item.value === slot);
    return found ? found.label : slot;
};

// Formater la date pour la confirmation
const formatConfirmationDate = () => {
    if (!reservationForm.value.date) return '';
    return new Date(reservationForm.value.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Fonctions d'action
const filterRooms = () => {
    // La fonction ne fait rien car le filtrage est géré via le computed
    // On pourrait ajouter des actions supplémentaires si nécessaire
};

// const showRoomDetails = (room) => {
//     selectedRoom.value = room;
//     showDetailsModal.value = true;
// };

const openReservationModal = (room) => {
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

    selectedRoom.value = room;

    // Préremplir le formulaire avec les valeurs actuelles des filtres
    reservationForm.value.date = selectedDate.value;
    reservationForm.value.timeSlot = selectedTimeSlot.value || '';
    reservationForm.value.participants = Math.min(
        room.capacity,
        Math.max(minCapacity.value, 1)
    );

    showReservationModal.value = true;
};

const handleReservation = () => {
    if (!reservationForm.value.acceptTerms) {
        ElNotification({
            title: 'Conditions non acceptées',
            message:
                "Veuillez accepter les conditions d'utilisation pour continuer.",
            type: 'warning'
        });
        return;
    }

    reservationFormRef.value.validate((valid) => {
        if (valid) {
            isSubmitting.value = true;

            // Simuler un appel API
            setTimeout(() => {
                isSubmitting.value = false;

                // Générer un ID de réservation aléatoire
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
            }, 1500);
        }
    });
};

const resetFilters = () => {
    selectedDate.value = new Date();
    selectedTimeSlot.value = '';
    minCapacity.value = 1;
    selectedRoomType.value = '';
    selectedFeatures.value = [];
};

const downloadReservation = () => {
    ElNotification({
        title: 'Téléchargement',
        message: 'Le récapitulatif de votre réservation a été téléchargé.',
        type: 'success'
    });
};

// Événements d'interaction utilisateur
const onDateChange = (date) => {
    selectedDate.value = date;
    filterRooms();
};

const onTimeSlotChange = (timeSlot) => {
    selectedTimeSlot.value = timeSlot;
    filterRooms();
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

    // Si l'utilisateur essayait de réserver, on peut rouvrir la modal de réservation
    if (selectedRoom.value) {
        openReservationModal(selectedRoom.value);
    }
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

// Fonctions de cycle de vie
onMounted(() => {
    // Simuler le chargement des données
    setTimeout(() => {
        isLoading.value = false;
    }, 800);
});
</script>

<style scoped>
.room-page {
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

.room-hero-content p {
    font-size: 1.2rem;
    font-weight: 300;
}

.room-content {
    width: 90%;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 60px;
    flex-grow: 1;
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
.time-filter,
.capacity-filter,
.type-filter {
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

.view-controls {
    display: flex;
    align-items: center;
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
    background-size: cover;
    background-position: center;
    position: relative;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
.room-dimension,
.room-floor {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #555;
    font-size: 0.9rem;
}

.room-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}

.feature-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: #f0f6ff;
    color: #1e88e5;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
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

.loading-container {
    margin-top: 30px;
}

.no-results {
    text-align: center;
    padding: 50px 0;
}

/* Modal de détails */
:deep(.room-details-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
}

:deep(.el-dialog__body) {
    padding: 0;
}

.room-details-container {
    padding: 30px;
}

.room-details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.room-details-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.room-details-content {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
}

.room-details-gallery {
    flex: 0 0 350px;
}

.room-details-image {
    height: 250px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-details-info {
    flex: 1;
}

.details-section {
    margin-bottom: 24px;
}

.details-section h3 {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
    position: relative;
    padding-bottom: 8px;
}

.details-section h3:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
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
}

.detail-value {
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
    padding: 6px 12px;
    border-radius: 4px;
}

.room-details-description {
    line-height: 1.7;
    color: #555;
}

.room-rules {
    padding-left: 20px;
    color: #555;
}

.room-rules li {
    margin-bottom: 8px;
}

.room-details-actions {
    text-align: center;
}

/* Modal de réservation */
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
    background-size: cover;
    background-position: center;
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
    margin-bottom: 12px;
    line-height: 1.6;
}

.confirmation-id {
    font-size: 1rem;
    color: #555;
    margin-bottom: 24px;
    background-color: #f7f9fc;
    padding: 10px;
    border-radius: 6px;
    display: inline-block;
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

    .room-details-content {
        flex-direction: column;
    }

    .room-details-gallery {
        flex: none;
        margin-bottom: 20px;
    }

    .details-grid {
        grid-template-columns: 1fr;
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

    .reservation-form .form-row {
        flex-direction: column;
        gap: 0;
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
