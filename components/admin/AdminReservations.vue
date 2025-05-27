<template>
    <div class="admin-reservations">
        <div class="section-header">
            <h3>Gestion des réservations de salles</h3>
            <el-button type="primary" @click="openNewReservationModal">
                <el-icon><Plus /></el-icon> Nouvelle réservation
            </el-button>
        </div>

        <div class="search-filter-container">
            <el-input
                v-model="searchQuery"
                placeholder="Rechercher une réservation..."
                prefix-icon="Search"
                clearable
                @clear="resetFilters"
                @input="filterReservations"
                class="filter-input"
            />

            <el-select
                v-model="statusFilter"
                placeholder="Statut"
                clearable
                @change="filterReservations"
                class="filter-select"
            >
                <el-option label="À venir" value="upcoming" />
                <el-option label="En cours" value="ongoing" />
                <el-option label="Terminée" value="completed" />
                <el-option label="Annulée" value="cancelled" />
            </el-select>

            <el-date-picker
                v-model="dateFilter"
                type="date"
                placeholder="Date"
                @change="filterReservations"
                class="filter-date"
            />
        </div>

        <el-table
            :data="paginatedReservations"
            style="width: 100%"
            v-loading="loading"
            stripe
            border
        >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="roomName" label="Salle" sortable />
            <el-table-column prop="userName" label="Utilisateur" sortable />
            <el-table-column prop="date" label="Date" sortable width="120" />
            <el-table-column
                prop="timeSlot"
                label="Horaire"
                sortable
                width="120"
            >
                <template #default="scope">
                    {{ formatTimeSlot(scope.row.timeSlot) }}
                </template>
            </el-table-column>
            <el-table-column
                prop="participants"
                label="Participants"
                sortable
                width="120"
            />
            <el-table-column prop="purpose" label="Motif" width="150">
                <template #default="scope">
                    {{ getPurposeLabel(scope.row.purpose) }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="Statut" sortable width="120">
                <template #default="scope">
                    <el-tag
                        :type="getReservationStatusType(scope.row.status)"
                        size="large"
                        effect="light"
                    >
                        {{ getReservationStatusLabel(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="180">
                <template #default="scope">
                    <el-button-group>
                        <el-button
                            type="primary"
                            size="small"
                            @click="viewReservationDetails(scope.row)"
                            title="Voir les détails"
                        >
                            <el-icon><View /></el-icon>
                        </el-button>
                        <el-button
                            type="warning"
                            size="small"
                            @click="confirmCancelReservation(scope.row)"
                            title="Annuler la réservation"
                            :disabled="
                                ['completed', 'cancelled'].includes(
                                    scope.row.status
                                )
                            "
                        >
                            <el-icon><Close /></el-icon>
                        </el-button>
                        <el-button
                            type="danger"
                            size="small"
                            @click="confirmDeleteReservation(scope.row)"
                            title="Supprimer"
                        >
                            <el-icon><Delete /></el-icon>
                        </el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredReservations.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- Modal de nouvelle réservation -->
        <el-dialog
            v-model="reservationModal.visible"
            title="Nouvelle réservation de salle"
            width="700px"
            @close="closeReservationModal"
        >
            <el-form
                :model="reservationModal.form"
                :rules="reservationValidationRules"
                ref="reservationFormRef"
                label-position="top"
            >
                <el-form-item label="Utilisateur" prop="userId">
                    <el-select
                        v-model="reservationModal.form.userId"
                        filterable
                        remote
                        placeholder="Rechercher un utilisateur..."
                        :remote-method="searchUsers"
                        :loading="reservationModal.userSearchLoading"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="user in reservationModal.userOptions"
                            :key="user.id"
                            :label="user.name"
                            :value="user.id"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="Salle" prop="roomId">
                    <el-select
                        v-model="reservationModal.form.roomId"
                        filterable
                        placeholder="Sélectionner une salle"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="room in rooms"
                            :key="room.id"
                            :label="room.name"
                            :value="room.id"
                        >
                            <div class="room-option">
                                <div class="room-option-info">
                                    <div class="room-option-name">
                                        {{ room.name }}
                                    </div>
                                    <div class="room-option-type">
                                        {{ room.type }} - Capacité:
                                        {{ room.capacity }}
                                    </div>
                                </div>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>

                <div class="form-row">
                    <el-form-item label="Date" prop="date">
                        <el-date-picker
                            v-model="reservationModal.form.date"
                            type="date"
                            placeholder="Date de réservation"
                            format="DD/MM/YYYY"
                            style="width: 100%"
                            :disabled-date="disablePastDates"
                        />
                    </el-form-item>
                    <el-form-item label="Créneau horaire" prop="timeSlot">
                        <el-select
                            v-model="reservationModal.form.timeSlot"
                            placeholder="Sélectionner un créneau"
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

                <div class="form-row">
                    <el-form-item
                        label="Nombre de participants"
                        prop="participants"
                    >
                        <el-input-number
                            v-model="reservationModal.form.participants"
                            :min="1"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="Motif" prop="purpose">
                        <el-select
                            v-model="reservationModal.form.purpose"
                            placeholder="Motif de la réservation"
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
                </div>

                <el-form-item label="Commentaire" prop="comment">
                    <el-input
                        v-model="reservationModal.form.comment"
                        type="textarea"
                        rows="3"
                        placeholder="Commentaire ou précisions..."
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeReservationModal"
                        >Annuler</el-button
                    >
                    <el-button
                        type="primary"
                        @click="saveReservation"
                        :loading="reservationModal.loading"
                    >
                        Créer la réservation
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- Dialog de confirmation -->
        <el-dialog
            v-model="confirmDialog.visible"
            title="Confirmation"
            width="400px"
        >
            <div class="confirm-dialog-content">
                <el-icon class="confirm-icon" :class="confirmDialog.iconClass"
                    ><WarningFilled
                /></el-icon>
                <p>{{ confirmDialog.message }}</p>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="confirmDialog.visible = false"
                        >Annuler</el-button
                    >
                    <el-button
                        :type="confirmDialog.confirmButtonType"
                        @click="confirmAction"
                        :loading="confirmDialog.loading"
                    >
                        {{ confirmDialog.confirmButtonText }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
    Plus,
    Delete,
    View,
    Close,
    Search,
    WarningFilled
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// État
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const dateFilter = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

// Liste des créneaux horaires
const timeSlots = [
    { value: '09-11', label: '9h - 11h' },
    { value: '11-13', label: '11h - 13h' },
    { value: '13-15', label: '13h - 15h' },
    { value: '15-17', label: '15h - 17h' },
    { value: '17-19', label: '17h - 19h' },
    { value: '19-21', label: '19h - 21h' }
];

// Données des salles
const rooms = ref([
    {
        id: 1,
        name: "Salle d'étude A1",
        type: 'Individuelle',
        capacity: 2,
        floor: '1er étage, aile Est',
        features: ['wifi', 'whiteboard'],
        imageUrl: '/api/placeholder/400/250?text=Salle+A1'
    },
    {
        id: 2,
        name: 'Salle de groupe B2',
        type: 'Groupe',
        capacity: 6,
        floor: '1er étage, aile Ouest',
        features: ['wifi', 'whiteboard', 'projector'],
        imageUrl: '/api/placeholder/400/250?text=Salle+B2'
    },
    {
        id: 3,
        name: 'Salle de conférence C1',
        type: 'Présentation',
        capacity: 12,
        floor: '2ème étage, aile centrale',
        features: ['wifi', 'projector', 'whiteboard'],
        imageUrl: '/api/placeholder/400/250?text=Salle+C1'
    }
]);

// Données des utilisateurs (pour la recherche)
const users = ref([
    {
        id: 1,
        name: 'Admin Test',
        email: 'admin@bibliotheque.fr'
    },
    {
        id: 2,
        name: 'Sophie Moreau',
        email: 'sophie.moreau@email.com'
    },
    {
        id: 3,
        name: 'Thomas Laurent',
        email: 'thomas.laurent@email.com'
    },
    {
        id: 4,
        name: 'Marie Martin',
        email: 'marie.martin@email.com'
    },
    {
        id: 5,
        name: 'Paul Dupont',
        email: 'paul.dupont@email.com'
    }
]);

// Données des réservations
const reservations = ref([
    {
        id: 1,
        roomId: 2,
        roomName: 'Salle de groupe B2',
        userId: 3,
        userName: 'Thomas Laurent',
        date: '10/04/2025',
        timeSlot: '09-11',
        participants: 4,
        purpose: 'group',
        comment: 'Préparation présentation projet',
        status: 'upcoming'
    },
    {
        id: 2,
        roomId: 3,
        roomName: 'Salle de conférence C1',
        userId: 4,
        userName: 'Marie Martin',
        date: '12/04/2025',
        timeSlot: '15-17',
        participants: 8,
        purpose: 'presentation',
        comment: 'Présentation de thèse',
        status: 'upcoming'
    },
    {
        id: 3,
        roomId: 1,
        roomName: "Salle d'étude A1",
        userId: 5,
        userName: 'Paul Dupont',
        date: '05/04/2025',
        timeSlot: '11-13',
        participants: 2,
        purpose: 'study',
        comment: '',
        status: 'cancelled'
    },
    {
        id: 4,
        roomId: 2,
        roomName: 'Salle de groupe B2',
        userId: 2,
        userName: 'Sophie Moreau',
        date: '01/04/2025',
        timeSlot: '13-15',
        participants: 5,
        purpose: 'meeting',
        comment: 'Réunion équipe marketing',
        status: 'completed'
    }
]);

// État du modal de nouvelle réservation
const reservationModal = ref({
    visible: false,
    loading: false,
    userSearchLoading: false,
    userOptions: [],
    form: {
        userId: null,
        roomId: null,
        date: new Date(),
        timeSlot: '',
        participants: 1,
        purpose: '',
        comment: ''
    }
});

// État du dialog de confirmation
const confirmDialog = ref({
    visible: false,
    message: '',
    confirmButtonText: 'Confirmer',
    confirmButtonType: 'danger',
    iconClass: 'warning',
    callback: null,
    reservationId: null,
    loading: false
});

// Référence au formulaire
const reservationFormRef = ref(null);

// Règles de validation
const reservationValidationRules = {
    userId: [
        {
            required: true,
            message: 'Veuillez sélectionner un utilisateur',
            trigger: 'change'
        }
    ],
    roomId: [
        {
            required: true,
            message: 'Veuillez sélectionner une salle',
            trigger: 'change'
        }
    ],
    date: [
        {
            required: true,
            message: 'Veuillez sélectionner une date',
            trigger: 'change'
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
            message: 'Veuillez saisir le nombre de participants',
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

// Chargement des données
const loadReservations = async () => {
    loading.value = true;
    try {
        const api = (await import('@/services/api')).default;

        // Récupérer les réservations, salles et utilisateurs
        const [reservationsData, roomsData, usersData] = await Promise.all([
            api.roomReservations.getAll(),
            api.rooms.getAll(),
            api.users.getAll()
        ]);

        rooms.value = roomsData;
        users.value = usersData.map((user) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email
        }));

        // Transformer les données des réservations
        reservations.value = reservationsData.map((reservation) => {
            const room = roomsData.find((r) => r.id === reservation.room_id);
            const user = usersData.find((u) => u.id === reservation.user_id);

            // Déterminer le statut basé sur la date
            const reservationDate = new Date(reservation.date);
            const now = new Date();
            let status = 'upcoming';

            if (reservationDate < now) {
                status = 'completed';
            } else if (Math.abs(reservationDate - now) < 24 * 60 * 60 * 1000) {
                status = 'ongoing';
            }

            return {
                id: reservation.id,
                roomId: reservation.room_id,
                roomName: room ? room.name : 'Salle inconnue',
                userId: reservation.user_id,
                userName: user
                    ? `${user.first_name} ${user.last_name}`
                    : 'Utilisateur inconnu',
                date: reservationDate.toLocaleDateString('fr-FR'),
                dateTime: reservation.date,
                status: status,
                participants: 1, // Par défaut
                purpose: 'study', // Par défaut
                comment: ''
            };
        });
    } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        ElMessage({
            type: 'error',
            message:
                error.message ||
                'Impossible de charger les réservations. Veuillez réessayer.'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await loadReservations();
});

// Réservations filtrées selon les critères de recherche
const filteredReservations = computed(() => {
    let result = [...reservations.value];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (reservation) =>
                reservation.roomName.toLowerCase().includes(query) ||
                reservation.userName.toLowerCase().includes(query) ||
                (reservation.comment &&
                    reservation.comment.toLowerCase().includes(query))
        );
    }

    if (statusFilter.value) {
        result = result.filter(
            (reservation) => reservation.status === statusFilter.value
        );
    }

    if (dateFilter.value) {
        const selectedDate = dateFilter.value.toLocaleDateString('fr-FR');
        result = result.filter(
            (reservation) => reservation.date === selectedDate
        );
    }

    return result;
});

// Réservations paginées
const paginatedReservations = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredReservations.value.slice(
        startIndex,
        startIndex + pageSize.value
    );
});

// Fonctions
const getReservationStatusLabel = (status) => {
    switch (status) {
        case 'upcoming':
            return 'À venir';
        case 'ongoing':
            return 'En cours';
        case 'completed':
            return 'Terminée';
        case 'cancelled':
            return 'Annulée';
        default:
            return status;
    }
};

const getReservationStatusType = (status) => {
    switch (status) {
        case 'upcoming':
            return 'info';
        case 'ongoing':
            return 'warning';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'info';
    }
};

const formatTimeSlot = (timeSlot) => {
    const slot = timeSlots.find((s) => s.value === timeSlot);
    return slot ? slot.label : timeSlot;
};

const getPurposeLabel = (purpose) => {
    switch (purpose) {
        case 'group':
            return 'Travail de groupe';
        case 'meeting':
            return 'Réunion';
        case 'study':
            return "Session d'étude";
        case 'presentation':
            return 'Présentation';
        case 'other':
            return 'Autre';
        default:
            return purpose;
    }
};

const disablePastDates = (date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
};

const resetFilters = () => {
    searchQuery.value = '';
    statusFilter.value = '';
    dateFilter.value = null;
    currentPage.value = 1;
};

const filterReservations = () => {
    currentPage.value = 1;
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};

const openNewReservationModal = () => {
    reservationModal.value.form = {
        userId: null,
        roomId: null,
        date: new Date(),
        timeSlot: '',
        participants: 1,
        purpose: '',
        comment: ''
    };
    reservationModal.value.visible = true;
};

const closeReservationModal = () => {
    reservationModal.value.visible = false;
};

const searchUsers = (query) => {
    reservationModal.value.userSearchLoading = true;

    setTimeout(() => {
        if (query) {
            const search = query.toLowerCase();
            reservationModal.value.userOptions = users.value
                .filter(
                    (user) =>
                        user.name.toLowerCase().includes(search) ||
                        user.email.toLowerCase().includes(search)
                )
                .map((user) => ({
                    id: user.id,
                    name: `${user.name} (${user.email})`
                }));
        } else {
            reservationModal.value.userOptions = users.value.map((user) => ({
                id: user.id,
                name: `${user.name} (${user.email})`
            }));
        }

        reservationModal.value.userSearchLoading = false;
    }, 500);
};

const saveReservation = () => {
    reservationFormRef.value.validate((valid) => {
        if (valid) {
            reservationModal.value.loading = true;

            setTimeout(() => {
                // Récupérer les informations de la salle et de l'utilisateur
                const room = rooms.value.find(
                    (r) => r.id === reservationModal.value.form.roomId
                );
                const user = users.value.find(
                    (u) => u.id === reservationModal.value.form.userId
                );

                if (room && user) {
                    // Ajouter la nouvelle réservation
                    const newReservation = {
                        id:
                            reservations.value.length > 0
                                ? Math.max(
                                      ...reservations.value.map((r) => r.id)
                                  ) + 1
                                : 1,
                        roomId: room.id,
                        roomName: room.name,
                        userId: user.id,
                        userName: user.name,
                        date: reservationModal.value.form.date.toLocaleDateString(
                            'fr-FR'
                        ),
                        timeSlot: reservationModal.value.form.timeSlot,
                        participants: reservationModal.value.form.participants,
                        purpose: reservationModal.value.form.purpose,
                        comment: reservationModal.value.form.comment,
                        status: 'upcoming'
                    };

                    reservations.value.push(newReservation);

                    ElMessage({
                        type: 'success',
                        message: 'Réservation créée avec succès'
                    });
                }

                reservationModal.value.loading = false;
                reservationModal.value.visible = false;
            }, 1000);
        }
    });
};

const viewReservationDetails = (reservation) => {
    ElMessageBox.alert(
        `<div class="reservation-details">
      <p><strong>Salle:</strong> ${reservation.roomName}</p>
      <p><strong>Membre:</strong> ${reservation.userName}</p>
      <p><strong>Date:</strong> ${reservation.date}</p>
      <p><strong>Horaire:</strong> ${formatTimeSlot(reservation.timeSlot)}</p>
      <p><strong>Participants:</strong> ${reservation.participants}</p>
      <p><strong>Motif:</strong> ${getPurposeLabel(reservation.purpose)}</p>
      ${
          reservation.comment
              ? `<p><strong>Commentaire:</strong> ${reservation.comment}</p>`
              : ''
      }
      <p><strong>Statut:</strong> ${getReservationStatusLabel(
          reservation.status
      )}</p>
    </div>`,
        'Détails de la réservation',
        {
            dangerouslyUseHTMLString: true,
            confirmButtonText: 'Fermer'
        }
    );
};

const confirmCancelReservation = (reservation) => {
    if (['completed', 'cancelled'].includes(reservation.status)) {
        ElMessage({
            type: 'warning',
            message: 'Cette réservation ne peut pas être annulée'
        });
        return;
    }

    confirmDialog.value = {
        visible: true,
        message: `Êtes-vous sûr de vouloir annuler cette réservation pour la salle "${reservation.roomName}" ?`,
        confirmButtonText: 'Annuler la réservation',
        confirmButtonType: 'warning',
        iconClass: 'warning',
        callback: () => cancelReservation(reservation.id),
        loading: false
    };
};

const cancelReservation = (reservationId) => {
    confirmDialog.value.loading = true;

    setTimeout(() => {
        const index = reservations.value.findIndex(
            (r) => r.id === reservationId
        );

        if (index !== -1) {
            const updatedReservation = {
                ...reservations.value[index],
                status: 'cancelled'
            };
            reservations.value[index] = updatedReservation;

            ElMessage({
                type: 'success',
                message: 'Réservation annulée avec succès'
            });
        }

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    }, 800);
};

const confirmDeleteReservation = (reservation) => {
    confirmDialog.value = {
        visible: true,
        message: `Êtes-vous sûr de vouloir supprimer cette réservation pour la salle "${reservation.roomName}" ?`,
        confirmButtonText: 'Supprimer',
        confirmButtonType: 'danger',
        iconClass: 'warning',
        callback: () => deleteReservation(reservation.id),
        loading: false
    };
};

const deleteReservation = (reservationId) => {
    confirmDialog.value.loading = true;

    setTimeout(() => {
        const index = reservations.value.findIndex(
            (r) => r.id === reservationId
        );

        if (index !== -1) {
            reservations.value.splice(index, 1);

            ElMessage({
                type: 'success',
                message: 'Réservation supprimée avec succès'
            });
        }

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    }, 800);
};

const confirmAction = () => {
    if (confirmDialog.value.callback) {
        confirmDialog.value.callback();
    }
};
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-reservations {
    padding: 15px 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.search-filter-container {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.filter-input {
    flex: 2;
    min-width: 200px;
}

.filter-select {
    flex: 1;
    min-width: 150px;
}

.filter-date {
    flex: 1;
    min-width: 200px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-row .el-form-item {
    flex: 1;
    margin-bottom: 0;
}

.room-option {
    display: flex;
    flex-direction: column;
}

.room-option-name {
    font-weight: 600;
    color: #333;
}

.room-option-type {
    font-size: 0.9rem;
    color: #666;
}

.confirm-dialog-content {
    text-align: center;
    padding: 10px 0 20px;
}

.confirm-icon {
    font-size: 50px;
    color: #f56c6c;
    margin-bottom: 20px;
}

.confirm-icon.warning {
    color: #f56c6c;
}

/* Pour le contenu injecté par dangerouslyUseHTMLString */
:deep(.reservation-details) {
    text-align: left;
    line-height: 1.6;
}

:deep(.reservation-details p) {
    margin: 8px 0;
}

/* Responsive */
@media (max-width: 768px) {
    .search-filter-container {
        flex-direction: column;
        gap: 10px;
    }

    .filter-input,
    .filter-select,
    .filter-date {
        width: 100%;
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }
}
</style>
