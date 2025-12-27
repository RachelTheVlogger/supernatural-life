import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Instagram, Heart, MessageCircle, Eye, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HumanSocialMedia({ human, onClose }) {
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(Math.floor(Math.random() * 500) + 100);
  const [newPost, setNewPost] = useState('');
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const postContent = async () => {
    if (!newPost) return;

    const likes = Math.floor(Math.random() * 100) + 20;
    const comments = Math.floor(Math.random() * 20) + 3;
    
    // Vampire might see and interact
    const vampireSees = vampire && Math.random() > 0.6;
    const vampireLikes = vampireSees && Math.random() > 0.5;
    const vampireComments = vampireSees && Math.random() > 0.7;

    const post = {
      id: Date.now(),
      content: newPost,
      likes: vampireLikes ? likes + 1 : likes,
      comments: vampireComments ? comments + 1 : comments,
      vampireLiked: vampireLikes,
      vampireComment: vampireComments,
      timestamp: Date.now()
    };

    setPosts([post, ...posts]);
    setFollowers(prev => prev + Math.floor(Math.random() * 10));
    setNewPost('');

    let outcome = `Posted!\n\n${likes} likes, ${comments} comments`;

    if (vampireLikes || vampireComments) {
      outcome += `\n\n${vampire.vampire_name} interacted with your post.`;
      
      if (vampireComments) {
        const comments = [
          '"Beautiful."',
          '"Interesting perspective..."',
          '"I\'ve been following your posts."',
          '"You have a way with words."'
        ];
        outcome += `\n\nThey commented: ${comments[Math.floor(Math.random() * comments.length)]}`;
      } else {
        outcome += '\n\nThey liked it.';
      }

      outcome += '\n\nYour heart raced when you saw the notification.';

      await base44.entities.Human.update(human.id, {
        obsession_level: Math.min(100, (human.obsession_level || 0) + 10),
        awareness_level: Math.min(100, (human.awareness_level || 0) + 5)
      });
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} posted on social media${vampireLikes || vampireComments ? ` - ${vampire.vampire_name} interacted` : ''}`,
      category: 'interaction',
      intensity: vampireLikes || vampireComments ? 'moderate' : 'subtle'
    });

    queryClient.invalidateQueries();
    alert(outcome);
  };

  const stalkVampire = async () => {
    if (!vampire) {
      alert('No vampire to stalk...');
      return;
    }

    const outcomes = [
      {
        text: `You scrolled through ${vampire.vampire_name}'s profile.\n\nEvery photo. Every post. Every like.\n\nYou've memorized it all.\n\nThey posted 2 hours ago. You screenshot it.`,
        obsessionGain: 15
      },
      {
        text: `${vampire.vampire_name} posted a story.\n\nYou watched it 7 times.\n\nAnalyzed every detail. Every background element.\n\nWhere were they? Who were they with?`,
        obsessionGain: 20
      },
      {
        text: `You saw ${vampire.vampire_name} liked someone else's photo.\n\nJealousy flared. Hot and sharp.\n\nWho is that? Why did they like it?\n\nYou stalked that profile too.`,
        obsessionGain: 25
      },
      {
        text: `${vampire.vampire_name}'s profile picture changed.\n\nYou saved the old one. And the new one.\n\nYou have a folder. It's... extensive.`,
        obsessionGain: 18
      }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    await base44.entities.Human.update(human.id, {
      obsession_level: Math.min(100, (human.obsession_level || 0) + outcome.obsessionGain),
      vampire_encounters: (human.vampire_encounters || 0) + 1
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} stalked ${vampire.vampire_name}'s social media obsessively`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    alert(outcome.text);
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
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Social Media</h2>
              <p className="text-gray-400 text-sm">Your online presence</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-white font-bold">{followers}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </div>
          <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-3 text-center">
            <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-white font-bold">{posts.length}</p>
            <p className="text-gray-400 text-xs">Posts</p>
          </div>
        </div>

        {/* New post */}
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3">Create Post</h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-purple-500/30 focus:border-purple-500 focus:outline-none text-sm mb-3"
          />
          <button
            onClick={postContent}
            disabled={!newPost}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-2 rounded-xl font-bold"
          >
            Post
          </button>
        </div>

        {vampire && (
          <button
            onClick={stalkVampire}
            className="w-full bg-red-950/40 border border-red-500/30 hover:bg-red-950/60 rounded-xl p-3 mb-6 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5 text-red-400" />
            <span className="text-white font-bold">Stalk {vampire.vampire_name}'s Profile</span>
          </button>
        )}

        {/* Posts feed */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No posts yet</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4">
                <p className="text-white mb-3">{post.content}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className={`w-4 h-4 ${post.vampireLiked ? 'fill-pink-400' : ''}`} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>

                {post.vampireLiked && (
                  <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-2 mt-3">
                    <p className="text-purple-300 text-xs">
                      🦇 {vampire.vampire_name} liked this
                    </p>
                  </div>
                )}

                {post.vampireComment && (
                  <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-2 mt-3">
                    <p className="text-red-300 text-xs">
                      💬 {vampire.vampire_name} commented on this
                    </p>
                  </div>
                )}

                <p className="text-gray-500 text-xs mt-2">
                  {new Date(post.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}