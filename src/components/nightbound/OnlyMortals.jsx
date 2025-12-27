import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, DollarSign, Eye, Heart, MessageCircle, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function OnlyMortals({ human, onClose }) {
  const [activeTab, setActiveTab] = useState('create');
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState({ type: 'photo', caption: '', price: 5 });
  const [interactingVampire, setInteractingVampire] = useState(null);
  const queryClient = useQueryClient();

  const { data: account = [] } = useQuery({
    queryKey: ['onlymortals', human.id],
    queryFn: async () => {
      const accounts = await base44.entities.OnlyFangsProfile.filter({ servant_id: human.id });
      return accounts;
    }
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['onlymortals-posts', human.id],
    queryFn: async () => {
      if (!account[0]) return [];
      return await base44.entities.OnlyFangsPost.filter({ profile_id: account[0].id }, '-created_date');
    },
    enabled: !!account[0]
  });

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const myAccount = account[0];
  const vampire = vampires[0];

  const createAccount = async () => {
    await base44.entities.OnlyFangsProfile.create({
      servant_id: human.id,
      username: `${human.name.toLowerCase().replace(/\s/g, '_')}_mortal`,
      bio: 'Just a human living their life...',
      profile_pic: '👤',
      is_couple_account: false,
      subscriber_count: 0,
      revenue: 0,
      reputation: 0
    });
    queryClient.invalidateQueries(['onlymortals']);
  };

  const createPost = async () => {
    if (!newPost.caption) return;
    setPosting(true);

    const postTypes = {
      photo: ['mirror selfie', 'outfit pic', 'casual photo', 'aesthetic shot'],
      video: ['short video', 'vlog clip', 'dancing video', 'lip sync'],
      exclusive: ['exclusive content', 'private photo', 'behind the scenes', 'personal moment']
    };

    const typeDesc = postTypes[newPost.type][Math.floor(Math.random() * postTypes[newPost.type].length)];

    await base44.entities.OnlyFangsPost.create({
      profile_id: myAccount.id,
      content_type: newPost.type,
      caption: newPost.caption,
      description: `${human.name} posted a ${typeDesc}: "${newPost.caption}"`,
      price: newPost.price,
      likes: 0,
      views: 0
    });

    await base44.entities.OnlyFangsProfile.update(myAccount.id, {
      revenue: (myAccount.revenue || 0) + (newPost.price * 2)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} posted on OnlyMortals: "${newPost.caption}" - earned $${newPost.price * 2}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['onlymortals']);
    setNewPost({ type: 'photo', caption: '', price: 5 });
    setPosting(false);
  };

  const vampireVisits = async () => {
    if (!vampire) return;
    
    setInteractingVampire(vampire);
    
    // Increase views
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    if (randomPost) {
      await base44.entities.OnlyFangsPost.update(randomPost.id, {
        views: (randomPost.views || 0) + 1,
        likes: (randomPost.likes || 0) + (Math.random() > 0.5 ? 1 : 0)
      });
    }

    await base44.entities.OnlyFangsProfile.update(myAccount.id, {
      subscriber_count: (myAccount.subscriber_count || 0) + 1,
      revenue: (myAccount.revenue || 0) + 15
    });

    // Update human's vampire encounter stats
    await base44.entities.Human.update(human.id, {
      vampire_encounters: (human.vampire_encounters || 0) + 1,
      awareness_level: Math.min(100, (human.awareness_level || 0) + 5),
      obsession_level: Math.min(100, (human.obsession_level || 0) + 10)
    });

    await base44.entities.NightLog.create({
      entry: `${vampire.vampire_name} (a vampire) subscribed to ${human.name}'s OnlyMortals. They're watching... obsessed.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const sendMessage = async () => {
    if (!interactingVampire) return;

    const messages = [
      `${interactingVampire.vampire_name}: "You're... captivating. I can't stop watching you."`,
      `${interactingVampire.vampire_name}: "There's something different about you. Something I need."`,
      `${interactingVampire.vampire_name}: "I've been following your content every night..."`,
      `${interactingVampire.vampire_name}: "You have no idea what you do to me."`
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    await base44.entities.NightLog.create({
      entry: `${human.name} received a DM on OnlyMortals: ${message}`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    alert(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">OnlyMortals</h2>
              <p className="text-gray-400 text-sm">Share content • Earn money</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!myAccount ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Start Your OnlyMortals</h3>
            <p className="text-gray-400 mb-6">Share photos, videos, and exclusive content. Earn money from subscribers.</p>
            <button
              onClick={createAccount}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold"
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-3 text-center">
                <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-white font-bold">${myAccount.revenue || 0}</p>
                <p className="text-gray-400 text-xs">Earned</p>
              </div>
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-center">
                <Eye className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-bold">{myAccount.subscriber_count || 0}</p>
                <p className="text-gray-400 text-xs">Subscribers</p>
              </div>
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 text-center">
                <Camera className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-white font-bold">{posts.length}</p>
                <p className="text-gray-400 text-xs">Posts</p>
              </div>
            </div>

            {/* Vampire Visitor Alert */}
            {interactingVampire && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 border border-red-500/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Flame className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-red-300 font-bold">🦇 Vampire Subscriber</p>
                    <p className="text-gray-400 text-sm">{interactingVampire.vampire_name} is obsessed with your content</p>
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Read Their DM
                </button>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 ${activeTab === 'create' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 ${activeTab === 'posts' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 ${activeTab === 'subscribers' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
              >
                Subscribers
              </button>
            </div>

            {/* Create Tab */}
            {activeTab === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Content Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['photo', 'video', 'exclusive'].map(type => (
                      <button
                        key={type}
                        onClick={() => setNewPost({ ...newPost, type })}
                        className={`py-2 rounded-lg capitalize ${
                          newPost.type === type
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Caption..."
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-pink-500/30 focus:border-pink-500 focus:outline-none"
                />

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Price: ${newPost.price}</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={newPost.price}
                    onChange={(e) => setNewPost({ ...newPost, price: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={createPost}
                  disabled={!newPost.caption || posting}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl font-bold"
                >
                  {posting ? 'Posting...' : 'Post Content'}
                </button>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="bg-gray-800/50 border border-pink-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{post.caption}</p>
                        <p className="text-gray-400 text-sm capitalize">{post.content_type}</p>
                      </div>
                      <span className="text-green-400 font-bold">${post.price}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>👁️ {post.views || 0} views</span>
                      <span>❤️ {post.likes || 0} likes</span>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No posts yet</p>
                )}
              </div>
            )}

            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
              <div className="space-y-4">
                {vampire && (
                  <button
                    onClick={vampireVisits}
                    className="w-full bg-red-950/40 border border-red-500/30 rounded-xl p-4 hover:bg-red-950/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-white font-bold">🦇 A vampire is watching...</p>
                        <p className="text-gray-400 text-sm">They're obsessed with you</p>
                      </div>
                      <Eye className="w-6 h-6 text-red-400" />
                    </div>
                  </button>
                )}

                {interactingVampire && (
                  <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🦇</span>
                      </div>
                      <div>
                        <p className="text-white font-bold">{interactingVampire.vampire_name}</p>
                        <p className="text-purple-400 text-sm">New subscriber • Very active</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm italic">
                      "This vampire watches all your content. They're completely obsessed with you."
                    </p>
                  </div>
                )}

                {!interactingVampire && (
                  <p className="text-gray-500 text-center py-8">No active subscribers yet</p>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}