export const layout = "layouts/GlobalLayout.tsx";

export default function BlogLayout({ children, comp, date, title }: Lume.Data) {
  return (
    <main>
      <comp.Container>
        <article class="py-8">
          <header class="pb-4 border-b border-gray-300">
            <h1 class="text-3xl font-extrabold leading-[1.25]">{title}</h1>
            <p class="mt-2 text-gray-600">
              <comp.Time datetime={date} />
            </p>
          </header>
          <section class="post-content">
            {children}
          </section>
        </article>
      </comp.Container>
    </main>
  );
}
