<template>
    <div class="profile-page">
        <div class="profile-hero">
            <div class="overlay"></div>
            <div class="profile-hero-content">
                <h1>Mon Profil</h1>
                <p>
                    Gérez vos informations personnelles et consultez votre
                    activité
                </p>
            </div>
        </div>

        <main class="profile-content" v-if="!loading">
            <div class="profile-layout">
                <!-- Sidebar Navigation -->
                <div class="profile-sidebar">
                    <div class="profile-card">
                        <div class="avatar-section">
                            <el-avatar :size="80" :src="user.avatar" />
                            <h3>{{ user.first_name }} {{ user.last_name }}</h3>
                            <p class="user-email">{{ user.email }}</p>
                            <el-tag :type="getRoleType(user.role)" size="large">
                                {{ getRoleLabel(user.role) }}
                            </el-tag>
                        </div>
                    </div>

                    <el-menu
                        :default-active="activeTab"
                        class="profile-menu"
                        @select="activeTab = $event"
                    >
                        <el-menu-item index="info">
                            <el-icon><User /></el-icon>
                            <span>Informations personnelles</span>
                        </el-menu-item>
                        <el-menu-item index="books">
                            <el-icon><Reading /></el-icon>
                            <span>Mes emprunts</span>
                        </el-menu-item>
                        <el-menu-item index="rooms">
                            <el-icon><OfficeBuilding /></el-icon>
                            <span>Mes réservations</span>
                        </el-menu-item>
                        <el-menu-item index="security">
                            <el-icon><Lock /></el-icon>
                            <span>Sécurité</span>
                        </el-menu-item>
                    </el-menu>
                </div>

                <!-- Main Content -->
                <div class="profile-main">
                    <!-- Informations personnelles -->
                    <div v-if="activeTab === 'info'" class="tab-content">
                        <div class="section-header">
                            <h2>Informations personnelles</h2>
                            <el-button
                                type="primary"
                                @click="editMode = !editMode"
                                :icon="editMode ? Close : Edit"
                            >
                                {{ editMode ? 'Annuler' : 'Modifier' }}
                            </el-button>
                        </div>

                        <el-form
                            :model="userForm"
                            :rules="userRules"
                            ref="userFormRef"
                            label-position="top"
                            class="user-form"
                        >
                            <div class="form-row">
                                <el-form-item label="Prénom" prop="first_name">
                                    <el-input
                                        v-model="userForm.first_name"
                                        :disabled="!editMode"
                                    />
                                </el-form-item>
                                <el-form-item label="Nom" prop="last_name">
                                    <el-input
                                        v-model="userForm.last_name"
                                        :disabled="!editMode"
                                    />
                                </el-form-item>
                            </div>

                            <el-form-item label="Email" prop="email">
                                <el-input
                                    v-model="userForm.email"
                                    :disabled="!editMode"
                                />
                            </el-form-item>

                            <el-form-item label="Téléphone" prop="phone">
                                <el-input
                                    v-model="userForm.phone"
                                    :disabled="!editMode"
                                />
                            </el-form-item>

                            <el-form-item label="Adresse" prop="address">
                                <el-input
                                    v-model="userForm.address"
                                    type="textarea"
                                    :rows="3"
                                    :disabled="!editMode"
                                />
                            </el-form-item>

                            <div class="form-actions" v-if="editMode">
                                <el-button
                                    type="primary"
                                    @click="updateProfile"
                                    :loading="updating"
                                >
                                    Enregistrer
                                </el-button>
                                <el-button @click="cancelEdit">
                                    Annuler
                                </el-button>
                            </div>
                        </el-form>
                    </div>

                    <!-- Mes emprunts -->
                    <div v-if="activeTab === 'books'" class="tab-content">
                        <div class="section-header">
                            <h2>Mes emprunts de livres</h2>
                        </div>

                        <div v-if="loadingBooks" class="loading-container">
                            <el-skeleton :rows="5" animated />
                        </div>

                        <div
                            v-else-if="bookReservations.length === 0"
                            class="empty-state"
                        >
                            <el-empty description="Aucun emprunt en cours" />
                        </div>

                        <div v-else class="reservations-list">
                            <div
                                v-for="reservation in bookReservations"
                                :key="reservation.id"
                                class="reservation-card"
                            >
                                <div class="book-info">
                                    <h4>
                                        {{ getBookTitle(reservation.book_id) }}
                                    </h4>
                                    <p class="reservation-date">
                                        Emprunté le
                                        {{ formatDate(reservation.start) }}
                                    </p>
                                    <el-tag
                                        :type="
                                            reservation.return_date
                                                ? 'success'
                                                : 'warning'
                                        "
                                        size="large"
                                    >
                                        {{
                                            reservation.return_date
                                                ? 'Retourné'
                                                : 'En cours'
                                        }}
                                    </el-tag>
                                </div>
                                <div
                                    class="reservation-actions"
                                    v-if="!reservation.return_date"
                                >
                                    <el-button
                                        type="success"
                                        size="small"
                                        @click="returnBook(reservation)"
                                    >
                                        Marquer comme retourné
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mes réservations de salles -->
                    <div v-if="activeTab === 'rooms'" class="tab-content">
                        <div class="section-header">
                            <h2>Mes réservations de salles</h2>
                        </div>

                        <div v-if="loadingRooms" class="loading-container">
                            <el-skeleton :rows="5" animated />
                        </div>

                        <div
                            v-else-if="roomReservations.length === 0"
                            class="empty-state"
                        >
                            <el-empty
                                description="Aucune réservation de salle"
                            />
                        </div>

                        <div v-else class="reservations-list">
                            <div
                                v-for="reservation in roomReservations"
                                :key="reservation.id"
                                class="reservation-card"
                            >
                                <div class="room-info">
                                    <h4>
                                        {{ getRoomName(reservation.room_id) }}
                                    </h4>
                                    <p class="reservation-date">
                                        {{ formatDateTime(reservation.date) }}
                                    </p>
                                    <el-tag type="info" size="large">
                                        Réservée
                                    </el-tag>
                                </div>
                                <div class="reservation-actions">
                                    <el-button
                                        type="danger"
                                        size="small"
                                        @click="
                                            cancelRoomReservation(reservation)
                                        "
                                    >
                                        Annuler
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sécurité -->
                    <div v-if="activeTab === 'security'" class="tab-content">
                        <div class="section-header">
                            <h2>Sécurité</h2>
                        </div>

                        <el-form
                            :model="passwordForm"
                            :rules="passwordRules"
                            ref="passwordFormRef"
                            label-position="top"
                            class="password-form"
                        >
                            <el-form-item
                                label="Mot de passe actuel"
                                prop="currentPassword"
                            >
                                <el-input
                                    v-model="passwordForm.currentPassword"
                                    type="password"
                                    show-password
                                />
                            </el-form-item>

                            <el-form-item
                                label="Nouveau mot de passe"
                                prop="newPassword"
                            >
                                <el-input
                                    v-model="passwordForm.newPassword"
                                    type="password"
                                    show-password
                                />
                            </el-form-item>

                            <el-form-item
                                label="Confirmer le mot de passe"
                                prop="confirmPassword"
                            >
                                <el-input
                                    v-model="passwordForm.confirmPassword"
                                    type="password"
                                    show-password
                                />
                            </el-form-item>

                            <div class="form-actions">
                                <el-button
                                    type="primary"
                                    @click="changePassword"
                                    :loading="changingPassword"
                                >
                                    Changer le mot de passe
                                </el-button>
                            </div>
                        </el-form>

                        <el-divider />

                        <div class="danger-zone">
                            <h3>Zone dangereuse</h3>
                            <p>Cette action est irréversible.</p>
                            <el-button
                                type="danger"
                                @click="confirmDeleteAccount"
                            >
                                Supprimer mon compte
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div v-else class="loading-page">
            <el-skeleton :rows="10" animated />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
    User,
    Reading,
    OfficeBuilding,
    Lock,
    Edit,
    Close
} from '@element-plus/icons-vue';
import { ElNotification, ElMessageBox } from 'element-plus';

