



// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import {
//   Search,
//   Filter,
//   Star,
//   MoreVertical,
//   Paperclip,
//   Image as ImageIcon,
//   FileText,
//   Smile,
//   Send,
//   Download,
//   Calendar,
//   CheckCheck,
//   Menu,
//   ChevronLeft,
//   Plus,
//   Users,
//   X,
//   UserPlus,
//   Phone,
//   Info,
// } from "lucide-react";

// const INITIAL_CONVERSATIONS = [
//   {
//     id: 1,
//     name: "Ayesha Siddiqui",
//     phone: "+92 300 1234567",
//     email: "ayesha.siddiqui@email.com",
//     role: "Customer",
//     avatarBg: "bg-emerald-100 text-emerald-600",
//     initials: "AS",
//     lastMsg: "Thank you for the update.",
//     time: "3:15 PM",
//     unread: 0,
//     type: "direct",
//     messages: [
//       {
//         id: 101,
//         sender: "them",
//         senderName: "Ayesha Siddiqui",
//         text: "Hi Admin, I need help with my account setup.",
//         time: "2:45 PM",
//         type: "text",
//       },
//       {
//         id: 102,
//         sender: "me",
//         text: "Hello Ayesha, sure! I'll help you with that.",
//         time: "2:46 PM",
//         type: "text",
//       },
//       {
//         id: 103,
//         sender: "them",
//         senderName: "Ayesha Siddiqui",
//         text: "Thank you for the update.",
//         time: "3:15 PM",
//         type: "text",
//       },
//     ],
//   },
//   {
//     id: 2,
//     name: "Muhammad Rizwan",
//     phone: "+92 321 7654321",
//     email: "m.rizwan@email.com",
//     role: "Customer",
//     avatarBg: "bg-purple-100 text-purple-600",
//     initials: "MR",
//     lastMsg: "Please find the report attached.",
//     time: "3:05 PM",
//     unread: 1,
//     type: "direct",
//     messages: [
//       {
//         id: 201,
//         sender: "them",
//         senderName: "Muhammad Rizwan",
//         text: "Please find the report attached.",
//         time: "3:05 PM",
//         type: "text",
//       },
//     ],
//   },
// ];

// export default function MessagesDashboard() {
//   const [conversations, setConversations] = useState([]);
//   const [activeTab, setActiveTab] = useState("All");
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [inputMessage, setInputMessage] = useState("");
//   const [showMobileChat, setShowMobileChat] = useState(false);

//   // Group Modal States
//   const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
//   const [groupName, setGroupName] = useState("");
//   const [selectedMembers, setSelectedMembers] = useState([]);
//   const [customName, setCustomName] = useState("");
//   const [customPhone, setCustomPhone] = useState("");
//   const [customMembersList, setCustomMembersList] = useState([]);

//   // Existing Group Modals
//   const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
//   const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
//   const [newMemberName, setNewMemberName] = useState("");
//   const [newMemberPhone, setNewMemberPhone] = useState("");

//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   // Load from LocalStorage
//   useEffect(() => {
//     const savedChats = localStorage.getItem("crm_chats");
//     if (savedChats) {
//       const parsed = JSON.parse(savedChats);
//       setConversations(parsed);
//       setSelectedChat(parsed[0] || null);
//     } else {
//       setConversations(INITIAL_CONVERSATIONS);
//       setSelectedChat(INITIAL_CONVERSATIONS[0]);
//     }
//   }, []);

//   // Save to LocalStorage
//   useEffect(() => {
//     if (conversations.length > 0) {
//       localStorage.setItem("crm_chats", JSON.stringify(conversations));
//     }
//   }, [conversations]);

//   // Auto scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [selectedChat?.messages]);

//   const getCurrentTime = () => {
//     return new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleSelectChat = (chat) => {
//     setSelectedChat(chat);
//     setShowMobileChat(true);
//   };

//   // Send Text Message + Auto Reply (Simulation for testing left side replies)
//   const handleSendMessage = (e) => {
//     e?.preventDefault();
//     if (!inputMessage.trim() || !selectedChat) return;

//     const userText = inputMessage;
//     const currentChatId = selectedChat.id;

//     // 1. My Message (Right Side)
//     const newMsg = {
//       id: Date.now(),
//       sender: "me",
//       text: userText,
//       time: getCurrentTime(),
//       type: "text",
//     };

//     updateChatMessages(currentChatId, newMsg, userText);
//     setInputMessage("");

//     // 2. Simulated Left Side Reply (WhatsApp behavior) after 1.5 seconds
//     setTimeout(() => {
//       const replyMsg = {
//         id: Date.now() + 1,
//         sender: "them",
//         senderName: selectedChat.type === "group" ? "Group Member" : selectedChat.name,
//         text: `Received: "${userText}" - Thanks for messaging!`,
//         time: getCurrentTime(),
//         type: "text",
//       };
//       updateChatMessages(currentChatId, replyMsg, replyMsg.text);
//     }, 1500);
//   };

//   // File Upload
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file || !selectedChat) return;

//     const isImg = file.type.startsWith("image/");
//     const newMsg = {
//       id: Date.now(),
//       sender: "me",
//       text: file.name,
//       fileName: file.name,
//       fileSize: `${(file.size / 1024).toFixed(1)} KB`,
//       fileUrl: URL.createObjectURL(file),
//       time: getCurrentTime(),
//       type: isImg ? "image" : "file",
//     };

//     updateChatMessages(selectedChat.id, newMsg, isImg ? "[Image]" : file.name);
//     e.target.value = "";
//   };

//   const updateChatMessages = (chatId, newMsg, lastMsgText) => {
//     setConversations((prev) =>
//       prev.map((chat) => {
//         if (chat.id === chatId) {
//           const updatedMessages = [...(chat.messages || []), newMsg];
//           const updatedChat = {
//             ...chat,
//             lastMsg: lastMsgText,
//             time: newMsg.time,
//             messages: updatedMessages,
//           };
//           if (selectedChat?.id === chatId) {
//             setSelectedChat(updatedChat);
//           }
//           return updatedChat;
//         }
//         return chat;
//       })
//     );
//   };

//   // Add Member to Existing Group
//   const handleAddMemberToExistingGroup = (e) => {
//     e.preventDefault();
//     if (!newMemberName.trim() || !newMemberPhone.trim() || !selectedChat) return;

//     const newMemberObj = {
//       id: Date.now(),
//       name: newMemberName,
//       phone: newMemberPhone,
//       role: "Member",
//       avatarBg: "bg-emerald-100 text-emerald-600",
//       initials: newMemberName.slice(0, 2).toUpperCase(),
//     };

//     const updatedMembers = [...(selectedChat.members || []), newMemberObj];
//     const systemMsg = {
//       id: Date.now(),
//       sender: "system",
//       text: `${newMemberName} (${newMemberPhone}) was added to the group.`,
//       time: getCurrentTime(),
//       type: "text",
//     };

//     setConversations((prev) =>
//       prev.map((chat) => {
//         if (chat.id === selectedChat.id) {
//           const updatedChat = {
//             ...chat,
//             members: updatedMembers,
//             messages: [...(chat.messages || []), systemMsg],
//           };
//           setSelectedChat(updatedChat);
//           return updatedChat;
//         }
//         return chat;
//       })
//     );

//     setNewMemberName("");
//     setNewMemberPhone("");
//     setIsAddMemberModalOpen(false);
//   };

//   // Custom Member for New Group Form
//   const handleAddCustomMember = () => {
//     if (!customName.trim() || !customPhone.trim()) return;

//     const newMember = {
//       id: Date.now(),
//       name: customName,
//       phone: customPhone,
//       role: "Contact",
//       avatarBg: "bg-blue-100 text-blue-600",
//       initials: customName.slice(0, 2).toUpperCase(),
//     };

//     setCustomMembersList([...customMembersList, newMember]);
//     setCustomName("");
//     setCustomPhone("");
//   };

//   const handleMemberToggle = (chatObj) => {
//     const exists = selectedMembers.some((m) => m.id === chatObj.id);
//     if (exists) {
//       setSelectedMembers(selectedMembers.filter((m) => m.id !== chatObj.id));
//     } else {
//       setSelectedMembers([...selectedMembers, chatObj]);
//     }
//   };

//   const handleCreateGroup = (e) => {
//     e.preventDefault();
//     if (!groupName.trim()) return;

//     const allGroupMembers = [...selectedMembers, ...customMembersList];

//     const newGroup = {
//       id: Date.now(),
//       name: groupName,
//       email: `${allGroupMembers.length} Members`,
//       role: "Group",
//       avatarBg: "bg-rose-100 text-rose-600",
//       initials: groupName.slice(0, 2).toUpperCase(),
//       lastMsg: "Group created",
//       time: getCurrentTime(),
//       type: "group",
//       members: allGroupMembers,
//       messages: [
//         {
//           id: Date.now(),
//           sender: "system",
//           text: `Group "${groupName}" created with ${allGroupMembers.length} members.`,
//           time: getCurrentTime(),
//           type: "text",
//         },
//       ],
//     };

//     const updated = [newGroup, ...conversations];
//     setConversations(updated);
//     setSelectedChat(newGroup);
//     setGroupName("");
//     setSelectedMembers([]);
//     setCustomMembersList([]);
//     setIsGroupModalOpen(false);
//   };

//   const filteredConversations = conversations.filter((chat) => {
//     if (activeTab === "Group") return chat.type === "group";
//     return true;
//   });

//   return (
//     <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileUpload}
//         className="hidden"
//       />

//       {/* Top Navbar */}
//       <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-2 sm:gap-3">
//           <Menu className="w-5 h-5 text-slate-500 cursor-pointer" />
//           <h1 className="font-semibold text-base sm:text-lg text-slate-800">
//             Messages Dashboard
//           </h1>
//         </div>

//         <div className="flex items-center gap-2 sm:gap-4">
//           <div className="hidden lg:flex bg-emerald-50 text-emerald-600 text-xs px-3 py-1.5 rounded-md font-medium items-center gap-1.5 border border-emerald-100">
//             <Calendar className="w-3.5 h-3.5" />
//             CRM Inbox
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-medium flex items-center justify-center text-xs">
//               M
//             </div>
//             <div className="text-left text-xs hidden sm:block">
//               <p className="font-semibold text-slate-700">M Aftab</p>
//               <p className="text-slate-400 text-[10px]">admin@callcrm.com</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Container */}
//       <div className="flex-1 flex overflow-hidden relative">
//         {/* Left Sidebar */}
//         <aside
//           className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${
//             showMobileChat ? "hidden md:flex" : "flex"
//           }`}
//         >
//           <div className="p-3 flex items-center gap-2">
//             <div className="relative flex-1">
//               <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search conversations..."
//                 className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//               />
//             </div>
//             <button className="p-1.5 text-slate-400 border border-slate-200 rounded-lg">
//               <Filter className="w-4 h-4" />
//             </button>
//           </div>

//           <div className="flex items-center justify-between border-b border-slate-200 px-3">
//             <div className="flex">
//               {["All", "Group"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
//                     activeTab === tab
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-500 hover:text-slate-700"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>

//             {activeTab === "Group" && (
//               <button
//                 onClick={() => setIsGroupModalOpen(true)}
//                 className="mb-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//                 Create Group
//               </button>
//             )}
//           </div>

//           <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
//             {filteredConversations.map((chat) => (
//               <div
//                 key={chat.id}
//                 onClick={() => handleSelectChat(chat)}
//                 className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
//                   selectedChat?.id === chat.id ? "bg-emerald-50/60" : "hover:bg-slate-50"
//                 }`}
//               >
//                 <div
//                   className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${chat.avatarBg}`}
//                 >
//                   {chat.type === "group" ? <Users className="w-4 h-4" /> : chat.initials}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-baseline mb-0.5">
//                     <h4 className="text-xs font-semibold text-slate-800 truncate">
//                       {chat.name}
//                     </h4>
//                     <span className="text-[10px] text-slate-400">{chat.time}</span>
//                   </div>
//                   <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </aside>

//         {/* Chat Screen */}
//         <section
//           className={`flex-1 flex flex-col bg-[#e5ddd5]/30 w-full h-full ${
//             !showMobileChat ? "hidden md:flex" : "flex"
//           }`}
//         >
//           {selectedChat ? (
//             <>
//               {/* Header */}
//               <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
//                 <div className="flex items-center gap-2 sm:gap-3">
//                   <button
//                     onClick={() => setShowMobileChat(false)}
//                     className="md:hidden p-1 text-slate-500"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>

//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedChat.avatarBg}`}
//                   >
//                     {selectedChat.type === "group" ? (
//                       <Users className="w-4 h-4" />
//                     ) : (
//                       selectedChat.initials
//                     )}
//                   </div>
//                   <div>
//                     <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">
//                       {selectedChat.name}
//                       {selectedChat.type === "group" && (
//                         <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-normal">
//                           Group
//                         </span>
//                       )}
//                     </h3>
//                     <p className="text-[10px] text-slate-400">
//                       {selectedChat.type === "group"
//                         ? `${selectedChat.members?.length || 0} Members`
//                         : selectedChat.email}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {selectedChat.type === "group" && (
//                     <div className="flex items-center gap-1.5">
//                       <button
//                         onClick={() => setIsAddMemberModalOpen(true)}
//                         className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
//                       >
//                         <UserPlus className="w-3.5 h-3.5" />
//                         Add Member
//                       </button>

//                       <button
//                         onClick={() => setIsGroupInfoOpen(true)}
//                         className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium"
//                       >
//                         <Info className="w-3.5 h-3.5 text-slate-500" />
//                         Members ({selectedChat.members?.length || 0})
//                       </button>
//                     </div>
//                   )}

//                   <Search className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600 ml-2" />
//                   <Star className="w-4 h-4 cursor-pointer text-slate-400 hover:text-amber-500" />
//                   <MoreVertical className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600" />
//                 </div>
//               </div>

//               {/* MESSAGES AREA - WHATSAPP STYLE LEFT & RIGHT */}
//               <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-100/50">
//                 {selectedChat.messages?.map((msg) => {
//                   const isMe = msg.sender === "me";
//                   const isSystem = msg.sender === "system";

//                   if (isSystem) {
//                     return (
//                       <div key={msg.id} className="text-center my-2">
//                         <span className="text-[10px] bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm">
//                           {msg.text}
//                         </span>
//                       </div>
//                     );
//                   }

//                   return (
//                     <div
//                       key={msg.id}
//                       className={`flex ${
//                         isMe ? "justify-end" : "justify-start"
//                       } items-end gap-2 w-full`}
//                     >
//                       {/* Left Avatar for Received Replies */}
//                       {!isMe && (
//                         <div
//                           className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mb-1 ${selectedChat.avatarBg}`}
//                         >
//                           {selectedChat.initials || "A"}
//                         </div>
//                       )}

//                       <div
//                         className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs shadow-sm ${
//                           isMe
//                             ? "bg-emerald-600 text-white rounded-br-none" // Right Side (My Message)
//                             : "bg-white text-slate-800 border border-slate-200 rounded-bl-none" // Left Side (Their Reply)
//                         }`}
//                       >
//                         {/* Group Sender Name on Left Side */}
//                         {!isMe && selectedChat.type === "group" && (
//                           <p className="text-[10px] font-bold text-emerald-600 mb-1">
//                             {msg.senderName || selectedChat.name}
//                           </p>
//                         )}

//                         {/* File Attachment */}
//                         {msg.type === "file" && (
//                           <div
//                             className={`p-2 rounded-lg flex items-center justify-between gap-2 mb-1 ${
//                               isMe ? "bg-emerald-700/50 text-white" : "bg-slate-100 text-slate-800"
//                             }`}
//                           >
//                             <div className="flex items-center gap-2 min-w-0">
//                               <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
//                               <div className="truncate">
//                                 <p className="font-semibold text-[11px] truncate">
//                                   {msg.fileName}
//                                 </p>
//                                 <p className="text-[9px] opacity-70">
//                                   {msg.fileSize}
//                                 </p>
//                               </div>
//                             </div>
//                             <a
//                               href={msg.fileUrl}
//                               download={msg.fileName}
//                               className="hover:opacity-80"
//                             >
//                               <Download className="w-4 h-4" />
//                             </a>
//                           </div>
//                         )}

//                         {/* Image Attachment */}
//                         {msg.type === "image" && (
//                           <div className="mb-1">
//                             <img
//                               src={msg.fileUrl}
//                               alt="attached"
//                               className="max-h-48 rounded-lg object-cover w-full mb-1"
//                             />
//                             <p className="text-[10px] opacity-80">{msg.fileName}</p>
//                           </div>
//                         )}

//                         {/* Text Content */}
//                         {msg.text && <p className="leading-relaxed">{msg.text}</p>}

//                         <div
//                           className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
//                             isMe ? "text-emerald-100" : "text-slate-400"
//                           }`}
//                         >
//                           <span>{msg.time}</span>
//                           {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Chat Input */}
//               <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
//                 <form
//                   onSubmit={handleSendMessage}
//                   className="bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-emerald-500"
//                 >
//                   <input
//                     type="text"
//                     placeholder="Type a message..."
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     className="w-full bg-transparent text-xs px-2 py-1 outline-none text-slate-700"
//                   />

//                   <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
//                     <div className="flex items-center gap-3 text-slate-400">
//                       <button type="button" className="hover:text-slate-600">
//                         <Smile className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="hover:text-slate-600"
//                       >
//                         <Paperclip className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="hover:text-slate-600"
//                       >
//                         <ImageIcon className="w-4 h-4" />
//                       </button>
//                     </div>

//                     <button
//                       type="submit"
//                       className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
//                     >
//                       <Send className="w-3.5 h-3.5" />
//                       Send
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
//               Select a conversation to start chatting
//             </div>
//           )}
//         </section>
//       </div>

//       {/* ADD MEMBER TO GROUP MODAL */}
//       {isAddMemberModalOpen && selectedChat?.type === "group" && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
//                 <UserPlus className="w-4 h-4 text-emerald-600" />
//                 Add Member to "{selectedChat.name}"
//               </h3>
//               <button
//                 onClick={() => setIsAddMemberModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleAddMemberToExistingGroup}
//               className="p-4 space-y-4"
//             >
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Member Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Enter Name"
//                   value={newMemberName}
//                   onChange={(e) => setNewMemberName(e.target.value)}
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="+92 300 0000000"
//                   value={newMemberPhone}
//                   onChange={(e) => setNewMemberPhone(e.target.value)}
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setIsAddMemberModalOpen(false)}
//                   className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   Add Member
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* CREATE GROUP MODAL */}
//       {isGroupModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
//                 <Users className="w-4 h-4 text-emerald-600" />
//                 Create New Group
//               </h3>
//               <button
//                 onClick={() => setIsGroupModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleCreateGroup}
//               className="p-4 space-y-4 overflow-y-auto flex-1"
//             >
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Group Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Group Name..."
//                   value={groupName}
//                   onChange={(e) => setGroupName(e.target.value)}
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
//                 <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
//                   <UserPlus className="w-3.5 h-3.5 text-blue-500" />
//                   Add Member by Phone
//                 </label>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                   <input
//                     type="text"
//                     placeholder="Member Name"
//                     value={customName}
//                     onChange={(e) => setCustomName(e.target.value)}
//                     className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Phone Number"
//                     value={customPhone}
//                     onChange={(e) => setCustomPhone(e.target.value)}
//                     className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleAddCustomMember}
//                   className="w-full mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
//                 >
//                   <Plus className="w-3 h-3" /> Add
//                 </button>
//               </div>

//               {customMembersList.length > 0 && (
//                 <div>
//                   <label className="block text-[11px] font-semibold text-slate-500 mb-1">
//                     Added Members ({customMembersList.length}):
//                   </label>
//                   <div className="flex flex-wrap gap-1.5">
//                     {customMembersList.map((m) => (
//                       <span
//                         key={m.id}
//                         className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
//                       >
//                         {m.name} ({m.phone})
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Select Existing Contacts
//                 </label>
//                 <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
//                   {conversations
//                     .filter((c) => c.type === "direct")
//                     .map((contact) => {
//                       const isChecked = selectedMembers.some(
//                         (m) => m.id === contact.id
//                       );
//                       return (
//                         <label
//                           key={contact.id}
//                           className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
//                         >
//                           <div className="flex items-center gap-2">
//                             <div
//                               className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${contact.avatarBg}`}
//                             >
//                               {contact.initials}
//                             </div>
//                             <div>
//                               <p className="text-xs text-slate-700 font-medium">
//                                 {contact.name}
//                               </p>
//                               <p className="text-[9px] text-slate-400">
//                                 {contact.phone || contact.email}
//                               </p>
//                             </div>
//                           </div>
//                           <input
//                             type="checkbox"
//                             checked={isChecked}
//                             onChange={() => handleMemberToggle(contact)}
//                             className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
//                           />
//                         </label>
//                       );
//                     })}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setIsGroupModalOpen(false)}
//                   className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   Create Group
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* VIEW MEMBERS MODAL */}
//       {isGroupInfoOpen && selectedChat?.type === "group" && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <div className="flex items-center gap-2">
//                 <Users className="w-4 h-4 text-emerald-600" />
//                 <h3 className="font-semibold text-sm text-slate-800">
//                   {selectedChat.name} Members
//                 </h3>
//               </div>
//               <button
//                 onClick={() => setIsGroupInfoOpen(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="p-4 max-h-80 overflow-y-auto space-y-2">
//               <p className="text-xs text-slate-400 font-medium mb-2">
//                 Total Members: {selectedChat.members?.length || 0}
//               </p>

//               {selectedChat.members?.length > 0 ? (
//                 selectedChat.members.map((member, idx) => (
//                   <div
//                     key={member.id || idx}
//                     className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
//                   >
//                     <div className="flex items-center gap-2 min-w-0">
//                       <div
//                         className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
//                           member.avatarBg || "bg-slate-200 text-slate-600"
//                         }`}
//                       >
//                         {member.initials || "M"}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs font-semibold text-slate-700 truncate">
//                           {member.name}
//                         </p>
//                         <p className="text-[10px] text-slate-400 flex items-center gap-1">
//                           <Phone className="w-2.5 h-2.5" />
//                           {member.phone || member.email || "No Phone"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-xs text-slate-400 text-center py-4">
//                   No members in this group.
//                 </p>
//               )}
//             </div>

//             <div className="p-3 border-t border-slate-100 flex justify-end">
//               <button
//                 onClick={() => setIsGroupInfoOpen(false)}
//                 className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import {
//   Search,
//   Filter,
//   Star,
//   MoreVertical,
//   Paperclip,
//   Image as ImageIcon,
//   FileText,
//   Smile,
//   Send,
//   Download,
//   Calendar,
//   CheckCheck,
//   Menu,
//   ChevronLeft,
//   Plus,
//   Users,
//   X,
//   UserPlus,
//   Phone,
//   Info,
// } from "lucide-react";

// const INITIAL_CONVERSATIONS = [
//   {
//     id: 1,
//     name: "Ayesha Siddiqui",
//     phone: "+92 300 1234567",
//     email: "ayesha.siddiqui@email.com",
//     role: "Customer",
//     avatarBg: "bg-emerald-100 text-emerald-600",
//     initials: "AS",
//     lastMsg: "Thank you for the update.",
//     time: "3:15 PM",
//     unread: 0,
//     type: "direct",
//     messages: [
//       {
//         id: 101,
//         sender: "them",
//         senderName: "Ayesha Siddiqui",
//         text: "Hi Admin, I need help with my account setup.",
//         time: "2:45 PM",
//         type: "text",
//       },
//       {
//         id: 102,
//         sender: "me",
//         text: "Hello Ayesha, sure! I'll help you with that.",
//         time: "2:46 PM",
//         type: "text",
//       },
//       {
//         id: 103,
//         sender: "them",
//         senderName: "Ayesha Siddiqui",
//         text: "Thank you for the update.",
//         time: "3:15 PM",
//         type: "text",
//       },
//     ],
//   },
//   {
//     id: 2,
//     name: "Muhammad Rizwan",
//     phone: "+92 321 7654321",
//     email: "m.rizwan@email.com",
//     role: "Customer",
//     avatarBg: "bg-purple-100 text-purple-600",
//     initials: "MR",
//     lastMsg: "Please find the report attached.",
//     time: "3:05 PM",
//     unread: 1,
//     type: "direct",
//     messages: [
//       {
//         id: 201,
//         sender: "them",
//         senderName: "Muhammad Rizwan",
//         text: "Please find the report attached.",
//         time: "3:05 PM",
//         type: "text",
//       },
//     ],
//   },
// ];

// export default function MessagesDashboard() {
//   const [conversations, setConversations] = useState([]);
//   const [activeTab, setActiveTab] = useState("All");
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [inputMessage, setInputMessage] = useState("");
//   const [showMobileChat, setShowMobileChat] = useState(false);

