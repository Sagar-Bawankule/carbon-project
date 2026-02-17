const ShopItem = require('../models/ShopItem');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

// Get all shop items
exports.getShopItems = async (req, res) => {
    try {
        const items = await ShopItem.find();
        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching shop items:', error);
        res.status(500).json({ message: 'Server error fetching shop items' });
    }
};

// Redeem an item
exports.redeemItem = async (req, res) => {
    try {
        const { shopItemId } = req.body;
        const userId = req.user.id;

        // Find the item
        const item = await ShopItem.findById(shopItemId);
        const user = await User.findById(userId);

        // Validate item & user
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check balance
        if ((user.tokens || 0) < item.cost) {
            return res.status(400).json({ message: `Insufficient tokens. You need ${item.cost} tokens.` });
        }

        // Deduct tokens
        user.tokens = (user.tokens || 0) - item.cost;
        await user.save();

        // Prepare redemption record
        const redemptionData = {
            userId,
            shopItemId,
            cost: item.cost,
            status: 'completed'
        };

        // Generate simple code for coupons
        if (item.type === 'coupon') {
            const code = `ECO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            redemptionData.code = code;
        }

        // Record the redemption
        const redemption = await Redemption.create(redemptionData);

        const successMessage = item.type === 'donation'
            ? `Successfully donated ${item.cost} tokens!`
            : `Successfully purchased ${item.title}!`;

        res.status(200).json({
            success: true,
            message: successMessage,
            newBalance: user.tokens,
            code: redemption.code || null
        });

    } catch (error) {
        console.error('Error processing redemption:', error);
        res.status(500).json({ message: 'Server error processing redemption' });
    }
};

// Seed initial shop items if empty
exports.seedShopItems = async (req, res) => {
    try {
        const count = await ShopItem.countDocuments();
        if (count === 0) {
            const items = [
                {
                    title: 'Plant a Real Tree',
                    description: 'Donate your tokens to plant a real tree in a reforestation project.',
                    cost: 500,
                    type: 'donation',
                    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?auto=format&fit=crop&q=80&w=1000'
                },
                {
                    title: 'Clean Energy Fund',
                    description: 'Support renewable energy initiatives globally.',
                    cost: 300,
                    type: 'donation',
                    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1000'
                },
                {
                    title: '20% Off Eco-Store',
                    description: 'Get a 20% discount coupon for our partner sustainable store.',
                    cost: 200,
                    type: 'coupon',
                    image: 'https://images.unsplash.com/photo-1610465299993-e6675c9f9efa?auto=format&fit=crop&q=80&w=1000'
                },
                {
                    title: 'Green Warrior Badge',
                    description: 'Unlock an exclusive badge for your profile.',
                    cost: 100,
                    type: 'product',
                    image: 'https://images.unsplash.com/photo-1533227297464-1296c6a46cd4?auto=format&fit=crop&q=80&w=1000'
                }
            ];
            await ShopItem.insertMany(items);
            return res.status(200).json({ success: true, message: 'Shop seeded successfully', items });
        }
        return res.status(200).json({ success: true, message: 'Shop already has items' });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ message: 'Seed error' });
    }
};