definePageMeta({
    middleware: 'auth'
});

const router = useRouter();

// États
const loading = ref(true);
const loadingBooks = ref(false);
const loadingRooms = ref(false);
const updating = ref(false);
const changingPassword = ref(false);
const editMode = ref(false);
const activeTab = ref('info');

// Données utilisateur
const user = ref({});
const userForm = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
});

// Données de réservations
const bookReservations = ref([]);
const roomReservations = ref([]);
const books = ref([]);
const rooms = ref([]);

// Formulaire de mot de passe
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Références des formulaires
const userFormRef = ref();
const passwordFormRef = ref();

// Règles de validation
const userRules = {
    first_name: [
        { required: true, message: 'Le prénom est requis', trigger: 'blur' }
    ],
    last_name: [
        { required: true, message: 'Le nom est requis', trigger: 'blur' }
    ],
    email: [
        { required: true, message: "L'email est requis", trigger: 'blur' },
        { type: 'email', message: 'Email invalide', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: 'Le téléphone est requis', trigger: 'blur' }
    ],
    address: [
        { required: true, message: "L'adresse est requise", trigger: 'blur' }
    ]
};

const passwordRules = {
    currentPassword: [
        {
            required: true,
            message: 'Mot de passe actuel requis',
            trigger: 'blur'
        }
    ],
    newPassword: [
        {
            required: true,
            message: 'Nouveau mot de passe requis',
            trigger: 'blur'
        },
        { min: 8, message: 'Au moins 8 caractères', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: 'Confirmation requise', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== passwordForm.newPassword) {
                    callback(
                        new Error('Les mots de passe ne correspondent pas')
                    );
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
};

// Fonctions utilitaires
const getRoleLabel = (role) => {
    const roles = {
        0: 'Membre',
        1: 'Bibliothécaire',
        2: 'Administrateur'
    };
    return roles[role] || 'Membre';
};

const getRoleType = (role) => {
    const types = {
        0: 'info',
        1: 'warning',
        2: 'danger'
    };
    return types[role] || 'info';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
};

const getBookTitle = (bookId) => {
    const book = books.value.find((b) => b.isbn === bookId);
    return book ? book.title : 'Livre inconnu';
};

const getRoomName = (roomId) => {
    const room = rooms.value.find((r) => r.id === roomId);
    return room ? room.name : 'Salle inconnue';
};

// Chargement des données
const loadUserData = async () => {
    try {
        const api = (await import('@/services/api')).default;
        const userData = await api.get('/me');

        user.value = userData;
        user.value.avatar = `/api/placeholder/100/100?text=${userData.first_name.charAt(
            0
        )}${userData.last_name.charAt(0)}`;

        // Remplir le formulaire
        Object.assign(userForm, {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || ''
        });
    } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de charger vos informations',
            type: 'error'
        });
    }
};