//   // Group Modal States
//   const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
//   const [groupName, setGroupName] = useState("");
//   const [selectedMembers, setSelectedMembers] = useState([]);
//   const [customName, setCustomName] = useState("");
//   const [customPhone, setCustomPhone] = useState("");
//   const [customMembersList, setCustomMembersList] = useState([]);

//   // Existing Group Modals
//   const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
//   const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
//   const [newMemberName, setNewMemberName] = useState("");
//   const [newMemberPhone, setNewMemberPhone] = useState("");

//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   // Load from LocalStorage
//   useEffect(() => {
//     const savedChats = localStorage.getItem("crm_chats");
//     if (savedChats) {
//       const parsed = JSON.parse(savedChats);
//       setConversations(parsed);
//       setSelectedChat(parsed[0] || null);
//     } else {
//       setConversations(INITIAL_CONVERSATIONS);
//       setSelectedChat(INITIAL_CONVERSATIONS[0]);
//     }
//   }, []);

//   // Save to LocalStorage
//   useEffect(() => {
//     if (conversations.length > 0) {
//       localStorage.setItem("crm_chats", JSON.stringify(conversations));
//     }
//   }, [conversations]);

//   // Auto scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [selectedChat?.messages]);

//   const getCurrentTime = () => {
//     return new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const handleSelectChat = (chat) => {
//     setSelectedChat(chat);
//     setShowMobileChat(true);
//   };

//   // Send Text Message (Only User Message - No Auto Reply)
//   const handleSendMessage = (e) => {
//     e?.preventDefault();
//     if (!inputMessage.trim() || !selectedChat) return;

//     const userText = inputMessage;
//     const currentChatId = selectedChat.id;

//     // My Message (Right Side)
//     const newMsg = {
//       id: Date.now(),
//       sender: "me",
//       text: userText,
//       time: getCurrentTime(),
//       type: "text",
//     };

//     updateChatMessages(currentChatId, newMsg, userText);
//     setInputMessage("");
//   };

//   // File Upload
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file || !selectedChat) return;

//     const isImg = file.type.startsWith("image/");
//     const newMsg = {
//       id: Date.now(),
//       sender: "me",
//       text: file.name,
//       fileName: file.name,
//       fileSize: `${(file.size / 1024).toFixed(1)} KB`,
//       fileUrl: URL.createObjectURL(file),
//       time: getCurrentTime(),
//       type: isImg ? "image" : "file",
//     };

//     updateChatMessages(selectedChat.id, newMsg, isImg ? "[Image]" : file.name);
//     e.target.value = "";
//   };

//   const updateChatMessages = (chatId, newMsg, lastMsgText) => {
//     setConversations((prev) =>
//       prev.map((chat) => {
//         if (chat.id === chatId) {
//           const updatedMessages = [...(chat.messages || []), newMsg];
//           const updatedChat = {
//             ...chat,
//             lastMsg: lastMsgText,
//             time: newMsg.time,
//             messages: updatedMessages,
//           };
//           if (selectedChat?.id === chatId) {
//             setSelectedChat(updatedChat);
//           }
//           return updatedChat;
//         }
//         return chat;
//       })
//     );
//   };

//   // Add Member to Existing Group
//   const handleAddMemberToExistingGroup = (e) => {
//     e.preventDefault();
//     if (!newMemberName.trim() || !newMemberPhone.trim() || !selectedChat) return;

//     const newMemberObj = {
//       id: Date.now(),
//       name: newMemberName,
//       phone: newMemberPhone,
//       role: "Member",
//       avatarBg: "bg-emerald-100 text-emerald-600",
//       initials: newMemberName.slice(0, 2).toUpperCase(),
//     };

//     const updatedMembers = [...(selectedChat.members || []), newMemberObj];
//     const systemMsg = {
//       id: Date.now(),
//       sender: "system",
//       text: `${newMemberName} (${newMemberPhone}) was added to the group.`,
//       time: getCurrentTime(),
//       type: "text",
//     };

//     setConversations((prev) =>
//       prev.map((chat) => {
//         if (chat.id === selectedChat.id) {
//           const updatedChat = {
//             ...chat,
//             members: updatedMembers,
//             messages: [...(chat.messages || []), systemMsg],
//           };
//           setSelectedChat(updatedChat);
//           return updatedChat;
//         }
//         return chat;
//       })
//     );

//     setNewMemberName("");
//     setNewMemberPhone("");
//     setIsAddMemberModalOpen(false);
//   };

//   // Custom Member for New Group Form
//   const handleAddCustomMember = () => {
//     if (!customName.trim() || !customPhone.trim()) return;

//     const newMember = {
//       id: Date.now(),
//       name: customName,
//       phone: customPhone,
//       role: "Contact",
//       avatarBg: "bg-blue-100 text-blue-600",
//       initials: customName.slice(0, 2).toUpperCase(),
//     };

//     setCustomMembersList([...customMembersList, newMember]);
//     setCustomName("");
//     setCustomPhone("");
//   };

//   const handleMemberToggle = (chatObj) => {
//     const exists = selectedMembers.some((m) => m.id === chatObj.id);
//     if (exists) {
//       setSelectedMembers(selectedMembers.filter((m) => m.id !== chatObj.id));
//     } else {
//       setSelectedMembers([...selectedMembers, chatObj]);
//     }
//   };

//   const handleCreateGroup = (e) => {
//     e.preventDefault();
//     if (!groupName.trim()) return;

//     const allGroupMembers = [...selectedMembers, ...customMembersList];

//     const newGroup = {
//       id: Date.now(),
//       name: groupName,
//       email: `${allGroupMembers.length} Members`,
//       role: "Group",
//       avatarBg: "bg-rose-100 text-rose-600",
//       initials: groupName.slice(0, 2).toUpperCase(),
//       lastMsg: "Group created",
//       time: getCurrentTime(),
//       type: "group",
//       members: allGroupMembers,
//       messages: [
//         {
//           id: Date.now(),
//           sender: "system",
//           text: `Group "${groupName}" created with ${allGroupMembers.length} members.`,
//           time: getCurrentTime(),
//           type: "text",
//         },
//       ],
//     };

//     const updated = [newGroup, ...conversations];
//     setConversations(updated);
//     setSelectedChat(newGroup);
//     setGroupName("");
//     setSelectedMembers([]);
//     setCustomMembersList([]);
//     setIsGroupModalOpen(false);
//   };

//   const filteredConversations = conversations.filter((chat) => {
//     if (activeTab === "Group") return chat.type === "group";
//     return true;
//   });

//   return (
//     <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileUpload}
//         className="hidden"
//       />

//       {/* Top Navbar */}
//       <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-2 sm:gap-3">
//           <Menu className="w-5 h-5 text-slate-500 cursor-pointer" />
//           <h1 className="font-semibold text-base sm:text-lg text-slate-800">
//             Messages Dashboard
//           </h1>
//         </div>

//         <div className="flex items-center gap-2 sm:gap-4">
//           <div className="hidden lg:flex bg-emerald-50 text-emerald-600 text-xs px-3 py-1.5 rounded-md font-medium items-center gap-1.5 border border-emerald-100">
//             <Calendar className="w-3.5 h-3.5" />
//             CRM Inbox
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-medium flex items-center justify-center text-xs">
//               M
//             </div>
//             <div className="text-left text-xs hidden sm:block">
//               <p className="font-semibold text-slate-700">M Aftab</p>
//               <p className="text-slate-400 text-[10px]">admin@callcrm.com</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Container */}
//       <div className="flex-1 flex overflow-hidden relative">
//         {/* Left Sidebar */}
//         <aside
//           className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${
//             showMobileChat ? "hidden md:flex" : "flex"
//           }`}
//         >
//           <div className="p-3 flex items-center gap-2">
//             <div className="relative flex-1">
//               <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search conversations..."
//                 className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//               />
//             </div>
//             <button className="p-1.5 text-slate-400 border border-slate-200 rounded-lg">
//               <Filter className="w-4 h-4" />
//             </button>
//           </div>

//           <div className="flex items-center justify-between border-b border-slate-200 px-3">
//             <div className="flex">
//               {["All", "Group"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
//                     activeTab === tab
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-500 hover:text-slate-700"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>

//             {activeTab === "Group" && (
//               <button
//                 onClick={() => setIsGroupModalOpen(true)}
//                 className="mb-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//                 Create Group
//               </button>
//             )}
//           </div>

//           <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
//             {filteredConversations.map((chat) => (
//               <div
//                 key={chat.id}
//                 onClick={() => handleSelectChat(chat)}
//                 className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
//                   selectedChat?.id === chat.id ? "bg-emerald-50/60" : "hover:bg-slate-50"
//                 }`}
//               >
//                 <div
//                   className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${chat.avatarBg}`}
//                 >
//                   {chat.type === "group" ? <Users className="w-4 h-4" /> : chat.initials}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-baseline mb-0.5">
//                     <h4 className="text-xs font-semibold text-slate-800 truncate">
//                       {chat.name}
//                     </h4>
//                     <span className="text-[10px] text-slate-400">{chat.time}</span>
//                   </div>
//                   <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </aside>

//         {/* Chat Screen */}
//         <section
//           className={`flex-1 flex flex-col bg-[#e5ddd5]/30 w-full h-full ${
//             !showMobileChat ? "hidden md:flex" : "flex"
//           }`}
//         >
//           {selectedChat ? (
//             <>
//               {/* Header */}
//               <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
//                 <div className="flex items-center gap-2 sm:gap-3">
//                   <button
//                     onClick={() => setShowMobileChat(false)}
//                     className="md:hidden p-1 text-slate-500"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>

//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedChat.avatarBg}`}
//                   >
//                     {selectedChat.type === "group" ? (
//                       <Users className="w-4 h-4" />
//                     ) : (
//                       selectedChat.initials
//                     )}
//                   </div>
//                   <div>
//                     <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">
//                       {selectedChat.name}
//                       {selectedChat.type === "group" && (
//                         <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-normal">
//                           Group
//                         </span>
//                       )}
//                     </h3>
//                     <p className="text-[10px] text-slate-400">
//                       {selectedChat.type === "group"
//                         ? `${selectedChat.members?.length || 0} Members`
//                         : selectedChat.email}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {selectedChat.type === "group" && (
//                     <div className="flex items-center gap-1.5">
//                       <button
//                         onClick={() => setIsAddMemberModalOpen(true)}
//                         className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
//                       >
//                         <UserPlus className="w-3.5 h-3.5" />
//                         Add Member
//                       </button>

//                       <button
//                         onClick={() => setIsGroupInfoOpen(true)}
//                         className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium"
//                       >
//                         <Info className="w-3.5 h-3.5 text-slate-500" />
//                         Members ({selectedChat.members?.length || 0})
//                       </button>
//                     </div>
//                   )}

//                   <Search className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600 ml-2" />
//                   <Star className="w-4 h-4 cursor-pointer text-slate-400 hover:text-amber-500" />
//                   <MoreVertical className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600" />
//                 </div>
//               </div>

//               {/* MESSAGES AREA */}
//               <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-100/50">
//                 {selectedChat.messages?.map((msg) => {
//                   const isMe = msg.sender === "me";
//                   const isSystem = msg.sender === "system";

//                   if (isSystem) {
//                     return (
//                       <div key={msg.id} className="text-center my-2">
//                         <span className="text-[10px] bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm">
//                           {msg.text}
//                         </span>
//                       </div>
//                     );
//                   }

//                   return (
//                     <div
//                       key={msg.id}
//                       className={`flex ${
//                         isMe ? "justify-end" : "justify-start"
//                       } items-end gap-2 w-full`}
//                     >
//                       {/* Left Avatar for Received Messages (sender !== "me") */}
//                       {!isMe && (
//                         <div
//                           className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mb-1 ${selectedChat.avatarBg}`}
//                         >
//                           {selectedChat.initials || "A"}
//                         </div>
//                       )}

//                       <div
//                         className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs shadow-sm ${
//                           isMe
//                             ? "bg-emerald-600 text-white rounded-br-none" // RIGHT SIDE (My Message)
//                             : "bg-white text-slate-800 border border-slate-200 rounded-bl-none" // LEFT SIDE (Their Message)
//                         }`}
//                       >
//                         {/* Group Sender Name on Left Side */}
//                         {!isMe && selectedChat.type === "group" && (
//                           <p className="text-[10px] font-bold text-emerald-600 mb-1">
//                             {msg.senderName || selectedChat.name}
//                           </p>
//                         )}

//                         {/* File Attachment */}
//                         {msg.type === "file" && (
//                           <div
//                             className={`p-2 rounded-lg flex items-center justify-between gap-2 mb-1 ${
//                               isMe ? "bg-emerald-700/50 text-white" : "bg-slate-100 text-slate-800"
//                             }`}
//                           >
//                             <div className="flex items-center gap-2 min-w-0">
//                               <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
//                               <div className="truncate">
//                                 <p className="font-semibold text-[11px] truncate">
//                                   {msg.fileName}
//                                 </p>
//                                 <p className="text-[9px] opacity-70">
//                                   {msg.fileSize}
//                                 </p>
//                               </div>
//                             </div>
//                             <a
//                               href={msg.fileUrl}
//                               download={msg.fileName}
//                               className="hover:opacity-80"
//                             >
//                               <Download className="w-4 h-4" />
//                             </a>
//                           </div>
//                         )}

//                         {/* Image Attachment */}
//                         {msg.type === "image" && (
//                           <div className="mb-1">
//                             <img
//                               src={msg.fileUrl}
//                               alt="attached"
//                               className="max-h-48 rounded-lg object-cover w-full mb-1"
//                             />
//                             <p className="text-[10px] opacity-80">{msg.fileName}</p>
//                           </div>
//                         )}

//                         {/* Text Content */}
//                         {msg.text && <p className="leading-relaxed">{msg.text}</p>}

//                         <div
//                           className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
//                             isMe ? "text-emerald-100" : "text-slate-400"
//                           }`}
//                         >
//                           <span>{msg.time}</span>
//                           {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 <div ref={messagesEndRef} />
//               </div>

//               {/* Chat Input */}
//               <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
//                 <form
//                   onSubmit={handleSendMessage}
//                   className="bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-emerald-500"
//                 >
//                   <input
//                     type="text"
//                     placeholder="Type a message..."
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     className="w-full bg-transparent text-xs px-2 py-1 outline-none text-slate-700"
//                   />

//                   <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
//                     <div className="flex items-center gap-3 text-slate-400">
//                       <button type="button" className="hover:text-slate-600">
//                         <Smile className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="hover:text-slate-600"
//                       >
//                         <Paperclip className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="hover:text-slate-600"
//                       >
//                         <ImageIcon className="w-4 h-4" />
//                       </button>
//                     </div>

//                     <button
//                       type="submit"
//                       className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
//                     >
//                       <Send className="w-3.5 h-3.5" />
//                       Send
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
//               Select a conversation to start chatting
//             </div>
//           )}
//         </section>
//       </div>

//       {/* ADD MEMBER TO GROUP MODAL */}
//       {isAddMemberModalOpen && selectedChat?.type === "group" && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
//                 <UserPlus className="w-4 h-4 text-emerald-600" />
//                 Add Member to "{selectedChat.name}"
//               </h3>
//               <button
//                 onClick={() => setIsAddMemberModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleAddMemberToExistingGroup}
//               className="p-4 space-y-4"
//             >
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Member Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Enter Name"
//                   value={newMemberName}
//                   onChange={(e) => setNewMemberName(e.target.value)}
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="+92 300 0000000"
//                   value={newMemberPhone}
//                   onChange={(e) => setNewMemberPhone(e.target.value)}
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setIsAddMemberModalOpen(false)}
//                   className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   Add Member
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* CREATE GROUP MODAL */}
//       {isGroupModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
//                 <Users className="w-4 h-4 text-emerald-600" />
//                 Create New Group
//               </h3>
//               <button
//                 onClick={() => setIsGroupModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleCreateGroup}
//               className="p-4 space-y-4 overflow-y-auto flex-1"
//             >
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Group Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Group Name..."
//                   value={groupName}
//                   onChange={(e) => setGroupName(e.target.value)}
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
//                 <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
//                   <UserPlus className="w-3.5 h-3.5 text-blue-500" />
//                   Add Member by Phone
//                 </label>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                   <input
//                     type="text"
//                     placeholder="Member Name"
//                     value={customName}
//                     onChange={(e) => setCustomName(e.target.value)}
//                     className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Phone Number"
//                     value={customPhone}
//                     onChange={(e) => setCustomPhone(e.target.value)}
//                     className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleAddCustomMember}
//                   className="w-full mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
//                 >
//                   <Plus className="w-3 h-3" /> Add
//                 </button>
//               </div>

//               {customMembersList.length > 0 && (
//                 <div>
//                   <label className="block text-[11px] font-semibold text-slate-500 mb-1">
//                     Added Members ({customMembersList.length}):
//                   </label>
//                   <div className="flex flex-wrap gap-1.5">
//                     {customMembersList.map((m) => (
//                       <span
//                         key={m.id}
//                         className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
//                       >
//                         {m.name} ({m.phone})
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Select Existing Contacts
//                 </label>
//                 <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
//                   {conversations
//                     .filter((c) => c.type === "direct")
//                     .map((contact) => {
//                       const isChecked = selectedMembers.some(
//                         (m) => m.id === contact.id
//                       );
//                       return (
//                         <label
//                           key={contact.id}
//                           className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
//                         >
//                           <div className="flex items-center gap-2">
//                             <div
//                               className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${contact.avatarBg}`}
//                             >
//                               {contact.initials}
//                             </div>
//                             <div>
//                               <p className="text-xs text-slate-700 font-medium">
//                                 {contact.name}
//                               </p>
//                               <p className="text-[9px] text-slate-400">
//                                 {contact.phone || contact.email}
//                               </p>
//                             </div>
//                           </div>
//                           <input
//                             type="checkbox"
//                             checked={isChecked}
//                             onChange={() => handleMemberToggle(contact)}
//                             className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
//                           />
//                         </label>
//                       );
//                     })}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setIsGroupModalOpen(false)}
//                   className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   Create Group
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* VIEW MEMBERS MODAL */}
//       {isGroupInfoOpen && selectedChat?.type === "group" && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <div className="flex items-center gap-2">
//                 <Users className="w-4 h-4 text-emerald-600" />
//                 <h3 className="font-semibold text-sm text-slate-800">
//                   {selectedChat.name} Members
//                 </h3>
//               </div>
//               <button
//                 onClick={() => setIsGroupInfoOpen(false)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="p-4 max-h-80 overflow-y-auto space-y-2">
//               <p className="text-xs text-slate-400 font-medium mb-2">
//                 Total Members: {selectedChat.members?.length || 0}
//               </p>

//               {selectedChat.members?.length > 0 ? (
//                 selectedChat.members.map((member, idx) => (
//                   <div
//                     key={member.id || idx}
//                     className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
//                   >
//                     <div className="flex items-center gap-2 min-w-0">
//                       <div
//                         className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
//                           member.avatarBg || "bg-slate-200 text-slate-600"
//                         }`}
//                       >
//                         {member.initials || "M"}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs font-semibold text-slate-700 truncate">
//                           {member.name}
//                         </p>
//                         <p className="text-[10px] text-slate-400 flex items-center gap-1">
//                           <Phone className="w-2.5 h-2.5" />
//                           {member.phone || member.email || "No Phone"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-xs text-slate-400 text-center py-4">
//                   No members in this group.
//                 </p>
//               )}
//             </div>

//             <div className="p-3 border-t border-slate-100 flex justify-end">
//               <button
//                 onClick={() => setIsGroupInfoOpen(false)}
//                 className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// "use client";

// import React, {
//   useState,
//   useEffect,
//   useRef,
// } from "react";

// import {
//   Search,
//   Filter,
//   Star,
//   MoreVertical,
//   Paperclip,
//   Image as ImageIcon,
//   FileText,
//   Smile,
//   Send,
//   Download,
//   Calendar,
//   CheckCheck,
//   Menu,
//   ChevronLeft,
//   Plus,
//   Users,
//   X,
//   UserPlus,
//   Phone,
//   Info,
// } from "lucide-react";

// export default function MessagesDashboard() {
//   const [conversations, setConversations] = useState([]);
//   const [activeTab, setActiveTab] = useState("All");
//   const [selectedChat, setSelectedChat] =
//     useState(null);

//   const [inputMessage, setInputMessage] =
//     useState("");

//   const [showMobileChat, setShowMobileChat] =
//     useState(false);

//   const [loadingConversations, setLoadingConversations] =
//     useState(true);

//   const [loadingMessages, setLoadingMessages] =
//     useState(false);

//   const [sendingMessage, setSendingMessage] =
//     useState(false);

//   // Group Modal States
//   const [isGroupModalOpen, setIsGroupModalOpen] =
//     useState(false);

//   const [groupName, setGroupName] =
//     useState("");

//   const [selectedMembers, setSelectedMembers] =
//     useState([]);

//   const [customName, setCustomName] =
//     useState("");

//   const [customPhone, setCustomPhone] =
//     useState("");

//   const [customMembersList, setCustomMembersList] =
//     useState([]);

//   // Existing Group Modals
//   const [isGroupInfoOpen, setIsGroupInfoOpen] =
//     useState(false);

//   const [isAddMemberModalOpen, setIsAddMemberModalOpen] =
//     useState(false);

//   const [newMemberName, setNewMemberName] =
//     useState("");

//   const [newMemberPhone, setNewMemberPhone] =
//     useState("");

//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   /*
//   ==================================================
//   GET CURRENT TIME
//   ==================================================
//   */

//   const getCurrentTime = () => {
//     return new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   /*
//   ==================================================
//   LOAD ALL CONVERSATIONS
//   ==================================================
//   */

//   const loadConversations = async () => {
//     try {
//       setLoadingConversations(true);

