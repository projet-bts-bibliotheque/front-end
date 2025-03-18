<template>
    <div class="hero-section">
        <div class="overlay"></div>
        <div class="hero-content">
            <h1 class="main-title">BIBLIOTHÈQUE DE L'ESNA</h1>
            <p class="hero-subtitle">
                Découvrez notre collection de plus de 10 000 ouvrages
            </p>
            <div class="cta-buttons">
                <el-button type="primary" size="large"
                    >Explorer le catalogue</el-button
                >
                <el-button size="large">Réserver une salle</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hero-section {
    height: 70vh;
    position: relative;
    background-image: url('../../public/photo.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 40px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7));
    z-index: 1;
}

.hero-content {
    text-align: center;
    z-index: 2;
    max-width: 800px;
    padding: 0 20px;
}

.main-title {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-weight: 300;
}

.cta-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
}
</style>
