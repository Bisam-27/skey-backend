# Frontend Integration Guide

This guide shows how to integrate the homepage APIs with your frontend JavaScript.

## Quick Start

### 1. Update your frontend JavaScript to use the homepage API

Create or update `frontend/js/homepage.js`:

```javascript
// Homepage API Service
class HomepageService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/homepage';
  }

  // Get all homepage content
  async getHomepageContent() {
    try {
      const response = await fetch(this.baseURL);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      return null;
    }
  }

  // Get specific content types
  async getHeroBanners() {
    try {
      const response = await fetch(`${this.baseURL}/banners/hero`);
      const data = await response.json();
      return data.success ? data.data.banners : [];
    } catch (error) {
      console.error('Error fetching hero banners:', error);
      return [];
    }
  }

  async getTestimonials(limit = 6) {
    try {
      const response = await fetch(`${this.baseURL}/testimonials?limit=${limit}`);
      const data = await response.json();
      return data.success ? data.data.testimonials : [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }
}

// Initialize service
const homepageService = new HomepageService();

// Load homepage content when page loads
document.addEventListener('DOMContentLoaded', async function() {
  await loadHomepageContent();
});

async function loadHomepageContent() {
  try {
    // Show loading state
    showLoadingState();

    // Get all homepage content in one call
    const content = await homepageService.getHomepageContent();
    
    if (content) {
      // Update different sections
      updateHeroBanners(content.heroBanners);
      updateAnnouncements(content.announcements);
      updatePromotionalBanners(content.promotionalBanners);
      updateTestimonials(content.testimonials);
      updateFeatures(content.features);
      
      // Hide loading state
      hideLoadingState();
    } else {
      showErrorState();
    }
  } catch (error) {
    console.error('Error loading homepage content:', error);
    showErrorState();
  }
}

function updateHeroBanners(banners) {
  const swiperWrapper = document.querySelector('#hero-swiper .swiper-wrapper');
  if (!swiperWrapper || !banners.length) return;

  swiperWrapper.innerHTML = banners.map(banner => `
    <div class="swiper-slide">
      <div class="hero__slide">
        <img src="${banner.image_url}" alt="${banner.title}" class="hero__bg" />
        ${banner.title || banner.description ? `
          <div class="container">
            <div class="hero__content-wrapper">
              <div class="hero__content" style="color: ${banner.text_color || '#333'}">
                ${banner.title ? `<div class="m bold">${banner.title}</div>` : ''}
                ${banner.description ? `<p>${banner.description}</p>` : ''}
                ${banner.link_url ? `
                  <a href="${banner.link_url}" class="btn btn--primary">
                    ${banner.link_text || 'Shop Now'}
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  // Reinitialize Swiper if needed
  if (window.heroSwiper) {
    window.heroSwiper.update();
  }
}

function updateAnnouncements(announcements) {
  const swiperWrapper = document.querySelector('#announcement-swiper .swiper-wrapper');
  if (!swiperWrapper || !announcements.length) return;

  swiperWrapper.innerHTML = announcements.map(announcement => `
    <div class="swiper-slide">
      <div class="nav__announcement-carousel-wrapper">
        <div class="nav__announcement-item">
          <a href="${announcement.link_url || '#'}" class="nav__announcement-link">
            ${announcement.title}
          </a>
        </div>
      </div>
    </div>
  `).join('');

  // Reinitialize Swiper if needed
  if (window.announcementSwiper) {
    window.announcementSwiper.update();
  }
}

function updatePromotionalBanners(banners) {
  const swiperWrapper = document.querySelector('#banner-swiper .swiper-wrapper');
  if (!swiperWrapper || !banners.length) return;

  swiperWrapper.innerHTML = banners.map(banner => `
    <div class="swiper-slide">
      <div class="banner__carousel">
        <div class="banner__img-wrapper">
          <img src="${banner.image_url}" alt="${banner.title}" class="banner__img" />
        </div>
      </div>
    </div>
  `).join('');

  // Reinitialize Swiper if needed
  if (window.bannerSwiper) {
    window.bannerSwiper.update();
  }
}

