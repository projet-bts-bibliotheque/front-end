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
const authors = ref([]);
const editors = ref([]);

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

const loadBooks = async () => {
    loading.value = true;
    try {
        const api = (await import('@/services/api')).default;

        // Récupérer les livres, auteurs et éditeurs
        const [booksData, authorsData, editorsData] = await Promise.all([
            api.get('/books'),
            api.get('/authors'),
            api.get('/editors')
        ]);

        // Stocker les listes d'auteurs et d'éditeurs pour le formulaire
        authors.value = authorsData;
        editors.value = editorsData;

        // Vérifier quels livres sont actuellement empruntés
        let borrowedBooks = [];
        try {
            const reservations = await api.get('/reservation/books');
            borrowedBooks = reservations
                .filter((r) => !r.return_date)
                .map((r) => r.book_id);
        } catch (error) {
            console.warn('Impossible de récupérer les réservations:', error);
        }

        // Transformer les données pour notre interface
        books.value = booksData.map((book) => {
            const author = authorsData.find((a) => a.id === book.author);
            const editor = editorsData.find((e) => e.id === book.editor);

            return {
                id: book.id,
                title: book.title,
                author: author
                    ? `${author.firstname} ${author.lastname}`
                    : 'Auteur inconnu',
                authorId: book.author,
                rating: book.average_rating || 0,
                coverUrl: book.thumbnails || '/api/placeholder/150/220',
                available: !borrowedBooks.includes(book.isbn),
                category: Array.isArray(book.keyword)
                    ? book.keyword.join(', ')
                    : book.keyword || 'non-catégorisé',
                pages: book.pages || 0,
                year: book.publish_year || 0,
                isbn: book.isbn,
                language: book.language || 'Français',
                publisher: editor ? editor.name : 'Éditeur inconnu',
                editorId: book.editor,
                description: book.summary || ''
            };
        });
    } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
        ElMessage({
            type: 'error',
            message: 'Impossible de charger les livres. Veuillez réessayer.'
        });
    } finally {
        loading.value = false;
    }
};

// Charger les livres au montage du composant
onMounted(async () => {
    await loadBooks();
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

const saveBook = async () => {
    try {
        await bookFormRef.value.validate();
        bookModal.value.loading = true;

        const api = (await import('@/services/api')).default;

        // Préparer les données pour l'API
        const bookData = {
            isbn: bookModal.value.form.isbn,
            title: bookModal.value.form.title,
            author: getAuthorIdByName(bookModal.value.form.author),
            editor: getEditorIdByName(bookModal.value.form.publisher),
            thumbnails: bookModal.value.form.coverUrl,
            average_rating: bookModal.value.form.rating || 0,
            ratings_count: 0,
            keyword: bookModal.value.form.category
                ? [bookModal.value.form.category]
                : [],
            summary: bookModal.value.form.description,
            publish_year: bookModal.value.form.year,
            pages: bookModal.value.form.pages,
            language: bookModal.value.form.language
        };

        if (bookModal.value.isEdit) {
            // Mettre à jour le livre existant
            await api.put(`/books/${bookModal.value.form.isbn}`, bookData);

            ElMessage({
                type: 'success',
                message: 'Livre mis à jour avec succès'
            });
        } else {
            // Ajouter un nouveau livre
            await api.post('/books', bookData);

            ElMessage({
                type: 'success',
                message: 'Livre ajouté avec succès'
            });
        }

        // Recharger les livres
        await loadBooks();
        bookModal.value.visible = false;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du livre:', error);

        ElMessage({
            type: 'error',
            message:
                error.message || 'Une erreur est survenue lors de la sauvegarde'
        });
    } finally {
        bookModal.value.loading = false;
    }
};

const toggleBookAvailability = async (book) => {
    try {
        loading.value = true;
        const api = (await import('@/services/api')).default;

        if (book.available) {
            // Si le livre est disponible, créer une réservation fictive pour le rendre indisponible
            await api.post('/reservation/books', { book_id: book.isbn });

            ElMessage({
                type: 'success',
                message: `Le livre "${book.title}" est maintenant indisponible`
            });
        } else {
            // Si indisponible, trouver la réservation active et la marquer comme retournée
            const reservations = await api.get('/reservation/books');
            const activeReservation = reservations.find(
                (r) => r.book_id === book.isbn && !r.return_date
            );

            if (activeReservation) {
                await api.post('/reservation/books/return', {
                    book_id: book.isbn
                });

                ElMessage({
                    type: 'success',
                    message: `Le livre "${book.title}" est maintenant disponible`
                });
            } else {
                ElMessage({
                    type: 'warning',
                    message: `Impossible de trouver une réservation active pour ce livre`
                });
            }
        }

        // Recharger les livres
        await loadBooks();
    } catch (error) {
        console.error(
            'Erreur lors de la modification de la disponibilité:',
            error
        );
        ElMessage({
            type: 'error',
            message: error.message || 'Une erreur est survenue'
        });
    } finally {
        loading.value = false;
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

const deleteBook = async () => {
    try {
        confirmDialog.value.loading = true;

        const api = (await import('@/services/api')).default;

        // Trouver l'ISBN du livre à supprimer
        const bookToDelete = books.value.find(
            (book) => book.id === confirmDialog.value.bookId
        );
        if (!bookToDelete) {
            throw new Error('Livre introuvable');
        }

        // Supprimer le livre en utilisant son ISBN
        await api.delete(`/books/${bookToDelete.isbn}`);

        // Recharger les livres
        await loadBooks();

        ElMessage({
            type: 'success',
            message: 'Livre supprimé avec succès'
        });

        confirmDialog.value.loading = false;
        confirmDialog.value.visible = false;
    } catch (error) {
        console.error('Erreur lors de la suppression du livre:', error);

        ElMessage({
            type: 'error',
            message:
                error.message ||
                'Une erreur est survenue lors de la suppression'
        });

        confirmDialog.value.loading = false;
    }
};

// Fonction utilitaire pour obtenir l'ID d'un auteur à partir de son nom complet
const getAuthorIdByName = (fullName) => {
    if (!fullName || !authors.value || authors.value.length === 0) return null;

    // Séparer le nom complet en prénom et nom
    const parts = fullName.split(' ');
    let firstName = '';
    let lastName = '';

    if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
    } else {
        lastName = fullName;
    }

    // Rechercher l'auteur qui correspond le mieux
    const author = authors.value.find(
        (a) =>
            (a.firstname.toLowerCase() === firstName.toLowerCase() ||
                firstName === '') &&
            a.lastname.toLowerCase() === lastName.toLowerCase()
    );

    return author ? author.id : null;
};
// Fonction utilitaire pour obtenir l'ID d'un éditeur à partir de son nom
const getEditorIdByName = (name) => {
    if (!name || !editors.value || editors.value.length === 0) return null;

    const editor = editors.value.find(
        (e) => e.name.toLowerCase() === name.toLowerCase()
    );

    return editor ? editor.id : null;
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
