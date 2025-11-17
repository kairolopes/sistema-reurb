export default function Dashboard() {
    return (
        <div className="ml-[260px] p-10">
            
            <h1 className="text-3xl font-bold mb-6">Dashboard Geral</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white shadow rounded-xl p-6">
                    <p className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                        🏛️ Prefeituras Cadastradas
                    </p>
                    <p className="text-4xl font-bold mt-3">12</p>
                </div>

                <div className="bg-white shadow rounded-xl p-6">
                    <p className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                        ➕ Novos Cadastros
                    </p>
                    <p className="text-4xl font-bold mt-3">48</p>
                </div>

                <div className="bg-white shadow rounded-xl p-6">
                    <p className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                        🎫 Tickets Pendentes
                    </p>
                    <p className="text-4xl font-bold mt-3">5</p>
                </div>

            </div>
        </div>
    );
}
