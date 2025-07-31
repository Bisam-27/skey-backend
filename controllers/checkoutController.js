const Cart = require('../models/cart');
const Address = require('../models/address');
const User = require('../models/user');

// Get checkout data (cart items, addresses, payment details)
const getCheckoutData = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's active cart
    const cart = await Cart.findByUserId(userId);
    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Get user's addresses
    const addresses = await Address.findByUserId(userId);

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role']
    });

    // Get payment details
    const paymentDetails = cart.getPaymentDetails();

    res.status(200).json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          items: cart.invoice_items,
          item_count: cart.getItemCount(),
          total_amount: cart.total_amount,
          applied_coupon: cart.applied_coupon,
          discount_amount: cart.discount_amount,
          delivery_fee: cart.delivery_fee
        },
        payment_details: paymentDetails,
        addresses: addresses,
        user: user
      }
    });

  } catch (error) {
    console.error('Get checkout data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create or update address
const saveAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      id,
      name,
      first_name,
      last_name,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
      type
    } = req.body;

    // Validation
    if (!name || !first_name || !last_name || !address_line_1 || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    let address;

    if (id) {
      // Update existing address
      address = await Address.findOne({
        where: { id, user_id: userId }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      await address.update({
        name,
        first_name,
        last_name,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country: country || 'India',
        phone,
        is_default: is_default || false,
        type: type || 'both'
      });
    } else {
      // Create new address
      address = await Address.create({
        user_id: userId,
        name,
        first_name,
        last_name,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country: country || 'India',
        phone,
        is_default: is_default || false,
        type: type || 'both'
      });
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await Address.update(
        { is_default: false },
        { 
          where: { 
            user_id: userId,
            id: { [require('sequelize').Op.ne]: address.id }
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: id ? 'Address updated successfully' : 'Address created successfully',
      data: { address }
    });

  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.destroy();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const address = await Address.findOne({
      where: { id, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all default addresses for this user
    await Address.update(
      { is_default: false },
      { where: { user_id: userId } }
    );

    // Set this address as default
    await address.update({ is_default: true });

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: { address }
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getCheckoutData,
  saveAddress,
  deleteAddress,
  setDefaultAddress
};
