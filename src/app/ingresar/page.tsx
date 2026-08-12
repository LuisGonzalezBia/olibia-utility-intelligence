import Link from 'next/link';
import { LoginForm } from '@/modules/registro/components/LoginForm';

const IngresarPage = () => (
  <main className="flex min-h-dvh items-center justify-center px-4 py-10">
    <div className="bg-bg-white-0 ring-stroke-soft-200 w-full max-w-md rounded-2xl p-6 shadow-sm ring-1 sm:p-8">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <h1 className="text-title-h5 text-text-strong-950">Ingresá</h1>
        <p className="text-paragraph-sm text-text-sub-600">
          Entrá a la competitividad tarifaria de tu mercado.
        </p>
      </div>
      <LoginForm />
      <p className="text-paragraph-sm text-text-sub-600 mt-6 text-center">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="text-text-strong-950 underline">
          Registrate
        </Link>
      </p>
    </div>
  </main>
);

export default IngresarPage;
