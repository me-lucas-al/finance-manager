import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authorizeCredentials } from '@/modules/auth/application/authorize-credentials';
import { DrizzleUserRepository } from '@/modules/users/infrastructure/repositories';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      // Empty label/type: this form is never rendered — the app uses its own
      // login page, so these just satisfy the provider's required shape.
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        return authorizeCredentials(new DrizzleUserRepository(), parsed.data.email, parsed.data.password);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === 'string') session.user.id = token.id;
      return session;
    },
  },
});
