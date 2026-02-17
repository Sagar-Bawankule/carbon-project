import React, { useState, useEffect } from 'react';
import { rewardAPI } from '../services/api';

const RewardsCard = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claimMessage, setClaimMessage] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await rewardAPI.getStatus();
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching reward status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        try {
            const response = await rewardAPI.claim();
            setClaimMessage(response.data.message);
            fetchStatus(); // Refresh to update balance
        } catch (error) {
            setClaimMessage(error.response?.data?.message || 'Error claiming reward');
        }
    };

    if (loading) return <div className="animate-pulse h-48 bg-gray-200 rounded-xl"></div>;

    if (!status) return null;

    const percentage = Math.min(100, (status.currentUsage / status.limit) * 100);
    const isOverLimit = status.currentUsage > status.limit;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Carbon Rewards</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Balance: {status.tokens?.toFixed(0) || 0} Tokens
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Monthly Usage</span>
                        <span className={`font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-900'}`}>
                            {status.currentUsage.toFixed(1)} / {status.limit} kg CO₂
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                        {status.message}
                    </p>
                    {status.potentialReward > 0 && (
                        <p className="text-xs text-blue-600">
                            Maintain this to earn tokens at the end of the month!
                        </p>
                    )}
                </div>

                <button
                    onClick={handleClaim}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Check & Claim Past Rewards
                </button>

                {claimMessage && (
                    <p className={`text-sm mt-2 text-center ${claimMessage.includes('Congratulations') ? 'text-green-600' : 'text-gray-600'}`}>
                        {claimMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RewardsCard;
