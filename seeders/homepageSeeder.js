const Banner = require('../models/banner');
const Testimonial = require('../models/testimonial');
const Feature = require('../models/feature');

// Hero banners data
const heroBannersData = [
  {
    title: 'Summer Collection 2024',
    subtitle: 'Discover the latest trends',
    description: 'Shop our exclusive summer collection with up to 50% off on selected items',
    image_url: 'img/carousel-1.jpg',
    mobile_image_url: 'img/carousel-1-mobile.jpg',
    link_url: '/browse.html?category=summer',
    link_text: 'Shop Now',
    type: 'hero',
    position: 1,
    background_color: '#f8f9fa',
    text_color: '#333333'
  },
  {
    title: 'New Arrivals',
    subtitle: 'Fresh styles just in',
    description: 'Be the first to shop our newest arrivals across all categories',
    image_url: 'img/carousel-2.jpg',
    mobile_image_url: 'img/carousel-2-mobile.jpg',
    link_url: '/browse.html?filter=new',
    link_text: 'Explore',
    type: 'hero',
    position: 2,
    background_color: '#ffffff',
    text_color: '#000000'
  },
  {
    title: 'Ethnic Wear Special',
    subtitle: 'Traditional meets modern',
    description: 'Celebrate in style with our curated ethnic wear collection',
    image_url: 'img/carousel-3.jpg',
    mobile_image_url: 'img/carousel-3-mobile.jpg',
    link_url: '/browse.html?category=ethnic',
    link_text: 'Shop Collection',
    type: 'hero',
    position: 3,
    background_color: '#ffeaa7',
    text_color: '#2d3436'
  },
  {
    title: 'Footwear Fiesta',
    subtitle: 'Step up your style',
    description: 'Complete your look with our premium footwear collection',
    image_url: 'img/carousel-4.jpg',
    mobile_image_url: 'img/carousel-4-mobile.jpg',
    link_url: '/browse.html?category=footwear',
    link_text: 'Shop Shoes',
    type: 'hero',
    position: 4,
    background_color: '#74b9ff',
    text_color: '#ffffff'
  },
  {
    title: 'Beauty Essentials',
    subtitle: 'Glow up your routine',
    description: 'Discover premium beauty products for your daily routine',
    image_url: 'img/carousel-5.webp',
    mobile_image_url: 'img/carousel-5-mobile.webp',
    link_url: '/browse.html?category=beauty',
    link_text: 'Shop Beauty',
    type: 'hero',
    position: 5,
    background_color: '#fd79a8',
    text_color: '#ffffff'
  }
];

// Promotional banners data
const promotionalBannersData = [
  {
    title: 'Mega Sale',
    subtitle: 'Up to 70% Off',
    description: 'Limited time offer on all categories',
    image_url: 'img/banner.jpg',
    link_url: '/browse.html?sale=true',
    link_text: 'Shop Sale',
    type: 'promotional',
    position: 1,
    background_color: '#e17055',
    text_color: '#ffffff'
  },
  {
    title: 'Watch Collection',
    subtitle: 'Timeless elegance',
    description: 'Premium watches for every occasion',
    image_url: 'img/cat-8.jpg',
    link_url: '/browse.html?category=watches',
    link_text: 'View Watches',
    type: 'promotional',
    position: 2,
    background_color: '#2d3436',
    text_color: '#ffffff'
  },
  {
    title: 'Footwear Special',
    subtitle: 'Comfort meets style',
    description: 'Step into comfort with our footwear range',
    image_url: 'img/cat-11.jpg',
    link_url: '/browse.html?category=footwear',
    link_text: 'Shop Now',
    type: 'promotional',
    position: 3,
    background_color: '#00b894',
    text_color: '#ffffff'
  }
];

// Announcements data (image_url is optional for announcements)
const announcementsData = [
  {
    title: 'All DENIMS are 50% off! Shop Now',
    link_url: '/browse.html?category=denim',
    link_text: 'Shop Denim',
    type: 'announcement',
    position: 1,
    background_color: '#6c5ce7',
    text_color: '#ffffff'
  },
  {
    title: 'All Watches are 50% off! Shop Now',
    link_url: '/browse.html?category=watches',
    link_text: 'Shop Watches',
    type: 'announcement',
    position: 2,
    background_color: '#fd79a8',
    text_color: '#ffffff'
  },
  {
    title: 'Free shipping on orders above ₹999',
    link_url: '/browse.html',
    link_text: 'Shop Now',
    type: 'announcement',
    position: 3,
    background_color: '#00b894',
    text_color: '#ffffff'
  }
];

