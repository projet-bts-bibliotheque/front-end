<template>
    <div
        :class="['catalog-book-card', { 'list-mode': viewMode === 'list' }]"
        @click="$emit('showDetails', book)"
    >
        <div class="book-availability" v-if="book.available">Disponible</div>
        <div class="book-availability unavailable" v-else>Indisponible</div>

        <div
            class="book-cover"
            :style="{ backgroundImage: `url(${book.coverUrl})` }"
        ></div>

        <div class="book-info">
            <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>

            <div class="book-meta" v-if="viewMode === 'list'">
                <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ book.year }}</span>
                </div>
                <div class="meta-item">
                    <el-icon><Document /></el-icon>
                    <span>{{ book.pages }} pages</span>
                </div>
                <div class="meta-item">
                    <el-icon><Collection /></el-icon>
                    <span>{{ getCategoryName(book.category) }}</span>
                </div>
            </div>

            <div
                class="book-description"
                v-if="viewMode === 'list' && book.description"
            >
                <p>{{ truncateDescription(book.description) }}</p>
            </div>

            <div class="rating">
                <el-rate v-model="book.rating" disabled allow-half :max="5" />
                <span class="rating-text">{{ book.rating }}</span>
            </div>

            <div class="book-actions">
                <el-button
                    class="reserve-button"
                    size="small"
                    type="primary"
                    :disabled="!book.available"
                    @click.stop="$emit('reserve', book)"
                >
                    {{ book.available ? 'Réserver' : 'Indisponible' }}
                </el-button>

                <el-button
                    v-if="viewMode === 'list'"
                    size="small"
                    @click.stop="$emit('showDetails', book)"
                >
                    Détails
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Calendar, Document, Collection } from '@element-plus/icons-vue';

defineProps({
    book: {
        type: Object,
        required: true
    },
    viewMode: {
        type: String,
        default: 'grid'
    }
});

defineEmits(['showDetails', 'reserve']);

/**
 * Tronquer la description pour l'affichage en mode liste
 * @param {string} description - Description complète du livre
 * @returns {string} Description tronquée avec des points de suspension
 */
const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 180
        ? description.substring(0, 180) + '...'
        : description;
};

/**
 * Convertir le code de catégorie en nom complet
 * @param {string} categoryCode - Code de la catégorie
 * @returns {string} Nom complet de la catégorie
 */
const getCategoryName = (categoryCode) => {
    const categories = {
        roman: 'Roman',
        'science-fiction': 'Science-fiction',
        fantasy: 'Fantasy',
        policier: 'Policier',
        biographie: 'Biographie',
        histoire: 'Histoire',
        philosophie: 'Philosophie',
        art: 'Art et Design',
        sciences: 'Sciences',
        informatique: 'Informatique'
    };

    return categories[categoryCode] || categoryCode;
};
</script>

<style scoped>
.catalog-book-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.catalog-book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.catalog-book-card.list-mode {
    flex-direction: row;
    height: auto;
    padding: 16px;
    gap: 24px;
}

.book-availability {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #4caf50;
    color: white;
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 600;
    z-index: 2;
}

.book-availability.unavailable {
    background-color: #f44336;
}

.book-cover {
    height: 260px;
    background-size: cover;
    background-position: center;
    position: relative;
}

.list-mode .book-cover {
    flex: 0 0 120px;
    height: 180px;
    border-radius: 4px;
}

.book-info {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.list-mode .book-info {
    padding: 0;
    gap: 12px;
}

.book-title {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: #333;
}

.list-mode .book-title {
    font-size: 1.3rem;
    margin-bottom: 4px;
}

.book-author {
    color: #666;
    font-size: 0.85rem;
    margin: 0 0 auto 0;
}

.list-mode .book-author {
    font-size: 1rem;
    margin-bottom: 12px;
}

.book-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: #606266;
}

.book-description {
    margin-bottom: 16px;
}

.book-description p {
    color: #606266;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.rating {
    display: flex;
    align-items: center;
    margin-top: auto;
    margin-bottom: 12px;
}

.rating-text {
    margin-left: 6px;
    font-size: 0.9rem;
    color: #ff9900;
}

.book-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
}

.reserve-button {
    width: 100%;
    font-weight: 600;
}

.list-mode .book-actions {
    margin-top: 0;
}

.list-mode .reserve-button {
    width: auto;
}

@media (max-width: 768px) {
    .list-mode {
        flex-direction: column;
        gap: 0;
    }

    .list-mode .book-cover {
        width: 100%;
        flex: none;
        height: 200px;
        margin-bottom: 16px;
    }

    .list-mode .book-info {
        padding: 0 16px 16px;
    }
}
</style>
