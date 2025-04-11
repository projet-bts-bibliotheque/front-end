<template>
    <div class="admin-books">
        <div class="section-header">
            <h3>Gestion des livres</h3>
            <el-button type="primary" @click="openAddBookModal">
                <el-icon><Plus /></el-icon> Ajouter un livre
            </el-button>
        </div>

        <div class="search-filter-container">
            <el-input
                v-model="searchQuery"
                placeholder="Rechercher un livre..."
                prefix-icon="Search"
                clearable
                @clear="resetFilters"
                @input="filterBooks"
                class="filter-input"
            />

            <el-select
                v-model="categoryFilter"
                placeholder="Catégorie"
                clearable
                @change="filterBooks"
                class="filter-select"
            >
                <el-option
                    v-for="category in categories"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                />
            </el-select>

            <el-select
                v-model="availabilityFilter"
                placeholder="Disponibilité"
                clearable
                @change="filterBooks"
                class="filter-select"
            >
                <el-option label="Disponible" value="available" />
                <el-option label="Indisponible" value="unavailable" />
            </el-select>
        </div>

        <el-table
            :data="paginatedBooks"
            style="width: 100%"
            v-loading="loading"
            stripe
            border
        >
            <el-table-column label="Couverture" width="100">
                <template #default="scope">
                    <el-image
                        style="width: 60px; height: 80px"
                        :src="scope.row.coverUrl"
                        fit="cover"
                        :preview-src-list="[scope.row.coverUrl]"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="title" label="Titre" sortable />
            <el-table-column prop="author" label="Auteur" sortable />
            <el-table-column prop="category" label="Catégorie" sortable>
                <template #default="scope">
                    {{ getCategoryLabel(scope.row.category) }}
                </template>
            </el-table-column>
            <el-table-column prop="year" label="Année" sortable width="100" />
            <el-table-column label="Disponibilité" width="140">
                <template #default="scope">
                    <el-tag
                        :type="scope.row.available ? 'success' : 'danger'"
                        size="large"
                        effect="light"
                    >
                        {{
                            scope.row.available ? 'Disponible' : 'Indisponible'
                        }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Actions" width="200">
                <template #default="scope">
                    <el-button-group>
                        <el-button
                            type="primary"
                            size="small"
                            @click="editBook(scope.row)"
                            title="Éditer"
                        >
                            <el-icon><Edit /></el-icon>
                        </el-button>
                        <el-button
                            type="info"
                            size="small"
                            @click="toggleBookAvailability(scope.row)"
                            :title="
                                scope.row.available
                                    ? 'Marquer comme indisponible'
                                    : 'Marquer comme disponible'
                            "
                        >
                            <el-icon v-if="scope.row.available"
                                ><Remove
                            /></el-icon>
                            <el-icon v-else><CircleCheck /></el-icon>
                        </el-button>
                        <el-button
                            type="danger"
                            size="small"
                            @click="confirmDeleteBook(scope.row)"
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
                :total="filteredBooks.length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- Modal d'ajout/édition de livre -->
        <el-dialog
            v-model="bookModal.visible"
            :title="bookModal.isEdit ? 'Modifier un livre' : 'Ajouter un livre'"
            width="700px"
            @close="closeBookModal"
        >
            <el-form
                :model="bookModal.form"
                :rules="bookValidationRules"
                ref="bookFormRef"
                label-position="top"
            >
                <div class="form-row">
                    <el-form-item label="Titre" prop="title">
                        <el-input
                            v-model="bookModal.form.title"
                            placeholder="Titre du livre"
                        />
                    </el-form-item>
                    <el-form-item label="Auteur" prop="author">
                        <el-input
                            v-model="bookModal.form.author"
                            placeholder="Nom de l'auteur"
                        />
                    </el-form-item>
                </div>

                <div class="form-row">
                    <el-form-item label="Catégorie" prop="category">
                        <el-select
                            v-model="bookModal.form.category"
                            placeholder="Sélectionner une catégorie"
                            style="width: 100%"
                        >
                            <el-option
                                v-for="category in categories"
                                :key="category.value"
                                :label="category.label"
                                :value="category.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Année de publication" prop="year">
                        <el-input-number
                            v-model="bookModal.form.year"
                            :min="1000"
                            :max="2025"
                            style="width: 100%"
                        />
                    </el-form-item>
                </div>

                <div class="form-row">
                    <el-form-item label="Nombre de pages" prop="pages">
                        <el-input-number
                            v-model="bookModal.form.pages"
                            :min="1"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="ISBN" prop="isbn">
                        <el-input
                            v-model="bookModal.form.isbn"
                            placeholder="ISBN du livre"
                        />
                    </el-form-item>
                </div>

                <div class="form-row">
                    <el-form-item label="Langue" prop="language">
                        <el-input
                            v-model="bookModal.form.language"
                            placeholder="Langue du livre"
                        />
                    </el-form-item>
                    <el-form-item label="Éditeur" prop="publisher">
                        <el-input
                            v-model="bookModal.form.publisher"
                            placeholder="Nom de l'éditeur"
                        />
                    </el-form-item>
                </div>

                <el-form-item label="Description" prop="description">
                    <el-input
                        v-model="bookModal.form.description"
                        type="textarea"
                        rows="4"
                        placeholder="Description du livre"
                    />
                </el-form-item>

                <el-form-item label="Couverture">
                    <div class="cover-uploader">
                        <el-image
                            v-if="bookModal.form.coverUrl"
                            :src="bookModal.form.coverUrl"
                            fit="cover"
                            style="
                                width: 150px;
                                height: 200px;
                                margin-right: 20px;
                            "
                        />
                        <!-- <el-upload
                            class="cover-upload-button"
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleCoverChange"
                        >
                            <el-button type="primary">
                                {{
                                    bookModal.form.coverUrl
                                        ? 'Changer la couverture'
                                        : 'Ajouter une couverture'
                                }}
                            </el-button>
                        </el-upload> -->
                        <el-input
                            v-model="bookModal.form.coverUrl"
                            placeholder="URL de la couverture"
                            style="width: 100%"
                        />
                    </div>
                </el-form-item>

                <el-form-item label="Disponibilité">
                    <el-switch
                        v-model="bookModal.form.available"
                        active-text="Disponible"
                        inactive-text="Indisponible"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeBookModal">Annuler</el-button>
                    <el-button
                        type="primary"
                        @click="saveBook"
                        :loading="bookModal.loading"
                    >
                        {{ bookModal.isEdit ? 'Mettre à jour' : 'Ajouter' }}
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
                        @click="deleteBook"
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
    Remove,
    CircleCheck,
    Search,
    WarningFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// État
const loading = ref(false);
const searchQuery = ref('');
const categoryFilter = ref('');
const availabilityFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Liste des catégories
const categories = [
    { value: 'roman', label: 'Romans' },
    { value: 'science-fiction', label: 'Science-fiction' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'policier', label: 'Policiers' },
    { value: 'biographie', label: 'Biographies' },
    { value: 'histoire', label: 'Histoire' },
    { value: 'philosophie', label: 'Philosophie' },
    { value: 'art', label: 'Art et Design' },
    { value: 'sciences', label: 'Sciences' },
    { value: 'informatique', label: 'Informatique' }
];

// Données des livres
const books = ref([]);

// État du modal d'ajout/édition
const bookModal = ref({
    visible: false,
    isEdit: false,
    loading: false,
    form: {
        id: null,
        title: '',
        author: '',
        category: '',
        pages: 0,
        year: new Date().getFullYear(),
        isbn: '',
        language: 'Français',
        publisher: '',
        description: '',
        coverUrl: '',
        available: true
    }
});

// État du dialog de confirmation
const confirmDialog = ref({
    visible: false,
    message: '',
    bookId: null,
    loading: false
});

// Référence au formulaire
const bookFormRef = ref(null);

// Règles de validation
const bookValidationRules = {
    title: [
        {
            required: true,
            message: 'Veuillez saisir le titre du livre',
            trigger: 'blur'
        }
    ],
    author: [
        {
            required: true,
            message: "Veuillez saisir le nom de l'auteur",
            trigger: 'blur'
        }
    ],
    category: [
        {
            required: true,
            message: 'Veuillez sélectionner une catégorie',
            trigger: 'change'
        }
    ],
    year: [
        {
            required: true,
            message: "Veuillez saisir l'année de publication",
            trigger: 'blur'
        }
    ]
};

// Livres filtrés selon les critères de recherche
const filteredBooks = computed(() => {
    let result = [...books.value];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (book) =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
        );
    }

    if (categoryFilter.value) {
        result = result.filter(
            (book) => book.category === categoryFilter.value
        );
    }

    if (availabilityFilter.value) {
        result = result.filter(
            (book) =>
                (availabilityFilter.value === 'available' && book.available) ||
                (availabilityFilter.value === 'unavailable' && !book.available)
        );
    }

    return result;
});

