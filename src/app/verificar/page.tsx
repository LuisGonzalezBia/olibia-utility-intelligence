import { VerificarCuenta } from "@/modules/registro/components/VerificarCuenta";

// El token llega por query string desde el enlace del correo.
const VerificarPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="bg-bg-white-0 ring-stroke-soft-200 w-full max-w-md rounded-2xl p-8 text-center shadow-sm ring-1">
        <VerificarCuenta token={token ?? ""} />
      </div>
    </main>
  );
};

export default VerificarPage;
