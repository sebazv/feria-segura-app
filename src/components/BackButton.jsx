import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, className = '' }) {
    const navigate = useNavigate();
    
    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button 
            onClick={handleClick}
            className={`flex items-center gap-2 text-gray-700 hover:text-gray-900 ${className}`}
        >
            <ArrowLeft size={24} />
        </button>
    );
}
