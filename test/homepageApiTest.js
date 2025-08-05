// Simple test script for homepage APIs
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response ? error.response.data : error.message 
    };
  }
};

// Test functions
const testAllHomepageContent = async () => {
  console.log('\n=== Testing All Homepage Content ===');
  const result = await apiCall('/homepage');
  
  if (result.success) {
    const data = result.data.data;
    console.log('✅ Homepage content retrieved successfully');
    console.log(`   Hero Banners: ${data.heroBanners?.length || 0}`);
    console.log(`   Promotional Banners: ${data.promotionalBanners?.length || 0}`);
    console.log(`   Announcements: ${data.announcements?.length || 0}`);
    console.log(`   Featured Categories: ${data.featuredCategories?.length || 0}`);
    console.log(`   Testimonials: ${data.testimonials?.length || 0}`);
    console.log(`   Features: ${data.features?.length || 0}`);
  } else {
    console.log('❌ Failed to get homepage content:', result.error);
  }
};

const testHeroBanners = async () => {
  console.log('\n=== Testing Hero Banners ===');
  const result = await apiCall('/homepage/banners/hero');
  
  if (result.success) {
    const banners = result.data.data.banners;
    console.log(`✅ Retrieved ${banners.length} hero banners`);
    if (banners.length > 0) {
      console.log(`   First banner: "${banners[0].title}"`);
    }
  } else {
    console.log('❌ Failed to get hero banners:', result.error);
  }
};

const testPromotionalBanners = async () => {
  console.log('\n=== Testing Promotional Banners ===');
  const result = await apiCall('/homepage/banners/promotional');
  
  if (result.success) {
    const banners = result.data.data.banners;
    console.log(`✅ Retrieved ${banners.length} promotional banners`);
    if (banners.length > 0) {
      console.log(`   First banner: "${banners[0].title}"`);
    }
  } else {
    console.log('❌ Failed to get promotional banners:', result.error);
  }
};

const testAnnouncements = async () => {
  console.log('\n=== Testing Announcements ===');
  const result = await apiCall('/homepage/announcements');
  
  if (result.success) {
    const announcements = result.data.data.announcements;
    console.log(`✅ Retrieved ${announcements.length} announcements`);
    if (announcements.length > 0) {
      console.log(`   First announcement: "${announcements[0].title}"`);
    }
  } else {
    console.log('❌ Failed to get announcements:', result.error);
  }
};

const testTestimonials = async () => {
  console.log('\n=== Testing Testimonials ===');
  const result = await apiCall('/homepage/testimonials?limit=3');
  
  if (result.success) {
    const testimonials = result.data.data.testimonials;
    console.log(`✅ Retrieved ${testimonials.length} testimonials`);
    if (testimonials.length > 0) {
      console.log(`   First testimonial: "${testimonials[0].name}" - ${testimonials[0].rating} stars`);
    }
  } else {
    console.log('❌ Failed to get testimonials:', result.error);
  }
};

const testFeatures = async () => {
  console.log('\n=== Testing Features ===');
  const result = await apiCall('/homepage/features');
  
  if (result.success) {
    const features = result.data.data.features;
    console.log(`✅ Retrieved ${features.length} features`);
    if (features.length > 0) {
      console.log(`   First feature: "${features[0].title}"`);
    }
  } else {
    console.log('❌ Failed to get features:', result.error);
  }
};

const testServerConnection = async () => {
  console.log('\n=== Testing Server Connection ===');
  const result = await apiCall('/categories');
  
  if (result.success) {
    console.log('✅ Server is running and responding');
  } else {
    console.log('❌ Server connection failed:', result.error);
    return false;
  }
  return true;
};

// Main test runner
const runHomepageTests = async () => {
  console.log('🚀 Starting Homepage API Tests');
  console.log('Make sure your server is running on http://localhost:5000');
  console.log('And that you have seeded the homepage content');

  // Test server connection first
  const serverRunning = await testServerConnection();
  if (!serverRunning) {
    console.log('\n❌ Cannot proceed - server is not running');
    console.log('💡 Start your server with: npm start or node backend/server.js');
    return;
  }

  // Test all homepage APIs
  await testAllHomepageContent();
  await testHeroBanners();
  await testPromotionalBanners();
  await testAnnouncements();
  await testTestimonials();
  await testFeatures();

  console.log('\n🎉 Homepage API tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. If any tests failed, check if homepage content is seeded');
  console.log('   2. Run: node backend/scripts/seedHomepage.js');
  console.log('   3. Integrate these APIs with your frontend');
  console.log('   4. Update frontend JavaScript to use these endpoints');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runHomepageTests().catch(console.error);
}

module.exports = { runHomepageTests };
