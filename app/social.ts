export const socialPlatforms=[
 {key:'youtube',label:'يوتيوب · YouTube',hosts:['youtube.com','youtu.be'],placeholder:'https://www.youtube.com/@yourchannel'},
 {key:'instagram',label:'إنستغرام · Instagram',hosts:['instagram.com'],placeholder:'https://www.instagram.com/youraccount'},
 {key:'facebook',label:'فيسبوك · Facebook',hosts:['facebook.com','fb.com','fb.me'],placeholder:'https://www.facebook.com/yourpage'},
 {key:'x',label:'إكس · X',hosts:['x.com','twitter.com'],placeholder:'https://x.com/youraccount'},
 {key:'tiktok',label:'تيك توك · TikTok',hosts:['tiktok.com'],placeholder:'https://www.tiktok.com/@youraccount'},
 {key:'snapchat',label:'سناب شات · Snapchat',hosts:['snapchat.com'],placeholder:'https://www.snapchat.com/add/youraccount'},
 {key:'linkedin',label:'لينكدإن · LinkedIn',hosts:['linkedin.com'],placeholder:'https://www.linkedin.com/company/yourcompany'},
 {key:'telegram',label:'تيليجرام · Telegram',hosts:['t.me','telegram.me'],placeholder:'https://t.me/yourchannel'},
] as const;
export type SocialKey=typeof socialPlatforms[number]['key'];
export type SocialLinks=Record<SocialKey,string>;
export const emptySocialLinks:SocialLinks={youtube:'',instagram:'',facebook:'',x:'',tiktok:'',snapchat:'',linkedin:'',telegram:''};
export function validSocialLink(key:SocialKey,value:string){if(!value.trim())return true;try{const u=new URL(value.trim());const platform=socialPlatforms.find(p=>p.key===key);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!!platform?.hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h))}catch{return false}}