// Livres paginés
const paginatedBooks = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return filteredBooks.value.slice(startIndex, startIndex + pageSize.value);
});

// Fonctions
const getCategoryLabel = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.label : categoryValue;
};

const resetFilters = () => {
    searchQuery.value = '';
    categoryFilter.value = '';
    availabilityFilter.value = '';
    currentPage.value = 1;
};

const filterBooks = () => {
    currentPage.value = 1;
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};

const openAddBookModal = () => {
    bookModal.value.isEdit = false;
    bookModal.value.form = {
        id: null,
        title: '',
        author: '',
        category: '',
        pages: 0,
        year: new Date().getFullYear(),
        isbn: '',
        language: 'Français',
        publisher: '',
        description: '',
        coverUrl: '',
        available: true
    };
    bookModal.value.visible = true;
};

const editBook = (book) => {
    bookModal.value.isEdit = true;
    bookModal.value.form = { ...book };
    bookModal.value.visible = true;
};

const closeBookModal = () => {
    bookModal.value.visible = false;
};

const handleCoverChange = (file) => {
    // Simuler le chargement d'une image
    const reader = new FileReader();
    reader.onload = (e) => {
        bookModal.value.form.coverUrl = e.target.result;
    };
    reader.readAsDataURL(file.raw);
};

