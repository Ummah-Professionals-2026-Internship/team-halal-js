import {apiFetch} from './client';

export async function getSessions(){
    const res = await apiFetch('/api/sessions');
    const data = await res.json();
    if(!res.ok){
        throw new Error(data.error || 'Failed to load sessions');
    }
    return data;
}

export async function getMenteeSessions(){
    const res = await apiFetch('/api/sessions/mentee');
    const data = await res.json();
    if(!res.ok){
        throw new Error(data.error || 'Failed to load sessions');
    }
    return data;
}

export async function createSession(sessionData){
    const res = await apiFetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
    });
    const data = await res.json();
    if(!res.ok){
        throw new Error(data.error || 'Failed to schedule session');
    }
    return data;
}