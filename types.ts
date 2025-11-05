export interface User {
    id: string;
    email: string;
    name: string;
    role: 'superadmin' | 'trabajador' | 'cliente';
    avatar?: string;
}

export interface Deposit {
    photos: { url: string; date: string }[];
    status: 'active' | 'none';
}

export interface FollowUp {
    id: string;
    date: string;
    merchandiseStatePhoto: string;
    workFinalizationPhoto: string;
    notes: string;
    workerId: string;
    workerName: string;
    workerEmail: string;
}

export interface Client {
    id: string;
    clientCode: string;
    name: string;
    cif: string;
    address: string;
    phone: string;
    schedule: string;
    responsiblePerson: string;
    deposits: {
        ringPlates: Deposit;
        finishedChains: Deposit;
        chainsByMeter: Deposit;
        other: Deposit;
    };
    followUps: FollowUp[];
    avatar?: string;
    email?: string;
}

export interface OrderItem {
    id: string;
    code: string;
    reference: string;
    size: string;
    category: string;
    material: string;
    price: number | null;
    photoUrl?: string;
}

export interface ProcessedItem {
    code: string;
    price: number | null;
    tagColor?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  date: string;
  items: OrderItem[];
  notes: string;
  signature: string;
  worker: {
    id: string;
    name: string;
    email: string;
  };
}