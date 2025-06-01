<template>
    <div class="admin-users">
        <div class="section-header">
            <h3>Gestion des utilisateurs</h3>
            <el-button type="primary" @click="openAddUserModal">
                <el-icon><Plus /></el-icon> Ajouter un utilisateur
            </el-button>
        </div>

        <div class="search-filter-container">
            <el-input
                v-model="searchQuery"
                placeholder="Rechercher un utilisateur..."
                prefix-icon="Search"
                clearable
                @clear="resetFilters"
                @input="filterUsers"
                class="filter-input"
            />

            <el-select
                v-model="roleFilter"
                placeholder="Rôle"
                clearable
                @change="filterUsers"
                class="filter-select"
            >
                <el-option label="Membre" :value="0" />
                <el-option label="Bibliothécaire" :value="1" />
                <el-option label="Administrateur" :value="2" />
            </el-select>
        </div>

        <el-table
            :data="paginatedUsers"
            style="width: 100%"
            v-loading="loading"
            stripe
            border
        >
            <el-table-column label="Avatar" width="80">
                <template #default="scope">
                    <el-avatar :size="40" :src="scope.row.avatar" />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="Nom" sortable />
            <el-table-column prop="email" label="Email" sortable />
            <el-table-column prop="phone" label="Téléphone" sortable />
            <el-table-column prop="role" label="Rôle" sortable width="140">
                <template #default="scope">
                    <el-tag
                        :type="getRoleTagType(scope.row.role)"
                        size="large"
                        effect="light"
                    >
                        {{ getRoleLabel(scope.row.role) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column
                prop="memberSince"
                label="Inscrit depuis"
                sortable
                width="150"
            />
            <el-table-column label="Actions" width="200">
                <template #default="scope">
                    <el-button-group>
                        <el-button
                            type="primary"
                            size="small"
                            @click="editUser(scope.row)"
                            title="Éditer"
                        >
                            <el-icon><Edit /></el-icon>
                        </el-button>
                        <el-button
                            type="info"
                            size="small"
                            @click="viewUserDetails(scope.row)"
                            title="Voir détails"
                        >
                            <el-icon><View /></el-icon>
                        </el-button>
                        <el-button
                            type="danger"
                            size="small"
                            @click="confirmDeleteUser(scope.row)"
                            title="Supprimer"
                            :disabled="scope.row.id === currentUser.id"
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
                :total="filteredUsers.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- Modal d'ajout/édition d'utilisateur -->
        <el-dialog
            v-model="userModal.visible"
            :title="
                userModal.isEdit
                    ? 'Modifier un utilisateur'
                    : 'Ajouter un utilisateur'
            "
            width="700px"
            @close="closeUserModal"
        >
            <el-form
                :model="userModal.form"
                :rules="userValidationRules"
                ref="userFormRef"
                label-position="top"
            >
                <div class="form-row">
                    <el-form-item label="Prénom" prop="first_name">
                        <el-input
                            v-model="userModal.form.first_name"
                            placeholder="Prénom"
                        />
                    </el-form-item>
                    <el-form-item label="Nom" prop="last_name">
                        <el-input
                            v-model="userModal.form.last_name"
                            placeholder="Nom"
                        />
                    </el-form-item>
                </div>

                <el-form-item label="Email" prop="email">
                    <el-input
                        v-model="userModal.form.email"
                        placeholder="Adresse email"
                    />
                </el-form-item>

                <div class="form-row">
                    <el-form-item label="Téléphone" prop="phone">
                        <el-input
                            v-model="userModal.form.phone"
                            placeholder="Numéro de téléphone"
                        />
                    </el-form-item>
                    <el-form-item label="Rôle" prop="role">
                        <el-select
                            v-model="userModal.form.role"
                            placeholder="Rôle de l'utilisateur"
                            style="width: 100%"
                        >
                            <el-option label="Membre" :value="0" />
                            <el-option label="Bibliothécaire" :value="1" />
                            <el-option label="Administrateur" :value="2" />
                        </el-select>
                    </el-form-item>
                </div>

                <el-form-item label="Adresse" prop="address">
                    <el-input
                        v-model="userModal.form.address"
                        placeholder="Adresse complète"
                    />
                </el-form-item>

                <div v-if="!userModal.isEdit">
                    <div class="form-row">
                        <el-form-item label="Mot de passe" prop="password">
                            <el-input
                                v-model="userModal.form.password"
                                type="password"
                                show-password
                                placeholder="Mot de passe"
                            />
                        </el-form-item>
                        <el-form-item
                            label="Confirmer le mot de passe"
                            prop="confirmPassword"
                        >
                            <el-input
                                v-model="userModal.form.confirmPassword"
                                type="password"
                                show-password
                                placeholder="Confirmer le mot de passe"
                            />
                        </el-form-item>
                    </div>
                </div>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeUserModal">Annuler</el-button>
                    <el-button
                        type="primary"
                        @click="saveUser"
                        :loading="userModal.loading"
                    >
                        {{ userModal.isEdit ? 'Mettre à jour' : 'Ajouter' }}
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
                <el-icon class="confirm-icon warning"
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
                        type="danger"
                        @click="deleteUser"
                        :loading="confirmDialog.loading"
                    >
                        Supprimer
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- Dialog de détails utilisateur -->
        <el-dialog
            v-model="detailsDialog.visible"
            title="Détails de l'utilisateur"
            width="600px"
        >
            <div v-if="detailsDialog.user" class="user-details">
                <div class="detail-row">
                    <label>Nom complet:</label>
                    <span>{{ detailsDialog.user.name }}</span>
                </div>
                <div class="detail-row">
                    <label>Email:</label>
                    <span>{{ detailsDialog.user.email }}</span>
                </div>
                <div class="detail-row">
                    <label>Téléphone:</label>
                    <span>{{
                        detailsDialog.user.phone || 'Non renseigné'
                    }}</span>
                </div>
                <div class="detail-row">
                    <label>Adresse:</label>
                    <span>{{
                        detailsDialog.user.address || 'Non renseignée'
                    }}</span>
                </div>
                <div class="detail-row">
                    <label>Rôle:</label>
                    <el-tag :type="getRoleTagType(detailsDialog.user.role)">
                        {{ getRoleLabel(detailsDialog.user.role) }}
                    </el-tag>
                </div>
                <div class="detail-row">
                    <label>Membre depuis:</label>
                    <span>{{ detailsDialog.user.memberSince }}</span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    Plus,
    Edit,
    Delete,
    View,
    Search,
    WarningFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// État
const loading = ref(false);
const searchQuery = ref('');
const roleFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Utilisateur courant pour empêcher l'auto-suppression
const currentUser = ref({ id: null });

// Données des utilisateurs
const users = ref([]);

// État du modal d'ajout/édition
const userModal = ref({
    visible: false,
    isEdit: false,
    loading: false,
    form: {
        id: null,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        role: 0,
        password: '',
        confirmPassword: ''
    }
});

// État du dialog de confirmation
const confirmDialog = ref({
    visible: false,
    message: '',
    userId: null,
    loading: false
});

// État du dialog de détails
const detailsDialog = ref({
    visible: false,
    user: null
});

// Référence au formulaire
const userFormRef = ref(null);

// Règles de validation
const userValidationRules = {
    first_name: [
        {
            required: true,
            message: 'Veuillez saisir le prénom',
            trigger: 'blur'
        }
    ],
    last_name: [
        { required: true, message: 'Veuillez saisir le nom', trigger: 'blur' }
    ],
    email: [
        {
            required: true,
            message: "Veuillez saisir l'adresse email",
            trigger: 'blur'
        },
        {
            type: 'email',
            message: 'Veuillez saisir une adresse email valide',
            trigger: 'blur'
        }
    ],
    role: [
        {
            required: true,
            message: "Veuillez sélectionner un rôle d'utilisateur",
            trigger: 'change'
        }
    ],
    password: [
        {
            required: true,
            message: 'Veuillez saisir un mot de passe',
            trigger: 'blur'
        },
        {
            min: 8,
            message: 'Le mot de passe doit contenir au moins 8 caractères',
            trigger: 'blur'
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: 'Veuillez confirmer le mot de passe',
            trigger: 'blur'
        },
        {
            validator: (rule, value, callback) => {
                if (value !== userModal.value.form.password) {
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

// Chargement des utilisateurs
const loadUsers = async () => {
    loading.value = true;
    try {
        const api = (await import('@/services/api')).default;

        // Charger l'utilisateur courant et la liste des utilisateurs
        const [userData, usersData] = await Promise.all([
            api.get('/me'),
            api.get('/users')
        ]);

        currentUser.value = userData;

        // Transformer les données pour notre interface
        users.value = usersData.map((user) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            role: user.role,
            avatar: `/api/placeholder/100/100?text=${user.first_name.charAt(
                0
            )}${user.last_name.charAt(0)}`,
            memberSince: new Date(user.created_at).toLocaleDateString('fr-FR')
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        ElMessage({
            type: 'error',
            message:
                'Impossible de charger les utilisateurs. Veuillez réessayer.'
        });
    } finally {
        loading.value = false;
    }
};

// Utilisateurs filtrés selon les critères de recherche
const filteredUsers = computed(() => {
    let result = [...users.value];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone.toLowerCase().includes(query)
        );
    }

    if (roleFilter.value !== '') {
        result = result.filter((user) => user.role === roleFilter.value);
    }

    return result;
});

// Utilisateurs paginés
const paginatedUsers = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredUsers.value.slice(startIndex, startIndex + pageSize.value);
});

// Fonctions utilitaires
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
const resetFilters = () => {
    searchQuery.value = '';
    roleFilter.value = '';
    currentPage.value = 1;
};

const filterUsers = () => {
    currentPage.value = 1;
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};

// Actions utilisateur
const openAddUserModal = () => {
    userModal.value.isEdit = false;
    userModal.value.form = {
        id: null,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        role: 0,
        password: '',
        confirmPassword: ''
    };
    userModal.value.visible = true;
};

const editUser = (user) => {
    userModal.value.isEdit = true;
    userModal.value.form = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        password: '',
        confirmPassword: ''
    };
    userModal.value.visible = true;
};

const closeUserModal = () => {
    userModal.value.visible = false;
};

const viewUserDetails = (user) => {
    detailsDialog.value.user = user;
    detailsDialog.value.visible = true;
};

const saveUser = async () => {
    try {
        await userFormRef.value.validate();
        userModal.value.loading = true;

        const api = (await import('@/services/api')).default;

        if (userModal.value.isEdit) {
            // Mettre à jour l'utilisateur existant
            const userData = {
                first_name: userModal.value.form.first_name,
                last_name: userModal.value.form.last_name,
                email: userModal.value.form.email,
                address: userModal.value.form.address,
                phone: userModal.value.form.phone,
                role: userModal.value.form.role
            };

            await api.put(`/users/${userModal.value.form.id}`, userData);

            ElMessage({
                type: 'success',
                message: 'Utilisateur mis à jour avec succès'
            });
        } else {
            // Ajouter un nouvel utilisateur
            const userData = {
                first_name: userModal.value.form.first_name,
                last_name: userModal.value.form.last_name,
                email: userModal.value.form.email,
                password: userModal.value.form.password,
                address: userModal.value.form.address,
                phone: userModal.value.form.phone,
                role: userModal.value.form.role
            };

            await api.post('/register', userData);

            ElMessage({
                type: 'success',
                message: 'Utilisateur ajouté avec succès'
            });
        }

        // Recharger les utilisateurs
        await loadUsers();
        userModal.value.visible = false;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
        ElMessage({
            type: 'error',
            message:
                error.message || 'Une erreur est survenue lors de la sauvegarde'
        });
    } finally {
        userModal.value.loading = false;
    }
};

const confirmDeleteUser = (user) => {
    // Empêcher la suppression de l'utilisateur courant
    if (user.id === currentUser.value.id) {
        ElMessage({
            type: 'error',
            message: 'Vous ne pouvez pas supprimer votre propre compte'
        });
        return;
    }

    confirmDialog.value = {
        visible: true,
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`,
        userId: user.id,
        loading: false
    };
};

const deleteUser = async () => {
    try {
        confirmDialog.value.loading = true;

        const api = (await import('@/services/api')).default;
        await api.delete(`/users/${confirmDialog.value.userId}`);

        // Recharger les utilisateurs
        await loadUsers();

        ElMessage({
            type: 'success',
            message: 'Utilisateur supprimé avec succès'
        });

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        ElMessage({
            type: 'error',
            message:
                error.message ||
                'Une erreur est survenue lors de la suppression'
        });
        confirmDialog.value.loading = false;
    }
};

// Chargement initial
onMounted(async () => {
    await loadUsers();
});
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-users {
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

.user-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-row label {
    font-weight: 600;
    color: #666;
    min-width: 120px;
}

.detail-row span {
    flex: 1;
    text-align: right;
}

/* Responsive */
@media (max-width: 768px) {
    .search-filter-container {
        flex-direction: column;
        gap: 10px;
    }

    .filter-input,
    .filter-select {
        width: 100%;
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .detail-row span {
        text-align: left;
    }
}
</style>
