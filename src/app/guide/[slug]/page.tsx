import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GuidePage } from "@/components/guide/GuidePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildGuideArticleJsonLd,
  LAB_GROWN_DIAMONDS_FAQ,
} from "@/lib/guide-schema";
import {
  buildHowToJsonLd,
  SILVER_CARE_HOWTO_STEPS,
} from "@/lib/howto-schema";
import { buildPageMetadata } from "@/lib/metadata";
import { getGuideArticle } from "@/lib/guides";
import { buildFaqPageJsonLd } from "@/lib/warranty-faq";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getGuideArticle(slug);
  if (!article) return {};

  return buildPageMetadata({
    title: `${article.title} — ФИДЕЛИС`,
    description: article.description,
    path: `/guide/${slug}`,
    ogType: "article",
  });
}

export default async function GuideArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const article = getGuideArticle(slug);
  if (!article) notFound();

  const jsonLd = [
    buildGuideArticleJsonLd(article),
    ...(slug === "lab-grown-diamonds"
      ? [buildFaqPageJsonLd(LAB_GROWN_DIAMONDS_FAQ)]
      : []),
    ...(slug === "silver-care"
      ? [
          buildHowToJsonLd({
            name: article.title,
            description: article.description,
            path: `/guide/${slug}`,
            steps: SILVER_CARE_HOWTO_STEPS,
          }),
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main>
        {slug === "lab-grown-diamonds" && <LabGrownGuide />}
        {slug === "silver-care" && <SilverCareGuide />}
        {slug === "diamond-gift" && <DiamondGiftGuide />}
      </main>
      <Footer />
    </>
  );
}

function LabGrownGuide() {
  return (
    <GuidePage
      eyebrow="Гид покупателя"
      title="Украшения из серебра 925: что важно знать"
      intro="В каталоге ФИДЕЛИС — только серебро 925. Есть модели со вставками и без: характеристики конкретной модели смотрите в карточке товара."
    >
      <p>
        Мы продаём украшения из серебра 925 и не предлагаем изделия из других
        драгоценных металлов. Ассортимент включает кольца, серьги, колье,
        браслеты и другие формы — чистые серебряные и со вставками.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Характеристики</h2>
      <p>
        В карточке товара указаны металл и параметры модели. Для изделий со
        вставкой могут быть указаны тип вставки и масса.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Аттестация и гарантия</h2>
      <p>
        Для ряда изделий доступна добровольная аттестация качества. На все
        украшения ФИДЕЛИС действует гарантия 2 года.
      </p>
    </GuidePage>
  );
}

function SilverCareGuide() {
  return (
    <GuidePage
      eyebrow="Гид покупателя"
      title="Как ухаживать за серебром 925"
      intro="Серебро 925 с родиевым покрытием не требует сложного ухода. Достаточно нескольких простых правил, чтобы украшение долго сохраняло блеск."
    >
      <h2 className="font-heading text-xl text-brand-olive-dark">Ежедневная носка</h2>
      <p>
        Снимайте украшения перед спортом, уборкой, бассейном и контактом с
        косметикой или духами. Удары и абразивы могут повредить металл и
        крепления.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Хранение</h2>
      <p>
        Храните изделия отдельно в мягком мешочке или коробке, чтобы они не
        царапали друг друга. Серебро лучше держать в сухом месте, вдали от
        влажной ванной.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Чистка</h2>
      <p>
        Для регулярного ухода достаточно мягкой ткани. При загрязнении
        используйте тёплую воду с мягким мылом и щётку с мягким ворсом. После
        чистки тщательно высушите украшение.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Когда обращаться в сервис</h2>
      <p>
        Если покрытие потускнело, крепление ослабло или нужна полировка —
        обратитесь в сервис ФИДЕЛИС. На изделия действует гарантия 2 года.
      </p>
    </GuidePage>
  );
}

function DiamondGiftGuide() {
  return (
    <GuidePage
      eyebrow="Гид покупателя"
      title="Как выбрать подарок из серебра 925"
      intro="Подарок из серебра не обязан быть крупным. Важнее стиль, повод и удобство носки — особенно если украшение выбирается заранее."
      primaryCta={{ label: "Смотреть каталог", href: "/shop" }}
    >
      <h2 className="font-heading text-xl text-brand-olive-dark">С чего начать</h2>
      <p>
        Определите формат подарка: кольцо, серьги, колье или браслет. Для
        первого подарка чаще выбирают пусеты или лаконичное кольцо — со
        вставкой или без.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Размер</h2>
      <p>
        Для колец и браслетов важен размер. Если сюрприз должен остаться
        тайной, ориентируйтесь на уже имеющееся кольцо или воспользуйтесь
        гидом по определению размера.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Бюджет</h2>
      <p>
        В серебре 925 можно подобрать выразительное украшение в разном
        бюджете. Посмотрите каталог — там собраны актуальные модели.
      </p>
      <h2 className="font-heading text-xl text-brand-olive-dark">Упаковка и сервис</h2>
      <p>
        При необходимости менеджер поможет подобрать комплект и организовать
        доставку СДЭК.
      </p>
    </GuidePage>
  );
}
