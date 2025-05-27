<template>
    <div class="admin-borrows">
        <div class="section-header">
            <h3>Gestion des emprunts</h3>
            <el-button type="primary" @click="openNewBorrowModal">
                <el-icon><Plus /></el-icon> Nouvel emprunt
            </el-button>
        </div>

        <div class="search-filter-container">
            <el-input
                v-model="searchQuery"
                placeholder="Rechercher un emprunt..."
                prefix-icon="Search"
                clearable
                @clear="resetFilters"
                @input="filterBorrows"
                class="filter-input"
            />

            <el-select
                v-model="statusFilter"
                placeholder="Statut"
                clearable
                @change="filterBorrows"
                class="filter-select"
            >
                <el-option label="En cours" value="active" />
                <el-option label="Retard" value="late" />
                <el-option label="Retourné" value="returned" />
            </el-select>

            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="→"
                start-placeholder="Date début"
                end-placeholder="Date fin"
                @change="filterBorrows"
                class="filter-date"
            />
        </div>

        <el-table
            :data="paginatedBorrows"
            style="width: 100%"
            v-loading="loading"
            stripe
            border
        >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="bookTitle" label="Livre" sortable />
            <el-table-column prop="userName" label="Utilisateur" sortable />
            <el-table-column
                prop="borrowDate"
                label="Date d'emprunt"
                sortable
                width="150"
            />
            <el-table-column
                prop="dueDate"
                label="Date de retour"
                sortable
                width="150"
            />
            <el-table-column prop="status" label="Statut" sortable width="120">
                <template #default="scope">
                    <el-tag
                        :type="getBorrowStatusType(scope.row.status)"
                        size="large"
                        effect="light"
                    >
                        {{ getBorrowStatusLabel(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="200">
                <template #default="scope">
                    <el-button-group>
                        <el-button
                            type="success"
                            size="small"
                            @click="markAsReturned(scope.row)"
                            title="Marquer comme retourné"
                            :disabled="scope.row.status === 'returned'"
                        >
                            <el-icon><Check /></el-icon>
                        </el-button>
                        <el-button
                            type="info"
                            size="small"
                            @click="sendReminder(scope.row)"
                            title="Envoyer un rappel"
                            :disabled="scope.row.status === 'returned'"
                        >
                            <el-icon><Message /></el-icon>
                        </el-button>
                        <el-button
                            type="danger"
                            size="small"
                            @click="confirmDeleteBorrow(scope.row)"
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
                :total="filteredBorrows.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- Modal de nouvel emprunt -->
        <el-dialog
            v-model="borrowModal.visible"
            title="Nouvel emprunt"
            width="700px"
            @close="closeBorrowModal"
        >
            <el-form
                :model="borrowModal.form"
                :rules="borrowValidationRules"
                ref="borrowFormRef"
                label-position="top"
            >
                <el-form-item label="Utilisateur" prop="userId">
                    <el-select
                        v-model="borrowModal.form.userId"
                        filterable
                        placeholder="Rechercher un utilisateur..."
                        style="width: 100%"
                    >
                        <el-option
                            v-for="user in users"
                            :key="user.id"
                            :label="`${user.name} (${user.email})`"
                            :value="user.id"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="Livre" prop="bookId">
                    <el-select
                        v-model="borrowModal.form.bookId"
                        filterable
                        placeholder="Rechercher un livre..."
                        style="width: 100%"
                    >
                        <el-option
                            v-for="book in availableBooks"
                            :key="book.isbn"
                            :label="`${book.title} - ${getAuthorName(
                                book.author
                            )}`"
                            :value="book.isbn"
                        />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeBorrowModal">Annuler</el-button>
                    <el-button
                        type="primary"
                        @click="saveBorrow"
                        :loading="borrowModal.loading"
                    >
                        Créer l'emprunt
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
                        @click="deleteBorrow"
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
import { ref, computed, onMounted } from 'vue';
import {
    Plus,
    Delete,
    Check,
    Message,
    Search,
    WarningFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// État
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

// Données
const books = ref([]);
const users = ref([]);
const borrows = ref([]);
const authors = ref([]);

// État du modal d'ajout d'emprunt
const borrowModal = ref({
    visible: false,
    loading: false,
    form: {
        userId: null,
        bookId: null
    }
});

// État du dialog de confirmation
const confirmDialog = ref({
    visible: false,
    message: '',
    borrowId: null,
    loading: false
});

// Référence au formulaire
const borrowFormRef = ref(null);

// Règles de validation
const borrowValidationRules = {
    userId: [
        {
            required: true,
            message: 'Veuillez sélectionner un utilisateur',
            trigger: 'change'
        }
    ],
    bookId: [
        {
            required: true,
            message: 'Veuillez sélectionner un livre',
            trigger: 'change'
        }
    ]
};

// Chargement des données
const loadBorrows = async () => {
    loading.value = true;
    try {
        const api = (await import('@/services/api')).default;

        // Récupérer les emprunts, livres et utilisateurs
        const [borrowsData, booksData, usersData, authorsData] =
            await Promise.all([
                api.bookReservations.getAll(),
                api.books.getAll(),
                api.users.getAll(),
                api.authors.getAll()
            ]);

        books.value = booksData;
        authors.value = authorsData;
        users.value = usersData.map((user) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email
        }));

        // Transformer les données des emprunts
        borrows.value = borrowsData.map((borrow) => {
            const book = booksData.find((b) => b.isbn === borrow.book_id);
            const user = usersData.find((u) => u.id === borrow.user_id);

            // Calculer le statut
            let status = 'active';
            if (borrow.return_date) {
                status = 'returned';
            } else {
                const borrowDate = new Date(borrow.start);
                const dueDate = new Date(borrowDate);
                dueDate.setDate(dueDate.getDate() + 14); // 14 jours par défaut

                if (new Date() > dueDate) {
                    status = 'late';
                }
            }

            return {
                id: borrow.id,
                bookId: borrow.book_id,
                bookTitle: book ? book.title : 'Livre inconnu',
                userId: borrow.user_id,
                userName: user
                    ? `${user.first_name} ${user.last_name}`
                    : 'Utilisateur inconnu',
                borrowDate: new Date(borrow.start).toLocaleDateString('fr-FR'),
                dueDate: new Date(
                    new Date(borrow.start).getTime() + 14 * 24 * 60 * 60 * 1000
                ).toLocaleDateString('fr-FR'),
                returnDate: borrow.return_date
                    ? new Date(borrow.return_date).toLocaleDateString('fr-FR')
                    : null,
                status: status,
                notes: borrow.notes || ''
            };
        });
    } catch (error) {
        console.error('Erreur lors du chargement des emprunts:', error);
        ElMessage({
            type: 'error',
            message:
                error.message ||
                'Impossible de charger les emprunts. Veuillez réessayer.'
        });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await loadBorrows();
});

// Livres disponibles (non empruntés)
const availableBooks = computed(() => {
    const borrowedBookIds = borrows.value
        .filter((b) => b.status !== 'returned')
        .map((b) => b.bookId);

    return books.value.filter((book) => !borrowedBookIds.includes(book.isbn));
});

// Emprunts filtrés selon les critères de recherche
const filteredBorrows = computed(() => {
    let result = [...borrows.value];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (borrow) =>
                borrow.bookTitle.toLowerCase().includes(query) ||
                borrow.userName.toLowerCase().includes(query)
        );
    }

    if (statusFilter.value) {
        result = result.filter(
            (borrow) => borrow.status === statusFilter.value
        );
    }

    if (
        dateRange.value &&
        dateRange.value.length === 2 &&
        dateRange.value[0] &&
        dateRange.value[1]
    ) {
        const startDate = new Date(dateRange.value[0]);
        const endDate = new Date(dateRange.value[1]);

        result = result.filter((borrow) => {
            const parts = borrow.borrowDate.split('/');
            const borrowDate = new Date(parts[2], parts[1] - 1, parts[0]);
            return borrowDate >= startDate && borrowDate <= endDate;
        });
    }

    return result;
});

// Emprunts paginés
const paginatedBorrows = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredBorrows.value.slice(startIndex, startIndex + pageSize.value);
});

// Fonctions utilitaires
const getBorrowStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'En cours';
        case 'late':
            return 'Retard';
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

const getAuthorName = (authorId) => {
    const author = authors.value.find((a) => a.id === authorId);
    return author ? `${author.firstname} ${author.lastname}` : 'Auteur inconnu';
};

const resetFilters = () => {
    searchQuery.value = '';
    statusFilter.value = '';
    dateRange.value = [];
    currentPage.value = 1;
};

const filterBorrows = () => {
    currentPage.value = 1;
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};

const openNewBorrowModal = () => {
    borrowModal.value.form = {
        userId: null,
        bookId: null
    };
    borrowModal.value.visible = true;
};

const closeBorrowModal = () => {
    borrowModal.value.visible = false;
};

const saveBorrow = async () => {
    try {
        await borrowFormRef.value.validate();
        borrowModal.value.loading = true;

        const api = (await import('@/services/api')).default;
        await api.bookReservations.create(borrowModal.value.form.bookId);

        ElMessage({
            type: 'success',
            message: 'Emprunt créé avec succès'
        });

        // Recharger les données
        await loadBorrows();
        borrowModal.value.visible = false;
    } catch (error) {
        console.error("Erreur lors de la création de l'emprunt:", error);
        ElMessage({
            type: 'error',
            message:
                error.message ||
                "Une erreur est survenue lors de la création de l'emprunt"
        });
    } finally {
        borrowModal.value.loading = false;
    }
};

const markAsReturned = async (borrow) => {
    try {
        const api = (await import('@/services/api')).default;
        await api.bookReservations.return(borrow.bookId);

        ElMessage({
            type: 'success',
            message: `Le livre "${borrow.bookTitle}" a été retourné`
        });

        // Recharger les données
        await loadBorrows();
    } catch (error) {
        console.error('Erreur lors du retour du livre:', error);
        ElMessage({
            type: 'error',
            message:
                error.message ||
                'Une erreur est survenue lors du retour du livre'
        });
    }
};

const sendReminder = (borrow) => {
    // Action pour envoyer un rappel à l'utilisateur
    ElMessage({
        type: 'success',
        message: `Un rappel a été envoyé à ${borrow.userName} pour le livre "${borrow.bookTitle}"`
    });
};

const confirmDeleteBorrow = (borrow) => {
    confirmDialog.value = {
        visible: true,
        message: `Êtes-vous sûr de vouloir supprimer cet emprunt pour "${borrow.bookTitle}" ?`,
        borrowId: borrow.id,
        loading: false
    };
};

const deleteBorrow = async () => {
    try {
        confirmDialog.value.loading = true;

        const api = (await import('@/services/api')).default;
        await api.bookReservations.delete(confirmDialog.value.borrowId);

        ElMessage({
            type: 'success',
            message: 'Emprunt supprimé avec succès'
        });

        // Recharger les données
        await loadBorrows();
        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    } catch (error) {
        console.error("Erreur lors de la suppression de l'emprunt:", error);
        ElMessage({
            type: 'error',
            message:
                error.message ||
                'Une erreur est survenue lors de la suppression'
        });
        confirmDialog.value.loading = false;
    }
};
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-borrows {
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
    min-width: 300px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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
    .filter-select,
    .filter-date {
        width: 100%;
    }
}
</style>
