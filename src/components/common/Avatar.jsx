const Avatar = ({ src, name }) => {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return src ? (
        <img src={src} alt={name} className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-white" />
    ) : (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white">
            {initials}
        </div>
    );
};

export default Avatar;