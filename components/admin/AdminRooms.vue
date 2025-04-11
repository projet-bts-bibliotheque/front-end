<template>
    <div class="admin-rooms">
        <div class="section-header">
            <h3>Gestion des salles</h3>
            <el-button type="primary" @click="openAddRoomModal">
                <el-icon><Plus /></el-icon> Ajouter une salle
            </el-button>
        </div>

        <div class="search-filter-container">
            <el-input
                v-model="searchQuery"
                placeholder="Rechercher une salle..."
                prefix-icon="Search"
                clearable
                @clear="resetFilters"
                @input="filterRooms"
                class="filter-input"
            />

            <el-select
                v-model="typeFilter"
                placeholder="Type de salle"
                clearable
                @change="filterRooms"
                class="filter-select"
            >
                <el-option
                    v-for="type in roomTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                />
            </el-select>

            <el-select
                v-model="capacityFilter"
                placeholder="Capacité minimale"
                clearable
                @change="filterRooms"
                class="filter-select"
            >
                <el-option label="1 personne" :value="1" />
                <el-option label="2 personnes" :value="2" />
                <el-option label="4 personnes" :value="4" />
                <el-option label="6 personnes" :value="6" />
                <el-option label="8 personnes" :value="8" />
                <el-option label="10 personnes" :value="10" />
            </el-select>
        </div>

        <el-table
            :data="paginatedRooms"
            style="width: 100%"
            v-loading="loading"
            stripe
            border
        >
            <el-table-column label="Image" width="120">
                <template #default="scope">
                    <el-image
                        style="width: 80px; height: 50px; border-radius: 4px"
                        :src="scope.row.imageUrl"
                        fit="cover"
                        :preview-src-list="[scope.row.imageUrl]"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="Nom" sortable />
            <el-table-column prop="type" label="Type" sortable />
            <el-table-column
                prop="capacity"
                label="Capacité"
                sortable
                width="100"
            >
                <template #default="scope">
                    {{ scope.row.capacity }} personne{{
                        scope.row.capacity > 1 ? 's' : ''
                    }}
                </template>
            </el-table-column>
            <el-table-column prop="floor" label="Emplacement" sortable />
            <el-table-column label="Équipements" width="250">
                <template #default="scope">
                    <div class="features-tags">
                        <el-tag
                            v-for="feature in scope.row.features"
                            :key="feature"
                            size="small"
                            class="feature-tag"
                        >
                            {{ getFeatureLabel(feature) }}
                        </el-tag>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="200">
                <template #default="scope">
                    <el-button-group>
                        <el-button
                            type="primary"
                            size="small"
                            @click="editRoom(scope.row)"
                            title="Éditer"
                        >
                            <el-icon><Edit /></el-icon>
                        </el-button>
                        <el-button
                            type="info"
                            size="small"
                            @click="viewReservations(scope.row)"
                            title="Voir les réservations"
                        >
                            <el-icon><Calendar /></el-icon>
                        </el-button>
                        <el-button
                            type="danger"
                            size="small"
                            @click="confirmDeleteRoom(scope.row)"
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
                :total="filteredRooms.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- Modal d'ajout/édition de salle -->
        <el-dialog
            v-model="roomModal.visible"
            :title="
                roomModal.isEdit ? 'Modifier une salle' : 'Ajouter une salle'
            "
            width="700px"
            @close="closeRoomModal"
        >
            <el-form
                :model="roomModal.form"
                :rules="roomValidationRules"
                ref="roomFormRef"
                label-position="top"
            >
                <div class="form-row">
                    <el-form-item label="Nom" prop="name">
                        <el-input
                            v-model="roomModal.form.name"
                            placeholder="Nom de la salle"
                        />
                    </el-form-item>
                    <el-form-item label="Type" prop="type">
                        <el-select
                            v-model="roomModal.form.type"
                            placeholder="Type de salle"
                            style="width: 100%"
                        >
                            <el-option
                                v-for="type in roomTypes"
                                :key="type.value"
                                :label="type.label"
                                :value="type.value"
                            />
                        </el-select>
                    </el-form-item>
                </div>

                <div class="form-row">
                    <el-form-item label="Capacité" prop="capacity">
                        <el-input-number
                            v-model="roomModal.form.capacity"
                            :min="1"
                            :max="50"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="Superficie (m²)" prop="dimension">
                        <el-input-number
                            v-model="roomModal.form.dimension"
                            :min="1"
                            style="width: 100%"
                        />
                    </el-form-item>
                </div>

                <el-form-item label="Emplacement" prop="floor">
                    <el-input
                        v-model="roomModal.form.floor"
                        placeholder="Étage, aile, etc."
                    />
                </el-form-item>

                <el-form-item label="Équipements" prop="features">
                    <el-checkbox-group v-model="roomModal.form.features">
                        <el-checkbox label="wifi">Wi-Fi</el-checkbox>
                        <el-checkbox label="projector"
                            >Vidéoprojecteur</el-checkbox
                        >
                        <el-checkbox label="whiteboard"
                            >Tableau blanc</el-checkbox
                        >
                        <el-checkbox label="computer">Ordinateurs</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item label="Description" prop="description">
                    <el-input
                        v-model="roomModal.form.description"
                        type="textarea"
                        rows="4"
                        placeholder="Description de la salle"
                    />
                </el-form-item>

                <el-form-item label="Image">
                    <div class="image-uploader">
                        <el-image
                            v-if="roomModal.form.imageUrl"
                            :src="roomModal.form.imageUrl"
                            fit="cover"
                            style="
                                width: 200px;
                                height: 120px;
                                margin-right: 20px;
                                border-radius: 4px;
                            "
                        />
                        <el-upload
                            class="image-upload-button"
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleImageChange"
                        >
                            <el-button type="primary">
                                {{
                                    roomModal.form.imageUrl
                                        ? "Changer l'image"
                                        : 'Ajouter une image'
                                }}
                            </el-button>
                        </el-upload>
                    </div>
                </el-form-item>

                <el-form-item label="Mise en avant">
                    <el-switch
                        v-model="roomModal.form.popular"
                        active-text="Populaire"
                        inactive-text="Normal"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeRoomModal">Annuler</el-button>
                    <el-button
                        type="primary"
                        @click="saveRoom"
                        :loading="roomModal.loading"
                    >
                        {{ roomModal.isEdit ? 'Mettre à jour' : 'Ajouter' }}
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
                        @click="deleteRoom"
                        :loading="confirmDialog.loading"
                    >
                        Supprimer
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
    Edit,
    Delete,
    Calendar,
    Search,
    WarningFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// État