const saveBook = () => {
    bookFormRef.value.validate(async (valid) => {
        if (valid) {
            bookModal.value.loading = true;

            setTimeout(async () => {
                if (bookModal.value.isEdit) {
                    // Mettre à jour le livre existant
                    const index = books.value.findIndex(
                        (book) => book.id === bookModal.value.form.id
                    );
                    if (index !== -1) {
                        books.value[index] = { ...bookModal.value.form };
                    }

                    ElMessage({
                        type: 'success',
                        message: 'Livre mis à jour avec succès'
                    });
                } else {
                    // Ajouter un nouveau livre
                    const newBook = {
                        ...bookModal.value.form,
                        id:
                            books.value.length > 0
                                ? Math.max(
                                      ...books.value.map((book) => book.id)
                                  ) + 1
                                : 1,
                        rating: 0
                    };

                    try {
                        const apiData = {
                            ibsn: newBook.isbn,
                            title: newBook.title,
                            thumbnails: newBook.coverUrl,
                            author: newBook.author,
                            editor: newBook.publisher,
                            averageRating: newBook.rating,
                            ratingss_count: 0,
                            keywoard: [newBook.category],
                            summary: newBook.description,
                            publish_year: newBook.year
                        };

                        const response = await fetch(
                            'http://localhost:1234/api/books',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(apiData)
                            }
                        );
                        ElMessage({
                            type: 'success',
                            message: 'Livre ajouté avec succès'
                        });
                        const data = await response.json();
                        console.log(data);
                        const bookresponse = await fetch(
                            `http://localhost:1234/api/books`
                        );
                        const bookdata = await bookresponse.json();
                        console.log(bookdata);
                        books.value = bookdata;
                    } catch (error) {
                        console.error(
                            "Erreur lors de l'ajout du livre:",
                            error
                        );
                        ElMessage({
                            type: 'error',
                            message: `Erreur lors de l'ajout du livre : ${error}`
                        });
                    }
                }

                bookModal.value.loading = false;
                bookModal.value.visible = false;
            }, 1000);
        }
    });
};

const toggleBookAvailability = (book) => {
    const updatedBook = { ...book, available: !book.available };
    const index = books.value.findIndex((b) => b.id === book.id);

    if (index !== -1) {
        books.value[index] = updatedBook;

        ElMessage({
            type: 'success',
            message: `Le livre "${book.title}" est maintenant ${
                updatedBook.available ? 'disponible' : 'indisponible'
            }`
        });
    }
};

const confirmDeleteBook = (book) => {
    confirmDialog.value = {
        visible: true,
        message: `Êtes-vous sûr de vouloir supprimer le livre "${book.title}" ?`,
        bookId: book.id,
        loading: false
    };
};

const deleteBook = () => {
    confirmDialog.value.loading = true;

    setTimeout(() => {
        const index = books.value.findIndex(
            (book) => book.id === confirmDialog.value.bookId
        );

        if (index !== -1) {
            books.value.splice(index, 1);

            ElMessage({
                type: 'success',
                message: 'Livre supprimé avec succès'
            });
        }

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    }, 800);
};
</script>

<style scoped>
@import './CommonAdminStyle.css';

.admin-books {
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

.cover-uploader {
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
