// Blog Posts Data (Sustainable Fashion)
const blogPosts = [
    {
        id: 1,
        title: "The Ultimate Guide to Thrifting Like a Pro",
        image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop",
        date: "October 12, 2025",
        description: "Discover the secrets to finding hidden gems in second-hand stores. This guide covers everything from identifying quality fabrics to negotiating prices and caring for your vintage finds.",
        category: "Thrifting",
        author: "Jane Doe",
        readingTime: "6 min"
    },
    {
        id: 2,
        title: "Upcycling Your Wardrobe: 5 Easy DIY Projects",
        image: "https://images.unsplash.com/photo-1617606002779-51d866bdd1d1?w=800&auto=format&fit=crop",
        date: "October 10, 2025",
        description: "Breathe new life into old clothes with these simple and stylish DIY upcycling projects. Turn old denim into a chic new jacket or a simple t-shirt into a trendy tote bag.",
        category: "DIY Fashion",
        author: "Emily White",
        readingTime: "7 min"
    },
    {
        id: 3,
        title: "Why Organic Cotton is a Game-Changer for a Greener Closet",
        image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop",
        date: "October 8, 2025",
        description: "Learn about the environmental benefits of choosing organic cotton over conventional cotton. We explore the impact on water, soil health, and the farmers who grow it.",
        category: "Sustainable Materials",
        author: "Michael Green",
        readingTime: "5 min"
    },
    {
        id: 4,
        title: "Building a Capsule Wardrobe: Less is More",
        image: "https://images.unsplash.com/photo-1579566346927-c68383817a25?w=800&auto=format&fit=crop",
        date: "October 5, 2025",
        description: "Simplify your life and reduce fashion waste by creating a capsule wardrobe. We provide a step-by-step guide to curating a collection of essential, versatile pieces you'll love for years.",
        category: "Minimalism",
        author: "Sarah Johnson",
        readingTime: "8 min"
    },
    {
        id: 5,
        title: "The Rise of Rental Fashion: A Sustainable Alternative",
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop",
        date: "October 2, 2025",
        description: "From weddings to work events, renting outfits is becoming a popular way to stay stylish without the environmental cost. Explore the benefits of the rental fashion economy.",
        category: "Circular Fashion",
        author: "David Lee",
        readingTime: "6 min"
    },
    {
        id: 6,
        title: "How to Care for Your Clothes to Make Them Last Longer",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop",
        date: "September 29, 2025",
        description: "Proper washing, drying, and storage can dramatically extend the life of your garments. Learn simple tips and tricks to reduce wear and tear and keep your clothes looking great.",
        category: "Clothing Care",
        author: "Jessica Chen",
        readingTime: "5 min"
    },
    {
        id: 7,
        title: "Ethical Fashion: Understanding Fair Trade and a Transparent Supply Chain",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop",
        date: "September 25, 2025",
        description: "What does 'ethical fashion' truly mean? We break down the importance of fair wages, safe working conditions, and supply chain transparency in the clothing industry.",
        category: "Ethical Production",
        author: "Alex Carter",
        readingTime: "7 min"
    },
    {
        id: 8,
        title: "Natural Dyes: A Colorful and Eco-Friendly Alternative",
        image: "https://images.unsplash.com/photo-1523966211588-8fcc1c12f35d?w=800&auto=format&fit=crop",
        date: "September 22, 2025",
        description: "Explore the beautiful world of natural dyes made from plants, minerals, and even food scraps. Learn how these non-toxic colorants are better for the planet and your skin.",
        category: "Sustainable Materials",
        author: "Sophia Miller",
        readingTime: "6 min"
    },
    {
        id: 9,
        title: "The Problem with Fast Fashion: A Look at the Hidden Costs",
        image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop",
        date: "September 18, 2025",
        description: "We dive deep into the environmental and social consequences of the fast fashion industry, from textile waste in landfills to exploitative labor practices.",
        category: "Industry Insights",
        author: "Chris Evans",
        readingTime: "8 min"
    },
    {
        id: 10,
        title: "Meet the Brands Making a Difference in Sustainable Fashion",
        image: "https://images.unsplash.com/photo-1579566346927-c68383817a25?w=800&auto=format&fit=crop",
        date: "September 15, 2025",
        description: "Spotlight on innovative brands that are putting sustainability at the forefront, using recycled materials, circular models, and ethical production to change the industry for the better.",
        category: "Brands",
        author: "Emma Wilson",
        readingTime: "7 min"
    },
    {
        id: 11,
        title: "Eco-Friendly Footwear: Steps in the Right Direction",
        image: "https://images.unsplash.com/photo-1617606002779-51d866bdd1d1?w=800&auto=format&fit=crop",
        date: "September 11, 2025",
        description: "Your shoes can have a big environmental footprint. Discover brands that are using materials like recycled plastic, cork, and algae foam to create stylish and sustainable footwear.",
        category: "Accessories",
        author: "James Brown",
        readingTime: "6 min"
    },
    {
        id: 12,
        title: "The Art of Mending: How Visible Repairs Are Making a Statement",
        image: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&auto=format&fit=crop",
        date: "September 8, 2025",
        description: "Instead of hiding tears, the visible mending movement celebrates them with creative embroidery and patches. Learn how this practice turns repairs into a beautiful form of self-expression.",
        category: "DIY Fashion",
        author: "Olivia Martinez",
        readingTime: "5 min"
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
