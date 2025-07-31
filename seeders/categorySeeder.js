const { Category, Subcategory } = require('../models/associations');

const categoryData = [
  {
    name: 'Women',
    slug: 'women',
    description: 'Fashion and accessories for women',
    sort_order: 1,
    subcategories: [
      // Clothing
      { name: 'Tops & Tees', slug: 'tops-tees', sort_order: 1 },
      { name: 'Dresses', slug: 'dresses', sort_order: 2 },
      { name: 'Jeans & Trousers', slug: 'jeans-trousers', sort_order: 3 },
      { name: 'Skirts & Shorts', slug: 'skirts-shorts', sort_order: 4 },
      { name: 'Ethnic Wear', slug: 'ethnic-wear', sort_order: 5 },
      { name: 'Loungewear', slug: 'loungewear', sort_order: 6 },
      // Shoes
      { name: 'Heels', slug: 'heels', sort_order: 7 },
      { name: 'Flats', slug: 'flats', sort_order: 8 },
      { name: 'Sneakers', slug: 'sneakers', sort_order: 9 },
      { name: 'Boots', slug: 'boots', sort_order: 10 },
      // Watches
      { name: "Women's Watches", slug: 'womens-watches', sort_order: 11 }
    ]
  },
  {
    name: 'Men',
    slug: 'men',
    description: 'Fashion and accessories for men',
    sort_order: 2,
    subcategories: [
      // Clothing
      { name: 'T-Shirts & Polos', slug: 't-shirts-polos', sort_order: 1 },
      { name: 'Shirts', slug: 'shirts', sort_order: 2 },
      { name: 'Jeans & Trousers', slug: 'mens-jeans-trousers', sort_order: 3 },
      { name: 'Shorts', slug: 'shorts', sort_order: 4 },
      { name: 'Jackets & Coats', slug: 'jackets-coats', sort_order: 5 },
      { name: 'Traditional Wear', slug: 'traditional-wear', sort_order: 6 },
      // Shoes
      { name: 'Casual Shoes', slug: 'casual-shoes', sort_order: 7 },
      { name: 'Formal Shoes', slug: 'formal-shoes', sort_order: 8 },
      { name: 'Sneakers', slug: 'mens-sneakers', sort_order: 9 },
      { name: 'Sandals & Floaters', slug: 'sandals-floaters', sort_order: 10 },
      // Watches
      { name: "Men's Watches", slug: 'mens-watches', sort_order: 11 }
    ]
  },
  {
    name: 'Kids',
    slug: 'kids',
    description: 'Fashion and accessories for children',
    sort_order: 3,
    subcategories: [
      { name: "Boys' Shoes", slug: 'boys-shoes', sort_order: 1 },
      { name: "Girls' Shoes", slug: 'girls-shoes', sort_order: 2 },
      { name: "Boys' Clothing", slug: 'boys-clothing', sort_order: 3 },
      { name: "Girls' Clothing", slug: 'girls-clothing', sort_order: 4 },
      { name: 'Baby Clothing', slug: 'baby-clothing', sort_order: 5 }
    ]
  },
  {
    name: 'Watches',
    slug: 'watches',
    description: 'Timepieces and smart watches',
    sort_order: 4,
    subcategories: [
      { name: 'Smart Watches', slug: 'smart-watches', sort_order: 1 },
      { name: 'Fitness Bands', slug: 'fitness-bands', sort_order: 2 },
      { name: 'Luxury Watches', slug: 'luxury-watches', sort_order: 3 }
    ]
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Fashion accessories and jewelry',
    sort_order: 5,
    subcategories: [
      { name: 'Sunglasses', slug: 'sunglasses', sort_order: 1 },
      { name: 'Belts', slug: 'belts', sort_order: 2 },
      { name: 'Hats & Caps', slug: 'hats-caps', sort_order: 3 },
      { name: 'Scarves & Stoles', slug: 'scarves-stoles', sort_order: 4 },
      { name: 'Jewelry (Earrings, Necklaces, Rings)', slug: 'jewelry', sort_order: 5 },
      { name: 'Hair Accessories', slug: 'hair-accessories', sort_order: 6 },
      { name: 'Gloves & Socks', slug: 'gloves-socks', sort_order: 7 }
    ]
  },
  {
    name: 'Bags',
    slug: 'bags',
    description: 'Handbags, backpacks and travel bags',
    sort_order: 6,
    subcategories: [
      { name: 'Handbags', slug: 'handbags', sort_order: 1 },
      { name: 'Backpacks', slug: 'backpacks', sort_order: 2 },
      { name: 'Sling Bags', slug: 'sling-bags', sort_order: 3 },
      { name: 'Wallets', slug: 'wallets', sort_order: 4 },
      { name: 'Clutches', slug: 'clutches', sort_order: 5 },
      { name: 'Laptop Bags', slug: 'laptop-bags', sort_order: 6 },
      { name: 'Travel Bags', slug: 'travel-bags', sort_order: 7 }
    ]
  }
];

