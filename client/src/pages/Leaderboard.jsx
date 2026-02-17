import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiUserGroup,
    HiPlus,
    HiClipboardCopy,
    HiUsers,
    HiStar,
    HiSparkles,
    HiX
} from 'react-icons/hi';
import { FaCrown, FaTrophy } from 'react-icons/fa';

const Leaderboard = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [period, setPeriod] = useState('month');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchLeaderboard();
        }
    }, [selectedGroup, period]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await groupAPI.getMyGroups();
            setGroups(res.data.groups || []);
            if (res.data.groups?.length > 0 && !selectedGroup) {
                setSelectedGroup(res.data.groups[0]._id);
            }
        } catch (error) {
            console.error('Fetch groups error:', error.response?.data || error.message);
            console.error('Status:', error.response?.status);
            // Don't show error toast if no groups yet (expected)
            if (error.response?.status !== 500) {
                toast.error('Failed to load groups');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await groupAPI.getLeaderboard(selectedGroup, period);
            setLeaderboard(res.data.leaderboard);
        } catch (error) {
            toast.error('Failed to load leaderboard');
        }
    };

    const handleCreateGroup = async (name, description) => {
        try {
            const res = await groupAPI.createGroup({ name, description });
            toast.success(`Group created! Code: ${res.data.group.groupCode}`);
            fetchGroups();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Create group error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to create group');
        }
    };

    const handleJoinGroup = async (groupCode) => {
        try {
            await groupAPI.joinGroup({ groupCode });
            toast.success('Joined group successfully!');
            fetchGroups();
            setShowJoinModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join group');
        }
    };

    const copyGroupCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Group code copied!');
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'from-yellow-400 to-yellow-600';
        if (rank === 2) return 'from-slate-300 to-slate-500';
        if (rank === 3) return 'from-orange-400 to-orange-600';
        return 'from-slate-200 to-slate-400';
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return <FaCrown className="w-6 h-6 text-yellow-500 animate-bounce" />;
        if (rank === 2) return <HiStar className="w-6 h-6 text-slate-400" />;
        if (rank === 3) return <HiSparkles className="w-6 h-6 text-orange-500" />;
        return <span className="text-slate-500 font-bold">{rank}</span>;
    };

    const currentGroup = groups.find(g => g._id === selectedGroup);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-eco-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <FaTrophy className="text-yellow-500" />
                    Eco-Social Leaderboard
                </h1>
                <p className="text-slate-500 mt-1">
                    Compete with friends and family to reduce carbon footprint
                </p>
            </motion.div>

            {/* Groups & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    {groups.map(group => (
                        <button
                            key={group._id}
                            onClick={() => setSelectedGroup(group._id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedGroup === group._id
                                ? 'bg-eco-500 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <HiUserGroup className="inline mr-2" />
                            {group.name}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <HiPlus className="w-5 h-5" />
                        Create Group
                    </button>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <HiUsers className="w-5 h-5" />
                        Join Group
                    </button>
                </div>
            </div>

            {/* Group Info Card */}
            {currentGroup && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-6 mb-6 bg-gradient-to-r from-eco-50 to-teal-50"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{currentGroup.name}</h2>
                            <p className="text-slate-600 mt-1">
                                {currentGroup.members.length} members competing
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 mb-1">Group Code</p>
                            <button
                                onClick={() => copyGroupCode(currentGroup.groupCode)}
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-eco-300 hover:border-eco-500 transition-colors"
                            >
                                <span className="font-mono font-bold text-eco-600">{currentGroup.groupCode}</span>
                                <HiClipboardCopy className="text-eco-500" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Period Filter */}
            <div className="flex justify-center gap-2 mb-6">
                {['week', 'month', 'all'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-6 py-2 rounded-lg font-medium capitalize transition-all ${period === p
                            ? 'bg-eco-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {p === 'all' ? 'All Time' : `This ${p}`}
                    </button>
                ))}
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
                <AnimatePresence>
                    {leaderboard.map((member, index) => (
                        <motion.div
                            key={member.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`card p-6 ${member.rank === 1 ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank Badge */}
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(member.rank)} flex items-center justify-center shadow-lg`}>
                                    {getRankBadge(member.rank)}
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                                        {member.isWinner && (
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold"
                                            >
                                                🏆 ECO CHAMPION
                                            </motion.span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{member.activitiesCount} activities logged</p>
                                </div>

                                {/* Carbon Score */}
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-eco-600">
                                        {member.totalCO2}
                                        <span className="text-sm font-normal text-slate-500 ml-1">kg CO₂e</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {member.rank === 1 ? 'Lowest impact!' : `${(member.totalCO2 - leaderboard[0].totalCO2).toFixed(1)} kg more`}
                                    </p>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
                                {Object.entries(member.breakdown).map(([category, value]) => (
                                    <div key={category} className="text-center">
                                        <p className="text-xs text-slate-500 capitalize">{category}</p>
                                        <p className="text-sm font-bold text-slate-700">{value.toFixed(1)}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateGroup}
            />

            {/* Join Group Modal */}
            <JoinGroupModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoin={handleJoinGroup}
            />
        </div>
    );
};

// Create Group Modal Component
const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(name, description);
        setName('');
        setDescription('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Create New Group</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            placeholder="e.g., Deshmukh Family"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input resize-none"
                            rows={3}
                            placeholder="What's this group about?"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        Create Group
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// Join Group Modal Component
const JoinGroupModal = ({ isOpen, onClose, onJoin }) => {
    const [groupCode, setGroupCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onJoin(groupCode);
        setGroupCode('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Join Group</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Group Code</label>
                        <input
                            type="text"
                            value={groupCode}
                            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                            className="input text-center font-mono text-lg tracking-wider"
                            placeholder="ABC123"
                            maxLength={6}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Enter the 6-character code shared by your group admin
                        </p>
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        Join Group
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Leaderboard;
