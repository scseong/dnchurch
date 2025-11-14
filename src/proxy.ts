import { type NextRequest } from 'next/server';
import { updateSession } from '@/shared/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/login', '/news/bulletin/create', '/news/bulletin/:id*/update']
};
