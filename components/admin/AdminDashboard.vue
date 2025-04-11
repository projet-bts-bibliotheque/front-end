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
                    <el-icon><Clock /></el-icon>
                    Activité récente
                </h3>
                <div class="content-card">
                    <el-timeline>
                        <el-timeline-item
                            v-for="(activity, index) in recentActivities"
                            :key="index"
                            :timestamp="activity.date"
                            :type="activity.type"
                        >
                            {{ activity.content }}
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </div>

            <div class="dashboard-section">
                <h3 class="section-title">
                    <el-icon><Warning /></el-icon>
                    Alertes
                </h3>
                <div class="content-card">
                    <div v-if="alerts.length === 0" class="empty-state">
                        <el-icon :size="60" class="empty-icon"
                            ><CircleCheckFilled
                        /></el-icon>
                        <p>Aucune alerte à traiter actuellement.</p>
                    </div>
                    <el-collapse v-else accordion>
                        <el-collapse-item
                            v-for="(alert, index) in alerts"
                            :key="index"
                            :title="alert.title"
                        >
                            <div class="alert-content">
                                <p>{{ alert.description }}</p>
                                <div class="alert-actions">
                                    <el-button
                                        size="small"
                                        type="primary"
                                        @click="handleAlert(alert)"
                                    >
                                        {{ alert.actionLabel }}
                                    </el-button>
                                    <el-button
                                        size="small"
                                        @click="dismissAlert(index)"
                                    >
                                        Ignorer
                                    </el-button>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
        </div>

        <div class="dashboard-sections">
            <div class="dashboard-section">
                <h3 class="section-title">
                    <el-icon><Reading /></el-icon>
                    Emprunts récents
                </h3>
                <div class="content-card">
                    <el-table :data="recentBorrows" stripe>
                        <el-table-column prop="bookTitle" label="Livre" />
                        <el-table-column prop="userName" label="Utilisateur" />
                        <el-table-column
                            prop="borrowDate"
                            label="Date d'emprunt"
                            width="120"
                        />
                        <el-table-column
                            prop="dueDate"
                            label="Date de retour"
                            width="120"
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
                    Prochaines réservations
                </h3>
                <div class="content-card">
                    <el-table :data="upcomingReservations" stripe>
                        <el-table-column prop="roomName" label="Salle" />
                        <el-table-column prop="userName" label="Utilisateur" />
                        <el-table-column prop="date" label="Date" width="100" />
                        <el-table-column
                            prop="timeSlot"
                            label="Horaire"
                            width="110"
                        >
                            <template #default="{ row }">
                                {{ formatTimeSlot(row.timeSlot) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="purpose"
                            label="Motif"
                            width="150"
                        >
                            <template #default="{ row }">
                                {{ getPurposeLabel(row.purpose) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    Reading,
    OfficeBuilding,
    User,
    Calendar,
    Clock,
    Warning,
    CircleCheckFilled
} from '@element-plus/icons-vue';

// Statistiques
const stats = ref([
    { label: 'Livres', value: '10,847', icon: Reading },
    { label: 'Salles', value: '15', icon: OfficeBuilding },
    { label: 'Membres', value: '5,234', icon: User },
    { label: 'Emprunts actifs', value: '327', icon: Calendar }
]);

// Activités récentes
const recentActivities = ref([
    {
        date: '2025-04-09 14:30',
        type: 'primary',
        content:
            'Paul Dupont a emprunté "Le Petit Prince" de Antoine de Saint-Exupéry'
    },
    {
        date: '2025-04-09 11:15',
        type: 'success',
        content: 'Marie Martin a retourné "1984" de George Orwell'
    },
    {
        date: '2025-04-08 10:22',
        type: 'warning',
        content:
            'La réservation de la salle B2 par Thomas Laurent a été annulée'
    },
    {
        date: '2025-04-08 16:45',
        type: 'info',
        content: 'Un nouveau livre a été ajouté : "Dune" de Frank Herbert'
    },
    {
        date: '2025-04-08 15:10',
        type: 'success',
        content: 'Nouveau membre inscrit : Sophie Moreau'
    }
]);

// Alertes
const alerts = ref([
    {
        id: 1,
        title: '5 livres en retard de retour',
        description:
            "Plusieurs membres n'ont pas retourné leurs livres à temps. Vous devriez les contacter.",
        actionLabel: 'Voir les détails',
        action: 'viewLateBorrows'
    },
    {
        id: 2,
        title: 'Mise à jour du système disponible',
        description:
            'Une nouvelle version du système de gestion de bibliothèque est disponible. Il est recommandé de mettre à jour dès que possible.',
        actionLabel: 'Mettre à jour',
        action: 'updateSystem'
    }
]);

// Emprunts récents
const recentBorrows = ref([
    {
        id: 1,
        bookTitle: 'Le Petit Prince',
        userName: 'Paul Dupont',
        borrowDate: '09/04/2025',
        dueDate: '23/04/2025',
        status: 'active'
    },
    {
        id: 2,
        bookTitle: '1984',
        userName: 'Marie Martin',
        borrowDate: '05/04/2025',
        dueDate: '19/04/2025',
        status: 'returned'
    },
    {
        id: 3,
        bookTitle: 'Les Misérables',
        userName: 'Thomas Laurent',
        borrowDate: '25/03/2025',
        dueDate: '08/04/2025',
        status: 'late'
    }
]);

// Prochaines réservations
const upcomingReservations = ref([
    {
        id: 1,
        roomName: 'Salle de groupe B2',
        userName: 'Sophie Moreau',
        date: '10/04/2025',
        timeSlot: '09-11',
        purpose: 'group'
    },
    {
        id: 2,
        roomName: 'Salle de conférence C1',
        userName: 'Paul Dupont',
        date: '11/04/2025',
        timeSlot: '14-16',
        purpose: 'presentation'
    },
    {
        id: 3,
        roomName: 'Laboratoire D3',
        userName: 'Marie Martin',
        date: '12/04/2025',
        timeSlot: '16-18',
        purpose: 'study'
    }
]);

// Fonctions utilitaires
const getBorrowStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'En cours';
        case 'late':
            return 'En retard';
        case 'returned':
            return 'Retourné';
        default:
            return status;
    }
};

const getBorrowStatusType = (status) => {
    switch (status) {
        case 'active':
            return 'info';
        case 'late':
            return 'danger';
        case 'returned':
            return 'success';
        default:
            return 'info';
    }
};

const formatTimeSlot = (timeSlot) => {
    const timeSlots = {
        '09-11': '9h - 11h',
        '11-13': '11h - 13h',
        '14-16': '14h - 16h',
        '16-18': '16h - 18h',
        '18-20': '18h - 20h'
    };

    return timeSlots[timeSlot] || timeSlot;
};

const getPurposeLabel = (purpose) => {
    const purposes = {
        group: 'Travail de groupe',
        presentation: 'Présentation',
        meeting: 'Réunion',
        study: 'Étude'
    };

    return purposes[purpose] || purpose;
};

// Fonctions pour les actions
const handleAlert = (alert) => {
    console.log(`Handling alert: ${alert.action}`);
    // Logique à implémenter en fonction du type d'alerte
};

const dismissAlert = (index) => {
    alerts.value.splice(index, 1);
};
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

.alert-content {
    padding: 5px 0;
}

.alert-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}

.empty-state {
    text-align: center;
    padding: 30px 0;
}

.empty-icon {
    color: #4caf50;
    margin-bottom: 15px;
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
