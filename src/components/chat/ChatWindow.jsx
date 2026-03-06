import { useState, useRef, useCallback } from 'react';
import { useChat } from '../../features/chat/hooks/useChat';
import { useUserPresence } from '../../features/chat/hooks/usePresence';
import { Send, Paperclip, X, File, Smile, Trash2, Check, CheckCheck, ChevronUp, Download, Info, MessageCircle } from 'lucide-react';

const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🙏','🔥','✅','😍','👏','🎉','💯','🤔','😊','🥳','💪'];
const AVATAR_COLORS = ['from-violet-500 to-purple-600','from-sky-500 to-cyan-400','from-emerald-500 to-teal-400','from-orange-500 to-amber-400','from-rose-500 to-pink-400','from-indigo-500 to-blue-400'];
const avatarColor = (name='') => { const n=[...(name||'?')].reduce((a,c)=>a+c.charCodeAt(0),0); return AVATAR_COLORS[n%AVATAR_COLORS.length]; };

const fmtTime = (d) => new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const fmtDate = (d) => { const date=new Date(d),today=new Date(),yest=new Date(); yest.setDate(yest.getDate()-1); if(date.toDateString()===today.toDateString())return'Today'; if(date.toDateString()===yest.toDateString())return'Yesterday'; return date.toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'}); };
const fmtLastSeen = (iso) => { if(!iso)return null; const d=(Date.now()-new Date(iso))/1000; if(d<60)return'Last seen just now'; if(d<3600)return`Last seen ${Math.floor(d/60)}m ago`; if(d<86400)return`Last seen ${Math.floor(d/3600)}h ago`; return`Last seen ${Math.floor(d/86400)}d ago`; };
const fmtSize = (b) => { if(!b)return''; if(b<1024)return b+' B'; if(b<1048576)return(b/1024).toFixed(1)+' KB'; return(b/1048576).toFixed(1)+' MB'; };

const groupByDate = (msgs) => {
    const out=[]; let cur=null;
    msgs.forEach(m=>{ const d=fmtDate(m.createdAt); if(d!==cur){cur=d;out.push({type:'divider',label:d,id:`div-${m._id}`});} out.push({type:'message',...m}); });
    return out;
};
const needsAvatar = (items,i) => {
    if(items[i].type!=='message')return false;
    const prev=i>0?items[i-1]:null;
    if(!prev||prev.type==='divider')return true;
    if(prev.senderRole!==items[i].senderRole)return true;
    return (new Date(items[i].createdAt)-new Date(prev.createdAt))>120000;
};

const Avatar = ({src,name,size='md',online}) => {
    const sz={xs:'w-6 h-6 text-[10px]',sm:'w-8 h-8 text-xs',md:'w-10 h-10 text-sm',lg:'w-12 h-12 text-base'};
    const dot={xs:'w-2 h-2 border',sm:'w-2.5 h-2.5 border-[1.5px]',md:'w-3 h-3 border-2',lg:'w-3.5 h-3.5 border-2'};
    const initials=(name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return (
        <div className="relative flex-shrink-0">
            {src ? <img src={src} alt={name} className={`${sz[size]} rounded-xl object-cover`}/> : <div className={`${sz[size]} rounded-xl bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center text-white font-bold shadow-md`}>{initials}</div>}
            {online!==undefined && <span className={`absolute -bottom-0.5 -right-0.5 ${dot[size]} rounded-full border-[#13151c] transition-all duration-500 ${online?'bg-emerald-400 shadow-emerald-400/60 shadow-sm':'bg-[#374151]'}`}/>}
        </div>
    );
};

const OnlineBadge = ({online,lastSeen}) => {
    if(online) return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"/></span>
            Active now
        </span>
    );
    const ls=fmtLastSeen(lastSeen);
    return <span className="text-[11px] text-[#4b5563]">{ls||'Offline'}</span>;
};

const EmojiPicker = ({onSelect}) => (
    <div className="absolute bottom-full right-0 mb-2 bg-[#1e2030] border border-[#2e3140] rounded-2xl shadow-2xl p-3 z-50 w-64" onClick={e=>e.stopPropagation()}>
        <div className="grid grid-cols-8 gap-0.5">
            {EMOJI_LIST.map(e=><button key={e} onClick={()=>onSelect(e)} className="text-xl hover:scale-125 active:scale-95 transition-transform duration-100 p-1.5 rounded-lg hover:bg-[#2a2d3a]">{e}</button>)}
        </div>
    </div>
);

const Reactions = ({reactions,onReact,isMine}) => {
    if(!reactions?.length)return null;
    const counts=reactions.reduce((a,r)=>({...a,[r.emoji]:(a[r.emoji]||0)+1}),{});
    return (
        <div className={`flex gap-1 mt-1.5 flex-wrap ${isMine?'justify-end':'justify-start'}`}>
            {Object.entries(counts).map(([e,c])=>(
                <button key={e} onClick={()=>onReact(e)} className="flex items-center gap-0.5 bg-[#23262f] border border-[#2e3140] rounded-full px-2 py-0.5 text-xs hover:bg-[#2e3140] hover:border-[#3b82f6]/50 active:scale-95 transition-all shadow-sm">
                    <span className="text-sm leading-none">{e}</span>
                    {c>1&&<span className="text-[#9ca3af] font-semibold ml-0.5 text-[11px]">{c}</span>}
                </button>
            ))}
        </div>
    );
};

const BubbleAttachment = ({attachment,isMine}) => {
    if(!attachment)return null;
    if(attachment.type==='image') return (
        <a href={attachment.url} target="_blank" rel="noreferrer" className="block group/img">
            <img src={attachment.url} alt={attachment.originalName||'Image'} className="rounded-xl max-w-full max-h-60 object-cover cursor-zoom-in group-hover/img:opacity-90 transition-opacity shadow-lg"/>
        </a>
    );
    return (
        <a href={attachment.url} target="_blank" rel="noreferrer" download={attachment.originalName} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 hover:opacity-90 transition-opacity max-w-xs group/file ${isMine?'bg-black/20':'bg-[#2a2d3a]'}`}>
            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${isMine?'bg-white/20':'bg-[#3b82f6]/15'}`}><File className={`w-5 h-5 ${isMine?'text-white':'text-[#3b82f6]'}`}/></div>
            <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${isMine?'text-white':'text-[#e5e7eb]'}`}>{attachment.originalName||'Attachment'}</p>
                {attachment.size>0&&<p className={`text-[11px] ${isMine?'text-white/60':'text-[#6b7280]'}`}>{fmtSize(attachment.size)}</p>}
            </div>
            <Download className={`w-4 h-4 flex-shrink-0 group-hover/file:translate-y-0.5 transition-transform ${isMine?'text-white/70':'text-[#6b7280]'}`}/>
        </a>
    );
};

const FileChip = ({file,onRemove}) => {
    const isImg=file.type.startsWith('image/');
    return (
        <div className="relative inline-flex items-center gap-2.5 bg-[#23262f] border border-[#2e3140] rounded-xl p-2.5 max-w-[220px]">
            {isImg?<img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>:<div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex-shrink-0 flex items-center justify-center"><File className="w-5 h-5 text-[#3b82f6]"/></div>}
            <div className="min-w-0"><p className="text-xs font-medium text-[#e5e7eb] truncate max-w-[110px]">{file.name}</p><p className="text-[11px] text-[#6b7280]">{fmtSize(file.size)}</p></div>
            <button onClick={onRemove} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#374151] hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-md"><X className="w-3 h-3"/></button>
        </div>
    );
};

const MessageBubble = ({message,isMine,onReact,onDelete,showAvatar}) => {
    const [hovered,setHovered]=useState(false);
    const [pickerOpen,setPickerOpen]=useState(false);
    const isDeleted=!!message.deletedAt;
    return (
        <div className={`flex items-end gap-2 group ${isMine?'flex-row-reverse':'flex-row'}`} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>{setHovered(false);setPickerOpen(false);}}>
            {!isMine&&<div className="flex-shrink-0 self-end mb-0.5">{showAvatar?<Avatar src={message.senderId?.avatar?.url} name={`${message.senderId?.firstName||''} ${message.senderId?.lastName||''}`.trim()} size="sm"/>:<div className="w-8 h-8"/>}</div>}
            <div className={`flex flex-col max-w-[72%] min-w-0 ${isMine?'items-end':'items-start'}`}>
                {!isMine&&showAvatar&&<p className="text-[11px] font-semibold text-[#6b7280] mb-1 px-1 tracking-wide">{`${message.senderId?.firstName||''} ${message.senderId?.lastName||''}`.trim()||'User'}</p>}
                <div className={`flex items-end gap-1.5 ${isMine?'flex-row-reverse':'flex-row'}`}>
                    {/* Hover actions */}
                    <div className={`flex items-center gap-0.5 transition-all duration-150 ${hovered&&!isDeleted?'opacity-100':'opacity-0 pointer-events-none'} ${isMine?'translate-x-0':'-translate-x-0'}`}>
                        <div className="relative">
                            <button onClick={()=>setPickerOpen(p=>!p)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#23262f] border border-[#2e3140] hover:bg-[#2e3140] text-[#6b7280] hover:text-[#e5e7eb] transition-all shadow-sm"><Smile className="w-3.5 h-3.5"/></button>
                            {pickerOpen&&<EmojiPicker onSelect={e=>{onReact(message._id,e);setPickerOpen(false);}}/>}
                        </div>
                        {isMine&&<button onClick={()=>onDelete(message._id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#23262f] border border-[#2e3140] hover:bg-red-500/10 hover:border-red-500/30 text-[#6b7280] hover:text-red-400 transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5"/></button>}
                    </div>
                    {/* Bubble */}
                    <div className={`relative rounded-2xl shadow-sm max-w-full ${isMine?'bg-[#3b82f6] text-white rounded-br-[5px] shadow-[#3b82f6]/20 shadow-md':'bg-[#23262f] text-[#e5e7eb] border border-[#2e3140] rounded-bl-[5px]'} ${message.attachment&&!message.body?'p-2':'px-4 py-2.5'} ${isDeleted?'opacity-40':''}`}>
                        {isDeleted?<p className="text-sm italic text-[#9ca3af] px-2 py-1">This message was deleted</p>:(
                            <>
                                {message.attachment&&<div className={message.body?'mb-2':''}><BubbleAttachment attachment={message.attachment} isMine={isMine}/></div>}
                                {message.body&&<p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>}
                            </>
                        )}
                        <div className={`flex items-center gap-1 mt-1.5 ${isMine?'justify-end':'justify-start'}`}>
                            <span className={`text-[10px] tabular-nums ${isMine?'text-blue-100/60':''}`}>{fmtTime(message.createdAt)}</span>
                            {isMine&&!isDeleted&&(message.isRead?<CheckCheck className="w-3.5 h-3.5 text-blue-200"/>:<Check className="w-3.5 h-3.5 text-blue-200/40"/>)}
                        </div>
                    </div>
                </div>
                {!isDeleted&&message.reactions?.length>0&&<div className="mt-1 px-1"><Reactions reactions={message.reactions} isMine={isMine} onReact={e=>onReact(message._id,e)}/></div>}
            </div>
        </div>
    );
};

const DateDivider = ({label}) => (
    <div className="flex items-center gap-4 my-5 px-2">
        <div className="flex-1 h-px bg-[#1e2030]"/>
        <span className="text-[11px] font-semibold text-[#374151] bg-[#1a1d24] px-3 py-1 rounded-full border border-[#1e2030] uppercase tracking-widest whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-[#1e2030]"/>
    </div>
);

const TypingIndicator = ({names}) => {
    if(!names?.length)return null;
    return (
        <div className="flex items-end gap-2.5 px-1">
            <div className="w-8 h-8 rounded-xl bg-[#23262f] flex-shrink-0"/>
            <div className="bg-[#23262f] border border-[#2e3140] rounded-2xl rounded-bl-[5px] px-4 py-3 shadow-sm">
                <div className="flex items-end gap-1">
                    {[0,0.18,0.36].map((d,i)=><span key={i} className="w-1.5 h-1.5 bg-[#6b7280] rounded-full animate-bounce" style={{animationDelay:`${d}s`,animationDuration:'1.1s'}}/>)}
                </div>
            </div>
            <span className="text-[11px] text-[#4b5563] self-center italic">{names[0]} is typing</span>
        </div>
    );
};

const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="text-center space-y-6 max-w-md px-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 leading-relaxed">
                    Choose a conversation from the sidebar to start messaging with your customers.
                </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Respond quickly to customer inquiries to improve satisfaction and build trust.
                </p>
            </div>
        </div>
    </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
const ChatWindow = ({conversationId,currentUserId,currentRole,recipientName,recipientAvatar,recipientUserId,subject}) => {
    const [input,setInput]=useState('');
    const [selectedFile,setFile]=useState(null);
    const [showEmoji,setShowEmoji]=useState(false);
    const fileInputRef=useRef(null);
    const textareaRef=useRef(null);

    // Real-time presence
    const {online,lastSeen}=useUserPresence(recipientUserId);

    const {messages,loading,sending,hasMore,typingUsers,bottomRef,containerRef,loadMore,sendMessage,reactToMessage,deleteMessage,handleTyping,stopTyping}=useChat({conversationId,currentUserId,currentRole});

    const handleFileSelect=(e)=>{
        const file=e.target.files?.[0];
        if(!file)return;
        if(file.size>20*1024*1024){import('react-hot-toast').then(({default:t})=>t.error('File must be under 20 MB'));return;}
        setFile(file); e.target.value='';
    };

    const handleSend=useCallback(async()=>{
        const text=input.trim();
        if(!text&&!selectedFile)return;
        const attachment=selectedFile?{file:selectedFile,type:selectedFile.type.startsWith('image/')?'image':'file',originalName:selectedFile.name,size:selectedFile.size,url:selectedFile.type.startsWith('image/')?URL.createObjectURL(selectedFile):null}:null;
        const ok=await sendMessage(text,attachment);
        if(ok){setInput('');setFile(null);stopTyping();}
    },[input,selectedFile,sendMessage,stopTyping]);

    const handleKeyDown=(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}};
    const handleInputChange=(e)=>{setInput(e.target.value);handleTyping();const el=e.target;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,128)+'px';};
    const addEmoji=(emoji)=>{setInput(p=>p+emoji);setShowEmoji(false);textareaRef.current?.focus();};

    if(!conversationId)return <EmptyState/>;
    const grouped=groupByDate(messages);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white border-l border-gray-200" onClick={()=>setShowEmoji(false)}>

            {/* Professional Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative">
                        <Avatar src={recipientAvatar} name={recipientName} size="md" online={online}/>
                        {online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-base truncate">{recipientName||'Customer'}</p>
                        <div className="mt-0.5">
                            <OnlineBadge online={online} lastSeen={lastSeen}/>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {subject && (
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            Re: {subject}
                        </div>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Info className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto py-4 bg-gray-50">
                {hasMore&&<div className="flex justify-center mb-4 px-4"><button onClick={loadMore} disabled={loading} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium shadow-sm"><ChevronUp className="w-4 h-4"/>{loading?'Loading…':'Load older messages'}</button></div>}

                {loading&&messages.length===0?(
                    <div className="flex justify-center items-center py-24"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
                ):messages.length===0?(
                    <div className="flex flex-col items-center justify-center py-24 text-center px-8 space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-gray-400"/>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">No messages yet</p>
                            <p className="text-sm text-gray-500">Start the conversation with a friendly greeting!</p>
                        </div>
                    </div>
                ):(
                    <div className="px-6 space-y-1">
                        {grouped.map((item,idx)=>item.type==='divider'?<DateDivider key={item.id} label={item.label}/>:(
                            <div key={item._id} className={needsAvatar(grouped,idx)?'mt-6':'mt-1'}>
                                <MessageBubble message={item} isMine={item.senderRole===currentRole||item.senderId?._id===currentUserId} onReact={reactToMessage} onDelete={deleteMessage} showAvatar={needsAvatar(grouped,idx)}/>
                            </div>
                        ))}
                    </div>
                )}

                {typingUsers?.length>0&&<div className="px-6 mt-4"><TypingIndicator names={typingUsers}/></div>}
                <div ref={bottomRef} className="h-4"/>
            </div>

            {/* Professional Input Area */}
            <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200">
                {selectedFile&&<div className="mb-3"><FileChip file={selectedFile} onRemove={()=>setFile(null)}/></div>}
                <div className="flex items-end gap-3 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <button onClick={()=>fileInputRef.current?.click()} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors" title="Attach file">
                        <Paperclip className="w-4 h-4"/>
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"/>
                    <div className="relative flex-shrink-0" onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>setShowEmoji(p=>!p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors" title="Emoji">
                            <Smile className="w-4 h-4"/>
                        </button>
                        {showEmoji&&<EmojiPicker onSelect={addEmoji}/>}
                    </div>
                    <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Type your message..." rows={1} className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none leading-relaxed py-1" style={{minHeight:'24px',maxHeight:'120px'}}/>
                    <button onClick={handleSend} disabled={(!input.trim()&&!selectedFile)||sending} className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {sending?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Send className="w-4 h-4"/>}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 px-1">Press Enter to send • Shift+Enter for new line • Files up to 20MB</p>
            </div>
        </div>
    );
};

export default ChatWindow;