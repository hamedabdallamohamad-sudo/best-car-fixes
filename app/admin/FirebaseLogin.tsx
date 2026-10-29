'use client';
import {useEffect,useState} from 'react';
import {onAuthStateChanged,signInWithEmailAndPassword,signOut,type User} from 'firebase/auth';
import {firebaseAuth} from '../firebase-client';
import {ADMIN_UID} from '../firebase-config';
import Dashboard from './Dashboard';
export default function FirebaseLogin(){
  const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>onAuthStateChanged(firebaseAuth(),u=>{setUser(u);setLoading(false)}),[]);
  if(loading)return <main className="auth-page"><div className="loader"/><p>جارٍ التحقق من جلسة الدخول…</p></main>;
  if(user?.uid===ADMIN_UID)return <Dashboard/>;
  async function login(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError('');
    const data=new FormData(e.currentTarget);
    try{await signInWithEmailAndPassword(firebaseAuth(),String(data.get('email')),String(data.get('password')))}
    catch(e){
      const code=(e as {code?:string}).code;
      setError(code==='auth/network-request-failed'?'تعذر الاتصال بـ Firebase؛ تحقق من الإنترنت.':code==='auth/too-many-requests'?'محاولات كثيرة؛ حاول لاحقًا.':'تعذر الدخول. تحقق من البريد وكلمة المرور وتفعيل Email/Password.');
    }finally{setBusy(false)}
  }
  return <main className="auth-page">
    <div className="auth-logo">B↗</div><p>BESTCAR FIXES / FIREBASE</p>
    <h1>لوحة تحكم صاحب الموقع</h1><p>ادخل بالبريد وكلمة المرور اللذين أنشأتهما في Firebase.</p>
    {user?<><p className="error">هذا الحساب لا يملك صلاحية الإدارة.</p><button className="btn" onClick={()=>signOut(firebaseAuth())}>الخروج واستخدام حساب آخر</button></>:
      <form className="login-form" onSubmit={login}>
        <label>البريد الإلكتروني<input name="email" type="email" dir="ltr" autoComplete="username" required/></label>
        <label>كلمة المرور<input name="password" type="password" dir="ltr" autoComplete="current-password" required/></label>
        {error&&<p className="error" role="alert">{error}</p>}
        <button className="btn orange" disabled={busy}>{busy?'جارٍ الدخول…':'دخول لوحة التحكم ←'}</button>
      </form>
    }
    <a className="btn" href="/">العودة للموقع</a>
  </main>;
}
