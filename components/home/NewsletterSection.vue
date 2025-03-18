<template>
    <section class="newsletter-section">
        <div class="newsletter-content">
            <h2>Restez informé</h2>
            <p>
                Inscrivez-vous à notre newsletter pour être informé des
                nouvelles acquisitions et des événements à venir
            </p>
            <div class="newsletter-form">
                <el-input
                    :modelValue="newsletterEmail"
                    @update:modelValue="$emit('update:newsletterEmail', $event)"
                    placeholder="Votre adresse email"
                />
                <el-button type="primary">S'inscrire</el-button>
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    newsletterEmail: {
        type: String,
        required: true
    }
});

defineEmits(['update:newsletterEmail']);
</script>

<style scoped>
.newsletter-section {
    margin: 60px 0;
    padding: 60px 20px;
    background-color: #1e88e5;
    border-radius: 8px;
    color: white;
}

.newsletter-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.newsletter-section h2 {
    font-size: 1.75rem;
    margin-bottom: 16px;
    font-weight: 700;
}

.newsletter-section p {
    margin-bottom: 24px;
    font-size: 1rem;
    line-height: 1.6;
}

.newsletter-form {
    display: flex;
    gap: 10px;
}

.newsletter-form .el-input {
    flex: 1;
}

@media (max-width: 768px) {
    .newsletter-form {
        flex-direction: column;
    }
}
</style>
