'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, FancyButton, Input } from '@biaenergy/ui';
import { RiErrorWarningFill } from '@biaenergy/ui/icons';
import { FormField } from '@/components/FormField';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sinVerificar, setSinVerificar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSinVerificar(false);

    if (!EMAIL_RE.test(email.trim()) || password === '') {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      if (response.status === 403) {
        // Las credenciales son correctas: lo que falta es el clic en el correo.
        setSinVerificar(true);
        return;
      }
      if (!response.ok) {
        // Mismo mensaje para "no existe" y "contraseña incorrecta": distinguirlos
        // convertiría esta pantalla en un buscador de quién está registrado.
        setError('Correo o contraseña incorrectos.');
        return;
      }
      // `refresh` además de `push`: la sesión vive en una cookie httpOnly, así
      // que los Server Components tienen que volver a renderizar para verla —
      // solo con `push` se podría servir el árbol cacheado de "sin sesión".
      router.push('/mercado');
      router.refresh();
    } catch {
      setError('No pudimos conectarnos. Prueba de nuevo en un momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error !== null && (
        <Alert.Root status="error" size="small">
          <Alert.Icon as={RiErrorWarningFill} />
          <span>{error}</span>
        </Alert.Root>
      )}
      {sinVerificar && (
        <Alert.Root status="warning" size="small">
          <Alert.Icon as={RiErrorWarningFill} />
          <span>
            Todavía no activaste tu cuenta. Busca el correo de confirmación que te enviamos.
          </span>
        </Alert.Root>
      )}

      <FormField id="email" label="Correo" required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <FormField id="password" label="Contraseña" required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <FancyButton.Root type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Ingresando…' : 'Ingresar'}
      </FancyButton.Root>
    </form>
  );
};
