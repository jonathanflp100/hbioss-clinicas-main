-- Limpar dados de teste, mantendo apenas os usuários específicos

-- Se existirem outras tabelas de dados de sistema, vamos remover todos os dados exceto dos usuários específicos
-- Mantém apenas os usuários: Maryanne (maaryfarmaceutica@gmail.com) e Thr3ap (thr3ap@gmail.com)

-- Verificar e manter apenas os profiles dos usuários especificados
DELETE FROM public.profiles 
WHERE email NOT IN ('maaryfarmaceutica@gmail.com', 'thr3ap@gmail.com');

-- Verificar e manter apenas os user_roles dos usuários especificados  
DELETE FROM public.user_roles 
WHERE user_id NOT IN (
  SELECT user_id FROM public.profiles 
  WHERE email IN ('maaryfarmaceutica@gmail.com', 'thr3ap@gmail.com')
);

-- Comentário: Sistema limpo e pronto para uso real com apenas 2 usuários de referência