import React, { useState, useRef } from 'react';
import { Client, FollowUp, User } from '../types';
import * as dataService from '../services/dataService';

interface FollowUpManagerProps {
    client: Client;
    onBack: () => void;
    user: User;
}

const FollowUpManager: React.FC<FollowUpManagerProps> = ({ client, onBack, user }) => {
    const [merchandisePhoto, setMerchandisePhoto] = useState<File | null>(null);
    const [finalizationPhoto, setFinalizationPhoto] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const merchandiseInputRef = useRef<HTMLInputElement>(null);
    const finalizationInputRef = useRef<HTMLInputElement>(null);
    
    const playNotificationSound = () => {
        const audio = new Audio("data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YQQAAAAP//8/AAAA//8=");
        audio.play().catch(e => console.error("Audio playback failed:", e));
    };

    const handleSave = () => {
        if (!merchandisePhoto || !finalizationPhoto) {
            alert("Ambas fotografías son obligatorias.");
            return;
        }
        setIsSaving(true);
        
        const newFollowUp: FollowUp = {
            id: `fu-${Date.now()}`,
            date: new Date().toISOString(),
            merchandiseStatePhoto: URL.createObjectURL(merchandisePhoto),
            workFinalizationPhoto: URL.createObjectURL(finalizationPhoto),
            notes,
            workerId: user.id,
            workerName: user.name,
            workerEmail: user.email
        };

        dataService.addFollowUp(client.id, newFollowUp);
        
        playNotificationSound();
        
        setTimeout(() => {
            setIsSaving(false);
            alert("Seguimiento guardado con éxito.");
            onBack();
        }, 1000);
    };

    const PhotoUpload: React.FC<{
        label: string,
        photo: File | null,
        setPhoto: (file: File | null) => void,
        inputRef: React.RefObject<HTMLInputElement>
    }> = ({ label, photo, setPhoto, inputRef }) => (
        <div className="text-center">
            <label className="block text-lg font-semibold text-[#bfa86b] mb-2">{label}</label>
            <div
                onClick={() => inputRef.current?.click()}
                className="w-full h-40 bg-[#2c3e50] border-2 border-dashed border-[#bfa86b] rounded-lg flex items-center justify-center cursor-pointer"
            >
                {photo ? (
                    <img src={URL.createObjectURL(photo)} alt={label} className="w-full h-full object-contain rounded-lg" />
                ) : (
                    <span className="text-gray-400">Tocar para añadir foto</span>
                )}
            </div>
            <input type="file" accept="image/*" capture="environment" ref={inputRef} onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="hidden" />
        </div>
    );

    return (
        <div className="bg-[#233140] p-6 rounded-xl shadow-2xl max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[#bfa86b]">Nuevo Seguimiento</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
            </div>
            
            <div>
                <p><span className="font-bold text-[#bfa86b]">Cliente:</span> <span className="text-white">{client.name}</span></p>
                <p><span className="font-bold text-[#bfa86b]">Fecha:</span> <span className="text-white">{new Date().toLocaleString()}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PhotoUpload label="Estado de Mercancía *" photo={merchandisePhoto} setPhoto={setMerchandisePhoto} inputRef={merchandiseInputRef} />
                <PhotoUpload label="Finalización de Trabajo *" photo={finalizationPhoto} setPhoto={setFinalizationPhoto} inputRef={finalizationInputRef} />
            </div>

            <div>
                <label htmlFor="notes" className="block text-lg font-semibold text-[#bfa86b] mb-2">Anotaciones</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-[#2c3e50] border border-[#bfa86b] rounded p-2 text-white"
                    placeholder="Observaciones para la próxima visita..."
                ></textarea>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving || !merchandisePhoto || !finalizationPhoto}
                className="w-full bg-[#bfa86b] hover:bg-[#a89158] text-[#2c3e50] font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
                {isSaving ? 'Guardando...' : 'Guardar Seguimiento'}
            </button>
        </div>
    );
};

export default FollowUpManager;