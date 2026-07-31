export class PaginacaoDTO {
  pagina: number = 1;
  limite: number = 10;
}

export interface ResultadoPaginacao<T> {
  data: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// helper reutilizável
export function paginar(pagina: number, limite: number) {
  return { skip: (pagina - 1) * limite, take: limite };
}