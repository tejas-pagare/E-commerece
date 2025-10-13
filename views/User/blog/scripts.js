
// Handle view options
function handleViewOptions() {
    const viewButtons = document.querySelectorAll('.view-options button');
    const blogGrid = document.querySelector('.blog-grid');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            // Update grid layout based on view option
            if (button.querySelector('.fa-th-large')) {
                blogGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else if (button.querySelector('.fa-th')) {
                blogGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            } else if (button.querySelector('.fa-list')) {
                blogGrid.style.gridTemplateColumns = '1fr';
            }
        });
    });
}

// Handle filter tabs
function handleFilterTabs() {
    const filterButtons = document.querySelectorAll('.filter-tabs button');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Add filter logic here
        });
    });
}

// Handle newsletter form
function handleNewsletterForm() {
    const form = document.querySelector('.newsletter-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        // Add newsletter subscription logic here
        alert('Thank you for subscribing!');
        form.reset();
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderBlogPosts();
    handleViewOptions();
    handleFilterTabs();
    handleNewsletterForm();

    // Add additional CSS styles for blog posts
    const style = document.createElement('style');
    style.textContent = `
      .blog-post {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }

      .blog-post:hover {
          transform: translateY(-5px);
      }

      .product-link {
          display: block;
          position: relative;
      }

      .blog-image {
          position: relative;
          padding-top: 100%;
          overflow: hidden;
      }

      .blog-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
      }

      .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(20, 23, 24, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
      }

      .blog-post:hover .product-overlay {
          opacity: 1;
      }

      .blog-post:hover .blog-image img {
          transform: scale(1.05);
      }

      .shop-now-btn {
          background:#22c55e;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
      }

      .shop-now-btn:hover {
          background:#22c55e;
      }

      .blog-content {
          padding: 20px;
      }

      .blog-content h3 {
          margin-bottom: 10px;
          font-size: 18px;
          line-height: 1.4;
          color: #141718;
      }

      .blog-content .date {
          color: #605F5F;
          font-size: 14px;
      }

      @media (max-width: 768px) {
          .blog-content h3 {
              font-size: 16px;
          }
      }
  `;
    document.head.appendChild(style);
});


// Handle contact form submission
function handleContactForm() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                message: form.querySelector('#message').value
            };

            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // Here you would typically send this to your backend
                // Simulating API call with timeout
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Show success message
                showNotification('Thank you for your message! We\'ll get back to you soon.');

                // Reset form
                form.reset();
            } catch (error) {
                // Show error message
                showNotification('Sorry, something went wrong. Please try again later.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Show notification function
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#38CB89' : '#FF6B6B'};
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

// Handle form input validation
function handleFormValidation() {
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');

    inputs.forEach(input => {
        // Add validation styles on blur
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.style.borderColor = '#FF6B6B';
            } else {
                input.style.borderColor = '#38CB89';
            }
        });

        // Reset validation styles on focus
        input.addEventListener('focus', () => {
            input.style.borderColor = '#E8ECEF';
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    handleContactForm();
    handleFormValidation();
});




const slider = document.getElementById('slider');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

let currentSlide = 0;

function updateSlide(position) {
    slider.style.transform = `translateX(-${position * 100}%)`;
}

next.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % 3;
    updateSlide(currentSlide);
});

prev.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + 3) % 3;
    updateSlide(currentSlide);
});

setInterval(() => {
    currentSlide = (currentSlide + 1) % 3;
    updateSlide(currentSlide);
}, 5000);
