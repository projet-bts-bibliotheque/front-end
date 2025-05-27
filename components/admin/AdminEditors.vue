<template>
    <div class="admin-editors">
        <div class="section-header">
            <h3>Gestion des éditeurs</h3>
            <el-button type="primary" @click="openAddModal">
                <el-icon><Plus /></el-icon> Ajouter un éditeur
            </el-button>
        </div>

        <div class="search-filter-container">
            <el-input
                v-model="searchQuery"
                placeholder="Rechercher un éditeur..."
                prefix-icon="Search"
                clearable
                @input="filterItems"
                class="filter-input"
            />
        </div>

        <el-table
            :data="paginatedItems"
            style="width: 100%"
            v-loading="loading"
            stripe
            border
        >
            <el-table-column prop="name" label="Nom" sortable />
            <el-table-column label="Actions" width="200">
                <template #default="scope">
                    <el-button-group>
                        <el-button
                            type="primary"
                            size="small"
                            @click="editItem(scope.row)"
                        >
                            <el-icon><Edit /></el-icon>
                        </el-button>
                        <el-button
                            type="danger"
                            size="small"
                            @click="confirmDelete(scope.row)"
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
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                :total="filteredItems.length"
            />
        </div>

        <!-- Modal d'ajout/édition -->
        <el-dialog
            v-model="modal.visible"
            :title="modal.isEdit ? 'Modifier un éditeur' : 'Ajouter un éditeur'"
            width="500px"
        >
            <el-form
                :model="modal.form"
                :rules="rules"
                ref="formRef"
                label-position="top"
            >
                <el-form-item label="Nom" prop="name">
                    <el-input v-model="modal.form.name" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="modal.visible = false">Annuler</el-button>
                <el-button
                    type="primary"
                    @click="saveItem"
                    :loading="modal.loading"
                >
                    {{ modal.isEdit ? 'Modifier' : 'Ajouter' }}
                </el-button>
            </template>
        </el-dialog>

        <!-- Dialog de confirmation -->
        <el-dialog
            v-model="confirmDialog.visible"
            title="Confirmation"
            width="400px"
        >
            <p>Êtes-vous sûr de vouloir supprimer cet éditeur ?</p>
            <template #footer>
                <el-button @click="confirmDialog.visible = false"
                    >Annuler</el-button
                >
                <el-button
                    type="danger"
                    @click="deleteItem"
                    :loading="confirmDialog.loading"
                >
                    Supprimer
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// État
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const items = ref([]);

// Modal
const modal = ref({
    visible: false,
    isEdit: false,
    loading: false,
    form: { id: null, name: '' }
});

// Dialog de confirmation
const confirmDialog = ref({
    visible: false,
    loading: false,
    item: null
});

// Référence du formulaire
const formRef = ref(null);

// Règles de validation
const rules = {
    name: [{ required: true, message: 'Le nom est requis', trigger: 'blur' }]
};

// Items filtrés
const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    const query = searchQuery.value.toLowerCase();
    return items.value.filter((item) =>
        item.name.toLowerCase().includes(query)
    );
});

// Items paginés
const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredItems.value.slice(start, start + pageSize.value);
});

// Charger les données
const loadItems = async () => {
    loading.value = true;
    try {
        const api = (await import('@/services/api')).default;
        items.value = await api.get('/editors');
    } catch (error) {
        ElMessage.error('Erreur lors du chargement des éditeurs');
    } finally {
        loading.value = false;
    }
};

// Filtrer
const filterItems = () => {
    currentPage.value = 1;
};

// Ouvrir modal d'ajout
const openAddModal = () => {
    modal.value = {
        visible: true,
        isEdit: false,
        loading: false,
        form: { id: null, name: '' }
    };
};

// Éditer
const editItem = (item) => {
    modal.value = {
        visible: true,
        isEdit: true,
        loading: false,
        form: { ...item }
    };
};

// Sauvegarder
const saveItem = async () => {
    try {
        await formRef.value.validate();
        modal.value.loading = true;

        const api = (await import('@/services/api')).default;

        if (modal.value.isEdit) {
            await api.put(`/editors/${modal.value.form.id}`, modal.value.form);
            ElMessage.success('Éditeur modifié avec succès');
        } else {
            await api.post('/editors', modal.value.form);
            ElMessage.success('Éditeur ajouté avec succès');
        }

        await loadItems();
        modal.value.visible = false;
    } catch (error) {
        ElMessage.error('Erreur lors de la sauvegarde');
    } finally {
        modal.value.loading = false;
    }
};

// Confirmer suppression
const confirmDelete = (item) => {
    confirmDialog.value = {
        visible: true,
        loading: false,
        item
    };
};

// Supprimer
const deleteItem = async () => {
    try {
        confirmDialog.value.loading = true;
        const api = (await import('@/services/api')).default;
        await api.delete(`/editors/${confirmDialog.value.item.id}`);

        await loadItems();
        confirmDialog.value.visible = false;
        ElMessage.success('Éditeur supprimé avec succès');
    } catch (error) {
        ElMessage.error('Erreur lors de la suppression');
    } finally {
        confirmDialog.value.loading = false;
    }
};

onMounted(loadItems);
</script>

<style scoped>
@import './CommonAdminStyle.css';
</style>
