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
                <BookCard
                    v-for="(book, bookIndex) in books"
                    :key="bookIndex"
                    :book="book"
                    @showDetails="$emit('showBookDetails', book)"
                    @reserve="$emit('reserveBook', book)"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import BookCard from './BookCard.vue';

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
    // Ces props seraient normalement calculés dans le parent
    // mais on les inclut ici pour le composant autonome
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

const emit = defineEmits([
    'slideLeft',
    'slideRight',
    'showBookDetails',
    'reserveBook'
]);

const maxSlidePosition = computed(() => {
    const totalWidth = props.books.length * (props.itemWidth + props.gapWidth);
    const visibleWidth =
        props.visibleItems * (props.itemWidth + props.gapWidth);
    return Math.max(0, totalWidth - visibleWidth);
});

const isMaxPosition = computed(() => {
    return props.sliderPosition >= maxSlidePosition.value;
});
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

@media (max-width: 1024px) {
    .slider-arrow.prev {
        left: 10px;
    }

    .slider-arrow.next {
        right: 10px;
    }
}
</style>
