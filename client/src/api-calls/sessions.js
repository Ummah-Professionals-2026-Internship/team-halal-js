import {apiFetch} from './client';

export async function getSessions(){
    const res = await apiFetch('/api/sessions');
    const data = await res.json();
    if(!res.ok){
        throw new Error(data.error || 'Failed to load sessions');
    }
    return data;
}