<template>
    <div class="book-card" @click="$emit('showDetails', book)">
        <div class="book-availability" v-if="book.available">Disponible</div>
        <div class="book-availability unavailable" v-else>Indisponible</div>
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
                @click.stop="$emit('reserve', book)"
            >
                {{ book.available ? 'Réserver' : 'Indisponible' }}
            </el-button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    book: {
        type: Object,
        required: true
    }
});

defineEmits(['showDetails', 'reserve']);
</script>

<style scoped>
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
}

.book-card:hover {
    transform: translateY(-8px) scale(1.03);
    z-index: 1;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
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
