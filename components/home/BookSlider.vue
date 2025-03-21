<template>
    <div class="netflix-slider">
        <div class="slider-controls">
            <button
                class="slider-arrow prev"
                @click="$emit('slideLeft')"
                :disabled="sliderPosition <= 0"
            >
                <el-icon><ArrowLeft /></el-icon>
            </button>
            <button
                class="slider-arrow next"
                @click="$emit('slideRight')"
                :disabled="isMaxPosition"
            >
                <el-icon><ArrowRight /></el-icon>
            </button>
        </div>
        <div class="slider-container">
            <div
                class="slider-content"
                :style="{
                    transform: `translateX(-${sliderPosition}px)`
                }"
            >
                <NuxtLink
                    v-for="(book, bookIndex) in books"
                    :key="bookIndex"
                    :to="`/book/${book.id}`"
                    class="book-card"
                >
                    <div class="book-availability" v-if="book.available">
                        Disponible
                    </div>
                    <div class="book-availability unavailable" v-else>
                        Indisponible
                    </div>
                    <div
                        class="book-cover"
                        :style="{
                            backgroundImage: `url(${book.coverUrl})`
                        }"
                    ></div>
                    <div class="book-info">
                        <h3>{{ book.title }}</h3>
                        <p class="author">{{ book.author }}</p>
                        <div class="rating">
                            <el-rate
                                v-model="book.rating"
                                disabled
                                show-score
                                text-color="#ff9900"
                            />
                        </div>
                        <el-button
                            class="reserve-button"
                            size="small"
                            type="primary"
                            :disabled="!book.available"
                            @click.stop="$emit('reserveBook', book)"
                        >
                            {{ book.available ? 'Réserver' : 'Indisponible' }}
                        </el-button>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

// Définition des props pour le composant
const props = defineProps({
    books: {
        type: Array,
        required: true
    },
    categoryIndex: {
        type: Number,
        required: true
    },
    sliderPosition: {
        type: Number,
        required: true
    },
    itemWidth: {
        type: Number,
        default: 200
    },
    gapWidth: {
        type: Number,
        default: 16
    },
    visibleItems: {
        type: Number,
        default: 4
    }
});

// Définition des événements émis par le composant
const emit = defineEmits([
    'slideLeft',
    'slideRight',
    'showBookDetails',
    'reserveBook',
    'maxPositionChange'
]);

/**
 * Calcule la position maximale du slider en fonction du nombre de livres
 * et des dimensions des éléments
 * @returns {Number} La position maximale en pixels
 */
const maxSlidePosition = computed(() => {
    // Total width: largeur totale de tous les éléments + espaces
    const totalWidth = props.books.length * (props.itemWidth + props.gapWidth);

    // Visible width: largeur visible dans la fenêtre
    const visibleWidth =
        props.visibleItems * (props.itemWidth + props.gapWidth);

    // Simplification: différence entre la largeur totale et la largeur visible,
    // avec un minimum de 0 pour éviter les valeurs négatives
    return Math.max(0, totalWidth - visibleWidth);
});
/**
 * Détermine si le slider est à sa position maximale
 * @returns {Boolean} Vrai si le slider ne peut plus avancer
 */
const isMaxPosition = computed(() => {
    return props.sliderPosition >= maxSlidePosition.value;
});

/**
 * Fonction unique pour émettre la position maximale
 */
const emitMaxPosition = () => {
    emit('maxPositionChange', {
        categoryIndex: props.categoryIndex,
        maxPosition: maxSlidePosition.value
    });
};

/**
 * Émet la position maximale initiale lors du montage du composant
 */
onMounted(() => emitMaxPosition());

/**
 * Observe les changements qui affectent la position maximale
 */
watch(
    [
        maxSlidePosition,
        () => props.books.length,
        () => props.itemWidth,
        () => props.visibleItems
    ],
    () => emitMaxPosition()
);
</script>

<style scoped>
.netflix-slider {
    position: relative;
    margin-bottom: 40px;
}

.slider-container {
    width: 100%;
    overflow: hidden;
    padding: 10px 0;
}

.slider-content {
    display: flex;
    transition: transform 0.5s ease;
}

.slider-controls {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: #1e88e5;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.netflix-slider:hover .slider-arrow {
    opacity: 1;
}

.slider-arrow.prev {
    left: -22px;
}

.slider-arrow.next {
    right: -22px;
}

.slider-arrow:hover {
    background-color: #1976d2;
    transform: translateY(-50%) scale(1.05);
}

.slider-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background-color: #ccc;
}

/* Styles du BookCard intégrés directement */
.book-card {
    flex: 0 0 auto;
    width: 200px;
    margin-right: 16px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    cursor: pointer;
    text-decoration: none; /* Ajouté pour le NuxtLink */
}

@media (hover: hover) {
    .book-card:hover {
        transform: translateY(-8px) scale(1.03);
        z-index: 1;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
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

.book-info {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    color: #333;
}

.book-info h3 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}

.author {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 0.85rem;
}

.rating {
    margin-top: auto;
    margin-bottom: 12px;
}

.reserve-button {
    width: 100%;
    margin-top: 8px;
    font-weight: 600;
}

@media (max-width: 1024px) {
    .slider-arrow.prev {
        left: 10px;
    }

    .slider-arrow.next {
        right: 10px;
    }

    .book-card {
        width: 180px;
    }

    .book-cover {
        height: 240px;
    }
}

@media (max-width: 768px) {
    .book-card {
        width: 150px;
        margin-right: 12px;
    }

    .book-cover {
        height: 180px;
    }
}
</style>
