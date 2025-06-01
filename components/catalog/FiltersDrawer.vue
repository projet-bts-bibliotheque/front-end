<template>
    <div class="filters-drawer" :class="{ 'is-active': show }">
        <div class="filters-header">
            <h2>Filtres</h2>
            <el-button
                type="text"
                icon="Close"
                @click="$emit('update:show', false)"
                class="close-button"
            />
        </div>

        <div class="filters-content">
            <div class="filter-section">
                <h3>Catégories</h3>
                <el-checkbox-group v-model="localSelectedCategories">
                    <el-checkbox
                        v-for="category in categories"
                        :key="category.value"
                        :value="category.value"
                        size="large"
                    >
                        {{ category.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </div>

            <div class="filter-section">
                <h3>Disponibilité</h3>
                <el-radio-group v-model="localAvailabilityFilter" size="large">
                    <el-radio label="all">Tous les livres</el-radio>
                    <el-radio label="available"
                        >Disponibles uniquement</el-radio
                    >
                </el-radio-group>
            </div>

            <div class="filter-section">
                <h3>Note minimale</h3>
                <el-rate
                    v-model="localMinRating"
                    allow-half
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                />
            </div>

            <div class="filter-section">
                <h3>Année de publication</h3>
                <div class="year-range">
                    <el-slider
                        v-model="localYearRange"
                        range
                        :min="0"
                        :max="2025"
                        :marks="yearMarks"
                    />
                </div>
            </div>
        </div>

        <div class="filters-footer">
            <el-button type="primary" @click="applyFilters"
                >Appliquer</el-button
            >
            <el-button @click="resetFilters">Réinitialiser</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    selectedCategories: {
        type: Array,
        default: () => []
    },
    availabilityFilter: {
        type: String,
        default: 'all'
    },
    minRating: {
        type: Number,
        default: 0
    },
    yearRange: {
        type: Array,
        default: () => [0, 2025]
    },
    categories: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:show', 'apply', 'reset']);

// Variables locales pour suivre les modifications avant de les appliquer
const localSelectedCategories = ref([...props.selectedCategories]);
const localAvailabilityFilter = ref(props.availabilityFilter);
const localMinRating = ref(props.minRating);
const localYearRange = ref([...props.yearRange]);

const yearMarks = {
    0: '0',
    2025: '2025'
};

// Mettre à jour les variables locales lorsque les props changent
watch(
    () => props.selectedCategories,
    (newVal) => {
        localSelectedCategories.value = [...newVal];
    }
);

watch(
    () => props.availabilityFilter,
    (newVal) => {
        localAvailabilityFilter.value = newVal;
    }
);

watch(
    () => props.minRating,
    (newVal) => {
        localMinRating.value = newVal;
    }
);

watch(
    () => props.yearRange,
    (newVal) => {
        localYearRange.value = [...newVal];
    }
);

// Appliquer les filtres
const applyFilters = () => {
    emit('apply', {
        selectedCategories: localSelectedCategories.value,
        availabilityFilter: localAvailabilityFilter.value,
        minRating: localMinRating.value,
        yearRange: localYearRange.value
    });
    emit('update:show', false);
};

const resetFilters = () => {
    localSelectedCategories.value = [];
    localAvailabilityFilter.value = 'all';
    localMinRating.value = 0;
    localYearRange.value = [0, 2025];

    emit('reset');
    emit('update:show', false);
};
</script>

<style scoped>
.filters-drawer {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 320px;
    background-color: white;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
}

.filters-drawer.is-active {
    transform: translateX(0);
}

.filters-header {
    padding: 24px 24px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 5;
}

.filters-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e88e5;
}

.close-button {
    font-size: 1.2rem;
}

.filters-content {
    flex: 1;
    padding: 16px 24px;
    overflow-y: auto;
}

.filter-section {
    margin-bottom: 30px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
}

.filter-section:last-child {
    border-bottom: none;
}

.filter-section h3 {
    font-size: 1.1rem;
    margin-bottom: 16px;
    font-weight: 600;
    color: #333;
}

.year-range {
    padding: 8px;
    margin-top: 8px;
}

.filters-footer {
    padding: 16px 24px;
    display: flex;
    gap: 12px;
    border-top: 1px solid #f0f0f0;
    background-color: white;
    position: sticky;
    bottom: 0;
}

.filters-footer .el-button {
    flex: 1;
}

@media (max-width: 768px) {
    .filters-drawer {
        width: 280px;
    }
}
</style>
