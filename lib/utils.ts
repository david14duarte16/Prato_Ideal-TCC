/**
 * Remove acentos e converte para minúsculas para buscas insensíveis.
 */
export const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
