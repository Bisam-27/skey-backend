const Category = require('./category');
const Subcategory = require('./subcategory');
const Product = require('./product');
const User = require('./user');
const Cart = require('./cart');
const Wishlist = require('./wishlist');
const Banner = require('./banner');
const Testimonial = require('./testimonial');
const Feature = require('./feature');
const Coupon = require('./coupon');
const CouponUsage = require('./couponUsage');
const Address = require('./address');
const Order = require('./order');
const OrderItem = require('./orderItem');
const Brand = require('./brand');
const VendorProfile = require('./vendorProfile');
const Return = require('./return');

// Category has many Subcategories
Category.hasMany(Subcategory, {
  foreignKey: 'category_id',
  as: 'subcategories'
});

// Subcategory belongs to Category
Subcategory.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Subcategory has many Products
Subcategory.hasMany(Product, {
  foreignKey: 'subcategory_id',
  as: 'products'
});

// Product belongs to Subcategory (without constraint for existing table)
Product.belongsTo(Subcategory, {
  foreignKey: 'subcategory_id',
  as: 'subcategory',
  constraints: false
});

// User has many Carts
User.hasMany(Cart, {
  foreignKey: 'user_id',
  as: 'carts'
});

// Cart belongs to User
Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false
});

// Testimonial belongs to Product (optional)
Testimonial.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
  constraints: false
});

// Product has many Testimonials
Product.hasMany(Testimonial, {
  foreignKey: 'product_id',
  as: 'testimonials',
  constraints: false
});

// User has many Wishlists
User.hasMany(Wishlist, {
  foreignKey: 'user_id',
  as: 'wishlists'
});

// Wishlist belongs to User
Wishlist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false
});

// Product has many Wishlists
Product.hasMany(Wishlist, {
  foreignKey: 'product_id',
  as: 'wishlists'
});

// Wishlist belongs to Product
Wishlist.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
  constraints: false
});

// User (vendor) has many Products
User.hasMany(Product, {
  foreignKey: 'vendor_id',
  as: 'vendorProducts',
  constraints: false
});

// Product belongs to User (vendor)
Product.belongsTo(User, {
  foreignKey: 'vendor_id',
  as: 'vendor',
  constraints: false
});

// Coupon associations
// User (vendor) has many Coupons
User.hasMany(Coupon, {
  foreignKey: 'vendor_id',
  as: 'coupons',
  constraints: false
});

// Coupon belongs to User (vendor)
Coupon.belongsTo(User, {
  foreignKey: 'vendor_id',
  as: 'vendor',
  constraints: false
});

// Category has many Coupons (for collection-based coupons)
Category.hasMany(Coupon, {
  foreignKey: 'collection_id',
  as: 'coupons',
  constraints: false
});

// Coupon belongs to Category (for collection-based coupons)
Coupon.belongsTo(Category, {
  foreignKey: 'collection_id',
  as: 'collection',
  constraints: false
});

// Product has many Coupons (for product-specific coupons)
Product.hasMany(Coupon, {
  foreignKey: 'product_id',
  as: 'coupons',
  constraints: false
});

// Coupon belongs to Product (for product-specific coupons)
Coupon.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
  constraints: false
});

// CouponUsage associations
// Coupon has many CouponUsages
Coupon.hasMany(CouponUsage, {
  foreignKey: 'coupon_id',
  as: 'usages',
  constraints: false
});

// CouponUsage belongs to Coupon
CouponUsage.belongsTo(Coupon, {
  foreignKey: 'coupon_id',
  as: 'coupon',
  constraints: false
});

// User has many CouponUsages
User.hasMany(CouponUsage, {
  foreignKey: 'user_id',
  as: 'couponUsages',
  constraints: false
});

// CouponUsage belongs to User
CouponUsage.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false
});

// Address associations
// User has many Addresses
User.hasMany(Address, {
  foreignKey: 'user_id',
  as: 'addresses',
  constraints: false
});

// Address belongs to User
Address.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false
});

// Order associations
// User has many Orders
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
  constraints: false
});

// Order belongs to User
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false
});

// Order has many OrderItems
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

// OrderItem belongs to Order
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// Product has many OrderItems
Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'orderItems',
  constraints: false
});

// OrderItem belongs to Product
OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
  constraints: false
});

// Migration completed - removed to prevent re-running

// Return associations
// Order has many Returns
Order.hasMany(Return, {
  foreignKey: 'order_id',
  as: 'returns',
  constraints: false
});

// Return belongs to Order
Return.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
  constraints: false
});

// OrderItem has many Returns
OrderItem.hasMany(Return, {
  foreignKey: 'order_item_id',
  as: 'returns',
  constraints: false
});

// Return belongs to OrderItem
Return.belongsTo(OrderItem, {
  foreignKey: 'order_item_id',
  as: 'orderItem',
  constraints: false
});

// User has many Returns
User.hasMany(Return, {
  foreignKey: 'user_id',
  as: 'returns',
  constraints: false
});

// Return belongs to User
Return.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false
});

// User (vendor) has many Returns
User.hasMany(Return, {
  foreignKey: 'vendor_id',
  as: 'vendorReturns',
  constraints: false
});

// Return belongs to User (vendor)
Return.belongsTo(User, {
  foreignKey: 'vendor_id',
  as: 'vendor',
  constraints: false
});

// Product has many Returns
Product.hasMany(Return, {
  foreignKey: 'product_id',
  as: 'returns',
  constraints: false
});

// Return belongs to Product
Return.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
  constraints: false
});

// Brand has many Products
Brand.hasMany(Product, {
  foreignKey: 'brand_id',
  as: 'products',
  constraints: false
});

// Product belongs to Brand
Product.belongsTo(Brand, {
  foreignKey: 'brand_id',
  as: 'brand',
  constraints: false
});

// Initialize model associations using associate methods if they exist
const models = {
  Category,
  Subcategory,
  Product,
  User,
  Cart,
  Wishlist,
  Banner,
  Testimonial,
  Feature,
  Coupon,
  CouponUsage,
  Address,
  Order,
  OrderItem,
  Brand,
  VendorProfile,
  Return
};

// Call associate methods for each model
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  Category,
  Subcategory,
  Product,
  User,
  Cart,
  Wishlist,
  Banner,
  Testimonial,
  Feature,
  Coupon,
  CouponUsage,
  Address,
  Order,
  OrderItem,
  Brand,
  VendorProfile,
  Return
};
