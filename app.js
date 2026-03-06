/**
 * Clinic Website Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init Check

    // 2. Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navList.classList.contains('active')) {
            icon.classList.replace('ph-list', 'ph-x');
        } else {
            icon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('ph-x', 'ph-list');
        });
    });

    // 3. Simple Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    // Apply animation to elements
    const elementsToAnimate = document.querySelectorAll('.section-title, .service-card, .about-content, .contact-info, .contact-form-wrapper, .map-container');

    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in-up');
        animateOnScroll.observe(el);
    });

    // 4. Load Blog Posts Dynamically
    const blogContainer = document.getElementById('blog-posts-container');

    if (blogContainer) {
        if (typeof blogPosts !== 'undefined') {
            blogPosts.forEach((post, index) => {
                const article = document.createElement('article');
                article.className = 'blog-card fade-in-up';
                // Staggering animation delay slightly
                article.style.transitionDelay = `${index * 0.1}s`;

                article.innerHTML = `
                    <div class="blog-card-image">
                        <a href="article.html?id=${post.id}" style="display: block; height: 100%; text-decoration: none;">
                            <div class="img-placeholder" style="background-color: ${post.color}; color: ${post.iconColor};">
                                <i class="ph ${post.icon}"></i>
                            </div>
                        </a>
                    </div>
                    <div class="blog-card-content">
                        <span class="blog-category">${post.category}</span>
                        <h3 class="blog-title"><a href="article.html?id=${post.id}">${post.title}</a></h3>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <div class="blog-meta">
                            <span><i class="ph ph-calendar-blank"></i> ${post.date}</span>
                            <span><i class="ph ph-clock"></i> ${post.readTime}</span>
                        </div>
                        <a href="article.html?id=${post.id}" class="read-more" style="display: inline-flex; align-items: center; gap: 0.25rem; margin-top: 1rem; color: var(--clr-orange-500); font-weight: 500; font-size: 0.95rem; text-decoration: none;">Devamını Oku <i class="ph ph-arrow-right"></i></a>
                    </div>
                `;

                blogContainer.appendChild(article);
                // Observe newly created element for scroll animation
                animateOnScroll.observe(article);
            });
        } else {
            console.error("Blog verileri yüklenemedi. blog-data.js dosyası eksik.");
            blogContainer.innerHTML = '<p class="text-center w-100">Şu anda blog yazıları yüklenemiyor. Veri dosyası bulunamadı.</p>';
        }
    }

    // 5. Load Individual Article Dynamically
    const articleHeaderContainer = document.getElementById('article-header-content');
    const articleBodyContainer = document.getElementById('article-main-content');

    if (articleHeaderContainer && articleBodyContainer) {
        // Get the ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (!articleId) {
            articleHeaderContainer.innerHTML = '<h1>Makale Bulunamadı</h1>';
            articleBodyContainer.innerHTML = '<p>Lütfen geçerli bir makale bağlantısı üzerinden geldiğinize emin olun.</p>';
        } else {
            if (typeof blogPosts !== 'undefined') {
                const post = blogPosts.find(p => p.id == articleId);

                if (post) {
                    // Populate Header
                    articleHeaderContainer.innerHTML = `
                        <span class="badge" style="background-color: ${post.color}; color: ${post.iconColor}; border: none; font-weight: 600;">${post.category}</span>
                        <h1 class="article-title">${post.title}</h1>
                        <div class="article-meta">
                            <span><i class="ph ph-calendar-blank"></i> ${post.date}</span>
                            <span><i class="ph ph-clock"></i> ${post.readTime}</span>
                        </div>
                    `;

                    // Populate Body
                    articleBodyContainer.innerHTML = `
                        <div class="article-text fade-in-up">
                            <p class="lead">${post.excerpt}</p>
                            <hr>
                            <div>${post.content.replace(/\n/g, '<br>')}</div>
                        </div>
                    `;

                    // Trigger the animation for the newly added content
                    const animatedContent = articleBodyContainer.querySelector('.article-text');
                    if (animatedContent) {
                        animateOnScroll.observe(animatedContent);
                    }

                    // Change Page Title
                    document.title = `${post.title} | Uzm. Psikolog`;
                } else {
                    articleHeaderContainer.innerHTML = '<h1>Makale Bulunamadı</h1>';
                    articleBodyContainer.innerHTML = '<p>Aradığınız makale veritabanında mevcut değil.</p>';
                }
            } else {
                console.error("Makale yüklenemedi: JS veri dosyası eksik.");
                articleHeaderContainer.innerHTML = '<h1>Bir Hata Oluştu</h1>';
                articleBodyContainer.innerHTML = '<p>Veriler yüklenemedi. blog-data.js dosyasını kontrol edin.</p>';
            }
        }
    }

    // 6. Handle Contact Form Submission via FormSubmit (AJAX)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Varsayılan sayfa yenilemesini engelle

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Yükleniyor durumu
            submitBtn.textContent = 'Gönderiliyor...';
            submitBtn.disabled = true;

            const formData = new FormData(this);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success === "true" || data.success) {
                        alert('Mesajınız başarıyla iletildi! En kısa sürede size dönüş yapacağız.');
                        contactForm.reset();
                    } else {
                        alert('Mesaj gönderilirken bir hata oluştu. Lütfen doğrudan e-posta adresimizden bize ulaşın.');
                    }
                })
                .catch(error => {
                    console.error('Form gönderim hatası:', error);
                    alert('Bağlantı hatası oluştu. Lütfen internetinizi kontrol edip tekrar deneyin.');
                })
                .finally(() => {
                    // Butonu eski haline getir
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});
