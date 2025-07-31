const Category = require('./category');
const Subcategory = require('./subcategory');
const Product = require('./product');
const User = require('./user');
const Cart = require('./cart');

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

module.exports = {
  Category,
  Subcategory,
  Product,
  User,
  Cart
};
