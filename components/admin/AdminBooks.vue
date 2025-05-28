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
                    {{ formatCategory(scope.row.category) }}
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
                    <el-form-item label="Auteur" prop="authorId">
                        <el-select
                            v-model="bookModal.form.authorId"
                            placeholder="Sélectionner un auteur"
                            style="width: 100%"
                            filterable
                        >
                            <el-option
                                v-for="author in authors"
                                :key="author.id"
                                :label="`${author.firstname} ${author.lastname}`"
                                :value="author.id"
                            />
                        </el-select>
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
                            :disabled="bookModal.isEdit"
                        />
                    </el-form-item>
                </div>

                <div class="form-row">
                    <el-form-item label="Éditeur" prop="editorId">
                        <el-select
                            v-model="bookModal.form.editorId"
                            placeholder="Sélectionner un éditeur"
                            style="width: 100%"
                            filterable
                        >
                            <el-option
                                v-for="editor in editors"
                                :key="editor.id"
                                :label="editor.name"
                                :value="editor.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Langue" prop="language">
                        <el-select
                            v-model="bookModal.form.language"
                            placeholder="Langue du livre"
                            style="width: 100%"
                        >
                            <el-option label="Français" value="Français" />
                            <el-option label="Anglais" value="Anglais" />
                            <el-option label="Espagnol" value="Espagnol" />
                            <el-option label="Italien" value="Italien" />
                            <el-option label="Allemand" value="Allemand" />
                        </el-select>
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

                <el-form-item label="URL de la couverture">
                    <el-input
                        v-model="bookModal.form.coverUrl"
                        placeholder="URL de l'image de couverture"
                        style="width: 100%"
                    />
                    <el-image
                        v-if="bookModal.form.coverUrl"
                        :src="bookModal.form.coverUrl"
                        fit="cover"
                        style="width: 150px; height: 200px; margin-top: 10px"
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
import { ref, computed, onMounted } from 'vue';
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

// Données
const books = ref([]);
const authors = ref([]);
const editors = ref([]);

