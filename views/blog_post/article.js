// Related Articles Data
const relatedArticles = [
    {
        id: 1,
        title: 'Modern Minimalist Living Room Design Ideas',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        date: 'October 16, 2023'
    },
    {
        id: 2,
        title: 'Small Space Solutions: Making the Most of Your Home',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92',
        date: 'October 15, 2023'
    },
    {
        id: 3,
        title: 'Creating a Perfect Home Office Setup',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
        date: 'October 14, 2023'
    }
];

// Function to create HTML for related articles
function createRelatedArticleHTML(article) {
    return `
        <div class="article-card">
            <img src="${article.image}?w=600" alt="${article.title}">
            <h3>${article.title}</h3>
            <p class="date">${article.date}</p>
        </div>
    `;
}

// Function to render related articles
function renderRelatedArticles() {
    const articlesGrid = document.querySelector('.articles-grid');
    if (articlesGrid) {
        articlesGrid.innerHTML = relatedArticles.map(article => createRelatedArticleHTML(article)).join('');
    }
}

// Handle newsletter form submission
function handleNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            // Here you would typically send this to your backend
            console.log('Newsletter signup:', email);
            
            // Show success message
            showNotification('Thank you for subscribing to our newsletter!');
            
            // Reset form
            form.reset();
        });
    }
}

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #141718;
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Handle reading progress
function handleReadingProgress() {
    const article = document.querySelector('.article-content');
    const progressBar = document.createElement('div');
    
    // Create and style progress bar
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: #141718;
        z-index: 1000;
        transition: width 0.2s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    // Update progress bar width on scroll
    window.addEventListener('scroll', () => {
        if (article) {
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrolled = window.scrollY;
            const articleTop = article.offsetTop;
            
            const progress = (scrolled - articleTop) / (articleHeight - windowHeight) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    });
}

// Handle image zoom
function handleImageZoom() {
    const images = document.querySelectorAll('.article-content img');
    
    images.forEach(img => {
        img.addEventListener('click', () => {
            // Create zoom container
            const zoomContainer = document.createElement('div');
            zoomContainer.className = 'image-zoom';
            zoomContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(20, 23, 24, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Create zoomed image
            const zoomedImg = document.createElement('img');
            zoomedImg.src = img.src.replace('w=600', 'w=1200');
            zoomedImg.style.cssText = `
                max-width: 90%;
                max-height: 90vh;
                border-radius: 8px;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            `;
            
            zoomContainer.appendChild(zoomedImg);
            document.body.appendChild(zoomContainer);
            
            // Trigger animation
            setTimeout(() => {
                zoomContainer.style.opacity = '1';
                zoomedImg.style.transform = 'scale(1)';
            }, 100);
            
            // Close on click
            zoomContainer.addEventListener('click', () => {
                zoomContainer.style.opacity = '0';
                zoomedImg.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    document.body.removeChild(zoomContainer);
                }, 300);
            });
        });
        
        // Add cursor pointer to indicate clickable
        img.style.cursor = 'zoom-in';
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderRelatedArticles();
    handleNewsletterForm();
    handleReadingProgress();
    handleImageZoom();
}); 