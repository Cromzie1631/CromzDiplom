import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* Hero — Apple style */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-36 text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-neutral-900 tracking-tight leading-[1.05] mb-6">
            PA9
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-neutral-600 mb-4">
            Система моделирования технических систем
          </p>
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-12">
            Программный комплекс для моделирования динамики технических систем различной физической природы.
          </p>
          <Link
            href="/pa9"
            className="apple-btn px-8 py-4 text-base"
          >
            Запустить PA9 Online
          </Link>
        </div>
      </section>

      {/* Что такое PA9 */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Что такое PA9</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden apple-card">
              <Image
                src="/pa9-about.jpg"
                alt="Интерфейс PA9"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg text-neutral-600 leading-relaxed">
                PA9 — схемный графический редактор для построения и расчёта динамических моделей технических систем. Схема строится из элементов, соединённых связями; каждому элементу соответствует математическая модель.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Система позволяет задавать параметры, выбирать метод численного интегрирования, выполнять расчёт и анализировать результаты на графиках.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Кто создал и когда */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Кто создал и когда</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-lg text-neutral-600 leading-relaxed">
                PA9 разработан на кафедре теории механизмов и машин. Разработка ведётся с конца 1990-х годов на Java, что обеспечивает кроссплатформенность.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Система используется в учебном процессе и научных исследованиях: курсовые и дипломные проекты, магистерские и кандидатские диссертации.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden apple-card">
              <Image
                src="/pa9-schema.gif"
                alt="Пример схемы в PA9"
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Модули */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Модули</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: 'Electro', desc: 'Электротехника' },
              { name: 'Hydro', desc: 'Гидравлика' },
              { name: 'Mechan', desc: 'Механика' },
              { name: 'Thermo', desc: 'Термодинамика' },
              { name: 'ElMash', desc: 'Электроприводы' },
              { name: 'Opti', desc: 'Оптимизация' },
            ].map((m) => (
              <div key={m.name} className="apple-card px-8 py-6">
                <span className="text-lg font-semibold text-neutral-900">{m.name}</span>
                <span className="text-neutral-500 ml-2">— {m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Зачем используется */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Зачем используется</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Моделирование', desc: 'Динамика механических, электрических, гидравлических, тепловых систем' },
              { title: 'Расчёт', desc: 'Численное интегрирование, переходные процессы, статические и динамические режимы' },
              { title: 'Оптимизация', desc: 'Подбор параметров, синтез законов управления, минимизация потерь' },
            ].map((item) => (
              <div key={item.title} className="apple-card p-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Где применяется */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Где применяется</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Образование</h3>
              <p className="text-neutral-600 leading-relaxed">
                Курсовое и дипломное проектирование, лабораторные работы по теории механизмов и машин, электроприводу, гидравлике.
              </p>
            </div>
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Исследования</h3>
              <p className="text-neutral-600 leading-relaxed">
                Магистерские и кандидатские диссертации. Публикации в журналах ВАК, доклады на конференциях.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-40 text-center">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-6">
            Готовы попробовать?
          </h2>
          <p className="text-xl text-neutral-600 mb-12">
            Запустите PA9 в браузере без установки Java.
          </p>
          <Link href="/pa9" className="apple-btn px-10 py-4 text-base">
            Запустить PA9 Online
          </Link>
        </div>
      </section>
    </div>
  )
}
