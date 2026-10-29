'use client';
import {initializeApp,getApps} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {firebaseConfig} from './firebase-config';
export function firebaseAuth(){return getAuth(getApps()[0]||initializeApp(firebaseConfig))}
export async function authHeaders():Promise<Record<string,string>>{const token=await firebaseAuth().currentUser?.getIdToken();return token?{Authorization:'Bearer '+token}:{}}
