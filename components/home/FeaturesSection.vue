<template>
    <div class="features-section">
        <div class="feature-card">
            <el-icon size="36"><Calendar /></el-icon>
            <h3>Réservez en ligne</h3>
            <p>
                Empruntez des livres ou réservez une salle d'étude en quelques
                clics
            </p>
        </div>
        <div class="feature-card">
            <el-icon size="36"><Reading /></el-icon>
            <h3>Plus de 10 000 livres</h3>
            <p>
                Accédez à notre vaste collection d'ouvrages dans tous les
                domaines
            </p>
        </div>
        <div class="feature-card">
            <el-icon size="36"><ChatLineRound /></el-icon>
            <h3>Assistance 24/7</h3>
            <p>
                Notre équipe est à votre disposition pour vous aider dans vos
                recherches
            </p>
        </div>
    </div>
</template>

<script setup>
import { Calendar, Reading, ChatLineRound } from '@element-plus/icons-vue';
</script>

<style scoped>
.features-section {
    display: flex;
    justify-content: space-between;
    padding: 0 30px 40px;
    max-width: 70vw;
    margin: 0 auto;
    gap: 20px;
}

.feature-card {
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
    margin: 16px 0 8px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e88e5;
}

.feature-card p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
}

.feature-card .el-icon {
    color: #1e88e5;
}

@media (max-width: 1024px) {
    .features-section {
        flex-direction: column;
        max-width: 600px;
    }
}
</style>