//       const response = await fetch(
//         "/api/conversations",
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(
//           data.message ||
//             "Failed to load conversations"
//         );
//       }

//       const chats =
//         data.conversations || [];

//       setConversations(chats);

//       /*
//       Keep selected chat if it still exists
//       */

//       if (chats.length > 0) {
//         setSelectedChat((current) => {
//           if (!current) {
//             return chats[0];
//           }

//           const exists = chats.find(
//             (chat) =>
//               chat.id === current.id
//           );

//           return exists || chats[0];
//         });
//       } else {
//         setSelectedChat(null);
//       }
//     } catch (error) {
//       console.error(
//         "Load Conversations Error:",
//         error
//       );
//     } finally {
//       setLoadingConversations(false);
//     }
//   };

//   /*
//   ==================================================
//   LOAD MESSAGES OF SELECTED CHAT
//   ==================================================
//   */

//   const loadMessages = async (
//     conversationId
//   ) => {
//     if (!conversationId) return;

//     try {
//       setLoadingMessages(true);

//       const response = await fetch(
//         `/api/messages?conversationId=${conversationId}`,
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         }
//       );

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(
//           data.message ||
//             "Failed to load messages"
//         );
//       }

//       const apiMessages =
//         data.messages || [];

//       /*
//       Convert database message structure
//       into UI structure
//       */

//       const formattedMessages =
//         apiMessages.map((msg) => {
//           let sender =
//             msg.sender_type;

//           /*
//           Database:
//           me / them / system

//           UI:
//           me / them / system
//           */

//           return {
//             id: msg.id,

//             sender,

//             senderName:
//               msg.sender_name ||
//               "",

//             senderEmail:
//               msg.sender_email ||
//               "",

//             text: msg.text || "",

//             time: msg.created_at
//               ? new Date(
//                   msg.created_at
//                 ).toLocaleTimeString(
//                   [],
//                   {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   }
//                 )
//               : "",

//             type:
//               msg.msg_type ||
//               "text",

//             fileName:
//               msg.file_name ||
//               null,

//             fileSize:
//               msg.file_size ||
//               null,

//             fileUrl:
//               msg.file_url ||
//               null,
//           };
//         });

//       /*
//       Update selected chat
//       */

//       setSelectedChat((current) => {
//         if (
//           !current ||
//           current.id !== conversationId
//         ) {
//           return current;
//         }

//         return {
//           ...current,
//           messages:
//             formattedMessages,
//         };
//       });

//       /*
//       Also update conversations state
//       */

//       setConversations((prev) =>
//         prev.map((chat) =>
//           chat.id === conversationId
//             ? {
//                 ...chat,
//                 messages:
//                   formattedMessages,
//               }
//             : chat
//         )
//       );
//     } catch (error) {
//       console.error(
//         "Load Messages Error:",
//         error
//       );
//     } finally {
//       setLoadingMessages(false);
//     }
//   };

//   /*
//   ==================================================
//   INITIAL LOAD
//   ==================================================
//   */

//   useEffect(() => {
//     loadConversations();
//   }, []);

//   /*
//   ==================================================
//   WHEN CHAT CHANGES LOAD ITS MESSAGES
//   ==================================================
//   */

//   useEffect(() => {
//     if (selectedChat?.id) {
//       loadMessages(selectedChat.id);
//     }
//   }, [selectedChat?.id]);

//   /*
//   ==================================================
//   AUTO SCROLL
//   ==================================================
//   */

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: "smooth",
//     });
//   }, [
//     selectedChat?.messages,
//     loadingMessages,
//   ]);

//   /*
//   ==================================================
//   SELECT CHAT
//   ==================================================
//   */

//   const handleSelectChat = (chat) => {
//     setSelectedChat(chat);
//     setShowMobileChat(true);

//     /*
//     Load latest messages
//     */

//     loadMessages(chat.id);
//   };

//   /*
//   ==================================================
//   SEND TEXT MESSAGE
//   ==================================================
//   */

//   const handleSendMessage = async (e) => {
//     e?.preventDefault();

//     if (
//       !inputMessage.trim() ||
//       !selectedChat ||
//       sendingMessage
//     ) {
//       return;
//     }

//     try {
//       setSendingMessage(true);

//       const response = await fetch(
//         "/api/messages",
//         {
//           method: "POST",
//           credentials: "include",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             conversationId:
//               selectedChat.id,

//             text:
//               inputMessage.trim(),

//             msgType: "text",
//           }),
//         }
//       );

//       const data =
//         await response.json();

//       if (
//         !response.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "Failed to send message"
//         );
//       }

//       /*
//       API returned new message
//       */

//       const apiMessage =
//         data.data;

//       const newMessage = {
//         id: apiMessage.id,

//         sender:
//           apiMessage.sender_type ||
//           "me",

//         senderName:
//           apiMessage.sender_name ||
//           "You",

//         senderEmail:
//           apiMessage.sender_email ||
//           "",

//         text:
//           apiMessage.text || "",

//         time:
//           apiMessage.created_at
//             ? new Date(
//                 apiMessage.created_at
//               ).toLocaleTimeString(
//                 [],
//                 {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 }
//               )
//             : getCurrentTime(),

//         type:
//           apiMessage.msg_type ||
//           "text",

//         fileName:
//           apiMessage.file_name ||
//           null,

//         fileSize:
//           apiMessage.file_size ||
//           null,

//         fileUrl:
//           apiMessage.file_url ||
//           null,
//       };

//       /*
//       Update selected chat
//       */

//       setSelectedChat((current) => ({
//         ...current,

//         messages: [
//           ...(current.messages || []),
//           newMessage,
//         ],

//         last_msg:
//           inputMessage.trim(),

//         lastMsg:
//           inputMessage.trim(),

//         last_msg_time:
//           apiMessage.created_at,

//         time:
//           newMessage.time,
//       }));

//       /*
//       Update left sidebar
//       */

//       setConversations((prev) =>
//         prev.map((chat) =>
//           chat.id ===
//           selectedChat.id
//             ? {
//                 ...chat,

//                 messages: [
//                   ...(chat.messages ||
//                     []),
//                   newMessage,
//                 ],

//                 last_msg:
//                   inputMessage.trim(),

//                 lastMsg:
//                   inputMessage.trim(),

//                 last_msg_time:
//                   apiMessage.created_at,

//                 time:
//                   newMessage.time,
//               }
//             : chat
//         )
//       );

//       setInputMessage("");
//     } catch (error) {
//       console.error(
//         "Send Message Error:",
//         error
//       );

//       alert(
//         error.message ||
//           "Message send failed"
//       );
//     } finally {
//       setSendingMessage(false);
//     }
//   };

//   /*
//   ==================================================
//   FILE UPLOAD
//   ==================================================
//   */

//   const handleFileUpload = async (e) => {
//     const file =
//       e.target.files?.[0];

//     if (
//       !file ||
//       !selectedChat ||
//       sendingMessage
//     ) {
//       return;
//     }

//     try {
//       setSendingMessage(true);

//       const formData =
//         new FormData();

//       formData.append(
//         "conversationId",
//         String(selectedChat.id)
//       );

//       formData.append(
//         "file",
//         file
//       );

//       /*
//       Optional caption
//       */

//       formData.append(
//         "text",
//         ""
//       );

//       const response =
//         await fetch(
//           "/api/messages",
//           {
//             method: "POST",
//             credentials: "include",
//             body: formData,
//           }
//         );

//       const data =
//         await response.json();

//       if (
//         !response.ok ||
//         !data.success
//       ) {
//         throw new Error(
//           data.message ||
//             "File upload failed"
//         );
//       }

//       const apiMessage =
//         data.data;

//       const newMessage = {
//         id: apiMessage.id,

//         sender:
//           apiMessage.sender_type ||
//           "me",

//         senderName:
//           apiMessage.sender_name ||
//           "You",

//         senderEmail:
//           apiMessage.sender_email ||
//           "",

//         text:
//           apiMessage.text || "",

//         time:
//           apiMessage.created_at
//             ? new Date(
//                 apiMessage.created_at
//               ).toLocaleTimeString(
//                 [],
//                 {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 }
//               )
//             : getCurrentTime(),

//         type:
//           apiMessage.msg_type ||
//           "file",

//         fileName:
//           apiMessage.file_name ||
//           file.name,

//         fileSize:
//           apiMessage.file_size ||
//           `${(
//             file.size / 1024
//           ).toFixed(1)} KB`,

//         fileUrl:
//           apiMessage.file_url ||
//           null,
//       };

//       /*
//       Update selected chat
//       */

//       setSelectedChat((current) => ({
//         ...current,

//         messages: [
//           ...(current.messages || []),
//           newMessage,
//         ],

//         last_msg:
//           newMessage.type ===
//           "image"
//             ? "📷 Image"
//             : `📎 ${
//                 newMessage.fileName
//               }`,

//         lastMsg:
//           newMessage.type ===
//           "image"
//             ? "📷 Image"
//             : `📎 ${
//                 newMessage.fileName
//               }`,

//         time:
//           newMessage.time,
//       }));

//       /*
//       Update conversations
//       */

//       setConversations((prev) =>
//         prev.map((chat) =>
//           chat.id ===
//           selectedChat.id
//             ? {
//                 ...chat,

//                 messages: [
//                   ...(chat.messages ||
//                     []),
//                   newMessage,
//                 ],

//                 last_msg:
//                   newMessage.type ===
//                   "image"
//                     ? "📷 Image"
//                     : `📎 ${
//                         newMessage.fileName
//                       }`,

//                 lastMsg:
//                   newMessage.type ===
//                   "image"
//                     ? "📷 Image"
//                     : `📎 ${
//                         newMessage.fileName
//                       }`,

//                 time:
//                   newMessage.time,
//               }
//             : chat
//         )
//       );

//       e.target.value = "";
//     } catch (error) {
//       console.error(
//         "File Upload Error:",
//         error
//       );

//       alert(
//         error.message ||
//           "File upload failed"
//       );
//     } finally {
//       setSendingMessage(false);
//     }
//   };

//   /*
//   ==================================================
//   ADD MEMBER TO EXISTING GROUP
//   ==================================================
//   */

// const handleAddMemberToExistingGroup = async (e) => {
//   e.preventDefault();

//   if (
//     !newMemberName.trim() ||
//     !newMemberPhone.trim() ||
//     !selectedChat
//   ) {
//     return;
//   }

//   try {
//     setSendingMessage(true);

//     const response = await fetch(
//       "/api/conversations/members",
//       {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           conversationId: selectedChat.id,
//           name: newMemberName.trim(),
//           phone: newMemberPhone.trim(),
//         }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(
//         data.message || "Failed to add member"
//       );
//     }

//     // Database se returned member
//     const newMember = data.member;

//     // Updated chat
//     const updatedChat = {
//       ...selectedChat,
//       members: [
//         ...(selectedChat.members || []),
//         newMember,
//       ],
//     };

//     setSelectedChat(updatedChat);

//     setConversations((prev) =>
//       prev.map((chat) =>
//         chat.id === selectedChat.id
//           ? updatedChat
//           : chat
//       )
//     );

//     setNewMemberName("");
//     setNewMemberPhone("");
//     setIsAddMemberModalOpen(false);

//     // Latest conversations/members reload
//     await loadConversations();

//   } catch (error) {
//     console.error(
//       "Add Member Error:",
//       error
//     );

//     alert(
//       error.message ||
//         "Failed to add member"
//     );
//   } finally {
//     setSendingMessage(false);
//   }
// };

//   /*
//   ==================================================
//   CUSTOM MEMBER
//   ==================================================
//   */

//   const handleAddCustomMember = () => {
//     if (
//       !customName.trim() ||
//       !customPhone.trim()
//     ) {
//       return;
//     }

//     const newMember = {
//       id: Date.now(),

//       name:
//         customName.trim(),

//       phone:
//         customPhone.trim(),

//       role: "member",

//       avatarBg:
//         "bg-blue-100 text-blue-600",

//       initials:
//         customName
//           .slice(0, 2)
//           .toUpperCase(),
//     };

//     setCustomMembersList(
//       (prev) => [
//         ...prev,
//         newMember,
//       ]
//     );

//     setCustomName("");
//     setCustomPhone("");
//   };

//   /*
//   ==================================================
//   TOGGLE MEMBER
//   ==================================================
//   */

//   const handleMemberToggle = (
//     chatObj
//   ) => {
//     const exists =
//       selectedMembers.some(
//         (m) =>
//           m.id === chatObj.id
//       );

//     if (exists) {
//       setSelectedMembers(
//         (prev) =>
//           prev.filter(
//             (m) =>
//               m.id !==
//               chatObj.id
//           )
//       );
//     } else {
//       setSelectedMembers(
//         (prev) => [
//           ...prev,
//           chatObj,
//         ]
//       );
//     }
//   };

//   /*
//   ==================================================
//   CREATE GROUP
//   ==================================================
//   */

//   const handleCreateGroup =
//     async (e) => {
//       e.preventDefault();

//       if (
//         !groupName.trim()
//       ) {
//         return;
//       }

//       const allGroupMembers = [
//         ...selectedMembers,
//         ...customMembersList,
//       ];

//       /*
//       NOTE:
//       Your current conversations API
//       needs GROUP POST support.

//       This calls:
//       POST /api/conversations
//       */

//       try {
//         const response =
//           await fetch(
//             "/api/conversations",
//             {
//               method: "POST",

//               credentials:
//                 "include",

//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },

//               body: JSON.stringify({
//                 type: "group",

//                 name:
//                   groupName.trim(),

//                 members:
//                   allGroupMembers.map(
//                     (member) =>
//                       member.user_id ||
//                       member.id
//                   ),
//               }),
//             }
//           );

//         const data =
//           await response.json();

//         if (
//           !response.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Group creation failed"
//           );
//         }

//         /*
//         Reload from database
//         */

//         await loadConversations();

//         /*
//         Find new group
//         */

//         if (
//           data.conversationId
//         ) {
//           const groupChat = {
//             id:
//               data.conversationId,

//             name:
//               groupName.trim(),

//             type: "group",

//             initials:
//               groupName
//                 .slice(0, 2)
//                 .toUpperCase(),

//             avatarBg:
//               "bg-rose-100 text-rose-600",

//             members:
//               allGroupMembers,

//             messages: [],
//           };

//           setSelectedChat(
//             groupChat
//           );

//           setShowMobileChat(
//             true
//           );

//           await loadMessages(
//             data.conversationId
//           );
//         }

//         setGroupName("");
//         setSelectedMembers([]);
//         setCustomMembersList([]);
//         setIsGroupModalOpen(false);
//       } catch (error) {
//         console.error(
//           "Create Group Error:",
//           error
//         );

//         alert(
//           error.message ||
//             "Group creation failed"
//         );
//       }
//     };

//   /*
//   ==================================================
//   FILTER
//   ==================================================
//   */

//   const filteredConversations =
//     conversations.filter(
//       (chat) => {
//         if (
//           activeTab ===
//           "Group"
//         ) {
//           return (
//             chat.type ===
//             "group"
//           );
//         }

//         return true;
//       }
//     );

//   /*
//   ==================================================
//   RENDER
//   ==================================================
//   */

//   return (
//     <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={
//           handleFileUpload
//         }
//         className="hidden"
//       />

//       {/* TOP NAVBAR */}

//       <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-2 sm:gap-3">
//           <Menu className="w-5 h-5 text-slate-500 cursor-pointer" />

//           <h1 className="font-semibold text-base sm:text-lg text-slate-800">
//             Messages Dashboard
//           </h1>
//         </div>

//         <div className="flex items-center gap-2 sm:gap-4">
//           <div className="hidden lg:flex bg-emerald-50 text-emerald-600 text-xs px-3 py-1.5 rounded-md font-medium items-center gap-1.5 border border-emerald-100">
//             <Calendar className="w-3.5 h-3.5" />
//             CRM Inbox
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-medium flex items-center justify-center text-xs">
//               M
//             </div>

//             <div className="text-left text-xs hidden sm:block">
//               <p className="font-semibold text-slate-700">
//                 M Aftab
//               </p>

//               <p className="text-slate-400 text-[10px]">
//                 admin@callcrm.com
//               </p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* MAIN */}

//       <div className="flex-1 flex overflow-hidden relative">
//         {/* LEFT SIDEBAR */}

//         <aside
//           className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${
//             showMobileChat
//               ? "hidden md:flex"
//               : "flex"
//           }`}
//         >
//           {/* SEARCH */}

//           <div className="p-3 flex items-center gap-2">
//             <div className="relative flex-1">
//               <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />

//               <input
//                 type="text"
//                 placeholder="Search conversations..."
//                 className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//               />
//             </div>

//             <button className="p-1.5 text-slate-400 border border-slate-200 rounded-lg">
//               <Filter className="w-4 h-4" />
//             </button>
//           </div>

//           {/* TABS */}

//           <div className="flex items-center justify-between border-b border-slate-200 px-3">
//             <div className="flex">
//               {[
//                 "All",
//                 "Group",
//               ].map(
//                 (tab) => (
//                   <button
//                     key={tab}
//                     onClick={() =>
//                       setActiveTab(
//                         tab
//                       )
//                     }
//                     className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
//                       activeTab ===
//                       tab
//                         ? "border-emerald-500 text-emerald-600"
//                         : "border-transparent text-slate-500 hover:text-slate-700"
//                     }`}
//                   >
//                     {tab}
//                   </button>
//                 )
//               )}
//             </div>

//             {activeTab ===
//               "Group" && (
//               <button
//                 onClick={() =>
//                   setIsGroupModalOpen(
//                     true
//                   )
//                 }
//                 className="mb-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//                 Create Group
//               </button>
//             )}
//           </div>

//           {/* CONVERSATIONS */}

//           <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
//             {loadingConversations ? (
//               <div className="p-6 text-center text-xs text-slate-400">
//                 Loading conversations...
//               </div>
//             ) : filteredConversations.length ===
//               0 ? (
//               <div className="p-6 text-center text-xs text-slate-400">
//                 No conversations found.
//               </div>
//             ) : (
//               filteredConversations.map(
//                 (chat) => (
//                   <div
//                     key={
//                       chat.id
//                     }
//                     onClick={() =>
//                       handleSelectChat(
//                         chat
//                       )
//                     }
//                     className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
//                       selectedChat?.id ===
//                       chat.id
//                         ? "bg-emerald-50/60"
//                         : "hover:bg-slate-50"
//                     }`}
//                   >
//                     <div
//                       className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
//                         chat.avatar_bg ||
//                         chat.avatarBg ||
//                         "bg-emerald-100 text-emerald-600"
//                       }`}
//                     >
//                       {chat.type ===
//                       "group" ? (
//                         <Users className="w-4 h-4" />
//                       ) : (
//                         chat.initials ||
//                         "U"
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-baseline mb-0.5">
//                         <h4 className="text-xs font-semibold text-slate-800 truncate">
//                           {chat.name ||
//                             "Unknown"}
//                         </h4>

//                         <span className="text-[10px] text-slate-400">
//                           {chat.time ||
//                             (chat.last_msg_time
//                               ? new Date(
//                                   chat.last_msg_time
//                                 ).toLocaleTimeString(
//                                   [],
//                                   {
//                                     hour: "2-digit",
//                                     minute:
//                                       "2-digit",
//                                   }
//                                 )
//                               : "")}
//                         </span>
//                       </div>

//                       <p className="text-xs text-slate-500 truncate">
//                         {chat.lastMsg ||
//                           chat.last_msg ||
//                           "No messages yet"}
//                       </p>
//                     </div>
//                   </div>
//                 )
//               )
//             )}
//           </div>
//         </aside>

//         {/* CHAT SCREEN */}

//         <section
//           className={`flex-1 flex flex-col bg-[#e5ddd5]/30 w-full h-full ${
//             !showMobileChat
//               ? "hidden md:flex"
//               : "flex"
//           }`}
//         >
//           {selectedChat ? (
//             <>
//               {/* CHAT HEADER */}

//               <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
//                 <div className="flex items-center gap-2 sm:gap-3">
//                   <button
//                     onClick={() =>
//                       setShowMobileChat(
//                         false
//                       )
//                     }
//                     className="md:hidden p-1 text-slate-500"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>

//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
//                       selectedChat.avatar_bg ||
//                       selectedChat.avatarBg ||
//                       "bg-emerald-100 text-emerald-600"
//                     }`}
//                   >
//                     {selectedChat.type ===
//                     "group" ? (
//                       <Users className="w-4 h-4" />
//                     ) : (
//                       selectedChat.initials ||
//                       "U"
//                     )}
//                   </div>

//                   <div>
//                     <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">
//                       {selectedChat.name}

//                       {selectedChat.type ===
//                         "group" && (
//                         <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-normal">
//                           Group
//                         </span>
//                       )}
//                     </h3>

//                     <p className="text-[10px] text-slate-400">
//                       {selectedChat.type ===
//                       "group"
//                         ? `${
//                             selectedChat
//                               .members
//                               ?.length ||
//                             0
//                           } Members`
//                         : selectedChat.email ||
//                           "Direct Chat"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {selectedChat.type ===
//                     "group" && (
//                     <div className="flex items-center gap-1.5">
//                       <button
//                         onClick={() =>
//                           setIsAddMemberModalOpen(
//                             true
//                           )
//                         }
//                         className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
//                       >
//                         <UserPlus className="w-3.5 h-3.5" />

//                         Add Member
//                       </button>

//                       <button
//                         onClick={() =>
//                           setIsGroupInfoOpen(
//                             true
//                           )
//                         }
//                         className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium"
//                       >
//                         <Info className="w-3.5 h-3.5 text-slate-500" />

//                         Members (
//                         {selectedChat
//                           .members
//                           ?.length ||
//                           0}
//                         )
//                       </button>
//                     </div>
//                   )}

//                   <Search className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600 ml-2" />

//                   <Star className="w-4 h-4 cursor-pointer text-slate-400 hover:text-amber-500" />

//                   <MoreVertical className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600" />
//                 </div>
//               </div>

//               {/* MESSAGES */}

//               <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-100/50">
//                 {loadingMessages ? (
//                   <div className="flex justify-center items-center h-full text-xs text-slate-400">
//                     Loading messages...
//                   </div>
//                 ) : selectedChat
//                     .messages
//                     ?.length >
//                   0 ? (
//                   selectedChat.messages.map(
//                     (msg) => {
//                       const isMe =
//                         msg.sender ===
//                         "me";

//                       const isSystem =
//                         msg.sender ===
//                         "system";

//                       if (
//                         isSystem
//                       ) {
//                         return (
//                           <div
//                             key={
//                               msg.id
//                             }
//                             className="text-center my-2"
//                           >
//                             <span className="text-[10px] bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full font-medium shadow-sm">
//                               {
//                                 msg.text
//                               }
//                             </span>
//                           </div>
//                         );
//                       }

//                       return (
//                         <div
//                           key={
//                             msg.id
//                           }
//                           className={`flex ${
//                             isMe
//                               ? "justify-end"
//                               : "justify-start"
//                           } items-end gap-2 w-full`}
//                         >
//                           {!isMe && (
//                             <div
//                               className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mb-1 ${
//                                 selectedChat.avatar_bg ||
//                                 selectedChat.avatarBg ||
//                                 "bg-emerald-100 text-emerald-600"
//                               }`}
//                             >
//                               {selectedChat.initials ||
//                                 "U"}
//                             </div>
//                           )}

//                           <div
//                             className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs shadow-sm ${
//                               isMe
//                                 ? "bg-emerald-600 text-white rounded-br-none"
//                                 : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
//                             }`}
//                           >
//                             {!isMe &&
//                               selectedChat.type ===
//                                 "group" && (
//                                 <p className="text-[10px] font-bold text-emerald-600 mb-1">
//                                   {msg.senderName ||
//                                     selectedChat.name}
//                                 </p>
//                               )}

//                             {/* FILE */}

//                             {msg.type ===
//                               "file" && (
//                               <div
//                                 className={`p-2 rounded-lg flex items-center justify-between gap-2 mb-1 ${
//                                   isMe
//                                     ? "bg-emerald-700/50 text-white"
//                                     : "bg-slate-100 text-slate-800"
//                                 }`}
//                               >
//                                 <div className="flex items-center gap-2 min-w-0">
//                                   <FileText className="w-4 h-4 text-emerald-400 shrink-0" />

//                                   <div className="truncate">
//                                     <p className="font-semibold text-[11px] truncate">
//                                       {msg.fileName}
//                                     </p>

//                                     <p className="text-[9px] opacity-70">
//                                       {msg.fileSize}
//                                     </p>
//                                   </div>
//                                 </div>

//                                 {msg.fileUrl && (
//                                   <a
//                                     href={
//                                       msg.fileUrl
//                                     }
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     download={
//                                       msg.fileName
//                                     }
//                                     className="hover:opacity-80"
//                                   >
//                                     <Download className="w-4 h-4" />
//                                   </a>
//                                 )}
//                               </div>
//                             )}

//                             {/* IMAGE */}

//                             {msg.type ===
//                               "image" &&
//                               msg.fileUrl && (
//                                 <div className="mb-1">
//                                   <img
//                                     src={
//                                       msg.fileUrl
//                                     }
//                                     alt={
//                                       msg.fileName ||
//                                       "attached"
//                                     }
//                                     className="max-h-48 rounded-lg object-cover w-full mb-1"
//                                   />

//                                   <p className="text-[10px] opacity-80">
//                                     {
//                                       msg.fileName
//                                     }
//                                   </p>
//                                 </div>
//                               )}

//                             {/* TEXT */}

//                             {msg.text && (
//                               <p className="leading-relaxed">
//                                 {
//                                   msg.text
//                                 }
//                               </p>
//                             )}

//                             <div
//                               className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
//                                 isMe
//                                   ? "text-emerald-100"
//                                   : "text-slate-400"
//                               }`}
//                             >
//                               <span>
//                                 {
//                                   msg.time
//                                 }
//                               </span>

//                               {isMe && (
//                                 <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     }
//                   )
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-xs text-slate-400">
//                     No messages yet. Start the conversation.
//                   </div>
//                 )}

//                 <div
//                   ref={
//                     messagesEndRef
//                   }
//                 />
//               </div>

//               {/* INPUT */}

//               <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
//                 <form
//                   onSubmit={
//                     handleSendMessage
//                   }
//                   className="bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-emerald-500"
//                 >
//                   <input
//                     type="text"
//                     placeholder="Type a message..."
//                     value={
//                       inputMessage
//                     }
//                     onChange={(e) =>
//                       setInputMessage(
//                         e.target
//                           .value
//                       )
//                     }
//                     disabled={
//                       sendingMessage
//                     }
//                     className="w-full bg-transparent text-xs px-2 py-1 outline-none text-slate-700"
//                   />

//                   <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
//                     <div className="flex items-center gap-3 text-slate-400">
//                       <button
//                         type="button"
//                         className="hover:text-slate-600"
//                       >
//                         <Smile className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         disabled={
//                           sendingMessage
//                         }
//                         onClick={() =>
//                           fileInputRef.current?.click()
//                         }
//                         className="hover:text-slate-600 disabled:opacity-50"
//                       >
//                         <Paperclip className="w-4 h-4" />
//                       </button>

//                       <button
//                         type="button"
//                         disabled={
//                           sendingMessage
//                         }
//                         onClick={() =>
//                           fileInputRef.current?.click()
//                         }
//                         className="hover:text-slate-600 disabled:opacity-50"
//                       >
//                         <ImageIcon className="w-4 h-4" />
//                       </button>
//                     </div>

//                     <button
//                       type="submit"
//                       disabled={
//                         sendingMessage ||
//                         !inputMessage.trim()
//                       }
//                       className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
//                     >
//                       <Send className="w-3.5 h-3.5" />

//                       {sendingMessage
//                         ? "Sending..."
//                         : "Send"}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
//               Select a conversation to start chatting
//             </div>
//           )}
//         </section>
//       </div>

//       {/* ==================================================
//           ADD MEMBER MODAL
//       ================================================== */}

//       {isAddMemberModalOpen &&
//         selectedChat?.type ===
//           "group" && (
//           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
//               <div className="flex items-center justify-between p-4 border-b border-slate-100">
//                 <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
//                   <UserPlus className="w-4 h-4 text-emerald-600" />

//                   Add Member to "
//                   {
//                     selectedChat.name
//                   }
//                   "
//                 </h3>

//                 <button
//                   onClick={() =>
//                     setIsAddMemberModalOpen(
//                       false
//                     )
//                   }
//                   className="text-slate-400 hover:text-slate-600"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <form
//                 onSubmit={
//                   handleAddMemberToExistingGroup
//                 }
//                 className="p-4 space-y-4"
//               >
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1">
//                     Member Name
//                   </label>

//                   <input
//                     type="text"
//                     required
//                     placeholder="Enter Name"
//                     value={
//                       newMemberName
//                     }
//                     onChange={(e) =>
//                       setNewMemberName(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1">
//                     Phone Number
//                   </label>

//                   <input
//                     type="text"
//                     required
//                     placeholder="+92 300 0000000"
//                     value={
//                       newMemberPhone
//                     }
//                     onChange={(e) =>
//                       setNewMemberPhone(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                   />
//                 </div>

//                 <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setIsAddMemberModalOpen(
//                         false
//                       )
//                     }
//                     className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
//                   >
//                     Add Member
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//       {/* ==================================================
//           CREATE GROUP MODAL
//       ================================================== */}

//       {isGroupModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b border-slate-100">
//               <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
//                 <Users className="w-4 h-4 text-emerald-600" />

//                 Create New Group
//               </h3>

//               <button
//                 onClick={() =>
//                   setIsGroupModalOpen(
//                     false
//                   )
//                 }
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={
//                 handleCreateGroup
//               }
//               className="p-4 space-y-4 overflow-y-auto flex-1"
//             >
//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Group Name
//                 </label>

//                 <input
//                   type="text"
//                   required
//                   placeholder="Group Name..."
//                   value={
//                     groupName
//                   }
//                   onChange={(e) =>
//                     setGroupName(
//                       e.target
//                         .value
//                     )
//                   }
//                   className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
//                 />
//               </div>

//               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
//                 <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
//                   <UserPlus className="w-3.5 h-3.5 text-blue-500" />

//                   Add Member by Phone
//                 </label>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                   <input
//                     type="text"
//                     placeholder="Member Name"
//                     value={
//                       customName
//                     }
//                     onChange={(e) =>
//                       setCustomName(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
//                   />

//                   <input
//                     type="text"
//                     placeholder="Phone Number"
//                     value={
//                       customPhone
//                     }
//                     onChange={(e) =>
//                       setCustomPhone(
//                         e.target
//                           .value
//                       )
//                     }
//                     className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={
//                     handleAddCustomMember
//                   }
//                   className="w-full mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
//                 >
//                   <Plus className="w-3 h-3" />

//                   Add
//                 </button>
//               </div>

//               {customMembersList.length >
//                 0 && (
//                 <div>
//                   <label className="block text-[11px] font-semibold text-slate-500 mb-1">
//                     Added Members (
//                     {
//                       customMembersList.length
//                     }
//                     ):
//                   </label>

//                   <div className="flex flex-wrap gap-1.5">
//                     {customMembersList.map(
//                       (m) => (
//                         <span
//                           key={
//                             m.id
//                           }
//                           className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
//                         >
//                           {
//                             m.name
//                           }{" "}
//                           (
//                           {
//                             m.phone
//                           }
//                           )
//                         </span>
//                       )
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-xs font-semibold text-slate-700 mb-1">
//                   Select Existing Contacts
//                 </label>

//                 <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
//                   {conversations
//                     .filter(
//                       (c) =>
//                         c.type ===
//                         "direct"
//                     )
//                     .map(
//                       (
//                         contact
//                       ) => {
//                         const isChecked =
//                           selectedMembers.some(
//                             (m) =>
//                               m.id ===
//                               contact.id
//                           );

//                         return (
//                           <label
//                             key={
//                               contact.id
//                             }
//                             className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
//                           >
//                             <div className="flex items-center gap-2">
//                               <div
//                                 className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
//                                   contact.avatar_bg ||
//                                   contact.avatarBg ||
//                                   "bg-emerald-100 text-emerald-600"
//                                 }`}
//                               >
//                                 {contact.initials ||
//                                   "U"}
//                               </div>

//                               <div>
//                                 <p className="text-xs text-slate-700 font-medium">
//                                   {
//                                     contact.name
//                                   }
//                                 </p>

//                                 <p className="text-[9px] text-slate-400">
//                                   {contact.phone ||
//                                     contact.email}
//                                 </p>
//                               </div>
//                             </div>

//                             <input
//                               type="checkbox"
//                               checked={
//                                 isChecked
//                               }
//                               onChange={() =>
//                                 handleMemberToggle(
//                                   contact
//                                 )
//                               }
//                               className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
//                             />
//                           </label>
//                         );
//                       }
//                     )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setIsGroupModalOpen(
//                       false
//                     )
//                   }
//                   className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
//                 >
//                   Create Group
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ==================================================
//           GROUP MEMBERS MODAL
//       ================================================== */}

//       {isGroupInfoOpen &&
//         selectedChat?.type ===
//           "group" && (
//           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
//               <div className="flex items-center justify-between p-4 border-b border-slate-100">
//                 <div className="flex items-center gap-2">
//                   <Users className="w-4 h-4 text-emerald-600" />

//                   <h3 className="font-semibold text-sm text-slate-800">
//                     {
//                       selectedChat.name
//                     }{" "}
//                     Members
//                   </h3>
//                 </div>

//                 <button
//                   onClick={() =>
//                     setIsGroupInfoOpen(
//                       false
//                     )
//                   }
//                   className="text-slate-400 hover:text-slate-600"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <div className="p-4 max-h-80 overflow-y-auto space-y-2">
//                 <p className="text-xs text-slate-400 font-medium mb-2">
//                   Total Members:{" "}
//                   {selectedChat
//                     .members
//                     ?.length ||
//                     0}
//                 </p>

//                 {selectedChat
//                   .members
//                   ?.length >
//                 0 ? (
//                   selectedChat.members.map(
//                     (
//                       member,
//                       idx
//                     ) => (
//                       <div
//                         key={
//                           member.id ||
//                           idx
//                         }
//                         className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
//                       >
//                         <div className="flex items-center gap-2 min-w-0">
//                           <div
//                             className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
//                               member.avatarBg ||
//                               "bg-slate-200 text-slate-600"
//                             }`}
//                           >
//                             {member.initials ||
//                               "M"}
//                           </div>

//                           <div className="min-w-0">
//                             <p className="text-xs font-semibold text-slate-700 truncate">
//                               {
//                                 member.name
//                               }
//                             </p>

//                             <p className="text-[10px] text-slate-400 flex items-center gap-1">
//                               <Phone className="w-2.5 h-2.5" />

//                               {member.phone ||
//                                 member.email ||
//                                 "No Phone"}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   )
//                 ) : (
//                   <p className="text-xs text-slate-400 text-center py-4">
//                     No members in this group.
//                   </p>
//                 )}
//               </div>

//               <div className="p-3 border-t border-slate-100 flex justify-end">
//                 <button
//                   onClick={() =>
//                     setIsGroupInfoOpen(
//                       false
//                     )
//                   }
//                   className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//     </div>
//   );
// }




















"use client";
import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
   useMemo,
  useRef,
} from "react";

import {
  Search,
  Filter,
  Star,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Smile,
  Send,
  Download,
  Calendar,
  CheckCheck,
  Menu,
  ChevronLeft,
  Plus,
  Users,
  X,
  UserPlus,
  Phone,
  Info,
  Loader2,
} from "lucide-react";
import LogoutModal from "@/components/LogoutModal";
import Sidebar from "@/components/Sidebar";

export default function MessagesDashboard() {
  const router = useRouter();

  /* ==================================================
     CONVERSATIONS
  ================================================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeTab, setActiveTab] = useState("All");
  const [selectedChat, setSelectedChat] = useState(null);

  /* ==================================================
     MESSAGE STATES
  ================================================== */

  const [inputMessage, setInputMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  /* ==================================================
     GROUP CREATE STATES
  ================================================== */

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customName, setCustomName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customMembersList, setCustomMembersList] = useState([]);

  /* ==================================================
     GROUP INFO
  ================================================== */

  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  /* ==================================================
     ADD MEMBER
  ================================================== */

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  /* ==================================================
     SEARCH
  ================================================== */

  const [searchText, setSearchText] = useState("");

  /* ==================================================
     REFS
  ================================================== */

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ==================================================
     CURRENT TIME
  ================================================== */

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ==================================================
     LOGOUT
  ================================================== */

  const handleConfirmLogout = async () => {
    setLoggingOut(true);

    try {
      localStorage.removeItem("crm_login_time");

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Logout failed");
        setLoggingOut(false);
        setShowLogoutModal(false);
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong during logout.");
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  /* ==================================================
     MESSAGE DATE HELPERS
  ================================================== */

  const formatMessageDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSameMessageDate = (date1, date2) => {
    if (!date1 || !date2) return false;

    const first = new Date(date1);
    const second = new Date(date2);

    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  };

  /* ==================================================
     LOAD CONVERSATIONS
  ================================================== */

/* ==================================================
   LOAD CONVERSATIONS
================================================== */
const loadConversations = async () => {
  try {
    setLoadingConversations(true);

    /* ==================================================
       LOAD CONVERSATIONS
    ================================================== */

    const response = await fetch("/api/conversations", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load conversations"
      );
    }

    /* ==================================================
       CURRENT USER / ADMIN
    ================================================== */

    setIsAdmin(Boolean(data.isAdmin));
    setCurrentUser(data.currentUser || null);

    const currentUserId = Number(data.currentUser?.id);

    /* ==================================================
       LOAD USERS
    ================================================== */

    const usersResponse = await fetch("/api/new-users", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const usersData = await usersResponse.json();

    if (!usersResponse.ok || !usersData.success) {
      throw new Error(
        usersData.message || "Failed to load users"
      );
    }

    const allUsers = Array.isArray(usersData.users)
      ? usersData.users
      : [];

    setUsers(allUsers);

    console.log("=================================");
    console.log("CURRENT USER:", data.currentUser);
    console.log("CURRENT USER ID:", currentUserId);
    console.log("IS ADMIN:", data.isAdmin);
    console.log("ALL USERS:", allUsers);
    console.log(
      "API CONVERSATIONS:",
      data.conversations
    );
    console.log("=================================");

    /* ==================================================
       EXISTING CONVERSATIONS
    ================================================== */

    const existingConversations = Array.isArray(
      data.conversations
    )
      ? data.conversations
      : [];

    /* ==================================================
       GROUP CHATS
    ================================================== */

    const groupChatsMap = new Map();

    existingConversations
      .filter(
        (chat) =>
          String(chat.type).toLowerCase() === "group"
      )
      .forEach((chat) => {
        const conversationId = Number(chat.id);

        if (
          Number.isInteger(conversationId) &&
          conversationId > 0
        ) {
          groupChatsMap.set(conversationId, {
            ...chat,
            id: conversationId,
            conversationId: conversationId,
            type: "group",
          });
        }
      });

    const groupChats = Array.from(
      groupChatsMap.values()
    );

    /* ==================================================
       EXISTING DIRECT CHATS
    ================================================== */

    const existingDirectChats =
      existingConversations.filter(
        (chat) =>
          String(chat.type).toLowerCase() === "direct"
      );

    /* ==================================================
       DIRECT CHAT MAP
       
       IMPORTANT:
       userId => only ONE chat
    ================================================== */

    const directChatsMap = new Map();

    /* ==================================================
       FIRST:
       Add REAL DIRECT CONVERSATIONS
    ================================================== */

    existingDirectChats.forEach((chat) => {
      const memberUserId = chat.members?.find(
        (member) =>
          Number(member.user_id ?? member.id) !==
          currentUserId
      )?.user_id ?? chat.members?.find(
        (member) =>
          Number(member.user_id ?? member.id) !==
          currentUserId
      )?.id;

      const rawUserId =
        chat.user_id ??
        chat.userId ??
        chat.other_user_id ??
        chat.otherUserId ??
        memberUserId;

      const userId = Number(rawUserId);

      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        return;
      }

      /* Never show current user */
      if (userId === currentUserId) {
        return;
      }

      /*
        Real conversation gets priority.
        If same user already exists, don't add again.
      */

      if (!directChatsMap.has(userId)) {
        const otherUser = chat.members?.find(
          (member) =>
            Number(member.user_id ?? member.id) ===
            userId
        );

        directChatsMap.set(userId, {
          ...chat,

          id:
            Number(chat.id) > 0
              ? Number(chat.id)
              : null,

          conversationId:
            Number(chat.id) > 0
              ? Number(chat.id)
              : `direct-${userId}`,

          user_id: userId,
          userId: userId,

          name:
            otherUser?.name ||
            otherUser?.email ||
            chat.name ||
            "Unknown User",

          email:
            otherUser?.email ||
            chat.email ||
            "",

          phone:
            otherUser?.phone ||
            chat.phone ||
            "",

          initials:
            otherUser?.initials ||
            chat.initials ||
            (otherUser?.name ||
              otherUser?.email ||
              chat.name ||
              "U")
              .slice(0, 2)
              .toUpperCase(),

          type: "direct",

          messages: Array.isArray(chat.messages)
            ? chat.messages
            : [],

          unread_count:
            Number(chat.unread_count) || 0,
        });
      }
    });

    /* ==================================================
       SECOND:
       ADD USERS WITHOUT A REAL CONVERSATION
       
       These become fake direct chats.
    ================================================== */

    allUsers.forEach((user) => {
      const userId = Number(user.id);

      /* Invalid user */
      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        return;
      }

      /* Never show current logged-in user */
      if (userId === currentUserId) {
        return;
      }

      /*
        VERY IMPORTANT:
        If this user already has a real direct chat,
        DO NOT CREATE ANOTHER CHAT.
      */

      if (directChatsMap.has(userId)) {
        return;
      }

      const userName =
        user.name?.trim() || "Unknown";

      const initials =
        userName
          .slice(0, 2)
          .toUpperCase() || "U";

      directChatsMap.set(userId, {
        id: null,

        conversationId: `direct-${userId}`,

        user_id: userId,
        userId: userId,

        name: userName,

        email: user.email || "",

        phone: user.phone || "",

        role: user.role || "",

        type: "direct",

        initials,

        avatar_bg:
          "bg-emerald-100 text-emerald-600",

        avatarBg:
          "bg-emerald-100 text-emerald-600",

        lastMsg: "No messages yet",

        last_msg: "No messages yet",

        last_msg_time: null,

        unread_count: 0,

        messages: [],
      });
    });

    /* ==================================================
       FINAL DIRECT CHATS
    ================================================== */

    const directChats = Array.from(
      directChatsMap.values()
    );

    /* ==================================================
       FINAL CHATS
    ================================================== */

    const chats = [
      ...directChats,
      ...groupChats,
    ];

    console.log("=================================");
    console.log(
      "REAL DIRECT CHATS:",
      existingDirectChats
    );
    console.log(
      "UNIQUE DIRECT CHATS:",
      directChats
    );
    console.log(
      "GROUP CHATS:",
      groupChats
    );
    console.log(
      "FINAL CHATS:",
      chats
    );
    console.log(
      "FINAL CHAT COUNT:",
      chats.length
    );
    console.log("=================================");

    /* ==================================================
       SAVE CONVERSATIONS
    ================================================== */

    setConversations(chats);

    /* ==================================================
       KEEP SELECTED CHAT
    ================================================== */

    setSelectedChat((current) => {
      /* No chats */
      if (!chats.length) {
        return null;
      }

      /* Nothing selected */
      if (!current) {
        return chats[0];
      }

      const currentConversationId =
        Number(current.id);

      const currentUserIdFromChat =
        Number(
          current.user_id ??
          current.userId
        );

      /* ==================================================
         FIND UPDATED CHAT
      ================================================== */

      const updatedChat = chats.find((chat) => {
        const chatConversationId =
          Number(chat.id);

        const chatUserId =
          Number(
            chat.user_id ??
            chat.userId
          );

        /* -----------------------------------------------
           MATCH REAL CONVERSATION ID
        ------------------------------------------------ */

        if (
          Number.isInteger(
            currentConversationId
          ) &&
          currentConversationId > 0 &&
          Number.isInteger(
            chatConversationId
          ) &&
          chatConversationId > 0 &&
          chatConversationId ===
            currentConversationId
        ) {
          return true;
        }

        /* -----------------------------------------------
           MATCH USER ID
        ------------------------------------------------ */

        if (
          Number.isInteger(
            currentUserIdFromChat
          ) &&
          currentUserIdFromChat > 0 &&
          Number.isInteger(chatUserId) &&
          chatUserId > 0 &&
          chatUserId ===
            currentUserIdFromChat
        ) {
          return true;
        }

        /* -----------------------------------------------
           MATCH fake direct-userId
        ------------------------------------------------ */

        if (
          typeof current.conversationId ===
            "string" &&
          current.conversationId.startsWith(
            "direct-"
          ) &&
          typeof chat.conversationId ===
            "string" &&
          chat.conversationId ===
            current.conversationId
        ) {
          return true;
        }

        return false;
      });

      /* ==================================================
         RETURN UPDATED CHAT
      ================================================== */

      if (updatedChat) {
        return {
          ...updatedChat,

          /*
            Keep already loaded messages
            if they exist.
          */
          messages:
            Array.isArray(current.messages) &&
            current.messages.length > 0
              ? current.messages
              : Array.isArray(
                  updatedChat.messages
                )
              ? updatedChat.messages
              : [],
        };
      }

      /* ==================================================
         CURRENT CHAT NO LONGER EXISTS
         SELECT FIRST CHAT
      ================================================== */

      return chats[0];
    });
  } catch (error) {
    console.error(
      "Load Conversations Error:",
      error
    );
  } finally {
    setLoadingConversations(false);
  }
};

  /* ==================================================
     LOAD MESSAGES
  ================================================== */

  const loadMessages = async (chat) => {
    try {
      if (!chat) {
        return;
      }

      const conversationId = Number(chat.id);

      if (
        !Number.isInteger(conversationId) ||
        conversationId <= 0
      ) {
        setSelectedChat((current) =>
          current
            ? {
                ...current,
                messages: [],
              }
            : current
        );

        return;
      }

      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load messages"
        );
      }

      const messages = (data.messages || []).map((message) => ({
        id: message.id,
        conversation_id: message.conversation_id,

        sender:
          Number(message.sender_id) === Number(currentUser?.id)
            ? "me"
            : "them",

        senderId: Number(message.sender_id),

        senderName: message.sender_name || "",
        senderEmail: message.sender_email || "",

        text: message.text || "",

        time: message.created_at
          ? new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",

        type: message.msg_type || "text",

        fileName: message.file_name || null,
        fileSize: message.file_size || null,
        fileUrl: message.file_url || null,

        created_at: message.created_at || null,
      }));

      setSelectedChat((current) =>
        current
          ? {
              ...current,
              messages,
            }
          : current
      );
    } catch (error) {
      console.error("Load Messages Error:", error);
    }
  };

  /* ==================================================
     INITIAL LOAD
  ================================================== */

  useEffect(() => {
    loadConversations();
  }, []);

  /* ==================================================
     CHAT CHANGE
  ================================================== */

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat?.id]);

  /* ==================================================
     AUTO SCROLL
  ================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedChat?.messages, loadingMessages]);

  /* ==================================================
     SELECT CHAT
  ================================================== */