const beautyData = [
  {
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    description: 'Beauty products and skincare essentials',
    sort_order: 7,
    subcategories: [
      // Skincare
      { name: 'Cleansers', slug: 'cleansers', sort_order: 1 },
      { name: 'Face Wash', slug: 'face-wash', sort_order: 2 },
      { name: 'Toners', slug: 'toners', sort_order: 3 },
      { name: 'Moisturizers', slug: 'moisturizers', sort_order: 4 },
      { name: 'Serums & Essences', slug: 'serums-essences', sort_order: 5 },
      { name: 'Face Oils', slug: 'face-oils', sort_order: 6 },
      { name: 'Sunscreens', slug: 'sunscreens', sort_order: 7 },
      { name: 'Face Masks & Packs', slug: 'face-masks-packs', sort_order: 8 },
      { name: 'Eye Creams', slug: 'eye-creams', sort_order: 9 },
      { name: 'Lip Balms', slug: 'lip-balms', sort_order: 10 },
      { name: 'Anti-Aging Products', slug: 'anti-aging-products', sort_order: 11 },
      { name: 'Exfoliators & Scrubs', slug: 'exfoliators-scrubs', sort_order: 12 },
      // Makeup - Face
      { name: 'Foundations', slug: 'foundations', sort_order: 13 },
      { name: 'Concealers', slug: 'concealers', sort_order: 14 },
      { name: 'Primers', slug: 'primers', sort_order: 15 },
      { name: 'Highlighters', slug: 'highlighters', sort_order: 16 },
      { name: 'Blushes', slug: 'blushes', sort_order: 17 },
      { name: 'Setting Sprays/Powders', slug: 'setting-sprays-powders', sort_order: 18 },
      // Makeup - Eyes
      { name: 'Eyeliners', slug: 'eyeliners', sort_order: 19 },
      { name: 'Mascaras', slug: 'mascaras', sort_order: 20 },
      { name: 'Eyeshadows', slug: 'eyeshadows', sort_order: 21 },
      { name: 'Eyebrow Products', slug: 'eyebrow-products', sort_order: 22 },
      // Makeup - Lips
      { name: 'Lipsticks', slug: 'lipsticks', sort_order: 23 },
      { name: 'Lip Glosses', slug: 'lip-glosses', sort_order: 24 },
      { name: 'Lip Liners', slug: 'lip-liners', sort_order: 25 }
    ]
  }
];

