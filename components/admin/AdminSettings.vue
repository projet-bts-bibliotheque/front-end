<template>
    <div class="admin-settings">
        <div class="settings-container">
            <div class="settings-section">
                <h3>Informations personnelles</h3>
                <el-form :model="userSettings" label-position="top">
                    <div class="form-row">
                        <el-form-item label="Nom">
                            <el-input v-model="userSettings.name" />
                        </el-form-item>
                        <el-form-item label="Email">
                            <el-input v-model="userSettings.email" />
                        </el-form-item>
                    </div>

                    <el-form-item>
                        <el-button type="primary" @click="saveUserSettings"
                            >Enregistrer les modifications</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>

            <div class="settings-section">
                <h3>Sécurité</h3>
                <el-form :model="securitySettings" label-position="top">
                    <el-form-item label="Mot de passe actuel">
                        <el-input
                            v-model="securitySettings.currentPassword"
                            type="password"
                            show-password
                        />
                    </el-form-item>

                    <div class="form-row">
                        <el-form-item label="Nouveau mot de passe">
                            <el-input
                                v-model="securitySettings.newPassword"
                                type="password"
                                show-password
                            />
                        </el-form-item>
                        <el-form-item label="Confirmer le mot de passe">
                            <el-input
                                v-model="securitySettings.confirmPassword"
                                type="password"
                                show-password
                            />
                        </el-form-item>
                    </div>

                    <el-form-item>
                        <el-button type="primary" @click="changePassword"
                            >Changer le mot de passe</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>

            <!-- Section réservée aux administrateurs -->
            <div class="settings-section" v-if="isAdmin">
                <h3>Paramètres du système</h3>
                <el-form :model="systemSettings" label-position="top">
                    <el-form-item label="Durée d'emprunt par défaut (jours)">
                        <el-input-number
                            v-model="systemSettings.defaultBorrowDuration"
                            :min="1"
                            :max="90"
                            style="width: 100%"
                        />
                    </el-form-item>

                    <el-form-item label="Nombre maximum d'emprunts simultanés">
                        <el-input-number
                            v-model="systemSettings.maxSimultaneousBorrows"
                            :min="1"
                            :max="30"
                            style="width: 100%"
                        />
                    </el-form-item>

                    <el-form-item label="Notifications de retard">
                        <el-checkbox-group
                            v-model="systemSettings.lateNotifications"
                        >
                            <el-checkbox label="email">Email</el-checkbox>
                            <el-checkbox label="sms">SMS</el-checkbox>
                            <el-checkbox label="system"
                                >Notification système</el-checkbox
                            >
                        </el-checkbox-group>
                    </el-form-item>

                    <el-form-item label="Heures d'ouverture">
                        <div class="opening-hours">
                            <div
                                v-for="(
                                    day, index
                                ) in systemSettings.openingHours"
                                :key="index"
                                class="opening-day"
                            >
                                <div class="day-name">
                                    {{ getDayName(day.day) }}
                                </div>
                                <el-time-picker
                                    v-model="day.open"
                                    format="HH:mm"
                                    placeholder="Heure d'ouverture"
                                    style="width: 120px"
                                    :disabled="!day.isOpen"
                                />
                                <span class="time-separator">-</span>
                                <el-time-picker
                                    v-model="day.close"
                                    format="HH:mm"
                                    placeholder="Heure de fermeture"
                                    style="width: 120px"
                                    :disabled="!day.isOpen"
                                />
                                <el-switch
                                    v-model="day.isOpen"
                                    class="day-toggle"
                                />
                            </div>
                        </div>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="saveSystemSettings"
                            >Enregistrer les paramètres système</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>

            <!-- Section pour les bibliothécaires uniquement -->
            <div class="settings-section" v-if="isLibrarian && !isAdmin">
                <h3>Paramètres de bibliothécaire</h3>
                <el-alert
                    title="Informations"
                    type="info"
                    description="En tant que bibliothécaire, vous avez accès à la gestion des livres, salles, auteurs et éditeurs. Seuls les administrateurs peuvent modifier les paramètres système et gérer les utilisateurs."
                    show-icon
                    :closable="false"
                />

                <el-form
                    :model="librarianSettings"
                    label-position="top"
                    style="margin-top: 20px"
                >
                    <el-form-item label="Notifications d'emprunts en retard">
                        <el-switch
                            v-model="librarianSettings.notifyOverdueBooks"
                            active-text="Activées"
                            inactive-text="Désactivées"
                        />
                    </el-form-item>

                    <el-form-item
                        label="Notifications de nouvelles réservations"
                    >
                        <el-switch
                            v-model="librarianSettings.notifyNewReservations"
                            active-text="Activées"
                            inactive-text="Désactivées"
                        />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="saveLibrarianSettings"
                            >Enregistrer mes préférences</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
    currentUser: {
        type: Object,
        required: true
    }
});

