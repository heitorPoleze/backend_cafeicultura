class Formatador {
  private static readonly formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  static dataFormatada(data: Date, incluirHora: boolean = false): string {
    if (incluirHora) {
      return data
        .toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
        .replace(", ", " ");
    }
    return data.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  }

  static valorFormatado(valor: number): string {
    return this.formatadorMoeda.format(valor);
  }

  /**
   * Formata um número para o padrão decimal brasileiro, com vírgula.
   * Lida com valores nulos, indefinidos ou não numéricos.
   * @param valor O valor a ser formatado (pode ser string, número ou nulo).
   * @returns A string formatada, ex: "1.234,567".
   */
  public static decimal(valor: any): string {
    if (valor === null || valor === undefined) {
      return '0,00';
    }

    const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : Number(valor);

    if (isNaN(numero)) {
      return '--'; // Retorna em caso de valor inválido
    }

    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  }

  /**
   * @param str A string a ser capitalizada.
   * @returns A string capitalizada.
   */
  public static capitalizar(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static limparValoresOpcionaisVazios(
    dados: Record<string, any>,
    camposOpcionais: string[]
  ): Record<string, any> {
    const dadosLimpos = JSON.parse(JSON.stringify(dados));

    for (const chave of Object.keys(dadosLimpos)) {
      if (
        camposOpcionais.includes(chave) &&
        (dadosLimpos[chave] === "" || dadosLimpos[chave] === null)
      ) {
        delete dadosLimpos[chave];
      }
    }

    if (dadosLimpos.endereco && typeof dadosLimpos.endereco === "object") {
      for (const chaveEndereco of Object.keys(dadosLimpos.endereco)) {
        const nomeCompletoCampo = `endereco.${chaveEndereco}`;

        if (
          camposOpcionais.includes(nomeCompletoCampo) &&
          (dadosLimpos.endereco[chaveEndereco] === "" ||
            dadosLimpos.endereco[chaveEndereco] === null)
        ) {
          delete dadosLimpos.endereco[chaveEndereco];
        }
      }

      if (Object.keys(dadosLimpos.endereco).length === 0) {
        delete dadosLimpos.endereco;
      }
    }

    return dadosLimpos;
  }
}
export default Formatador;