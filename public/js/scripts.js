const blogPosts = [
    {
        id: 1,
        title: "Latest iPhone 15 Pro - Revolutionary Camera",
        image: "https://imgs.search.brave.com/IqBfT2RYlBl8sW8_OFG0Jh-a_cGI0CT1YMgYgEBBFOU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMubWFjcnVtb3Jz/LmNvbS9hcnRpY2xl/LW5ldy8yMDIyLzA1/L2lwaG9uZS0xNS1z/aXplcy5qcGc",
        date: "January 15, 2024",
        description: "The iPhone 15 Pro is a game-changer, featuring an industry-leading triple-lens camera with cutting-edge periscope zoom technology. Capture professional-quality photos with ultra-high resolution and stunning night mode enhancements.",
        category: "Technology",
        author: "John Doe",
        readingTime: "5 min"
    },
    {
        id: 2,
        title: "Professional Gaming Setup Collection",
        image: "https://imgs.search.brave.com/-jEzrCajphhuRUWCpoMgA-LUYlX4qTUJKK_9Kb4_nME/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c3R1ZGVudGJlYW5z/LmNvbS9ibG9nL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDI0LzEx/L2Jlbi1pd2FyYS1w/czUtc2V0dXAtZTE3/MzE5MjY3NTczMDEu/anBn",
        date: "January 14, 2024",
        description: "Elevate your gaming experience with a top-tier professional setup! Featuring an ultra-responsive mechanical keyboard, a high-DPI gaming mouse, and a 240Hz curved monitor, this collection is built for speed and precision.",
        category: "Gaming",
        author: "Jane Smith",
        readingTime: "7 min"
    },
    {
        id: 3,
        title: "Premium Fitness Equipment Set",
        image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format",
        date: "January 12, 2024",
        description: "Take your fitness journey to the next level with this premium workout set. Featuring adjustable dumbbells, resistance bands, and a smart treadmill.",
        category: "Health & Fitness",
        author: "Mike Johnson",
        readingTime: "6 min"
    },
    {
        id: 4,
        title: "Smart 4K OLED TV - Cinema Experience",
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format",
        date: "January 10, 2024",
        description: "Immerse yourself in a next-gen cinematic experience with the latest Smart 4K OLED TV. Featuring ultra-rich contrast, stunning colors, and Dolby Atmos surround sound.",
        category: "Entertainment",
        author: "Emily Davis",
        readingTime: "4 min"
    },
    {
        id: 5,
        title: "Professional DSLR Camera Kit",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format",
        date: "January 8, 2024",
        description: "Unleash your inner photographer with this high-performance DSLR camera kit. Equipped with a powerful sensor, multiple lenses, and advanced stabilization technology.",
        category: "Photography",
        author: "Daniel Lee",
        readingTime: "6 min"
    },
    {
        id: 6,
        title: "Limited Edition Sports Sneakers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format",
        date: "January 5, 2024",
        description: "Step up your game with these limited-edition sports sneakers. Designed for both style and performance, featuring ultra-lightweight materials and shock-absorbing soles.",
        category: "Fashion",
        author: "Sarah Wilson",
        readingTime: "5 min"
    },
    {
        id: 7,
        title: "Smart Home Security System",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format",
        date: "January 3, 2024",
        description: "Keep your home safe with this state-of-the-art security system. Featuring AI-powered motion detection, 24/7 monitoring, and mobile app control.",
        category: "Home Security",
        author: "Alex Carter",
        readingTime: "5 min"
    },
    {
        id: 8,
        title: "Premium Wireless Headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format",
        date: "January 1, 2024",
        description: "Experience superior sound quality with these premium wireless headphones. Featuring active noise cancellation and long battery life.",
        category: "Gadgets",
        author: "David Brown",
        readingTime: "4 min"
    },
    {
        id: 9,
        title: "Professional Tennis Equipment Set",
        image: "https://imgs.search.brave.com/3GVMWcgUizSnup7m_onGyEa8HldwTACN1FZs_hpOsjE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzU0LzNj/L2VlLzU0M2NlZTJi/MTYyOTZkZWY3ZjYz/ZTE2NGI2NjgyMjlm/LmpwZw",
        date: "December 30, 2023",
        description: "Enhance your tennis game with this professional-grade equipment set, including a high-performance racket and ergonomic grip.",
        category: "Sports",
        author: "James Wilson",
        readingTime: "6 min"
    },
    {
        id: 10,
        title: "Electric Skateboard - Next Gen",
        image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&auto=format",
        date: "December 28, 2023",
        description: "Zoom through the streets with this high-speed electric skateboard featuring powerful motors, regenerative braking, and a sleek design.",
        category: "Mobility",
        author: "Sophia Miller",
        readingTime: "5 min"
    },
    {
        id: 11,
        title: "Smart Watch Series X",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format",
        date: "December 26, 2023",
        description: "Track your health and stay connected with the Smart Watch Series X, featuring heart rate monitoring, fitness tracking, and seamless notifications.",
        category: "Wearables",
        author: "Chris Evans",
        readingTime: "5 min"
    },
    {
        id: 12,
        title: "Pro Gaming Mechanical Keyboard",
        image: "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800&auto=format",
        date: "December 24, 2023",
        description: "Dominate the gaming world with this pro mechanical keyboard, featuring customizable RGB lighting, ultra-responsive switches, and ergonomic design.",
        category: "Gaming",
        author: "Emma Wilson",
        readingTime: "6 min"
    }
];


// Function to create blog post HTML
function createBlogPostHTML(post) {
    return `
      <article class="blog-post">
          <a href="blog/${post.id}" class="product-link">
              <div class="blog-image">
                  <img src="${post.image}" alt="${post.title}">
                  <div class="product-overlay">
                      <button class="shop-now-btn">Shop Now</button>
                  </div>
              </div>
              <div class="blog-content">
                  <h3>${post.title}</h3>
                  <p class="date">New Arrival - ${post.date}</p>
              </div>
          </a>
      </article>
  `;
}

// Function to render blog posts
function renderBlogPosts() {
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
        blogGrid.innerHTML = blogPosts.map(post => createBlogPostHTML(post)).join('');
    }
}

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
