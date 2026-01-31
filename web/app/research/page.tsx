import Image from 'next/image'
import Link from 'next/link'

export default function ResearchPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32 text-center bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight mb-6">
            Исследования
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Научная работа магистрантов и аспирантов под руководством профессора Маничева. Решение прикладных задач с использованием PA9.
          </p>
        </div>
      </section>

      {/* О кафедре */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">О кафедре</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden apple-card">
              <Image
                src="/research-lab.jpg"
                alt="Лаборатория кафедры"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg text-neutral-600 leading-relaxed">
                Кафедра теории механизмов и машин ведёт научную и учебную работу в области математического моделирования динамики технических систем. PA9 используется в курсовом и дипломном проектировании, в магистерских и кандидатских диссертациях.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Под руководством профессора Маничева магистранты решают задачи моделирования электромеханических приводов, гидравлических систем, механизмов с переменной структурой.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Направления */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Направления исследований</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Математическое моделирование</h3>
              <p className="text-neutral-600 leading-relaxed">
                Построение и анализ моделей технических систем. Численное интегрирование. Верификация на экспериментальных данных. Модули Electro, Hydro, Mechan, Thermo, ElMash.
              </p>
            </div>
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Оптимизация и синтез</h3>
              <p className="text-neutral-600 leading-relaxed">
                Оптимизация параметров приводов и механизмов. Синтез законов управления. Минимизация энергопотребления и массогабаритных показателей. Модуль Opti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Примеры задач */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="section-title mb-16 text-center">Примеры задач</h2>
          <div className="space-y-8">
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Электромеханические приводы</h3>
              <p className="text-neutral-600 leading-relaxed">
                Динамика приводов с асинхронными и синхронными двигателями. Переходные процессы, нагрузки на механическую часть. Модули Electro, ElMash, Mechan.
              </p>
            </div>
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Гидравлические системы</h3>
              <p className="text-neutral-600 leading-relaxed">
                Гидроприводы, насосные станции, системы охлаждения. Пульсации давления, кавитация, потери в трубопроводах. Модуль Hydro.
              </p>
            </div>
            <div className="apple-card p-10">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Термодинамические процессы</h3>
              <p className="text-neutral-600 leading-relaxed">
                Тепловые режимы машин и агрегатов. Термодинамические циклы. Оценка потерь и КПД. Модуль Thermo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-40 text-center bg-neutral-50">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <Link href="/pa9" className="apple-btn px-10 py-4 text-base">
            Запустить PA9 Online
          </Link>
        </div>
      </section>
    </div>
  )
}
