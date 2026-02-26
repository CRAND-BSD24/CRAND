import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'hrd' | 'educator' | 'manager' | 'adminhrd' | 'kepengasuhan' | 'staff' | 'parenting';
    profile_picture?: string;
  }

  interface Session {
    user: User & { image?: string };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'teacher' | 'student' | 'hrd' | 'educator' | 'manager' | 'adminhrd' | 'kepengasuhan' | 'staff' | 'parenting';
    profile_picture?: string;
  }
}
