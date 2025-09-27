import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaReply, FaPaperPlane, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import defaultProfilePic from '../../assets/default-profile.svg';
import { getCommentsByIssue, createComment as createCommentApi } from '../../services/commentService';

const timeAgo = (date) => {
  if (!date) return '';
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

const Comment = ({ comment, onReply }) => {
  return (
    <motion.div className="flex space-x-3 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex-shrink-0">
        {comment.user?.profileImage ? (
          <img className="h-10 w-10 rounded-full" src={comment.user.profileImage} alt={comment.user.name} />
        ) : (
          <img className="h-10 w-10 rounded-full" src={defaultProfilePic} alt={comment.user?.name || 'User'} />
        )}
      </div>

      <div className="flex-grow">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium text-gray-900">{comment.user?.name}</span>
              {comment.user?.role === 'department' && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Department Official</span>
              )}
            </div>

            <div className="text-xs text-gray-500 flex items-center">
              <FaClock className="mr-1" />
              {timeAgo(comment.createdAt)}
            </div>
          </div>

          <div className="mt-2 text-gray-800 whitespace-pre-wrap">{comment.text}</div>

          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <button onClick={() => onReply(comment)} className="flex items-center space-x-1 hover:text-blue-600">
              <FaReply />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-12 space-y-3">
            {comment.replies.map((r) => (
              <div key={r._id || r.id} className="bg-gray-50 p-2 rounded-md">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {r.user?.profileImage ? (
                      <img className="h-8 w-8 rounded-full" src={r.user.profileImage} alt={r.user.name} />
                    ) : (
                      <img className="h-8 w-8 rounded-full" src={defaultProfilePic} alt={r.user?.name || 'User'} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{r.user?.name}</div>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.text}</div>
                    <div className="text-xs text-gray-500 mt-1">{timeAgo(r.createdAt)}</div>
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

  // Helpful keywords users can click to insert into the comment box
  const keywordSuggestions = [
    'Pothole',
    'Streetlight',
    'Garbage',
    'Waterlogging',
    'Traffic',
    'Blocked Drain',
    'Urgent',
    'Minor',
    'Intersection',
    'Near School',
    'Repair Needed',
  ];
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
  const data = await getCommentsByIssue(issueId);
  setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (issueId) fetchComments();
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
        issue: issueId,
        parentComment: replyTo ? (replyTo._id || replyTo.id) : null,
      };

      // Create comment via API
      const created = await createCommentApi(commentData);

      // Refresh comments to ensure consistent ordering/structure
      try {
        const refreshed = await getCommentsByIssue(issueId);
        setComments(Array.isArray(refreshed) ? refreshed : refreshed || []);
      } catch (e) {
        // Fallback: optimistically append created comment if refresh fails
        if (created) {
          if (replyTo) {
            setComments((prev) =>
              prev.map((c) => {
                const cid = c._id || c.id;
                const rid = replyTo._id || replyTo.id;
                if (String(cid) === String(rid)) {
                  return { ...c, replies: [...(c.replies || []), created] };
                }
                return c;
              })
            );
          } else {
            setComments((prev) => [...prev, created]);
          }
        }
      }

      // Notify other tabs/components to refresh caches
      try {
        localStorage.setItem('issuesInvalidateTs', String(Date.now()));
      } catch {}
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    const el = document.getElementById('comment-input');
    if (el) el.focus();
  };

  const insertKeyword = (kw) => {
    // append keyword with spacing and preserve caret at end
    setNewComment((prev) => (prev ? prev + (prev.endsWith(' ') ? '' : ' ') + kw + ' ' : kw + ' '));
    const el = document.getElementById('comment-input');
    if (el) {
      // small timeout to allow state update then focus
      setTimeout(() => el.focus(), 0);
    }
  };

  const cancelReply = () => setReplyTo(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Comments</h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <Comment key={comment._id || comment.id} comment={comment} onReply={handleReply} />
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmitComment}>
            <div className="mt-4">
              {replyTo && (
                <div className="mb-2 p-2 bg-blue-50 rounded-md flex justify-between items-center">
                  <span className="text-sm text-gray-700">Replying to <span className="font-medium">{replyTo.user?.name}</span></span>
                  <button type="button" onClick={cancelReply} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              )}

              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                  ) : (
                    <img className="h-10 w-10 rounded-full" src={defaultProfilePic} alt={user.name || 'User'} />
                  )}
                </div>

                <div className="flex-grow">
                  <textarea
                    id="comment-input"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={replyTo ? `Reply to ${replyTo.user?.name}... (eg. 'Pothole, Near School, Urgent')` : "Add a comment... Try including keywords: type (Pothole/Streetlight), location (Near School/Intersection), severity (Urgent/Minor)"}
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                  />

                  {/* Keyword suggestion chips */}
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Suggested keywords — click to insert:</div>
                    <div className="flex flex-wrap gap-2">
                      {keywordSuggestions.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => insertKeyword(kw)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-200"
                          aria-label={`Insert keyword ${kw}`}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Tip: Describe what happened, where exactly it is, and how urgent it is.</div>
                  </div>

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
                        <span className="flex items-center"><FaPaperPlane className="mr-2" />{replyTo ? 'Reply' : 'Comment'}</span>
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
