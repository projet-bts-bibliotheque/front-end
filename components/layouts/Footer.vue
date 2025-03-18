<template>
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>BibliothèqueNuxt</h3>
                <p>
                    Votre bibliothèque moderne et accessible 24/7 pour tous vos
                    besoins littéraires et académiques.
                </p>
            </div>
            <div class="footer-section">
                <h3>Liens rapides</h3>
                <ul class="footer-links">
                    <li><a href="#">Accueil</a></li>
                    <li><a href="#">Catalogue</a></li>
                    <li><a href="#">Salles</a></li>
                    <li><a href="#">Événements</a></li>
                    <li><a href="#">À propos</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <address>
                    123 Rue de la Connaissance<br />
                    75000 Paris<br />
                    Tél: 01 23 45 67 89<br />
                    Email: contact@bibliothequeesna.fr
                </address>
            </div>
            <div class="footer-section">
                <h3>Horaires</h3>
                <ul class="hours-list">
                    <li>Lundi - Vendredi: 9h - 22h</li>
                    <li>Samedi: 10h - 20h</li>
                    <li>Dimanche: 10h - 18h</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 BibliothèqueNuxt. Tous droits réservés.</p>
        </div>
    </footer>
</template>

<style scoped>
.site-footer {
    background-color: #263238;
    color: #fff;
    padding: 60px 30px 20px;
    margin-top: auto;
}

.footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    gap: 40px;
}

.footer-section {
    flex: 1;
    min-width: 200px;
}

.footer-section h3 {
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 20px;
    position: relative;
    padding-bottom: 12px;
}

.footer-section h3:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background-color: #1e88e5;
}

.footer-section p {
    color: #b0bec5;
    line-height: 1.6;
    margin-bottom: 20px;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-links li {
    margin-bottom: 10px;
}

.footer-links a {
    color: #b0bec5;
    text-decoration: none;
    transition: color 0.3s;
}

.footer-links a:hover {
    color: #1e88e5;
}

address {
    font-style: normal;
    color: #b0bec5;
    line-height: 1.6;
}

.hours-list {
    list-style: none;
    padding: 0;
    margin: 0;
    color: #b0bec5;
}

.hours-list li {
    margin-bottom: 8px;
}

.footer-bottom {
    text-align: center;
    padding-top: 30px;
    margin-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #b0bec5;
}

@media (max-width: 1024px) {
    .footer-content {
        flex-direction: column;
        gap: 30px;
    }
}
</style>
