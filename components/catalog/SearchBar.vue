<template>
    <div class="catalog-search-bar">
        <div class="search-container">
            <el-input
                v-model="localSearchText"
                placeholder="Rechercher par titre, auteur ou mot-clé..."
                size="large"
                clearable
                @input="handleInput"
                @clear="handleClear"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
                <template #suffix v-if="localSearchText">
                    <el-button
                        type="text"
                        icon="Close"
                        @click="handleClear"
                        circle
                    />
                </template>
            </el-input>
        </div>

        <div class="search-options">
            <el-button
                :type="advancedSearch ? 'primary' : ''"
                size="large"
                @click="toggleAdvancedSearch"
            >
                <el-icon><Setting /></el-icon>
                Recherche avancée
            </el-button>
        </div>

        <transition name="fade">
            <div class="advanced-search-panel" v-if="advancedSearch">
                <div class="advanced-search-fields">
                    <el-row :gutter="20">
                        <el-col :span="12" :xs="24">
                            <el-form-item label="Catégorie">
                                <el-select
                                    v-model="categoryFilter"
                                    placeholder="Toutes les catégories"
                                    multiple
                                    size="large"
                                    collapse-tags
                                    collapse-tags-tooltip
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
                        </el-col>

                        <el-col :span="12" :xs="24">
                            <el-form-item label="Auteur">
                                <el-select
                                    v-model="authorFilter"
                                    placeholder="Tous les auteurs"
                                    multiple
                                    size="large"
                                    collapse-tags
                                    collapse-tags-tooltip
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
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12" :xs="24">
                            <el-form-item label="Période de publication">
                                <el-date-picker
                                    v-model="yearRange"
                                    type="yearrange"
                                    range-separator="à"
                                    start-placeholder="Année début"
                                    end-placeholder="Année fin"
                                    size="large"
                                    style="width: 100%"
                                    :default-value="[
                                        new Date(1900, 1, 1),
                                        new Date()
                                    ]"
                                />
                            </el-form-item>
                        </el-col>

                        <el-col :span="12" :xs="24">
                            <el-form-item label="Disponibilité">
                                <el-radio-group
                                    v-model="availabilityFilter"
                                    size="large"
                                >
                                    <el-radio :value="'all'">Tous</el-radio>
                                    <el-radio :value="'available'"
                                        >Disponibles</el-radio
                                    >
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                <div class="advanced-search-actions">
                    <el-button @click="resetAdvancedSearch"
                        >Réinitialiser</el-button
                    >
                    <el-button type="primary" @click="applyAdvancedSearch"
                        >Rechercher</el-button
                    >
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Search, Setting, Close } from '@element-plus/icons-vue';

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
const advancedSearch = ref(false);
const categoryFilter = ref([]);
const authorFilter = ref([]);
const yearRange = ref([new Date(1900, 0, 1), new Date()]);
const availabilityFilter = ref('all');

// Mettre à jour la valeur locale lorsque la prop change
watch(
    () => props.searchText,
    (newVal) => {
        localSearchText.value = newVal;
    }
);

// Handlers pour les entrées de recherche
const handleInput = () => {
    emit('update:searchText', localSearchText.value);
    if (localSearchText.value.length > 2) {
        emit('search', localSearchText.value);
    }
};

const handleClear = () => {
    localSearchText.value = '';
    emit('update:searchText', '');
    emit('search', '');
};

// Toggle pour la recherche avancée
const toggleAdvancedSearch = () => {
    advancedSearch.value = !advancedSearch.value;
};

// Réinitialiser les filtres de recherche avancée
const resetAdvancedSearch = () => {
    categoryFilter.value = [];
    authorFilter.value = [];
    yearRange.value = [new Date(1900, 0, 1), new Date()];
    availabilityFilter.value = 'all';

    emit('reset');
};

// Appliquer les filtres de recherche avancée
const applyAdvancedSearch = () => {
    // Préparer les filtres avec les valeurs par défaut pour éviter les undefined
    const filters = {
        text: localSearchText.value || '',
        categories: categoryFilter.value || [],
        authors: authorFilter.value || [],
        yearRange: yearRange.value || [new Date(1900, 0, 1), new Date()],
        availability: availabilityFilter.value || 'all'
    };

    emit('advancedSearch', filters);
};
</script>

<style scoped>
.catalog-search-bar {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-container {
    margin-bottom: 16px;
}

.search-options {
    display: flex;
    justify-content: flex-end;
}

.advanced-search-panel {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.advanced-search-fields {
    margin-bottom: 24px;
}

.advanced-search-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

:deep(.el-form-item__label) {
    font-weight: 600;
    margin-bottom: 8px;
}

@media (max-width: 768px) {
    .catalog-search-bar {
        padding: 16px;
    }

    .search-options {
        flex-direction: column;
    }

    .advanced-search-panel {
        padding-top: 16px;
    }
}
</style>
