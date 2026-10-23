import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { ProfileLink } from '@/components/header/ProfileLink';

const render = (name: string) =>
  renderToStaticMarkup(createElement(ProfileLink, { user: { name, email: 'a@b.com', image: null } }));

describe('ProfileLink', () => {
  it('goes straight to the profile page', () => {
    const html = render('Lucas Almeida');

    expect(html).toContain('href="/profile"');
    expect(html).toContain('aria-label="Abrir meu perfil"');
  });

  it('shows the user name and initials next to the arrow', () => {
    const html = render('Lucas Almeida');

    expect(html).toContain('Lucas Almeida');
    expect(html).toContain('LA');
  });
});
