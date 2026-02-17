import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { shopAPI, authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

import {
    HiShoppingBag,
    HiTicket,
    HiHeart,
    HiCurrencyDollar,
    HiCheckCircle,
    HiLockClosed
} from 'react-icons/hi';

const Shop = () => {
    const [items, setItems] = useState([]);
    const [user, setUser] = useState({ tokens: 0 }); // Initialize with default structure
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [itemsRes, userRes] = await Promise.all([
                shopAPI.getItems(),
                authAPI.getMe()
            ]);

            let shopItems = itemsRes.data.items;

            // If no items, try seeding once (client-side trigger for demo)
            if (shopItems.length === 0) {
                try {
                    await shopAPI.seed();
                    const seededRes = await shopAPI.getItems();
                    shopItems = seededRes.data.items;
                } catch (seedErr) {
                    console.warn('Auto-seed failed', seedErr);
                }
            }

            setItems(shopItems);
            setUser(userRes.data.user);
        } catch (error) {
            console.error('Error fetching shop data:', error);
            toast.error('Failed to load shop');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (item) => {
        if ((user.tokens || 0) < item.cost) {
            toast.error(`Not enough tokens! You need ${item.cost - (user.tokens || 0)} more.`);
            return;
        }

        if (!confirm(`Are you sure you want to spend ${item.cost} tokens for "${item.title}"?`)) {
            return;
        }

        try {
            setRedeeming(item._id);
            const res = await shopAPI.redeem(item._id);

            toast.success(res.data.message);

            // Optimistically update balance
            setUser(prev => ({ ...prev, tokens: res.data.newBalance }));

            if (res.data.code) {
                toast((t) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Here is your code:</span>
                        <code className="bg-gray-100 p-2 rounded text-center select-all cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(res.data.code);
                                toast.success('Copied to clipboard!');
                            }}>
                            {res.data.code}
                        </code>
                        <span className="text-xs text-gray-500">(Click to copy)</span>
                    </div>
                ), { duration: 6000 });
            }

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);

        } catch (error) {
            console.error('Redemption error:', error);
            toast.error(error.response?.data?.message || 'Transaction failed');
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) return <LoadingSpinner text="Opening shop..." />;

    // Group items by type
    const donations = items.filter(i => i.type === 'donation');
    const products = items.filter(i => i.type !== 'donation');

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative pb-20">
            {/* Header with Balance */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-eco-600 to-teal-500 p-8 rounded-3xl text-white shadow-xl"
            >
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <HiShoppingBag className="w-8 h-8" />
                        Eco-Rewards Shop
                    </h1>
                    <p className="text-eco-100 mt-2 text-lg">
                        Turn your carbon savings into real-world impact.
                    </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 flex flex-col items-center min-w-[150px]">
                    <span className="text-eco-100 text-sm font-medium uppercase tracking-wider">Your Balance</span>
                    <span className="text-4xl font-extrabold flex items-center gap-1 mt-1">
                        <HiCurrencyDollar className="w-8 h-8 text-yellow-300" />
                        {Math.floor(user?.tokens || 0)}
                    </span>
                    <span className="text-xs text-eco-100 mt-1">Tokens Available</span>
                </div>
            </motion.div>

            {/* Confetti Effect (Simple Overlay) */}
            <AnimatePresence>
                {showConfetti && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/10"
                    >
                        <div className="text-6xl animate-bounce">🎉</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Donations Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <HiHeart className="w-6 h-6 text-red-500" />
                        Plant & Donate
                    </h2>
                    <div className="grid gap-6">
                        {donations.length > 0 ? (
                            donations.map(item => (
                                <ShopItemCard
                                    key={item._id}
                                    item={item}
                                    userBalance={user.tokens || 0}
                                    onRedeem={() => handleRedeem(item)}
                                    isRedeeming={redeeming === item._id}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">No donation items available.</p>
                        )}
                    </div>
                </section>

                {/* Products & Coupons Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <HiTicket className="w-6 h-6 text-purple-500" />
                        Rewards & Coupons
                    </h2>
                    <div className="grid gap-6">
                        {products.length > 0 ? (
                            products.map(item => (
                                <ShopItemCard
                                    key={item._id}
                                    item={item}
                                    userBalance={user.tokens || 0}
                                    onRedeem={() => handleRedeem(item)}
                                    isRedeeming={redeeming === item._id}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">No reward items available.</p>
                        )}
                    </div>
                </section>
            </div>

        </div>
    );
};

// Sub-component for individual item
const ShopItemCard = ({ item, userBalance, onRedeem, isRedeeming }) => {
    const canAfford = userBalance >= item.cost;
    const missing = item.cost - userBalance;

    // Fallback image if unsplash fails or isn't provided (though we seeded them)
    const bgImage = item.image || 'https://via.placeholder.com/300';

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row h-full transition-shadow hover:shadow-md"
        >
            <div className="sm:w-1/3 bg-gray-100 relative h-48 sm:h-auto overflow-hidden">
                <img
                    src={bgImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                    {item.type}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-end justify-between mt-2 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase">Cost</span>
                        <span className="text-xl font-extrabold text-eco-600 flex items-center gap-1">
                            {item.cost} <span className="text-xs font-semibold text-gray-400">Tokens</span>
                        </span>
                    </div>

                    <button
                        onClick={onRedeem}
                        disabled={!canAfford || isRedeeming}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${canAfford
                                ? 'bg-gray-900 text-white hover:bg-black hover:shadow-md active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isRedeeming ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : !canAfford ? (
                            <><HiLockClosed className="w-3 h-3" /> Get {missing} more</>
                        ) : (
                            <>{item.type === 'donation' ? 'Donate' : 'Redeem'} <HiCheckCircle className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Shop;
