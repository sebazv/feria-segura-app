export default function StitchNews() {
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
        <div className="font-display bg-white dark:bg-[#221010] min-h-[calc(100vh-6rem)] p-6 pb-safe">
            <header className="pt-6 pb-6">
                <h1 className="text-slate-900 dark:text-slate-100 text-[32px] font-bold tracking-tight mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined !text-4xl text-[#16a34a]">article</span>
                    NOTICIAS
                </h1>
                <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            </header>

            <main className="flex flex-col gap-6">
                {newsItems.map((item) => (
                    <article
                        key={item.id}
                        className={`border rounded-xl p-6 bg-white dark:bg-[#1a0c0c] shadow-sm relative overflow-hidden ${item.urgent ? 'border-[#ec1313]' : 'border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        {item.urgent && (
                            <div className="absolute top-0 right-0 bg-[#ec1313] text-white px-3 py-1 text-sm font-bold rounded-bl-lg uppercase">
                                Urgente
                            </div>
                        )}
                        <h2 className="text-[22px] font-bold text-slate-900 dark:text-white uppercase leading-tight mb-2 pr-12">
                            {item.title}
                        </h2>
                        <div className="text-sm font-semibold text-[#16a34a] dark:text-[#13ec5b] mb-3">
                            {item.date}
                        </div>
                        <p className="text-[18px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                            {item.description}
                        </p>
                    </article>
                ))}
            </main>
        </div>
    );
}
