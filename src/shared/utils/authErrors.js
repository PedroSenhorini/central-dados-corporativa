const MENSAGENS = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/user already registered/i, 'Já existe uma conta com esse e-mail.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.'],
  [/password should be at least/i, 'A senha precisa ter pelo menos 6 caracteres.'],
  [/unable to validate email address/i, 'Digite um e-mail válido.'],
  [/rate limit/i, 'Muitas tentativas seguidas. Aguarde um instante e tente de novo.'],
];

export function traduzirErroAuth(error) {
  if (!error) return '';
  const mensagem = error.message ?? String(error);
  const encontrada = MENSAGENS.find(([padrao]) => padrao.test(mensagem));
  return encontrada ? encontrada[1] : 'Não foi possível concluir a ação. Tente novamente em instantes.';
}