const handleSelectChat = async (chat) => {
  setSelectedChat(chat);
  setShowMobileChat(true);

  // Clear unread count locally
  setConversations((prev) =>
    prev.map((item) =>
      item.id === chat.id
        ? {
            ...item,
            unread_count: 0,
          }
        : item
    )
  );

  if (chat.id) {
    try {
      await fetch("/api/message/read", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: chat.id,
        }),
      });
    } catch (error) {
      console.error("Mark Messages Read Error:", error);
    }
  }

  // your existing message loading code...
};

  /* ==================================================
     SEND TEXT MESSAGE
  ================================================== */

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    const text = inputMessage.trim();

    if (!text || sendingMessage) {
      return;
    }

    const currentUserId = Number(currentUser?.id);

    const rawConversationId =
      selectedChat?.id ??
      selectedChat?.conversationId ??
      null;

    const rawTargetUserId =
      selectedChat?.user_id ??
      selectedChat?.userId ??
      null;

    let conversationId = null;
    let targetUserId = null;

    if (
      rawConversationId !== null &&
      rawConversationId !== undefined &&
      rawConversationId !== ""
    ) {
      const numericConversationId = Number(rawConversationId);

      if (
        Number.isInteger(numericConversationId) &&
        numericConversationId > 0
      ) {
        conversationId = numericConversationId;
      }
    }

    if (
      typeof rawConversationId === "string" &&
      rawConversationId.startsWith("direct-")
    ) {
      conversationId = null;
    }

    if (
      rawTargetUserId !== null &&
      rawTargetUserId !== undefined &&
      rawTargetUserId !== ""
    ) {
      const numericTargetUserId = Number(rawTargetUserId);

      if (
        Number.isInteger(numericTargetUserId) &&
        numericTargetUserId > 0
      ) {
        targetUserId = numericTargetUserId;
      }
    }

    console.log("SEND MESSAGE DEBUG:", {
      currentUserId,
      selectedChat,
      conversationId,
      targetUserId,
    });

    if (!conversationId && !targetUserId) {
      alert("No conversation or target user selected");
      return;
    }

    if (
      targetUserId &&
      targetUserId === currentUserId
    ) {
      alert("You cannot send a message to yourself");
      return;
    }

    try {
      setSendingMessage(true);

      const body = {
        text,
        msgType: "text",
      };

      if (conversationId) {
        body.conversationId = conversationId;
      }

      if (!conversationId && targetUserId) {
        body.targetUserId = targetUserId;
      }

      console.log("POST /api/messages BODY:", body);

      const response = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      console.log(
        "POST /api/messages RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send message"
        );
      }

      const realConversationId = Number(
        data.conversationId
      );

      const apiMessage = data.data;

      if (
        !Number.isInteger(realConversationId) ||
        realConversationId <= 0 ||
        !apiMessage
      ) {
        throw new Error(
          "API did not return a valid conversation/message"
        );
      }

      const newMessage = {
        id: Number(apiMessage.id),

        conversation_id: realConversationId,

        sender:
          Number(apiMessage.sender_id) === currentUserId
            ? "me"
            : "them",

        senderId: Number(apiMessage.sender_id),

        senderName:
          apiMessage.sender_name ||
          currentUser?.name ||
          "You",

        senderEmail:
          apiMessage.sender_email ||
          currentUser?.email ||
          "",

        text: apiMessage.text || text,

        time: apiMessage.created_at
          ? new Date(
              apiMessage.created_at
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : getCurrentTime(),

        type: apiMessage.msg_type || "text",

        fileName: apiMessage.file_name || null,
        fileSize: apiMessage.file_size || null,
        fileUrl: apiMessage.file_url || null,

        created_at: apiMessage.created_at || null,
      };

      /* ==================================================
         UPDATE SELECTED CHAT
      ================================================== */

      setSelectedChat((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          id: realConversationId,
          conversationId: realConversationId,

          messages: [
            ...(current.messages || []),
            newMessage,
          ],

          lastMsg: text,
          last_msg: text,

          last_msg_time:
            apiMessage.created_at || null,

          time: newMessage.time,
        };
      });

      /* ==================================================
         UPDATE SIDEBAR
      ================================================== */

