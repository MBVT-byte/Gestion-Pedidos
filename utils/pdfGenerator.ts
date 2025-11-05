
import { Order, Client } from '../types';

export const generateOrderPDF = (order: Order, client: Client, action: 'print' | 'view' = 'print') => {
    if (!client) {
        console.error("Client data is missing for PDF generation.");
        alert("No se pueden generar los datos del PDF sin la información del cliente.");
        return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const materialsOrder = ['Oro', 'Rodio', 'Acero', 'Anillo', 'Desconocido'];
    const materialsInOrder = materialsOrder.filter(material => 
        order.items.some(item => item.material === material)
    );
    
    const totalItems = order.items.length;

    const materialBlocks = materialsInOrder.map(material => {
        const itemsOfMaterial = order.items.filter(item => item.material === material);
        const categories = [...new Set(itemsOfMaterial.map(item => item.category))].sort();

        const categoryBlocks = categories.map(category => {
            const items = itemsOfMaterial
                .filter(item => item.category === category)
                .sort((a, b) => a.code.localeCompare(b.code));

            if (items.length === 0) return '';

            const itemsGrid = `
                <div class="grid grid-cols-6 gap-2 mb-2">
                    ${items.map(item => {
                        let materialText = '';
                        if (['Oro', 'Rodio', 'Acero'].includes(item.material)) {
                            materialText = `<p class="text-[8px] font-semibold text-gray-500 leading-tight">${item.material.toUpperCase()}</p>`;
                        }
            
                        return `
                            <div class="border border-gray-400 p-1 rounded text-center break-inside-avoid flex flex-col justify-between" style="min-height: 48px;">
                                <div>
                                    <p class="font-mono font-bold text-xs">${item.code}</p>
                                    ${materialText}
                                </div>
                                <p class="text-xs mt-auto">${item.price !== null ? `€${item.price.toFixed(2)}` : 'N/A'}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            return `
                <div class="mb-4 break-inside-avoid">
                    <div class="flex justify-between items-baseline bg-gray-800 p-2 rounded-t">
                        <h3 class="text-md font-bold text-white">${category}</h3>
                        <p class="text-xs font-semibold text-gray-300">Total Piezas: ${items.length}</p>
                    </div>
                    <div class="p-2 border border-t-0 border-gray-400 rounded-b">
                        ${itemsGrid}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-6 break-inside-avoid-page">
                <h2 class="text-2xl font-black mb-3 text-center uppercase tracking-widest p-2 bg-gray-300 rounded">${material}</h2>
                ${categoryBlocks}
            </div>
        `;
    }).join('');

    const content = `
        <html>
            <head>
                <title>Hoja de Pedido - ${client.name}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 10px; }
                        .no-print { display: none; }
                        .break-inside-avoid { page-break-inside: avoid; }
                        .break-inside-avoid-page { page-break-before: auto; page-break-after: auto; page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body class="font-sans p-4 bg-white text-gray-900">
                <div class="border-2 border-gray-800 p-4 rounded-lg">
                     <div class="flex justify-between items-start mb-4 border-b-2 border-gray-300 pb-2">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">Hoja de Pedido</h1>
                            <p class="text-sm font-semibold">${client.name} (${client.clientCode})</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-base">${order.worker.name}</p>
                            <p class="text-xs text-gray-500">${new Date(order.date).toLocaleString()}</p>
                        </div>
                    </div>

                    ${materialBlocks}
                    
                    <div class="mt-4 pt-4 border-t-2 border-gray-400">
                        <p class="text-right font-bold text-lg">Total Artículos del Pedido: ${totalItems}</p>
                    </div>

                    ${order.notes ? `
                    <div class="mt-6 break-inside-avoid">
                        <h3 class="text-lg font-bold mb-2 text-gray-800">Observaciones:</h3>
                        <p class="text-gray-700 whitespace-pre-wrap border p-2 rounded-lg bg-gray-50 text-sm">${order.notes}</p>
                    </div>
                    ` : ''}

                    <div class="mt-8 pt-6 border-t-2 border-gray-300 break-inside-avoid">
                         <div class="grid grid-cols-2 gap-6">
                            <div>
                                <h3 class="text-base font-semibold mb-2">Firma del Cliente:</h3>
                                ${order.signature ? `<div class="border p-2 h-20 flex items-center justify-center"><p class="text-xl font-serif">${order.signature}</p></div>` : '<div class="h-20 border-b-2 border-gray-500"></div>'}
                            </div>
                            <div>
                                <h3 class="text-base font-semibold mb-2">Vendedor:</h3>
                                <p class="text-base text-gray-800">${order.worker.name}</p>
                            </div>
                         </div>
                    </div>
                </div>
            </body>
        </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    if (action === 'print') {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
};
