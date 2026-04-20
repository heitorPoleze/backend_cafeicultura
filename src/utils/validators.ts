export function validarNome(nome: string): string {
        if(nome.length < 3 || nome.length > 255)
            throw new RangeError("Nome inválido. Deve ter entre 3 e 255 caracteres")
        return nome;
    }
