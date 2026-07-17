export const normaliseCredentialEmail = (email: string): string => email.trim().toLowerCase();

export const createSellerSlugBase = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'seller';
};