const isAdmin = computed(() => props.currentUser.role >= 2);
const isLibrarian = computed(() => props.currentUser.role >= 1);

const userSettings = ref({
    name: props.currentUser.name || 'Utilisateur Test',
    email: props.currentUser.email || 'user@bibliotheque.fr'
});

const securitySettings = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const librarianSettings = ref({
    notifyOverdueBooks: true,
    notifyNewReservations: true
});

const systemSettings = ref({
    defaultBorrowDuration: 14,
    maxSimultaneousBorrows: 5,
    lateNotifications: ['email', 'system'],
    openingHours: [
        {
            day: 1,
            isOpen: true,
            open: new Date(2025, 0, 1, 9, 0),
            close: new Date(2025, 0, 1, 20, 0)
        },
        {
            day: 2,
            isOpen: true,
            open: new Date(2025, 0, 1, 9, 0),
            close: new Date(2025, 0, 1, 20, 0)
        },
        {
            day: 3,
            isOpen: true,
            open: new Date(2025, 0, 1, 9, 0),
            close: new Date(2025, 0, 1, 20, 0)
        },
        {
            day: 4,
            isOpen: true,
            open: new Date(2025, 0, 1, 9, 0),
            close: new Date(2025, 0, 1, 20, 0)
        },
        {
            day: 5,
            isOpen: true,
            open: new Date(2025, 0, 1, 9, 0),
            close: new Date(2025, 0, 1, 20, 0)
        },
        {
            day: 6,
            isOpen: true,
            open: new Date(2025, 0, 1, 10, 0),
            close: new Date(2025, 0, 1, 18, 0)
        },
        {
            day: 0,
            isOpen: false,
            open: new Date(2025, 0, 1, 0, 0),
            close: new Date(2025, 0, 1, 0, 0)
        }
    ]
});

const getDayName = (day) => {
    const days = [
        'Dimanche',
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi'
    ];
    return days[day];
};

const saveUserSettings = () => {
    ElMessage({
        type: 'success',
        message: 'Informations personnelles mises à jour avec succès'
    });
};

const changePassword = () => {
    if (!securitySettings.value.currentPassword) {
        ElMessage({
            type: 'error',
            message: 'Veuillez saisir votre mot de passe actuel'
        });
        return;
    }

    if (!securitySettings.value.newPassword) {
        ElMessage({
            type: 'error',
            message: 'Veuillez saisir un nouveau mot de passe'
        });
        return;
    }

    if (
        securitySettings.value.newPassword !==
        securitySettings.value.confirmPassword
    ) {
        ElMessage({
            type: 'error',
            message: 'Les mots de passe ne correspondent pas'
        });
        return;
    }

    ElMessage({
        type: 'success',
        message: 'Mot de passe modifié avec succès'
    });

    securitySettings.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
};

const saveLibrarianSettings = () => {
    ElMessage({
        type: 'success',
        message: 'Préférences de bibliothécaire enregistrées avec succès'
    });
};

const saveSystemSettings = () => {
    ElMessage({
        type: 'success',
        message: 'Paramètres système enregistrés avec succès'
    });
};
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-settings {
    padding: 15px 0;
}

.settings-container {
    max-width: 800px;
    margin: 0 auto;
}

.settings-section {
    background-color: white;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
}

.settings-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
    position: relative;
    padding-bottom: 10px;
}

.settings-section h3:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background-color: #1e88e5;
}

.opening-hours {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.opening-day {
    display: flex;
    align-items: center;
    gap: 10px;
}

.day-name {
    width: 80px;
    font-weight: 600;
}

.time-separator {
    margin: 0 5px;
}

.day-toggle {
    margin-left: 10px;
}

/* Responsive */
@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .opening-day {
        flex-wrap: wrap;
        gap: 10px 5px;
    }

    .day-name {
        width: 80px;
    }

    .time-separator {
        display: none;
    }

    .day-toggle {
        margin-left: auto;
    }
}
</style>