const loadBookReservations = async () => {
    loadingBooks.value = true;
    try {
        const api = (await import('@/services/api')).default;
        const [reservations, booksData] = await Promise.all([
            api.get('/reservation/books/me'),
            api.get('/books')
        ]);

        bookReservations.value = reservations;
        books.value = booksData;
    } catch (error) {
        console.error('Erreur chargement emprunts:', error);
    } finally {
        loadingBooks.value = false;
    }
};

const loadRoomReservations = async () => {
    loadingRooms.value = true;
    try {
        const api = (await import('@/services/api')).default;
        const [reservations, roomsData] = await Promise.all([
            api.get('/reservation/rooms/me'),
            api.get('/rooms')
        ]);

        roomReservations.value = reservations;
        rooms.value = roomsData;
    } catch (error) {
        console.error('Erreur chargement réservations salles:', error);
    } finally {
        loadingRooms.value = false;
    }
};

// Actions utilisateur
const updateProfile = async () => {
    try {
        await userFormRef.value.validate();
        updating.value = true;

        const api = (await import('@/services/api')).default;
        await api.put('/me', userForm);

        // Mettre à jour les données locales
        Object.assign(user.value, userForm);

        editMode.value = false;
        ElNotification({
            title: 'Succès',
            message: 'Profil mis à jour avec succès',
            type: 'success'
        });
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de mettre à jour le profil',
            type: 'error'
        });
    } finally {
        updating.value = false;
    }
};

const cancelEdit = () => {
    editMode.value = false;
    // Restaurer les données originales
    Object.assign(userForm, {
        first_name: user.value.first_name,
        last_name: user.value.last_name,
        email: user.value.email,
        phone: user.value.phone || '',
        address: user.value.address || ''
    });
};

