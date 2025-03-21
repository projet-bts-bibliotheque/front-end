<template>
    <div class="search-bar">
        <div class="simple-search" v-if="!advancedMode">
            <el-input
                v-model="localSearchText"
                class="search-input"
                :placeholder="placeholder || 'Rechercher un livre...'"
                clearable
                @change="emitSearch"
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
                            <el-date-picker
                                v-model="advancedForm.yearRange"
                                type="yearrange"
                                range-separator="-"
                                start-placeholder="Début"
                                end-placeholder="Fin"
                                style="width: 100%"
                            />
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
import { ref, watch } from 'vue';
import { Search, Close } from '@element-plus/icons-vue';

// Définir les props
const props = defineProps({
    searchText: {
        type: String,
        default: ''
    },
    placeholder: {
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
    }
});

// Définir les événements
const emit = defineEmits([
    'update:searchText',
    'search',
    'advancedSearch',
    'reset'
]);

// État local
const advancedMode = ref(false);
const localSearchText = ref(props.searchText);

// Formulaire de recherche avancée
const advancedForm = ref({
    text: '',
    categories: [],
    authors: [],
    yearRange: null,
    availability: 'all'
});

// Synchroniser le texte de recherche
watch(
    () => props.searchText,
    (newValue) => {
        localSearchText.value = newValue;
    }
);

watch(
    () => localSearchText.value,
    (newValue) => {
        emit('update:searchText', newValue);
    }
);

// Méthodes
const showAdvanced = () => {
    // Initialiser le formulaire avancé avec les valeurs actuelles
    advancedForm.value.text = localSearchText.value;
    advancedMode.value = true;
};

const hideAdvanced = () => {
    advancedMode.value = false;
};

const emitSearch = () => {
    emit('search', localSearchText.value);
};

const submitAdvancedSearch = () => {
    emit('advancedSearch', {
        text: advancedForm.value.text,
        categories: advancedForm.value.categories,
        authors: advancedForm.value.authors,
        yearRange: advancedForm.value.yearRange,
        availability: advancedForm.value.availability
    });
    advancedMode.value = false;
};

const resetAdvancedSearch = () => {
    advancedForm.value = {
        text: '',
        categories: [],
        authors: [],
        yearRange: null,
        availability: 'all'
    };
    localSearchText.value = '';
    emit('reset');
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
