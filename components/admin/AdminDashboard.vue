<template>
    <div class="admin-dashboard">
        <div class="dashboard-stats">
            <div class="stat-card" v-for="(stat, index) in stats" :key="index">
                <el-icon class="stat-icon" :size="40">
                    <component :is="stat.icon" />
                </el-icon>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
            </div>
        </div>

        <div class="dashboard-sections">
            <div class="dashboard-section">
                <h3 class="section-title">
                    <el-icon><Reading /></el-icon>
                    Emprunts récents
                </h3>
                <div class="content-card">
                    <div v-if="recentBorrows.length === 0" class="empty-state">
                        <el-icon :size="60" class="empty-icon">
                            <CircleCheckFilled />
                        </el-icon>
                        <p>Aucun emprunt récent.</p>
                    </div>
                    <el-table v-else :data="recentBorrows" stripe>
                        <el-table-column prop="bookTitle" label="Livre" />
                        <el-table-column prop="userName" label="Utilisateur" />
                        <el-table-column
                            prop="borrowDate"
                            label="Date d'emprunt"
                            width="150"
                        />
                        <el-table-column
                            prop="status"
                            label="Statut"
                            width="120"
                        >
                            <template #default="{ row }">
                                <el-tag
                                    :type="getBorrowStatusType(row.status)"
                                    size="small"
                                >
                                    {{ getBorrowStatusLabel(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <div class="dashboard-section">
                <h3 class="section-title">
                    <el-icon><Calendar /></el-icon>
                    Réservations de salles récentes
                </h3>
                <div class="content-card">
                    <div
                        v-if="recentRoomReservations.length === 0"
                        class="empty-state"
                    >
                        <el-icon :size="60" class="empty-icon">
                            <CircleCheckFilled />
                        </el-icon>
                        <p>Aucune réservation de salle récente.</p>
                    </div>
                    <el-table v-else :data="recentRoomReservations" stripe>
                        <el-table-column label="Salle" width="100">
                            <template #default="{ row }">
                                Salle n°{{ row.roomId }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="userName" label="Utilisateur" />
                        <el-table-column prop="date" label="Date" width="120" />
                        <el-table-column
                            prop="status"
                            label="Statut"
                            width="120"
                        >
                            <template #default="{ row }">
                                <el-tag
                                    :type="getRoomStatusType(row.status)"
                                    size="small"
                                >
                                    {{ getRoomStatusLabel(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>

        <div class="dashboard-sections">
            <div class="dashboard-section">
                <h3 class="section-title">
                    <el-icon><User /></el-icon>
                    Utilisateurs récents
                </h3>
                <div class="content-card">
                    <div v-if="recentUsers.length === 0" class="empty-state">
                        <el-icon :size="60" class="empty-icon">
                            <CircleCheckFilled />
                        </el-icon>
                        <p>Aucun nouvel utilisateur récemment.</p>
                    </div>
                    <el-table v-else :data="recentUsers" stripe>
                        <el-table-column prop="name" label="Nom" />
                        <el-table-column prop="email" label="Email" />
                        <el-table-column prop="role" label="Rôle" width="140">
                            <template #default="{ row }">
                                <el-tag
                                    :type="getRoleTagType(row.role)"
                                    size="small"
                                >
                                    {{ getRoleLabel(row.role) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="memberSince"
                            label="Inscrit le"
                            width="120"
                        />
                    </el-table>
                </div>
            </div>

            <div class="dashboard-section">
                <h3 class="section-title">
                    <el-icon><Reading /></el-icon>
                    Livres les plus populaires
                </h3>
                <div class="content-card">
                    <div v-if="popularBooks.length === 0" class="empty-state">
                        <el-icon :size="60" class="empty-icon">
                            <CircleCheckFilled />
                        </el-icon>
                        <p>Aucune donnée de popularité disponible.</p>
                    </div>
                    <el-table v-else :data="popularBooks" stripe>
                        <el-table-column prop="title" label="Titre" />
                        <el-table-column prop="author" label="Auteur" />
                        <el-table-column
                            prop="borrowCount"
                            label="Emprunts"
                            width="100"
                        />
                        <el-table-column prop="rating" label="Note" width="100">
                            <template #default="{ row }">
                                <el-rate
                                    v-model="row.rating"
                                    disabled
                                    size="small"
                                    show-score
                                    text-color="#ff9900"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    Reading,
    OfficeBuilding,
    User,
    Calendar,
    CircleCheckFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// Statistiques principales
const stats = ref([
    { label: 'Livres', value: '0', icon: Reading },
    { label: 'Salles', value: '0', icon: OfficeBuilding },
    { label: 'Utilisateurs', value: '0', icon: User },
    { label: 'Emprunts actifs', value: '0', icon: Calendar }
]);

// Données du tableau de bord
const recentBorrows = ref([]);
const recentRoomReservations = ref([]);
const recentUsers = ref([]);
const popularBooks = ref([]);

// État de chargement
const loading = ref(true);

// Charger toutes les données du tableau de bord
const loadDashboardData = async () => {
    loading.value = true;
    try {
        const api = (await import('@/services/api')).default;

        // Charger toutes les données en parallèle
        const [
            booksData,
            roomsData,
            usersData,
            bookReservationsData,
            roomReservationsData,
            authorsData
        ] = await Promise.all([
            api.get('/books').catch(() => []),
            api.get('/rooms').catch(() => []),
            api.get('/users').catch(() => []),
            api.get('/reservation/books').catch(() => []),
            api.get('/reservation/rooms').catch(() => []),
            api.get('/authors').catch(() => [])
        ]);

        // Mettre à jour les statistiques
        const activeBookReservations = bookReservationsData.filter(
            (r) => !r.return_date
        );

        stats.value = [
            {
                label: 'Livres',
                value: booksData.length.toString(),
                icon: Reading
            },
            {
                label: 'Salles',
                value: roomsData.length.toString(),
                icon: OfficeBuilding
            },
            {
                label: 'Utilisateurs',
                value: usersData.length.toString(),
                icon: User
            },
            {
                label: 'Emprunts actifs',
                value: activeBookReservations.length.toString(),
                icon: Calendar
            }
        ];

        // Créer un map des auteurs pour accès rapide
        const authorsMap = {};
        authorsData.forEach((author) => {
            authorsMap[author.id] = `${author.firstname} ${author.lastname}`;
        });

        // Créer un map des utilisateurs pour accès rapide
        const usersMap = {};
        usersData.forEach((user) => {
            usersMap[user.id] = `${user.first_name} ${user.last_name}`;
        });

        // Créer un map des livres pour accès rapide
        const booksMap = {};
        booksData.forEach((book) => {
            booksMap[book.isbn] = {
                title: book.title,
                author: authorsMap[book.author] || 'Auteur inconnu'
            };
        });

        // Traiter les emprunts récents (limité aux 10 plus récents)
        recentBorrows.value = bookReservationsData
            .sort((a, b) => new Date(b.start) - new Date(a.start))
            .slice(0, 10)
            .map((reservation) => ({
                bookTitle:
                    booksMap[reservation.book_id]?.title || 'Livre inconnu',
                userName:
                    usersMap[reservation.user_id] || 'Utilisateur inconnu',
                borrowDate: new Date(reservation.start).toLocaleDateString(
                    'fr-FR'
                ),
                status: reservation.return_date ? 'returned' : 'active'
            }));

        // Traiter les réservations de salles récentes (limité aux 10 plus récentes)
        recentRoomReservations.value = roomReservationsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map((reservation) => ({
                roomId: reservation.room_id,
                userName:
                    usersMap[reservation.user_id] || 'Utilisateur inconnu',
                date: new Date(reservation.date).toLocaleDateString('fr-FR'),
                status:
                    new Date(reservation.date) < new Date()
                        ? 'past'
                        : 'upcoming'
            }));

        // Traiter les utilisateurs récents (limité aux 5 plus récents)
        recentUsers.value = usersData
            .sort(
                (a, b) =>
                    new Date(b.created_at || 0) - new Date(a.created_at || 0)
            )
            .slice(0, 5)
            .map((user) => ({
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role,
                memberSince: user.created_at
                    ? new Date(user.created_at).toLocaleDateString('fr-FR')
                    : 'Date inconnue'
            }));

        // Calculer les livres les plus populaires basés sur les emprunts
        const bookBorrowCounts = {};
        bookReservationsData.forEach((reservation) => {
            const bookId = reservation.book_id;
            bookBorrowCounts[bookId] = (bookBorrowCounts[bookId] || 0) + 1;
        });

        // Créer la liste des livres populaires
        popularBooks.value = Object.entries(bookBorrowCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([bookId, count]) => {
                const bookData = booksData.find((book) => book.isbn === bookId);
                return {
                    title: bookData?.title || 'Livre inconnu',
                    author: authorsMap[bookData?.author] || 'Auteur inconnu',
                    borrowCount: count,
                    rating: parseFloat(bookData?.average_rating) || 0
                };
            });
    } catch (error) {
        console.error(
            'Erreur lors du chargement des données du tableau de bord:',
            error
        );
        ElMessage.error(
            'Erreur lors du chargement des données du tableau de bord'
        );
    } finally {
        loading.value = false;
    }
};

// Fonctions utilitaires pour les statuts
const getBorrowStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'En cours';
        case 'returned':
            return 'Retourné';
        default:
            return status;
    }
};

const getBorrowStatusType = (status) => {
    switch (status) {
        case 'active':
            return 'warning';
        case 'returned':
            return 'success';
        default:
            return 'info';
    }
};

const getRoomStatusLabel = (status) => {
    switch (status) {
        case 'upcoming':
            return 'À venir';
        case 'past':
            return 'Passée';
        default:
            return status;
    }
};

const getRoomStatusType = (status) => {
    switch (status) {
        case 'upcoming':
            return 'warning';
        case 'past':
            return 'info';
        default:
            return 'info';
    }
};

const getRoleLabel = (role) => {
    switch (role) {
        case 2:
            return 'Administrateur';
        case 1:
            return 'Bibliothécaire';
        case 0:
            return 'Membre';
        default:
            return 'Membre';
    }
};

const getRoleTagType = (role) => {
    switch (role) {
        case 2:
            return 'danger';
        case 1:
            return 'warning';
        case 0:
            return 'info';
        default:
            return 'info';
    }
};

// Charger les données au montage du composant
onMounted(() => {
    loadDashboardData();
});
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-dashboard {
    padding: 0;
}

.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background-color: white;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    color: #1e88e5;
    margin-bottom: 15px;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
}

.stat-label {
    color: #666;
    font-size: 1rem;
}

.dashboard-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.dashboard-section {
    display: flex;
    flex-direction: column;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-title .el-icon {
    color: #1e88e5;
}

.content-card {
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    flex-grow: 1;
}

.empty-state {
    text-align: center;
    padding: 30px 0;
}

.empty-icon {
    color: #4caf50;
    margin-bottom: 15px;
}

.empty-state p {
    color: #666;
    margin: 0;
}

/* Responsive */
@media (max-width: 992px) {
    .dashboard-sections {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 576px) {
    .dashboard-stats {
        grid-template-columns: 1fr;
    }
}
</style>