// Testimonials data
const testimonialsData = [
  {
    name: 'Priya Sharma',
    rating: 5,
    review: 'Amazing quality products! I love shopping at Skeyy. The delivery is always on time and the customer service is excellent.',
    location: 'Mumbai, Maharashtra',
    is_featured: true,
    is_verified: true,
    position: 1
  },
  {
    name: 'Rahul Kumar',
    rating: 5,
    review: 'Great collection of ethnic wear. Found the perfect outfit for my wedding. Highly recommended!',
    location: 'Delhi, NCR',
    is_featured: true,
    is_verified: true,
    position: 2
  },
  {
    name: 'Sneha Patel',
    rating: 4,
    review: 'Love the variety of products available. The website is easy to navigate and checkout process is smooth.',
    location: 'Ahmedabad, Gujarat',
    is_featured: true,
    is_verified: true,
    position: 3
  },
  {
    name: 'Arjun Singh',
    rating: 5,
    review: 'Excellent quality footwear. Very comfortable and stylish. Will definitely shop again.',
    location: 'Bangalore, Karnataka',
    is_featured: true,
    is_verified: true,
    position: 4
  },
  {
    name: 'Kavya Reddy',
    rating: 5,
    review: 'The beauty products are authentic and of great quality. Fast delivery and secure packaging.',
    location: 'Hyderabad, Telangana',
    is_featured: true,
    is_verified: true,
    position: 5
  },
  {
    name: 'Vikash Gupta',
    rating: 4,
    review: 'Good collection of watches. Found exactly what I was looking for at a great price.',
    location: 'Pune, Maharashtra',
    is_featured: true,
    is_verified: true,
    position: 6
  }
];

// Features data (Why Choose Us)
const featuresData = [
  {
    title: 'Secure Payments',
    description: 'We never ask for your bank or card details over call or in person.',
    icon_url: 'img/icon-cart.svg',
    type: 'why_choose_us',
    position: 1
  },
  {
    title: 'Hand-picked Quality',
    description: 'Every product is 100% hand-picked with care and precision.',
    icon_url: 'img/icon-lock.svg',
    type: 'why_choose_us',
    position: 2
  },
  {
    title: 'Assured Quality',
    description: 'We promise assured quality in every order you place.',
    icon_url: 'img/icon-quality.svg',
    type: 'why_choose_us',
    position: 3
  }
];

// Seeder functions
const seedBanners = async () => {
  console.log('Seeding banners...');
  
  // Seed hero banners
  for (const bannerData of heroBannersData) {
    const [banner, created] = await Banner.findOrCreate({
      where: { title: bannerData.title, type: bannerData.type },
      defaults: bannerData
    });
    
    if (created) {
      console.log(`Created hero banner: ${banner.title}`);
    } else {
      console.log(`Hero banner already exists: ${banner.title}`);
    }
  }
  
  // Seed promotional banners
  for (const bannerData of promotionalBannersData) {
    const [banner, created] = await Banner.findOrCreate({
      where: { title: bannerData.title, type: bannerData.type },
      defaults: bannerData
    });
    
    if (created) {
      console.log(`Created promotional banner: ${banner.title}`);
    } else {
      console.log(`Promotional banner already exists: ${banner.title}`);
    }
  }
  
  // Seed announcements
  for (const bannerData of announcementsData) {
    const [banner, created] = await Banner.findOrCreate({
      where: { title: bannerData.title, type: bannerData.type },
      defaults: bannerData
    });
    
    if (created) {
      console.log(`Created announcement: ${banner.title}`);
    } else {
      console.log(`Announcement already exists: ${banner.title}`);
    }
  }
};

const seedTestimonials = async () => {
  console.log('Seeding testimonials...');
  
  for (const testimonialData of testimonialsData) {
    const [testimonial, created] = await Testimonial.findOrCreate({
      where: { name: testimonialData.name, review: testimonialData.review },
      defaults: testimonialData
    });
    
    if (created) {
      console.log(`Created testimonial: ${testimonial.name}`);
    } else {
      console.log(`Testimonial already exists: ${testimonial.name}`);
    }
  }
};

const seedFeatures = async () => {
  console.log('Seeding features...');
  
  for (const featureData of featuresData) {
    const [feature, created] = await Feature.findOrCreate({
      where: { title: featureData.title, type: featureData.type },
      defaults: featureData
    });
    
    if (created) {
      console.log(`Created feature: ${feature.title}`);
    } else {
      console.log(`Feature already exists: ${feature.title}`);
    }
  }
};

const seedHomepageContent = async () => {
  try {
    await seedBanners();
    await seedTestimonials();
    await seedFeatures();
    console.log('Homepage content seeding completed!');
  } catch (error) {
    console.error('Error seeding homepage content:', error);
    throw error;
  }
};

module.exports = {
  seedHomepageContent,
  seedBanners,
  seedTestimonials,
  seedFeatures
};
