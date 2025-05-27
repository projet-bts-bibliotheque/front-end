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
                            type="primary"
                            size="small"
                            @click="extendBorrow(scope.row)"
                            title="Prolonger l'emprunt"
                            :disabled="scope.row.status === 'returned'"
                        >
                            <el-icon><Timer /></el-icon>
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
                        remote
                        placeholder="Rechercher un utilisateur..."
                        :remote-method="searchUsers"
                        :loading="borrowModal.userSearchLoading"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="user in borrowModal.userOptions"
                            :key="user.id"
                            :label="user.name"
                            :value="user.id"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="Livre" prop="bookId">
                    <el-select
                        v-model="borrowModal.form.bookId"
                        filterable
                        remote
                        placeholder="Rechercher un livre..."
                        :remote-method="searchBooks"
                        :loading="borrowModal.bookSearchLoading"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="book in borrowModal.bookOptions"
                            :key="book.id"
                            :label="book.title"
                            :value="book.id"
                        >
                            <div class="book-option">
                                <el-image
                                    :src="book.coverUrl"
                                    fit="cover"
                                    style="
                                        width: 40px;
                                        height: 60px;
                                        margin-right: 10px;
                                        border-radius: 4px;
                                    "
                                />
                                <div class="book-option-info">
                                    <div class="book-option-title">
                                        {{ book.title }}
                                    </div>
                                    <div class="book-option-author">
                                        {{ book.author }}
                                    </div>
                                </div>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>

                <div class="form-row">
                    <el-form-item label="Date d'emprunt" prop="borrowDate">
                        <el-date-picker
                            v-model="borrowModal.form.borrowDate"
                            type="date"
                            placeholder="Date d'emprunt"
                            format="DD/MM/YYYY"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="Date de retour prévue" prop="dueDate">
                        <el-date-picker
                            v-model="borrowModal.form.dueDate"
                            type="date"
                            placeholder="Date de retour"
                            format="DD/MM/YYYY"
                            style="width: 100%"
                            :disabled-date="disablePastDates"
                        />
                    </el-form-item>
                </div>

                <el-form-item label="Remarques" prop="notes">
                    <el-input
                        v-model="borrowModal.form.notes"
                        type="textarea"
                        rows="3"
                        placeholder="Remarques concernant l'emprunt..."
                    />
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
import { ref, computed } from 'vue';
import {
    Plus,
    Delete,
    Check,
    Timer,
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

// Données des livres (pour la recherche)
const books = ref([{}]);

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

// Données des emprunts
const borrows = ref([{}]);

// État du modal d'ajout d'emprunt
const borrowModal = ref({
    visible: false,
    loading: false,
    userSearchLoading: false,
    bookSearchLoading: false,
    userOptions: [],
    bookOptions: [],
    form: {
        userId: null,
        bookId: null,
        borrowDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // +14 jours par défaut
        notes: ''
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
    ],
    borrowDate: [
        {
            required: true,
            message: "Veuillez sélectionner la date d'emprunt",
            trigger: 'change'
        }
    ],
    dueDate: [
        {
            required: true,
            message: 'Veuillez sélectionner la date de retour prévue',
            trigger: 'change'
        }
    ]
};

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

// Fonctions
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

const disablePastDates = (date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
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
        bookId: null,
        borrowDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        notes: ''
    };
    borrowModal.value.visible = true;
};

const closeBorrowModal = () => {
    borrowModal.value.visible = false;
};

const searchUsers = (query) => {
    borrowModal.value.userSearchLoading = true;

    setTimeout(() => {
        if (query) {
            const search = query.toLowerCase();
            borrowModal.value.userOptions = users.value
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
            borrowModal.value.userOptions = users.value.map((user) => ({
                id: user.id,
                name: `${user.name} (${user.email})`
            }));
        }

        borrowModal.value.userSearchLoading = false;
    }, 500);
};

const searchBooks = (query) => {
    borrowModal.value.bookSearchLoading = true;

    setTimeout(() => {
        if (query) {
            const search = query.toLowerCase();
            borrowModal.value.bookOptions = books.value
                .filter(
                    (book) =>
                        book.available &&
                        (book.title.toLowerCase().includes(search) ||
                            book.author.toLowerCase().includes(search))
                )
                .map((book) => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    coverUrl: book.coverUrl
                }));
        } else {
            borrowModal.value.bookOptions = books.value
                .filter((book) => book.available)
                .map((book) => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    coverUrl: book.coverUrl
                }));
        }

        borrowModal.value.bookSearchLoading = false;
    }, 500);
};

