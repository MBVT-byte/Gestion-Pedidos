import { GoogleGenAI, Type } from "@google/genai";
import { OrderItem, ProcessedItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

function classifyItem(item: ProcessedItem): Omit<OrderItem, 'id' | 'photoUrl'> {
    const { code, price, tagColor } = item;
    let category = 'Desconocido';
    let reference = '';
    let size = '';
    let material = 'Desconocido';

    // 1. Determinar Material (Prioridad: Color de la etiqueta)
    if (tagColor) {
        const color = tagColor.toLowerCase();
        if (color.includes('verde') || color.includes('green')) material = 'Oro';
        else if (color.includes('rosa') || color.includes('pink')) material = 'Rodio';
        else if (color.includes('naranja') || color.includes('orange')) material = 'Acero';
    }

    // 2. Determinar Material como fallback (Prioridad: Regex sobre el código) si no se encontró por color
    if (material === 'Desconocido') {
        if (/^3\d{3}-\d$/.test(code) || /^[A-Z]\d{3}$/.test(code)) {
            material = 'Oro';
        } else if (/^2\d{3}-\d$/.test(code) || /^9\+\d{3}$/.test(code)) {
            material = 'Rodio';
        } else if (/^11\d{2}$/.test(code) || /^15\d{2}$/.test(code) || /^13\d{2}$/.test(code) || /^(19|18)\d{2}$/.test(code) || /^39\d{2}$/.test(code)) {
            material = 'Acero';
        }
    }

    // 3. Determinar Categoría basado en el código y el material final
    const parts = code.split('-');
    if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
        reference = parts[0];
        size = parts[1];
        category = material !== 'Desconocido' ? `Anillo de ${material}` : 'Anillo';
    } else {
        switch(material) {
            case 'Oro':
                if (/^3\d{3}-1$/.test(code)) category = 'Pulseras de Oro';
                else if (/^3\d{3}-2$/.test(code)) category = 'Colgantes de Oro';
                else if (/^3\d{3}-3$/.test(code)) category = 'Tobilleras de Oro';
                else if (/^[A-Z]\d{3}$/.test(code)) category = 'Cadenas por Metro de Oro';
                break;
            case 'Rodio':
                if (/^2\d{3}-1$/.test(code)) category = 'Pulseras de Rodio';
                else if (/^2\d{3}-2$/.test(code)) category = 'Colgantes de Rodio';
                else if (/^2\d{3}-3$/.test(code)) category = 'Tobilleras de Rodio';
                else if (/^9\+\d{3}$/.test(code)) category = 'Cadenas por Metro de Rodio';
                break;
            case 'Acero':
                if (/^11\d{2}$/.test(code)) category = 'Pulseras de Acero';
                else if (/^15\d{2}$/.test(code)) category = 'Colgantes de Acero';
                else if (/^13\d{2}$/.test(code)) category = 'Tobilleras de Acero';
                else if (/^(19|18)\d{2}$/.test(code)) category = 'Pieza Terminada de Acero Dorado';
                else if (/^39\d{2}$/.test(code)) category = 'Cadenas por Metro de Acero';
                break;
        }
    }

    return { code, reference, size, category, price, material };
}


export const processOrderImage = async (imageBase64: string, mimeType: string): Promise<OrderItem[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType,
                data: imageBase64,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
                parts: [
                    imagePart,
                    { text: 'Analiza esta imagen de etiquetas de precios de joyería. Para cada artículo, extrae el código de producto, el precio (número después de "€") y el color de la etiqueta (opciones: "verde", "rosa", "naranja", o null si no está claro). Proporciona el resultado como un objeto JSON con una clave "items" que es un array de objetos, cada uno con "code" (string), "price" (número o null), y "tagColor" (string o null).' }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    code: { type: Type.STRING },
                                    price: { type: Type.NUMBER },
                                    tagColor: { type: Type.STRING },
                                },
                                required: ['code']
                            },
                        },
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.items)) {
             // Filtrar cualquier item que no tenga código, ya que es inútil
            const validItems = result.items.filter((item: any) => item && item.code);
            return validItems.map((item: ProcessedItem) => ({
                ...classifyItem(item),
                id: `${item.code}-${Date.now()}-${Math.random()}`,
            }));
        }

        return [];

    } catch (error) {
        console.error("Error processing image with Gemini:", error);
        throw new Error("Failed to analyze image. Please ensure the image is clear and try again.");
    }
};