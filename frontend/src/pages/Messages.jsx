import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Send, ArrowLeft, User } from 'lucide-react'

const Messages = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations')
      setConversations(response.data.conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId, propertyId) => {
    try {
      const params = new URLSearchParams()
      if (propertyId) params.append('property_id', propertyId)
      const response = await api.get(`/messages/${userId}?${params.toString()}`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.user.id, conversation.property_id)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      await api.post('/messages', {
        receiver_id: selectedConversation.user.id,
        content: newMessage,
        property_id: selectedConversation.property_id
      })
      setNewMessage('')
      fetchMessages(selectedConversation.user.id, selectedConversation.property_id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleBack = () => {
    setSelectedConversation(null)
    setMessages([])
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {!selectedConversation ? (
          /* Conversations List */
          <div className="h-full">
            {conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from a property page</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-primary-100 rounded-full p-3 mr-4">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{conversation.user.full_name}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(conversation.last_message_time).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm truncate mt-1">
                          {conversation.last_message}
                        </p>
                        {conversation.property_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Regarding Property #{conversation.property_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat View */
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center">
              <button onClick={handleBack} className="mr-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-full p-2 mr-3">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.user.full_name}</h3>
                  {selectedConversation.property_id && (
                    <p className="text-xs text-gray-500">Property #{selectedConversation.property_id}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.id ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