const saveBorrow = () => {
    borrowFormRef.value.validate((valid) => {
        if (valid) {
            borrowModal.value.loading = true;

            setTimeout(() => {
                // Récupérer les informations du livre et de l'utilisateur
                const book = books.value.find(
                    (b) => b.id === borrowModal.value.form.bookId
                );
                const user = users.value.find(
                    (u) => u.id === borrowModal.value.form.userId
                );

                if (book && user) {
                    // Mettre à jour la disponibilité du livre
                    const bookIndex = books.value.findIndex(
                        (b) => b.id === book.id
                    );
                    if (bookIndex !== -1) {
                        books.value[bookIndex] = { ...book, available: false };
                    }

                    // Ajouter le nouvel emprunt
                    const newBorrow = {
                        id:
                            borrows.value.length > 0
                                ? Math.max(...borrows.value.map((b) => b.id)) +
                                  1
                                : 1,
                        bookId: book.id,
                        bookTitle: book.title,
                        userId: user.id,
                        userName: user.name,
                        borrowDate:
                            borrowModal.value.form.borrowDate.toLocaleDateString(
                                'fr-FR'
                            ),
                        dueDate:
                            borrowModal.value.form.dueDate.toLocaleDateString(
                                'fr-FR'
                            ),
                        status: 'active',
                        notes: borrowModal.value.form.notes
                    };

                    borrows.value.push(newBorrow);

                    ElMessage({
                        type: 'success',
                        message: 'Emprunt créé avec succès'
                    });
                }

                borrowModal.value.loading = false;
                borrowModal.value.visible = false;
            }, 1000);
        }
    });
};

const markAsReturned = (borrow) => {
    const borrowIndex = borrows.value.findIndex((b) => b.id === borrow.id);

    if (borrowIndex !== -1) {
        // Mettre à jour l'emprunt
        const updatedBorrow = {
            ...borrow,
            status: 'returned',
            returnDate: new Date().toLocaleDateString('fr-FR')
        };

        borrows.value[borrowIndex] = updatedBorrow;

        // Rendre le livre à nouveau disponible
        const bookIndex = books.value.findIndex((b) => b.id === borrow.bookId);

        if (bookIndex !== -1) {
            books.value[bookIndex] = {
                ...books.value[bookIndex],
                available: true
            };
        }

        ElMessage({
            type: 'success',
            message: `Le livre "${borrow.bookTitle}" a été retourné`
        });
    }
};

const extendBorrow = (borrow) => {
    const borrowIndex = borrows.value.findIndex((b) => b.id === borrow.id);

    if (borrowIndex !== -1) {
        // Prolonger la date de retour de 14 jours
        const dueDateParts = borrow.dueDate.split('/');
        const dueDate = new Date(
            dueDateParts[2],
            dueDateParts[1] - 1,
            dueDateParts[0]
        );
        dueDate.setDate(dueDate.getDate() + 14);

        const updatedBorrow = {
            ...borrow,
            dueDate: dueDate.toLocaleDateString('fr-FR'),
            status: 'active' // Si c'était en retard, il ne l'est plus
        };

        borrows.value[borrowIndex] = updatedBorrow;

        ElMessage({
            type: 'success',
            message: `L'emprunt a été prolongé de 14 jours (nouvelle date de retour: ${updatedBorrow.dueDate})`
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

const deleteBorrow = () => {
    confirmDialog.value.loading = true;

    setTimeout(() => {
        const index = borrows.value.findIndex(
            (borrow) => borrow.id === confirmDialog.value.borrowId
        );

        if (index !== -1) {
            const borrow = borrows.value[index];
            borrows.value.splice(index, 1);

            // Si le livre n'est pas retourné, le rendre disponible
            if (borrow.status !== 'returned') {
                const bookIndex = books.value.findIndex(
                    (b) => b.id === borrow.bookId
                );

                if (bookIndex !== -1) {
                    books.value[bookIndex] = {
                        ...books.value[bookIndex],
                        available: true
                    };
                }
            }

            ElMessage({
                type: 'success',
                message: 'Emprunt supprimé avec succès'
            });
        }

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    }, 800);
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

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-row .el-form-item {
    flex: 1;
    margin-bottom: 0;
}

.book-option {
    display: flex;
    align-items: center;
}

.book-option-info {
    display: flex;
    flex-direction: column;
}

.book-option-title {
    font-weight: 600;
    color: #333;
}

.book-option-author {
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