const loading = ref(false);
const searchQuery = ref('');
const typeFilter = ref('');
const capacityFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Liste des types de salles
const roomTypes = [
    { value: 'Individuelle', label: 'Individuelle' },
    { value: 'Groupe', label: 'Groupe' },
    { value: 'Réunion', label: 'Réunion' },
    { value: 'Présentation', label: 'Présentation' },
    { value: 'Informatique', label: 'Informatique' },
    { value: 'Multimédia', label: 'Multimédia' }
];

// Données des salles
const rooms = ref([
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
    }
]);

// État du modal d'ajout/édition
const roomModal = ref({
    visible: false,
    isEdit: false,
    loading: false,
    form: {
        id: null,
        name: '',
        type: '',
        capacity: 1,
        dimension: 0,
        floor: '',
        features: [],
        description: '',
        imageUrl: '',
        popular: false
    }
});

// État du dialog de confirmation
const confirmDialog = ref({
    visible: false,
    message: '',
    roomId: null,
    loading: false
});

// Référence au formulaire
const roomFormRef = ref(null);

// Règles de validation
const roomValidationRules = {
    name: [
        {
            required: true,
            message: 'Veuillez saisir le nom de la salle',
            trigger: 'blur'
        }
    ],
    type: [
        {
            required: true,
            message: 'Veuillez sélectionner un type de salle',
            trigger: 'change'
        }
    ],
    capacity: [
        {
            required: true,
            message: 'Veuillez saisir la capacité de la salle',
            trigger: 'blur'
        }
    ],
    floor: [
        {
            required: true,
            message: "Veuillez saisir l'emplacement de la salle",
            trigger: 'blur'
        }
    ]
};