const additionalCategories = [
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Hair care products and styling tools',
    sort_order: 8,
    subcategories: [
      { name: 'Shampoos', slug: 'shampoos', sort_order: 1 },
      { name: 'Conditioners', slug: 'conditioners', sort_order: 2 },
      { name: 'Hair Oils', slug: 'hair-oils', sort_order: 3 },
      { name: 'Hair Masks & Serums', slug: 'hair-masks-serums', sort_order: 4 },
      { name: 'Hair Styling Products', slug: 'hair-styling-products', sort_order: 5 },
      { name: 'Hair Color', slug: 'hair-color', sort_order: 6 }
    ]
  },
  {
    name: 'Body Care',
    slug: 'body-care',
    description: 'Body care and personal hygiene products',
    sort_order: 9,
    subcategories: [
      { name: 'Body Lotions & Creams', slug: 'body-lotions-creams', sort_order: 1 },
      { name: 'Body Washes & Shower Gels', slug: 'body-washes-shower-gels', sort_order: 2 },
      { name: 'Body Scrubs', slug: 'body-scrubs', sort_order: 3 },
      { name: 'Hand Creams', slug: 'hand-creams', sort_order: 4 },
      { name: 'Foot Creams', slug: 'foot-creams', sort_order: 5 },
      { name: 'Deodorants & Roll-Ons', slug: 'deodorants-roll-ons', sort_order: 6 },
      { name: 'Body Oils', slug: 'body-oils', sort_order: 7 }
    ]
  },
  {
    name: 'Fragrances',
    slug: 'fragrances',
    description: 'Perfumes and body mists',
    sort_order: 10,
    subcategories: [
      { name: 'Perfumes for Women', slug: 'perfumes-women', sort_order: 1 },
      { name: 'Perfumes for Men', slug: 'perfumes-men', sort_order: 2 },
      { name: 'Body Mists', slug: 'body-mists', sort_order: 3 }
    ]
  },
  {
    name: 'Beauty Tools & Accessories',
    slug: 'beauty-tools-accessories',
    description: 'Beauty tools and makeup accessories',
    sort_order: 11,
    subcategories: [
      { name: 'Face Tools', slug: 'face-tools', sort_order: 1 },
      { name: 'Makeup Brushes & Blenders', slug: 'makeup-brushes-blenders', sort_order: 2 },
      { name: 'Hair Styling Tools', slug: 'hair-styling-tools', sort_order: 3 },
      { name: 'Manicure & Pedicure Tools', slug: 'manicure-pedicure-tools', sort_order: 4 },
      { name: 'Beauty Organizers', slug: 'beauty-organizers', sort_order: 5 }
    ]
  },
  {
    name: "Men's Grooming",
    slug: 'mens-grooming',
    description: 'Grooming products for men',
    sort_order: 12,
    subcategories: [
      { name: 'Beard Care', slug: 'beard-care', sort_order: 1 },
      { name: 'Shaving Essentials', slug: 'shaving-essentials', sort_order: 2 },
      { name: "Men's Skincare", slug: 'mens-skincare', sort_order: 3 },
      { name: "Men's Hair Care", slug: 'mens-hair-care', sort_order: 4 },
      { name: 'Fragrances for Men', slug: 'fragrances-men', sort_order: 5 }
    ]
  },
  {
    name: 'Natural & Organic',
    slug: 'natural-organic',
    description: 'Natural and organic beauty products',
    sort_order: 13,
    subcategories: [
      { name: 'Organic Skincare', slug: 'organic-skincare', sort_order: 1 },
      { name: 'Herbal Hair Care', slug: 'herbal-hair-care', sort_order: 2 },
      { name: 'Natural Makeup', slug: 'natural-makeup', sort_order: 3 },
      { name: 'Ayurveda-Based Products', slug: 'ayurveda-based-products', sort_order: 4 }
    ]
  },
  {
    name: 'Shop by Concern',
    slug: 'shop-by-concern',
    description: 'Products targeted for specific skin concerns',
    sort_order: 14,
    subcategories: [
      { name: 'Acne & Blemishes', slug: 'acne-blemishes', sort_order: 1 },
      { name: 'Pigmentation & Dark Spots', slug: 'pigmentation-dark-spots', sort_order: 2 },
      { name: 'Dryness', slug: 'dryness', sort_order: 3 },
      { name: 'Oil Control', slug: 'oil-control', sort_order: 4 },
      { name: 'Anti-Aging', slug: 'anti-aging', sort_order: 5 },
      { name: 'Sensitivity & Redness', slug: 'sensitivity-redness', sort_order: 6 },
      { name: 'Hair Fall Control', slug: 'hair-fall-control', sort_order: 7 },
      { name: 'Dull Skin/Brightening', slug: 'dull-skin-brightening', sort_order: 8 }
    ]
  }
];

const seedCategories = async () => {
  try {
    console.log('Starting category seeding...');

    // Combine all category data
    const allCategories = [...categoryData, ...beautyData, ...additionalCategories];

    for (const categoryInfo of allCategories) {
      // Create category
      const [category, created] = await Category.findOrCreate({
        where: { slug: categoryInfo.slug },
        defaults: {
          name: categoryInfo.name,
          slug: categoryInfo.slug,
          description: categoryInfo.description,
          sort_order: categoryInfo.sort_order,
          is_active: true
        }
      });

      if (created) {
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }

      // Create subcategories
      for (const subcat of categoryInfo.subcategories) {
        const [subcategory, subcatCreated] = await Subcategory.findOrCreate({
          where: {
            slug: subcat.slug,
            category_id: category.id
          },
          defaults: {
            name: subcat.name,
            slug: subcat.slug,
            category_id: category.id,
            sort_order: subcat.sort_order,
            is_active: true
          }
        });

        if (subcatCreated) {
          console.log(`  Created subcategory: ${subcategory.name}`);
        }
      }
    }

    console.log('Category seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

module.exports = { seedCategories };
