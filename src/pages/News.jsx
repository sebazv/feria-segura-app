import { Bell } from 'lucide-react';

export default function News() {
    const newsItems = [
        {
            id: 1,
            title: 'OPERATIVO EN FERIA MALLOCO',
            date: 'HOY 10:00 AM',
            description: 'Presencia policial aumentada. Se solicita mantener los pasillos despejados para eventuales emergencias.',
            urgent: true,
        },
        {
            id: 2,
            title: 'ASAMBLEA EXTRAORDINARIA',
            date: 'JUEVES 15 - 18:00 PM',
            description: 'Votación obligatoria para nuevos convenios del sindicato de Los Guindos. Asistencia requerida.',
            urgent: false,
        },
        {
            id: 3,
            title: 'NUEVO PUNTO DE HIDRATACIÓN',
            date: 'AYER',
            description: 'Debido a la ola de calor, se instaló un punto de hidratación cerca del puesto municipal. Cuidemos nuestra salud.',
            urgent: false,
        },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-6rem)] relative w-full max-w-lg mx-auto p-4 pb-8 sm:p-6 bg-white dark:bg-black">

            {/* Search & Header */}
            <header className="flex flex-col w-full mt-4 mb-6">
                <h1 className="text-4xl sm:text-5xl font-black text-left mb-2 tracking-tight dark:text-white uppercase flex items-center gap-4">
                    <Bell size={40} className="text-[#13ec5b]" />
                    Noticias
                </h1>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
            </header>

            {/* News List */}
            <div className="flex flex-col gap-6 w-full">
                {newsItems.map((item) => (
                    <article
                        key={item.id}
                        className={`border-[3px] rounded-3xl p-6 sm:p-8 bg-white dark:bg-gray-900 shadow-sm ${item.urgent ? 'border-[#ec1313]' : 'border-gray-300 dark:border-gray-700'
                            }`}
                    >
                        {item.urgent && (
                            <span className="inline-block px-3 py-1 mb-4 bg-[#ec1313] text-white font-bold rounded text-lg uppercase">
                                Urgente
                            </span>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase leading-snug mb-3">
                            {item.title}
                        </h2>
                        <div className="text-xl font-bold text-[#1d4ed8] dark:text-[#60a5fa] mb-4">
                            {item.date}
                        </div>
                        <p className="text-xl text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                            {item.description}
                        </p>
                    </article>
                ))}
            </div>

        </div>
    );
}