// Salles filtrées selon les critères de recherche
const filteredRooms = computed(() => {
    let result = [...rooms.value];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (room) =>
                room.name.toLowerCase().includes(query) ||
                room.type.toLowerCase().includes(query) ||
                room.floor.toLowerCase().includes(query)
        );
    }

    if (typeFilter.value) {
        result = result.filter((room) => room.type === typeFilter.value);
    }

    if (capacityFilter.value) {
        result = result.filter((room) => room.capacity >= capacityFilter.value);
    }

    return result;
});

// Salles paginées
const paginatedRooms = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredRooms.value.slice(startIndex, startIndex + pageSize.value);
});

// Fonctions
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

const resetFilters = () => {
    searchQuery.value = '';
    typeFilter.value = '';
    capacityFilter.value = '';
    currentPage.value = 1;
};

const filterRooms = () => {
    currentPage.value = 1;
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};

const openAddRoomModal = () => {
    roomModal.value.isEdit = false;
    roomModal.value.form = {
        id: null,
        name: '',
        type: '',
        capacity: 1,
        dimension: 0,
        floor: '',
        features: [],
        description: '',
        imageUrl: '',
        popular: false
    };
    roomModal.value.visible = true;
};

const editRoom = (room) => {
    roomModal.value.isEdit = true;
    roomModal.value.form = { ...room };
    roomModal.value.visible = true;
};

const closeRoomModal = () => {
    roomModal.value.visible = false;
};

const handleImageChange = (file) => {
    // Simuler le chargement d'une image
    const reader = new FileReader();
    reader.onload = (e) => {
        roomModal.value.form.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file.raw);
};

const saveRoom = () => {
    roomFormRef.value.validate((valid) => {
        if (valid) {
            roomModal.value.loading = true;

            setTimeout(() => {
                if (roomModal.value.isEdit) {
                    // Mettre à jour la salle existante
                    const index = rooms.value.findIndex(
                        (room) => room.id === roomModal.value.form.id
                    );
                    if (index !== -1) {
                        rooms.value[index] = { ...roomModal.value.form };
                    }

                    ElMessage({
                        type: 'success',
                        message: 'Salle mise à jour avec succès'
                    });
                } else {
                    // Ajouter une nouvelle salle
                    const newRoom = {
                        ...roomModal.value.form,
                        id:
                            rooms.value.length > 0
                                ? Math.max(
                                      ...rooms.value.map((room) => room.id)
                                  ) + 1
                                : 1
                    };

                    rooms.value.push(newRoom);

                    ElMessage({
                        type: 'success',
                        message: 'Salle ajoutée avec succès'
                    });
                }

                roomModal.value.loading = false;
                roomModal.value.visible = false;
            }, 1000);
        }
    });
};

const viewReservations = (room) => {
    // Action pour voir les réservations de cette salle
    // À implémenter selon vos besoins
    ElMessage({
        type: 'info',
        message: `Affichage des réservations pour ${room.name}`
    });
};

const confirmDeleteRoom = (room) => {
    confirmDialog.value = {
        visible: true,
        message: `Êtes-vous sûr de vouloir supprimer la salle "${room.name}" ?`,
        roomId: room.id,
        loading: false
    };
};

const deleteRoom = () => {
    confirmDialog.value.loading = true;

    setTimeout(() => {
        const index = rooms.value.findIndex(
            (room) => room.id === confirmDialog.value.roomId
        );

        if (index !== -1) {
            rooms.value.splice(index, 1);

            ElMessage({
                type: 'success',
                message: 'Salle supprimée avec succès'
            });
        }

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    }, 800);
};
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-rooms {
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

.features-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.feature-tag {
    margin-right: 0;
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

.image-uploader {
    display: flex;
    align-items: center;
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
}
</style>
