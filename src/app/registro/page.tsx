import { defaultLocale } from '@/i18n/config';
import { getRegistroDict } from '@/modules/registro/dictionaries';
import { RegistroForm } from '@/modules/registro/components/RegistroForm';

const RegistroPage = () => {
  const dict = getRegistroDict(defaultLocale);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="bg-bg-white-0 ring-stroke-soft-200 w-full max-w-lg rounded-2xl p-6 shadow-sm ring-1 sm:p-8">
        <div className="mb-6 flex flex-col gap-2 text-center">
          <h1 className="text-title-h5 text-text-strong-950">{dict.title}</h1>
          <p className="text-paragraph-sm text-text-sub-600">{dict.subtitle}</p>
        </div>
        <RegistroForm locale={defaultLocale} />
      </div>
    </main>
  );
};

export default RegistroPage;
