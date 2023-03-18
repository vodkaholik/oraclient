import React, { useCallback, useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./comment.scss";
import axios from "axios";
import Reply from "../Reply/Reply";
import { useTranslation } from "react-i18next";
const Comment = ({ comment, postId, isAdmin, currentUser, slug }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [voteCount, setVoteCount] = useState(null);
    const [newReply, setNewReply] = useState(null);
    const [reply, setReply] = useState({});
    const [replies, setReplies] = useState([]);
    const [activeReply, setActiveReply] = useState(false);
    const [activeEdit, setActiveEdit] = useState(false);
    const [voteCountUpdate, setVoteCountUpdate] = useState([]);
    const [isUserCmt, setIsUserCmt] = useState(false);
    let date = new Date(comment.createdAt);
    const handleVote = useCallback(
        async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
            const option = {
                method: "post",
                url: `/api/v1/comment/vote/`,
                data: {
                    commentId: comment._id,
                },
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };
            const res = await axios(option);
            setVoteCountUpdate(res.data.data.voteCount);
        },
        [comment._id]
    );
    const getAllComments = useCallback(async () => {
        if (comment._id) {
            try {
                const option = {
                    method: "get",
                    url: `/api/v1/reply/${comment._id}`,
                };
                const res = await axios(option);
                setReplies(res.data.data.reply);
               
            } catch (err) {}
        }
    }, [comment._id]);
    useEffect(() => {
        getAllComments();
        if (newReply) {
            getAllComments();
        }
    }, [getAllComments, newReply]);
    useEffect(() => {
        if (voteCountUpdate) {
            setVoteCount(voteCountUpdate.length);
        }
    }, [voteCountUpdate]);
    useEffect(() => {
        if (comment.voteCount) {
            setVoteCount(comment.voteCount.length);
        }
    }, [comment.voteCount]);
    const handelVisible = () => setActiveReply(!activeReply);
    const handelVisibleEdit = () => {
        setActiveEdit(!activeEdit);
        setReply(comment);
    }
    const handleSumit = useCallback((e) => {
        e.preventDefault();
    }, []);
    const handleSubmitReply = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                const token = localStorage.getItem("token");
                const option = {
                    method: "post",
                    url: `/api/v1/reply/${comment._id}`,
                    data: {
                        reply,
                        postId,
                    },
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios(option);
                setNewReply(res.data.data.reply);
                setActiveReply(false);
                setReply({});
            } catch (err) {}
        },
        [comment._id, reply]
    );
    useEffect(() => {
        if (currentUser.currentUser) {
       
            if (comment.author._id === currentUser.currentUser._id) {
                setIsUserCmt(true);
            }
        }
    }, [comment, currentUser]);
    const handleDelete = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                const token = localStorage.getItem("token");
                const option = {
                    method: "post",
                    url: `/api/v1/comment/delete`,
                    data: {
                        commentId: comment._id,
                       
                    },
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios(option);
              if (res) window.location.reload(false);
               
            } catch (err) {}
        },
        [comment._id]
    );
    const handleEdit = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                const token = localStorage.getItem("token");
                const option = {
                    method: "put",
                    url: `/api/v1/comment/edit`,
                    data: {
                        commentId: comment._id,
                        content: reply.content
                    },
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios(option);
                if (res.data.data) window.location.reload(false);
               
            } catch (err) {}
        },
        [comment._id, reply]
    );
    const replyNotofication = useCallback(async () => {
        if (newReply) {
            const token = localStorage.getItem("token");
            try {
                const option = {
                    method: "post",
                    url: `/api/v1/notifications/`,
                    data: {
                        postId: newReply.post,
                        replyId: newReply._id,
                        user: comment.author._id,
                        commentId: newReply.parent_id,

                    },
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                };
                await axios(option);
                navigate(`/post/${slug}`);
            } catch (err) {}
        }
    }, [newReply, navigate]);
    useEffect(() => {
        replyNotofication();
    }, [replyNotofication]);
    return (
        <div className="comment__child">
            <div className="comment__child-avt">
                <Link to={`/user/${comment.author.userName}`}>
                    <img
                        src={comment.author.avatar ? `https://${comment.author.avatar.slice(7)}` : "/icons/avatar.png"}
                        alt=""
                    />
                </Link>
            </div>
            <div className="comment__child-body">
                <div className="creator-info">
                    <Link to={`/user/${comment.author.userName}`}>
                        <span className="name-main">
                            {comment.author.displayName ? comment.author.displayName : comment.author.userName}
                        </span>
                    </Link>
                    <div className="metadata">
                        <span className="date">{`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}</span>
                    </div>
                    <div className="comment__child-content">{comment.content}</div>
                    <div className="comment__child-actions">
                        <div className="vote">
                            <div className="upvote" onClick={handleVote}>
                                <div className="vote-icon">
                                    <i className="bx bxs-up-arrow"></i>
                                </div>
                            </div>
                            <div></div>
                            <span className="value">{voteCount}</span>
                        </div>
                        <p style={{padding:"10px"}} onClick={handelVisible}>{t("reply")}</p>
                        { isAdmin||isUserCmt ? (
                           <div> <Link to={`/`}
                                onClick={handleDelete}
                            >
                                {t("delete")}
                            </Link></div>
                           
                        ) : (
                            ""
                        )}
                        {isUserCmt ? (
                         <div onClick={handelVisibleEdit} style={{padding:"8px"}}>
                            
                         {t("edit")}
                         
                     </div> )
                        : ("") 
                        }
                    
                       
                    </div>
                </div>
                
            </div>
            {activeEdit ? (
                <div className="action-reply">
                    <div className="reply-comment">
                        <div className="reply-comment-form">
                            <form action="" className="comment__form" onSubmit={handleSumit}>
                                <textarea
                                    className="comment__form-data"
                                    value={reply.content}
                                    onChange={(e) =>
                                        setReply({
                                            ...reply,
                                            content: e.target.value,
                                        })
                                    }
                                ></textarea>
                                <div className="comment__form-actions" onClick={handleEdit}>
                                    <div className="comment__form-actions-submit">{t("send")}</div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            {activeReply ? (
                <div className="action-reply">
                    <div className="reply-comment">
                        <div className="reply-comment-form">
                            <form action="" className="comment__form" onSubmit={handleSumit}>
                                <textarea
                                    className="comment__form-data"
                                    placeholder={t("replythiscomment")}
                                    value={reply.content}
                                    onChange={(e) =>
                                        setReply({
                                            ...reply,
                                            content: e.target.value,
                                        })
                                    }
                                ></textarea>
                                <div className="comment__form-actions" onClick={handleSubmitReply}>
                                    <div className="comment__form-actions-submit">{t("send")}</div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="comments-reply">
                {replies?.reverse().map((reply) => (
                    <Reply 
                    currentUser={currentUser}
                    reply={reply} 
                    visible={handelVisible} 
                    key={reply._id}
                    isAdmin={isAdmin}
                     />
                ))}
            </div>
        </div>
    );
};

export default Comment;