const changePassword = async () => {
    try {
        await passwordFormRef.value.validate();
        changingPassword.value = true;

        const api = (await import('@/services/api')).default;
        await api.post('/reset-password', {
            current_password: passwordForm.currentPassword,
            password: passwordForm.newPassword,
            password_confirmation: passwordForm.confirmPassword
        });

        // Réinitialiser le formulaire
        Object.assign(passwordForm, {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        ElNotification({
            title: 'Succès',
            message: 'Mot de passe changé avec succès',
            type: 'success'
        });
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de changer le mot de passe',
            type: 'error'
        });
    } finally {
        changingPassword.value = false;
    }
};

const returnBook = async (reservation) => {
    try {
        const api = (await import('@/services/api')).default;
        await api.post('/reservation/books/return', {
            book_id: reservation.book_id
        });

        // Recharger les réservations
        await loadBookReservations();

        ElNotification({
            title: 'Succès',
            message: 'Livre marqué comme retourné',
            type: 'success'
        });
    } catch (error) {
        console.error('Erreur retour livre:', error);
        ElNotification({
            title: 'Erreur',
            message: 'Impossible de retourner le livre',
            type: 'error'
        });
    }
};

const cancelRoomReservation = async (reservation) => {
    try {
        await ElMessageBox.confirm(
            'Êtes-vous sûr de vouloir annuler cette réservation ?',
            'Confirmation',
            {
                confirmButtonText: 'Annuler la réservation',
                cancelButtonText: 'Garder',
                type: 'warning'
            }
        );

        const api = (await import('@/services/api')).default;
        await api.delete(`/reservation/rooms/${reservation.id}`);

        // Recharger les réservations
        await loadRoomReservations();

        ElNotification({
            title: 'Succès',
            message: 'Réservation annulée',
            type: 'success'
        });
    } catch (error) {
        if (error !== 'cancel') {
            console.error('Erreur annulation réservation:', error);
            ElNotification({
                title: 'Erreur',
                message: "Impossible d'annuler la réservation",
                type: 'error'
            });
        }
    }
};

const confirmDeleteAccount = async () => {
    try {
        await ElMessageBox.confirm(
            'Cette action supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.',
            'Supprimer le compte',
            {
                confirmButtonText: 'Supprimer définitivement',
                cancelButtonText: 'Annuler',
                type: 'error'
            }
        );

        const api = (await import('@/services/api')).default;
        await api.delete('/me');

        ElNotification({
            title: 'Compte supprimé',
            message: 'Votre compte a été supprimé avec succès',
            type: 'success'
        });

        // Rediriger vers l'accueil
        router.push('/');
    } catch (error) {
        if (error !== 'cancel') {
            console.error('Erreur suppression compte:', error);
            ElNotification({
                title: 'Erreur',
                message: 'Impossible de supprimer le compte',
                type: 'error'
            });
        }
    }
};

// Chargement initial
onMounted(async () => {
    try {
        await loadUserData();
        await Promise.all([loadBookReservations(), loadRoomReservations()]);
    } catch (error) {
        console.error('Erreur chargement initial:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.profile-page {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.profile-hero {
    height: 20vh;
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
    background: linear-gradient(
        rgba(30, 136, 229, 0.8),
        rgba(30, 136, 229, 0.9)
    );
}

.profile-hero-content {
    text-align: center;
    z-index: 2;
    color: white;
}

.profile-hero-content h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.profile-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
}

.profile-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
}

.profile-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.profile-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
}

.avatar-section h3 {
    margin: 15px 0 5px;
    font-size: 1.3rem;
    color: #333;
}

.user-email {
    color: #666;
    margin-bottom: 15px;
}

.profile-menu {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
}

.profile-main {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.tab-content {
    padding: 30px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e88e5;
    margin: 0;
}

.user-form,
.password-form {
    max-width: 600px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-actions {
    margin-top: 30px;
    display: flex;
    gap: 15px;
}

.reservations-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.reservation-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #1e88e5;
}

.book-info h4,
.room-info h4 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    color: #333;
}

.reservation-date {
    margin: 0 0 10px;
    color: #666;
    font-size: 0.9rem;
}

.loading-container,
.loading-page {
    padding: 30px;
}

.empty-state {
    text-align: center;
    padding: 50px;
}

.danger-zone {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 20px;
    margin-top: 30px;
}

.danger-zone h3 {
    color: #dc2626;
    margin: 0 0 10px;
}

.danger-zone p {
    color: #991b1b;
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .profile-layout {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .profile-content {
        padding: 0 15px 40px;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .reservation-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
}
</style>
