import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaReply, FaPaperPlane, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import defaultProfilePic from '../../assets/default-profile.svg';

const Comment = ({ comment, onReply }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <motion.div
      className="flex space-x-3 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0">
        {comment.user.avatar ? (
          <img
            className="h-10 w-10 rounded-full"
            src={comment.user.avatar}
            alt={comment.user.name}
          />
        ) : (
          <img
            className="h-10 w-10 rounded-full"
            src={defaultProfilePic}
            alt={comment.user.name || 'User'}
          />
        )}
      </div>
      <div className="flex-grow">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium text-gray-900">{comment.user.name}</span>
              {comment.user.role === 'department' && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Department Official
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <FaClock className="mr-1" />
              {timeAgo(comment.createdAt)}
            </div>
          </div>
          <p className="mt-1 text-gray-800">{comment.text}</p>
        </div>

        <div className="mt-1 flex items-center pl-2">
          <button
            onClick={() => onReply(comment)}
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center"
          >
            <FaReply className="mr-1" />
            Reply
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ml-6 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  {reply.user.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={reply.user.avatar}
                      alt={reply.user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaUserCircle className="text-blue-600 text-xl" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900">{reply.user.name}</span>
                        {reply.user.role === 'department' && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Department Official
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <FaClock className="mr-1" />
                        {timeAgo(reply.createdAt)}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">{reply.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CommentBox = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Fetch comments for the issue
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await axios.get(`/api/issues/${issueId}/comments`);
        // setComments(response.data);

        // Mock data for demo
        setTimeout(() => {
          setComments([
            {
              id: '1',
              text: 'This issue has been happening for weeks now. I hope it gets fixed soon!',
              createdAt: '2023-04-10T14:30:00Z',
              user: {
                id: '101',
                name: 'Jane Citizen',
                role: 'citizen'
              },
              replies: [
                {
                  id: '3',
                  text: 'Thank you for reporting this issue. We have scheduled a team to look into it next week.',
                  createdAt: '2023-04-11T10:15:00Z',
                  user: {
                    id: '201',
                    name: 'Public Works Department',
                    role: 'department'
                  }
                }
              ]
            },
            {
              id: '2',
              text: 'I noticed this too. It\'s getting worse with the recent rain.',
              createdAt: '2023-04-10T16:45:00Z',
              user: {
                id: '102',
                name: 'John Doe',
                role: 'citizen'
              },
              replies: []
            },
          ]);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setLoading(false);
      }
    };

    fetchComments();
  }, [issueId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    if (!user) {
      alert('Please login to add a comment');
      return;
    }

    try {
      setIsSubmitting(true);

      const commentData = {
        text: newComment.trim(),
        issueId,
        userId: user.id,
        parentId: replyTo ? replyTo.id : null,
        createdAt: new Date().toISOString()
      };

      // TODO: Replace with actual API call
      // const response = await axios.post(`/api/issues/${issueId}/comments`, commentData);
      // const newCommentData = response.data;

      // Simulate API call and response
      setTimeout(() => {
        const tempId = Date.now().toString();

        if (replyTo) {
          // Add reply to existing comment
          setComments(prevComments =>
            prevComments.map(comment => {
              if (comment.id === replyTo.id) {
                const replies = comment.replies || [];
                return {
                  ...comment,
                  replies: [
                    ...replies,
                    {
                      id: tempId,
                      text: newComment.trim(),
                      createdAt: new Date().toISOString(),
                      user: {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar
                      }
                    }
                  ]
                };
              }
              return comment;
            })
          );
        } else {
          // Add new top-level comment
          setComments(prevComments => [
            ...prevComments,
            {
              id: tempId,
              text: newComment.trim(),
              createdAt: new Date().toISOString(),
              user: {
                id: user.id,
                name: user.name,
                role: user.role,
                avatar: user.avatar
              },
              replies: []
            }
          ]);
        }

        // Reset form
        setNewComment('');
        setReplyTo(null);
        setIsSubmitting(false);
      }, 800);

    } catch (err) {
      console.error('Error posting comment:', err);
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    // Focus the comment input
    document.getElementById('comment-input').focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ maxWidth: '100%', maxHeight: '100%' }}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Comments</h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReply={handleReply}
              />
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmitComment}>
            <div className="mt-4">
              {replyTo && (
                <div className="mb-2 p-2 bg-blue-50 rounded-md flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Replying to <span className="font-medium">{replyTo.user.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={defaultProfilePic}
                      alt={user.name || 'User'}
                    />
                  )}
                </div>

                <div className="flex-grow">
                  <textarea
                    id="comment-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={replyTo ? `Reply to ${replyTo.user.name}...` : "Add a comment..."}
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                  ></textarea>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Posting...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaPaperPlane className="mr-2" />
                          {replyTo ? 'Reply' : 'Comment'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-600">Please <a href="/login" className="text-blue-600 hover:underline">login</a> to add a comment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentBox;
