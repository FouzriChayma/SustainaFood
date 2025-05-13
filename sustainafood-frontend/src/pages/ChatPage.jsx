import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import SpeechButton from "../components/SpeechButton";
import "../assets/styles/ChatPage.css";
import pdp from "../assets/images/pdp.png";
import { getUserById } from "../api/userService";

const socket = io("http://localhost:3000", { autoConnect: false });

const ChatPage = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const chatId = authUser && recipientId ? [authUser._id || authUser.id, recipientId].sort().join("_") : null;

  useEffect(() => {
    if (!authUser) {
      setError("You must be logged in to access the chat.");
      return;
    }

    const fetchRecipient = async () => {
      try {
        const response = await getUserById(recipientId);
        setRecipient(response.data);
      } catch (err) {
        setError("Unable to load recipient information.");
      }
    };

    fetchRecipient();

    if (chatId) {
      socket.auth = { token: authUser.token };
      socket.connect();
      socket.emit("joinChat", chatId);

      fetch(`http://localhost:3000/messages/${chatId}/messages`, {
        headers: { "X-User-Id": authUser?._id || authUser?.id },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error fetching messages");
          return res.json();
        })
        .then(async (data) => {
          setMessages(data);
          const unreadMessages = data.filter(
            (msg) => msg.receiver._id === (authUser?._id || authUser?.id) && !msg.read
          );
          if (unreadMessages.length > 0) {
            await fetch(`http://localhost:3000/messages/${chatId}/mark-as-read`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-User-Id": authUser?._id || authUser?.id,
              },
            });
          }
        })
        .catch((error) => setError(error.message));

      socket.on("message", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on("typing", ({ userId }) => {
        if (userId !== (authUser?._id || authUser?.id)) setIsTyping(true);
      });

      socket.on("stopTyping", ({ userId }) => {
        if (userId !== (authUser?._id || authUser?.id)) setIsTyping(false);
      });

      return () => {
        socket.off("message");
        socket.off("typing");
        socket.off("stopTyping");
        socket.disconnect();
      };
    }
  }, [chatId, authUser, recipientId]);

  useEffect(() => {
    const messageList = document.querySelector(".chat-messages");
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !authUser) return;
    try {
      const response = await fetch(`http://localhost:3000/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": authUser?._id || authUser?.id,
        },
        body: JSON.stringify({ chatId, receiver: recipientId, content: newMessage }),
      });
      if (response.ok) {
        setNewMessage("");
        socket.emit("stopTyping", { chatId, userId: authUser?._id || authUser?.id });
      } else {
        setError("Error sending message");
      }
    } catch (error) {
      setError("Network error: " + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!chatId || !authUser) return;
    socket.emit("typing", { chatId, userId: authUser?._id || authUser?.id });
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => socket.emit("stopTyping", { chatId, userId: authUser?._id || authUser?.id }), 2000);
    setTypingTimeout(timeout);
  };

  const generateChatText = () => {
    const messagesText = messages.length
      ? `Conversation with ${recipient?.name}: ${messages
          .map((msg) => `${msg.sender._id === (authUser?._id || authUser?.id) ? "You" : msg.sender.name}: ${msg.content}`)
          .join(". ")}`
      : `No conversation ongoing with ${recipient?.name}.`;
    return `Chat with ${recipient?.name}. ${messagesText}`;
  };

  const recipientPhotoUrl = recipient?.photo ? `http://localhost:3000/${recipient.photo}` : pdp;

  if (error) return <div className="chat-error">{error}</div>;
  if (!recipient) return <div className="chat-loading">Loading...</div>;

  return (
    <div className="chat-main">
      <div className="chat-header">
        <img src={recipientPhotoUrl} alt={`Profile photo of ${recipient.name}`} className="chat-header-photo" />
        <h2>{recipient.name}</h2>
        <button className="chat-back-btn" onClick={() => navigate("/messaging")} aria-label="Back">
          Back
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`chat-message ${msg.sender._id === (authUser?._id || authUser?.id) ? "sent" : "received"}`}
          >
            <div className="chat-message-content">
              {msg.content}
              <span className="chat-message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message received">
            <div className="chat-message-content">
              <span>{recipient?.name} is typing...</span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <SpeechButton textToRead={generateChatText()} />
        <textarea
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Write a message..."
          className="chat-input"
          aria-label="Message input field"
        />
        <button onClick={sendMessage} className="chat-send-btn" aria-label="Send message">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;