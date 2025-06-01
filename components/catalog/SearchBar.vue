<template>
    <div class="search-bar">
        <div class="simple-search" v-if="!advancedMode">
            <el-input
                v-model="localSearchText"
                class="search-input"
                :placeholder="placeholder || 'Rechercher un livre...'"
                clearable
                @input="handleInput"
                @clear="handleClear"
                @keyup.enter="emitSearch"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
                <template #append>
                    <el-button @click="showAdvanced"
                        >Recherche avancée</el-button
                    >
                </template>
            </el-input>
        </div>

        <div class="advanced-search" v-else>
            <div class="advanced-search-header">
                <h3>Recherche avancée</h3>
                <el-button text @click="hideAdvanced">
                    <el-icon><Close /></el-icon>
                </el-button>
            </div>

            <el-form @submit.prevent="submitAdvancedSearch">
                <div class="advanced-search-form">
                    <div class="form-column">
                        <el-form-item label="Termes de recherche">
                            <el-input
                                v-model="advancedForm.text"
                                placeholder="Titre, auteur, mots-clés..."
                            />
                        </el-form-item>

                        <el-form-item label="Catégories">
                            <el-select
                                v-model="advancedForm.categories"
                                multiple
                                placeholder="Sélectionner"
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
                    </div>

                    <div class="form-column">
                        <el-form-item label="Auteurs">
                            <el-select
                                v-model="advancedForm.authors"
                                multiple
                                filterable
                                placeholder="Sélectionner ou saisir"
                                style="width: 100%"
                            >
                                <el-option
                                    v-for="author in authors"
                                    :key="author"
                                    :label="author"
                                    :value="author"
                                />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Année de publication">
                            <div class="year-inputs">
                                <el-input-number
                                    v-model="advancedForm.yearStart"
                                    :min="1900"
                                    :max="2025"
                                    placeholder="De"
                                    style="width: 100px"
                                />
                                <span>à</span>
                                <el-input-number
                                    v-model="advancedForm.yearEnd"
                                    :min="1900"
                                    :max="2025"
                                    placeholder="À"
                                    style="width: 100px"
                                />
                            </div>
                        </el-form-item>
                    </div>

                    <div class="form-column">
                        <el-form-item label="Disponibilité">
                            <el-radio-group v-model="advancedForm.availability">
                                <el-radio value="all">Tous les livres</el-radio>
                                <el-radio value="available"
                                    >Disponibles uniquement</el-radio
                                >
                            </el-radio-group>
                        </el-form-item>
                    </div>
                </div>

                <div class="advanced-search-actions">
                    <el-button @click="hideAdvanced">Annuler</el-button>
                    <el-button type="default" @click="resetAdvancedSearch"
                        >Réinitialiser</el-button
                    >
                    <el-button type="primary" @click="submitAdvancedSearch"
                        >Rechercher</el-button
                    >
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { Search, Close } from '@element-plus/icons-vue';

const props = defineProps({
    searchText: {
        type: String,
        default: ''
    },
    categories: {
        type: Array,
        default: () => []
    },
    authors: {
        type: Array,
        default: () => []
    },
    placeholder: {
        type: String,
        default: 'Rechercher un livre...'
    }
});

const emit = defineEmits([
    'update:searchText',
    'search',
    'advancedSearch',
    'reset'
]);

// Variables locales
const localSearchText = ref(props.searchText);
const advancedMode = ref(false);

// Formulaire de recherche avancée
const advancedForm = reactive({
    text: '',
    categories: [],
    authors: [],
    yearStart: 1900,
    yearEnd: 2025,
    availability: 'all'
});

// Timeout pour le debounce
let searchTimeout = null;

// Mettre à jour la valeur locale lorsque la prop change
watch(
    () => props.searchText,
    (newVal) => {
        localSearchText.value = newVal;
        advancedForm.text = newVal;
    }
);

// Handlers pour les entrées de recherche
const handleInput = () => {
    emit('update:searchText', localSearchText.value);

    // Annuler le timeout précédent
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Ne déclencher la recherche qu'après 300ms sans saisie
    if (
        localSearchText.value.length >= 2 ||
        localSearchText.value.length === 0
    ) {
        searchTimeout = setTimeout(() => {
            emit('search', localSearchText.value);
        }, 300);
    }
};

const handleClear = () => {
    localSearchText.value = '';
    emit('update:searchText', '');
    emit('search', '');
};

const emitSearch = () => {
    emit('search', localSearchText.value);
};

// Gestion de la recherche avancée
const showAdvanced = () => {
    advancedMode.value = true;
    advancedForm.text = localSearchText.value;
};

const hideAdvanced = () => {
    advancedMode.value = false;
};

const resetAdvancedSearch = () => {
    Object.assign(advancedForm, {
        text: '',
        categories: [],
        authors: [],
        yearStart: 1900,
        yearEnd: 2025,
        availability: 'all'
    });

    localSearchText.value = '';
    emit('update:searchText', '');
    emit('reset');
};

const submitAdvancedSearch = () => {
    // Mettre à jour le texte de recherche simple
    localSearchText.value = advancedForm.text;
    emit('update:searchText', advancedForm.text);

    // Émettre la recherche avancée avec les données formatées
    const filters = {
        text: advancedForm.text,
        categories: advancedForm.categories,
        authors: advancedForm.authors,
        yearRange: [advancedForm.yearStart, advancedForm.yearEnd],
        availability: advancedForm.availability
    };

    emit('advancedSearch', filters);
    advancedMode.value = false;
};
</script>

<style scoped>
.search-bar {
    margin-bottom: 30px;
}

.search-input {
    width: 100%;
}

.advanced-search {
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.advanced-search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.advanced-search-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e88e5;
}

.advanced-search-form {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
}

.form-column {
    flex: 1;
    min-width: 250px;
}

.year-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
}

.advanced-search-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
    .advanced-search-form {
        flex-direction: column;
        gap: 0;
    }
}
</style>
