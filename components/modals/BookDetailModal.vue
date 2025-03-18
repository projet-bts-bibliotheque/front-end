<template>
    <el-dialog
        :modelValue="show"
        @update:modelValue="$emit('update:show', $event)"
        :title="book ? book.title : ''"
        width="50%"
    >
        <div class="book-details" v-if="book">
            <div class="book-details-content">
                <div
                    class="book-details-cover"
                    :style="{
                        backgroundImage: `url(${book.coverUrl})`
                    }"
                ></div>
                <div class="book-details-info">
                    <h2>{{ book.title }}</h2>
                    <p class="book-author">Par {{ book.author }}</p>
                    <div class="book-rating">
                        <el-rate v-model="localRating" disabled />
                        <span class="rating-text">{{ book.rating }} sur 5</span>
                    </div>
                    <div class="book-status">
                        <span class="status-label">Statut:</span>
                        <span
                            class="status-value"
                            :class="{ available: book.available }"
                        >
                            {{ book.available ? 'Disponible' : 'Indisponible' }}
                        </span>
                    </div>
                    <p class="book-description">
                        {{
                            book.description ||
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
                        }}
                    </p>
                    <div class="book-meta">
                        <div class="meta-item">
                            <span class="meta-label">Catégorie:</span>
                            <span class="meta-value">{{
                                book.category || 'Fiction'
                            }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Pages:</span>
                            <span class="meta-value">{{
                                book.pages || '256'
                            }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Année:</span>
                            <span class="meta-value">{{
                                book.year || '2020'
                            }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">ISBN:</span>
                            <span class="meta-value">{{
                                book.isbn || '978-3-16-148410-0'
                            }}</span>
                        </div>
                    </div>
                    <div class="book-actions">
                        <el-button type="primary" :disabled="!book.available"
                            >Réserver</el-button
                        >
                        <el-button>Ajouter aux favoris</el-button>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    book: {
        type: Object,
        default: null
    }
});

defineEmits(['update:show']);

const localRating = ref(props.book ? props.book.rating : 0);

watch(
    () => props.book,
    (newBook) => {
        if (newBook) {
            localRating.value = newBook.rating;
        }
    }
);
</script>

<style scoped>
.book-details {
    padding: 10px;
}

.book-details-content {
    display: flex;
    gap: 30px;
}

.book-details-cover {
    width: 200px;
    height: 300px;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
}

.book-details-info {
    flex: 1;
}

.book-details-info h2 {
    font-size: 1.5rem;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.book-author {
    color: #666;
    margin-bottom: 12px;
    font-size: 1rem;
}

.book-rating {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.rating-text {
    margin-left: 10px;
    color: #666;
}

.book-status {
    margin-bottom: 16px;
    font-size: 0.95rem;
}

.status-label {
    font-weight: 600;
    margin-right: 5px;
}

.status-value {
    color: #f44336;
}

.status-value.available {
    color: #4caf50;
}

.book-description {
    line-height: 1.6;
    margin-bottom: 24px;
    color: #333;
}

.book-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}

.meta-item {
    font-size: 0.9rem;
}

.meta-label {
    font-weight: 600;
    margin-right: 5px;
    color: #666;
}

.book-actions {
    display: flex;
    gap: 12px;
}

@media (max-width: 1024px) {
    .book-details-content {
        flex-direction: column;
        align-items: center;
    }

    .book-details-info {
        text-align: center;
    }

    .book-meta {
        grid-template-columns: 1fr;
    }
}
</style>