function updateTestimonials(testimonials) {
  // Add testimonials section if it doesn't exist
  const main = document.querySelector('main');
  if (!main || !testimonials.length) return;

  // Check if testimonials section already exists
  let testimonialsSection = document.querySelector('.testimonials');
  
  if (!testimonialsSection) {
    // Create testimonials section
    testimonialsSection = document.createElement('section');
    testimonialsSection.className = 'testimonials';
    testimonialsSection.innerHTML = `
      <div class="container">
        <header class="testimonials__header">
          <h2 class="l">What Our Customers Say</h2>
        </header>
        <div class="testimonials__grid"></div>
      </div>
    `;
    
    // Insert before the "why" section
    const whySection = document.querySelector('.why');
    if (whySection) {
      main.insertBefore(testimonialsSection, whySection);
    } else {
      main.appendChild(testimonialsSection);
    }
  }

  const grid = testimonialsSection.querySelector('.testimonials__grid');
  if (grid) {
    grid.innerHTML = testimonials.map(testimonial => `
      <div class="testimonial-card">
        <div class="testimonial-card__rating">
          ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
        </div>
        <p class="testimonial-card__review">"${testimonial.review}"</p>
        <div class="testimonial-card__author">
          <strong>${testimonial.name}</strong>
          ${testimonial.location ? `<span class="testimonial-card__location">${testimonial.location}</span>` : ''}
          ${testimonial.is_verified ? '<span class="testimonial-card__verified">✓ Verified</span>' : ''}
        </div>
      </div>
    `).join('');
  }
}

function updateFeatures(features) {
  const whyGrid = document.querySelector('.why__grid');
  if (!whyGrid || !features.length) return;

  whyGrid.innerHTML = features.map(feature => `
    <li class="why__grid-item">
      <div class="why__icon-wrapper">
        <img src="${feature.icon_url}" alt="${feature.title}" class="why__icon" />
      </div>
      <p>${feature.description}</p>
    </li>
  `).join('');
}

function showLoadingState() {
  // Add loading indicators to various sections
  const sections = [
    '#hero-swiper .swiper-wrapper',
    '#announcement-swiper .swiper-wrapper',
    '#banner-swiper .swiper-wrapper',
    '.why__grid'
  ];

  sections.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = '<div class="loading">Loading...</div>';
    }
  });
}

function hideLoadingState() {
  // Remove loading indicators
  document.querySelectorAll('.loading').forEach(el => el.remove());
}

function showErrorState() {
  console.error('Failed to load homepage content');
  // You can add user-friendly error messages here
}
```

### 2. Add the script to your HTML

Update `frontend/index.html` to include the homepage script:

```html
<!-- Add this before the closing </body> tag -->
<script src="js/homepage.js"></script>
```

### 3. Add CSS for testimonials (optional)

Add this to your CSS file:

```css
.testimonials {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.testimonials__header {
  text-align: center;
  margin-bottom: 3rem;
}

.testimonials__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.testimonial-card__rating {
  color: #ffd700;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.testimonial-card__review {
  font-style: italic;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.testimonial-card__author {
  font-size: 0.9rem;
}

.testimonial-card__location {
  color: #666;
  display: block;
}

.testimonial-card__verified {
  color: #28a745;
  font-size: 0.8rem;
}
```

## API Endpoints Summary

- `GET /api/homepage` - All homepage content
- `GET /api/homepage/banners/hero` - Hero banners
- `GET /api/homepage/banners/promotional` - Promotional banners  
- `GET /api/homepage/announcements` - Announcements
- `GET /api/homepage/testimonials` - Testimonials
- `GET /api/homepage/features` - Why choose us features

## Setup Steps

1. **Seed the data**:
   ```bash
   node backend/scripts/seedHomepage.js
   ```

2. **Test the APIs**:
   ```bash
   node backend/test/homepageApiTest.js
   ```

3. **Update your frontend** with the JavaScript code above

4. **Start your server** and test the homepage

Your homepage will now be fully dynamic with content loaded from the backend APIs!
