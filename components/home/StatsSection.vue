<template>
    <section class="stats-section">
        <h2>Notre bibliothèque en chiffres</h2>
        <div class="stats-container">
            <div class="stat-item">
                <div class="stat-number">10,000+</div>
                <div class="stat-label">Livres</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">5,000+</div>
                <div class="stat-label">Membres</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">15</div>
                <div class="stat-label">Salles d'étude</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Accessible</div>
            </div>
        </div>
    </section>
</template>

<script setup>
// Pas de logique particulière nécessaire
</script>

<style scoped>
.stats-section {
    margin: 60px 0;
    text-align: center;
    padding: 40px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats-section h2 {
    font-size: 1.75rem;
    margin-bottom: 30px;
    font-weight: 700;
    color: #333;
}

.stats-container {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px;
}

.stat-item {
    padding: 20px;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e88e5;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 1rem;
    color: #666;
}

@media (max-width: 768px) {
    .stats-container {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