// État du modal d'ajout/édition
const bookModal = ref({
    visible: false,
    isEdit: false,
    loading: false,
    form: {
        isbn: '',
        title: '',
        authorId: null,
        editorId: null,
        category: '',
        pages: 0,
        year: new Date().getFullYear(),
        language: 'Français',
        description: '',
        coverUrl: '',
        rating: 0
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
    authorId: [
        {
            required: true,
            message: 'Veuillez sélectionner un auteur',
            trigger: 'change'
        }
    ],
    editorId: [
        {
            required: true,
            message: 'Veuillez sélectionner un éditeur',
            trigger: 'change'
        }
    ],
    category: [
        {
            required: true,
            message: 'Veuillez sélectionner une catégorie',
            trigger: 'change'
        }
    ],
    isbn: [
        {
            required: true,
            message: "Veuillez saisir l'ISBN",
            trigger: 'blur'
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

const loadAuthorsAndEditors = async () => {
    try {
        const api = (await import('@/services/api')).default;

        const [authorsData, editorsData] = await Promise.all([
            api.get('/authors'),
            api.get('/editors')
        ]);

        authors.value = authorsData;
        editors.value = editorsData;
    } catch (error) {
        console.error('Erreur lors du chargement des auteurs/éditeurs:', error);
        ElMessage.error('Impossible de charger les auteurs et éditeurs');
    }
};

// Chargement des données
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

        // Stocker les listes d'auteurs et d'éditeurs
        authors.value = authorsData;
        editors.value = editorsData;

        // Vérifier quels livres sont actuellement empruntés
        let borrowedBooks = [];
        try {
            const reservations = await api.bookReservations.getAll();
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
                isbn: book.isbn,
                title: book.title,
                author: author
                    ? `${author.firstname} ${author.lastname}`
                    : 'Auteur inconnu',
                authorId: book.author,
                editor: editor ? editor.name : 'Éditeur inconnu',
                editorId: book.editor,
                rating: book.average_rating || 0,
                ratingsCount: book.ratings_count || 0,
                coverUrl: book.thumbnail || '/api/placeholder/150/220',
                available: !borrowedBooks.includes(book.isbn),
                category: Array.isArray(book.keyword)
                    ? book.keyword[0] || 'non-catégorisé'
                    : book.keyword || 'non-catégorisé',
                pages: book.pages || 0,
                year: book.publish_year || 0,
                language: book.language || 'Français',
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
    console.log('📚 Livres chargés:', books.value); // Pour debug
});

// Fonctions utilitaires
const formatCategory = (categoryValue) => {
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

const openAddBookModal = async () => {
    // Charger les auteurs et éditeurs si pas encore fait
    if (authors.value.length === 0 || editors.value.length === 0) {
        await loadAuthorsAndEditors();
    }

    bookModal.value.isEdit = false;
    bookModal.value.form = {
        isbn: '',
        title: '',
        authorId: null,
        editorId: null,
        category: '',
        pages: 0,
        year: new Date().getFullYear(),
        language: 'Français',
        description: '',
        coverUrl: '',
        rating: 0
    };
    bookModal.value.visible = true;
};
const editBook = async (book) => {
    // Charger les auteurs et éditeurs si pas encore fait
    if (authors.value.length === 0 || editors.value.length === 0) {
        await loadAuthorsAndEditors();
    }

    bookModal.value.isEdit = true;
    bookModal.value.form = {
        isbn: book.isbn,
        title: book.title,
        authorId: book.authorId,
        editorId: book.editorId,
        category: book.category,
        pages: book.pages,
        year: book.year,
        language: book.language,
        description: book.description,
        coverUrl: book.coverUrl,
        rating: book.rating
    };
    bookModal.value.visible = true;
};
const closeBookModal = () => {
    bookModal.value.visible = false;
};

const saveBook = async () => {
    try {
        await bookFormRef.value.validate();
        bookModal.value.loading = true;

        const api = (await import('@/services/api')).default;

        const bookData = {
            isbn: bookModal.value.form.isbn,
            title: bookModal.value.form.title,
            thumbnail:
                bookModal.value.form.coverUrl || '/api/placeholder/150/220', // ← Ajout d'une valeur par défaut
            author: bookModal.value.form.authorId,
            editor: bookModal.value.form.editorId,
            average_rating: bookModal.value.form.rating || 0,
            ratings_count: 0,
            keyword: [bookModal.value.form.category || 'non-catégorisé'], // ← Valeur par défaut
            summary: bookModal.value.form.description || '', // ← Valeur par défaut
            publish_year: bookModal.value.form.year,
            pages: bookModal.value.form.pages || 0, // ← Ajout du champ pages
            language: bookModal.value.form.language || 'Français' // to remove
        };

        console.log('📤 Données envoyées:', bookData); // Pour debug

        if (bookModal.value.isEdit) {
            // Mettre à jour le livre existant
            await api.put(`/books/${bookModal.value.form.isbn}`, bookData);
            ElMessage.success('Livre mis à jour avec succès');
        } else {
            // Ajouter un nouveau livre
            await api.post('/books', bookData);
            ElMessage.success('Livre ajouté avec succès');
        }

        // Recharger les livres
        await loadBooks();
        bookModal.value.visible = false;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du livre:', error);
        ElMessage.error(
            error.message || 'Une erreur est survenue lors de la sauvegarde'
        );
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
            await api.bookReservations.create(book.isbn);

            ElMessage({
                type: 'success',
                message: `Le livre "${book.title}" est maintenant indisponible`
            });
        } else {
            // Si indisponible, marquer comme retourné
            await api.bookReservations.return(book.isbn);

            ElMessage({
                type: 'success',
                message: `Le livre "${book.title}" est maintenant disponible`
            });
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
        bookId: book.isbn,
        loading: false
    };
};

const deleteBook = async () => {
    try {
        confirmDialog.value.loading = true;
        console.log(
            'log: Suppression du livre avec ID/isbn:',
            confirmDialog.value.bookId
        );

        const api = (await import('@/services/api')).default;
        await api.delete(`/books/${confirmDialog.value.bookId}`);

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