setConversations((prev) =>
  prev.map((chat) => {
    if (
      chat.id === newMessage.conversation_id &&
      selectedChat?.id !== newMessage.conversation_id
    ) {
      return {
        ...chat,
        unread_count: Number(chat.unread_count || 0) + 1,
        lastMsg: newMessage.text || "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }

    return chat;
  })
);

      setInputMessage("");
    } catch (error) {
      console.error(
        "Send Message Error:",
        error
      );

      alert(
        error.message ||
          "Message send failed"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  /* ==================================================
     FILE UPLOAD
  ================================================== */

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (
      !file ||
      !selectedChat ||
      sendingMessage
    ) {
      return;
    }

    const conversationId = Number(
      selectedChat.id
    );

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0
    ) {
      alert(
        "Please send a message first to create the conversation."
      );

      e.target.value = "";
      return;
    }

    try {
      setSendingMessage(true);

      const formData = new FormData();

      formData.append(
        "conversationId",
        String(conversationId)
      );

      formData.append("file", file);
      formData.append("text", "");

      const response = await fetch(
        "/api/messages",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "File upload failed"
        );
      }

      const apiMessage = data.data;

      const messageType =
        apiMessage.msg_type ||
        (file.type.startsWith("image/")
          ? "image"
          : "file");

      const newMessage = {
        id: Number(apiMessage.id),

        conversation_id: conversationId,

        sender:
          Number(apiMessage.sender_id) ===
          Number(currentUser?.id)
            ? "me"
            : "them",

        senderId: Number(apiMessage.sender_id),

        senderName:
          apiMessage.sender_name ||
          currentUser?.name ||
          "You",

        senderEmail:
          apiMessage.sender_email ||
          currentUser?.email ||
          "",

        text: apiMessage.text || "",

        time: apiMessage.created_at
          ? new Date(
              apiMessage.created_at
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : getCurrentTime(),

        type: messageType,

        fileName:
          apiMessage.file_name ||
          file.name,

        fileSize:
          apiMessage.file_size ||
          `${(file.size / 1024).toFixed(1)} KB`,

        fileUrl:
          apiMessage.file_url ||
          null,

        created_at:
          apiMessage.created_at ||
          null,
      };

      const previewText =
        messageType === "image"
          ? "📷 Image"
          : `📎 ${newMessage.fileName}`;

      setSelectedChat((current) =>
        current
          ? {
              ...current,

              messages: [
                ...(current.messages || []),
                newMessage,
              ],

              last_msg: previewText,
              lastMsg: previewText,

              last_msg_time:
                apiMessage.created_at ||
                null,

              time: newMessage.time,
            }
          : current
      );

      setConversations((prev) =>
        prev.map((chat) =>
          Number(chat.id) ===
          conversationId
            ? {
                ...chat,

                messages: [
                  ...(chat.messages || []),
                  newMessage,
                ],

                last_msg: previewText,
                lastMsg: previewText,

                last_msg_time:
                  apiMessage.created_at ||
                  null,

                time: newMessage.time,
              }
            : chat
        )
      );

      e.target.value = "";
    } catch (error) {
      console.error(
        "File Upload Error:",
        error
      );

      alert(
        error.message ||
          "File upload failed"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  /* ==================================================
     ADD MEMBER TO EXISTING GROUP
  ================================================== */

  const handleAddMemberToExistingGroup = async (e) => {
    e.preventDefault();

    if (
      !newMemberName.trim() ||
      !newMemberPhone.trim() ||
      !selectedChat
    ) {
      return;
    }

    const conversationId = Number(
      selectedChat.id
    );

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0
    ) {
      alert("Invalid group conversation.");
      return;
    }

    try {
      setSendingMessage(true);

      const response = await fetch(
        "/api/conversations/members",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            name: newMemberName.trim(),
            phone: newMemberPhone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to add member"
        );
      }

      const newMember = data.member;

      const updatedChat = {
        ...selectedChat,

        members: [
          ...(selectedChat.members || []),
          newMember,
        ],
      };

      setSelectedChat(updatedChat);

      setConversations((prev) =>
        prev.map((chat) =>
          Number(chat.id) === conversationId
            ? updatedChat
            : chat
        )
      );

      setNewMemberName("");
      setNewMemberPhone("");
      setIsAddMemberModalOpen(false);

      await loadConversations();
    } catch (error) {
      console.error(
        "Add Member Error:",
        error
      );

      alert(
        error.message ||
          "Failed to add member"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  /* ==================================================
     CUSTOM MEMBER
  ================================================== */

  const handleAddCustomMember = () => {
    if (
      !customName.trim() ||
      !customPhone.trim()
    ) {
      return;
    }

    const newMember = {
      id: `custom-${Date.now()}`,

      name: customName.trim(),

      phone: customPhone.trim(),

      role: "member",

      avatarBg:
        "bg-blue-100 text-blue-600",

      initials:
        customName
          .trim()
          .slice(0, 2)
          .toUpperCase(),

      isCustom: true,
    };

    setCustomMembersList((prev) => [
      ...prev,
      newMember,
    ]);

    setCustomName("");
    setCustomPhone("");
  };

  /* ==================================================
     REMOVE CUSTOM MEMBER
  ================================================== */

  const removeCustomMember = (memberId) => {
    setCustomMembersList((prev) =>
      prev.filter(
        (member) =>
          member.id !== memberId
      )
    );
  };

  /* ==================================================
     TOGGLE EXISTING MEMBER
  ================================================== */

  const handleMemberToggle = (contact) => {
    const contactId =
      contact?.user_id ??
      contact?.id;

    if (!contactId) {
      return;
    }

    const exists = selectedMembers.some(
      (member) =>
        Number(
          member.user_id ??
          member.id
        ) === Number(contactId)
    );

    if (exists) {
      setSelectedMembers((prev) =>
        prev.filter(
          (member) =>
            Number(
              member.user_id ??
              member.id
            ) !== Number(contactId)
        )
      );
    } else {
      setSelectedMembers((prev) => [
        ...prev,
        contact,
      ]);
    }
  };

  /* ==================================================
     CREATE GROUP
  ================================================== */

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    const existingMemberIds = [
      ...new Set(
        selectedMembers
          .map((member) => {
            const rawId =
              member?.user_id ??
              member?.id;

            const numericId =
              Number(rawId);

            if (
              Number.isInteger(numericId) &&
              numericId > 0
            ) {
              return numericId;
            }

            return null;
          })
          .filter(
            (id) => id !== null
          )
      ),
    ];

    console.log(
      "SELECTED MEMBERS:",
      selectedMembers
    );

    console.log(
      "GROUP MEMBER IDS:",
      existingMemberIds
    );

    if (
      existingMemberIds.length === 0
    ) {
      alert(
        "Please select at least one existing user."
      );
      return;
    }

    try {
      setSendingMessage(true);

      const response = await fetch(
        "/api/conversations",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type: "group",
            name: groupName.trim(),
            members:
              existingMemberIds,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "CREATE GROUP RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        if (
          data.invalidUsers?.length
        ) {
          throw new Error(
            `Invalid user IDs: ${data.invalidUsers.join(
              ", "
            )}`
          );
        }

        throw new Error(
          data.message ||
            "Group creation failed"
        );
      }

      const createdGroupId =
        Number(
          data.conversationId
        );

      if (
        !Number.isInteger(
          createdGroupId
        ) ||
        createdGroupId <= 0
      ) {
        throw new Error(
          "Invalid conversation ID returned by server"
        );
      }

      /* ==================================================
         CREATE TEMP GROUP OBJECT
      ================================================== */

      const createdGroup = {
        id: createdGroupId,

        conversationId:
          createdGroupId,

        type: "group",

        name:
          groupName.trim(),

        initials:
          groupName
            .trim()
            .slice(0, 2)
            .toUpperCase(),

        avatarBg:
          "bg-rose-100 text-rose-600",

        avatar_bg:
          "bg-rose-100 text-rose-600",

        members:
          data.conversation
            ?.members || [],

        messages: [],

        unread_count: 0,

        lastMsg:
          "No messages yet",

        last_msg:
          "No messages yet",

        last_msg_time: null,
      };

      /* ==================================================
         ADD GROUP TO SIDEBAR IMMEDIATELY
      ================================================== */

      setConversations((prev) => [
        ...prev.filter(
          (chat) =>
            Number(chat.id) !==
            createdGroupId
        ),
        createdGroup,
      ]);

      setSelectedChat(
        createdGroup
      );

      setShowMobileChat(true);

      /* ==================================================
         LOAD MESSAGES
      ================================================== */

      await loadMessages(
        createdGroup
      );

      /* ==================================================
         REFRESH CONVERSATIONS
      ================================================== */

      await loadConversations();

      /* ==================================================
         RESET MODAL
      ================================================== */

      setGroupName("");
      setSelectedMembers([]);
      setCustomMembersList([]);
      setCustomName("");
      setCustomPhone("");
      setIsGroupModalOpen(false);
    } catch (error) {
      console.error(
        "Create Group Error:",
        error
      );

      alert(
        error.message ||
          "Group creation failed"
      );
    } finally {
      setSendingMessage(false);
    }
  };





  const uniqueConversations = useMemo(() => {
  const seen = new Set();

  return conversations.filter((chat) => {
    // Group ke liye group ID use karo
    const key =
      chat.type === "group"
        ? `group-${chat.id}`
        : `user-${chat.user_id || chat.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}, [conversations]);

const filteredConversations = useMemo(() => {
  const term = searchText.trim().toLowerCase();

  return uniqueConversations.filter((chat) => {
    // Group tab
    if (activeTab === "Group" && chat.type !== "group") {
      return false;
    }

    // Search
    if (!term) {
      return true;
    }

    return (
      chat.name?.toLowerCase().includes(term) ||
      chat.email?.toLowerCase().includes(term) ||
      chat.phone?.toLowerCase().includes(term) ||
      chat.lastMsg?.toLowerCase().includes(term) ||
      chat.last_msg?.toLowerCase().includes(term)
    );
  });
}, [
  uniqueConversations,
  searchText,
  activeTab,
]);
  /* ==================================================
     FILTER CONVERSATIONS
  ================================================== */


  console.log(
    "FILTERED CONVERSATIONS:",
    filteredConversations
  );

  console.log(
    "FILTERED LENGTH:",
    filteredConversations.length
  );

// export default function MessagesDashboard() {
//   const router = useRouter();
//   /* ==================================================
//      CONVERSATIONS
//   ================================================== */

//     const [sidebarOpen, setSidebarOpen] = useState(false);
//       const [showLogoutModal, setShowLogoutModal] = useState(false);
//         const [loggingOut, setLoggingOut] = useState(false);

//   const [conversations, setConversations] =
//     useState([]);
//     const [users, setUsers] = useState([]);
// const [isAdmin, setIsAdmin] = useState(false);
// const [currentUser, setCurrentUser] = useState(null);

//   const [activeTab, setActiveTab] =
//     useState("All");

//   const [selectedChat, setSelectedChat] =
//     useState(null);

//   /* ==================================================
//      MESSAGE STATES
//   ================================================== */

//   const [inputMessage, setInputMessage] =
//     useState("");

//   const [loadingConversations, setLoadingConversations] =
//     useState(true);

//   const [loadingMessages, setLoadingMessages] =
//     useState(false);

//   const [sendingMessage, setSendingMessage] =
//     useState(false);

//   const [showMobileChat, setShowMobileChat] =
//     useState(false);

//   /* ==================================================
//      GROUP CREATE STATES
//   ================================================== */

//   const [isGroupModalOpen, setIsGroupModalOpen] =
//     useState(false);

//   const [groupName, setGroupName] =
//     useState("");

//   const [selectedMembers, setSelectedMembers] =
//     useState([]);

//   const [customName, setCustomName] =
//     useState("");

//   const [customPhone, setCustomPhone] =
//     useState("");

//   const [customMembersList, setCustomMembersList] =
//     useState([]);

//   /* ==================================================
//      GROUP INFO
//   ================================================== */

//   const [isGroupInfoOpen, setIsGroupInfoOpen] =
//     useState(false);

//   /* ==================================================
//      ADD MEMBER
//   ================================================== */

//   const [isAddMemberModalOpen, setIsAddMemberModalOpen] =
//     useState(false);

//   const [newMemberName, setNewMemberName] =
//     useState("");

//   const [newMemberPhone, setNewMemberPhone] =
//     useState("");

//   /* ==================================================
//      SEARCH
//   ================================================== */

//   const [searchText, setSearchText] =
//     useState("");

//   /* ==================================================
//      REFS
//   ================================================== */

//   const fileInputRef =
//     useRef(null);

//   const messagesEndRef =
//     useRef(null);

//   /* ==================================================
//      CURRENT TIME
//   ================================================== */

//   const getCurrentTime = () => {
//     return new Date().toLocaleTimeString(
//       [],
//       {
//         hour: "2-digit",
//         minute: "2-digit",
//       }
//     );
//   };


//     const handleConfirmLogout = async () => {
//   setLoggingOut(true);

//   try {
//     localStorage.removeItem("crm_login_time");

//     const response = await fetch("/api/logout", {
//       method: "POST",
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       alert(data.message || "Logout failed");
//       setLoggingOut(false);
//       setShowLogoutModal(false);
//       return;
//     }

//     router.push("/login");
//   } catch (error) {
//     console.error("Logout error:", error);
//     alert("Something went wrong during logout.");
//     setLoggingOut(false);
//     setShowLogoutModal(false);
//   }
// };
// /* ==================================================
//    MESSAGE DATE HELPERS
// ================================================== */

// const formatMessageDate = (dateValue) => {
//   if (!dateValue) return "";

//   const date = new Date(dateValue);

//   if (Number.isNaN(date.getTime())) {
//     return "";
//   }

//   return date.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// };

// const isSameMessageDate = (date1, date2) => {
//   if (!date1 || !date2) return false;

//   const first = new Date(date1);
//   const second = new Date(date2);

//   return (
//     first.getFullYear() === second.getFullYear() &&
//     first.getMonth() === second.getMonth() &&
//     first.getDate() === second.getDate()
//   );
// };
//   /* ==================================================
//      LOAD CONVERSATIONS
//   ================================================== */

// const loadConversations = async () => {
//   try {
//     setLoadingConversations(true);

//     // ==================================================
//     // CURRENT USER + GROUP CONVERSATIONS
//     // ==================================================

//     const response = await fetch("/api/conversations", {
//       method: "GET",
//       credentials: "include",
//       cache: "no-store",
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(
//         data.message || "Failed to load conversations"
//       );
//     }

//     setIsAdmin(Boolean(data.isAdmin));
//     setCurrentUser(data.currentUser || null);

//     // ==================================================
//     // ALL USERS
//     // ==================================================

//     const usersResponse = await fetch("/api/new-users", {
//       method: "GET",
//       credentials: "include",
//       cache: "no-store",
//     });

//     const usersData = await usersResponse.json();

//     if (!usersResponse.ok || !usersData.success) {
//       throw new Error(
//         usersData.message || "Failed to load users"
//       );
//     }

//     const allUsers = Array.isArray(usersData.users)
//       ? usersData.users
//       : [];

//     setUsers(allUsers);

//     console.log("CURRENT USER:", data.currentUser);
//     console.log("IS ADMIN:", data.isAdmin);
//     console.log("NEW USERS:", allUsers);

//     // ==================================================
//     // DIRECT CONVERSATIONS FROM /api/new-users
//     // ==================================================

//     const directChats = allUsers
//       .filter((user) => {
//         // Current user ko khud se direct chat mein show na karo
//         return Number(user.id) !== Number(data.currentUser?.id);
//       })
//       .map((user) => {
//         const initials =
//           user.name
//             ?.trim()
//             .slice(0, 2)
//             .toUpperCase() || "U";

//         return {
//          conversationId: `direct-${user.id}`,

//           // IMPORTANT
//           user_id: user.id,

//           name: user.name || "Unknown",

//           email: user.email || "",

//           phone: user.phone || "",

//           role: user.role || "",

//           type: "direct",

//           initials,

//           avatar_bg:
//             "bg-emerald-100 text-emerald-600",

//           lastMsg: "No messages yet",

//           last_msg: "No messages yet",

//           last_msg_time: null,

//           unread_count: 0,

//           messages: [],
//         };
//       });

//     // ==================================================
//     // GROUP / EXISTING CONVERSATIONS
//     // ==================================================

//     const existingConversations = Array.isArray(
//       data.conversations
//     )
//       ? data.conversations
//       : [];

//     // Sirf group conversations rakhein
//     const groupChats = existingConversations.filter(
//       (chat) => chat.type === "group"
//     );

//     // ==================================================
//     // MERGE DIRECT + GROUP
//     // ==================================================

//     const chats = [
//       ...directChats,
//       ...groupChats,
//     ];

//     console.log("DIRECT CHATS:", directChats);
//     console.log("GROUP CHATS:", groupChats);
//     console.log("FINAL CHATS:", chats);

//     setConversations(chats);

//     // ==================================================
//     // KEEP SELECTED CHAT
//     // ==================================================

//     setSelectedChat((current) => {
//       if (!chats.length) {
//         return null;
//       }

//       if (!current) {
//         return chats[0];
//       }

//       const updatedChat = chats.find(
//         (chat) =>
//           String(chat.id) === String(current.id)
//       );

//       if (updatedChat) {
//         return {
//           ...updatedChat,
//           messages: current.messages || [],
//         };
//       }

//       return chats[0];
//     });

//   } catch (error) {
//     console.error(
//       "Load Conversations Error:",
//       error
//     );
//   } finally {
//     setLoadingConversations(false);
//   }
// };

//   /* ==================================================
//      LOAD MESSAGES
//   ================================================== */

//  const loadMessages = async (
//   chat
// ) => {
//   try {
//     if (!chat) {
//       return;
//     }

//     /*
//     New user:
//     No conversation yet.
//     */

//     if (
//       !chat.id &&
//       chat.targetUserId
//     ) {
//       setSelectedChat(
//         (current) =>
//           current
//             ? {
//                 ...current,
//                 messages: [],
//               }
//             : current
//       );

//       return;
//     }

//     /*
//     Existing conversation
//     */

//     const conversationId =
//       Number(chat.id);

//     if (
//       !Number.isInteger(
//         conversationId
//       ) ||
//       conversationId <= 0
//     ) {
//       console.error(
//         "Invalid conversation ID:",
//         chat.id
//       );

//       return;
//     }

//     const response =
//       await fetch(
//         `/api/messages?conversationId=${conversationId}`,
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         }
//       );

//     const data =
//       await response.json();

//     if (
//       !response.ok ||
//       !data.success
//     ) {
//       throw new Error(
//         data.message ||
//           "Failed to load messages"
//       );
//     }

//     const messages =
//       (data.messages || []).map(
//         (message) => ({
//           id: message.id,

//           sender:
//             Number(
//               message.sender_id
//             ) ===
//             Number(
//               currentUser?.id
//             )
//               ? "me"
//               : "them",

//           senderId:
//             Number(
//               message.sender_id
//             ),

//           senderName:
//             message.sender_name ||
//             "",

//           senderEmail:
//             message.sender_email ||
//             "",

//           text:
//             message.text || "",

//           time:
//             message.created_at
//               ? new Date(
//                   message.created_at
//                 ).toLocaleTimeString(
//                   [],
//                   {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   }
//                 )
//               : "",

//           type:
//             message.msg_type ||
//             "text",

//           fileName:
//             message.file_name ||
//             null,

//           fileSize:
//             message.file_size ||
//             null,

//           fileUrl:
//             message.file_url ||
//             null,

//           created_at:
//             message.created_at ||
//             null,
//         })
//       );

//     setSelectedChat(
//       (current) =>
//         current
//           ? {
//               ...current,
//               messages,
//             }
//           : current
//     );
//   } catch (error) {
//     console.error(
//       "Load Messages Error:",
//       error
//     );
//   }
// };

//   /* ==================================================
//      INITIAL LOAD
//   ================================================== */

//   useEffect(() => {
//     loadConversations();
//   }, []);

//   /* ==================================================
//      CHAT CHANGE
//   ================================================== */

//   useEffect(() => {
//     if (selectedChat?.id) {
//       loadMessages(
//         selectedChat.id
//       );
//     }
//   }, [selectedChat?.id]);

//   /* ==================================================
//      AUTO SCROLL
//   ================================================== */

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView(
//       {
//         behavior: "smooth",
//       }
//     );
//   }, [
//     selectedChat?.messages,
//     loadingMessages,
//   ]);

//   /* ==================================================
//      SELECT CHAT
//   ================================================== */

// //   const handleSelectChat = (
// //     chat
// //   ) => {
// //     setSelectedChat(chat);
// //     setShowMobileChat(true);

// //     if (chat?.id) {
// //       loadMessages(chat.id);
// //     }
// //   };
// const handleSelectChat = (chat) => {
//   setSelectedChat(chat);
//   setShowMobileChat(true);
// };
//   /* ==================================================
//      SEND TEXT MESSAGE
//   ================================================== */

// // const handleSendMessage = async (e) => {
// //   e?.preventDefault();

// //   const text = inputMessage.trim();

// //   if (!text || sendingMessage) {
// //     return;
// //   }

// //   // ============================================
// //   // CURRENT USER
// //   // ============================================

// //   const currentUserId =
// //     Number(currentUser?.id);

// //   // ============================================
// //   // REAL DB CONVERSATION ID
// //   // ============================================

// //   const rawConversationId =
// //     selectedChat?.id;

// //   const conversationId =
// //     rawConversationId &&
// //     Number.isInteger(
// //       Number(rawConversationId)
// //     ) &&
// //     Number(rawConversationId) > 0
// //       ? Number(rawConversationId)
// //       : null;

// //   // ============================================
// //   // TARGET USER
// //   // ============================================

// //   const targetUserId =
// //     selectedChat?.user_id
// //       ? Number(selectedChat.user_id)
// //       : null;

// //   console.log("SEND DEBUG:", {
// //     currentUserId,
// //     selectedChat,
// //     conversationId,
// //     targetUserId,
// //   });

// //   // ============================================
// //   // VALIDATION
// //   // ============================================

// //   if (
// //     !conversationId &&
// //     !targetUserId
// //   ) {
// //     console.error(
// //       "Cannot send message:",
// //       {
// //         currentUser,
// //         selectedChat,
// //       }
// //     );

// //     alert(
// //       "No conversation or target user selected"
// //     );

// //     return;
// //   }

// //   // ============================================
// //   // CANNOT MESSAGE SELF
// //   // ============================================

// //   if (
// //     targetUserId &&
// //     targetUserId === currentUserId
// //   ) {
// //     alert(
// //       "You cannot send a message to yourself"
// //     );

// //     return;
// //   }

// //   try {
// //     setSendingMessage(true);

// //     const body = {
// //       text,
// //       msgType: "text",
// //     };

// //     // Existing real conversation
// //     if (conversationId) {
// //       body.conversationId =
// //         conversationId;
// //     }

// //     // New direct chat
// //     if (
// //       !conversationId &&
// //       targetUserId
// //     ) {
// //       body.targetUserId =
// //         targetUserId;
// //     }

// //     console.log(
// //       "POST /api/messages BODY:",
// //       body
// //     );

// //     const response =
// //       await fetch(
// //         "/api/messages",
// //         {
// //           method: "POST",

// //           credentials: "include",

// //           headers: {
// //             "Content-Type":
// //               "application/json",
// //           },

// //           body: JSON.stringify(body),
// //         }
// //       );

// //     const data =
// //       await response.json();

// //     console.log(
// //       "POST /api/messages RESPONSE:",
// //       data
// //     );

// //     if (
// //       !response.ok ||
// //       !data.success
// //     ) {
// //       throw new Error(
// //         data.message ||
// //           "Failed to send message"
// //       );
// //     }

// //     // ============================================
// //     // API RETURNS REAL DB CONVERSATION ID
// //     // ============================================

// //     const realConversationId =
// //       Number(
// //         data.conversationId
// //       );

// //     const apiMessage =
// //       data.data;

// //     const newMessage = {
// //       id:
// //         Number(apiMessage.id),

// //       sender:
// //         Number(
// //           apiMessage.sender_id
// //         ) === currentUserId
// //           ? "me"
// //           : "them",

// //       senderId:
// //         Number(
// //           apiMessage.sender_id
// //         ),

// //       senderName:
// //         apiMessage.sender_name ||
// //         currentUser?.name ||
// //         "You",

// //       senderEmail:
// //         apiMessage.sender_email ||
// //         currentUser?.email ||
// //         "",

// //       text:
// //         apiMessage.text ||
// //         text,

// //       time:
// //         apiMessage.created_at
// //           ? new Date(
// //               apiMessage.created_at
// //             ).toLocaleTimeString(
// //               [],
// //               {
// //                 hour: "2-digit",
// //                 minute: "2-digit",
// //               }
// //             )
// //           : getCurrentTime(),

// //       type:
// //         apiMessage.msg_type ||
// //         "text",

// //       fileName:
// //         apiMessage.file_name ||
// //         null,

// //       fileSize:
// //         apiMessage.file_size ||
// //         null,

// //       fileUrl:
// //         apiMessage.file_url ||
// //         null,

// //       created_at:
// //         apiMessage.created_at ||
// //         null,
// //     };

// //     // ============================================
// //     // UPDATE SELECTED CHAT
// //     // ============================================

// //     setSelectedChat(
// //       (current) => {
// //         if (!current) {
// //           return current;
// //         }

// //         return {
// //           ...current,

// //           // IMPORTANT
// //           id:
// //             realConversationId ||
// //             current.id ||
// //             null,

// //           // Remove fake direct-X value
// //           conversationId:
// //             realConversationId ||
// //             null,

// //           messages: [
// //             ...(current.messages ||
// //               []),
// //             newMessage,
// //           ],

// //           lastMsg:
// //             text,

// //           last_msg:
// //             text,

// //           last_msg_time:
// //             apiMessage.created_at ||
// //             null,

// //           time:
// //             newMessage.time,
// //         };
// //       }
// //     );

// //     // ============================================
// //     // UPDATE SIDEBAR
// //     // ============================================

// //     setConversations(
// //       (prev) =>
// //         prev.map((chat) => {
// //           const chatUserId =
// //             Number(
// //               chat.user_id
// //             );

// //           const chatConversationId =
// //             Number(
// //               chat.id
// //             );

// //           /*
// //           Match either:
// //           1. Real conversation ID
// //           2. Same target user
// //           */

// //           const isSameChat =
// //             (
// //               realConversationId &&
// //               chatConversationId ===
// //                 realConversationId
// //             ) ||
// //             (
// //               targetUserId &&
// //               chatUserId ===
// //                 targetUserId
// //             );

// //           if (!isSameChat) {
// //             return chat;
// //           }

// //           return {
// //             ...chat,

// //             id:
// //               realConversationId ||
// //               chat.id,

// //             conversationId:
// //               realConversationId ||
// //               null,

// //             messages: [
// //               ...(chat.messages ||
// //                 []),
// //               newMessage,
// //             ],

// //             lastMsg:
// //               text,

// //             last_msg:
// //               text,

// //             last_msg_time:
// //               apiMessage.created_at ||
// //               null,

// //             time:
// //               newMessage.time,

// //             unread_count:
// //               0,
// //           };
// //         })
// //     );

// //     setInputMessage("");
// //   } catch (error) {
// //     console.error(
// //       "Send Message Error:",
// //       error
// //     );

// //     alert(
// //       error.message ||
// //         "Message send failed"
// //     );
// //   } finally {
// //     setSendingMessage(false);
// //   }
// // };


// const handleSendMessage = async (e) => {
//   e?.preventDefault();

//   const text = inputMessage.trim();

//   if (!text || sendingMessage) {
//     return;
//   }

//   // ============================================
//   // CURRENT USER
//   // ============================================

//   const currentUserId = Number(currentUser?.id);

//   // ============================================
//   // REAL CONVERSATION ID
//   // ============================================

//   const rawConversationId =
//     selectedChat?.id ??
//     selectedChat?.conversationId;

//   let conversationId = null;

//   // Only accept REAL numeric DB ID
//   if (
//     rawConversationId !== null &&
//     rawConversationId !== undefined &&
//     rawConversationId !== ""
//   ) {
//     const numericConversationId =
//       Number(rawConversationId);

//     if (
//       Number.isInteger(numericConversationId) &&
//       numericConversationId > 0
//     ) {
//       conversationId =
//         numericConversationId;
//     }
//   }

//   // ============================================
//   // TARGET USER
//   // ============================================

//   const rawTargetUserId =
//     selectedChat?.user_id ??
//     selectedChat?.userId;

//   let targetUserId = null;

//   if (
//     rawTargetUserId !== null &&
//     rawTargetUserId !== undefined &&
//     rawTargetUserId !== ""
//   ) {
//     const numericTargetUserId =
//       Number(rawTargetUserId);

//     if (
//       Number.isInteger(numericTargetUserId) &&
//       numericTargetUserId > 0
//     ) {
//       targetUserId =
//         numericTargetUserId;
//     }
//   }

//   // ============================================
//   // IMPORTANT:
//   // fake direct-X IDs are NOT DB IDs
//   // ============================================

//   if (
//     typeof rawConversationId === "string" &&
//     rawConversationId.startsWith("direct-")
//   ) {
//     conversationId = null;
//   }

//   console.log("================================");
//   console.log("SEND MESSAGE DEBUG");
//   console.log("currentUserId:", currentUserId);
//   console.log("selectedChat:", selectedChat);
//   console.log(
//     "rawConversationId:",
//     rawConversationId
//   );
//   console.log(
//     "conversationId:",
//     conversationId
//   );
//   console.log(
//     "targetUserId:",
//     targetUserId
//   );
//   console.log("================================");

//   // ============================================
//   // VALIDATION
//   // ============================================

//   if (!conversationId && !targetUserId) {
//     console.error(
//       "Cannot send message:",
//       {
//         currentUser,
//         selectedChat,
//       }
//     );

//     alert(
//       "No conversation or target user selected"
//     );

//     return;
//   }

//   // ============================================
//   // CANNOT MESSAGE SELF
//   // ============================================

//   if (
//     targetUserId &&
//     targetUserId === currentUserId
//   ) {
//     alert(
//       "You cannot send a message to yourself"
//     );

//     return;
//   }

//   try {
//     setSendingMessage(true);

//     const body = {
//       text,
//       msgType: "text",
//     };

//     // ============================================
//     // EXISTING REAL CONVERSATION
//     // ============================================

//     if (conversationId) {
//       body.conversationId =
//         conversationId;
//     }

//     // ============================================
//     // NEW DIRECT CHAT
//     // ============================================

//     if (!conversationId && targetUserId) {
//       body.targetUserId =
//         targetUserId;
//     }

//     console.log(
//       "POST /api/messages BODY:",
//       body
//     );

//     const response =
//       await fetch(
//         "/api/messages",
//         {
//           method: "POST",

//           credentials: "include",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify(body),
//         }
//       );

//     const data =
//       await response.json();

//     console.log(
//       "POST /api/messages RESPONSE:",
//       data
//     );

//     if (
//       !response.ok ||
//       !data.success
//     ) {
//       throw new Error(
//         data.message ||
//           "Failed to send message"
//       );
//     }

//     // ============================================
//     // REAL DB CONVERSATION ID FROM API
//     // ============================================

//     const realConversationId =
//       Number(data.conversationId);

//     const apiMessage =
//       data.data;

//     if (
//       !apiMessage ||
//       !realConversationId
//     ) {
//       throw new Error(
//         "API did not return a valid conversation/message"
//       );
//     }

//     // ============================================
//     // FORMAT MESSAGE
//     // ============================================

//     const newMessage = {
//       id:
//         Number(apiMessage.id),

//       conversation_id:
//         realConversationId,

//       sender:
//         Number(
//           apiMessage.sender_id
//         ) === currentUserId
//           ? "me"
//           : "them",

//       senderId:
//         Number(
//           apiMessage.sender_id
//         ),

//       senderName:
//         apiMessage.sender_name ||
//         currentUser?.name ||
//         "You",

//       senderEmail:
//         apiMessage.sender_email ||
//         currentUser?.email ||
//         "",

//       text:
//         apiMessage.text ||
//         text,

//       time:
//         apiMessage.created_at
//           ? new Date(
//               apiMessage.created_at
//             ).toLocaleTimeString(
//               [],
//               {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }
//             )
//           : getCurrentTime(),

//       type:
//         apiMessage.msg_type ||
//         "text",

//       fileName:
//         apiMessage.file_name ||
//         null,

//       fileSize:
//         apiMessage.file_size ||
//         null,

//       fileUrl:
//         apiMessage.file_url ||
//         null,

//       created_at:
//         apiMessage.created_at ||
//         null,
//     };

//     // ============================================
//     // UPDATE SELECTED CHAT
//     // ============================================

//     setSelectedChat((current) => {
//       if (!current) {
//         return current;
//       }

//       return {
//         ...current,

//         // REAL DB ID
//         id:
//           realConversationId,

//         // Keep same value
//         conversationId:
//           realConversationId,

//         messages: [
//           ...(current.messages || []),
//           newMessage,
//         ],

//         lastMsg:
//           text,

//         last_msg:
//           text,

//         last_msg_time:
//           apiMessage.created_at ||
//           null,

//         time:
//           newMessage.time,
//       };
//     });

//     // ============================================
//     // UPDATE SIDEBAR
//     // ============================================

//     setConversations((prev) =>
//       prev.map((chat) => {
//         const chatUserId =
//           Number(
//             chat.user_id ??
//             chat.userId
//           );

//         const chatConversationId =
//           Number(
//             chat.id ??
//             chat.conversationId
//           );

//         const isSameChat =
//           (
//             realConversationId &&
//             chatConversationId ===
//               realConversationId
//           ) ||
//           (
//             targetUserId &&
//             chatUserId ===
//               targetUserId
//           );

//         if (!isSameChat) {
//           return chat;
//         }

//         return {
//           ...chat,

//           // REAL DB ID
//           id:
//             realConversationId,

//           conversationId:
//             realConversationId,

//           messages: [
//             ...(chat.messages || []),
//             newMessage,
//           ],

//           lastMsg:
//             text,

//           last_msg:
//             text,

//           last_msg_time:
//             apiMessage.created_at ||
//             null,

//           time:
//             newMessage.time,

//           unread_count: 0,
//         };
//       })
//     );

//     setInputMessage("");
//   } catch (error) {
//     console.error(
//       "Send Message Error:",
//       error
//     );

//     alert(
//       error.message ||
//         "Message send failed"
//     );
//   } finally {
//     setSendingMessage(false);
//   }
// };
//   /* ==================================================
//      FILE UPLOAD
//   ================================================== */

//   const handleFileUpload =
//     async (e) => {
//       const file =
//         e.target.files?.[0];

//       if (
//         !file ||
//         !selectedChat ||
//         sendingMessage
//       ) {
//         return;
//       }

//       try {
//         setSendingMessage(true);

//         const formData =
//           new FormData();

//         formData.append(
//           "conversationId",
//           String(selectedChat.id)
//         );

//         formData.append(
//           "file",
//           file
//         );

//         formData.append(
//           "text",
//           ""
//         );

//         const response =
//           await fetch(
//             "/api/messages",
//             {
//               method: "POST",
//               credentials:
//                 "include",
//               body: formData,
//             }
//           );

//         const data =
//           await response.json();

//         if (
//           !response.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "File upload failed"
//           );
//         }

//         const apiMessage =
//           data.data;

//         const messageType =
//           apiMessage.msg_type ||
//           (file.type.startsWith(
//             "image/"
//           )
//             ? "image"
//             : "file");

//         const newMessage = {
//           id:
//             apiMessage.id,

//      sender:
//   Number(apiMessage.sender_id) === Number(currentUser?.id)
//     ? "me"
//     : "them",

// senderId:
//   apiMessage.sender_id,
//           senderName:
//             apiMessage.sender_name ||
//             "You",

//           senderEmail:
//             apiMessage.sender_email ||
//             "",

//           text:
//             apiMessage.text ||
//             "",

//           time:
//             apiMessage.created_at
//               ? new Date(
//                   apiMessage.created_at
//                 ).toLocaleTimeString(
//                   [],
//                   {
//                     hour: "2-digit",
//                     minute:
//                       "2-digit",
//                   }
//                 )
//               : getCurrentTime(),

//           type:
//             messageType,

//           fileName:
//             apiMessage.file_name ||
//             file.name,

//           fileSize:
//             apiMessage.file_size ||
//             `${(
//               file.size / 1024
//             ).toFixed(1)} KB`,

//           fileUrl:
//             apiMessage.file_url ||
//             null,

//           created_at:
//             apiMessage.created_at ||
//             null,
//         };

//         const previewText =
//           messageType ===
//           "image"
//             ? "📷 Image"
//             : `📎 ${
//                 newMessage.fileName
//               }`;

//         setSelectedChat(
//           (current) => ({
//             ...current,

//             messages: [
//               ...(current.messages ||
//                 []),
//               newMessage,
//             ],

//             last_msg:
//               previewText,

//             lastMsg:
//               previewText,

//             last_msg_time:
//               apiMessage.created_at ||
//               null,

//             time:
//               newMessage.time,
//           })
//         );

//         setConversations(
//           (prev) =>
//             prev.map(
//               (chat) =>
//                 Number(chat.id) ===
//                 Number(
//                   selectedChat.id
//                 )
//                   ? {
//                       ...chat,

//                       messages: [
//                         ...(chat.messages ||
//                           []),
//                         newMessage,
//                       ],

//                       last_msg:
//                         previewText,

//                       lastMsg:
//                         previewText,

//                       last_msg_time:
//                         apiMessage.created_at ||
//                         null,

//                       time:
//                         newMessage.time,
//                     }
//                   : chat
//             )
//         );

//         e.target.value = "";
//       } catch (error) {
//         console.error(
//           "File Upload Error:",
//           error
//         );

//         alert(
//           error.message ||
//             "File upload failed"
//         );
//       } finally {
//         setSendingMessage(false);
//       }
//     };

//   /* ==================================================
//      ADD MEMBER TO EXISTING GROUP
//   ================================================== */

//   const handleAddMemberToExistingGroup =
//     async (e) => {
//       e.preventDefault();

//       if (
//         !newMemberName.trim() ||
//         !newMemberPhone.trim() ||
//         !selectedChat
//       ) {
//         return;
//       }

//       try {
//         setSendingMessage(true);

//         const response =
//           await fetch(
//             "/api/conversations/members",
//             {
//               method: "POST",
//               credentials:
//                 "include",
//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },
//               body: JSON.stringify(
//                 {
//                   conversationId:
//                     selectedChat.id,

//                   name:
//                     newMemberName.trim(),

//                   phone:
//                     newMemberPhone.trim(),
//                 }
//               ),
//             }
//           );

//         const data =
//           await response.json();

//         if (
//           !response.ok ||
//           !data.success
//         ) {
//           throw new Error(
//             data.message ||
//               "Failed to add member"
//           );
//         }

//         const newMember =
//           data.member;

//         const updatedChat = {
//           ...selectedChat,

//           members: [
//             ...(selectedChat.members ||
//               []),
//             newMember,
//           ],
//         };

//         setSelectedChat(
//           updatedChat
//         );

//         setConversations(
//           (prev) =>
//             prev.map(
//               (chat) =>
//                 Number(chat.id) ===
//                 Number(
//                   selectedChat.id
//                 )
//                   ? updatedChat
//                   : chat
//             )
//         );

//         setNewMemberName("");
//         setNewMemberPhone("");
//         setIsAddMemberModalOpen(
//           false
//         );

//         /*
//         Reload members from DB
//         */

//         await loadConversations();
//       } catch (error) {
//         console.error(
//           "Add Member Error:",
//           error
//         );

//         alert(
//           error.message ||
//             "Failed to add member"
//         );
//       } finally {
//         setSendingMessage(false);
//       }
//     };

//   /* ==================================================
//      CUSTOM MEMBER
//   ================================================== */

//   const handleAddCustomMember =
//     () => {
//       if (
//         !customName.trim() ||
//         !customPhone.trim()
//       ) {
//         return;
//       }

//       const newMember = {
//         id: `custom-${Date.now()}`,

//         name:
//           customName.trim(),

//         phone:
//           customPhone.trim(),

//         role: "member",

//         avatarBg:
//           "bg-blue-100 text-blue-600",

//         initials:
//           customName
//             .trim()
//             .slice(0, 2)
//             .toUpperCase(),

//         /*
//         Important:
//         This is a custom contact and
//         does not have a DB user_id.
//         */

//         isCustom: true,
//       };

//       setCustomMembersList(
//         (prev) => [
//           ...prev,
//           newMember,
//         ]
//       );

//       setCustomName("");
//       setCustomPhone("");
//     };

//   /* ==================================================
//      REMOVE CUSTOM MEMBER
//   ================================================== */

//   const removeCustomMember = (
//     memberId
//   ) => {
//     setCustomMembersList(
//       (prev) =>
//         prev.filter(
//           (member) =>
//             member.id !==
//             memberId
//         )
//     );
//   };

//   /* ==================================================
//      TOGGLE EXISTING MEMBER
//   ================================================== */

//   const handleMemberToggle = (
//     contact
//   ) => {
//     const contactId =
//       contact.user_id ||
//       contact.id;

//     const exists =
//       selectedMembers.some(
//         (member) =>
//           Number(
//             member.user_id ||
//               member.id
//           ) ===
//           Number(contactId)
//       );

//     if (exists) {
//       setSelectedMembers(
//         (prev) =>
//           prev.filter(
//             (member) =>
//               Number(
//                 member.user_id ||
//                   member.id
//               ) !==
//               Number(contactId)
//           )
//       );
//     } else {
//       setSelectedMembers(
//         (prev) => [
//           ...prev,
//           contact,
//         ]
//       );
//     }
//   };

//   /* ==================================================
//      CREATE GROUP
//   ================================================== */

// const handleCreateGroup = async (e) => {
//   e.preventDefault();

//   if (!groupName.trim()) {
//     alert("Group name is required");
//     return;
//   }

//   /*
//   ==================================================
//   GET REAL DATABASE USER IDS
//   ==================================================
//   */

//   const existingMemberIds = [
//     ...new Set(
//       selectedMembers
//         .map((member) => {
//           /*
//           selectedMembers mein user object ho sakta hai:
//           {
//             id: 2,
//             user_id: 2,
//             name: "M Aftab"
//           }

//           Ya:
//           {
//             id: 3,
//             name: "Ali Ahmed"
//           }
//           */

//           const rawId =
//             member?.user_id ??
//             member?.id;

//           const numericId =
//             Number(rawId);

//           /*
//           Sirf valid positive integer IDs
//           */

//           if (
//             Number.isInteger(numericId) &&
//             numericId > 0
//           ) {
//             return numericId;
//           }

//           return null;
//         })
//         .filter(
//           (id) => id !== null
//         )
//     ),
//   ];

//   /*
//   ==================================================
//   DEBUG
//   ==================================================
//   */

//   console.log(
//     "SELECTED MEMBERS:",
//     selectedMembers
//   );

//   console.log(
//     "GROUP MEMBER IDS:",
//     existingMemberIds
//   );

//   /*
//   ==================================================
//   IMPORTANT
//   ==================================================

//   Database users:

//   Admin     = 1
//   M Aftab   = 2
//   Ali Ahmed = 3
//   Imran     = 4
//   */

//   /*
//   At least one real user required.
//   Creator will automatically be added
//   by /api/conversations.
//   */

//   if (
//     existingMemberIds.length === 0
//   ) {
//     alert(
//       "Please select at least one existing user."
//     );

//     return;
//   }

//   try {
//     setSendingMessage(true);

//     /*
//     ==================================================
//     CREATE GROUP
//     ==================================================
//     */

//     const response =
//       await fetch(
//         "/api/conversations",
//         {
//           method: "POST",

//           credentials: "include",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             type: "group",

//             name:
//               groupName.trim(),

//             members:
//               existingMemberIds,
//           }),
//         }
//       );

//     const data =
//       await response.json();

//     console.log(
//       "CREATE GROUP RESPONSE:",
//       data
//     );

//     /*
//     ==================================================
//     ERROR
//     ==================================================
//     */

//     if (
//       !response.ok ||
//       !data.success
//     ) {
//       /*
//       Show invalid IDs if API returns them
//       */

//       if (
//         data.invalidUsers?.length
//       ) {
//         throw new Error(
//           `Invalid user IDs: ${data.invalidUsers.join(
//             ", "
//           )}. Database mein ye users exist nahi karte.`
//         );
//       }

//       throw new Error(
//         data.message ||
//           "Group creation failed"
//       );
//     }

//     /*
//     ==================================================
//     CREATED GROUP ID
//     ==================================================
//     */

//     const createdGroupId =
//       Number(
//         data.conversationId
//       );

//     if (
//       !Number.isInteger(
//         createdGroupId
//       ) ||
//       createdGroupId <= 0
//     ) {
//       throw new Error(
//         "Invalid conversation ID returned by server"
//       );
//     }

//     /*
//     ==================================================
//     RELOAD CONVERSATIONS
//     ==================================================
//     */

//     await loadConversations();

//     /*
//     ==================================================
//     FIND CREATED GROUP
//     ==================================================
//     */

//     /*
//     NOTE:

//     loadConversations() ke baad
//     state immediately update nahi hota,
//     isliye purane `conversations` state par
//     depend karna unreliable ho sakta hai.
//     */

//     const refreshedGroup =
//       conversations.find(
//         (chat) =>
//           Number(chat.id) ===
//           createdGroupId
//       );

//     if (refreshedGroup) {
//       setSelectedChat(
//         refreshedGroup
//       );
//     } else {
//       /*
//       Temporary group object
//       */

//       setSelectedChat({
//         id:
//           createdGroupId,

//         type:
//           "group",

//         name:
//           groupName.trim(),

//         initials:
//           groupName
//             .trim()
//             .slice(0, 2)
//             .toUpperCase(),

//         avatarBg:
//           "bg-rose-100 text-rose-600",

//         avatar_bg:
//           "bg-rose-100 text-rose-600",

//         members:
//           data.conversation
//             ?.members || [],

//         messages: [],

//         unread_count: 0,

//         lastMsg:
//           "No messages yet",

//         last_msg:
//           "No messages yet",
//       });
//     }

//     /*
//     ==================================================
//     SHOW MOBILE CHAT
//     ==================================================
//     */

//     setShowMobileChat(
//       true
//     );

//     /*
//     ==================================================
//     LOAD GROUP MESSAGES
//     ==================================================
//     */

//     await loadMessages(
//       createdGroupId
//     );

//     /*
//     ==================================================
//     RESET GROUP MODAL
//     ==================================================
//     */

//     setGroupName("");

//     setSelectedMembers(
//       []
//     );

//     setCustomMembersList(
//       []
//     );

//     setCustomName("");

//     setCustomPhone("");

//     setIsGroupModalOpen(
//       false
//     );
//   } catch (error) {
//     console.error(
//       "Create Group Error:",
//       error
//     );

//     alert(
//       error.message ||
//         "Group creation failed"
//     );
//   } finally {
//     setSendingMessage(
//       false
//     );
//   }
// };
//   /* ==================================================
//      FILTER CONVERSATIONS
//   ================================================== */

//   const filteredConversations =
//     conversations.filter(
//       (chat) => {
//         /*
//         Group filter
//         */

//         if (
//           activeTab === "Group" &&
//           chat.type !== "group"
//         ) {
//           return false;
//         }

//         /*
//         Search filter
//         */

//         if (
//           searchText.trim()
//         ) {
//           const search =
//             searchText
//               .toLowerCase()
//               .trim();

//           const name =
//             chat.name
//               ?.toLowerCase() ||
//             "";

//           const email =
//             chat.email
//               ?.toLowerCase() ||
//             "";

//           const lastMsg =
//             chat.lastMsg
//               ?.toLowerCase() ||
//             chat.last_msg
//               ?.toLowerCase() ||
//             "";

//           return (
//             name.includes(search) ||
//             email.includes(search) ||
//             lastMsg.includes(search)
//           );
//         }

//         return true;
//       }
//     );
// console.log("FILTERED CONVERSATIONS:", filteredConversations);
// console.log(
//   "FILTERED LENGTH:",
//   filteredConversations.length
// );
//   /* ==================================================
//      RENDER
//   ================================================== */

/* ==================================================
   ADD MEMBER
================================================== */
// const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
// const [newMemberName, setNewMemberName] = useState("");
// const [newMemberPhone, setNewMemberPhone] = useState("");

// /* ==================================================
//    SEARCH
// ================================================== */
// const [searchText, setSearchText] = useState("");

// /* ==================================================
//    REFS
// ================================================== */
// const fileInputRef = useRef(null);
// const messagesEndRef = useRef(null);

// /* ==================================================
//    ROUTER
// ================================================== */


// /* ==================================================
//    CURRENT TIME
// ================================================== */
// const getCurrentTime = () => {
//   return new Date().toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// /* ==================================================
//    LOGOUT
// ================================================== */
// const handleConfirmLogout = async () => {
//   setLoggingOut(true);

//   try {
//     localStorage.removeItem("crm_login_time");

//     const response = await fetch("/api/logout", {
//       method: "POST",
//       credentials: "include",
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       alert(data.message || "Logout failed");
//       setLoggingOut(false);
//       setShowLogoutModal(false);
//       return;
//     }

//     router.push("/login");
//   } catch (error) {
//     console.error("Logout error:", error);
//     alert("Something went wrong during logout.");
//     setLoggingOut(false);
//     setShowLogoutModal(false);
//   }
// };

// /* ==================================================
//    MESSAGE DATE HELPERS
// ================================================== */
// const formatMessageDate = (dateValue) => {
//   if (!dateValue) return "";

//   const date = new Date(dateValue);

//   if (Number.isNaN(date.getTime())) {
//     return "";
//   }

//   return date.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// };

// const isSameMessageDate = (date1, date2) => {
//   if (!date1 || !date2) return false;

//   const first = new Date(date1);
//   const second = new Date(date2);

//   return (
//     first.getFullYear() === second.getFullYear() &&
//     first.getMonth() === second.getMonth() &&
//     first.getDate() === second.getDate()
//   );
// };

// /* ==================================================
//    LOAD CONVERSATIONS
// ================================================== */
// const loadConversations = async () => {
//   try {
//     setLoadingConversations(true);

//     const response = await fetch("/api/conversations", {
//       method: "GET",
//       credentials: "include",
//       cache: "no-store",
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(
//         data.message || "Failed to load conversations"
//       );
//     }

//     setIsAdmin(Boolean(data.isAdmin));
//     setCurrentUser(data.currentUser || null);

//     const usersResponse = await fetch("/api/new-users", {
//       method: "GET",
//       credentials: "include",
//       cache: "no-store",
//     });

//     const usersData = await usersResponse.json();

//     if (!usersResponse.ok || !usersData.success) {
//       throw new Error(
//         usersData.message || "Failed to load users"
//       );
//     }

//     const allUsers = Array.isArray(usersData.users)
//       ? usersData.users
//       : [];

//     setUsers(allUsers);

//     console.log("CURRENT USER:", data.currentUser);
//     console.log("IS ADMIN:", data.isAdmin);
//     console.log("NEW USERS:", allUsers);

//     /* ==================================================
//        DIRECT CHATS
//     ================================================== */
//     const directChats = allUsers
//       .filter(
//         (user) =>
//           Number(user.id) !== Number(data.currentUser?.id)
//       )
//       .map((user) => {
//         const initials =
//           user.name?.trim().slice(0, 2).toUpperCase() || "U";

//         return {
//           id: null,
//           conversationId: `direct-${user.id}`,
//           user_id: Number(user.id),
//           userId: Number(user.id),
//           name: user.name || "Unknown",
//           email: user.email || "",
//           phone: user.phone || "",
//           role: user.role || "",
//           type: "direct",
//           initials,
//           avatar_bg: "bg-emerald-100 text-emerald-600",
//           avatarBg: "bg-emerald-100 text-emerald-600",
//           lastMsg: "No messages yet",
//           last_msg: "No messages yet",
//           last_msg_time: null,
//           unread_count: 0,
//           messages: [],
//         };
//       });

//     /* ==================================================
//        GROUP CHATS
//     ================================================== */
//     const existingConversations = Array.isArray(
//       data.conversations
//     )
//       ? data.conversations
//       : [];

//     const groupChats = existingConversations.filter(
//       (chat) => chat.type === "group"
//     );

//     /* ==================================================
//        MERGE
//     ================================================== */
//     const chats = [...directChats, ...groupChats];

//     console.log("DIRECT CHATS:", directChats);
//     console.log("GROUP CHATS:", groupChats);
//     console.log("FINAL CHATS:", chats);

//     setConversations(chats);

//     /* ==================================================
//        KEEP SELECTED CHAT
//     ================================================== */
//     setSelectedChat((current) => {
//       if (!chats.length) {
//         return null;
//       }

//       if (!current) {
//         return chats[0];
//       }

//       const currentConversationId = Number(current.id);

//       const updatedChat = chats.find((chat) => {
//         if (
//           currentConversationId > 0 &&
//           Number(chat.id) === currentConversationId
//         ) {
//           return true;
//         }

//         if (
//           current.user_id &&
//           Number(chat.user_id) === Number(current.user_id)
//         ) {
//           return true;
//         }

//         return false;
//       });

//       if (updatedChat) {
//         return {
//           ...updatedChat,
//           messages: current.messages || [],
//         };
//       }

//       return chats[0];
//     });
//   } catch (error) {
//     console.error("Load Conversations Error:", error);
//   } finally {
//     setLoadingConversations(false);
//   }
// };

// /* ==================================================
//    LOAD MESSAGES
// ================================================== */
// const loadMessages = async (chat) => {
//   try {
//     if (!chat) {
//       return;
//     }

//     /* Direct chat without DB conversation */
//     const conversationId = Number(chat.id);

//     if (
//       !Number.isInteger(conversationId) ||
//       conversationId <= 0
//     ) {
//       setSelectedChat((current) =>
//         current
//           ? {
//               ...current,
//               messages: [],
//             }
//           : current
//       );

//       return;
//     }

//     const response = await fetch(
//       `/api/messages?conversationId=${conversationId}`,
//       {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       }
//     );

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(
//         data.message || "Failed to load messages"
//       );
//     }

//     const messages = (data.messages || []).map((message) => ({
//       id: message.id,
//       conversation_id: message.conversation_id,

//       sender:
//         Number(message.sender_id) === Number(currentUser?.id)
//           ? "me"
//           : "them",

//       senderId: Number(message.sender_id),

//       senderName: message.sender_name || "",

//       senderEmail: message.sender_email || "",

//       text: message.text || "",

//       time: message.created_at
//         ? new Date(message.created_at).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })
//         : "",

//       type: message.msg_type || "text",

//       fileName: message.file_name || null,

//       fileSize: message.file_size || null,

//       fileUrl: message.file_url || null,

//       created_at: message.created_at || null,
//     }));

//     setSelectedChat((current) =>
//       current
//         ? {
//             ...current,
//             messages,
//           }
//         : current
//     );
//   } catch (error) {
//     console.error("Load Messages Error:", error);
//   }
// };

// /* ==================================================
//    INITIAL LOAD
// ================================================== */
// useEffect(() => {
//   loadConversations();
// }, []);

// /* ==================================================
//    CHAT CHANGE
// ================================================== */
// useEffect(() => {
//   if (selectedChat) {
//     loadMessages(selectedChat);
//   }
// }, [selectedChat?.id]);

// /* ==================================================
//    AUTO SCROLL
// ================================================== */
// useEffect(() => {
//   messagesEndRef.current?.scrollIntoView({
//     behavior: "smooth",
//   });
// }, [selectedChat?.messages, loadingMessages]);

// /* ==================================================
//    SELECT CHAT
// ================================================== */
// const handleSelectChat = (chat) => {
//   setSelectedChat(chat);
//   setShowMobileChat(true);
// };

// /* ==================================================
//    SEND TEXT MESSAGE
// ================================================== */
// const handleSendMessage = async (e) => {
//   e?.preventDefault();

//   const text = inputMessage.trim();

//   if (!text || sendingMessage) {
//     return;
//   }

//   const currentUserId = Number(currentUser?.id);

//   const rawConversationId =
//     selectedChat?.id ??
//     selectedChat?.conversationId ??
//     null;

//   const rawTargetUserId =
//     selectedChat?.user_id ??
//     selectedChat?.userId ??
//     null;

//   let conversationId = null;
//   let targetUserId = null;

//   /* Real DB conversation ID only */
//   if (
//     rawConversationId !== null &&
//     rawConversationId !== undefined &&
//     rawConversationId !== ""
//   ) {
//     const numericConversationId = Number(rawConversationId);

//     if (
//       Number.isInteger(numericConversationId) &&
//       numericConversationId > 0
//     ) {
//       conversationId = numericConversationId;
//     }
//   }

//   /* Fake direct-X ID is NOT a DB conversation ID */
//   if (
//     typeof rawConversationId === "string" &&
//     rawConversationId.startsWith("direct-")
//   ) {
//     conversationId = null;
//   }

//   /* Target user */
//   if (
//     rawTargetUserId !== null &&
//     rawTargetUserId !== undefined &&
//     rawTargetUserId !== ""
//   ) {
//     const numericTargetUserId = Number(rawTargetUserId);

//     if (
//       Number.isInteger(numericTargetUserId) &&
//       numericTargetUserId > 0
//     ) {
//       targetUserId = numericTargetUserId;
//     }
//   }

//   console.log("SEND MESSAGE DEBUG:", {
//     currentUserId,
//     selectedChat,
//     conversationId,
//     targetUserId,
//   });

//   if (!conversationId && !targetUserId) {
//     alert("No conversation or target user selected");
//     return;
//   }

//   if (
//     targetUserId &&
//     targetUserId === currentUserId
//   ) {
//     alert("You cannot send a message to yourself");
//     return;
//   }

//   try {
//     setSendingMessage(true);

//     const body = {
//       text,
//       msgType: "text",
//     };

//     if (conversationId) {
//       body.conversationId = conversationId;
//     }

//     if (!conversationId && targetUserId) {
//       body.targetUserId = targetUserId;
//     }

//     console.log("POST /api/messages BODY:", body);

//     const response = await fetch("/api/messages", {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();

//     console.log("POST /api/messages RESPONSE:", data);

//     if (!response.ok || !data.success) {
//       throw new Error(
//         data.message || "Failed to send message"
//       );
//     }

//     const realConversationId = Number(
//       data.conversationId
//     );

//     const apiMessage = data.data;

//     if (
//       !Number.isInteger(realConversationId) ||
//       realConversationId <= 0 ||
//       !apiMessage
//     ) {
//       throw new Error(
//         "API did not return a valid conversation/message"
//       );
//     }

//     const newMessage = {
//       id: Number(apiMessage.id),

//       conversation_id: realConversationId,

//       sender:
//         Number(apiMessage.sender_id) === currentUserId
//           ? "me"
//           : "them",

//       senderId: Number(apiMessage.sender_id),

//       senderName:
//         apiMessage.sender_name ||
//         currentUser?.name ||
//         "You",

//       senderEmail:
//         apiMessage.sender_email ||
//         currentUser?.email ||
//         "",

//       text: apiMessage.text || text,

//       time: apiMessage.created_at
//         ? new Date(
//             apiMessage.created_at
//           ).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })
//         : getCurrentTime(),

//       type: apiMessage.msg_type || "text",

//       fileName: apiMessage.file_name || null,

//       fileSize: apiMessage.file_size || null,

//       fileUrl: apiMessage.file_url || null,

//       created_at: apiMessage.created_at || null,
//     };

//     /* ==================================================
//        UPDATE SELECTED CHAT
//     ================================================== */
//     setSelectedChat((current) => {
//       if (!current) {
//         return current;
//       }

//       return {
//         ...current,

//         id: realConversationId,

//         conversationId: realConversationId,

//         messages: [
//           ...(current.messages || []),
//           newMessage,
//         ],

//         lastMsg: text,

//         last_msg: text,

//         last_msg_time:
//           apiMessage.created_at || null,

//         time: newMessage.time,
//       };
//     });

//     /* ==================================================
//        UPDATE SIDEBAR
//     ================================================== */
//     setConversations((prev) =>
//       prev.map((chat) => {
//         const chatUserId = Number(
//           chat.user_id ?? chat.userId
//         );

//         const chatConversationId = Number(
//           chat.id
//         );

//         const isSameChat =
//           chatConversationId ===
//             realConversationId ||
//           (targetUserId &&
//             chatUserId === targetUserId);

//         if (!isSameChat) {
//           return chat;
//         }

//         return {
//           ...chat,

//           id: realConversationId,

//           conversationId: realConversationId,

//           messages: [
//             ...(chat.messages || []),
//             newMessage,
//           ],

//           lastMsg: text,

//           last_msg: text,

//           last_msg_time:
//             apiMessage.created_at || null,

//           time: newMessage.time,

//           unread_count: 0,
//         };
//       })
//     );

//     setInputMessage("");
//   } catch (error) {
//     console.error("Send Message Error:", error);

//     alert(
//       error.message || "Message send failed"
//     );
//   } finally {
//     setSendingMessage(false);
//   }
// };

// /* ==================================================
//    FILE UPLOAD
// ================================================== */
// const handleFileUpload = async (e) => {
//   const file = e.target.files?.[0];

//   if (
//     !file ||
//     !selectedChat ||
//     sendingMessage
//   ) {
//     return;
//   }

//   const conversationId = Number(selectedChat.id);

//   if (
//     !Number.isInteger(conversationId) ||
//     conversationId <= 0
//   ) {
//     alert(
//       "Please send a message first to create the conversation."
//     );

//     e.target.value = "";
//     return;
//   }

//   try {
//     setSendingMessage(true);

//     const formData = new FormData();

//     formData.append(
//       "conversationId",
//       String(conversationId)
//     );

//     formData.append("file", file);
//     formData.append("text", "");

//     const response = await fetch(
//       "/api/messages",
//       {
//         method: "POST",
//         credentials: "include",
//         body: formData,
//       }
//     );

//     const data = await response.json();

//     if (
//       !response.ok ||
//       !data.success
//     ) {
//       throw new Error(
//         data.message ||
//           "File upload failed"
//       );
//     }

//     const apiMessage = data.data;

//     const messageType =
//       apiMessage.msg_type ||
//       (file.type.startsWith("image/")
//         ? "image"
//         : "file");

//     const newMessage = {
//       id: Number(apiMessage.id),

//       conversation_id: conversationId,

//       sender:
//         Number(apiMessage.sender_id) ===
//         Number(currentUser?.id)
//           ? "me"
//           : "them",

//       senderId: Number(apiMessage.sender_id),

//       senderName:
//         apiMessage.sender_name ||
//         currentUser?.name ||
//         "You",

//       senderEmail:
//         apiMessage.sender_email ||
//         currentUser?.email ||
//         "",

//       text: apiMessage.text || "",

//       time: apiMessage.created_at
//         ? new Date(
//             apiMessage.created_at
//           ).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })
//         : getCurrentTime(),

//       type: messageType,

//       fileName:
//         apiMessage.file_name ||
//         file.name,

//       fileSize:
//         apiMessage.file_size ||
//         `${(file.size / 1024).toFixed(1)} KB`,

//       fileUrl:
//         apiMessage.file_url ||
//         null,

//       created_at:
//         apiMessage.created_at ||
//         null,
//     };

//     const previewText =
//       messageType === "image"
//         ? "📷 Image"
//         : `📎 ${newMessage.fileName}`;

//     setSelectedChat((current) =>
//       current
//         ? {
//             ...current,

//             messages: [
//               ...(current.messages || []),
//               newMessage,
//             ],

//             last_msg: previewText,
//             lastMsg: previewText,

//             last_msg_time:
//               apiMessage.created_at ||
//               null,

//             time: newMessage.time,
//           }
//         : current
//     );

//     setConversations((prev) =>
//       prev.map((chat) =>
//         Number(chat.id) ===
//         conversationId
//           ? {
//               ...chat,

//               messages: [
//                 ...(chat.messages || []),
//                 newMessage,
//               ],

//               last_msg: previewText,
//               lastMsg: previewText,

//               last_msg_time:
//                 apiMessage.created_at ||
//                 null,

//               time: newMessage.time,
//             }
//           : chat
//       )
//     );

//     e.target.value = "";
//   } catch (error) {
//     console.error(
//       "File Upload Error:",
//       error
//     );

//     alert(
//       error.message ||
//         "File upload failed"
//     );
//   } finally {
//     setSendingMessage(false);
//   }
// };

// /* ==================================================
//    ADD MEMBER TO EXISTING GROUP
// ================================================== */
// const handleAddMemberToExistingGroup = async (e) => {
//   e.preventDefault();

//   if (
//     !newMemberName.trim() ||
//     !newMemberPhone.trim() ||
//     !selectedChat
//   ) {
//     return;
//   }

//   const conversationId = Number(
//     selectedChat.id
//   );

//   if (
//     !Number.isInteger(conversationId) ||
//     conversationId <= 0
//   ) {
//     alert("Invalid group conversation.");
//     return;
//   }

//   try {
//     setSendingMessage(true);

//     const response = await fetch(
//       "/api/conversations/members",
//       {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           conversationId,
//           name: newMemberName.trim(),
//           phone: newMemberPhone.trim(),
//         }),
//       }
//     );

//     const data = await response.json();

//     if (
//       !response.ok ||
//       !data.success
//     ) {
//       throw new Error(
//         data.message ||
//           "Failed to add member"
//       );
//     }

//     const newMember = data.member;

//     const updatedChat = {
//       ...selectedChat,

//       members: [
//         ...(selectedChat.members || []),
//         newMember,
//       ],
//     };

//     setSelectedChat(updatedChat);

//     setConversations((prev) =>
//       prev.map((chat) =>
//         Number(chat.id) === conversationId
//           ? updatedChat
//           : chat
//       )
//     );

//     setNewMemberName("");
//     setNewMemberPhone("");
//     setIsAddMemberModalOpen(false);

//     await loadConversations();
//   } catch (error) {
//     console.error(
//       "Add Member Error:",
//       error
//     );

//     alert(
//       error.message ||
//         "Failed to add member"
//     );
//   } finally {
//     setSendingMessage(false);
//   }
// };

// /* ==================================================
//    CUSTOM MEMBER
// ================================================== */
// const handleAddCustomMember = () => {
//   if (
//     !customName.trim() ||
//     !customPhone.trim()
//   ) {
//     return;
//   }

//   const newMember = {
//     id: `custom-${Date.now()}`,

//     name: customName.trim(),

//     phone: customPhone.trim(),

//     role: "member",

//     avatarBg:
//       "bg-blue-100 text-blue-600",

//     initials:
//       customName
//         .trim()
//         .slice(0, 2)
//         .toUpperCase(),

//     isCustom: true,
//   };

//   setCustomMembersList((prev) => [
//     ...prev,
//     newMember,
//   ]);

//   setCustomName("");
//   setCustomPhone("");
// };

// /* ==================================================
//    REMOVE CUSTOM MEMBER
// ================================================== */
// const removeCustomMember = (memberId) => {
//   setCustomMembersList((prev) =>
//     prev.filter(
//       (member) =>
//         member.id !== memberId
//     )
//   );
// };

// /* ==================================================
//    TOGGLE EXISTING MEMBER
// ================================================== */
// const handleMemberToggle = (contact) => {
//   const contactId =
//     contact?.user_id ??
//     contact?.id;

//   if (!contactId) {
//     return;
//   }

//   const exists = selectedMembers.some(
//     (member) =>
//       Number(
//         member.user_id ??
//         member.id
//       ) === Number(contactId)
//   );

//   if (exists) {
//     setSelectedMembers((prev) =>
//       prev.filter(
//         (member) =>
//           Number(
//             member.user_id ??
//             member.id
//           ) !== Number(contactId)
//       )
//     );
//   } else {
//     setSelectedMembers((prev) => [
//       ...prev,
//       contact,
//     ]);
//   }
// };

// /* ==================================================
//    CREATE GROUP
// ================================================== */
// const handleCreateGroup = async (e) => {
//   e.preventDefault();

//   if (!groupName.trim()) {
//     alert("Group name is required");
//     return;
//   }

//   const existingMemberIds = [
//     ...new Set(
//       selectedMembers
//         .map((member) => {
//           const rawId =
//             member?.user_id ??
//             member?.id;

//           const numericId =
//             Number(rawId);

//           if (
//             Number.isInteger(numericId) &&
//             numericId > 0
//           ) {
//             return numericId;
//           }

//           return null;
//         })
//         .filter(
//           (id) => id !== null
//         )
//     ),
//   ];

//   console.log(
//     "SELECTED MEMBERS:",
//     selectedMembers
//   );

//   console.log(
//     "GROUP MEMBER IDS:",
//     existingMemberIds
//   );

//   if (
//     existingMemberIds.length === 0
//   ) {
//     alert(
//       "Please select at least one existing user."
//     );
//     return;
//   }

//   try {
//     setSendingMessage(true);

//     const response = await fetch(
//       "/api/conversations",
//       {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type":
//             "application/json",
//         },
//         body: JSON.stringify({
//           type: "group",
//           name: groupName.trim(),
//           members:
//             existingMemberIds,
//         }),
//       }
//     );

//     const data = await response.json();

//     console.log(
//       "CREATE GROUP RESPONSE:",
//       data
//     );

//     if (
//       !response.ok ||
//       !data.success
//     ) {
//       if (
//         data.invalidUsers?.length
//       ) {
//         throw new Error(
//           `Invalid user IDs: ${data.invalidUsers.join(
//             ", "
//           )}`
//         );
//       }

//       throw new Error(
//         data.message ||
//           "Group creation failed"
//       );
//     }

//     const createdGroupId =
//       Number(
//         data.conversationId
//       );

//     if (
//       !Number.isInteger(
//         createdGroupId
//       ) ||
//       createdGroupId <= 0
//     ) {
//       throw new Error(
//         "Invalid conversation ID returned by server"
//       );
//     }

//     /* ==================================================
//        CREATE TEMP GROUP OBJECT
//     ================================================== */
//     const createdGroup = {
//       id: createdGroupId,

//       conversationId:
//         createdGroupId,

//       type: "group",

//       name:
//         groupName.trim(),

//       initials:
//         groupName
//           .trim()
//           .slice(0, 2)
//           .toUpperCase(),

//       avatarBg:
//         "bg-rose-100 text-rose-600",

//       avatar_bg:
//         "bg-rose-100 text-rose-600",

//       members:
//         data.conversation
//           ?.members || [],

//       messages: [],

//       unread_count: 0,

//       lastMsg:
//         "No messages yet",

//       last_msg:
//         "No messages yet",

//       last_msg_time: null,
//     };

//     /* ==================================================
//        ADD GROUP TO SIDEBAR IMMEDIATELY
//     ================================================== */
//     setConversations((prev) => [
//       ...prev.filter(
//         (chat) =>
//           Number(chat.id) !==
//           createdGroupId
//       ),
//       createdGroup,
//     ]);

//     setSelectedChat(
//       createdGroup
//     );

//     setShowMobileChat(true);

//     /* ==================================================
//        LOAD MESSAGES
//     ================================================== */
//     await loadMessages(
//       createdGroup
//     );

//     /* ==================================================
//        REFRESH CONVERSATIONS
//     ================================================== */
//     await loadConversations();

//     /* ==================================================
//        RESET MODAL
//     ================================================== */
//     setGroupName("");
//     setSelectedMembers([]);
//     setCustomMembersList([]);
//     setCustomName("");
//     setCustomPhone("");
//     setIsGroupModalOpen(false);
//   } catch (error) {
//     console.error(
//       "Create Group Error:",
//       error
//     );

//     alert(
//       error.message ||
//         "Group creation failed"
//     );
//   } finally {
//     setSendingMessage(false);
//   }
// };

// /* ==================================================
//    FILTER CONVERSATIONS
// ================================================== */
// const filteredConversations =
//   conversations.filter((chat) => {
//     /* Group filter */
//     if (
//       activeTab === "Group" &&
//       chat.type !== "group"
//     ) {
//       return false;
//     }

//     /* Search */
//     if (searchText.trim()) {
//       const search =
//         searchText
//           .toLowerCase()
//           .trim();

//       const name =
//         chat.name
//           ?.toLowerCase() || "";

//       const email =
//         chat.email
//           ?.toLowerCase() || "";

//       const lastMsg =
//         (
//           chat.lastMsg ||
//           chat.last_msg ||
//           ""
//         ).toLowerCase();

//       return (
//         name.includes(search) ||
//         email.includes(search) ||
//         lastMsg.includes(search)
//       );
//     }

//     return true;
//   });

// console.log(
//   "FILTERED CONVERSATIONS:",
//   filteredConversations
// );

// console.log(
//   "FILTERED LENGTH:",
//   filteredConversations.length
// );



return (
  <div className="flex flex-col lg:ml-64 h-screen min-h-0 p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-800 font-sans overflow-hidden">

    {/* ==================================================
        MOBILE HEADER
    ================================================== */}

    <header className="lg:hidden h-16 bg-[#050B1E] border-b border-slate-800 flex items-center justify-between px-4 text-white shrink-0">

      <div className="flex items-center gap-2.5">

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 p-[2px] flex items-center justify-center">

          <div className="w-full h-full bg-[#050B1E] rounded-full flex items-center justify-center">

            <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 flex items-center justify-center">

              <div className="w-1 h-1 bg-white rounded-full" />

            </div>

          </div>

        </div>

        <span className="font-extrabold text-xl tracking-tight text-white">
          CallCRM
        </span>

      </div>

      <button
        type="button"
        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
        className="p-2 rounded-lg text-slate-300 hover:bg-white/10"
      >
        {sidebarOpen ? (
          <X size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>

    </header>


    {/* ==================================================
        MOBILE OVERLAY
    ================================================== */}

    {sidebarOpen && (
      <div
        onClick={() =>
          setSidebarOpen(false)
        }
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
      />
    )}


    {/* ==================================================
        FILE INPUT
    ================================================== */}

    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileUpload}
      className="hidden"
    />


    {/* ==================================================
        TOP NAVBAR
    ================================================== */}

    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 rounded-t-xl">

      <div className="flex items-center gap-2 sm:gap-3">

        <h1 className="font-semibold text-base sm:text-lg text-slate-800">
          Messages Dashboard
        </h1>

      </div>


      <div className="flex items-center gap-2 sm:gap-4">

        <div className="hidden lg:flex bg-emerald-50 text-emerald-600 text-xs px-3 py-1.5 rounded-md font-medium items-center gap-1.5 border border-emerald-100">

          <Calendar className="w-3.5 h-3.5" />

          CRM Inbox

        </div>


        {/* <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-medium flex items-center justify-center text-xs">
            M
          </div>

          <div className="text-left text-xs hidden sm:block">

            <p className="font-semibold text-slate-700">
              M Aftab
            </p>

            <p className="text-slate-400 text-[10px]">
              admin@callcrm.com
            </p>

          </div>

        </div> */}

      </div>

    </header>


    {/* ==================================================
        MAIN CHAT AREA
    ================================================== */}

    <div className="flex-1 min-h-0 flex overflow-hidden relative border-x border-b border-slate-200 rounded-b-xl">


      {/* ==================================================
          LEFT SIDEBAR
      ================================================== */}

      <aside
        className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-0 ${
          showMobileChat
            ? "hidden md:flex"
            : "flex"
        }`}
      >


        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="p-3 flex items-center gap-2 shrink-0">

          <div className="relative flex-1">

            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
            />

          </div>


          <button
            type="button"
            className="p-1.5 text-slate-400 border border-slate-200 rounded-lg"
          >
            <Filter className="w-4 h-4" />
          </button>

        </div>


        {/* ==================================================
            TABS
        ================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-3 shrink-0">

          <div className="flex">

            {["All", "Group"].map((tab) => (

              <button
                key={tab}
                type="button"
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`py-2 px-3 text-xs font-medium border-b-2 ${
                  activeTab === tab
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>


          {activeTab === "Group" && (

            <button
              type="button"
              onClick={() => {
                setGroupName("");
                setCustomName("");
                setCustomPhone("");
                setCustomMembersList([]);
                setSelectedMembers([]);
                setIsGroupModalOpen(true);
              }}
              className="mb-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium"
            >

              <Plus className="w-3.5 h-3.5" />

              Create Group

            </button>

          )}

        </div>


        {/* ==================================================
            CONVERSATIONS
        ================================================== */}

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden divide-y divide-slate-100">

          {loadingConversations ? (

            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">

              <Loader2 className="w-4 h-4 animate-spin" />

              Loading conversations...

            </div>

          ) : filteredConversations.length === 0 ? (

            <div className="p-6 text-center text-xs text-slate-400">

              No conversations found.

            </div>

          ) : (

            filteredConversations.map((chat) => {

              const lastMessage =
                chat.lastMsg ||
                chat.last_msg ||
                chat.last_message ||
                "";

              const lastTime =
                chat.time ||
                (
                  chat.last_msg_time
                    ? new Date(
                        chat.last_msg_time
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : ""
                );

              const unreadCount = Number(
                chat.unread_count || 0
              );

              return (

                <div
                  key={`conversation-${chat.type}-${chat.id ?? chat.conversationId ?? chat.user_id}`}
                  onClick={() =>
                    handleSelectChat(chat)
                  }
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id
                      ? "bg-emerald-50/60"
                      : "hover:bg-slate-50"
                  }`}
                >


                  {/* AVATAR */}

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      chat.avatar_bg ||
                      chat.avatarBg ||
                      "bg-emerald-100 text-emerald-600"
                    }`}
                  >

                    {chat.type === "group" ? (

                      <Users className="w-4 h-4" />

                    ) : (

                      chat.initials ||
                      chat.name
                        ?.slice(0, 2)
                        .toUpperCase() ||
                      "U"

                    )}

                  </div>


                  {/* CONTENT */}

                  <div className="flex-1 min-w-0">

                    <div className="flex justify-between items-baseline mb-0.5">

                      <h4 className="text-xs font-semibold text-slate-800 truncate">

                        {chat.name ||
                          "Unknown"}

                      </h4>


                      {lastTime && (

                        <span className="text-[10px] text-slate-400 ml-2 shrink-0">

                          {lastTime}

                        </span>

                      )}

                    </div>


                    <div className="flex items-center justify-between gap-2">

                      <p
                        className={`text-xs truncate ${
                          unreadCount > 0
                            ? "font-semibold text-slate-700"
                            : "text-slate-500"
                        }`}
                      >

                        {lastMessage
                          ? lastMessage
                          : "No messages yet"}

                      </p>


                      {unreadCount > 0 && (

                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">

                          {unreadCount > 99
                            ? "99+"
                            : unreadCount}

                        </span>

                      )}

                    </div>

                  </div>

                </div>

              );

            })

          )}

        </div>

      </aside>


      {/* ==================================================
          CHAT SCREEN
      ================================================== */}

      <section
        className={`flex-1 min-w-0 min-h-0 flex flex-col bg-[#efeae2] ${
          !showMobileChat
            ? "hidden md:flex"
            : "flex"
        }`}
      >

        {selectedChat ? (

          <>


            {/* ==================================================
                CHAT HEADER
            ================================================== */}

            <div className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">

              <div className="flex items-center gap-2 sm:gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowMobileChat(false)
                  }
                  className="md:hidden p-1 text-slate-500"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>


                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    selectedChat.avatar_bg ||
                    selectedChat.avatarBg ||
                    "bg-emerald-100 text-emerald-600"
                  }`}
                >

                  {selectedChat.type ===
                  "group" ? (

                    <Users className="w-4 h-4" />

                  ) : (

                    selectedChat.initials ||
                    selectedChat.name
                      ?.slice(0, 2)
                      .toUpperCase() ||
                    "U"

                  )}

                </div>


                <div>

                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">

                    {selectedChat.name}

                    {selectedChat.type ===
                      "group" && (

                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-normal">
                        Group
                      </span>

                    )}

                  </h3>


                  <p className="text-[10px] text-slate-400">

                    {selectedChat.type ===
                    "group"
                      ? `${
                          selectedChat.members
                            ?.length || 0
                        } Members`
                      : selectedChat.email ||
                        selectedChat.phone ||
                        "Direct Chat"}

                  </p>

                </div>

              </div>


              {/* HEADER ACTIONS */}

              <div className="flex items-center gap-2">

                {selectedChat.type ===
                  "group" && (

                  <div className="flex items-center gap-1.5">

                    <button
                      type="button"
                      onClick={() => {
                        setNewMemberName("");
                        setNewMemberPhone("");
                        setIsAddMemberModalOpen(
                          true
                        );
                      }}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium"
                    >

                      <UserPlus className="w-3.5 h-3.5" />

                      <span className="hidden sm:inline">
                        Add Member
                      </span>

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setIsGroupInfoOpen(
                          true
                        )
                      }
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium"
                    >

                      <Info className="w-3.5 h-3.5 text-slate-500" />

                      <span className="hidden sm:inline">
                        Members
                      </span>

                      ({selectedChat.members
                        ?.length || 0})

                    </button>

                  </div>

                )}


                <Search className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600 ml-2" />

                <Star className="w-4 h-4 cursor-pointer text-slate-400 hover:text-amber-500" />

                <MoreVertical className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-600" />

              </div>

            </div>


            {/* ==================================================
                MESSAGES
            ================================================== */}

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#efeae2] px-3 sm:px-5 py-4">

              {loadingMessages ? (

                <div className="flex justify-center items-center h-full text-xs text-slate-400 gap-2">

                  <Loader2 className="w-4 h-4 animate-spin" />

                  Loading messages...

                </div>

              ) : selectedChat.messages?.length >
                0 ? (

                <div className="space-y-1 min-h-full">

                  {selectedChat.messages.map(
                    (msg, index) => {

                      const isMe =
                        msg.sender ===
                        "me";

                      const isSystem =
                        msg.sender ===
                        "system";

                      const previousMessage =
                        selectedChat
                          .messages[
                          index - 1
                        ];

                      const showDate =
                        !previousMessage ||
                        !isSameMessageDate(
                          previousMessage.created_at,
                          msg.created_at
                        );


                      {/* SYSTEM */}

                      if (isSystem) {

                        return (
                          <React.Fragment
                            key={
                              msg.id ||
                              `system-${index}`
                            }
                          >

                            {showDate &&
                              msg.created_at && (

                              <div className="flex items-center justify-center py-3">

                                <div className="flex items-center gap-3 w-full max-w-xl">

                                  <div className="h-px bg-slate-300 flex-1" />

                                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap bg-white/60 px-3 py-1 rounded-full">

                                    {formatMessageDate(
                                      msg.created_at
                                    )}

                                  </span>

                                  <div className="h-px bg-slate-300 flex-1" />

                                </div>

                              </div>

                            )}


                            <div className="flex justify-center py-2">

                              <span className="text-[10px] bg-white/70 text-slate-500 px-3 py-1 rounded-full shadow-sm">

                                {msg.text}

                              </span>

                            </div>

                          </React.Fragment>
                        );

                      }


                      return (

                        <React.Fragment
                          key={
                            msg.id ||
                            `message-${index}`
                          }
                        >


                          {/* DATE */}

                          {showDate &&
                            msg.created_at && (

                            <div className="flex items-center justify-center py-3">

                              <span className="text-[10px] bg-white/80 text-slate-500 px-3 py-1 rounded-full shadow-sm">

                                {formatMessageDate(
                                  msg.created_at
                                )}

                              </span>

                            </div>

                          )}


                          {/* ==================================================
                              INCOMING
                          ================================================== */}

                          {!isMe ? (

                            <div className="flex items-end gap-2 mb-3">

                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                  selectedChat.avatar_bg ||
                                  selectedChat.avatarBg ||
                                  "bg-emerald-100 text-emerald-600"
                                }`}
                              >

                                {selectedChat.initials ||
                                  selectedChat.name
                                    ?.slice(
                                      0,
                                      2
                                    )
                                    .toUpperCase() ||
                                  "U"}

                              </div>


                              <div className="flex flex-col items-start max-w-[78%] sm:max-w-md">


                                {/* GROUP SENDER */}

                                {selectedChat.type ===
                                  "group" && (

                                  <p className="text-[10px] font-semibold text-emerald-600 mb-1 ml-1">

                                    {msg.senderName ||
                                      selectedChat.name}

                                  </p>

                                )}


                                {/* BUBBLE */}

                                <div className="bg-white rounded-lg rounded-bl-none px-3 py-2 shadow-sm">

                                  {msg.text && (

                                    <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words">

                                      {msg.text}

                                    </p>

                                  )}


                                  {/* IMAGE */}

                                  {msg.type ===
                                    "image" &&
                                    msg.fileUrl && (

                                    <div
                                      className={
                                        msg.text
                                          ? "mt-2"
                                          : ""
                                      }
                                    >

                                      <div className="rounded-lg overflow-hidden bg-slate-50">

                                        <img
                                          src={
                                            msg.fileUrl
                                          }
                                          alt={
                                            msg.fileName ||
                                            "Attached image"
                                          }
                                          className="max-w-[280px] max-h-64 w-full object-cover"
                                        />

                                      </div>


                                      {msg.fileName && (

                                        <p className="text-[9px] text-slate-400 mt-1">

                                          {
                                            msg.fileName
                                          }

                                        </p>

                                      )}

                                    </div>

                                  )}


                                  {/* FILE */}

                                  {msg.type ===
                                    "file" && (

                                    <div
                                      className={
                                        msg.text
                                          ? "mt-2"
                                          : ""
                                      }
                                    >

                                      <div className="w-[220px] sm:w-[250px] bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-2">

                                        <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center shrink-0">

                                          <FileText className="w-5 h-5 text-blue-500" />

                                        </div>


                                        <div className="flex-1 min-w-0">

                                          <p className="text-[10px] font-semibold text-slate-700 truncate">

                                            {msg.fileName ||
                                              "Attached file"}

                                          </p>

                                          <p className="text-[9px] text-slate-400 mt-0.5">

                                            {msg.fileSize ||
                                              "File"}

                                            {" • "}

                                            {msg.fileName
                                              ?.split(
                                                "."
                                              )
                                              .pop()
                                              ?.toUpperCase() ||
                                              "FILE"}

                                          </p>

                                        </div>


                                        {msg.fileUrl && (

                                          <a
                                            href={
                                              msg.fileUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={
                                              msg.fileName
                                            }
                                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-200 text-slate-500 shrink-0"
                                          >

                                            <Download className="w-4 h-4" />

                                          </a>

                                        )}

                                      </div>

                                    </div>

                                  )}

                                </div>


                                <span className="text-[9px] text-slate-400 mt-1 ml-1">

                                  {msg.time}

                                </span>

                              </div>

                            </div>

                          ) : (


                            /* ==================================================
                               OUTGOING
                            ================================================== */

                            <div className="flex justify-end items-end mb-3">

                              <div className="flex flex-col items-end max-w-[78%] sm:max-w-md">

                                <div className="bg-[#d9fdd3] text-slate-800 rounded-lg rounded-br-none px-3 py-2 shadow-sm">

                                  {msg.text && (

                                    <p className="text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words">

                                      {msg.text}

                                    </p>

                                  )}


                                  {/* IMAGE */}

                                  {msg.type ===
                                    "image" &&
                                    msg.fileUrl && (

                                    <div
                                      className={
                                        msg.text
                                          ? "mt-2"
                                          : ""
                                      }
                                    >

                                      <div className="rounded-lg overflow-hidden">

                                        <img
                                          src={
                                            msg.fileUrl
                                          }
                                          alt={
                                            msg.fileName ||
                                            "Attached image"
                                          }
                                          className="max-w-[280px] max-h-64 w-full object-cover"
                                        />

                                      </div>


                                      {msg.fileName && (

                                        <p className="text-[9px] text-slate-500 mt-1">

                                          {
                                            msg.fileName
                                          }

                                        </p>

                                      )}

                                    </div>

                                  )}


                                  {/* FILE */}

                                  {msg.type ===
                                    "file" && (

                                    <div
                                      className={
                                        msg.text
                                          ? "mt-2"
                                          : ""
                                      }
                                    >

                                      <div className="w-[220px] sm:w-[250px] bg-emerald-600/80 border border-emerald-500/50 rounded-lg p-2 flex items-center gap-2">

                                        <div className="w-9 h-9 rounded-md bg-white/30 flex items-center justify-center shrink-0">

                                          <FileText className="w-5 h-5 text-white" />

                                        </div>


                                        <div className="flex-1 min-w-0">

                                          <p className="text-[10px] font-semibold text-white truncate">

                                            {msg.fileName ||
                                              "Attached file"}

                                          </p>

                                          <p className="text-[9px] text-emerald-50 mt-0.5">

                                            {msg.fileSize ||
                                              "File"}

                                            {" • "}

                                            {msg.fileName
                                              ?.split(
                                                "."
                                              )
                                              .pop()
                                              ?.toUpperCase() ||
                                              "FILE"}

                                          </p>

                                        </div>


                                        {msg.fileUrl && (

                                          <a
                                            href={
                                              msg.fileUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={
                                              msg.fileName
                                            }
                                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-emerald-500 text-white shrink-0"
                                          >

                                            <Download className="w-4 h-4" />

                                          </a>

                                        )}

                                      </div>

                                    </div>

                                  )}

                                </div>


                                <div className="flex items-center gap-1 mt-1 mr-1">

                                  <span className="text-[9px] text-slate-400">
                                    {msg.time}
                                  </span>

                                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />

                                </div>

                              </div>

                            </div>

                          )}

                        </React.Fragment>

                      );

                    }
                  )}


                  <div ref={messagesEndRef} />

                </div>

              ) : (

                <div className="flex items-center justify-center h-full text-xs text-slate-400">

                  No messages yet. Start the conversation.

                </div>

              )}

            </div>


            {/* ==================================================
                MESSAGE INPUT
            ================================================== */}

            <div className="p-3 sm:p-4 bg-[#f0f2f5] border-t border-slate-200 shrink-0">

              <form
                onSubmit={handleSendMessage}
                className="bg-white border border-slate-200 rounded-xl p-2 focus-within:border-emerald-500 shadow-sm"
              >

                <div className="flex items-center gap-2">

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) =>
                      setInputMessage(
                        e.target.value
                      )
                    }
                    disabled={sendingMessage}
                    className="flex-1 min-w-0 bg-transparent text-xs px-2 py-2 outline-none text-slate-700"
                  />


                  <button
                    type="submit"
                    disabled={
                      sendingMessage ||
                      !inputMessage.trim()
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  >

                    {sendingMessage ? (

                      <Loader2 className="w-3.5 h-3.5 animate-spin" />

                    ) : (

                      <Send className="w-3.5 h-3.5" />

                    )}

                  </button>

                </div>


                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">

                  <div className="flex items-center gap-3 text-slate-400">

                    <button
                      type="button"
                      className="hover:text-slate-600"
                    >
                      <Smile className="w-4 h-4" />
                    </button>


                    <button
                      type="button"
                      disabled={sendingMessage}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="hover:text-slate-600 disabled:opacity-50"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>


                    <button
                      type="button"
                      disabled={sendingMessage}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="hover:text-slate-600 disabled:opacity-50"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                  </div>


                  <span className="text-[9px] text-slate-400 hidden sm:block">
                    Press Enter to send
                  </span>

                </div>

              </form>

            </div>

          </>

        ) : (

          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">

            Select a conversation to start chatting

          </div>

        )}

      </section>

    </div>


    {/* ==================================================
        ADD MEMBER MODAL
    ================================================== */}

    {isAddMemberModalOpen &&
      selectedChat?.type === "group" && (

      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">

          <div className="flex items-center justify-between p-4 border-b border-slate-100">

            <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">

              <UserPlus className="w-4 h-4 text-emerald-600" />

              Add Member to "{selectedChat.name}"

            </h3>


            <button
              type="button"
              onClick={() => {
                setIsAddMemberModalOpen(
                  false
                );
                setNewMemberName("");
                setNewMemberPhone("");
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

          </div>


          <form
            onSubmit={
              handleAddMemberToExistingGroup
            }
            className="p-4 space-y-4"
          >

            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Member Name
              </label>

              <input
                type="text"
                required
                placeholder="Enter Name"
                value={newMemberName}
                onChange={(e) =>
                  setNewMemberName(
                    e.target.value
                  )
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />

            </div>


            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>

              <input
                type="text"
                required
                placeholder="+92 300 0000000"
                value={newMemberPhone}
                onChange={(e) =>
                  setNewMemberPhone(
                    e.target.value
                  )
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />

            </div>


            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">

              <button
                type="button"
                onClick={() => {
                  setIsAddMemberModalOpen(
                    false
                  );
                  setNewMemberName("");
                  setNewMemberPhone("");
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={sendingMessage}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium"
              >

                {sendingMessage
                  ? "Adding..."
                  : "Add Member"}

              </button>

            </div>

          </form>

        </div>

      </div>

    )}


    {/* ==================================================
        CREATE GROUP MODAL
    ================================================== */}

    {isGroupModalOpen && (

      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">


          {/* HEADER */}

          <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">

            <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">

              <Users className="w-4 h-4 text-emerald-600" />

              Create New Group

            </h3>


            <button
              type="button"
              onClick={() =>
                setIsGroupModalOpen(false)
              }
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

          </div>


          <form
            onSubmit={handleCreateGroup}
            className="p-4 space-y-4 overflow-y-auto flex-1"
          >


            {/* GROUP NAME */}

            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Group Name
              </label>

              <input
                type="text"
                required
                placeholder="Group Name..."
                value={groupName}
                onChange={(e) =>
                  setGroupName(
                    e.target.value
                  )
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              />

            </div>


            {/* CUSTOM MEMBER */}

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">

              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">

                <UserPlus className="w-3.5 h-3.5 text-blue-500" />

                Add Member by Phone

              </label>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                <input
                  type="text"
                  placeholder="Member Name"
                  value={customName}
                  onChange={(e) =>
                    setCustomName(
                      e.target.value
                    )
                  }
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
                />


                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customPhone}
                  onChange={(e) =>
                    setCustomPhone(
                      e.target.value
                    )
                  }
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-500"
                />

              </div>


              <button
                type="button"
                onClick={
                  handleAddCustomMember
                }
                className="w-full mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium py-1 rounded text-xs flex items-center justify-center gap-1"
              >

                <Plus className="w-3 h-3" />

                Add

              </button>

            </div>


            {/* CUSTOM MEMBERS */}

            {customMembersList.length >
              0 && (

              <div>

                <label className="block text-[11px] font-semibold text-slate-500 mb-1">

                  Added Members (
                  {
                    customMembersList.length
                  }
                  ):

                </label>


                <div className="flex flex-wrap gap-1.5">

                  {customMembersList.map(
                    (member) => (

                    <span
                      key={member.id}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                    >

                      {member.name} (
                      {member.phone}
                      )


                      <button
                        type="button"
                        onClick={() =>
                          removeCustomMember(
                            member.id
                          )
                        }
                        className="hover:text-red-500"
                      >

                        <X className="w-3 h-3" />

                      </button>

                    </span>

                  ))}

                </div>

              </div>

            )}


            {/* EXISTING CONTACTS */}

            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">

                Select Existing Contacts

              </label>


              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">

                {uniqueConversations.filter(
                  (contact) =>
                    contact.type ===
                    "direct"
                ).length === 0 ? (

                  <p className="p-3 text-xs text-slate-400 text-center">
                    No existing contacts found.
                  </p>

                ) : (

                  uniqueConversations
                    .filter(
                      (contact) =>
                        contact.type ===
                        "direct"
                    )
                    .map((contact) => {

                      const contactId =
                        contact.user_id ||
                        contact.other_user_id ||
                        contact.id;

                      const isChecked =
                        selectedMembers.some(
                          (member) =>
                            Number(
                              member.user_id ||
                              member.id
                            ) ===
                            Number(contactId)
                        );


                      return (

                        <label
                          key={`group-contact-${contactId}`}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
                        >

                          <div className="flex items-center gap-2">

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                contact.avatar_bg ||
                                contact.avatarBg ||
                                "bg-emerald-100 text-emerald-600"
                              }`}
                            >

                              {contact.initials ||
                                contact.name
                                  ?.slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase() ||
                                "U"}

                            </div>


                            <div>

                              <p className="text-xs text-slate-700 font-medium">

                                {
                                  contact.name
                                }

                              </p>


                              <p className="text-[9px] text-slate-400">

                                {contact.phone ||
                                  contact.email ||
                                  ""}

                              </p>

                            </div>

                          </div>


                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleMemberToggle(
                                contact
                              )
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />

                        </label>

                      );

                    })

                )}

              </div>

            </div>


            {/* FOOTER */}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  setIsGroupModalOpen(false)
                }
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={sendingMessage}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium"
              >

                {sendingMessage
                  ? "Creating..."
                  : "Create Group"}

              </button>

            </div>

          </form>

        </div>

      </div>

    )}


    {/* ==================================================
        GROUP MEMBERS MODAL
    ================================================== */}

    {isGroupInfoOpen &&
      selectedChat?.type ===
        "group" && (

      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">


          {/* HEADER */}

          <div className="flex items-center justify-between p-4 border-b border-slate-100">

            <div className="flex items-center gap-2">

              <Users className="w-4 h-4 text-emerald-600" />

              <h3 className="font-semibold text-sm text-slate-800">

                {selectedChat.name} Members

              </h3>

            </div>


            <button
              type="button"
              onClick={() =>
                setIsGroupInfoOpen(false)
              }
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

          </div>


          {/* MEMBERS */}

          <div className="p-4 max-h-80 overflow-y-auto space-y-2">

            <p className="text-xs text-slate-400 font-medium mb-2">

              Total Members:{" "}

              {selectedChat.members
                ?.length || 0}

            </p>


            {selectedChat.members?.length >
            0 ? (

              selectedChat.members.map(
                (member, index) => (

                  <div
                    key={`member-${
                      member.user_id ||
                      member.id ||
                      "unknown"
                    }-${index}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >

                    <div className="flex items-center gap-2 min-w-0">

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          member.avatarBg ||
                          member.avatar_bg ||
                          "bg-slate-200 text-slate-600"
                        }`}
                      >

                        {member.initials ||
                          member.name
                            ?.slice(
                              0,
                              2
                            )
                            .toUpperCase() ||
                          "U"}

                      </div>


                      <div className="min-w-0">

                        <p className="text-xs font-semibold text-slate-700 truncate">

                          {member.name ||
                            "Unknown"}

                        </p>


                        <p className="text-[10px] text-slate-400 flex items-center gap-1">

                          <Phone className="w-2.5 h-2.5" />

                          {member.phone ||
                            member.email ||
                            "No Phone"}

                        </p>

                      </div>

                    </div>


                    {member.role && (

                      <span className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">

                        {member.role}

                      </span>

                    )}

                  </div>

                )
              )

            ) : (

              <p className="text-xs text-slate-400 text-center py-4">

                No members in this group.

              </p>

            )}

          </div>


          {/* FOOTER */}

          <div className="p-3 border-t border-slate-100 flex justify-end">

            <button
              type="button"
              onClick={() =>
                setIsGroupInfoOpen(false)
              }
              className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    )}


    {/* ==================================================
        SIDEBAR
    ================================================== */}

    <Sidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      setShowLogoutModal={
        setShowLogoutModal
      }
    />


    {/* ==================================================
        LOGOUT MODAL
    ================================================== */}

    <LogoutModal
      show={showLogoutModal}
      loggingOut={loggingOut}
      onCancel={() =>
        setShowLogoutModal(false)
      }
      onConfirm={
        handleConfirmLogout
      }
    />

  </div>
);
}

